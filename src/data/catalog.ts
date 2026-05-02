import type { Part, PartId, Tool, ToolId } from '../types';

export const TOOLS: Record<ToolId, Tool> = {
  screwdriver_pentalobe_t2: { id: 'screwdriver_pentalobe_t2', name: 'Pentalobe T2 Tornavida', kind: 'screwdriver', tier: 1, price: 0, icon: '🪛' },
  screwdriver_phillips_00:  { id: 'screwdriver_phillips_00',  name: 'Phillips #00 Tornavida', kind: 'screwdriver', tier: 1, price: 0, icon: '🪛' },
  spudger_basic:            { id: 'spudger_basic',            name: 'Plastik Spudger',         kind: 'spudger',     tier: 1, price: 0, icon: '🔧' },
  suction_cup_basic:        { id: 'suction_cup_basic',        name: 'Vantuz',                  kind: 'suction_cup', tier: 1, price: 0, icon: '🟠' },
  tweezers_basic:           { id: 'tweezers_basic',           name: 'Cımbız',                  kind: 'tweezers',    tier: 1, price: 0, icon: '✂️' },
  multimeter_basic:         { id: 'multimeter_basic',         name: 'Multimetre',              kind: 'multimeter',  tier: 1, price: 250, icon: '📟' },
  soldering_iron_basic:     { id: 'soldering_iron_basic',     name: 'Havya',                   kind: 'soldering_iron', tier: 1, price: 400, icon: '🔥' },
  heat_gun_basic:           { id: 'heat_gun_basic',           name: 'Sıcak Hava Tabancası',    kind: 'heat_gun',    tier: 1, price: 600, icon: '💨' },
};

export const PARTS: Record<PartId, Part> = {
  screw_pentalobe_t2:       { id: 'screw_pentalobe_t2',       name: 'Pentalobe T2 Vida',         category: 'screw',     icon: '⚙️' },
  screw_pentalobe_t3:       { id: 'screw_pentalobe_t3',       name: 'Pentalobe T3 Vida',         category: 'screw',     icon: '⚙️' },
  screw_phillips:           { id: 'screw_phillips',           name: 'Phillips Vida',             category: 'screw',     icon: '⚙️' },
  screen_oem:               { id: 'screen_oem',               name: 'Orijinal Ekran',            category: 'screen',    icon: '📱' },
  screen_clone:             { id: 'screen_clone',             name: 'Replika Ekran',             category: 'screen',    icon: '📱' },
  battery_oem_a:            { id: 'battery_oem_a',            name: 'Batarya A-1820mAh',         category: 'battery',   icon: '🔋' },
  battery_oem_b:            { id: 'battery_oem_b',            name: 'Batarya B-1500mAh',         category: 'battery',   icon: '🔋' },
  battery_connector_cover:  { id: 'battery_connector_cover',  name: 'Konnektör Kapağı',          category: 'cover',     icon: '🛡️' },
  logic_board:              { id: 'logic_board',              name: 'Anakart',                   category: 'chip',      icon: '🧩' },
  front_camera:             { id: 'front_camera',             name: 'Ön Kamera Modülü',          category: 'camera',    icon: '📷' },
};

export function partsList(ids: ReadonlyArray<PartId>): Part[] {
  return ids.map((id) => {
    const p = PARTS[id];
    if (!p) throw new Error(`Unknown part: ${id}`);
    return p;
  });
}
