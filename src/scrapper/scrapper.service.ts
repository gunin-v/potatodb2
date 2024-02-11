import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer-core';

@Injectable()
export class ScrapperService {
  async getProducts() {
    const browser = await puppeteer.launch();

    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(2 * 60 * 1000);
      await Promise.all([
        page.waitForNavigation(),
        page.goto(
          'https://magnit.ru/search/?term=%D0%BA%D0%B0%D1%80%D1%82%D0%BE%D1%88%D0%BA%D0%B0',
        ),
      ]);

      return await page.$$eval('.catalog-page__product-grid', (items) => {
        console.log(items);
        return JSON.stringify(items);
      });
    } finally {
      await browser.disconnect();
    }
  }
}
