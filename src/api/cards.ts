import * as v from 'valibot'
import cards from '@/mocks/data/cards.json' with {type: 'json'}

/** Reusable pieces */
const ThresholdsSchema = v.object({
	air: v.number(),
	earth: v.number(),
	fire: v.number(),
	water: v.number()
})

const RaritySchema = v.picklist([
	'Ordinary',
	'Exceptional',
	'Elite',
	'Unique'
] as const)
const TypeSchema = v.picklist([
	'Minion',
	'Relic',
	'Site',
	'Magic',
	'Artifact',
	'Aura',
	'Avatar'
] as const)

/** Guardian/metadata block (same shape in both places) */
const GuardianSchema = v.object({
	rarity: RaritySchema,
	type: TypeSchema,
	rulesText: v.string(),
	cost: v.nullable(v.number()),
	attack: v.nullable(v.number()),
	defence: v.nullable(v.number()),
	life: v.nullable(v.number()),
	thresholds: ThresholdsSchema
})

/** Variant inside each set */
const VariantSchema = v.object({
	slug: v.string(),
	finish: v.picklist(['Standard', 'Foil'] as const),
	product: v.string(), // e.g. "Booster" (keep open in case others appear)
	artist: v.string(),
	flavorText: v.string(),
	typeText: v.string()
})

/** Set entry */
const SetEntrySchema = v.object({
	name: v.string(), // "Alpha", "Beta", ...
	// If you want stricter date validation, replace with:
	// releasedAt: v.pipe(v.string(), v.isoTimestamp())
	releasedAt: v.string(),
	metadata: GuardianSchema,
	variants: v.array(VariantSchema)
})

/** The full card */
export const CardSchema = v.object({
	name: v.string(),
	guardian: GuardianSchema,
	elements: v.string(), // e.g. "Air"
	subTypes: v.string(), // e.g. "Beast"
	sets: v.array(SetEntrySchema)
})

export type Card = v.InferOutput<typeof CardSchema>

const Cards = v.array(CardSchema)

export function getCards() {
	return Promise.resolve(v.parse(Cards, cards))
}
