import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { SignInDto } from './dto/request/sign-in.dto';

export const SignInUserSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'User login',
      description: 'Authenticates a user and returns an access token',
    }),
    ApiCreatedResponse({
      description: 'User successfully logged in',
      type: User,
    }),
    ApiBadRequestResponse({
      description: 'Invalid email or password',
    }),
    ApiBody({ type: CreateUserDto }),
    ApiOkResponse({
      description: 'User successfully logged in',
      schema: {
        type: 'object',
        properties: {
          access_token: { ...accessTokenProperty },
        },
      },
    }),
  );
export const SignUpUserSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Sign up and sign in',
      description: 'Creates a new user and immediately logs them in',
    }),
    ApiCreatedResponse({
      description: 'User successfully created and logged in',
      schema: {
        type: 'object',
        properties: {
          access_token: { ...accessTokenProperty },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
    }),
    ApiConflictResponse({
      description: 'User with this email already exists',
    }),
    ApiBody({ type: SignInDto }),
  );

const accessTokenProperty = {
  type: 'string',
  description: 'JWT access token for the user',
  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};
