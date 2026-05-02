import type { Device, RepairFault } from '../types';

export class RepairValidator {
  static validate(device: Device): RepairFault[] {
    const faults: RepairFault[] = [];
    for (const slot of Object.values(device.slots)) {
      if (slot.installedPartId === null) {
        faults.push({ type: 'missing_part', slotId: slot.id, expected: slot.acceptsPartId });
      } else if (slot.installedPartId !== slot.acceptsPartId) {
        faults.push({
          type: 'wrong_part',
          slotId: slot.id,
          expected: slot.acceptsPartId,
          got: slot.installedPartId,
        });
      }
    }
    return faults;
  }

  static isComplete(device: Device): boolean {
    return RepairValidator.validate(device).length === 0;
  }
}
