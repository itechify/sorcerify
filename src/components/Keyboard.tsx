import {useMemo} from 'react'

interface Properties {
	guessed: Set<string>
	onPress: (char: string) => void
	disabled?: boolean
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const DIGITS = '0123456789'.split('')
const EMOJIS = ['💨', '⛰️', '🔥', '💧']
const LETTER_RE = /[a-zA-Z]/

export function Keyboard({guessed, onPress, disabled = false}: Properties) {
	const guessedSet = guessed
	const keys = useMemo(() => {
		return [...LETTERS, ...DIGITS, ...EMOJIS]
	}, [])

	return (
		<div className='flex max-w-[740px] flex-wrap justify-center gap-2 px-2'>
			{keys.map(k => {
				const normalized = LETTER_RE.test(k) ? k.toLowerCase() : k
				const isGuessed = guessedSet.has(normalized)
				return (
					<button
						aria-label={`Key ${k}`}
						aria-pressed={isGuessed}
						className={
							'min-w-9 select-none rounded-md px-3 py-2 font-semibold text-sm shadow transition' +
							(isGuessed
								? 'cursor-not-allowed bg-slate-600 text-slate-300'
								: 'bg-slate-200 hover:bg-slate-300 active:bg-slate-400')
						}
						disabled={disabled || isGuessed}
						key={k}
						onClick={() => onPress(k)}
						title={isGuessed ? 'Already guessed' : `Guess ${k}`}
						type='button'
					>
						{k}
					</button>
				)
			})}
		</div>
	)
}
