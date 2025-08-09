import type {ReactNode} from 'react'
import type {Card} from '@/api/cards'

/** ===== Helpers ===== */
type Thresholds = Card['guardian']['thresholds']

// Internal threshold keys used for guessing and masking
const THRESHOLD_KEYS = ['air', 'earth', 'fire', 'water'] as const

// Image sources for thresholds (served from /public)
const THRESHOLD_ICON_SRC: Record<keyof Thresholds, string> = {
	air: '/threshold-icons/wind.png',
	earth: '/threshold-icons/earth.png',
	fire: '/threshold-icons/fire.png',
	water: '/threshold-icons/water.png'
}

// Render thresholds as images; reveal is controlled by guessed/revealAll
function renderThresholdImages(
	t: Thresholds,
	guessed: Set<string>,
	revealAll: boolean
) {
	const nodes: ReactNode[] = []
	for (const k of Object.keys(t) as (keyof Thresholds)[]) {
		const count = t[k] ?? 0
		if (count <= 0) continue
		const token = k
		for (let i = 0; i < count; i++) {
			const showIcon = revealAll || guessed.has(token)
			nodes.push(
				<span className='inline-flex items-center' key={`${k}-${i}`}>
					{showIcon ? (
						<img
							alt={`${k} threshold`}
							className='h-4 w-4'
							height={16}
							src={THRESHOLD_ICON_SRC[k]}
							width={16}
						/>
					) : (
						<span className='inline-block h-4 w-4 rounded-sm bg-slate-200/30' />
					)}
				</span>
			)
		}
	}
	if (nodes.length === 0) return null
	return <span className='inline-flex items-center gap-1'>{nodes}</span>
}

// Render rules text with inline threshold icons: (F)(A)(E)(W) -> images
const CODE_TO_TOKEN = new Map<string, keyof Thresholds>([
	['F', 'fire'],
	['A', 'air'],
	['E', 'earth'],
	['W', 'water']
])

function renderRulesText(
	text: string,
	guessed: Set<string>,
	revealAll: boolean
): ReactNode {
	const parts: ReactNode[] = []
	const regex = /\(([FAEW])\)/g
	let lastIndex = 0
	let keyIndex = 0
	const pushMasked = (chunk: string) => {
		if (!chunk) return
		parts.push(revealAll ? chunk : maskText(chunk, guessed))
	}
	for (const match of text.matchAll(regex)) {
		const full = match[0]
		const code = match[1] ?? ''
		const start = match.index ?? 0
		if (start > lastIndex) pushMasked(text.slice(lastIndex, start))
		const token = CODE_TO_TOKEN.get(code)
		if (token == null) {
			pushMasked(full)
		} else {
			const narrowed = token as keyof Thresholds
			const isRevealed = revealAll || guessed.has(narrowed)
			parts.push(
				<span
					className='inline-flex items-center align-text-bottom'
					key={`rt-${keyIndex++}`}
				>
					{isRevealed ? (
						<img
							alt={`${narrowed} icon`}
							className='mx-[1px] h-4 w-4'
							height={16}
							src={THRESHOLD_ICON_SRC[narrowed]}
							width={16}
						/>
					) : (
						<span className='mx-[1px] inline-block h-4 w-4 rounded-sm bg-slate-200/30' />
					)}
				</span>
			)
		}
		lastIndex = start + full.length
	}
	if (lastIndex < text.length) pushMasked(text.slice(lastIndex))
	return parts
}

function statDisplay(attack: number | null, defence: number | null) {
	if (attack == null && defence == null) return ''
	if (attack === defence) return String(attack ?? defence ?? '')
	return `${attack ?? '-'}/${defence ?? '-'}`
}

/** ===== Masking (hangman) helpers ===== */
const MASKABLE_TOKENS = new Set<string>(THRESHOLD_KEYS)
const LETTER_RE = /[a-zA-Z]/
const ALNUM_RE = /[a-zA-Z0-9]/

function normalizeCharForGuessing(char: string): string {
	// Case-insensitive for letters; pass-through for tokens
	if (LETTER_RE.test(char)) return char.toLowerCase()
	return char
}

function isMaskableChar(char: string): boolean {
	return ALNUM_RE.test(char) || MASKABLE_TOKENS.has(char)
}

function maskText(text: string, guessed: Set<string>): string {
	let result = ''
	for (const char of text) {
		if (isMaskableChar(char)) {
			const normalized = normalizeCharForGuessing(char)
			const hit = guessed.has(normalized)
			result += hit ? char : '_'
		} else {
			result += char
		}
	}
	return result
}

/** ===== Component ===== */
export function SorceryCard({
	card,
	guessed,
	revealAll = false
}: {
	card: Card
	guessed: Set<string>
	revealAll?: boolean
}) {
	const g = card.guardian
	const thresholdIcons = renderThresholdImages(g.thresholds, guessed, revealAll)
	const stats = statDisplay(g.attack, g.defence)

	const show = (text: string) => (revealAll ? text : maskText(text, guessed))
	const isSite = g.type === 'Site'

	return (
		<div
			className='relative overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-xl'
			style={isSite ? {width: 531, height: 380} : {width: 395, height: 546}}
		>
			<div className='relative flex h-full w-full flex-col p-3'>
				{isSite ? (
					<>
						{/* For Site cards (landscape) */}
						<div className='flex-1' />
						<div className='rounded-md bg-black/50 px-3 py-1 text-sm font-medium text-slate-200/90'>
							<div className='flex items-center justify-between gap-3'>
								<span className='truncate'>
									{show(
										`${card.name} — ${card.sets?.[0]?.variants?.[0]?.typeText ?? ''}`
									)}
								</span>
								{thresholdIcons && (
									<span
										className='rounded-md bg-black/40 px-2 py-1 font-semibold tracking-wider text-slate-100 flex items-center'
										title='Thresholds'
									>
										{thresholdIcons}
									</span>
								)}
							</div>
						</div>
						<div className='mt-2 rounded-xl border border-slate-600/50 bg-black/55 px-3 py-2'>
							<p className='whitespace-pre-line text-sm leading-snug tracking-wider text-slate-200/90'>
								{renderRulesText(g.rulesText, guessed, revealAll)}
							</p>
						</div>
					</>
				) : (
					<>
						{/* Top bar: cost + thresholds (left), stats (right) */}
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<span className='inline-flex items-center gap-2 rounded-full bg-black/50 px-2 py-1 font-semibold tracking-wider text-slate-100'>
									<span
										className='grid h-7 w-7 place-items-center rounded-full border border-slate-800/70 bg-slate-200 text-slate-900 tabular-nums text-sm shadow-inner'
										title='Cost'
									>
										{show(String(g.cost))}
									</span>
									{thresholdIcons && (
										<span
											className='inline-flex items-center'
											title='Thresholds'
										>
											{thresholdIcons}
										</span>
									)}
								</span>
							</div>

							{stats && (
								<div className='rounded-full bg-black/60 px-3 py-1 font-bold tabular-nums tracking-wider text-slate-100'>
									{show(stats)}
								</div>
							)}
						</div>

						{/* Title */}
						<div className='mt-2 rounded-md bg-black/40 px-3 py-2 text-lg font-semibold shadow-inner tracking-wider text-slate-100'>
							{show(card.name)}
						</div>

						{/* Spacer to mimic art space */}
						<div className='flex-1' />

						{/* Type line */}
						<div className='rounded-md bg-black/50 px-3 py-1 text-sm font-medium tracking-wider text-slate-200/90'>
							{show(card.sets?.[0]?.variants?.[0]?.typeText ?? '')}
						</div>

						{/* Rules box */}
						<div className='mt-2 rounded-xl border border-slate-600/50 bg-black/55 p-3'>
							<p className='whitespace-pre-line text-sm leading-snug tracking-wider text-slate-200/90'>
								{show(g.rulesText)}
							</p>
						</div>
					</>
				)}
			</div>
		</div>
	)
}
