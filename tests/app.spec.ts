import {expect, test} from '@playwright/test'

const DAILY_URL_RE = /\/daily$/
const DAILY_TEXT_RE = /Daily card for \d{4}-\d{2}-\d{2} \(UTC\)/
const PRACTICE_URL_RE = /\/practice$/
const GUESSES_LEFT_7_RE = /Guesses left:\s*7/
const GUESSES_LEFT_6_RE = /Guesses left:\s*6/

test('redirects to Daily and opens/closes the info modal', async ({page}) => {
	await page.goto('/')

	await expect(page).toHaveURL(DAILY_URL_RE)

	await expect(page.getByText(DAILY_TEXT_RE)).toBeVisible()

	await page.getByRole('button', {name: 'How to play'}).click()

	const dialog = page.getByRole('dialog')
	await expect(dialog).toBeVisible()
	await expect(
		page.getByRole('heading', {name: 'How to play Sorcerify'})
	).toBeVisible()

	await dialog.getByRole('button', {name: 'Close'}).click()
	await expect(dialog).toHaveCount(0)
})

test('navigate to Practice and make a guess with on-screen keyboard', async ({
	page
}) => {
	await page.goto('/')

	await page.getByRole('link', {name: 'Practice'}).click()
	await expect(page).toHaveURL(PRACTICE_URL_RE)

	await expect(page.getByText('Win streak:')).toBeVisible()

	await expect(page.getByRole('button', {name: 'Guess card'})).toBeEnabled()

	await expect(page.getByText(GUESSES_LEFT_7_RE)).toBeVisible()
	await page.getByRole('button', {name: 'Z'}).click()
	await expect(page.getByText(GUESSES_LEFT_6_RE)).toBeVisible()
})

test('help stays within a small phone and its close control stays reachable after scrolling', async ({
	page
}) => {
	await page.setViewportSize({width: 320, height: 568})
	await page.goto('/daily')
	await page.getByRole('button', {name: 'How to play'}).click()
	const dialog = page.getByRole('dialog')
	const bounds = await dialog.boundingBox()
	expect(bounds).not.toBeNull()
	expect(bounds?.y).toBeGreaterThanOrEqual(0)
	expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(568)
	await dialog.locator('[data-slot="dialog-body"]').evaluate(element => {
		element.scrollTop = element.scrollHeight
	})
	await expect(dialog.getByRole('button', {name: 'Close'})).toBeInViewport()
	await dialog.getByRole('button', {name: 'Close'}).click()
	await expect(dialog).toHaveCount(0)
})
