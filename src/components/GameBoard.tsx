import {
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState
} from 'react'
import Select, {
	type GroupBase,
	type Props as SelectProps,
	type SingleValue
} from 'react-select'
import type {Card} from '@/api/cards'
import {Keyboard} from '@/components/Keyboard'
import {ResultsModal} from '@/components/ResultsModal'
import {SorceryCard} from '@/components/SorceryCard'
import {Button} from '@/components/ui/button'
import {WinSparkles} from '@/components/WinSparkles'

// Top-level constants for performance (linter preference)
// Threshold tokens used for guessing/searching
const THRESHOLD_TOKENS = ['air', 'earth', 'fire', 'water'] as const
const LETTER_RE = /[a-zA-Z]/
const SINGLE_ALNUM_RE = /^[a-zA-Z0-9]$/
// Precompiled helpers for numeric guess handling in rules text
const SINGLE_DIGIT_RE = /^\d$/
const CIRCLED_DIGIT_START = 0x24_60 // Unicode start for ① (U+2460)

function hasCircledDigit(text: string, digit: number): boolean {
	if (digit < 1 || digit > 20) return false
	const codePoint = CIRCLED_DIGIT_START + digit - 1
	return text.includes(String.fromCodePoint(codePoint))
}

function guessMatchesThreshold(normalized: string, card: Card): boolean {
	if (!(THRESHOLD_TOKENS as readonly string[]).includes(normalized))
		return false
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

function guessMatchesCircledDigit(
	normalized: string,
	rulesText: string
): boolean {
	if (!SINGLE_DIGIT_RE.test(normalized)) return false
	const digit = Number(normalized)
	return hasCircledDigit(rulesText, digit)
}

function textContainsNormalizedChar(
	normalized: string,
	texts: string[],
	normalizer: (s: string) => string
): boolean {
	for (const text of texts) {
		for (const ch of text) {
			if (normalizer(ch) === normalized) return true
		}
	}
	return false
}

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
	allCardNames,
	persistKey,
	onWin,
	onLose,
	endOfRoundAction
}: {
	card: Card
	allCardNames: string[]
	persistKey?: string
	onWin?: () => void
	onLose?: () => void
	endOfRoundAction?: ReactNode
}) {
	// Centralized storage key; each game's state is stored under a sub-key
	const centralStorageKey = 'sorcerify:progress'

	interface PersistedState {
		guessed: string[]
		correct: string[]
		incorrect: string[]
		remaining: number
		hasWon: boolean
		nameGuessed?: string[]
		nameGuessSelection?: string
		results?: ('correct' | 'incorrect')[]
	}

	function readCentralEntry(): PersistedState | null {
		if (!persistKey) return null
		try {
			const raw = localStorage.getItem(centralStorageKey)
			if (!raw) return null
			const map = JSON.parse(raw) as Record<string, PersistedState | undefined>
			return map[persistKey] ?? null
		} catch {
			return null
		}
	}

	const [guessed, setGuessed] = useState<Set<string>>(() => {
		const entry = readCentralEntry()
		return new Set(entry?.guessed ?? [])
	})
	const [correct, setCorrect] = useState<Set<string>>(() => {
		const entry = readCentralEntry()
		return new Set(entry?.correct ?? [])
	})
	const [incorrect, setIncorrect] = useState<Set<string>>(() => {
		const entry = readCentralEntry()
		return new Set(entry?.incorrect ?? [])
	})
	const [remaining, setRemaining] = useState<number>(() => {
		const entry = readCentralEntry()
		return typeof entry?.remaining === 'number' ? entry.remaining : 7
	})
	const [hasWon, setHasWon] = useState<boolean>(() => {
		const entry = readCentralEntry()
		return Boolean(entry?.hasWon)
	})
	const [nameGuessSelection, setNameGuessSelection] = useState<string>(() => {
		const entry = readCentralEntry()
		return entry?.nameGuessSelection ?? ''
	})
	const nameGuessStatusTimeoutRef = useRef<number | null>(null)
	const initialNameGuessed = (() => {
		const entry = readCentralEntry()
		return new Set<string>(entry?.nameGuessed ?? [])
	})()
	const nameGuessedRef = useRef<Set<string>>(initialNameGuessed)
	const [nameGuessed, setNameGuessed] =
		useState<Set<string>>(initialNameGuessed)
	const [results, setResults] = useState<Array<'correct' | 'incorrect'>>(() => {
		const entry = readCentralEntry()
		return entry?.results ?? []
	})
	const winReportedRef = useRef<boolean>(false)
	const loseReportedRef = useRef<boolean>(false)
	const id = useId()
	// removed maskable token set; masking of fields is handled inside card rendering
	const [resultsOpen, setResultsOpen] = useState<boolean>(false)

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
			if (guessMatchesThreshold(normalized, card)) return true
			if (guessMatchesCircledDigit(normalized, card.guardian.rulesText))
				return true
			return textContainsNormalizedChar(
				normalized,
				searchableTexts,
				normalizeCharForGuessing
			)
		},
		[card, normalizeCharForGuessing, searchableTexts]
	)
	const hasLost = remaining <= 0 && !hasWon

	// Key handling effect is declared after handlePress to satisfy linter ordering

	const handlePress = useCallback(
		(char: string) => {
			// Reserve the final guess for a name guess only
			if (remaining <= 1 || hasWon) return
			const normalized = normalizeCharForGuessing(char)
			if (guessed.has(normalized)) return
			setGuessed(prev => new Set(prev).add(normalized))
			if (revealsAny(normalized)) {
				setCorrect(prev => new Set(prev).add(normalized))
				setResults(prev => [...prev, 'correct'])
			} else {
				setIncorrect(prev => new Set(prev).add(normalized))
				setResults(prev => [...prev, 'incorrect'])
			}
			setRemaining(prev => Math.max(0, prev - 1))
		},
		[guessed, hasWon, normalizeCharForGuessing, remaining, revealsAny]
	)

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			// Block typing guesses when only the final attempt remains
			if (hasWon || remaining <= 1) return
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
				setNameGuessed(prev => new Set(prev).add(nameValue))
				if (nameValue === card.name) {
					setHasWon(true)
					setResults(prev => [...prev, 'correct'])
				} else {
					setResults(prev => [...prev, 'incorrect'])
				}
				setRemaining(prev => Math.max(0, prev - 1))
			}
		},
		[card.name, hasWon, remaining]
	)

	// Persist state to centralized localStorage map whenever it changes
	useEffect(() => {
		if (!persistKey) return
		const toPersist: PersistedState = {
			guessed: Array.from(guessed),
			correct: Array.from(correct),
			incorrect: Array.from(incorrect),
			remaining,
			hasWon,
			nameGuessed: Array.from(nameGuessedRef.current),
			nameGuessSelection,
			results
		}
		try {
			const raw = localStorage.getItem(centralStorageKey)
			const map = raw
				? (JSON.parse(raw) as Record<string, PersistedState | undefined>)
				: {}
			map[persistKey] = toPersist
			localStorage.setItem(centralStorageKey, JSON.stringify(map))
		} catch {
			// ignore quota or serialization errors
		}
	}, [
		persistKey,
		guessed,
		correct,
		incorrect,
		remaining,
		hasWon,
		nameGuessSelection,
		results
	])

	// Fire onWin once when winning state is reached
	useEffect(() => {
		if (!hasWon || winReportedRef.current) return
		winReportedRef.current = true
		onWin?.()
	}, [hasWon, onWin])

	// Fire onLose once when losing state is reached
	useEffect(() => {
		if (!hasLost || loseReportedRef.current) return
		loseReportedRef.current = true
		onLose?.()
	}, [hasLost, onLose])

	const nameOptions = useMemo(
		() => allCardNames.map(n => ({value: n, label: n})),
		[allCardNames]
	)

	// Filter out previously guessed names (removes incorrect guesses from dropdown)
	const filteredNameOptions = useMemo(() => {
		return nameOptions.filter(o => !nameGuessed.has(o.value))
	}, [nameOptions, nameGuessed])

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
		<div className='mx-auto flex flex-col items-center gap-4 sm:gap-6 w-full max-w-3xl'>
			<div className='w-full flex justify-center'>
				{(() => {
					const isSite = card.guardian.type === 'Site'
					const wrapperSizeClasses = isSite
						? 'w-full max-w-sm sm:max-w-md md:max-w-lg'
						: 'w-full max-w-[275px] sm:max-w-[320px] md:max-w-[366px]'
					return (
						<div
							className={`relative ${wrapperSizeClasses} rounded-3xl overflow-hidden`}
						>
							<SorceryCard
								card={card}
								guessed={guessed}
								revealAll={Boolean(hasWon || hasLost)}
							/>
							<WinSparkles active={hasWon} />
							{hasWon && (
								<div className='pointer-events-none absolute inset-0 grid place-items-center rounded-3xl'>
									<span className='rounded-full bg-green-700/80 px-4 py-2 font-bold text-lg text-white shadow'>
										You win!
									</span>
								</div>
							)}
							{hasLost && (
								<div className='pointer-events-none absolute inset-0 grid place-items-center rounded-3xl'>
									<span className='rounded-full bg-red-700/80 px-4 py-2 font-bold text-lg text-white shadow'>
										You lose!
									</span>
								</div>
							)}
						</div>
					)
				})()}
			</div>
			{(() => {
				const segmentColor = (r: 'correct' | 'incorrect' | null): string => {
					if (r === 'correct') return 'bg-emerald-500'
					if (r === 'incorrect') return 'bg-red-500'
					return 'bg-slate-600/50'
				}
				const total = 7
				const segments = Array.from(
					{length: total},
					(_, i) => results[i] ?? null
				)
				const positions = Array.from({length: total}, (_, i) => `pos-${i}`)
				return (
					<div className='w-full max-w-md px-2'>
						<div className='flex gap-1'>
							{positions.map((pos, i) => (
								<div
									className={`h-2 flex-1 rounded-sm ${segmentColor(segments[i] ?? null)}`}
									key={pos}
								/>
							))}
						</div>
					</div>
				)
			})()}
			{(() => {
				if (hasWon || hasLost) {
					if (persistKey) {
						return (
							<div className='flex items-center gap-3'>
								<Button
									className='rounded-md border border-slate-300 bg-white cursor-pointer px-3 py-1 font-semibold text-slate-900 text-sm shadow hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'
									onClick={() => setResultsOpen(true)}
									type='button'
								>
									Results
								</Button>
							</div>
						)
					}
					if (endOfRoundAction) {
						return (
							<div className='flex items-center gap-3'>{endOfRoundAction}</div>
						)
					}
					return null
				}
				return (
					<div className='flex items-center gap-3'>
						<div className='rounded-md bg-black/40 px-3 py-1 font-semibold text-slate-100 text-sm'>
							Guesses left: <span className='tabular-nums'>{remaining}</span>
						</div>
					</div>
				)
			})()}
			<div className='flex flex-col sm:flex-row items-center gap-3 w-full'>
				<div className='w-full'>
					<Select<NameOption>
						inputId={`${id}-name-guess`}
						isDisabled={hasWon || remaining <= 0}
						menuPortalTarget={document.body}
						onChange={(opt: SingleValue<NameOption>) => {
							const next = opt?.value ?? ''
							setNameGuessSelection(next)
						}}
						options={filteredNameOptions}
						placeholder='Select a card name'
						styles={selectStyles}
						value={
							filteredNameOptions.find(o => o.value === nameGuessSelection) ??
							null
						}
					/>
				</div>
				<Button
					className='w-full sm:w-auto sm:flex-none whitespace-nowrap rounded-md border border-slate-300 bg-white cursor-pointer px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:opacity-50'
					disabled={!nameGuessSelection || hasWon || remaining <= 0}
					onClick={() => submitNameGuess(nameGuessSelection)}
					type='button'
				>
					Guess name
				</Button>
				{/* name guess status removed */}
			</div>
			<Keyboard
				correct={correct}
				disabled={hasWon || remaining <= 1}
				incorrect={incorrect}
				onPress={handlePress}
			/>

			<ResultsModal
				cardName={card.name}
				hasWon={hasWon}
				onClose={() => setResultsOpen(false)}
				open={resultsOpen}
				persistKey={persistKey}
				results={results}
			/>
		</div>
	)
}
