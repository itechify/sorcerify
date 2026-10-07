import {Check, X} from 'lucide-react'
import {useId} from 'react'
import {Button} from '@/components/ui/button'

function keyColors(
	correct: boolean,
	incorrect: boolean,
	disabled: boolean
): string {
	if (correct) return 'bg-green-700 text-white'
	if (incorrect) return 'bg-red-700 text-white'
	if (disabled) return 'bg-slate-300 text-slate-500'
	return 'bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400'
}

function KeyFeedback({
	correct,
	incorrect,
	id
}: {
	correct: boolean
	incorrect: boolean
	id: string
}) {
	if (!(correct || incorrect)) return null
	const Icon = correct ? Check : X
	return (
		<>
			<span hidden={true} id={id}>
				{correct ? 'Revealed clues' : 'No matches'}
			</span>
			<Icon
				aria-hidden='true'
				className='absolute right-0.5 top-0.5 size-2.5'
			/>
		</>
	)
}

export function Keyboard({
	correct,
	disabled,
	incorrect,
	onPress
}: {
	correct: Set<string>
	disabled: boolean
	incorrect: Set<string>
	onPress: (char: string) => void
}) {
	const outcomeId = useId()
	const letters = [
		'A',
		'B',
		'C',
		'D',
		'E',
		'F',
		'G',
		'H',
		'I',
		'J',
		'K',
		'L',
		'M',
		'N',
		'O',
		'P',
		'Q',
		'R',
		'S',
		'T',
		'U',
		'V',
		'W',
		'X',
		'Y',
		'Z'
	]
	const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
	const thresholds = ['air', 'earth', 'fire', 'water']

	const tokenSrc: Record<string, string> = {
		air: '/threshold-icons/wind.png',
		earth: '/threshold-icons/earth.png',
		fire: '/threshold-icons/fire.png',
		water: '/threshold-icons/water.png'
	}

	function renderButton(char: string) {
		const isCorrect = correct.has(char.toLowerCase())
		const isIncorrect = incorrect.has(char.toLowerCase())
		const isGuessed = isCorrect || isIncorrect
		const outcome = isCorrect ? 'Revealed clues' : 'No matches'
		const colorClass = keyColors(isCorrect, isIncorrect, disabled)

		return (
			<Button
				aria-describedby={isGuessed ? `${outcomeId}-${char}` : undefined}
				className={`relative size-8 sm:size-10 transition-colors ${colorClass}`}
				disabled={disabled || isGuessed}
				key={char}
				onClick={() => onPress(char)}
				size='icon'
				title={isGuessed ? `${char}: ${outcome}` : `Guess ${char}`}
				type='button'
			>
				{thresholds.includes(char) ? (
					<img
						alt={`${char} threshold`}
						className='size-4 sm:size-5 mx-auto'
						height={20}
						src={tokenSrc[char]}
						width={20}
					/>
				) : (
					char
				)}
				<KeyFeedback
					correct={isCorrect}
					id={`${outcomeId}-${char}`}
					incorrect={isIncorrect}
				/>
			</Button>
		)
	}

	return (
		<div className='flex flex-col gap-2 w-full'>
			<fieldset
				aria-label='Letters'
				className='flex min-w-0 flex-wrap justify-center gap-1 sm:gap-2 w-full'
			>
				{letters.map(renderButton)}
			</fieldset>
			<fieldset
				aria-label='Numbers and elemental thresholds'
				className='flex min-w-0 flex-wrap justify-center gap-1 sm:gap-2 w-full'
			>
				{digits.map(renderButton)}
				{thresholds.map(renderButton)}
			</fieldset>
		</div>
	)
}
