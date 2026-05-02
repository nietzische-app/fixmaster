import type { Device } from '../../types';

export function createSmartphone(): Device {
  return {
    id: 'smartphone_basic',
    name: 'Akıllı Telefon',
    difficulty: 1,
    baseReward: { xp: 120, money: 80 },
    decoyParts: ['screw_pentalobe_t3', 'screen_clone', 'battery_oem_b', 'screw_phillips'],
    layers: [
      {
        id: 'l0_outer_screws',
        name: 'Dış Vidalar',
        order: 0,
        slots: ['screw_bl', 'screw_br'],
        blockingSlots: ['screw_bl', 'screw_br'],
      },
      {
        id: 'l1_screen',
        name: 'Ekran',
        order: 1,
        slots: ['screen'],
        blockingSlots: ['screen'],
      },
      {
        id: 'l2_internals',
        name: 'İç Bileşenler',
        order: 2,
        slots: ['batt_cover', 'battery', 'logic_board', 'front_cam'],
        blockingSlots: [],
      },
    ],
    slots: {
      screw_bl: {
        id: 'screw_bl', layerId: 'l0_outer_screws',
        acceptsPartId: 'screw_pentalobe_t2', installedPartId: 'screw_pentalobe_t2',
        tool: 'screwdriver', position: { x: 0.32, y: 0.94 },
      },
      screw_br: {
        id: 'screw_br', layerId: 'l0_outer_screws',
        acceptsPartId: 'screw_pentalobe_t2', installedPartId: 'screw_pentalobe_t2',
        tool: 'screwdriver', position: { x: 0.68, y: 0.94 },
      },
      screen: {
        id: 'screen', layerId: 'l1_screen',
        acceptsPartId: 'screen_oem', installedPartId: 'screen_oem',
        tool: 'suction_cup', position: { x: 0.5, y: 0.42 },
      },
      batt_cover: {
        id: 'batt_cover', layerId: 'l2_internals',
        acceptsPartId: 'battery_connector_cover', installedPartId: 'battery_connector_cover',
        tool: 'screwdriver', position: { x: 0.5, y: 0.55 },
      },
      battery: {
        id: 'battery', layerId: 'l2_internals',
        acceptsPartId: 'battery_oem_a', installedPartId: 'battery_oem_b',
        tool: 'spudger', position: { x: 0.5, y: 0.72 },
      },
      logic_board: {
        id: 'logic_board', layerId: 'l2_internals',
        acceptsPartId: 'logic_board', installedPartId: 'logic_board',
        tool: 'spudger', position: { x: 0.5, y: 0.30 },
      },
      front_cam: {
        id: 'front_cam', layerId: 'l2_internals',
        acceptsPartId: 'front_camera', installedPartId: 'front_camera',
        tool: 'tweezers', position: { x: 0.5, y: 0.15 },
      },
    },
  };
}
