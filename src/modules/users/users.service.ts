import {
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/core/services/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dtos/login-user.dto';
import { LoginResponse, UserPayload } from './interfaces/users-login.interface';
import { UpdateUsertDto } from './dtos/update-user.dto';
import { UpdateAdminUser } from './dtos/update-admin-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          passwordHash: await hash(createUserDto.passwordHash, 10),
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
        },
      });

      delete newUser.passwordHash;

      return newUser;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }

      throw new HttpException(error, 500);
    }
  }

  async loginUser(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginUserDto.email },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!(await compare(loginUserDto.passwordHash, user.passwordHash))) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload: UserPayload = {
        sub: user.id,
        email: user.email,
        name: user.firstName,
        isAdmin: user.isAdmin,
      };

      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      throw new HttpException(error, 500);
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUsertDto): Promise<User> {
    try {
      await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...updateUserDto,
          ...(updateUserDto.passwordHash && {
            passwordHash: await hash(updateUserDto.passwordHash, 10),
          }),
        },
      });

      delete updatedUser.passwordHash;

      return updatedUser;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      if (error.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }

      throw new HttpException(error, 500);
    }
  }

  async updateAdminUser(
    id: number,
    updateUserDto: UpdateAdminUser,
  ): Promise<User> {
    try {
      await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          ...updateUserDto,
        },
      });

      return updatedUser;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      throw new HttpException(error, 500);
    }
  }

  async deleteUser(id: number): Promise<string> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });

      await this.prisma.user.delete({
        where: { id },
      });

      return `User with id ${user.id} deleted`;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      throw new HttpException(error, 500);
    }
  }
}
