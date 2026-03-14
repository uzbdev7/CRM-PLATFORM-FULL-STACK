import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports :[AuthModule, PrismaModule],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
