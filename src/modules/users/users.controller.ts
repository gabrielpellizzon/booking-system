import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUsertDto } from './dtos/update-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { LoginResponse, UserPayload } from './interfaces/users-login.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ExpressRequestWithUser } from './interfaces/express-request-with-user.interface';
import { Public } from 'src/common/decorators/public.decorator';
import { IsMineGuard } from 'src/common/guards/is-mine.guard';
import { UpdateAdminUser } from './dtos/update-admin-user.dto';
import { IsAdminGuard } from 'src/common/guards/is-admin.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.registerUser(createUserDto);
  }

  @Public()
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto): Promise<LoginResponse> {
    return this.usersService.loginUser(loginUserDto);
  }

  @Get('me')
  me(@Request() req: ExpressRequestWithUser): UserPayload {
    return req.user;
  }

  @Patch(':id')
  @UseGuards(IsMineGuard)
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUsertDto,
  ): Promise<User> {
    return this.usersService.updateUser(+id, updateUserDto);
  }

  @Patch('admin/:id')
  @UseGuards(IsAdminGuard)
  async updateAdminUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminUserDto: UpdateAdminUser,
  ): Promise<User> {
    return this.usersService.updateAdminUser(+id, updateAdminUserDto);
  }

  @Delete(':id')
  @UseGuards(IsMineGuard)
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.usersService.deleteUser(+id);
  }
}
