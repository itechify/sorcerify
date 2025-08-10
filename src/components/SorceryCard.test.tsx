import type {Card} from '@/api/cards'
import {render, screen} from '@/test-utils'
import {SorceryCard} from './SorceryCard'

const demoCard: Card = {
	name: 'Fire Drake',
	guardian: {
		rarity: 'Elite',
		type: 'Minion',
		rulesText: 'Breathes (F)(1) and roars ①',
		cost: 3,
		attack: 4,
		defence: 3,
		life: null,
		thresholds: {air: 0, earth: 0, fire: 1, water: 0}
	},
	elements: 'Fire',
	subTypes: 'Dragon',
	sets: [
		{
			name: 'Alpha',
			releasedAt: '2023-01-01T00:00:00Z',
			metadata: {
				rarity: 'Elite',
				type: 'Minion',
				rulesText: 'Breathes (F)(1) and roars ①',
				cost: 3,
				attack: 4,
				defence: 3,
				life: null,
				thresholds: {air: 0, earth: 0, fire: 1, water: 0}
			},
			variants: [
				{
					slug: 'alpha-standard',
					finish: 'Standard',
					product: 'Booster',
					artist: 'Artist',
					flavorText: 'Flavor',
					typeText: 'Minion — Dragon'
				}
			]
		}
	]
}

describe('SorceryCard', () => {
	it('masks content until guessed then reveals pieces', () => {
		const guessed = new Set<string>()
		render(<SorceryCard card={demoCard} guessed={guessed} />)
		// Title and rules contain masked underscores; ensure at least one occurrence
		expect(screen.getAllByText(/_+ _+/).length).toBeGreaterThan(0)
		// Type masked placeholder present
		expect(screen.getAllByText(/_+ — _+/).length).toBeGreaterThan(0)
		// Stats masked pattern
		expect(screen.getByText('_/_')).toBeInTheDocument()
	})

	it('reveals all content when revealAll=true', () => {
		render(<SorceryCard card={demoCard} guessed={new Set()} revealAll={true} />)
		expect(screen.getByText('Fire Drake')).toBeInTheDocument()
		expect(screen.getByText('Minion — Dragon')).toBeInTheDocument()
		// stats visible
		expect(screen.getByText('4/3')).toBeInTheDocument()
		// cost bubble shows 3
		expect(screen.getAllByText('3')[0]).toBeInTheDocument()
	})
})
