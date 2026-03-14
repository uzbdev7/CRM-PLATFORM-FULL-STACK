import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { StudentGroupService } from './student-group.service';
import { CreateStudentGroupDto } from './dto/create-student-group.dto';
import { UpdateStudentGroupDto } from './dto/update-student-group.dto';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role, Status } from '@prisma/client';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags("Studet-Group")
@ApiCookieAuth("access_token")
@Controller('student-group')
export class StudentGroupController {
  constructor(private readonly studentGroupService: StudentGroupService) {}

  @Post('create')
  @ApiOperation({ summary: 'ADMIN | SUPERADMIN | ADMINISTRATOR | MANAGEMENT' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.MANAGEMENT, Role.SUPERADMIN, Role.ADMINISTRATOR)
  create(@Body() createStudentGroupDto: CreateStudentGroupDto) {
    return this.studentGroupService.createStudentGroup(createStudentGroupDto);
  }

  @Get('all/status')
  @ApiOperation({ summary: 'ADMIN | SUPERADMIN | ADMINISTRATOR' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.ADMINISTRATOR)
  @ApiQuery({
    name: 'status',
    required: false,
    enum: Status,
  })
  getAll(@Query('status') status?: Status) {
    return this.studentGroupService.getAllStudentGroupByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ADMIN | SUPERADMIN | ADMINISTRATOR' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.ADMINISTRATOR)
  findOne(@Param('id', ParseIntPipe) id:number) {
    return this.studentGroupService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ADMIN | SUPERADMIN | ADMINISTRATOR' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.ADMINISTRATOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentGroupDto,
  ) {
    return this.studentGroupService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ADMIN | SUPERADMIN | ADMINISTRATOR' })
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.ADMINISTRATOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentGroupService.remove(+id);
  }
}
