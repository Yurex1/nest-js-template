import { IsString } from 'class-validator';

export class RestorePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  newPassword: string;
}
