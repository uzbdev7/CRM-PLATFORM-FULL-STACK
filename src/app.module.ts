// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { TeacherModule } from './teacher/teacher.module';
import { StudentModule } from './student/student.module';
import { CourseModule } from './course/course.module';
import { RoomModule } from './room/room.module';
import { GroupModule } from './group/group.module';
import { StudentGroupModule } from './student-group/student-group.module';
import { AuthModule } from './auth/auth.module';
import { LessonModule } from './lesson/lesson.module';
import { AttendanceModule } from './attendance/attendance.module';
import { HomeworkModule } from './homework/homework.module';
import { LessonVideoModule } from './lesson-video/lesson-video.module';
import { RatingModule } from './rating/rating.module';
import { HomeworkResponseModule } from './homework-response/homework-response.module';
import { HomeworkResultModule } from './homework-result/homework-result.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    PrismaModule,
    UsersModule,
    AuthModule,

    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAIL_HOST,
          port: Number(process.env.MAIL_PORT),
          secure: false,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
          },
        },
        defaults: {
          from: `"CRM System" <${process.env.MAIL_USER}>`,
        },
      }),
    }),

    TeacherModule,

    StudentModule,

    CourseModule,

    RoomModule,

    GroupModule,

    StudentGroupModule,

    LessonModule,

    AttendanceModule,

    HomeworkModule,

    LessonVideoModule,

    RatingModule,

    HomeworkResponseModule,

    HomeworkResultModule,
  ],
})
export class AppModule {}