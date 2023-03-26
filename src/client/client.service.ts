import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Client, ClientDocument } from './schemas/client.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Otp, OtpDocument } from '../otp/schemas/otp.schema';
import { Token, TokenDocument } from '../token/schemas/token.schema';
import { JwtService } from '@nestjs/jwt';
import { FilesService } from '../../files/files.service';
import { ClientPhoneNumberDto } from './dto/phone-number.dto';
import * as otpGenerator from 'otp-generator';
import { AddMinutesToDate } from '../helper/addMinutes';
import { dates, decode, encode } from '../helper/crypto';
import { ValidateOtp } from '../specialist/dto/validate-otp.dto';
import * as bcrypt from 'bcrypt';
import { RefreshTokenDto } from '../specialist/dto/refresh-token.dto';

@Injectable()
export class ClientService {

  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>, 
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private readonly jwtService: JwtService, 
    private readonly fileService: FilesService
    ) {}


    async sendOtp(phoneNumberDto: ClientPhoneNumberDto) {
      const phone_number = phoneNumberDto.client_phone_number;
      const otp = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
      });
  
      
      const now = new Date();
      const expiration_time = AddMinutesToDate(now, 5);
  
      const newOtp = await this.otpModel.create({otp, expiration_time})
      
      const details = {
        timestamp: now,
        check: phone_number,
        otp_id: newOtp._id.toString(),
      } 
      console.log(otp);
    
      const encoded = await encode(JSON.stringify(details));
      return {status: "Success", Details: encoded}
    }

    async validateOtp(validateOtp: ValidateOtp, req: Request){
    
      const {verification_key, otp, check} = validateOtp;
      const currentdate = new Date();
      const decoded = await decode(verification_key);
      const obj = JSON.parse(decoded);
      const check_obj = obj.check;
      if(check_obj != check){
        throw new BadRequestException('OTP bu raqamga junatilmagan');
      } 
      const getOtp = await this.otpModel.findById(obj.otp_id);
      if(!getOtp){
        throw new BadRequestException('OTP not found');
      };

      if(getOtp.verified){
        throw new BadRequestException('OTP already used');
      };
     
  
      if(!dates.compare(getOtp.expiration_time, currentdate)){
        throw new BadRequestException('OTP expired');
      }
  
      if(otp != getOtp.otp){
        throw new BadRequestException("OTP is not match")
      }
  
      const client = await this.clientModel.findOne({client_phone_number: check})
      
      if(!client){
        const updatedOtp = await this.otpModel.findByIdAndUpdate(getOtp._id.toString(), {verified: true}, {new: true})
        const newClient = await this.clientModel.create({client_phone_number: check, otp_id: getOtp._id.toString()})
        const tokens = await this.generateTokenForClient(newClient);
        const hashed_token = await bcrypt.hash(tokens.refresh_token,7);
  
        const deviceToken = await this.tokenModel.create({table_name: "client", user_id: newClient._id.toString(), user_device: req.headers['user-agent'], hashed_token })
  
        return {
          message: "new",
          updatedOtp,
          newClient,
          deviceToken,
          tokens
        }
      }

      await this.otpModel.findByIdAndRemove(client.otp_id)
      const updatedOtp = await this.otpModel.findByIdAndUpdate(getOtp._id, {verified: true}, {new: true});
      const updatedClient = (await this.clientModel.findByIdAndUpdate(client._id, {otp_id: getOtp._id.toString()}));

      const tokens = await this.generateTokenForClient(client);
      const hashed_token = await bcrypt.hash(tokens.refresh_token,7);
      const existDevice = await this.tokenModel.findOne({user_id: client._id, user_device: req.headers['user-agent']});
      let deviceToken;
      if(!existDevice){
        deviceToken = await this.tokenModel.create({table_name: "client", user_id: client._id.toString(), user_device: req.headers['user-agent'], hashed_token })
      }else{
        deviceToken = await this.tokenModel.findByIdAndUpdate(existDevice._id, {hashed_token})
      }
      return {
        message: "old",
        updatedOtp,
        updatedClient,
        deviceToken,
        tokens
      }
    }

  
  findAll() {
    return this.clientModel.find().populate('queues');
  }

  findOne(id: string) {
    return this.clientModel.findById(id).populate('queues');
  }

  remove(id: string) {
    return this.clientModel.findByIdAndRemove(id);
  }

  async refreshToken(user_id: string, refreshTokenDto: RefreshTokenDto, req: Request){
    const decodedToken = await this.jwtService.verify(refreshTokenDto.refreshToken, {
      secret: process.env.REFRESH_TOKEN_KEY
    });
    
    if(user_id != decodedToken.id){
      throw new UnauthorizedException('User not found');
    }
    const deviceToken = await this.tokenModel.findOne({user_id: decodedToken.id});
    
    if(!deviceToken){
      throw new UnauthorizedException('User not foud');
    }

    if(!deviceToken.hashed_token){
      throw new BadRequestException('token not found');
    }
    
    const tokenMatch = await bcrypt.compare(refreshTokenDto.refreshToken, deviceToken.hashed_token);
    if(!tokenMatch){
      throw new ForbiddenException('Forbidden');
    }
    const client = await this.clientModel.findById(user_id);
    const tokens = await this.generateTokenForClient(client);
    const hashed_token = await bcrypt.hash(tokens.refresh_token,7);
    const updatedDeviceToken = await this.tokenModel.findByIdAndUpdate(deviceToken._id, {hashed_token});
    return {
      message: "token updated",
      tokens,
      updatedDeviceToken,
      client
    }

  }

  async update(id: string, updateClientDto: UpdateClientDto, file?: Express.Multer.File) {
    if(file){
      const fileName = await this.fileService.createFile(file);
      const updatedSpec = await this.clientModel.findByIdAndUpdate(id, {...updateClientDto, client_photo: fileName}, {new: true});
      return updatedSpec;
    }
    
    const updatedSpec = await this.clientModel.findByIdAndUpdate(id, updateClientDto, {new: true});
    return updatedSpec;
  }

  private async generateTokenForClient(client: ClientDocument){
    const jwtPayload = { id: client.id, is_active: client.client_is_active, otp_id: client.otp_id};
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME
      }),
    ])
    return {
      access_token: accessToken,
      refresh_token: refreshToken
    }
  }
}
