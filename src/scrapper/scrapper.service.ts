import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';
import { Browser, executablePath, Page } from 'puppeteer';
import { MAGNIT_URL, PEREKRESTOK_URL } from './constants';
import { ParseResult } from './scrapper.types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

@Injectable()
export class ScrapperService {
  async getProductsFromMagnit(browser: Browser, products: string[]) {
    const page: Page = await browser.newPage();

    try {
      const context = browser.defaultBrowserContext();
      await context.overridePermissions(MAGNIT_URL, [
        'geolocation',
        'notifications',
      ]);

      console.log('navigating Magnit...');

      await Promise.all([page.waitForNavigation(), page.goto(MAGNIT_URL)]);

      console.log('searching...');

      const input = await page.$('input.new-header-search-form__input');
      await input?.click();
      await input?.type('картофель');

      const showMoreButton = await page.waitForSelector('.suggest__more', {
        timeout: 5000,
      });
      await showMoreButton?.click();

      await page.waitForSelector('.catalog-page__product-grid__search');

      const results: ParseResult = {};

      for (const product of products) {
        try {
          const priceElem = await page.waitForSelector(
            `xpath=.//div[contains(@class, 'new-card-product__title') and text()='${product}']/ancestor::div[contains(@class, 'new-card-product__wrap')]/descendant::div[contains(@class, 'new-card-product__price-regular')]`,
            { timeout: 2000 },
          );

          const weightElem = await page.waitForSelector(
            `xpath=.//div[contains(@class, 'new-card-product__title') and text()='${product}']/ancestor::div[contains(@class, 'new-card-product__wrap')]/descendant::div[contains(@class, 'new-card-product__weight')]`,
            { timeout: 2000 },
          );

          const priceString = await priceElem.evaluate(
            (item) => item.textContent,
          );

          const weightString = await weightElem.evaluate(
            (item) => item.textContent,
          );

          if (priceString) {
            let parsedPrice = parseFloat(
              priceString.replace(/[^\d.,]/g, '').replace(',', '.'),
            );

            if (weightString) {
              const parsedWeight = parseFloat(
                weightString.replace(/[^\d.,]/g, '').replace(',', '.'),
              );

              if (parsedWeight) {
                parsedPrice = parsedPrice / parsedWeight;
              }
            }
            results[product] = Number(parsedPrice.toFixed(2));
          }
        } catch {
          (e) => console.log(e);
        }
      }

      console.log(results);

      console.log(`done ${Object.keys(results).length} items`);

      return results;
    } finally {
      console.log('closing');
      await page.close();
    }
  }
  async getProductsFromPerekrestok(browser: Browser, products: string[]) {
    const page: Page = await browser.newPage();
    try {
      const context = browser.defaultBrowserContext();
      await context.overridePermissions(PEREKRESTOK_URL, [
        'geolocation',
        'notifications',
      ]);

      console.log('navigating Perekrestok...');
      await Promise.all([page.waitForNavigation(), page.goto(PEREKRESTOK_URL)]);

      console.log('searching...');

      const input = await page.$('input[name=search]');
      await input?.click();
      await input?.type('картофель');

      await page.waitForSelector('.search-suggest__items');

      const results: ParseResult = {};

      //TODO: хэндлить вес

      for (const product of products) {
        const priceElem = await page.waitForSelector(
          `xpath=//p[contains(@class, 'search-suggest__title-text') and text()='${product}']/ancestor::div[contains(@class, 'search-suggest__info')]/descendant::div[contains(@class, 'price-new')]`,
        );

        const priceString = await priceElem.evaluate(
          (item) => item.textContent,
        );

        if (priceString) {
          results[product] = parseFloat(
            priceString.replace(/[^\d.,]/g, '').replace(',', '.'),
          );
        }
      }

      console.log(`done ${Object.keys(results).length} items`);

      return results;
    } finally {
      console.log('closing');
      await page.close();
    }
  }

  async getProducts() {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath(),
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });

    console.log('created browser...');

    const perekresokResult = await this.getProductsFromPerekrestok(browser, [
      'Картофель',
      'Картофель мытый',
      'Картофель в сетке',
    ]);

    const magnitResult = await this.getProductsFromMagnit(browser, [
      'Картофель',
      'Картофель фасованный',
      'Картофель для жарки',
      'Картофель для варки',
    ]);

    console.log('closing browser...');
    await browser.close();

    console.log('done! 😱');

    return {
      date: new Date().toLocaleString('ru-RU'),
      perekrestok: perekresokResult,
      magnit: magnitResult,
    };
  }
}
