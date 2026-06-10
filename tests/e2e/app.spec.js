import fs from 'node:fs/promises';

import { expect, test } from '@playwright/test';

async function openDeveloperTools(page) {
  await page
    .getByRole('button', { name: /\+?Show Developer Tools \(Advanced\)/ })
    .click();
  await expect(page.getByText('AST INSPECTOR')).toBeVisible();
}

test('boots with the starter template and rendered preview', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.getByText('MCL Studio')).toBeVisible();
  await expect(page.getByLabel('Layout editor')).toHaveValue(/# Welcome/);
  await expect(
    page.getByRole('button', { name: 'Welcome', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Hide Layout Boundaries' }),
  ).toBeVisible();
});

test('switches templates and reparses the preview cleanly', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByLabel('Layout template').selectOption('dashboard');
  await page.getByRole('button', { name: 'Load Template' }).click();
  await expect(
    page.getByRole('button', { name: 'Main Content', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.preview-col')).toHaveCount(2);

  await page.getByLabel('Layout template').selectOption('documentation');
  await page.getByRole('button', { name: 'Load Template' }).click();
  await expect(
    page.getByRole('button', { name: 'Documentation Page' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Overview', exact: true }),
  ).toBeVisible();
});

test('keeps AST graph and preview selection synchronized', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Layout template').selectOption('dashboard');
  await page.getByRole('button', { name: 'Load Template' }).click();

  await openDeveloperTools(page);
  await page.getByRole('button', { name: 'col width=30' }).click();

  await expect(
    page.locator('.preview-col.preview-node-selected-col'),
  ).toHaveCount(1);
  await expect(page.getByText(/COL 30% • lines \d+-\d+/)).toBeVisible();
});

test('exports the current AST as ast.json', async ({ page }) => {
  await page.goto('/');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export AST' }).click(),
  ]);

  expect(download.suggestedFilename()).toBe('ast.json');

  const filePath = await download.path();
  const rawContent = await fs.readFile(filePath, 'utf8');
  const ast = JSON.parse(rawContent);

  expect(ast).toMatchObject({
    type: 'root',
    children: [
      {
        type: 'row',
      },
    ],
  });
});

test('restores editor content after reload and resets back to starter state', async ({
  page,
}) => {
  await page.goto('/');

  const editor = page.getByLabel('Layout editor');
  await editor.fill('# Persisted');
  await expect(page.getByRole('button', { name: 'Persisted' })).toBeVisible();

  await page.reload();

  await expect(page.getByLabel('Layout editor')).toHaveValue('# Persisted');
  await expect(page.getByRole('button', { name: 'Persisted' })).toBeVisible();

  await page.getByRole('button', { name: 'Reset Workspace' }).click();
  await expect(page.getByLabel('Layout editor')).toHaveValue(
    /Describe your layout here\./,
  );
  await expect(
    page.getByRole('button', { name: 'Welcome', exact: true }),
  ).toBeVisible();
});

test('falls back safely when storage access throws', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.addInitScript(() => {
    const explodingStorage = {
      getItem() {
        throw new Error('storage disabled');
      },
      setItem() {
        throw new Error('storage disabled');
      },
      removeItem() {
        throw new Error('storage disabled');
      },
    };

    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: explodingStorage,
    });
  });

  await page.goto('/');

  await expect(page.getByText('MCL Studio')).toBeVisible();
  await expect(page.getByLabel('Layout editor')).toHaveValue(/# Welcome/);
  await expect(
    page.getByRole('button', { name: 'Welcome', exact: true }),
  ).toBeVisible();

  await context.close();
});

test('supports keyboard access across advanced controls', async ({ page }) => {
  await page.goto('/');
  await openDeveloperTools(page);

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Graph' })).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Outline' })).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('button', { name: 'root' }).first(),
  ).toBeFocused();
});
