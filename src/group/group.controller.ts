import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Put, Query } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Role, Status } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags("Groups")
@Controller('group')
@ApiCookieAuth("access_token")
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiOperation({summary:"ADMIN | SUPERADMIN | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.ADMINISTRATOR)
  @Post("create")
  createCourse(@Body() payload: CreateGroupDto, @CurrentUser() user) {
    return this.groupService.createGroup(payload, user.id);
  }

  @ApiOperation({summary:"HAMMA UCHUN"})
  @Get('all/status')
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: Status
  })
  getAllCourses(@Query('status') status?: Status,
) {
    return this.groupService.getAllGroups(status);
  }
  
  @ApiOperation({summary:"HAMMA UCHUN"})
  @Get(":id")
  getById(@Param("id", ParseIntPipe) id:number){
    return this.groupService.getById(id);
  }

  @ApiOperation({summary:"ADMIN | SUPERADMIN | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR,Role.SUPERADMIN)
  @Patch(":id")
  update(
    @Body() payload:UpdateGroupDto,
    @Param("id",ParseIntPipe) id:number,
    @CurrentUser() user,
    ){
      return this.groupService.updateGroupById(id,payload,user.sub)
  }

  @ApiOperation({summary:"ADMIN | SUPERADMIN | ADMINISTRATOR"})
  @UseGuards(JwtAuthGuard,RoleGuard)
  @Roles(Role.ADMIN, Role.ADMINISTRATOR,Role.SUPERADMIN)
  @Delete(":id")
  delete(@Param("id", ParseIntPipe) id:number){
    return this .groupService.deleteGroupById(id)
  }

}
