export type ToolId = string;
export type PartId = string;
export type LayerId = string;
export type SlotId = string;
export type DeviceId = string;

export type ToolKind =
  | 'screwdriver'
  | 'spudger'
  | 'tweezers'
  | 'soldering_iron'
  | 'multimeter'
  | 'suction_cup'
  | 'heat_gun';

export interface Tool {
  id: ToolId;
  name: string;
  kind: ToolKind;
  tier: number;
  price: number;
  icon: string;
}

export type PartCategory =
  | 'screw'
  | 'cover'
  | 'battery'
  | 'screen'
  | 'flex_cable'
  | 'chip'
  | 'speaker'
  | 'camera'
  | 'connector';

export interface Part {
  id: PartId;
  name: string;
  category: PartCategory;
  variant?: string;
  icon: string;
}

export interface Slot {
  id: SlotId;
  layerId: LayerId;
  acceptsPartId: PartId;
  installedPartId: PartId | null;
  tool: ToolKind;
  position: { x: number; y: number };
}

export interface Layer {
  id: LayerId;
  name: string;
  order: number;
  slots: SlotId[];
  blockingSlots: SlotId[];
}

export interface Device {
  id: DeviceId;
  name: string;
  difficulty: number;
  baseReward: { xp: number; money: number };
  layers: Layer[];
  slots: Record<SlotId, Slot>;
  decoyParts: PartId[];
}

export type Rank = 'Cirak' | 'Kalfa' | 'Usta';

export interface PlayerState {
  rank: Rank;
  xp: number;
  money: number;
  ownedTools: ToolId[];
  notebook: DeviceId[];
}

export type RepairFault =
  | { type: 'missing_part'; slotId: SlotId; expected: PartId }
  | { type: 'wrong_part'; slotId: SlotId; expected: PartId; got: PartId };

export type RepairOutcome =
  | { kind: 'success'; reward: { xp: number; money: number } }
  | { kind: 'explosion'; faults: RepairFault[] };
