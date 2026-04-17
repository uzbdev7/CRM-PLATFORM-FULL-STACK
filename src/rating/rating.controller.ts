import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Rating')
@ApiCookieAuth("access_token")
@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @ApiOperation({summary:"STUDENT"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.STUDENT)
  @Post('create')
  create(
    @Body() createRatingDto: CreateRatingDto,
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.ratingService.create(createRatingDto, user)
  }

  // Student o'z ratinglarini ko'radi
  @ApiOperation({summary:"STUDENT"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.STUDENT)
  @Get('my-ratings')
  findMyRatings(
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.ratingService.findMyRatings(user)
  }

  // Teacher o'ziga berilgan ratinglarni ko'radi
  @ApiOperation({summary:"TEACHER"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.TEACHER)
  @Get('teacher-ratings')
  findTeacherRatings(
    @CurrentUser() user: { id: number; role: Role }
  ) {
    return this.ratingService.findTeacherRatings(user)
  }

  // SUPERADMIN hamma ratinglarni ko'radi
  @ApiOperation({summary:"SUPERADMIN"})
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.SUPERADMIN)
  @Get('all')
  findAll() {
    return this.ratingService.findAll()
  }

}