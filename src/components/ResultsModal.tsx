import {useCallback, useEffect, useId, useMemo, useState} from 'react'
import {Button} from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'

export type GuessResult = 'correct' | 'incorrect'

export function ResultsModal({
	open,
	onClose,
	hasWon,
	results,
	persistKey,
	cardName,
	cardImageUrl
}: {
	open: boolean
	onClose: () => void
	hasWon: boolean
	results: GuessResult[]
	persistKey?: string | undefined
	cardName: string
	cardImageUrl?: string
}) {
	const [copied, setCopied] = useState<boolean>(false)
	const [copyFailed, setCopyFailed] = useState(false)
	const [copying, setCopying] = useState(false)
	const shareId = useId()
	useEffect(() => {
		if (!open) {
			setCopied(false)
			setCopyFailed(false)
		}
	}, [open])

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
	let shareLabel = 'Share'
	if (copyFailed) shareLabel = 'Try copy again'
	if (copied) shareLabel = 'Copied!'
	if (copying) shareLabel = 'Copying…'

	return (
		<Dialog
			onOpenChange={isOpen => {
				if (!isOpen) onClose()
			}}
			open={open}
		>
			<DialogContent className='sm:max-w-lg'>
				<DialogHeader>
					<DialogTitle>
						{persistKey ? 'Daily Results' : 'Practice Results'}
					</DialogTitle>
					<DialogDescription>
						{hasWon
							? 'You named the card!'
							: 'No guesses left. Here is the card.'}
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-4'>
					{cardImageUrl ? (
						<div className='w-full flex justify-center'>
							<img
								alt={cardName}
								className='h-auto max-h-[420px] w-auto max-w-full rounded-md object-contain'
								height={531}
								src={cardImageUrl}
								width={380}
							/>
						</div>
					) : null}
					<div className='rounded-md border bg-background/60 p-3'>
						<p className='font-semibold mb-2'>{cardName}</p>
						<div className='flex gap-1 text-xl select-none'>
							{results.map((_, i) => (
								<span key={`res-${i}-${results[i]}`}>
									{getResultEmojiAt(i)}
								</span>
							))}
						</div>
					</div>
				</div>
				<output
					aria-live='polite'
					className={
						copied || copyFailed ? 'text-sm text-slate-300' : 'sr-only'
					}
				>
					{copied && 'Result copied to clipboard.'}
					{copyFailed &&
						'Could not copy your result. Select and copy the text below, or try again.'}
				</output>
				{copyFailed && (
					<div className='grid gap-2'>
						<label className='text-sm font-semibold' htmlFor={shareId}>
							Share text
						</label>
						<textarea
							className='w-full rounded-md border border-input bg-background p-3 text-base text-foreground selection:bg-primary selection:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'
							id={shareId}
							onFocus={event => event.currentTarget.select()}
							readOnly={true}
							rows={3}
							value={shareText}
						/>
					</div>
				)}
				<DialogFooter className='sm:justify-start'>
					<Button
						disabled={copying}
						onClick={async () => {
							setCopying(true)
							setCopied(false)
							try {
								await navigator.clipboard.writeText(shareText)
								setCopied(true)
								setCopyFailed(false)
							} catch {
								setCopyFailed(true)
							} finally {
								setCopying(false)
							}
						}}
						variant='outline'
					>
						{shareLabel}
					</Button>
					<Button asChild={true} variant='secondary'>
						<a href={curiosaUrl} rel='noopener noreferrer' target='_blank'>
							View on curiosa.io
						</a>
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
