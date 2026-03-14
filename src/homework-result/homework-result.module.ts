import { Module } from '@nestjs/common';
import { HomeworkResultService } from './homework-result.service';
import { HomeworkResultController } from './homework-result.controller';

@Module({
  controllers: [HomeworkResultController],
  providers: [HomeworkResultService],
})
export class HomeworkResultModule {}
