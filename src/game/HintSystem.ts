import type { Device, PartId, PlayerState, SlotId } from '../types';

export const HINT_COSTS = { xray: 50, glow: 20 } as const;

export type HintKind = keyof typeof HINT_COSTS;

export interface HintResult {
  state: PlayerState;
  reveal: { slotId: SlotId; correct: PartId }[];
}

export class HintSystem {
  static buy(state: PlayerState, kind: HintKind, device: Device): HintResult | null {
    const cost = HINT_COSTS[kind];
    if (state.money < cost) return null;
    const nextState: PlayerState = { ...state, money: state.money - cost };
    const reveal =
      kind === 'xray'
        ? Object.values(device.slots).map((s) => ({ slotId: s.id, correct: s.acceptsPartId }))
        : HintSystem.firstWrongSlot(device);
    return { state: nextState, reveal };
  }

  private static firstWrongSlot(device: Device): { slotId: SlotId; correct: PartId }[] {
    const wrong = Object.values(device.slots).find(
      (s) => s.installedPartId === null || s.installedPartId !== s.acceptsPartId,
    );
    return wrong ? [{ slotId: wrong.id, correct: wrong.acceptsPartId }] : [];
  }
}
