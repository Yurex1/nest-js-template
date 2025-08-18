import { Type } from 'class-transformer';
import { HasExistingId } from '../../common/decorators/has-existing-id.decorator';

export class DeleteUserParamsDto {
  @HasExistingId({ tableName: 'users' })
  @Type(() => Number)
  id: number;
}
