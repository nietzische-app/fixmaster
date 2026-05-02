import type { DeviceId, PlayerState, Rank, RepairOutcome } from '../types';

export const RANK_THRESHOLDS: ReadonlyArray<{ rank: Rank; xp: number }> = [
  { rank: 'Cirak', xp: 0 },
  { rank: 'Kalfa', xp: 500 },
  { rank: 'Usta', xp: 2000 },
];

export const INITIAL_PLAYER: PlayerState = {
  rank: 'Cirak',
  xp: 0,
  money: 100,
  ownedTools: ['screwdriver_pentalobe_t2', 'screwdriver_phillips_00', 'spudger_basic', 'suction_cup_basic', 'tweezers_basic'],
  notebook: [],
};

export class PlayerProgress {
  static rankFor(xp: number): Rank {
    return RANK_THRESHOLDS.filter((r) => xp >= r.xp).at(-1)!.rank;
  }

  static apply(state: PlayerState, outcome: RepairOutcome, deviceId: DeviceId): PlayerState {
    if (outcome.kind !== 'success') return state;
    const xp = state.xp + outcome.reward.xp;
    const money = state.money + outcome.reward.money;
    const rank = PlayerProgress.rankFor(xp);
    const notebook = state.notebook.includes(deviceId) ? state.notebook : [...state.notebook, deviceId];
    return { ...state, xp, money, rank, notebook };
  }
}
