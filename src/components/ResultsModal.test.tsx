import {vi} from 'vitest'
import {render, screen} from '@/test-utils'
import {ResultsModal} from './ResultsModal'

describe('Results sharing', () => {
	it('offers the unchanged share text after clipboard denial and recovers on retry', async () => {
		const {user} = render(
			<ResultsModal
				cardName='Alpha Wolf'
				hasWon={true}
				onClose={vi.fn()}
				open={true}
				persistKey='2026-10-06'
				results={['correct', 'incorrect', 'correct']}
			/>
		)
		const writeText = vi
			.spyOn(navigator.clipboard, 'writeText')
			.mockRejectedValueOnce(new Error('Permission denied'))
			.mockResolvedValueOnce(undefined)
		await user.click(screen.getByRole('button', {name: 'Share'}))
		expect(screen.getByRole('status')).toHaveTextContent(
			'Could not copy your result.'
		)
		expect(screen.getByRole('textbox', {name: 'Share text'})).toHaveValue(
			'Sorcerify 2026-10-06\n🟩🟥✅\nhttps://sorcerify.com'
		)
		await user.click(screen.getByRole('button', {name: 'Try copy again'}))
		expect(writeText).toHaveBeenLastCalledWith(
			'Sorcerify 2026-10-06\n🟩🟥✅\nhttps://sorcerify.com'
		)
		expect(screen.getByRole('status')).toHaveTextContent(
			'Result copied to clipboard.'
		)
		expect(
			screen.queryByRole('textbox', {name: 'Share text'})
		).not.toBeInTheDocument()
		writeText.mockRestore()
	})
})
