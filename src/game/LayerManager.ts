import type { Device, Layer, LayerId, PartId, Slot, SlotId, ToolKind } from '../types';

export type ActionResult =
  | { ok: true }
  | { ok: false; reason: 'layer_locked' | 'slot_occupied' | 'slot_empty' | 'wrong_tool' | 'unknown_slot' };

export class LayerManager {
  constructor(private readonly device: Device) {}

  layer(id: LayerId): Layer {
    const l = this.device.layers.find((x) => x.id === id);
    if (!l) throw new Error(`Unknown layer: ${id}`);
    return l;
  }

  slot(id: SlotId): Slot | undefined {
    return this.device.slots[id];
  }

  isLayerAccessible(layerId: LayerId): boolean {
    const target = this.layer(layerId);
    return this.device.layers
      .filter((l) => l.order < target.order)
      .every((l) => l.blockingSlots.every((sid) => this.device.slots[sid].installedPartId === null));
  }

  accessibleSlots(): Slot[] {
    return this.device.layers
      .filter((l) => this.isLayerAccessible(l.id))
      .flatMap((l) => l.slots.map((sid) => this.device.slots[sid]));
  }

  install(slotId: SlotId, partId: PartId, tool: ToolKind): ActionResult {
    const slot = this.slot(slotId);
    if (!slot) return { ok: false, reason: 'unknown_slot' };
    if (!this.isLayerAccessible(slot.layerId)) return { ok: false, reason: 'layer_locked' };
    if (slot.installedPartId !== null) return { ok: false, reason: 'slot_occupied' };
    if (slot.tool !== tool) return { ok: false, reason: 'wrong_tool' };
    slot.installedPartId = partId;
    return { ok: true };
  }

  remove(slotId: SlotId, tool: ToolKind): ActionResult & { removed?: PartId } {
    const slot = this.slot(slotId);
    if (!slot) return { ok: false, reason: 'unknown_slot' };
    if (!this.isLayerAccessible(slot.layerId)) return { ok: false, reason: 'layer_locked' };
    if (slot.installedPartId === null) return { ok: false, reason: 'slot_empty' };
    if (slot.tool !== tool) return { ok: false, reason: 'wrong_tool' };
    const removed = slot.installedPartId;
    slot.installedPartId = null;
    return { ok: true, removed };
  }

  snapshot(): Device {
    return JSON.parse(JSON.stringify(this.device)) as Device;
  }
}
