import { IsString } from 'class-validator';
import { AuthTokens } from '../../auth.types';

export class RefreshTokensDto implements Partial<AuthTokens> {
  @IsString()
  refresh_token: string;
}
