import {useSuspenseQuery} from '@tanstack/react-query'
import {useEffect, useMemo, useState} from 'react'
import {type Card, getCards} from '@/api/cards'
import {GameBoard} from '@/components/GameBoard'
import {Head} from '@/components/Head'
import {InfoModal} from '@/components/InfoModal'
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

	// Streak management
	const [streak, setStreak] = useState<number>(() => {
		try {
			const raw = localStorage.getItem('sorcerify:streak')
			return raw ? Number(raw) || 0 : 0
		} catch {
			return 0
		}
	})
	const [infoOpen, setInfoOpen] = useState<boolean>(false)
	const [lastWinDate, setLastWinDate] = useState<string | null>(() => {
		try {
			return localStorage.getItem('sorcerify:lastWinDate')
		} catch {
			return null
		}
	})

	useEffect(() => {
		try {
			localStorage.setItem('sorcerify:streak', String(streak))
			if (lastWinDate != null) {
				localStorage.setItem('sorcerify:lastWinDate', lastWinDate)
			}
		} catch {
			// ignore
		}
	}, [streak, lastWinDate])

	function handleWinToday() {
		// If already recorded win for today, do nothing
		if (lastWinDate === todayKey) return
		// If last win was yesterday (UTC), increment, else reset to 1
		const yesterday = (() => {
			const d = new Date()
			// derive yesterday in UTC by subtracting one day and then formatting UTC
			d.setUTCDate(d.getUTCDate() - 1)
			return formatUtcDateKey(d)
		})()
		const nextStreak = lastWinDate === yesterday ? streak + 1 : 1
		setStreak(nextStreak)
		setLastWinDate(todayKey)
		// Broadcast streak change for listeners (e.g., NavBar)
		try {
			window.dispatchEvent(
				new CustomEvent('sorcerify:streak-updated', {
					detail: {streak: nextStreak, lastWinDate: todayKey}
				})
			)
		} catch {
			// ignore
		}
	}

	function handleLoseToday() {
		// Only reset if we haven't already recorded a result for today
		if (lastWinDate === todayKey) return
		setStreak(0)
		try {
			window.dispatchEvent(
				new CustomEvent('sorcerify:streak-updated', {
					detail: {streak: 0, lastWinDate}
				})
			)
		} catch {
			// ignore
		}
	}

	return (
		<>
			<Head title={`Sorcerify — Daily (${todayKey})`} />
			<NavBar />
			<div className='relative pt-4 px-4 pb-8 w-full'>
				<button
					aria-label='How to play'
					className='absolute right-4 top-4 rounded-full border-0 bg-transparent p-2 text-slate-200 hover:bg-slate-900/30 active:bg-slate-900/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 cursor-pointer'
					onClick={() => setInfoOpen(true)}
					type='button'
				>
					<svg
						aria-hidden='true'
						className='h-5 w-5'
						viewBox='0 0 24 24'
						xmlns='http://www.w3.org/2000/svg'
					>
						<title>Info</title>
						<circle cx='12' cy='12' fill='#9ca3af' r='10' />
						<rect fill='#0f172a' height='7' rx='1' width='2' x='11' y='10.5' />
						<circle cx='12' cy='8' fill='#0f172a' r='1.25' />
					</svg>
				</button>
				<div className='mx-auto flex flex-col items-center gap-2 w-full max-w-3xl'>
					<img
						alt='Sorcerify'
						className='h-auto w-full max-w-md'
						height='120'
						src='/logo.png'
						width='420'
					/>
					<p className='text-sm text-slate-400 text-center'>
						Daily card for {todayKey} (UTC)
					</p>
					<GameBoard
						allCardNames={allCardNames}
						card={card}
						key={todayKey}
						onLose={handleLoseToday}
						onWin={handleWinToday}
						persistKey={todayKey}
					/>
					<p className='text-xs text-slate-500 text-center'>
						Come back tomorrow for a new daily card.
					</p>
				</div>
			</div>
			<InfoModal onClose={() => setInfoOpen(false)} open={infoOpen} />
		</>
	)
}
