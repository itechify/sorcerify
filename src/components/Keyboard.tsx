import {Button} from '@/components/ui/button'

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
		const isThreshold = thresholds.includes(char)

		let colorClass = 'transition-colors'
		if (isCorrect) colorClass += ' bg-green-600 text-white'
		else if (isIncorrect) colorClass += ' bg-red-600 text-white'
		else if (disabled) colorClass += ' bg-slate-300 text-slate-500'
		else
			colorClass +=
				' bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400'

		const buttonProps = {
			className: `size-8 sm:size-10 ${colorClass}`,
			disabled: disabled || isGuessed,
			onClick: () => onPress(char),
			type: 'button' as const,
			title: isGuessed ? 'Already guessed' : `Guess ${char}`
		}

		if (isThreshold) {
			return (
				<Button key={char} size='icon' {...buttonProps}>
					<img
						alt={`${char} threshold`}
						className='size-4 sm:size-5 mx-auto'
						height={20}
						src={tokenSrc[char]}
						width={20}
					/>
				</Button>
			)
		}

		return (
			<Button key={char} size='icon' {...buttonProps}>
				{char}
			</Button>
		)
	}

	return (
		<div className='flex flex-col gap-2 w-full'>
			<div className='flex flex-wrap justify-center gap-1 sm:gap-2 w-full'>
				{letters.map(renderButton)}
			</div>
			<div className='flex flex-wrap justify-center gap-1 sm:gap-2 w-full'>
				{digits.map(renderButton)}
			</div>
			<div className='flex flex-wrap justify-center gap-2 w-full'>
				{thresholds.map(renderButton)}
			</div>
		</div>
	)
}
