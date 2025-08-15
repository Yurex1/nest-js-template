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

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    const token = extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        userId: number;
      }>(token, {
        secret: process.env.JWT_SECRET,
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
