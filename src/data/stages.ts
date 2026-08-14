export type ControlType = 'CCP' | 'OPRP' | 'CP'

export type StageScene = 'raw' | 'baking' | 'air' | 'fill-prep' | 'fill-lanes' | 'compress' | 'cool' | 'divide' | 'pack'

export interface Stage {
  id: string
  num: number
  title: string
  subtitle?: string
  impact?: boolean
  emoji: string
  scene: StageScene
  process: string
  machine?: string
  qaRole: string
  checks: string[]
  control: ControlType
  fix?: { wrong?: string; right: string }
}

export const STAGES: Stage[] = [
  {
    id: 'raw',
    num: 1,
    title: 'The Raw Materials',
    emoji: '📦',
    scene: 'raw',
    process:
      'The raw materials are received, prepared and checked — then put into a tank to be mixed into the dough. The dough moves to a buffer tank, ready for the next stage.',
    machine: 'Receiving Bay · Mixing Tank · Buffer Tank',
    qaRole:
      'Weigh & inspect every material before use — quality, expiry, batch. Then inspect the sieve (OPRP #1) for cuts or damage.',
    checks: [
      'Weigh materials and verify against specification',
      'Check quality and organoleptic condition',
      'Verify expiry dates and batch codes',
      'OPRP #1: inspect sieve for cuts or damage',
    ],
    control: 'OPRP',
  },
  {
    id: 'baking',
    num: 2,
    title: 'Baking',
    emoji: '🔥',
    scene: 'baking',
    process: 'The dough moves through the different zones of the oven and is baked into a crisp, golden wafer sheet.',
    machine: 'Oven · Multi-Zone',
    qaRole: 'Keep every oven zone at its set temperature — verify on the control display.',
    checks: [
      'Verify oven zone temperatures are within spec',
      'Check bake time / line speed',
      'Inspect wafer colour and crispness',
    ],
    control: 'CP',
  },
  {
    id: 'air',
    num: 3,
    title: 'Fresh Air',
    emoji: '🌬️',
    scene: 'air',
    process: 'Now a rectangular layer of wafer, it is carried through the fresh air for a while to stabilise before the next stage.',
    qaRole: 'Monitor humidity & temperature so the wafer stays crisp — flag cracked or warped sheets.',
    checks: ['Monitor relative humidity of the air', 'Confirm air temperature', 'Inspect sheets for cracks or warping'],
    control: 'CP',
  },
  {
    id: 'fill-prep',
    num: 4,
    title: 'The Filling',
    subtitle: 'Preparing the filling',
    impact: true,
    emoji: '🥣',
    scene: 'fill-prep',
    process:
      'The filling gets its own check-in! Raw materials are verified the same way as before, mixed together in a tank, then moved to a buffer tank — ready to be applied.',
    machine: 'Filling Mixing Tank · Buffer Tank',
    qaRole:
      'Re-check raw materials, then verify filling viscosity & micron against spec — and inspect the sieve (OPRP #2).',
    checks: [
      'Raw materials checked: weight, quality, expiry',
      'Filling viscosity within spec',
      'Filling micron (particle size) within spec',
      'OPRP #2: inspect sieve for cuts or damage',
    ],
    control: 'OPRP',
  },
  {
    id: 'fill-lanes',
    num: 5,
    title: 'The Filling',
    subtitle: 'Building the layers',
    emoji: '🧈',
    scene: 'fill-lanes',
    process:
      'Inside the machine the wafer sheets are divided into three paths — an upper way, a middle way and a lower way. The middle layers get the filling!',
    machine: 'Filling Machine · 3-Lane',
    fix: {
      right: 'Only the middle-layer sheets receive the filling — the top and bottom stay bare.',
    },
    qaRole: 'Confirm only the middle-layer sheets get filling — right dose, spread evenly across each sheet.',
    checks: ['Lane routing: upper / middle / lower', 'Filling applied evenly on middle layers', 'Layer thickness / spread verified'],
    control: 'CP',
  },
  {
    id: 'compress',
    num: 6,
    title: 'Compressing',
    emoji: '🗜️',
    scene: 'compress',
    process: 'As said, the sheets were divided into upper, middle and lower — now the machine presses them together into the perfect wafer.',
    machine: 'Compression Press',
    qaRole: 'Check the stack is compressed evenly — pressure in spec, layers aligned, no cracked sheets.',
    checks: ['Compression pressure within spec', 'Layers aligned and bonded evenly', 'No cracked or misshapen sheets'],
    control: 'CP',
  },
  {
    id: 'cool',
    num: 7,
    title: 'Cooling',
    emoji: '❄️',
    scene: 'cool',
    process: 'Those perfect wafer sheets go through a cooling process to reach a specific temperature.',
    machine: 'Cooling Tunnel',
    qaRole: 'Set & verify the cooling temperature so sheets exit at the target temperature.',
    checks: ['Cooling tunnel temperature verified', 'Wafer exit temperature in spec', 'Sheet integrity after cooling'],
    control: 'CP',
  },
  {
    id: 'divide',
    num: 8,
    title: 'Divider & Metal Detection',
    emoji: '🔪',
    scene: 'divide',
    process:
      'The wafer sheet is divided into awesome wafer fingers by a sharp blade — then it passes through a metal detector as a final check for any hazards.',
    machine: 'Divider Blade · Metal Detector',
    qaRole:
      'CCP here! Confirm the metal detector works: check sensitivity and re-verify with the test piece at the defined intervals.',
    checks: ['CCP: metal detector sensitivity verified', 'Test piece re-verified at defined intervals', 'Cut quality: fingers clean and even'],
    control: 'CCP',
  },
  {
    id: 'pack',
    num: 9,
    title: 'Packing & Labelling',
    emoji: '🏷️',
    scene: 'pack',
    process: 'The wafer fingers are seized, packed, labelled and stored — ready for the nearest supermarket!',
    machine: 'Packaging Line · Labeller · Store',
    qaRole:
      'Inspect every pack: seal/weld with no leaks, and labels on item, package and box — batch no., date, etc.',
    checks: [
      'Seal/weld integrity — no leaks',
      'Labels on item, package and box: batch no., date, etc.',
      'Storage conditions / palletisation verified',
    ],
    control: 'CP',
  },
]

export const CONTROL_LABEL: Record<ControlType, string> = {
  CCP: 'Critical Control Point',
  OPRP: 'Operational Prerequisite Program',
  CP: 'Control Point',
}
