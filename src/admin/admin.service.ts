import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin, AdminDocument } from './schemas/admin.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token, TokenDocument } from '../token/schemas/token.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { LoginAdminDto } from './dto/login-admin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdatePasswordDtp } from './dto/update-password.dto';

@Injectable()
export class AdminService {

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>, 
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private readonly jwtService: JwtService, 
    ) {}

  async create(createAdminDto: CreateAdminDto, req: Request) {
    const {password, confirm_password, admin_name, admin_phone_number} = createAdminDto;
    const admin = await this.adminModel.findOne({admin_phone_number});
    if(admin){
      throw new BadRequestException('this phone number already registrated')
    }

    if(password !== confirm_password){
      throw new BadRequestException('password not match')
    }

    const admin_hashed_password = await bcrypt.hash(password, 7);
    const newAdmin = await this.adminModel.create({...createAdminDto, admin_hashed_password});
    const tokens = await this.generateTokenForAdmin(newAdmin)

    const hashed_token = await bcrypt.hash(tokens.refresh_token, 7)

    const deviceToken = await this.tokenModel.create({table_name: "admin", user_id: newAdmin._id.toString(), user_device: req.headers['user-agent'], hashed_token })

    return {
      newAdmin,
      tokens,
      deviceToken
    };
  };

  async login(loginAdminDto: LoginAdminDto, req: Request) {
    const {password, admin_phone_number} = loginAdminDto;
    const admin = await this.adminModel.findOne({admin_phone_number});
    if(!admin){
      throw new BadRequestException('user not found')
    }

    const varify = await bcrypt.compare(password, admin.admin_hashed_password);
    if(!varify){
      throw new BadRequestException('phone number or password not correct')
    }

    const tokens = await this.generateTokenForAdmin(admin)

    const hashed_token = await bcrypt.hash(tokens.refresh_token, 7)

    const deviceToken = await this.tokenModel.findOneAndUpdate({user_id: admin._id.toString()},{table_name: "admin", user_id: admin._id.toString(), user_device: req.headers['user-agent'], hashed_token }, {new: true})

    return {
      admin,
      tokens,
      deviceToken
    };
  };


  async logout(id:string, refreshTokenDto: RefreshTokenDto) {
    const admin = await this.jwtService.verify(refreshTokenDto.refresh_token, {
      secret: process.env.REFRESH_TOKEN_KEY
    });

    if(!admin){
      throw new BadRequestException('token expired')
    }

    if(id !== admin.id){
      throw new UnauthorizedException('You do not have access')
    }

    const foundAdmin = await this.tokenModel.findOne({user_id: admin.id});

    const verify = await bcrypt.compare(refreshTokenDto.refresh_token, foundAdmin.hashed_token);

    if(!verify){
      throw new BadRequestException('Access denied')
    }

    const updateTokenModel = await this.tokenModel.findByIdAndUpdate(foundAdmin.id, {hashed_token: null}, {new: true}); 

    return {
      message: 'you are logged out',
      updateTokenModel
    };
  };

  async updatePassword(id: string, updatePaswordDto: UpdatePasswordDtp){
    const admin = await this.adminModel.findById(id);

    if(!admin){
      throw new BadRequestException('admin not found')
    }

    const isCorrect = await bcrypt.compare(updatePaswordDto.old_password, admin.admin_hashed_password);
    if(!isCorrect){
      throw new BadRequestException('Password not correct')
    }

    if(updatePaswordDto.new_password !== updatePaswordDto.confirm_password){
      throw new BadRequestException('newpassword and varification not match')
    }

    const hashed_password = await bcrypt.hash(updatePaswordDto.new_password, 7);

    const updatedAdmin = await this.adminModel.findByIdAndUpdate(id, {admin_hashed_password: hashed_password}, {new: true})

    return {
      message: "password updted",
      updatedAdmin
    }
  }



  findAll() {
    return this.adminModel.find();
  }

  findOne(id: string) {
    return this.adminModel.findById(id);
  }

  update(id: number, updateAdminDto: UpdateAdminDto) {
    return `This action updates a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }

  private async generateTokenForAdmin(admin: AdminDocument){
    const jwtPayload = { id: admin.id, is_active: admin.admin_is_active, is_creator: admin.admin_is_creator};
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
