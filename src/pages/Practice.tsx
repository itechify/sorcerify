import {useSuspenseQuery} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {type Card, getCards} from '@/api/cards'
import {GameBoard} from '@/components/GameBoard'
import {Head} from '@/components/Head'
// no router links needed here; NavBar handles navigation
import {NavBar} from '@/components/NavBar'

export function Practice() {
	const {data} = useSuspenseQuery({
		queryFn: getCards,
		queryKey: ['cards']
	})

	const [cardIndex, setCardIndex] = useState<number>(() =>
		Math.floor(Math.random() * data.length)
	)
	const card = useMemo<Card>(() => data[cardIndex] as Card, [data, cardIndex])
	const allCardNames = useMemo<string[]>(() => data.map(c => c.name), [data])

	function resetCard() {
		if (data.length <= 1) {
			setCardIndex(0)
			return
		}
		let next = Math.floor(Math.random() * data.length)
		if (next === cardIndex) {
			next = (next + 1) % data.length
		}
		setCardIndex(next)
	}

	return (
		<>
			<Head title='Sorcerify — Practice' />
			<NavBar />
			<div className='m-2 grid min-h-[calc(100vh-56px)] place-content-center'>
				<div className='flex flex-col items-center gap-4'>
					<button
						className='border border-slate-300 bg-white cursor-pointer px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100 active:bg-slate-200 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'
						onClick={resetCard}
						type='button'
					>
						Next Card
					</button>
					<GameBoard allCardNames={allCardNames} card={card} key={cardIndex} />
				</div>
			</div>
		</>
	)
}
