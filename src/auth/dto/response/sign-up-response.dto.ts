import { SignInResponseDto } from './sign-in-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SignUpResponseDto implements SignInResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  access_token: string;

  @Expose()
  refresh_token: string;
}
