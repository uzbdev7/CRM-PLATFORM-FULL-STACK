import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Status } from '@prisma/client';
import { stat } from 'fs';

@Injectable()
export class RoomService {
  constructor(private prisma:PrismaService){}
  
  async getAllRoomStatus(status?:Status) {
    const rooms = await this.prisma.room.findMany({
      where: status ? {status} : {}
    })

    return {
      success:true,
      data:rooms
    }
  }

    async createRoom(payload: CreateRoomDto) {
    const existRoom = await this.prisma.room.findUnique({
      where:{name:payload.name}
    }) 

    if(existRoom){
      throw new ConflictException("Room name already exists")
    }

    await this.prisma.room.create({
      data:payload
    })

    return {
      success:true,
      message:"Room created"
    }
  }

  async getRoomById(id: number) {
    const existRoom = await this.prisma.room.findUnique({
      where:{id},
      include:{
        groups:{
          select:{
            id:true,
            roomId:true,
            name:true,
            startDate:true,
            startTime:true,
            weeKDays:true,
            status:true,
            course:{
              select:{
                name:true,
                status:true
              }
            }
          }
        }
      }
    })
    if(!existRoom) throw new NotFoundException('Room not found')

    return  {
      success:true,
      data:existRoom
    }
  }

  async updateRoom(id: number, updateRoomDto: UpdateRoomDto) {
    const existRoom = await this.prisma.room.findUnique({
      where:{id}
    })

    if(!existRoom) throw new NotFoundException("Room id not found.")

    const updated = await this.prisma.room.update({
      where:{id},
      data:updateRoomDto
    })

    return {
      success:true,
      message: "Room has been updated.",
      data:updated
    }
  }

  async removeRoomById(id: number) {
   const existRoom = await this.prisma.room.findUnique({
    where:{id}
   })

   if(!existRoom) throw new NotFoundException('Room not found')

  return {
    success:true,
    data:existRoom
  }
  }
}
