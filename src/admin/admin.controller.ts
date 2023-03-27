import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Request } from 'express';
import { LoginAdminDto } from './dto/login-admin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  create(@Body() createAdminDto: CreateAdminDto, @Req() req: Request) {
    return this.adminService.create(createAdminDto, req);
  }

  @Post('login')
  login(@Body() loginAdminDto: LoginAdminDto, @Req() req: Request) {
    return this.adminService.login(loginAdminDto, req);
  }

  @Post('/:id/logout')
  logout(@Param('id') id: string, @Body() refreshTokenDto: RefreshTokenDto) {
    return this.adminService.logout(id, refreshTokenDto);
  }

  @Get('all')
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
