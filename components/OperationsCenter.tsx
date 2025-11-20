import React from 'react';
import { Text } from '@react-three/drei';
import { DIMS, WAREHOUSE_CONFIG } from '../types';

export const OperationsCenter: React.FC = () => {
  // New Position: Office at the front corner (Before Street 1, Left side)
  const officePos: [number, number, number] = [-8, DIMS.officeSize.y / 2, -10];
  
  // Calculate total width of warehouse for floor lines
  const totalWidth = WAREHOUSE_CONFIG.streets * (DIMS.rackDepth * 2 + DIMS.streetGap);

  return (
    <group>
      {/* OFFICE */}
      <group position={officePos}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[DIMS.officeSize.x, DIMS.officeSize.y, DIMS.officeSize.z]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Windows facing the warehouse */}
        <mesh position={[DIMS.officeSize.x/2 + 0.01, 0, 0]} rotation={[0, Math.PI/2, 0]}>
           <planeGeometry args={[DIMS.officeSize.z - 2, DIMS.officeSize.y - 1.5]} />
           <meshStandardMaterial color="#93c5fd" emissive="#60a5fa" emissiveIntensity={0.2} />
        </mesh>
        
        {/* Roof Label */}
        <Text
          position={[0, DIMS.officeSize.y / 2 + 0.1, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={1}
          color="white"
        >
          ESCRITÓRIO
        </Text>
      </group>

      {/* DOCKS - Now facing the streets (Z Axis) */}
      <group position={[10, 0, -15]}>
        {Array.from({ length: 5 }).map((_, i) => {
            const xOffset = i * 8; 
            return (
                <group key={`dock-${i}`} position={[xOffset, 0, 0]}>
                    {/* Platform */}
                    <mesh receiveShadow position={[0, 0.5, 0]}>
                        <boxGeometry args={[5, 1, 6]} />
                        <meshStandardMaterial color="#d97706" /> 
                    </mesh>
                    
                    {/* Dock Door Frame */}
                    <mesh position={[0, 1.5, 2.9]}>
                         <boxGeometry args={[5, 3, 0.2]} />
                         <meshStandardMaterial color="#4b5563" />
                    </mesh>
                    {/* Door Shutter */}
                     <mesh position={[0, 1.5, 2.95]}>
                         <planeGeometry args={[3, 2.5]} />
                         <meshStandardMaterial color="#1f2937" />
                    </mesh>

                    {/* Label */}
                    <Text
                        position={[0, 3.5, 3]}
                        fontSize={0.8}
                        color="white"
                        anchorY="bottom"
                    >
                        {`DOCA ${i+1}`}
                    </Text>
                </group>
            )
        })}
      </group>
      
      {/* FLOOR MARKINGS & SAFETY LINES */}
      <group position={[0, 0.02, 0]}>
        
        {/* 1. Main Highway Safety Line (Yellow) - Separates Docks from Aisles */}
        {/* Running along X axis at Z = -6 roughly */}
        <mesh position={[totalWidth / 2, 0, -6]} rotation={[-Math.PI/2, 0, 0]}>
           <planeGeometry args={[totalWidth + 40, 0.3]} />
           <meshStandardMaterial color="#fbbf24" />
        </mesh>

        {/* 2. Pedestrian Walkway (Zebra Crossing near Office) */}
        <group position={[-2, 0, -10]}>
           {Array.from({ length: 8 }).map((_, i) => (
             <mesh key={`cross-${i}`} position={[0, 0, i * 1.2]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[3, 0.6]} />
                <meshStandardMaterial color="#fbbf24" />
             </mesh>
           ))}
        </group>

        {/* 3. Pedestrian Zone Outline (Around Office) */}
        <mesh position={[-8, 0, -10]} rotation={[-Math.PI/2, 0, 0]}>
            <ringGeometry args={[6, 6.2, 32]} />
            <meshStandardMaterial color="#fbbf24" />
        </mesh>
        <Text
          position={[-8, 0.1, -5]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.5}
          color="#fbbf24"
        >
          ÁREA DE PEDESTRES
        </Text>

        {/* 4. Forklift Highway Lanes (Dotted line in the middle of the apron) */}
        {Array.from({ length: 20 }).map((_, i) => (
             <mesh key={`lane-${i}`} position={[-10 + (i * 5), 0, -10]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[2, 0.15]} />
                <meshStandardMaterial color="#fbbf24" />
             </mesh>
        ))}

      </group>
      
      {/* Pavement connecting Office and Docks */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[20, 0.01, -12]} receiveShadow>
          <planeGeometry args={[150, 20]} />
          <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
};