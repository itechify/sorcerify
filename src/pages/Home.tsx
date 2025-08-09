import {useSuspenseQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {type Card, getCards} from '@/api/cards'
import {GameBoard} from '@/components/GameBoard'
import {Head} from '@/components/Head'

export function Home() {
	const {data} = useSuspenseQuery({
		queryFn: getCards,
		queryKey: ['cards']
	})

	// Pick one random card once per mount
	const [cardIndex] = useState<number>(() =>
		Math.floor(Math.random() * data.length)
	)
	const card = useMemo<Card>(() => data[cardIndex] as Card, [data, cardIndex])

	return (
		<>
			<Head title='Sorcerify' />
			<div className='m-2 grid min-h-screen place-content-center'>
				{card && <GameBoard card={card} />}
			</div>
		</>
	)
}
