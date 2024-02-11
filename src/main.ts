import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
}

bootstrap()
  .then(() => console.log(`Up and running at http://localhost:${PORT} 🔥🔥🔥`))
  .catch((error) => {
    console.error('something broke', error);
  });
