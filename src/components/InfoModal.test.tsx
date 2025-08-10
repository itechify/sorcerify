import {vi} from 'vitest'
import {render, screen} from '@/test-utils'
import {InfoModal} from './InfoModal'

describe('InfoModal', () => {
	it('does not render when closed', () => {
		const onClose = vi.fn()
		const {container} = render(<InfoModal onClose={onClose} open={false} />)
		expect(container).toBeEmptyDOMElement()
	})

	it('renders content when open and closes on overlay click', async () => {
		const onClose = vi.fn()
		const {user} = render(<InfoModal onClose={onClose} open={true} />)
		expect(
			screen.getByRole('dialog', {name: /How to play Sorcerify/i})
		).toBeInTheDocument()
		await user.click(screen.getByRole('button', {name: /Close modal/i}))
		expect(onClose).toHaveBeenCalled()
	})
})
