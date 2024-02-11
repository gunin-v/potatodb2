import { Module } from '@nestjs/common';
import { ScrapperModule } from './scrapper/scrapper.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ScrapperModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [],
})
export class AppModule {}
