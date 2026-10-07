import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'

export function InfoModal({
	open,
	onClose
}: {
	open: boolean
	onClose: () => void
}) {
	return (
		<Dialog
			onOpenChange={isOpen => {
				if (!isOpen) onClose()
			}}
			open={open}
		>
			<DialogContent className='sm:max-w-lg'>
				<DialogHeader>
					<DialogTitle>How to play Sorcerify</DialogTitle>
					<DialogDescription>
						One hidden card. Seven guesses to name it.
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-3 text-sm leading-6'>
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
							To win, choose <span className='font-semibold'>Guess card</span>{' '}
							and type the complete name, including revealed letters. Spaces and
							punctuation are optional. A correct name wins; a wrong name uses
							one guess. Repeating a name costs no extra guess.
						</li>
						<li>
							Your final guess is reserved for the card name. With one guess
							left, the clue keys turn off and{' '}
							<span className='font-semibold'>Guess card</span> stays available.
						</li>
						<li>
							You lose when guesses reach 0; the full card is then revealed.
						</li>
					</ul>
					<div className='rounded-md border bg-background/60 p-3'>
						<p className='font-semibold'>Modes</p>
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
			</DialogContent>
		</Dialog>
	)
}
