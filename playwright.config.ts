import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_BASE_URL = process.env.API_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
const WEB_BASE_URL = process.env.WEB_BASE_URL || 'https://www.saucedemo.com';

/**
 * Playwright Multi-Project Configuration for Group 67 SDET Automation Framework
 * Supporting dual-engine testing:
 *  - NestJS Ticket Booking API Backend (localhost:3000)
 *  - SauceDemo Swag Labs Web UI (https://www.saucedemo.com)
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // 1. API Testing Project (NestJS Backend)
    {
      name: 'api',
      testMatch: /.*tests\/api\/.*\.spec\.ts/,
      use: {
        baseURL: API_BASE_URL,
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },

    // 2. Web UI Testing Projects (SauceDemo Swag Labs)
    {
      name: 'chromium',
      testMatch: /.*tests\/e2e\/.*\.spec\.ts/,
      use: {
        baseURL: WEB_BASE_URL,
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'firefox',
      testMatch: /.*tests\/e2e\/.*\.spec\.ts/,
      use: {
        baseURL: WEB_BASE_URL,
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      testMatch: /.*tests\/e2e\/.*\.spec\.ts/,
      use: {
        baseURL: WEB_BASE_URL,
        ...devices['Desktop Safari'],
      },
    },

    // 3. Smoke / Healthcheck Project
    {
      name: 'smoke',
      testMatch: /.*tests\/smoke\/.*\.spec\.ts/,
      use: {
        baseURL: WEB_BASE_URL,
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
