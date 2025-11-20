import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DIMS, getLayoutPosition, SimulationStep, SimulationConfig } from '../types';

interface Props {
  step: SimulationStep;
  config: SimulationConfig;
  onStepComplete: (nextStep: SimulationStep) => void;
}

export const Forklift: React.FC<Props> = ({ step, config, onStepComplete }) => {
  const groupRef = useRef<THREE.Group>(null);
  const forksRef = useRef<THREE.Group>(null);
  const boxRef = useRef<THREE.Mesh>(null);
  
  // Simulation Constants
  const HIGHWAY_Z = -12; // The "Main Street" coordinate where forklifts travel freely
  const AISLE_OFFSET = 1.5; // Distance from rack center to sit in the aisle
  const MOVE_SPEED = 0.25;
  const TURN_SPEED = 0.1;
  const LIFT_SPEED = 0.08;
  const HOME_POS = new THREE.Vector3(0, 0, -5);

  // Pathfinding State
  const [waypoints, setWaypoints] = useState<THREE.Vector3[]>([]);
  
  // Helper: Calculate the stopping point in the aisle for a specific address
  const getAislePosition = (s: number, r: number, l: number, slot: number) => {
    const [rx, ry, rz] = getLayoutPosition(s, r, l, slot);
    // Determine which side of the rack is the aisle.
    // Based on standard grid: X increases. Racks are blocks.
    // We want to be to the 'left' (lower X) of the rack, which is the street gap.
    return new THREE.Vector3(rx - DIMS.rackDepth - AISLE_OFFSET, 0, rz);
  };

  // Helper: Generate collision-free path (Manhattan movement)
  const calculatePath = (startPos: THREE.Vector3, targetPos: THREE.Vector3): THREE.Vector3[] => {
    const path: THREE.Vector3[] = [];

    // 1. Back out to Highway (Z Axis movement only)
    // If we are deep in an aisle (Z > HIGHWAY_Z), we must go to Highway Z first.
    if (startPos.z > HIGHWAY_Z + 1) {
      path.push(new THREE.Vector3(startPos.x, 0, HIGHWAY_Z));
    }

    // 2. Travel along Highway (X Axis movement)
    // Move to the X coordinate of the target aisle
    path.push(new THREE.Vector3(targetPos.x, 0, HIGHWAY_Z));

    // 3. Enter Aisle (Z Axis movement)
    // Move into the aisle to the target Z
    path.push(new THREE.Vector3(targetPos.x, 0, targetPos.z));

    return path;
  };

  // Effect to trigger path calculation when state changes
  useEffect(() => {
    if (!groupRef.current) return;
    const currentPos = groupRef.current.position.clone();

    if (step === 'MOVING_TO_SOURCE') {
      const target = getAislePosition(config.source.s, config.source.r, config.source.l, config.source.slot);
      setWaypoints(calculatePath(currentPos, target));
    } 
    else if (step === 'MOVING_TO_DEST') {
      const target = getAislePosition(config.dest.s, config.dest.r, config.dest.l, config.dest.slot);
      setWaypoints(calculatePath(currentPos, target));
    }
    else if (step === 'RETURNING') {
      setWaypoints(calculatePath(currentPos, HOME_POS));
    }
  }, [step, config]);


  useFrame((state, delta) => {
    if (!groupRef.current || !forksRef.current) return;

    const currentPos = groupRef.current.position;
    const currentForksY = forksRef.current.position.y;

    // --- MOVEMENT LOGIC (Consume Waypoints) ---
    const processMovement = (onDone: () => void) => {
      if (waypoints.length === 0) {
        onDone();
        return;
      }

      const nextPoint = waypoints[0];
      const direction = new THREE.Vector3().subVectors(nextPoint, currentPos);
      const dist = direction.length();

      // Rotate to face direction
      if (dist > 0.1) {
        const targetRotation = Math.atan2(direction.x, direction.z);
        // Smooth rotation
        let rotDiff = targetRotation - groupRef.current!.rotation.y;
        // Normalize angle to -PI to PI
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        
        groupRef.current!.rotation.y += rotDiff * TURN_SPEED;
      }

      // Move
      if (dist > 0.1) {
        direction.normalize();
        // Only move if we are roughly facing the right way (adds realism)
        // But for simple waypoint following, just moving is smoother
        groupRef.current!.position.add(direction.multiplyScalar(MOVE_SPEED));
      } else {
        // Reached waypoint, remove it
        setWaypoints((prev) => prev.slice(1));
      }
    };


    // --- LIFT LOGIC ---
    const liftTo = (targetY: number) => {
      if (Math.abs(currentForksY - targetY) > 0.05) {
        forksRef.current!.position.y += (targetY > currentForksY ? 1 : -1) * LIFT_SPEED;
        return false;
      }
      return true;
    };


    // --- STATE MACHINE HANDLER ---

    if (step === 'IDLE') {
       if (boxRef.current) boxRef.current.visible = false;
       // Just ensure forks are down
       liftTo(0);
    } 
    else if (step === 'MOVING_TO_SOURCE') {
      processMovement(() => onStepComplete('LIFTING_SRC'));
    }
    else if (step === 'LIFTING_SRC') {
       const [sx, sy, sz] = getLayoutPosition(config.source.s, config.source.r, config.source.l, config.source.slot);
       if (liftTo(sy - 0.5)) onStepComplete('PICKING');
    }
    else if (step === 'PICKING') {
       if (boxRef.current) boxRef.current.visible = true;
       setTimeout(() => onStepComplete('LOWERING_SRC'), 500);
    }
    else if (step === 'LOWERING_SRC') {
       if (liftTo(0.2)) onStepComplete('MOVING_TO_DEST');
    }
    else if (step === 'MOVING_TO_DEST') {
       processMovement(() => onStepComplete('LIFTING_DEST'));
    }
    else if (step === 'LIFTING_DEST') {
       const [dx, dy, dz] = getLayoutPosition(config.dest.s, config.dest.r, config.dest.l, config.dest.slot);
       if (liftTo(dy - 0.5)) onStepComplete('DROPPING');
    }
    else if (step === 'DROPPING') {
       if (boxRef.current) boxRef.current.visible = false;
       setTimeout(() => onStepComplete('LOWERING_DEST'), 500);
    }
    else if (step === 'LOWERING_DEST') {
       if (liftTo(0)) onStepComplete('RETURNING');
    }
    else if (step === 'RETURNING') {
       processMovement(() => onStepComplete('IDLE'));
    }

  });

  return (
    <group ref={groupRef} position={HOME_POS}>
      {/* Chassis */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.5, 0.8, 2.5]} />
        <meshStandardMaterial color="#facc15" /> {/* Yellow */}
      </mesh>
      
      {/* Cab/Cage */}
      <mesh position={[0, 1.8, 0.5]} castShadow>
        <boxGeometry args={[1.4, 1.6, 1.4]} />
        <meshStandardMaterial color="#1f2937" wireframe /> {/* Dark Grey Cage */}
      </mesh>
      <mesh position={[0, 2.6, 0.5]} castShadow>
        <boxGeometry args={[1.4, 0.1, 1.4]} />
        <meshStandardMaterial color="#facc15" /> {/* Roof */}
      </mesh>

      {/* Wheels */}
      <mesh position={[0.8, 0.4, 0.8]} rotation={[0, 0, Math.PI/2]}>
         <cylinderGeometry args={[0.4, 0.4, 0.3]} />
         <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.8, 0.4, 0.8]} rotation={[0, 0, Math.PI/2]}>
         <cylinderGeometry args={[0.4, 0.4, 0.3]} />
         <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.8, 0.4, -0.8]} rotation={[0, 0, Math.PI/2]}>
         <cylinderGeometry args={[0.4, 0.4, 0.3]} />
         <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.8, 0.4, -0.8]} rotation={[0, 0, Math.PI/2]}>
         <cylinderGeometry args={[0.4, 0.4, 0.3]} />
         <meshStandardMaterial color="#111" />
      </mesh>

      {/* Mast (The part that doesn't move) */}
      <group position={[0, 0, 1.4]}>
         <mesh position={[0.5, 2, 0]}>
            <boxGeometry args={[0.1, 4, 0.1]} />
            <meshStandardMaterial color="#000" />
         </mesh>
         <mesh position={[-0.5, 2, 0]}>
            <boxGeometry args={[0.1, 4, 0.1]} />
            <meshStandardMaterial color="#000" />
         </mesh>
      </group>

      {/* Moving Forks Group */}
      <group ref={forksRef} position={[0, 0, 1.4]}>
          {/* Backplate */}
          <mesh position={[0, 0.5, 0.1]}>
             <boxGeometry args={[1.2, 0.8, 0.1]} />
             <meshStandardMaterial color="#333" />
          </mesh>
          {/* Forks */}
          <mesh position={[0.3, 0.1, 0.8]}>
             <boxGeometry args={[0.15, 0.05, 1.5]} />
             <meshStandardMaterial color="#000" />
          </mesh>
          <mesh position={[-0.3, 0.1, 0.8]}>
             <boxGeometry args={[0.15, 0.05, 1.5]} />
             <meshStandardMaterial color="#000" />
          </mesh>
          
          {/* Simulated Package (Hidden unless carrying) */}
          <mesh ref={boxRef} position={[0, 0.6, 0.6]} visible={false}>
             <boxGeometry args={[0.8, 0.8, 0.8]} />
             <meshStandardMaterial color="#ca8a04" />
          </mesh>
      </group>

    </group>
  );
};