import { Type } from 'class-transformer';
import { HasExistingId } from '../../common/decorators/has-existing-id.decorator';

export class UpdateUserParamsDto {
  @HasExistingId({ tableName: 'users' })
  @Type(() => Number)
  id: number;
}
