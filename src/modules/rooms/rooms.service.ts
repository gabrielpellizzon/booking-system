import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  ConflictException,
} from '@nestjs/common';
import { Room } from '@prisma/client';
import { PrismaService } from 'src/core/services/prisma.service';
import { CreateRoomDto } from './dtos/create-room.dto';
import { UpdateRoomDto } from './dtos/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllRooms(): Promise<Room[]> {
    try {
      return await this.prisma.room.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch rooms');
    }
  }

  async findRoomByID(id: number): Promise<Room> {
    try {
      return await this.prisma.room.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }
      throw new HttpException(error, 500);
    }
  }

  async registerRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    try {
      return await this.prisma.room.create({
        data: {
          roomNumber: createRoomDto.roomNumber,
          roomType: createRoomDto.roomType,
          description: createRoomDto.description,
          pricePerNight: createRoomDto.pricePerNight,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Room already registered');
      }

      throw new HttpException(error, 500);
    }
  }

  async updateRoom(
    id: number,
    updateRoomDto: Partial<UpdateRoomDto>,
  ): Promise<Room> {
    try {
      await this.prisma.room.findUniqueOrThrow({
        where: { id },
      });

      return await this.prisma.room.update({
        where: { id },
        data: { ...updateRoomDto },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Room with id ${id} not found`);
      }

      throw new HttpException(error, 500);
    }
  }

  async deleteRoom(id: number): Promise<string> {
    try {
      const room = await this.prisma.room.findUniqueOrThrow({
        where: { id },
      });

      await this.prisma.room.delete({
        where: { id },
      });

      return `Room with id ${room.id} deleted`;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }
      throw new HttpException(error, 500);
    }
  }
}
