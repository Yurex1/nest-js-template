import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
} from 'typeorm';
import { User } from '../entities/user.entity';
import { Logger } from '@nestjs/common';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  private readonly logger = new Logger(UserSubscriber.name);

  listenTo(): typeof User {
    return User;
  }

  afterInsert(event: InsertEvent<User>) {
    this.logger.log(
      `User created with id: ${event.entity.id}. TODO: Send confirmation link.`,
    );
  }
}
