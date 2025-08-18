import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuthTokens } from '../../auth.types';

export class SignInResponseDto implements AuthTokens {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  access_token: string;

  @Expose()
  refresh_token: string;
}
