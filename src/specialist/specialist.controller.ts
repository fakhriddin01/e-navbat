import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { SpecialistService } from './specialist.service';
import { PhoneNumberDto } from './dto/validate-specialist.dto';
import { ValidateOtp } from './dto/validate-otp.dto';
import { Request } from 'express';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../guards/jwt-auth.guard';
import { IsCreator } from '../guards/is-creator.guard';
import { SelfGuard } from '../guards/user-self.guard';
import { AddDeviceInfo } from '../decorators/addDeviceToReq';

@Controller('specialist')
export class SpecialistController {
  constructor(private readonly specialistService: SpecialistService) {}

  @Post('otp')
  sendOtp(@Body() phoneNumberDto: PhoneNumberDto) {
    return this.specialistService.sendOtp(phoneNumberDto);
  }
          
  @Post('validate')
  validateOtp(@Body() validateOtp: ValidateOtp, @AddDeviceInfo() req: any) {
    return this.specialistService.validateOtp(validateOtp, req);
  }

  @Post(':id/refresh')
  refreshToken(@Param('id') id: string, @Body() refreshTokenDto: RefreshTokenDto, @Req() req: Request) {
    return this.specialistService.refreshToken(id, refreshTokenDto, req);
  }

  @UseGuards(SelfGuard)
  @UseGuards(JwtGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(@Param('id') id: string, @Body() updateSpecialistDto: UpdateSpecialistDto, @UploadedFile() file?: Express.Multer.File ) {
    return this.specialistService.update(id, updateSpecialistDto, file);
  }

  
  @UseGuards(JwtGuard)
  @Get('all')
  findAll() {
    return this.specialistService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.specialistService.findOne(id);
  }

  @UseGuards(SelfGuard)
  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.specialistService.remove(id);
  }
}
