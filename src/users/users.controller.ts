import { Controller, Post, Body, Res, UseGuards, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiCookieAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { LoginUserDto } from './dto/LoginUser.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { multerOptions } from 'src/config/multer.config';
import { Role } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'SUPERADMIN ADMIN' })
  @ApiResponse({ status: 201, description: 'User yaratildi' })
  @ApiResponse({ status: 403, description: 'Ruxsat yo\'q' })
  @Post('register')
  @UseGuards(JwtAuthGuard,RoleGuard)
  @Roles(Role.SUPERADMIN,Role.ADMIN)
  @UseInterceptors(FileInterceptor('photo', multerOptions))
  @ApiConsumes('multipart/form-data')
  register(
  @Body() dto: CreateUserDto,
  @UploadedFile() photo: Express.Multer.File) {
    return this.usersService.register(dto, photo);
  }

  @ApiOperation({ summary: 'ADMIN | SUPERADMIN' })
  @ApiResponse({ status: 200, description: 'Login muvaffaqiyatli' })
  @ApiResponse({ status: 401, description: 'Email yoki parol xato' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginUserDto, @Res() res: Response) {
    return this.usersService.login(dto, res);
  }


  @ApiOperation({ summary: 'Tizimdan chiqish' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli chiqildi' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res() res: Response) {
    return this.usersService.logout(res);
  }
}