import { Module } from '@nestjs/common';
import { HomeworkResponseService } from './homework-response.service';
import { HomeworkResponseController } from './homework-response.controller';

@Module({
  controllers: [HomeworkResponseController],
  providers: [HomeworkResponseService],
})
export class HomeworkResponseModule {}
