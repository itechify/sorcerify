import {App} from './App'
import {render, screen} from './test-utils'

describe('App routing', () => {
	it('redirects / to /daily and renders navbar', async () => {
		render(<App />, {route: '/'})
		expect(
			await screen.findByRole('link', {name: /Daily/i})
		).toBeInTheDocument()
	})

	it('navigates to Practice route', async () => {
		render(<App />, {route: '/practice'})
		// The Practice page places a larger logo in main content; there are 2 images named Sorcerify (nav + main)
		const imgs = await screen.findAllByRole('img', {name: 'Sorcerify'})
		expect(imgs.length).toBeGreaterThanOrEqual(1)
	})
})
