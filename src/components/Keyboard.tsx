import {useMemo} from 'react'

interface Properties {
	correct: Set<string>
	incorrect: Set<string>
	onPress: (char: string) => void
	disabled?: boolean
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const DIGITS = '0123456789'.split('')
const TOKENS = ['air', 'earth', 'fire', 'water'] as const
const TOKEN_TO_SRC: Record<(typeof TOKENS)[number], string> = {
	air: '/threshold-icons/wind.png',
	earth: '/threshold-icons/earth.png',
	fire: '/threshold-icons/fire.png',
	water: '/threshold-icons/water.png'
}
const LETTER_RE = /[a-zA-Z]/

export function Keyboard({
	correct,
	incorrect,
	onPress,
	disabled = false
}: Properties) {
	const correctSet = correct
	const incorrectSet = incorrect
	const keys = useMemo(() => {
		return [...LETTERS, ...DIGITS, ...TOKENS]
	}, [])

	return (
		<div className='flex max-w-[740px] flex-wrap justify-center gap-2 px-2'>
			{keys.map(k => {
				const normalized = LETTER_RE.test(k) ? k.toLowerCase() : k
				const isIncorrect = incorrectSet.has(normalized)
				const isCorrect = correctSet.has(normalized)
				const isUsed = isIncorrect || isCorrect

				let variant =
					' bg-white text-slate-900 border-slate-300 hover:bg-slate-100 active:bg-slate-200'
				if (isIncorrect)
					variant = ' bg-red-600 text-white border-red-700 cursor-not-allowed'
				else if (isCorrect)
					variant =
						' bg-emerald-600 text-white border-emerald-700 cursor-not-allowed'

				return (
					<button
						aria-label={`Key ${k}`}
						aria-pressed={isUsed}
						className={`min-w-9 select-none rounded-md border px-3 py-2 font-semibold text-sm shadow transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400${variant}`}
						disabled={disabled || isUsed}
						key={k}
						onClick={() => onPress(k)}
						title={isUsed ? 'Already guessed' : `Guess ${k}`}
						type='button'
					>
						{k in TOKEN_TO_SRC ? (
							<img
								alt={`${k} icon`}
								className='h-4 w-4'
								height={16}
								src={TOKEN_TO_SRC[k as 'air' | 'earth' | 'fire' | 'water']}
								width={16}
							/>
						) : (
							k
						)}
					</button>
				)
			})}
		</div>
	)
}
