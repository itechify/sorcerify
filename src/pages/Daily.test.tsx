import {useEffect} from 'react'
import {vi} from 'vitest'
import type {Card} from '@/api/cards'
import {render, screen, waitFor} from '@/test-utils'

const sampleCards: Card[] = [
	{
		name: 'Alpha Wolf',
		guardian: {
			rarity: 'Ordinary',
			type: 'Minion',
			rulesText: 'Pack tactics',
			cost: 1,
			attack: 1,
			defence: 1,
			life: null,
			thresholds: {air: 0, earth: 1, fire: 0, water: 0}
		},
		elements: 'Earth',
		subTypes: 'Beast',
		sets: [
			{
				name: 'Alpha',
				releasedAt: '2023-01-01T00:00:00Z',
				metadata: {
					rarity: 'Ordinary',
					type: 'Minion',
					rulesText: 'Pack tactics',
					cost: 1,
					attack: 1,
					defence: 1,
					life: null,
					thresholds: {air: 0, earth: 1, fire: 0, water: 0}
				},
				variants: [
					{
						slug: 'alpha-wolf',
						finish: 'Standard',
						product: 'Booster',
						artist: 'Artist',
						flavorText: 'Howl',
						typeText: 'Minion — Beast'
					}
				]
			}
		]
	}
]

vi.mock('@/api/cards', () => ({
	getCards: () => Promise.resolve(sampleCards)
}))

describe('Daily', () => {
	beforeEach(() => {
		localStorage.clear()
		vi.resetModules()
	})

	it('renders with today key text', async () => {
		const {Daily} = await import('./Daily')
		render(<Daily />)
		expect(await screen.findByText(/Daily card for/)).toBeInTheDocument()
	})

	it('increments streak on win and persists', async () => {
		vi.mock('@/components/GameBoard', () => ({
			// biome-ignore lint: PascalCase export name required to match module
			GameBoard: ({onWin}: {onWin?: () => void}) => {
				useEffect(() => {
					onWin?.()
				}, [onWin])
				return <div>GameBoard</div>
			}
		}))
		const {Daily} = await import('./Daily')
		render(<Daily />)
		await screen.findByText(/Daily card for/)
		await waitFor(() => {
			expect(localStorage.getItem('sorcerify:streak')).toBe('1')
			expect(localStorage.getItem('sorcerify:lastWinDate')).toMatch(
				/\d{4}-\d{2}-\d{2}/
			)
		})
	})

	it('resets streak on lose (if not already won today)', async () => {
		vi.doMock('@/components/GameBoard', () => ({
			// biome-ignore lint: PascalCase export name required to match module
			GameBoard: ({onLose}: {onLose?: () => void}) => {
				useEffect(() => {
					onLose?.()
				}, [onLose])
				return <div>GameBoard</div>
			}
		}))
		const {Daily} = await import('./Daily')
		render(<Daily />)
		await screen.findByText(/Daily card for/)
		await waitFor(() => {
			expect(localStorage.getItem('sorcerify:streak')).toBe('0')
		})
	})
})
