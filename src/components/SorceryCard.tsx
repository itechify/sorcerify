import type {Card} from '@/api/cards'

/** ===== Helpers ===== */
type Thresholds = Card['guardian']['thresholds']

const THRESHOLD_EMOJI: Record<keyof Thresholds, string> = {
	air: '💨',
	earth: '⛰️',
	fire: '🔥',
	water: '💧'
}

function renderThresholds(t: Thresholds) {
	const parts: string[] = []
	for (const k of Object.keys(t) as (keyof Thresholds)[]) {
		const n = t[k] ?? 0
		if (n > 0) parts.push(THRESHOLD_EMOJI[k].repeat(n))
	}
	return parts.join('')
}

function statDisplay(attack: number | null, defence: number | null) {
	if (attack == null && defence == null) return ''
	if (attack === defence) return String(attack ?? defence ?? '')
	return `${attack ?? '-'}/${defence ?? '-'}`
}

/** ===== Masking (hangman) helpers ===== */
const MASKABLE_EMOJIS = new Set(Object.values(THRESHOLD_EMOJI))
const LETTER_RE = /[a-zA-Z]/
const ALNUM_RE = /[a-zA-Z0-9]/

function normalizeCharForGuessing(char: string): string {
	// Case-insensitive for letters; digits and emoji as-is
	if (LETTER_RE.test(char)) return char.toLowerCase()
	return char
}

function isMaskableChar(char: string): boolean {
	return ALNUM_RE.test(char) || MASKABLE_EMOJIS.has(char)
}

function maskText(text: string, guessed: Set<string>): string {
	let result = ''
	for (const char of text) {
		if (isMaskableChar(char)) {
			const normalized = normalizeCharForGuessing(char)
			result += guessed.has(normalized) ? char : '_'
		} else {
			result += char
		}
	}
	return result
}

/** ===== Component ===== */
export function SorceryCard({
	card,
	width = 320,
	guessed
}: {
	card: Card
	width?: number
	guessed: Set<string>
}) {
	const g = card.guardian
	const thresholdIcons = renderThresholds(g.thresholds)
	const stats = statDisplay(g.attack, g.defence)

	return (
		<div
			className='relative overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-xl'
			style={{width, aspectRatio: '395/546'}}
		>
			<div className='relative flex h-full w-full flex-col p-3'>
				{/* Top bar: cost + thresholds (left), stats (right) */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<span className='inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 font-semibold text-slate-100 tracking-wider'>
							<span className='tabular-nums'>
								{maskText(String(g.cost), guessed)}
							</span>
							{thresholdIcons && (
								<span title='Thresholds'>
									{maskText(thresholdIcons, guessed)}
								</span>
							)}
						</span>
					</div>

					{stats && (
						<div className='rounded-full bg-black/60 px-3 py-1 font-bold text-slate-100 tabular-nums tracking-wider'>
							{maskText(stats, guessed)}
						</div>
					)}
				</div>

				{/* Title */}
				<div className='mt-2 rounded-md bg-black/40 px-3 py-2 font-semibold text-lg text-slate-100 tracking-wider shadow-inner'>
					{maskText(card.name, guessed)}
				</div>

				{/* Spacer to mimic art space */}
				<div className='flex-1' />

				{/* Type line */}
				<div className='rounded-md bg-black/50 px-3 py-1 font-medium text-slate-200/90 text-sm tracking-wider'>
					{maskText(card.sets?.[0]?.variants?.[0]?.typeText ?? '', guessed)}
				</div>

				{/* Rules box */}
				<div className='mt-2 rounded-xl border border-slate-600/50 bg-black/55 p-3'>
					<p className='whitespace-pre-line text-slate-200/90 text-sm leading-snug tracking-wider'>
						{maskText(g.rulesText, guessed)}
					</p>
				</div>
			</div>
		</div>
	)
}
