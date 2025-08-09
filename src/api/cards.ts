import * as v from "valibot";

/** Reusable pieces */
const ThresholdsSchema = v.object({
  air: v.number(),
  earth: v.number(),
  fire: v.number(),
  water: v.number(),
});

const RaritySchema = v.picklist([
  "Ordinary",
  "Exceptional",
  "Elite",
  "Legendary",
] as const);
const TypeSchema = v.picklist(["Minion", "Relic", "Site", "Spell"] as const);

/** Guardian/metadata block (same shape in both places) */
const GuardianSchema = v.object({
  rarity: RaritySchema,
  type: TypeSchema,
  rulesText: v.string(),
  cost: v.number(),
  attack: v.nullable(v.number()),
  defence: v.nullable(v.number()),
  life: v.nullable(v.number()),
  thresholds: ThresholdsSchema,
});

/** Variant inside each set */
const VariantSchema = v.object({
  slug: v.string(),
  finish: v.picklist(["Standard", "Foil"] as const),
  product: v.string(), // e.g. "Booster" (keep open in case others appear)
  artist: v.string(),
  flavorText: v.string(),
  typeText: v.string(),
});

/** Set entry */
const SetEntrySchema = v.object({
  name: v.string(), // "Alpha", "Beta", ...
  // If you want stricter date validation, replace with:
  // releasedAt: v.pipe(v.string(), v.isoTimestamp())
  releasedAt: v.string(),
  metadata: GuardianSchema,
  variants: v.array(VariantSchema),
});

/** The full card */
export const CardSchema = v.object({
  name: v.string(),
  guardian: GuardianSchema,
  elements: v.string(), // e.g. "Air"
  subTypes: v.string(), // e.g. "Beast"
  sets: v.array(SetEntrySchema),
});

export type Card = v.InferOutput<typeof CardSchema>;

const Cards = v.array(CardSchema);

export async function getCards() {
  const response = await fetch("/cards");
  if (!response.ok) {
    throw new Error("Failed to fetch");
  }
  return v.parse(Cards, await response.json());
}
