import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';

type UserKeys = keyof User;

export const CurrentUser = createParamDecorator(function (
  data: UserKeys,
  context: ExecutionContext,
): User | User[UserKeys] {
  const request = context.switchToHttp().getRequest<{ user: User }>();

  return data ? request.user[data] : request.user;
});
