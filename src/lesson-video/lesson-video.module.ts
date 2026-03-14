import { Module } from '@nestjs/common';
import { LessonVideoService } from './lesson-video.service';
import { LessonVideoController } from './lesson-video.controller';

@Module({
  controllers: [LessonVideoController],
  providers: [LessonVideoService],
})
export class LessonVideoModule {}
