import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/request/create-auth.dto';
import { SignInUserSwagger, SignUpUserSwagger } from './auth.swagger';
import { plainToClass } from 'class-transformer';
import { RefreshTokensDto } from './dto/request/refresh-tokens.dto';
import { SignUpResponseDto } from './dto/response/sign-up-response.dto';
import { SignInResponseDto } from './dto/response/sign-in-response.dto';
import { SignInDto } from './dto/request/sign-in.dto';
import { RefreshTokensResponseDto } from './dto/response/refrest-tokens-response.dto';
import { AuthGuard } from './guards/auth.guard';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SignInUserSwagger()
  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<SignInResponseDto> {
    const result = await this.authService.signIn(signInDto);
    return plainToClass(SignInResponseDto, result);
  }

  @SignUpUserSwagger()
  @Post('sign-up')
  async signUpAndSignIn(
    @Body() createAuthDto: CreateAuthDto,
  ): Promise<SignUpResponseDto> {
    const res = await this.authService.signUpAndSignIn(createAuthDto);
    console.log({ res });
    return plainToClass(SignUpResponseDto, res);
  }

  @Post('refresh-tokens')
  @UseGuards(AuthGuard)
  async refreshTokens(
    @Body() body: RefreshTokensDto,
    @CurrentUser() user: User,
  ): Promise<RefreshTokensResponseDto> {
    const { refresh_token } = body;
    const userId = user.id;

    const tokens = await this.authService.refreshTokens(userId, refresh_token);
    return plainToClass(RefreshTokensResponseDto, tokens);
  }
}
