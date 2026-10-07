import {vi} from 'vitest'
import type {Card} from '@/api/cards'
import {render, screen, within} from '@/test-utils'
import {GameBoard} from './GameBoard'

const card: Card = {
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
	sets: []
}

describe('GameBoard guess flow', () => {
	beforeEach(() => localStorage.clear())

	it('keeps excess input visible, rejects it, and allows a complete name with keyboard submission', async () => {
		const onWin = vi.fn()
		const {user} = render(
			<GameBoard allCardNames={[card.name]} card={card} onWin={onWin} />
		)
		await user.click(screen.getByRole('button', {name: 'Guess card'}))
		const dialog = within(screen.getByRole('dialog'))
		const input = dialog.getByRole('textbox', {name: 'Card name'})
		await user.type(input, 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
		expect(input).toHaveValue('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
		expect(dialog.getByRole('button', {name: 'Guess card'})).toBeDisabled()
		await user.keyboard('{Enter}')
		expect(screen.getByText('Guesses left:', {exact: false})).toHaveTextContent(
			'Guesses left: 7'
		)
		await user.clear(input)
		await user.type(input, 'Alpha—Wolf{Enter}')
		expect(onWin).toHaveBeenCalledOnce()
		expect(screen.getByText('You named the card!')).toBeInTheDocument()
		expect(screen.queryByRole('button', {name: 'A'})).not.toBeInTheDocument()
		expect(screen.getByRole('button', {name: 'Results'})).toBeEnabled()
	})

	it('reports wrong and repeated names without charging another guess for a repeat', async () => {
		const {user} = render(<GameBoard allCardNames={[card.name]} card={card} />)
		await user.click(screen.getByRole('button', {name: 'Guess card'}))
		await user.type(
			screen.getByRole('textbox', {name: 'Card name'}),
			'OmegaBear{Enter}'
		)
		expect(screen.getByRole('status')).toHaveTextContent(
			'“OmegaBear” is not the card. One guess used.'
		)
		await user.click(screen.getByRole('button', {name: 'Guess card'}))
		await user.type(
			screen.getByRole('textbox', {name: 'Card name'}),
			'OmegaBear{Enter}'
		)
		expect(screen.getByRole('status')).toHaveTextContent(
			'You already tried “OmegaBear”. No guess used.'
		)
		expect(screen.getByText('Guesses left:', {exact: false})).toHaveTextContent(
			'Guesses left: 6'
		)
	})

	it('announces the final-name-only rule and completes a loss with results instead of dead controls', async () => {
		const onLose = vi.fn()
		const {user} = render(
			<GameBoard allCardNames={[card.name]} card={card} onLose={onLose} />
		)
		await user.keyboard('abcdef')
		expect(screen.getByRole('status')).toHaveTextContent(
			'Final guess — name the card.'
		)
		expect(screen.getByRole('button', {name: 'G'})).toBeDisabled()
		await user.click(screen.getByRole('button', {name: 'Guess card'}))
		await user.type(
			screen.getByRole('textbox', {name: 'Card name'}),
			'OmegaBear{Enter}'
		)
		expect(onLose).toHaveBeenCalledOnce()
		expect(screen.getByRole('status')).toHaveTextContent(
			'No guesses left. The card was Alpha Wolf.'
		)
		expect(
			screen.queryByRole('button', {name: 'Guess card'})
		).not.toBeInTheDocument()
		await user.click(screen.getByRole('button', {name: 'Results'}))
		expect(
			screen.getByRole('heading', {name: 'Practice Results'})
		).toBeInTheDocument()
	})
})
