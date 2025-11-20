export interface LayoutConfig {
  streets: number;
  racksPerStreet: number;
  levels: number;
  slotsPerLevel: number;
}

export const WAREHOUSE_CONFIG: LayoutConfig = {
  streets: 10,
  racksPerStreet: 20,
  levels: 4,
  slotsPerLevel: 2,
};

export const TARGET_ADDRESS = {
  street: 3,
  rack: 2,
  level: 1,
  slot: 2,
};

// Dimensions (in arbitrary 3D units, e.g., meters)
export const DIMS = {
  rackWidth: 1.5,
  rackHeight: 1, // Per level
  rackDepth: 1,
  streetGap: 3, // Width of the aisle
  rackGap: 0.2, // Spacing between racks in a row
  officeSize: { x: 10, y: 4, z: 8 },
  dockSize: { x: 4, y: 0.2, z: 6 },
};

// Helper to get exact 3D coordinates for any address
// Returns [x, y, z]
export const getLayoutPosition = (s: number, r: number, l: number, slot: number): [number, number, number] => {
  // Street X:
  // (s - 1) * (block width)
  // block width = 2 racks deep + street gap
  const streetX = (s - 1) * (DIMS.rackDepth * 2 + DIMS.streetGap);

  // Rack Z:
  const rackZ = (r - 1) * (DIMS.rackWidth + DIMS.rackGap);

  // Level Y:
  const levelY = (l - 1) * DIMS.rackHeight;

  // Slot Z Offset (relative to rack center)
  const slotOffsetZ = slot === 1 ? -DIMS.rackWidth / 4 : DIMS.rackWidth / 4;

  // The rack structure is positioned at `levelY + DIMS.rackHeight / 2`
  // But the base of the slot is `levelY`.
  // We return the center point of the slot volume.
  return [streetX, levelY + DIMS.rackHeight / 2, rackZ + slotOffsetZ];
};

export interface InventoryItem {
  id: string;
  street: number;
  rack: number;
  level: number;
  slot: number;
  qty: number;
  productCode: string;
  description: string;
  isTarget: boolean;
  isEmpty: boolean;
}

export const generateMockInventory = (): InventoryItem[] => {
  const items: InventoryItem[] = [];
  const products = [
    { code: 'EL-001', desc: 'Processador i9' },
    { code: 'EL-002', desc: 'Placa Mãe ATX' },
    { code: 'EL-003', desc: 'Memória RAM 16GB' },
    { code: 'CX-100', desc: 'Caixa de Papelão M' },
    { code: 'PL-500', desc: 'Filme Stretch' },
    { code: 'FD-010', desc: 'Teclado Mecânico' },
    { code: 'FD-011', desc: 'Mouse Gamer' },
    { code: 'MN-200', desc: 'Monitor 27"' },
  ];

  for (let s = 1; s <= WAREHOUSE_CONFIG.streets; s++) {
    for (let r = 1; r <= WAREHOUSE_CONFIG.racksPerStreet; r++) {
      for (let l = 1; l <= WAREHOUSE_CONFIG.levels; l++) {
        for (let slot = 1; slot <= WAREHOUSE_CONFIG.slotsPerLevel; slot++) {
          const isTarget =
            s === TARGET_ADDRESS.street &&
            r === TARGET_ADDRESS.rack &&
            l === TARGET_ADDRESS.level &&
            slot === TARGET_ADDRESS.slot;

          // Simulate 20% empty slots, but Target is never empty
          const isEmpty = !isTarget && Math.random() > 0.8;

          const randomProd = products[Math.floor(Math.random() * products.length)];
          
          items.push({
            id: `${s}-${r}-${l}-${slot}`,
            street: s,
            rack: r,
            level: l,
            slot: slot,
            qty: isEmpty ? 0 : Math.floor(Math.random() * 50) + 1,
            productCode: isTarget ? 'TARGET-001' : (isEmpty ? '-' : randomProd.code),
            description: isTarget ? 'ENCOMENDA ESPECIAL' : (isEmpty ? 'Vazio' : randomProd.desc),
            isTarget,
            isEmpty
          });
        }
      }
    }
  }
  return items;
};

export type SimulationStep = 
  | 'IDLE' 
  | 'MOVING_TO_SOURCE' 
  | 'LIFTING_SRC' 
  | 'PICKING' 
  | 'LOWERING_SRC' 
  | 'MOVING_TO_DEST' 
  | 'LIFTING_DEST' 
  | 'DROPPING' 
  | 'LOWERING_DEST' 
  | 'RETURNING';

export interface SimulationConfig {
  source: { s: number; r: number; l: number; slot: number };
  dest: { s: number; r: number; l: number; slot: number };
}