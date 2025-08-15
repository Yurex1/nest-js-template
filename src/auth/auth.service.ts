import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/request/create-auth.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from '../utils/hash.util';

import { AuthTokens } from './auth.types';
import { SignInDto } from './dto/request/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<AuthTokens> {
    const { email, password } = signInDto;
    const user = await this.userService.findOneOrThrowError({
      where: { email },
    });
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      throw new UnauthorizedException();
    }

    const payload = { userId: user.id };
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
    return {
      access_token,
      refresh_token,
    };
  }

  async signUpAndSignIn(createUserDto: CreateAuthDto) {
    const user = await this.userService.create(createUserDto);
    return this.signIn({ email: user.email, password: createUserDto.password });
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<AuthTokens> {
    try {
      await this.jwtService.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = { userId };

    const newAccessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });
    const newRefreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }
}
