import 'expect-playwright';
import { chromium, ChromiumBrowser, Page } from 'playwright-chromium';
import { KiteClient, KitePromise, KiteRequest } from 'src/index.js';
import { server } from './server';
import { delay } from './time';

const PWDEBUG = Boolean(process.env.PWDEBUG);

let browser: ChromiumBrowser;
let page: Page;

declare global {
  interface Window {
    kite: KiteClient;
    KiteClient: typeof KiteClient;
    KiteRequest: typeof KiteRequest;
    KitePromise: typeof KitePromise;
    delay: typeof delay;
  }
}
const ESM_SCRIPT_TAG = {
  type: 'module',
  content: `
		import {KiteClient, KiteRequest, KitePromise} from '/lib/index.js';
		import kite from '/lib/client.js';
		globalThis.kite = kite;
		globalThis.KiteClient = KiteClient;
		globalThis.KiteRequest = KiteRequest;
		globalThis.KitePromise = KitePromise;
		globalThis.delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	`,
};

beforeAll(async () => {
  browser = await chromium.launch({
    devtools: PWDEBUG,
    // logger: {
    //   isEnabled: (name, severity) => true,
    //   log: (name, severity, message, args) => console.log(`[${severity}] ${name} ${message}`),
    // },
  });
});
afterAll(async () => {
  await browser.close();
});
beforeEach(async () => {
  page = await browser.newPage();
  await page.goto(server.url);
  await page.addScriptTag(ESM_SCRIPT_TAG);
  await page.waitForFunction(() => typeof window.kite !== 'undefined');
});
afterEach(async () => {
  await page.pause();
  await page.close();
});

export { browser, page };
