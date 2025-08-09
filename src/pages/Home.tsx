import {useSuspenseQuery} from '@tanstack/react-query'
import {getCards} from '@/api/cards'
import {Head} from '@/components/Head'
import {SorceryCard} from '@/components/SorceryCard'

export function Home() {
	const {data} = useSuspenseQuery({
		queryFn: getCards,
		queryKey: ['cards']
	})

	// pick one random card from the array
	const randomCard = data[Math.floor(Math.random() * data.length)]

	return (
		<>
			<Head title='Sorcerify' />
			<div className='m-2 grid min-h-screen place-content-center'>
				{randomCard && (
					<SorceryCard
						card={randomCard}
						key={`Card-${randomCard.name}-${Math.random()}`}
					/>
				)}
			</div>
		</>
	)
}
