import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HasExistingIdOptions } from '../types';

@ValidatorConstraint({ name: 'HasExistingId', async: true })
@Injectable()
export class HasExistingIdConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value) return false;

    if (!this.dataSource) {
      console.error('DataSource is not available');
      return false;
    }

    try {
      const options = args.constraints[0] as HasExistingIdOptions;
      const { tableName, column = 'id' } = options;

      const query = `SELECT 1 FROM ${tableName} WHERE ${column} = $1 LIMIT 1`;
      const result: { exists: number }[] = await this.dataSource.query(query, [
        value,
      ]);
      return result.length > 0;
    } catch (error) {
      console.error('HasExistingId validation error:', error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const options = args.constraints[0] as HasExistingIdOptions;
    const column = options.column || 'id';

    return `${args.property} with ${column} '${args.value}' does not exist`;
  }
}
