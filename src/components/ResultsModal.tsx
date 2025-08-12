import {useCallback, useMemo, useState} from 'react'
import {Button} from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
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

	return (
		<Dialog
			onOpenChange={isOpen => {
				if (!isOpen) onClose()
			}}
			open={open}
		>
			<DialogContent className='sm:max-w-lg'>
				<DialogHeader>
					<DialogTitle>Daily Results</DialogTitle>
				</DialogHeader>
				<div className='space-y-4'>
					<p className='text-sm'>{hasWon ? 'You won!' : 'You lost 😔'}</p>
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
				<DialogFooter className='sm:justify-start'>
					<Button
						onClick={async () => {
							try {
								await navigator.clipboard.writeText(shareText)
								setCopied(true)
								window.setTimeout(() => setCopied(false), 1200)
							} catch {
								// ignore
							}
						}}
						variant='outline'
					>
						{copied ? 'Copied to clipboard!' : 'Share'}
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
