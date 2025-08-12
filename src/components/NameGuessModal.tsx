import {type ReactNode, useEffect, useMemo, useRef, useState} from 'react'
import {Button} from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'

const ALNUM_RE = /[a-zA-Z0-9]/
const INPUT_SANITIZE_RE = /[^a-zA-Z0-9 ' -]/g

function normalizeAlnum(s: string): string {
	return s
		.split('')
		.filter(ch => ALNUM_RE.test(ch))
		.map(ch => ch.toLowerCase())
		.join('')
}

export function NameGuessModal({
	open,
	onClose,
	onSubmit,
	cardName,
	guessed
}: {
	open: boolean
	onClose: () => void
	onSubmit: (value: string) => void
	cardName: string
	guessed: Set<string>
}) {
	const [value, setValue] = useState('')
	const inputRef = useRef<HTMLInputElement | null>(null)

	// Focus input when modal opens
	useEffect(() => {
		if (open) {
			setTimeout(() => inputRef.current?.focus(), 0)
		} else {
			setValue('')
		}
	}, [open])

	// Group contiguous slots into word groups so the UI wraps per-word.
	// Letter slots are guessable. Symbols like hyphens/apostrophes are auto-filled.
	interface LetterSlot {
		kind: 'slot'
		raw: string
		lower: string
	}
	interface SymbolSlot {
		kind: 'symbol'
		char: string
	}
	type Slot = LetterSlot | SymbolSlot
	interface WordGroup {
		letters: Slot[]
	}

	function renderNameSlots(
		wordGroups: WordGroup[],
		typed: string[],
		guessedSet: Set<string>
	): ReactNode[] {
		let slotIndex = 0
		return wordGroups.map(g => {
			const groupStart = slotIndex
			const nodes = g.letters.map((t, li) => {
				if (t.kind === 'symbol') {
					return (
						<div
							className='grid place-items-center h-10 w-8 sm:w-9 rounded-md bg-slate-300/60 text-slate-900 font-semibold select-none'
							key={`sym-${groupStart + li}-${t.char}`}
						>
							<span className='opacity-60'>{t.char}</span>
						</div>
					)
				}

				const typedChar = typed[slotIndex++]
				const hint = guessedSet.has(t.lower) ? t.raw.toUpperCase() : ''
				const show = typedChar ?? hint
				const isHint = typedChar == null && Boolean(hint)
				return (
					<div
						className='grid place-items-center h-10 w-8 sm:w-9 rounded-md bg-slate-300/80 text-slate-900 font-semibold select-none'
						key={`slot-${groupStart + li}-${t.raw}-${t.lower}`}
					>
						<span className={isHint ? 'opacity-40' : ''}>{show ?? ''}</span>
					</div>
				)
			})
			return (
				<div
					className='mr-4 sm:mr-5 last:mr-0 flex flex-wrap gap-2'
					key={`grp-${groupStart}-${nodes.length}`}
				>
					{nodes}
				</div>
			)
		})
	}

	const groups = useMemo<WordGroup[]>(() => {
		const out: WordGroup[] = []
		let current: Slot[] = []
		const flush = () => {
			if (current.length > 0) out.push({letters: current})
			current = []
		}
		for (const ch of cardName) {
			if (ALNUM_RE.test(ch)) {
				current.push({kind: 'slot', raw: ch, lower: ch.toLowerCase()})
				continue
			}
			if (ch === ' ') {
				flush()
				continue
			}
			if (ch === '-' || ch === "'" || ch === '’') {
				current.push({kind: 'symbol', char: ch})
			}
		}
		flush()
		return out
	}, [cardName])

	const typedLetters = useMemo(() => {
		return normalizeAlnum(value).toUpperCase().split('')
	}, [value])

	// Determine if all visible slots are filled either by typed characters or hints
	const {totalSlots, coveredSlots} = useMemo(() => {
		let slotIndex = 0
		let total = 0
		let covered = 0

		const incrementIfCovered = (letter: LetterSlot): void => {
			const typedChar = typedLetters[slotIndex++]
			if (typedChar != null && typedChar !== '') {
				covered += 1
				return
			}
			if (guessed.has(letter.lower)) covered += 1
		}

		for (const group of groups) {
			for (const item of group.letters) {
				if (item.kind === 'symbol') continue
				total += 1
				incrementIfCovered(item)
			}
		}
		return {totalSlots: total, coveredSlots: covered}
	}, [groups, typedLetters, guessed])

	const isAllSlotsCovered = coveredSlots >= totalSlots

	const isValueProvided = useMemo(() => Boolean(value.trim()), [value])
	const isSubmitEnabled = isValueProvided && isAllSlotsCovered

	function submit() {
		const trimmed = value.trim()
		if (!isSubmitEnabled) return
		onSubmit(trimmed)
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter') {
			e.preventDefault()
			submit()
		}
	}

	// Allow letters, numbers, spaces, hyphen and apostrophes in the visible input
	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const next = e.target.value
		const sanitized = next.replace(INPUT_SANITIZE_RE, '')
		setValue(sanitized)
	}

	return (
		<Dialog
			onOpenChange={isOpen => {
				if (!isOpen) onClose()
			}}
			open={open}
		>
			<DialogContent className='sm:max-w-2xl md:max-w-3xl'>
				<DialogHeader>
					<DialogTitle className='text-center'>Guess the card</DialogTitle>
				</DialogHeader>
				<div className='space-y-4'>
					<div className='flex flex-col gap-2'>
						<div className='relative'>
							{/* Hidden-but-present input to capture text */}
							<input
								aria-label='Type the card name'
								className='sr-only'
								onChange={handleChange}
								onKeyDown={onKeyDown}
								ref={inputRef}
								value={value}
							/>
							{/* Visual letter slots */}
							<button
								aria-label='Card name input slots (click to type)'
								className='flex flex-wrap gap-y-2 rounded-md bg-slate-800 p-2 mx-auto'
								onClick={() => inputRef.current?.focus()}
								onKeyDown={() => inputRef.current?.focus()}
								type='button'
							>
								{renderNameSlots(groups, typedLetters, guessed)}
							</button>
						</div>
					</div>
				</div>
				<DialogFooter className='sm:justify-center'>
					<Button onClick={onClose} variant='outline'>
						Cancel
					</Button>
					<Button disabled={!isSubmitEnabled} onClick={submit}>
						Submit
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

// Named export only to satisfy project lint rules
// (Avoid default export when exporting components.)
