import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientPhoneNumberDto } from './dto/phone-number.dto';
import { ValidateOtp } from '../specialist/dto/validate-otp.dto';
import { RefreshTokenDto } from '../specialist/dto/refresh-token.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../guards/jwt-auth.guard';
import { IsCreator } from '../guards/is-creator.guard';
import { SelfGuard } from '../guards/user-self.guard';
import { AddDeviceInfo } from '../decorators/addDeviceToReq';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}


  @Post('otp')
  sendOtp(@Body() phoneNumberDto: ClientPhoneNumberDto) {
    return this.clientService.sendOtp(phoneNumberDto);
  }

  @Post('validate')
  validateOtp(@Body() validateOtp: ValidateOtp, @AddDeviceInfo() req: any) {
    return this.clientService.validateOtp(validateOtp, req);
  }

  @UseGuards(SelfGuard)
  @UseGuards(JwtGuard)
  @Post(':id/refresh')
  refreshToken(@Param('id') id: string, @Body() refreshTokenDto: RefreshTokenDto, @Req() req: Request) {
    return this.clientService.refreshToken(id, refreshTokenDto, req);
  }

  @UseGuards(SelfGuard)
  @UseGuards(JwtGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto, @UploadedFile() file?: Express.Multer.File ) {
    return this.clientService.update(id, updateClientDto, file);
  }

  @UseGuards(JwtGuard)
  @Get('all')
  findAll() {
    return this.clientService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  @UseGuards(SelfGuard)
  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }
}
