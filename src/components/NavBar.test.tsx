import {render, screen, waitFor} from '@/test-utils'
import {NavBar} from './NavBar'

describe('NavBar', () => {
	beforeEach(() => {
		localStorage.clear()
	})

	it('renders links and initial streak from localStorage', () => {
		localStorage.setItem('sorcerify:streak', '3')
		render(<NavBar />)
		expect(screen.getByRole('link', {name: /Daily/i})).toBeInTheDocument()
		expect(screen.getByRole('link', {name: /Practice/i})).toBeInTheDocument()
		const valueEl = document.querySelector('.tabular-nums')
		expect(valueEl).not.toBeNull()
		expect(valueEl?.textContent).toBe('3')
	})

	it('updates on custom streak-updated event', async () => {
		render(<NavBar />)
		window.dispatchEvent(
			new CustomEvent('sorcerify:streak-updated', {detail: {streak: 5}})
		)
		await waitFor(() => {
			const valueEl = document.querySelector('.tabular-nums')
			expect(valueEl?.textContent).toBe('5')
		})
	})

	it('updates on storage event changes', async () => {
		render(<NavBar />)
		localStorage.setItem('sorcerify:streak', '7')
		window.dispatchEvent(new Event('storage'))
		await waitFor(() => {
			const valueEl = document.querySelector('.tabular-nums')
			expect(valueEl?.textContent).toBe('7')
		})
	})
})
