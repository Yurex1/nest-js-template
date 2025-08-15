import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { DeepPartial, FindOneOptions, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { comparePassword, hashPassword } from '../utils/hash.util';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: DeepPartial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new HttpException('User already exists', 409);
    }

    const hashedPassword = await hashPassword(createUserDto.password!);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(options: FindOneOptions<User>): Promise<User | null> {
    return this.userRepository.findOne(options);
  }

  findOneOrThrowError(options: FindOneOptions<User>): Promise<User> {
    return this.userRepository.findOneOrFail(options);
  }

  async update(id: number, updateUserDto: DeepPartial<User>) {
    try {
      const updateResult = await this.userRepository.update(id, updateUserDto);

      if (!updateResult.affected) {
        throw new BadRequestException('Failed to update user.');
      }

      const updatedUser = await this.userRepository.findOne({
        where: { id },
      });

      return updatedUser;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new BadRequestException(
        'Failed to update user',
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async restorePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOneOrFail({ where: { id } });

    const isOldPasswordValid = await comparePassword(
      oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new NotAcceptableException('Old password is incorrect');
    }

    const isNewPasswordAsOld = await comparePassword(
      newPassword,
      user.password,
    );

    if (isNewPasswordAsOld) {
      throw new NotAcceptableException(
        'New password must be different from old password',
      );
    }

    user.password = await hashPassword(newPassword);
    return this.userRepository.save(user);
  }

  async remove(id: number) {
    try {
      const deleteResult = await this.userRepository.delete(id);

      if (deleteResult.affected === 0) {
        throw new BadRequestException('Failed to delete user');
      }

      console.log(`User has been successfully deleted`);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException(
        'Failed to delete user',
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
