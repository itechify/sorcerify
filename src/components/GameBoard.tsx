import {useCallback, useEffect, useMemo, useState} from 'react'
import type {Card} from '@/api/cards'
import {Keyboard} from '@/components/Keyboard'
import {SorceryCard} from '@/components/SorceryCard'

// Top-level constants for performance (linter preference)
// Normalize threshold emojis by stripping variation selectors; allow both forms from UI
const THRESHOLD_EMOJIS = ['💨', '⛰️', '🔥', '💧']
const THRESHOLD_EMOJI_MAP = {
	air: '💨',
	earth: '⛰️',
	fire: '🔥',
	water: '💧'
} as const
const LETTER_RE = /[a-zA-Z]/
const VS_REGEX = /\uFE0E|\uFE0F/g
const ALNUM_RE = /[a-zA-Z0-9]/
const SINGLE_ALNUM_RE = /^[a-zA-Z0-9]$/

export function GameBoard({card}: {card: Card}) {
	const [guessed, setGuessed] = useState<Set<string>>(() => new Set())
	const [correct, setCorrect] = useState<Set<string>>(() => new Set())
	const [incorrect, setIncorrect] = useState<Set<string>>(() => new Set())
	const [remaining, setRemaining] = useState<number>(5)
	const maskableEmojiSet = useMemo(() => new Set(THRESHOLD_EMOJIS), [])

	const normalizeCharForGuessing = useCallback((char: string): string => {
		if (LETTER_RE.test(char)) return char.toLowerCase()
		return char.replace(VS_REGEX, '')
	}, [])

	const isMaskableChar = useCallback(
		(char: string): boolean =>
			ALNUM_RE.test(char) || maskableEmojiSet.has(char.replace(VS_REGEX, '')),
		[maskableEmojiSet]
	)

	const maskText = useCallback(
		(text: string, g: Set<string>): string => {
			let result = ''
			for (const ch of text) {
				if (isMaskableChar(ch)) {
					const normalized = normalizeCharForGuessing(ch)
					result += g.has(normalized) ? ch : '_'
				} else {
					result += ch
				}
			}
			return result
		},
		[isMaskableChar, normalizeCharForGuessing]
	)

	const hasWon = useMemo(
		() => maskText(card.name, guessed) === card.name,
		[card.name, guessed, maskText]
	)
	// Determine if a guess reveals anything anywhere on the card
	const searchableTexts = useMemo(() => {
		const g = card.guardian
		const thresholdsText = (
			Object.keys(g.thresholds) as (keyof typeof THRESHOLD_EMOJI_MAP)[]
		)
			.map(key => THRESHOLD_EMOJI_MAP[key].repeat(g.thresholds[key] ?? 0))
			.join('')

		let statsText = ''
		const attack = g.attack
		const defence = g.defence
		if (!(attack == null && defence == null)) {
			if (attack === defence) statsText = String(attack ?? defence ?? '')
			else statsText = `${attack ?? '-'}/${defence ?? '-'}`
		}

		const typeText = card.sets?.[0]?.variants?.[0]?.typeText ?? ''
		return [
			String(g.cost),
			thresholdsText,
			statsText,
			card.name,
			typeText,
			g.rulesText
		]
	}, [card])

	const revealsAny = useCallback(
		(normalized: string): boolean => {
			for (const text of searchableTexts) {
				for (const ch of text) {
					if (normalizeCharForGuessing(ch) === normalized) return true
				}
			}
			return false
		},
		[normalizeCharForGuessing, searchableTexts]
	)
	const hasLost = remaining <= 0 && !hasWon

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			const key = e.key
			if (SINGLE_ALNUM_RE.test(key)) {
				const normalized = normalizeCharForGuessing(key)
				setGuessed(prev => {
					if (prev.has(normalized)) return prev
					const next = new Set(prev)
					next.add(normalized)
					return next
				})
				if (revealsAny(normalized)) {
					setCorrect(prev => new Set(prev).add(normalized))
				} else {
					setIncorrect(prev => new Set(prev).add(normalized))
					setRemaining(prev => Math.max(0, prev - 1))
				}
			}
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [normalizeCharForGuessing, revealsAny])

	const handlePress = useCallback(
		(char: string) => {
			const normalized = normalizeCharForGuessing(char)
			setGuessed(prev => {
				if (prev.has(normalized)) return prev
				const next = new Set(prev)
				next.add(normalized)
				return next
			})
			if (revealsAny(normalized)) {
				setCorrect(prev => new Set(prev).add(normalized))
			} else {
				setIncorrect(prev => new Set(prev).add(normalized))
				setRemaining(prev => Math.max(0, prev - 1))
			}
		},
		[normalizeCharForGuessing, revealsAny]
	)

	return (
		<div className='flex flex-col items-center gap-6'>
			<div className='relative'>
				<SorceryCard
					card={card}
					guessed={guessed}
					revealAll={hasWon || hasLost}
				/>
				{hasWon && (
					<div className='absolute inset-0 grid place-items-center rounded-3xl bg-green-600/20 backdrop-blur-[1px]'>
						<span className='rounded-full bg-green-700/80 px-4 py-2 font-bold text-lg text-white shadow'>
							You win!
						</span>
					</div>
				)}
				{hasLost && (
					<div className='absolute inset-0 grid place-items-center rounded-3xl bg-red-600/20 backdrop-blur-[1px]'>
						<span className='rounded-full bg-red-700/80 px-4 py-2 font-bold text-lg text-white shadow'>
							You lose!
						</span>
					</div>
				)}
			</div>
			<div className='flex items-center gap-3'>
				<div className='rounded-md bg-black/40 px-3 py-1 font-semibold text-slate-100 text-sm'>
					Guesses left: <span className='tabular-nums'>{remaining}</span>
				</div>
			</div>
			<Keyboard
				correct={correct}
				disabled={hasWon || remaining <= 0}
				incorrect={incorrect}
				onPress={handlePress}
			/>
		</div>
	)
}
