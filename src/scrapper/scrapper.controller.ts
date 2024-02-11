import { Controller, Get } from '@nestjs/common';
import { ScrapperService } from './scrapper.service';

@Controller('scrapper')
export class ScrapperController {
  constructor(private readonly scrapperService: ScrapperService) {}
  @Get()
  getProducts() {
    return this.scrapperService.getProducts();
  }
}
