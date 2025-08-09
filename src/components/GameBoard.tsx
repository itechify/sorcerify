import {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react'
import Select, {
	type GroupBase,
	type Props as SelectProps,
	type SingleValue
} from 'react-select'
import type {Card} from '@/api/cards'
import {Keyboard} from '@/components/Keyboard'
import {SorceryCard} from '@/components/SorceryCard'

// Top-level constants for performance (linter preference)
// Threshold tokens used for guessing/searching
const THRESHOLD_TOKENS = ['air', 'earth', 'fire', 'water'] as const
const LETTER_RE = /[a-zA-Z]/
const SINGLE_ALNUM_RE = /^[a-zA-Z0-9]$/

function isTypingInInput(target: HTMLElement | null): boolean {
	if (!target) return false
	const tag = target.tagName
	if (tag === 'INPUT' || tag === 'TEXTAREA') return true
	if (target.isContentEditable) return true
	// react-select uses a div with role="combobox" containing an input; guard by attribute too
	const role = target.getAttribute?.('role')
	if (role === 'combobox' || role === 'textbox') return true
	return false
}

export function GameBoard({
	card,
	allCardNames
}: {
	card: Card
	allCardNames: string[]
}) {
	const [guessed, setGuessed] = useState<Set<string>>(() => new Set())
	const [correct, setCorrect] = useState<Set<string>>(() => new Set())
	const [incorrect, setIncorrect] = useState<Set<string>>(() => new Set())
	const [remaining, setRemaining] = useState<number>(7)
	const [hasWon, setHasWon] = useState<boolean>(false)
	const [nameGuessSelection, setNameGuessSelection] = useState<string>('')
	const [nameGuessStatus, setNameGuessStatus] = useState<'incorrect' | null>(
		null
	)
	const nameGuessStatusTimeoutRef = useRef<number | null>(null)
	const nameGuessedRef = useRef<Set<string>>(new Set())
	const id = useId()
	// removed maskable token set; masking of fields is handled inside card rendering

	const normalizeCharForGuessing = useCallback((char: string): string => {
		if (LETTER_RE.test(char)) return char.toLowerCase()
		return char
	}, [])

	// Winning is now only via correct name guess in the dropdown
	// Determine if a guess reveals anything anywhere on the card (text fields only)
	const searchableTexts = useMemo(() => {
		const g = card.guardian
		let statsText = ''
		const attack = g.attack
		const defence = g.defence
		if (!(attack == null && defence == null)) {
			if (attack === defence) statsText = String(attack ?? defence ?? '')
			else statsText = `${attack ?? '-'}/${defence ?? '-'}`
		}

		const typeText = card.sets?.[0]?.variants?.[0]?.typeText ?? ''
		const leftTopText =
			g.type === 'Avatar' ? String(g.life ?? '') : String(g.cost)
		return [leftTopText, statsText, card.name, typeText, g.rulesText]
	}, [card])

	const revealsAny = useCallback(
		(normalized: string): boolean => {
			// Threshold tokens
			if ((THRESHOLD_TOKENS as readonly string[]).includes(normalized)) {
				const thresholds = card.guardian.thresholds as Record<
					string,
					number | undefined
				>
				if ((thresholds[normalized] ?? 0) > 0) return true
				const map: Record<string, string> = {
					air: 'A',
					earth: 'E',
					fire: 'F',
					water: 'W'
				}
				const code = map[normalized]
				return new RegExp(`\\(${code}\\)`).test(card.guardian.rulesText)
			}
			// Text fields
			for (const text of searchableTexts) {
				for (const ch of text) {
					if (normalizeCharForGuessing(ch) === normalized) return true
				}
			}
			return false
		},
		[card.guardian, normalizeCharForGuessing, searchableTexts]
	)
	const hasLost = remaining <= 0 && !hasWon

	// Key handling effect is declared after handlePress to satisfy linter ordering

	const handlePress = useCallback(
		(char: string) => {
			const normalized = normalizeCharForGuessing(char)
			if (guessed.has(normalized)) return
			setGuessed(prev => new Set(prev).add(normalized))
			if (revealsAny(normalized)) {
				setCorrect(prev => new Set(prev).add(normalized))
			} else {
				setIncorrect(prev => new Set(prev).add(normalized))
			}
			setRemaining(prev => Math.max(0, prev - 1))
		},
		[guessed, normalizeCharForGuessing, revealsAny]
	)

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (hasWon || remaining <= 0) return
			const target = e.target as HTMLElement | null
			if (isTypingInInput(target)) return
			const key = e.key
			if (!SINGLE_ALNUM_RE.test(key)) return
			handlePress(key)
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [hasWon, remaining, handlePress])

	// Clear any pending timeout on unmount
	useEffect(() => {
		return () => {
			if (nameGuessStatusTimeoutRef.current != null) {
				window.clearTimeout(nameGuessStatusTimeoutRef.current)
			}
		}
	}, [])

	const submitNameGuess = useCallback(
		(nameValue: string) => {
			if (!nameValue || hasWon || remaining <= 0) return
			const already = nameGuessedRef.current.has(nameValue)
			if (!already) {
				nameGuessedRef.current.add(nameValue)
				if (nameValue === card.name) {
					setHasWon(true)
				} else {
					// transient feedback for incorrect name guess
					setNameGuessStatus('incorrect')
					if (nameGuessStatusTimeoutRef.current != null) {
						window.clearTimeout(nameGuessStatusTimeoutRef.current)
					}
					nameGuessStatusTimeoutRef.current = window.setTimeout(() => {
						setNameGuessStatus(null)
					}, 1500)
				}
				setRemaining(prev => Math.max(0, prev - 1))
			}
		},
		[card.name, hasWon, remaining]
	)

	const nameOptions = useMemo(
		() => allCardNames.map(n => ({value: n, label: n})),
		[allCardNames]
	)

	interface NameOption {
		value: string
		label: string
	}

	const selectStyles: SelectProps<
		NameOption,
		false,
		GroupBase<NameOption>
	>['styles'] = useMemo(
		() => ({
			control: (base, state) => ({
				...base,
				backgroundColor: '#ffffff',
				borderColor: state.isFocused ? '#38bdf8' : '#cbd5e1',
				boxShadow: state.isFocused
					? '0 0 0 2px rgba(56, 189, 248, 0.5)'
					: 'none',
				':hover': {borderColor: '#94a3b8'},
				minHeight: 38
			}),
			singleValue: base => ({
				...base,
				color: '#0f172a'
			}),
			input: base => ({
				...base,
				color: '#0f172a'
			}),
			placeholder: base => ({
				...base,
				color: '#64748b'
			}),
			menuPortal: base => ({...base, zIndex: 9999}),
			menu: base => ({
				...base,
				backgroundColor: '#ffffff',
				color: '#0f172a',
				border: '1px solid #cbd5e1',
				boxShadow:
					'0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)'
			}),
			option: (base, state) => {
				let bg = '#ffffff'
				if (state.isSelected) bg = '#e2e8f0'
				else if (state.isFocused) bg = '#f1f5f9'
				return {
					...base,
					color: state.isDisabled ? '#94a3b8' : '#0f172a',
					backgroundColor: bg
				}
			},
			dropdownIndicator: base => ({...base, color: '#334155'}),
			indicatorSeparator: base => ({...base, backgroundColor: '#cbd5e1'})
		}),
		[]
	)

	return (
		<div className='flex flex-col items-center gap-6'>
			<div className='relative'>
				<SorceryCard
					card={card}
					guessed={guessed}
					revealAll={Boolean(hasWon || hasLost)}
				/>
				{hasWon && (
					<div className='absolute inset-0 grid place-items-center rounded-3xl bg-green-600/20 backdrop-blur-[1px]'>
						<span className='rounded-full bg-green-700/80 px-4 py-2 font-bold text-lg text-white shadow'>
							You win!
						</span>
					</div>
				)}
				{hasLost && (
					<div className='absolute inset-0 grid place-items-center rounded-3xl bg-red-600/20 backdrop-blur-[1px]'>
						<span className='rounded-full bg-red-700/80 px-4 py-2 font-bold text-lg text-white shadow'>
							You lose!
						</span>
					</div>
				)}
			</div>
			<div className='flex items-center gap-3'>
				<div className='rounded-md bg-black/40 px-3 py-1 font-semibold text-slate-100 text-sm'>
					Guesses left: <span className='tabular-nums'>{remaining}</span>
				</div>
			</div>
			<div className='flex items-center gap-2'>
				<label className='sr-only' htmlFor={`${id}-name-guess`}>
					Guess card name
				</label>
				<div className='min-w-64'>
					<Select<NameOption>
						inputId={`${id}-name-guess`}
						isDisabled={hasWon || remaining <= 0}
						menuPortalTarget={document.body}
						onChange={(opt: SingleValue<NameOption>) => {
							const next = opt?.value ?? ''
							setNameGuessSelection(next)
						}}
						options={nameOptions}
						placeholder='Select a card name'
						styles={selectStyles}
						value={
							nameOptions.find(o => o.value === nameGuessSelection) ?? null
						}
					/>
				</div>
				<button
					className='rounded-md border border-slate-300 bg-white cursor-pointer px-3 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:opacity-50'
					disabled={!nameGuessSelection || hasWon || remaining <= 0}
					onClick={() => submitNameGuess(nameGuessSelection)}
					type='button'
				>
					Guess name
				</button>
				{nameGuessStatus === 'incorrect' && (
					<output
						aria-live='polite'
						className='ml-2 select-none text-sm font-semibold text-red-600'
					>
						Incorrect name
					</output>
				)}
			</div>
			<Keyboard
				correct={correct}
				disabled={hasWon || remaining <= 0}
				incorrect={incorrect}
				onPress={handlePress}
			/>
		</div>
	)
}
