// src/constants/assetTypes.js

export const ASSET_TYPE_LABELS = {
  data_sheet:            'Data Sheet',
  solution_brief:        'Solution Brief',
  brochure:              'Brochure',
  presentation:          'Presentation',
  positioning_statement: 'Positioning Statement',
  messaging:             'Messaging',
  battle_card:           'Battle Card',
  ebook:                 'eBook',
  white_paper:           'White Paper',
  other:                 'Other / Unspecified',
}

export const ASSET_TYPE_OPTIONS = Object.entries(ASSET_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

export const ASSET_TYPE_WEIGHTS = {
  data_sheet:            { persuasion: 15, clarity: 35, differentiation: 15, buyer_fit: 35 },
  solution_brief:        { persuasion: 30, clarity: 20, differentiation: 20, buyer_fit: 30 },
  brochure:              { persuasion: 35, clarity: 25, differentiation: 20, buyer_fit: 20 },
  presentation:          { persuasion: 30, clarity: 30, differentiation: 15, buyer_fit: 25 },
  positioning_statement: { persuasion:  0, clarity: 50, differentiation: 30, buyer_fit: 20 },
  messaging:             { persuasion: 10, clarity: 45, differentiation: 20, buyer_fit: 25 },
  battle_card:           { persuasion: 20, clarity: 25, differentiation: 45, buyer_fit: 10 },
  ebook:                 { persuasion: 35, clarity: 25, differentiation: 15, buyer_fit: 25 },
  white_paper:           { persuasion: 25, clarity: 25, differentiation: 25, buyer_fit: 25 },
  other:                 { persuasion: 30, clarity: 20, differentiation: 25, buyer_fit: 25 },
}

export const ASSET_TYPE_RUBRICS = {
  data_sheet: `EVALUATE AS A DATA SHEET. The persona should ask: do the listed
capabilities match my actual evaluation criteria? Are integrations and
specifications concrete and current? Is this skimmable in two minutes?
Buyer Fit and Clarity dominate this asset type. Persuasion is minor —
data sheets do not persuade, they inform.`,

  solution_brief: `EVALUATE AS A SOLUTION BRIEF. The persona should ask:
does this position a use case I actually have? Is the value proposition
tied to outcomes I'm measured on? Does it speak to my role or to a
generic reader? Solution briefs need to thread persuasion, clarity,
and buyer fit equally.`,

  brochure: `EVALUATE AS A BROCHURE. Awareness piece. The persona should
ask: did this hook my attention? Did it create category clarity?
Would I take a follow-up meeting? Persuasion and hook strength matter most.`,

  presentation: `EVALUATE AS A PRESENTATION. The persona should ask: do
the slides read clearly without narration? Does the structure carry me
through the argument? Clarity matters disproportionately.`,

  positioning_statement: `EVALUATE AS AN INTERNAL POSITIONING STATEMENT.
This is NOT customer-facing. Persuasion is IRRELEVANT. Score on category clarity,
target buyer specificity, competitive frame defensibility, and team-aligning power.`,

  messaging: `EVALUATE AS INTERNAL MESSAGING. NOT customer-facing.
Score on whether the team can use this consistently and defensibly.
Are the canonical phrasings sharp? Are the proof points current? Clarity dominates.`,

  battle_card: `EVALUATE AS A BATTLE CARD. Internal sales tool aimed at a
specific competitor. Can a salesperson skim this in 60 seconds DURING a competitor
objection in a real call? Differentiation is the entire job of this asset.`,

  ebook: `EVALUATE AS AN E-BOOK. Long-form attention earner. Does this keep selling
page after page? Does the educational content earn the reader's continued time?
Persuasion and clarity dominate.`,

  white_paper: `EVALUATE AS A WHITE PAPER. Does the argument survive expert scrutiny?
Is the methodology defensible? Would I forward this internally? White papers must be
balanced across all four dimensions — failure on any one is a failure overall.`,

  other: `EVALUATE AS A GENERAL MARKETING ASSET. Apply the four-dimension
framework with default weights. Persona should ask: who is this for,
what is it asking me to do, and does it earn my time?`,
}

export const LINE_OF_BUSINESS_OPTIONS = [
  'Personal Auto / Motor',
  'Homeowners',
  'General Liability',
  'Small Commercial',
  'Mid-to-Large Commercial',
  'Complex Commercial',
  "Workers' Compensation",
  'Casualty',
  'Excess & Surplus (E&S)',
  'Specialty',
]

export const COMPETITOR_OPTIONS = [
  'Akur8', 'Anthropic', 'Cotality', 'Duck Creek', 'Earnix', 'EIS', 'Federato',
  'Insurity', 'Kalepa', 'Majesco', 'OpenAI', 'Palantir', 'Sapiens',
  'ServiceNow', 'Verisk', 'Willis Towers Watson',
]
