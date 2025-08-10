import {vi} from 'vitest'
import {render, screen} from '@/test-utils'
import {Keyboard} from './Keyboard'

describe('Keyboard', () => {
	it('renders letters, digits and thresholds', () => {
		const onPress = vi.fn()
		render(
			<Keyboard
				correct={new Set()}
				disabled={false}
				incorrect={new Set()}
				onPress={onPress}
			/>
		)
		// Letters (by visible text)
		expect(screen.getByRole('button', {name: 'A'})).toBeInTheDocument()
		expect(screen.getByRole('button', {name: 'Z'})).toBeInTheDocument()
		// Digits
		expect(screen.getByRole('button', {name: '0'})).toBeInTheDocument()
		expect(screen.getByRole('button', {name: '9'})).toBeInTheDocument()
		// Threshold images present
		expect(screen.getByAltText('air threshold')).toBeInTheDocument()
		expect(screen.getByAltText('fire threshold')).toBeInTheDocument()
	})

	it('disables keys already guessed', () => {
		const correct = new Set(['a'])
		const incorrect = new Set(['b'])
		const mockPress = vi.fn()
		render(
			<Keyboard
				correct={correct}
				disabled={false}
				incorrect={incorrect}
				onPress={mockPress}
			/>
		)
		expect(screen.getByRole('button', {name: 'A'})).toBeDisabled()
		expect(screen.getByRole('button', {name: 'B'})).toBeDisabled()
	})

	it('calls onPress when enabled key clicked', async () => {
		const onPress = vi.fn()
		const {user} = render(
			<Keyboard
				correct={new Set()}
				disabled={false}
				incorrect={new Set()}
				onPress={onPress}
			/>
		)
		await user.click(screen.getByRole('button', {name: 'A'}))
		expect(onPress).toHaveBeenCalledWith('A')
	})
})
