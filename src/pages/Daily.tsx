import {useSuspenseQuery} from '@tanstack/react-query'
import {useEffect, useMemo, useState} from 'react'
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

	// Streak management
	const [streak, setStreak] = useState<number>(() => {
		try {
			const raw = localStorage.getItem('sorcerify:streak')
			return raw ? Number(raw) || 0 : 0
		} catch {
			return 0
		}
	})
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
			<div className='grid min-h-[calc(100vh-56px)] content-start justify-items-center pt-4 bg-slate-950'>
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
					<GameBoard
						allCardNames={allCardNames}
						card={card}
						key={todayKey}
						onLose={handleLoseToday}
						onWin={handleWinToday}
						persistKey={todayKey}
					/>
					<p className='text-xs text-slate-500'>
						Come back tomorrow for a new daily card.
					</p>
				</div>
			</div>
		</>
	)
}
