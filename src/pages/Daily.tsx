import {useSuspenseQuery} from '@tanstack/react-query'
import {useEffect, useMemo, useState} from 'react'
import {type Card, getCards} from '@/api/cards'
import {GameBoard} from '@/components/GameBoard'
import {Head} from '@/components/Head'
import {InfoModal} from '@/components/InfoModal'
import {Button} from '@/components/ui/button'

function formatUtcDateKey(date: Date): string {
	const y = date.getUTCFullYear()
	const m = String(date.getUTCMonth() + 1).padStart(2, '0')
	const d = String(date.getUTCDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

// Deterministic RNG and permutation helpers for non-repeating daily selection

const getUtcDayNumber = (date: Date): number => {
	// Number of whole days since Unix epoch (UTC)
	const utcMidnight = Date.UTC(
		date.getUTCFullYear(),
		date.getUTCMonth(),
		date.getUTCDate()
	)
	return Math.floor(utcMidnight / 86_400_000)
}

// String → 64-bit seed using polynomial rolling hash in 64-bit space
const hashStringTo64Bit = (seedString: string): bigint => {
	const mod64 = 2n ** 64n
	const base = 131n
	let h = 1_469_598_103_934_665_603n // non-zero start
	for (let i = 0; i < seedString.length; i++) {
		h = (h * base + BigInt(seedString.charCodeAt(i))) % mod64
	}
	if (h === 0n) return 1n
	return h
}

// 64-bit LCG (LCG64) producing a [0,1) double without bitwise operations
const createLcg64 = (seedString: string): (() => number) => {
	const mod64 = 2n ** 64n
	const lcgA = 6_364_136_223_846_793_005n
	const lcgC = 1_442_695_040_888_963_407n
	const scale = mod64 / 2n ** 53n // to extract top 53 bits
	let state = hashStringTo64Bit(seedString)
	return () => {
		state = (lcgA * state + lcgC) % mod64
		const top53 = state / scale
		return Number(top53) / 2 ** 53
	}
}

const buildDeterministicPermutation = (
	length: number,
	seedString: string
): number[] => {
	const rng = createLcg64(seedString)
	const arr = Array.from({length}, (_, i) => i)
	// Fisher-Yates shuffle
	for (let i = length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1))
		const valueAtI = arr[i]
		const valueAtJ = arr[j]
		if (valueAtI === undefined || valueAtJ === undefined) continue
		arr[i] = valueAtJ
		arr[j] = valueAtI
	}
	return arr
}

export function Daily() {
	const {data} = useSuspenseQuery({
		queryFn: getCards,
		queryKey: ['cards']
	})

	const today = useMemo(() => new Date(), [])
	const todayKey = useMemo(() => formatUtcDateKey(today), [today])

	// Create a deterministic, non-repeating order of cards and walk it by day number
	const cardIndex = useMemo(() => {
		const total = data.length
		if (total === 0) return 0
		// Seed ties the permutation to current card set size and a stable string
		const permutation = buildDeterministicPermutation(
			total,
			`sorcerify-daily-v1|count:${total}`
		)
		const dayNumber = getUtcDayNumber(today)
		const pos = dayNumber % total
		const chosen = permutation[pos]
		return chosen ?? 0
	}, [data.length, today])

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
			<div className='relative pt-4 px-4 pb-8 w-full'>
				<Button
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
				</Button>
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
						autoOpenResultsOnWin={true}
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
