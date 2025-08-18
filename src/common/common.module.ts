import { Global, Module } from '@nestjs/common';
import { HasExistingIdConstraint } from './constraints/has-existing-id.constraint';

@Global()
@Module({
  providers: [HasExistingIdConstraint],
  exports: [HasExistingIdConstraint],
})
export class CommonModule {}
