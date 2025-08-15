import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
} from 'typeorm';
import { User } from '../entities/user.entity';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo(): typeof User {
    return User;
  }

  afterInsert(event: InsertEvent<User>) {
    console.log(`TODO: Send confirmation link`);
  }
}
