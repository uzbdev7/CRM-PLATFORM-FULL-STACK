import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoleGuard } from '../auth/guards/role.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role, Status } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiCookieAuth, ApiOperation, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags("Room")
@Controller('room')
@ApiCookieAuth("access_token")
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @ApiOperation({summary:"ADMIN | SUPERADMIN"})
  @UseGuards(JwtAuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @Post("create")
  createCourse(@Body() payload: CreateRoomDto) {
    return this.roomService.createRoom(payload);
  }

  @ApiOperation({summary:"ADMIN | SUPERADMIN | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.ADMINISTRATOR)
  @Get('all/status')
  @ApiQuery({ 
     name: 'status', 
     required: false, 
     enum: Status
   })
   getAllRoom(@Query('status') status?: Status,
 ) {
     return this.roomService.getAllRoomStatus(status);
   }

  @ApiOperation({summary:"ADMIN | SUPERADMIN |ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN,Role.ADMINISTRATOR)
  @Get(":id")
  getRoomById(
    @Param("id",ParseIntPipe) id:number
  ){
    return this.roomService.getRoomById(id)
  }

  @ApiOperation({summary:"ADMIN | SUPERADMIN | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN,Role.ADMINISTRATOR)
  @Patch(":id")
  updateRoomById(
    @Param("id",ParseIntPipe) id:number,
    @Body() payload:UpdateRoomDto
  ){
    return this.roomService.updateRoom(id,payload)
  }

  @ApiOperation({summary:"ADMIN | SUPERADMIN | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN,Role.ADMINISTRATOR)
  @Delete(":id")
  delete(
    @Param("id",ParseIntPipe) id:number
  ){
    return this.roomService.removeRoomById(id)
  }

}
