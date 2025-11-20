import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { WAREHOUSE_CONFIG, DIMS, InventoryItem, getLayoutPosition } from '../types';
import { Worker } from './Worker';

interface Props {
  showLabels: boolean;
  inventory: InventoryItem[];
  onSelectSlot: (item: InventoryItem) => void;
}

// A specialized component for the indicator arrow to make it bounce
const BouncingArrow = ({ position }: { position: [number, number, number] }) => {
  const arrowRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (arrowRef.current) {
      arrowRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 3) * 0.3;
    }
  });

  return (
    <group ref={arrowRef} position={position}>
      {/* Arrow Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <coneGeometry args={[0.3, 0.8, 32]} />
        <meshStandardMaterial color="#ef4444" emissive="#7f1d1d" />
      </mesh>
      {/* Text Label */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="black"
      >
        AQUI
      </Text>
    </group>
  );
};

export const WarehouseElements: React.FC<Props> = ({ showLabels, inventory, onSelectSlot }) => {
  const { items } = useMemo(() => {
    const items = [];
    
    // Create a quick lookup map for inventory items by ID
    const inventoryMap = new Map<string, InventoryItem>();
    inventory.forEach(item => inventoryMap.set(item.id, item));

    for (let s = 1; s <= WAREHOUSE_CONFIG.streets; s++) {
      for (let r = 1; r <= WAREHOUSE_CONFIG.racksPerStreet; r++) {
        for (let l = 1; l <= WAREHOUSE_CONFIG.levels; l++) {
          for (let slot = 1; slot <= WAREHOUSE_CONFIG.slotsPerLevel; slot++) {
            
            const id = `${s}-${r}-${l}-${slot}`;
            const inventoryItem = inventoryMap.get(id);

            // Use centralized logic for position
            const pos = getLayoutPosition(s, r, l, slot);

            if (inventoryItem) {
              items.push({
                key: id,
                position: pos,
                data: inventoryItem
              });
            }
          }
        }
      }
    }
    return { items };
  }, [inventory]);

  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <group>
      {items.map(({ key, position, data }) => {
        // Determine color based on state
        let color = '#a16207'; // Default Occupied (Brownish/Gold)
        let opacity = 1;
        let transparent = false;

        if (data.isTarget) {
          color = '#22c55e'; // Bright Green
        } else if (data.isEmpty) {
          color = '#4b5563'; // Dark Gray for empty
          opacity = 0.3;
          transparent = true;
        } else {
          // Occupied standard
          color = '#ca8a04'; // Cardboard box color
        }

        // Highlight on hover
        if (hovered === key) {
           color = '#3b82f6'; // Blue highlight
           opacity = 1;
        }

        return (
          <group key={key} position={position}>
            <mesh 
              castShadow 
              receiveShadow
              onClick={(e) => {
                e.stopPropagation();
                onSelectSlot(data);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(key);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                setHovered(null);
                document.body.style.cursor = 'auto';
              }}
            >
              <boxGeometry args={[DIMS.rackDepth, DIMS.rackHeight - 0.1, (DIMS.rackWidth / 2) - 0.1]} />
              <meshStandardMaterial
                color={color}
                roughness={0.6}
                metalness={0.1}
                transparent={transparent}
                opacity={opacity}
              />
              
              {/* Wireframe for empty slots to show structure */}
              {data.isEmpty && (
                 <lineSegments>
                  <edgesGeometry args={[new THREE.BoxGeometry(DIMS.rackDepth, DIMS.rackHeight - 0.1, (DIMS.rackWidth / 2) - 0.1)]} />
                  <lineBasicMaterial color="#64748b" linewidth={1} transparent opacity={0.5} />
                </lineSegments>
              )}
            </mesh>

            {/* Visual Aids for Target */}
            {data.isTarget && (
              <>
                 <group position={[0.8, -DIMS.rackHeight/2, 0]}>
                    <Worker />
                 </group>
                 <BouncingArrow position={[0, 1, 0]} />
                 <spotLight 
                   position={[2, 5, 0]} 
                   angle={0.5} 
                   penumbra={0.5} 
                   intensity={2} 
                   color="#ffff00" 
                   castShadow 
                   target={new THREE.Object3D()}
                 />
              </>
            )}
          </group>
        );
      })}

      {/* Street Labels */}
      {showLabels && Array.from({ length: WAREHOUSE_CONFIG.streets }).map((_, i) => {
         const streetX = i * (DIMS.rackDepth * 2 + DIMS.streetGap);
         return (
           <group key={`label-${i}`} position={[streetX, 0.1, -2]}>
             <Text
               rotation={[-Math.PI / 2, 0, 0]}
               fontSize={1.5}
               color="#60a5fa"
               anchorX="center"
               anchorY="middle"
             >
               {`Rua ${i + 1}`}
             </Text>
           </group>
         )
      })}
    </group>
  );
};