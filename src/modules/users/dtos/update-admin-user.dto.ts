import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateAdminUser {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAdmin: boolean;
}
