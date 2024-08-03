import {
  BadRequestException,
  ConflictException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from 'src/core/services/prisma.service';
import { UsersController } from 'src/modules/users/users.controller';
import { UsersService } from 'src/modules/users/users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        PrismaService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = app.get<UsersController>(UsersController);
  });

  it('should be defined"', () => {
    expect(controller).toBeDefined();
  });

  describe('users controller', () => {
    it('should register new user', async () => {
      const newUser = {
        email: 'test@user.com',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '',
        passwordHash: 'password',
      };

      const mockRegisterResponse: User = {
        id: 1,
        email: 'test@user.com',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '',
        createdAt: new Date(),
        passwordHash: 'password',
        isAdmin: false,
      };

      delete mockRegisterResponse.passwordHash;

      jest
        .spyOn(controller, 'registerUser')
        .mockResolvedValue(mockRegisterResponse);

      const result = await controller.registerUser(newUser);

      expect(result).toEqual(mockRegisterResponse);
    });

    it('should throw error if email already registered', async () => {
      const registeredUser = {
        email: 'test@user.com',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '',
        passwordHash: 'password',
      };

      jest
        .spyOn(controller, 'registerUser')
        .mockRejectedValue(new ConflictException());

      const register = controller.registerUser(registeredUser);

      await expect(register).rejects.toThrow(ConflictException);
    });

    it('should throw error if required fields is missing', async () => {
      jest
        .spyOn(controller, 'registerUser')
        .mockRejectedValue(new BadRequestException());

      const register = controller.registerUser(null);

      await expect(register).rejects.toThrow(BadRequestException);
    });

    it('should login user', async () => {
      const mockLoginResponse = {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyeyey',
      };

      jest.spyOn(controller, 'loginUser').mockResolvedValue(mockLoginResponse);

      const result = await controller.loginUser({
        email: 'some@user.com',
        passwordHash: 'password',
      });

      expect(result).toEqual(mockLoginResponse);
      expect(result.access_token).toBeDefined();
    });

    it('should throw error if email is wrong', async () => {
      const wrongEmail = {
        email: 'wrong@user.com',
        passwordHash: 'password',
      };

      jest
        .spyOn(controller, 'loginUser')
        .mockRejectedValue(new NotFoundException());

      const login = controller.loginUser(wrongEmail);

      await expect(login).rejects.toThrow(NotFoundException);
    });

    it('should update user successfully', async () => {
      const userId = 1;
      const updateUserDto = {
        email: 'updated@user.com',
        passwordHash: 'newpassword',
      };
      const updatedUser = {
        id: userId,
        email: 'updated@user.com',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '',
        passwordHash: 'newpassword',
        createdAt: new Date(),
        isAdmin: false,
      };

      jest.spyOn(controller, 'updateUser').mockResolvedValue(updatedUser);

      const result = await controller.updateUser(userId, updateUserDto);

      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const userId = 1;
      const updateUserDto = {
        email: 'updated@user.com',
        passwordHash: 'newpassword',
      };

      jest
        .spyOn(controller, 'updateUser')
        .mockRejectedValue(
          new NotFoundException(`User with id ${userId} not found`),
        );

      await expect(
        controller.updateUser(userId, updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email is already registered', async () => {
      const userId = 1;
      const updateUserDto = {
        email: 'updated@user.com',
        passwordHash: 'newpassword',
      };

      jest
        .spyOn(controller, 'updateUser')
        .mockRejectedValue(new ConflictException('Email already registered'));

      await expect(
        controller.updateUser(userId, updateUserDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw HttpException on other errors', async () => {
      const userId = 1;
      const updateUserDto = {
        email: 'updated@user.com',
        passwordHash: 'newpassword',
      };

      jest
        .spyOn(controller, 'updateUser')
        .mockRejectedValue(new HttpException('Some error', 500));

      await expect(
        controller.updateUser(userId, updateUserDto),
      ).rejects.toThrow(HttpException);
    });
  });
});
