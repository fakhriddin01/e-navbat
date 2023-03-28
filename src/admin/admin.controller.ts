import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Request } from 'express';
import { LoginAdminDto } from './dto/login-admin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdatePasswordDtp } from './dto/update-password.dto';
import { SelfGuard } from '../guards/user-self.guard';
import { JwtGuard } from '../guards/jwt-auth.guard';
import { IsCreator } from '../guards/is-creator.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(IsCreator)
  @UseGuards(JwtGuard)
  @Post('create')
  create(@Body() createAdminDto: CreateAdminDto, @Req() req: Request) {
    return this.adminService.create(createAdminDto, req);
  }

  @Post('login')
  login(@Body() loginAdminDto: LoginAdminDto, @Req() req: Request) {
    return this.adminService.login(loginAdminDto, req);
  }

  @UseGuards(SelfGuard)
  @UseGuards(JwtGuard)
  @Post('/:id/logout')
  logout(@Param('id') id: string, @Body() refreshTokenDto: RefreshTokenDto) {
    return this.adminService.logout(id, refreshTokenDto);
  }

  @UseGuards(SelfGuard)
  @UseGuards(JwtGuard)
  @Post('/:id/update-password')
  updatePassword(@Param('id') id: string, @Body() updatePasswordDtp: UpdatePasswordDtp) {
    return this.adminService.updatePassword(id, updatePasswordDtp);
  }

  @UseGuards(IsCreator)
  @UseGuards(JwtGuard)
  @Get('all')
  findAll() {
    return this.adminService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @UseGuards(SelfGuard)
  @UseGuards(JwtGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @UseGuards(IsCreator)
  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
