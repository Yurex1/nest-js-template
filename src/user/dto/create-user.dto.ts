import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';
import { User } from '../entities/user.entity';

export class CreateUserDto implements Partial<User> {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @MinLength(6)
  password: string;
}
