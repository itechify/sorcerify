import {useEffect, useId, useState} from 'react'
import type {Card} from '@/api/cards'
import {CardClues} from '@/components/SorceryCard'
import {Button} from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'

const NON_ALNUM_RE = /[^a-z0-9]/g
const DIACRITICS_RE = /[\u0300-\u036f]/g

function letterCount(value: string): number {
	return value
		.toLowerCase()
		.normalize('NFKD')
		.replace(DIACRITICS_RE, '')
		.replace(NON_ALNUM_RE, '').length
}

export function NameGuessModal({
	open,
	onClose,
	onSubmit,
	onReturnFocus,
	card,
	guessed
}: {
	open: boolean
	onClose: () => void
	onSubmit: (value: string) => void
	onReturnFocus: () => void
	card: Card
	guessed: Set<string>
}) {
	const [value, setValue] = useState('')
	const inputId = useId()
	const hintId = useId()
	const count = letterCount(value)
	const expectedCount = letterCount(card.name)
	const tooLong = count > expectedCount
	const canSubmit = count === expectedCount && count > 0

	useEffect(() => {
		if (!open) setValue('')
	}, [open])

	return (
		<Dialog
			onOpenChange={isOpen => {
				if (!isOpen) onClose()
			}}
			open={open}
		>
			<DialogContent
				onCloseAutoFocus={event => {
					event.preventDefault()
					onReturnFocus()
				}}
			>
				<DialogHeader>
					<DialogTitle>Guess the card</DialogTitle>
					<DialogDescription>
						Type the complete card name, including revealed letters. A wrong
						name uses one guess.
					</DialogDescription>
				</DialogHeader>
				<CardClues card={card} guessed={guessed} />
				<form
					className='grid gap-4'
					onSubmit={event => {
						event.preventDefault()
						if (canSubmit) onSubmit(value.trim())
					}}
				>
					<div className='grid gap-2'>
						<label className='text-sm font-semibold' htmlFor={inputId}>
							Card name
						</label>
						<input
							aria-describedby={hintId}
							aria-invalid={tooLong}
							autoCapitalize='words'
							autoComplete='off'
							className='h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-base text-foreground caret-foreground selection:bg-primary selection:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'
							id={inputId}
							maxLength={120}
							onChange={event => setValue(event.target.value)}
							spellCheck={false}
							value={value}
						/>
						<p className='text-sm text-slate-400' id={hintId}>
							{tooLong
								? `This name has ${expectedCount} letters or numbers. Remove the extra characters to guess.`
								: `Letters and numbers: ${count} of ${expectedCount}. Spaces and punctuation are optional.`}
						</p>
					</div>
					<DialogFooter>
						<Button onClick={onClose} type='button' variant='outline'>
							Cancel
						</Button>
						<Button disabled={!canSubmit} type='submit'>
							Guess card
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
