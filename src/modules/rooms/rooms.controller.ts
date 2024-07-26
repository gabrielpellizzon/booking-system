import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dtos/create-room.dto';
import { UpdateRoomDto } from './dtos/update-room.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Room } from '@prisma/client';

@ApiTags('Rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('register')
  registerRoom(@Body() createRoomDto: CreateRoomDto): Promise<Room> {
    return this.roomsService.registerRoom(createRoomDto);
  }

  @Get()
  findAllRooms(): Promise<Room[]> {
    return this.roomsService.findAllRooms();
  }

  @Get(':id')
  findRoomByID(@Param('id', ParseIntPipe) id: string): Promise<Room> {
    return this.roomsService.findRoomByID(+id);
  }

  @Patch(':id')
  updateRoom(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    return this.roomsService.updateRoom(+id, updateRoomDto);
  }

  @Delete(':id')
  deleteRoom(@Param('id', ParseIntPipe) id: string): Promise<string> {
    return this.roomsService.deleteRoom(+id);
  }
}
