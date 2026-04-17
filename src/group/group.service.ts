import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupService {
  constructor(private prisma:PrismaService){}

  async createGroup(payload: CreateGroupDto, userId:number) {

    const existTeacher = await this.prisma.teacher.findFirst({
      where:{
        id:payload.teacherId,
        status:"ACTIVE"
      }
    })

     if(!existTeacher){
      throw new ConflictException("TeacherId not found in this teacher table")
    }

    const existRoom = await this.prisma.room.findUnique({
      where:{
        id:payload.roomId,
        status:'ACTIVE'
      }
    })

    if(!existRoom){
      throw new ConflictException("RoomId not found in this room table")
    }

    const existGroup = await this.prisma.group.findUnique({
      where:{
        name:payload.name,
        courseId:payload.courseId
      } 
    })

    if(existGroup){
      throw new ConflictException("Group already exists in this course")
    }

    await this.prisma.group.create({
      data:{
        ...payload,
        startDate: new Date(payload.startDate), 
        userId
      }
    })

    return {
      success:true,
      message:"Group created successfully"
    }

  }

  async getAllGroups(status?: Status) {
      const courses = await this.prisma.group.findMany({
      where: status ? { status } : {},
      select: {
        id:true,
        teacherId: true,
        name:true,
        startTime: true,
        startDate:true,
        weeKDays: true,
        status: true,

        room: {
          select: {
            name: true
          }
        },

        course: {
          select: {
            id: true,
            name: true,
            durationLesson: true,
            durationMonth:true,
            price: true
          }
        },

        teacher: {
          select: {
            id: true,
            fullName: true
          }
        },

        studentGroups: {
          select: {
            id: true
          }
        },

        user: {
          select: {
            fullName: true
          }
        }
      }
    });

    return {
      success: true,
      data: courses
    };
  } 

  async getById(id:number){
    const groupId = await this.prisma.group.findUnique({
      where:{id},
      include:{
        teacher:{
          select:{
            id:true,
            fullName:true,
            email: true
          }
        },
        user:{
          select:{
            id:true,
            fullName:true
          }
        },
        course:{
          select:{
            id:true,
            name:true,
            status:true,
            durationLesson: true,
            durationMonth: true,
            price: true
          }
        },
        room:true,
        studentGroups: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                email: true,
                status: true
              }
            }
          }
        }
      }
    })

     if (!groupId) throw new NotFoundException('Group not found');

     return {
      success:true,
      data:groupId
     }
  }
 
  async updateGroupById(id:number, payload:UpdateGroupDto, userId:number){
    const groupId = await this.prisma.group.findUnique({
      where:{id}
    })

    if(!groupId) throw new NotFoundException('GroupId not found')
      
    const updatedGroup = await this.prisma.group.update({
      where:{id},
      data:{
        ...payload,
        startDate: payload.startDate ? new Date(payload.startDate) : undefined,
        userId
      }
    })

    return {
      success:true,
      data:updatedGroup
    }
    
  }

  async deleteGroupById(id:number){
    const groupId = await this.prisma.group.findUnique({
      where:{id}
    })

    if(!groupId) throw new NotFoundException('GroupId not found')

    await this.prisma.group.delete({
      where:{id}
    })

    return {
      success:true,
      message:"Course deleted successfully."
    }
  }

}
