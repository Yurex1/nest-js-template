import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { RestorePasswordDto } from './dto/restore-password.dto';

export const FindAllUsersSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all users',
      description: 'Retrieves a list of all users (excluding sensitive data)',
    }),
    ApiOkResponse({
      description: 'List of users retrieved successfully',
      type: [User],
    }),
  );

export const FindOneUserSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get user by ID',
      description: 'Retrieves a specific user by their unique identifier',
    }),
    ApiParam({
      name: 'id',
      description: 'User unique identifier',
      example: 1,
      type: 'number',
    }),
    ApiOkResponse({
      description: 'User found and retrieved successfully',
      type: User,
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
    ApiBadRequestResponse({
      description: 'Invalid user ID format',
    }),
  );

export const UpdateUserSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update user',
      description: 'Updates an existing user with the provided information',
    }),
    ApiParam({
      name: 'id',
      description: 'User unique identifier',
      example: 1,
      type: 'number',
    }),
    ApiBody({ type: UpdateUserDto }),
    ApiOkResponse({
      description: 'User updated successfully',
      type: User,
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
    }),
    ApiConflictResponse({
      description: 'Email already in use by another user',
    }),
  );

export const RemoveUserSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete user',
      description: 'Permanently deletes a user account',
    }),
    ApiParam({
      name: 'id',
      description: 'User unique identifier',
      example: 1,
      type: 'number',
    }),
    ApiNoContentResponse({
      description: 'User deleted successfully',
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
    ApiBadRequestResponse({
      description: 'Invalid user ID format',
    }),
  );

export const RestorePasswordSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Restore user password',
      description: 'Restores a user password',
    }),
    ApiBody({ type: RestorePasswordDto }),
    ApiOkResponse({
      description: 'User password restored successfully',
      type: User,
    }),
    ApiNotFoundResponse({
      description: 'User not found',
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
    }),
    ApiConflictResponse({
      description: 'Email already in use by another user',
    }),
  );
