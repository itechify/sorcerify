import type {CSSProperties, ReactNode} from 'react'
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
	const regex = /\((?:([FAEW])|(\d+))\)/g
	let cursor = 0
	let keyIndex = 0

	const pushMasked = (chunk: string) => {
		if (chunk) parts.push(revealAll ? chunk : maskText(chunk, guessed))
	}

	const pushToken = (token: keyof Thresholds) => {
		const isRevealed = revealAll || guessed.has(token)
		parts.push(
			<span
				className='inline-flex items-center align-text-bottom'
				key={`rt-${keyIndex++}`}
			>
				{isRevealed ? (
					<img
						alt={`${token} icon`}
						className='mx-[1px] h-4 w-4'
						height={16}
						src={THRESHOLD_ICON_SRC[token]}
						width={16}
					/>
				) : (
					<span className='mx-[1px] inline-block h-4 w-4 rounded-sm bg-slate-200/30' />
				)}
			</span>
		)
	}

	const pushCost = (num: string) => {
		const isRevealed = revealAll || guessed.has(num)
		const content = isRevealed ? num : '_'
		parts.push(
			<span
				className='ml-[2px] mr-[3px] inline-grid h-5 w-5 place-items-center rounded-full border border-slate-800/70 bg-slate-200 text-slate-900 tabular-nums text-[11px] leading-none shadow-inner align-text-bottom'
				key={`rc-${keyIndex++}`}
			>
				{content}
			</span>
		)
	}

	for (const match of text.matchAll(regex)) {
		const [full, code, num] = match
		const start = match.index ?? 0
		pushMasked(text.slice(cursor, start))

		if (code) {
			const token = CODE_TO_TOKEN.get(code)
			token ? pushToken(token) : pushMasked(full)
		} else if (num) {
			pushCost(num)
		} else {
			pushMasked(full)
		}
		cursor = start + full.length
	}

	pushMasked(text.slice(cursor))
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
	const isAvatar = g.type === 'Avatar'

	// Choose background image based on orientation
	const backgroundImageUrl = isSite
		? '/card-placeholders/AtlasBack.png'
		: '/card-placeholders/SpellbookBack.png'

	// Unified container sizing and a dark overlay for readability
	const cardDimensions = isSite
		? {width: 531, height: 380}
		: {width: 395, height: 546}

	const containerStyle: CSSProperties = {
		...cardDimensions,
		backgroundImage: `linear-gradient(to bottom, rgba(9, 13, 23, 0.72), rgba(9, 13, 23, 0.78)), url(${backgroundImageUrl})`,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: '#0b1220'
	}

	return (
		<div
			className='relative overflow-hidden rounded-3xl border border-slate-700/60 shadow-xl'
			style={containerStyle}
		>
			<div className='relative flex h-full w-full flex-col p-3'>
				{isSite ? (
					<>
						{/* For Site cards (landscape) */}
						<div className='flex-1' />
						<div className='rounded-md bg-black px-3 py-1 text-sm font-medium text-slate-200/90'>
							<div className='flex items-center justify-between gap-3'>
								<span className='truncate'>
									{show(
										`${card.name} — ${card.sets?.[0]?.variants?.[0]?.typeText ?? ''}`
									)}
								</span>
								{thresholdIcons && (
									<span
										className='rounded-md bg-black px-2 py-1 font-semibold tracking-wider text-slate-100 flex items-center'
										title='Thresholds'
									>
										{thresholdIcons}
									</span>
								)}
							</div>
						</div>
						<div className='mt-2 rounded-xl border border-slate-600/50 bg-black px-3 py-2'>
							<p className='whitespace-pre-line text-sm leading-snug tracking-wider text-slate-200/90'>
								{renderRulesText(g.rulesText, guessed, revealAll)}
							</p>
						</div>
					</>
				) : (
					<>
						{/* Top bar: cost+thresholds (left) or life for Avatars, stats (right) */}
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								{isAvatar ? (
									<span
										className='inline-flex items-center gap-2 rounded-full bg-black px-2 py-1 font-semibold tracking-wider text-slate-100'
										title='Life'
									>
										<span className='relative inline-block h-8 w-8'>
											<img
												alt='Life icon'
												className='h-8 w-8 select-none'
												height={32}
												src='/icons/blood-drop.svg'
												width={32}
											/>
											<span className='absolute inset-0 grid place-items-center text-sm font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]'>
												{show(String(g.life ?? ''))}
											</span>
										</span>
									</span>
								) : (
									<span className='inline-flex items-center gap-2 rounded-full bg-black px-2 py-1 font-semibold tracking-wider text-slate-100'>
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
								)}
							</div>

							{stats && (
								<div className='rounded-full bg-black px-3 py-1 font-bold tabular-nums tracking-wider text-slate-100'>
									{show(stats)}
								</div>
							)}
						</div>

						{/* Title */}
						<div className='mt-2 rounded-md bg-black px-3 py-2 text-lg font-semibold shadow-inner tracking-wider text-slate-100'>
							{show(card.name)}
						</div>

						{/* Spacer to mimic art space */}
						<div className='flex-1' />

						{/* Type line */}
						<div className='rounded-md bg-black px-3 py-1 text-sm font-medium tracking-wider text-slate-200/90'>
							{show(card.sets?.[0]?.variants?.[0]?.typeText ?? '')}
						</div>

						{/* Rules box */}
						<div className='mt-2 rounded-xl border border-slate-600/50 bg-black p-3'>
							<p className='whitespace-pre-line text-sm leading-snug tracking-wider text-slate-200/90'>
								{renderRulesText(g.rulesText, guessed, revealAll)}
							</p>
						</div>
					</>
				)}
			</div>
		</div>
	)
}
