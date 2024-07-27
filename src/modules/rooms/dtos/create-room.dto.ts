import { ApiProperty } from '@nestjs/swagger';
import { RoomTypeEnum } from '@prisma/client';
import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  roomNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(RoomTypeEnum)
  roomType: RoomTypeEnum;

  @ApiProperty()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  pricePerNight: number;
}
