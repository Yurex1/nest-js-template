import { registerDecorator, ValidationOptions } from 'class-validator';
import { HasExistingIdOptions } from '../types';
import { HasExistingIdConstraint } from '../constraints/has-existing-id.constraint';

export const HasExistingId = (
  options: HasExistingIdOptions,
  validationOptions?: ValidationOptions,
) => {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: HasExistingIdConstraint,
    });
  };
};
