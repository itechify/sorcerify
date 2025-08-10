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
	const [streak, setStreak] = useState<number>(0)
	const [roundEnded, setRoundEnded] = useState<boolean>(false)

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
		setRoundEnded(false)
	}

	return (
		<>
			<Head title='Sorcerify — Practice' />
			<NavBar />
			<div className='min-h-[calc(100vh-56px)] pt-4 px-4 pb-8 w-full'>
				<div className='mx-auto flex flex-col items-center gap-3 w-full max-w-3xl'>
					<img
						alt='Sorcerify'
						className='h-auto w-full max-w-md'
						height='120'
						src='/logo.png'
						width='420'
					/>
					<div className='rounded-md bg-green-600/10 px-3 py-1 text-sm font-semibold text-green-200'>
						Win streak: <span className='tabular-nums'>{streak}</span>
					</div>
					{roundEnded && (
						<button
							className='mt-1 border border-slate-300 bg-white cursor-pointer px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100 active:bg-slate-200 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'
							onClick={resetCard}
							type='button'
						>
							Next Card
						</button>
					)}
					<GameBoard
						allCardNames={allCardNames}
						card={card}
						key={cardIndex}
						onLose={() => {
							setStreak(0)
							setRoundEnded(true)
						}}
						onWin={() => {
							setStreak(prev => prev + 1)
							setRoundEnded(true)
						}}
					/>
				</div>
			</div>
		</>
	)
}
