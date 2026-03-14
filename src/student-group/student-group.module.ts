import { Module } from '@nestjs/common';
import { StudentGroupService } from './student-group.service';
import { StudentGroupController } from './student-group.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [StudentGroupController],
  providers: [StudentGroupService],
})
export class StudentGroupModule {}
