import {useCallback, useMemo, useState} from 'react'
import {createPortal} from 'react-dom'

export type GuessResult = 'correct' | 'incorrect'

export function ResultsModal({
	open,
	onClose,
	hasWon,
	results,
	persistKey,
	cardName
}: {
	open: boolean
	onClose: () => void
	hasWon: boolean
	results: GuessResult[]
	persistKey?: string | undefined
	cardName: string
}) {
	const [copied, setCopied] = useState<boolean>(false)

	const curiosaUrl = useMemo(() => {
		const slug = cardName
			.toLowerCase()
			.replace(/[’']/g, '')
			.replace(/\s+/g, '_')
		return `https://curiosa.io/cards/${slug}`
	}, [cardName])

	const getResultEmojiAt = useCallback(
		(index: number): string => {
			const isLast = index === results.length - 1
			if (isLast) return hasWon ? '✅' : '❌'
			return results[index] === 'correct' ? '🟩' : '🟥'
		},
		[results, hasWon]
	)

	const resultRow = useMemo(() => {
		return results.map((_, i) => getResultEmojiAt(i)).join('')
	}, [results, getResultEmojiAt])

	const shareText = useMemo(() => {
		const header = persistKey ? `Sorcerify ${persistKey}` : 'Sorcerify'
		return `${header}\n${resultRow}\nhttps://sorcerify.com`
	}, [persistKey, resultRow])

	if (!open) return null

	return createPortal(
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<button
				aria-label='Close modal'
				className='absolute inset-0 bg-black/60 backdrop-blur-sm'
				onClick={onClose}
				type='button'
			/>
			<div className='relative z-10 w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-6 text-slate-100 shadow-xl'>
				<div className='flex items-start justify-between gap-4'>
					<h2 className='text-lg sm:text-xl font-bold text-white'>
						Daily Results
					</h2>
					<button
						aria-label='Close'
						className='rounded-md p-1 text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700 cursor-pointer'
						onClick={onClose}
						type='button'
					>
						<svg
							className='h-5 w-5'
							fill='currentColor'
							viewBox='0 0 24 24'
							xmlns='http://www.w3.org/2000/svg'
						>
							<title>Close</title>
							<path
								clipRule='evenodd'
								d='M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.361a1 1 0 1 1 1.414 1.414L13.414 10.586l4.361 4.361a1 1 0 0 1-1.414 1.414L12 12l-4.361 4.361a1 1 0 1 1-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 0 1 0-1.414Z'
								fillRule='evenodd'
							/>
						</svg>
					</button>
				</div>

				<div className='mt-3 space-y-4'>
					<p className='text-sm'>{hasWon ? 'You won!' : 'You lost 😔'}</p>
					<div className='rounded-md bg-black/30 p-3'>
						<p className='font-semibold mb-2'>{cardName}</p>
						<div className='flex gap-1 text-xl select-none'>
							{results.map((_, i) => (
								<span key={`res-${i}-${results[i]}`}>
									{getResultEmojiAt(i)}
								</span>
							))}
						</div>
					</div>

					<div className='flex flex-col sm:flex-row gap-2 sm:items-center'>
						<button
							className='rounded-md border border-slate-300 bg-white cursor-pointer px-3 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'
							onClick={async () => {
								try {
									await navigator.clipboard.writeText(shareText)
									setCopied(true)
									window.setTimeout(() => setCopied(false), 1200)
								} catch {
									// ignore
								}
							}}
							type='button'
						>
							{copied ? 'Copied!' : 'Copy to clipboard'}
						</button>
						<a
							className='rounded-md border border-slate-700 bg-slate-800 cursor-pointer px-3 py-2 text-sm font-semibold text-slate-100 shadow hover:bg-slate-700 active:bg-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'
							href={curiosaUrl}
							rel='noopener noreferrer'
							target='_blank'
						>
							View on curiosa.io
						</a>
					</div>
				</div>
			</div>
		</div>,
		document.body
	)
}
