import { expect, test } from "@playwright/test";

const DAILY_URL_RE = /\/daily$/;
const DAILY_TEXT_RE = /Daily card for \d{4}-\d{2}-\d{2} \(UTC\)/;
const PRACTICE_URL_RE = /\/practice$/;
const GUESSES_LEFT_7_RE = /Guesses left:\s*7/;
const GUESSES_LEFT_6_RE = /Guesses left:\s*6/;

test("redirects to Daily and opens/closes the info modal", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(DAILY_URL_RE);

  await expect(page.getByText(DAILY_TEXT_RE)).toBeVisible();

  await page.getByRole("button", { name: "How to play" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "How to play Sorcerify" })
  ).toBeVisible();

  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toHaveCount(0);
});

test("navigate to Practice and make a guess with on-screen keyboard", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Practice" }).click();
  await expect(page).toHaveURL(PRACTICE_URL_RE);

  await expect(page.getByText("Win streak:")).toBeVisible();

  await expect(page.getByRole("button", { name: "Guess name" })).toBeDisabled();

  await expect(page.getByText(GUESSES_LEFT_7_RE)).toBeVisible();
  await page.getByRole("button", { name: "Z" }).click();
  await expect(page.getByText(GUESSES_LEFT_6_RE)).toBeVisible();
});
