import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Specialist, SpecialistDocument } from './schemas/specialist.schema';
import { Model } from 'mongoose';
import { PhoneNumberDto } from './dto/validate-specialist.dto';
import * as otpGenerator from 'otp-generator'
import { AddMinutesToDate } from '../helper/addMinutes';
import * as uuid from 'uuid'
import { Otp, OtpDocument } from '../otp/schemas/otp.schema';
import { dates, decode, encode } from '../helper/crypto';
import { ValidateOtp } from './dto/validate-otp.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { Token, TokenDocument } from '../token/schemas/token.schema';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';
import { FilesService } from '../../files/files.service';


@Injectable()
export class SpecialistService {

  constructor(
    @InjectModel(Specialist.name) private specialistModel: Model<SpecialistDocument>, 
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private readonly jwtService: JwtService, 
    private readonly fileService: FilesService
    ) {}

  async sendOtp(phoneNumberDto: PhoneNumberDto) {
    const phone_number = phoneNumberDto.spec_phone_number;
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
      success: true,
      message: "OTP sent to user",
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
    if(getOtp.verified){
      throw new BadRequestException('OTP already used');
    }
    if(!getOtp){
      throw new BadRequestException('OTP not found');
    }

    if(!dates.compare(getOtp.expiration_time, currentdate)){
      throw new BadRequestException('OTP expired');
    }

    if(otp != getOtp.otp){
      throw new BadRequestException("OTP is not match")
    }

    const spec = await this.specialistModel.findOne({spec_phone_number: check})
    
    if(!spec){
      const updatedOtp = await this.otpModel.findByIdAndUpdate(getOtp._id.toString(), {verified: true}, {new: true})
      const newSpec = await this.specialistModel.create({spec_phone_number: check, otp_id: getOtp._id.toString()})
      const tokens = await this.generateTokenForSpec(newSpec);
      const hashed_token = await bcrypt.hash(tokens.refresh_token,7);

      const deviceToken = await this.tokenModel.create({table_name: "specialist", user_id: newSpec._id.toString(), user_device: req.headers['user-agent'], hashed_token })

      return {
        message: "new",
        updatedOtp,
        newSpec,
        deviceToken,
        tokens
      }
    }

    await this.otpModel.findByIdAndRemove(spec.otp_id)
    const updatedOtp = await this.otpModel.findByIdAndUpdate(getOtp._id, {verified: true}, {new: true});
    const updatedSpec = await this.specialistModel.findByIdAndUpdate(spec._id, {otp_id: getOtp._id.toString()});

    const tokens = await this.generateTokenForSpec(spec);
    const hashed_token = await bcrypt.hash(tokens.refresh_token,7);
    const existDevice = await this.tokenModel.findOne({user_id: spec._id, user_device: req.headers['user-agent']});
    let deviceToken;
    if(!existDevice){
       deviceToken = await this.tokenModel.create({table_name: "specialist", user_id: spec._id.toString(), user_device: req.headers['user-agent'], hashed_token })
    }else{
      deviceToken = await this.tokenModel.findByIdAndUpdate(existDevice._id, {hashed_token})
    }
    return {
      message: "old",
      updatedOtp,
      updatedSpec,
      deviceToken,
      tokens
    }

  }

  private async generateTokenForSpec(spec: SpecialistDocument){
    const jwtPayload = { id: spec.id, is_active: spec.spec_is_active, otp_id: spec.otp_id};
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
    const spec = await this.specialistModel.findById(user_id);
    const tokens = await this.generateTokenForSpec(spec);
    const hashed_token = await bcrypt.hash(tokens.refresh_token,7);
    const updatedDeviceToken = await this.tokenModel.findByIdAndUpdate(deviceToken._id, {hashed_token});
    return {
      message: "token updated",
      tokens,
      updatedDeviceToken,
      spec
    }

  }

  async update(id: string, updateSpecialistDto: UpdateSpecialistDto, file?: Express.Multer.File) {
    if(file){
      const fileName = await this.fileService.createFile(file);
      const updatedSpec = await this.specialistModel.findByIdAndUpdate(id, {...updateSpecialistDto, spec_photo: fileName}, {new: true});
      return updatedSpec;
    }
    
    const updatedSpec = await this.specialistModel.findByIdAndUpdate(id, updateSpecialistDto, {new: true});
    return updatedSpec;
  }

  findAll() {
    return this.specialistModel.find().populate('working_day').populate('services');
  }

  findOne(id: string) {
    return this.specialistModel.findById(id).populate('working_day').populate('services');
  }

  

  remove(id: string) {
    return this.specialistModel.findByIdAndRemove(id);
  }
}
