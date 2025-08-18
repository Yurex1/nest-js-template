import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from '../../user/user.service';
import { extractTokenFromHeader } from '../../utils/extract-from-header.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const token = extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    let payload: { userId: number };
    try {
      payload = await this.jwtService.verifyAsync<{ userId: number }>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.userService.findOneOrThrowError({
        where: { id: payload.userId },
      });
      request['user'] = user;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}
