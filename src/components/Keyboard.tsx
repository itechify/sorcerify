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

		let buttonClass =
			'w-8 h-8 sm:w-10 sm:h-10 rounded-md font-semibold text-sm sm:text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'

		if (isCorrect) {
			buttonClass += ' bg-green-600 text-white cursor-default'
		} else if (isIncorrect) {
			buttonClass += ' bg-red-600 text-white cursor-default'
		} else if (disabled) {
			buttonClass += ' bg-slate-300 text-slate-500 cursor-default'
		} else {
			buttonClass +=
				' bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400 cursor-pointer'
		}

		const buttonProps = {
			className: buttonClass,
			disabled: disabled || isGuessed,
			onClick: () => onPress(char),
			type: 'button' as const,
			title: isGuessed ? 'Already guessed' : `Guess ${char}`
		}

		if (isThreshold) {
			return (
				<button key={char} {...buttonProps}>
					<img
						alt={`${char} threshold`}
						className='h-4 w-4 sm:h-5 sm:w-5 mx-auto'
						height={20}
						src={tokenSrc[char]}
						width={20}
					/>
				</button>
			)
		}

		return (
			<button key={char} {...buttonProps}>
				{char}
			</button>
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
