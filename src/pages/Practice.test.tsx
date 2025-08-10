import {useEffect, useRef} from 'react'
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

describe('Practice', () => {
	beforeEach(() => {
		vi.resetModules()
		localStorage.clear()
	})

	it('renders with initial streak text', async () => {
		vi.doMock('@/components/GameBoard', () => ({
			// biome-ignore lint: PascalCase export name required to match module
			GameBoard: () => <div>GameBoard</div>
		}))
		const {Practice} = await import('./Practice')
		render(<Practice />)
		const streakEl = await screen.findByText(/Win streak:/)
		expect(streakEl).toHaveTextContent(/Win streak:\s*0/)
	})

	it('increments streak on win', async () => {
		vi.doMock('@/components/GameBoard', () => ({
			// biome-ignore lint: PascalCase export name required to match module
			GameBoard: ({onWin}: {onWin?: () => void}) => {
				const calledRef = useRef(false)
				useEffect(() => {
					if (!calledRef.current) {
						calledRef.current = true
						onWin?.()
					}
				}, [onWin])
				return <div>GameBoard</div>
			}
		}))
		const {Practice} = await import('./Practice')
		render(<Practice />)
		const streakEl = await screen.findByText(/Win streak:/)
		await waitFor(() => {
			expect(streakEl).toHaveTextContent(/Win streak:\s*1/)
		})
	})

	it('resets streak on lose', async () => {
		vi.doMock('@/components/GameBoard', () => ({
			// biome-ignore lint: PascalCase export name required to match module
			GameBoard: ({onLose}: {onLose?: () => void}) => {
				const calledRef = useRef(false)
				useEffect(() => {
					if (!calledRef.current) {
						calledRef.current = true
						onLose?.()
					}
				}, [onLose])
				return <div>GameBoard</div>
			}
		}))
		const {Practice} = await import('./Practice')
		render(<Practice />)
		const streakEl = await screen.findByText(/Win streak:/)
		await waitFor(() => {
			expect(streakEl).toHaveTextContent(/Win streak:\s*0/)
		})
	})
})
