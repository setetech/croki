import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars } from '@react-three/drei';
import { WAREHOUSE_CONFIG, DIMS, TARGET_ADDRESS, InventoryItem, SimulationStep, SimulationConfig } from '../types';
import { WarehouseElements } from './WarehouseElements';
import { OperationsCenter } from './OperationsCenter';
import { Forklift } from './Forklift';

interface SceneProps {
  showLabels: boolean;
  inventory: InventoryItem[];
  onSelectSlot: (item: InventoryItem) => void;
  simulationStep: SimulationStep;
  simulationConfig: SimulationConfig;
  setSimulationStep: (step: SimulationStep) => void;
}

const SceneContent: React.FC<SceneProps> = ({ 
  showLabels, 
  inventory, 
  onSelectSlot, 
  simulationStep, 
  simulationConfig, 
  setSimulationStep 
}) => {
  // Determine target position to focus camera initially
  const targetX = (TARGET_ADDRESS.street - 1) * (DIMS.rackDepth * 2 + DIMS.streetGap);
  const targetZ = (TARGET_ADDRESS.rack - 1) * (DIMS.rackWidth + DIMS.rackGap);
  const targetY = (TARGET_ADDRESS.level - 1) * DIMS.rackHeight;
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[-15, 25, 35]} fov={50} />
      <OrbitControls 
        target={[20, 0, 20]} 
        maxPolarAngle={Math.PI / 2.1} // Don't go below ground
        minDistance={5}
        maxDistance={150}
      />
      
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[50, 50, 25]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      >
        <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
      </directionalLight>

      <group position={[10, 0, 10]}> {/* Centering the warehouse roughly */}
        <WarehouseElements 
          showLabels={showLabels} 
          inventory={inventory}
          onSelectSlot={onSelectSlot}
        />
        <OperationsCenter />
        <Forklift 
          step={simulationStep} 
          config={simulationConfig}
          onStepComplete={setSimulationStep}
        />
      </group>
      
      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[30, -0.01, 30]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
        <gridHelper args={[200, 50, 0x444444, 0x222222]} rotation={[-Math.PI/2, 0, 0]} />
      </mesh>

      <Environment preset="city" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </>
  );
};

export const WarehouseScene: React.FC<SceneProps> = (props) => {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <color attach="background" args={['#050505']} />
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
};