import {useEffect, useId, useRef} from 'react'
import {createPortal} from 'react-dom'

export function InfoModal({
	open,
	onClose
}: {
	open: boolean
	onClose: () => void
}) {
	const dialogRef = useRef<HTMLDivElement | null>(null)
	const headingId = useId()

	useEffect(() => {
		if (!open) return
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose()
		}
		window.addEventListener('keydown', onKeyDown)
		// Focus the dialog on open for accessibility
		const id = window.setTimeout(() => dialogRef.current?.focus(), 0)
		return () => {
			window.removeEventListener('keydown', onKeyDown)
			window.clearTimeout(id)
		}
	}, [open, onClose])

	if (!open) return null

	return createPortal(
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
			<button
				aria-label='Close modal'
				className='absolute inset-0 bg-black/60 backdrop-blur-sm'
				onClick={onClose}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ') onClose()
				}}
				type='button'
			/>
			<div
				aria-labelledby={headingId}
				aria-modal='true'
				className='relative z-10 w-full max-w-lg rounded-xl border border-slate-700 bg-slate-900 p-4 sm:p-6 text-slate-100 shadow-xl outline-none'
				ref={dialogRef}
				role='dialog'
				tabIndex={-1}
			>
				<div className='flex items-start justify-between gap-4'>
					<h2
						className='text-lg sm:text-xl font-bold text-white'
						id={headingId}
					>
						How to play Sorcerify
					</h2>
					<button
						aria-label='Close'
						className='rounded-md p-1 text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700'
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

				<div className='mt-3 space-y-3 text-sm leading-6 text-slate-200'>
					<p>
						Guess the Sorcery: Contested Realm card by name in up to
						<span className='font-semibold'> 7</span> guesses.
					</p>
					<ul className='list-disc pl-5 space-y-1'>
						<li>
							Use your keyboard or on-screen keyboard to guess a single
							letter/number/threshold. If it appears anywhere on the card (name,
							type, cost/life, stats, rules text), it will be revealed.
						</li>
						<li>
							To win, pick a name from the dropdown and click
							<span className='font-semibold'> Guess name</span>. A correct name
							wins immediately; an incorrect name uses a guess and is removed
							from the dropdown.
						</li>
						<li>
							You lose when guesses reach 0; the full card is then revealed.
						</li>
					</ul>
					<div className='mt-2 rounded-md border border-slate-700 bg-slate-800/60 p-3'>
						<p className='font-semibold text-slate-100'>Modes</p>
						<ul className='mt-1 list-disc pl-5 space-y-1'>
							<li>
								<span className='font-semibold'>Daily</span>: One card per UTC
								day. Wins increase your daily streak; losses reset it. Progress
								is saved locally.
							</li>
							<li>
								<span className='font-semibold'>Practice</span>: Unlimited
								random cards. Keep a local win streak until you miss.
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>,
		document.body
	)
}
