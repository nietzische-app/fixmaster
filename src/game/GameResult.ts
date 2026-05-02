import type { Device, RepairOutcome } from '../types';
import { RepairValidator } from './RepairValidator';

export class GameResult {
  static powerOn(device: Device): RepairOutcome {
    const faults = RepairValidator.validate(device);
    if (faults.length === 0) {
      return { kind: 'success', reward: device.baseReward };
    }
    return { kind: 'explosion', faults };
  }
}
