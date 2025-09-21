import { Module } from '@nestjs/common';
import { PackController } from './controllers/pack.controller';
import { PackagingService } from './services/packaging.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PackController],
  providers: [PackagingService],
  exports: [PackagingService],
})
export class PackModule {}
