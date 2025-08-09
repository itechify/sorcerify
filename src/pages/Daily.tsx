import {useSuspenseQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import {type Card, getCards} from '@/api/cards'
import {GameBoard} from '@/components/GameBoard'
import {Head} from '@/components/Head'
// no router links needed here; NavBar handles navigation
import {NavBar} from '@/components/NavBar'

function formatUtcDateKey(date: Date): string {
	const y = date.getUTCFullYear()
	const m = String(date.getUTCMonth() + 1).padStart(2, '0')
	const d = String(date.getUTCDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

function hashStringToNumber(input: string): number {
	// Simple polynomial rolling hash without bitwise operations
	// modulus is a large prime below Number.MAX_SAFE_INTEGER
	const modPrime = 9_007_199_254_740_881
	const baseMultiplier = 131
	let hash = 0
	for (let i = 0; i < input.length; i++) {
		hash = (hash * baseMultiplier + input.charCodeAt(i)) % modPrime
	}
	return hash
}

export function Daily() {
	const {data} = useSuspenseQuery({
		queryFn: getCards,
		queryKey: ['cards']
	})

	const todayKey = useMemo(() => formatUtcDateKey(new Date()), [])

	const cardIndex = useMemo(() => {
		if (data.length === 0) return 0
		const hash = hashStringToNumber(todayKey)
		return hash % data.length
	}, [data.length, todayKey])

	const card = useMemo<Card>(() => data[cardIndex] as Card, [data, cardIndex])
	const allCardNames = useMemo<string[]>(() => data.map(c => c.name), [data])

	return (
		<>
			<Head title={`Sorcerify — Daily (${todayKey})`} />
			<NavBar />
			<div className='m-2 grid min-h-[calc(100vh-56px)] content-start justify-items-center pt-4'>
				<div className='flex flex-col items-center gap-2'>
					<img
						alt='Sorcerify'
						className='h-auto max-w-full'
						height='120'
						src='/logo.png'
						width='420'
					/>
					<p className='text-sm text-slate-600'>
						Daily card for {todayKey} (UTC)
					</p>
					<GameBoard allCardNames={allCardNames} card={card} key={todayKey} />
					<p className='text-xs text-slate-500'>
						Come back tomorrow for a new daily card.
					</p>
				</div>
			</div>
		</>
	)
}
