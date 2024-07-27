import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dtos/create-room.dto';
import { UpdateRoomDto } from './dtos/update-room.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Room } from '@prisma/client';
import { IsAdminGuard } from 'src/common/guards/is-admin.guard';

@ApiTags('Rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('register')
  @UseGuards(IsAdminGuard)
  registerRoom(@Body() createRoomDto: CreateRoomDto): Promise<Room> {
    return this.roomsService.registerRoom(createRoomDto);
  }

  @Get()
  findAllRooms(): Promise<Room[]> {
    return this.roomsService.findAllRooms();
  }

  @Get(':id')
  findRoomByID(@Param('id', ParseIntPipe) id: number): Promise<Room> {
    return this.roomsService.findRoomByID(+id);
  }

  @Patch(':id')
  @UseGuards(IsAdminGuard)
  updateRoom(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    return this.roomsService.updateRoom(+id, updateRoomDto);
  }

  @Delete(':id')
  @UseGuards(IsAdminGuard)
  deleteRoom(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.roomsService.deleteRoom(+id);
  }
}
