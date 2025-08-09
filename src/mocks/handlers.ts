import {delay, HttpResponse, http} from 'msw'
import cards from './data/cards.json' with {type: 'json'}

export const handlers = [
	http.get('/cards', async () => {
		await delay('real')
		return HttpResponse.json(cards)
	})
]
