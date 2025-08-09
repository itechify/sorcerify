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
const VS_REGEX = /\uFE0E|\uFE0F/g
const MASKABLE_EMOJIS = new Set(
	Object.values(THRESHOLD_EMOJI).map(e => e.replace(VS_REGEX, ''))
)
const LETTER_RE = /[a-zA-Z]/
const ALNUM_RE = /[a-zA-Z0-9]/

function normalizeCharForGuessing(char: string): string {
	// Case-insensitive for letters; strip emoji variation selectors for others
	if (LETTER_RE.test(char)) return char.toLowerCase()
	return char.replace(VS_REGEX, '')
}

function isMaskableChar(char: string): boolean {
	const normalized = char.replace(VS_REGEX, '')
	return ALNUM_RE.test(char) || MASKABLE_EMOJIS.has(normalized)
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
	const thresholdIcons = renderThresholds(g.thresholds)
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
										className='rounded-md bg-black/40 px-2 py-1 font-semibold tracking-wider text-slate-100'
										title='Thresholds'
									>
										{show(thresholdIcons)}
									</span>
								)}
							</div>
						</div>
						<div className='mt-2 rounded-xl border border-slate-600/50 bg-black/55 px-3 py-2'>
							<p className='whitespace-pre-line text-sm leading-snug tracking-wider text-slate-200/90'>
								{show(g.rulesText)}
							</p>
						</div>
					</>
				) : (
					<>
						{/* Top bar: cost + thresholds (left), stats (right) */}
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<span className='inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 font-semibold tracking-wider text-slate-100'>
									<span className='tabular-nums'>{show(String(g.cost))}</span>
									{thresholdIcons && (
										<span title='Thresholds'>{show(thresholdIcons)}</span>
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
