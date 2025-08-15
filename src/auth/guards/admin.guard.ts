import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from '../../user/user.service';
import { UserRole } from '../../user/user.constants';
import { extractTokenFromHeader } from '../../utils/extract-from-header.util';

@Injectable()
export class AdminGuard implements CanActivate {
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
        secret: process.env.supersecretjwtkey,
      });
      const user = await this.userService.findOneOrThrowError({
        where: { id: payload.userId },
      });

      if (user.role === UserRole.admin) request['user'] = user;
      else throw new UnauthorizedException('User is not an admin');
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}
