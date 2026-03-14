import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[PrismaModule,AuthModule],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
