import { Module } from '@nestjs/common';
import { PackModule } from './pack/pack.module';

@Module({
  imports: [PackModule],
})
export class AppModule {}
