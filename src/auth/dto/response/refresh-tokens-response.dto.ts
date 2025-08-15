import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AuthTokens } from '../../auth.types';

export class RefreshTokensResponseDto implements AuthTokens {
  @ApiProperty({
    description: 'Auth access token',
    example: {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  })
  @Expose()
  access_token: string;

  @ApiProperty({
    description: 'Auth refresh token',
    example: {
      refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  })
  @Expose()
  refresh_token: string;
}
