import {useCallback, useEffect, useMemo, useState} from 'react'
import type {Card} from '@/api/cards'
import {Keyboard} from '@/components/Keyboard'
import {SorceryCard} from '@/components/SorceryCard'

// Top-level constants for performance (linter preference)
const THRESHOLD_EMOJIS = ['💨', '⛰️', '🔥', '💧']
const LETTER_RE = /[a-zA-Z]/
const ALNUM_RE = /[a-zA-Z0-9]/
const SINGLE_ALNUM_RE = /^[a-zA-Z0-9]$/

export function GameBoard({card}: {card: Card}) {
	const [guessed, setGuessed] = useState<Set<string>>(() => new Set())
	const maskableEmojiSet = useMemo(() => new Set(THRESHOLD_EMOJIS), [])

	const normalizeCharForGuessing = useCallback((char: string): string => {
		if (LETTER_RE.test(char)) return char.toLowerCase()
		return char
	}, [])

	const isMaskableChar = useCallback(
		(char: string): boolean =>
			ALNUM_RE.test(char) || maskableEmojiSet.has(char),
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
			}
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [normalizeCharForGuessing])

	const handlePress = useCallback(
		(char: string) => {
			const normalized = normalizeCharForGuessing(char)
			setGuessed(prev => {
				if (prev.has(normalized)) return prev
				const next = new Set(prev)
				next.add(normalized)
				return next
			})
		},
		[normalizeCharForGuessing]
	)

	return (
		<div className='flex flex-col items-center gap-6'>
			<div className='relative'>
				<SorceryCard card={card} guessed={guessed} />
				{hasWon && (
					<div className='absolute inset-0 grid place-items-center rounded-3xl bg-green-600/20 backdrop-blur-[1px]'>
						<span className='rounded-full bg-green-700/80 px-4 py-2 font-bold text-lg text-white shadow'>
							You win!
						</span>
					</div>
				)}
			</div>
			<Keyboard disabled={hasWon} guessed={guessed} onPress={handlePress} />
		</div>
	)
}
