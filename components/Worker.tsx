import React from 'react';

export const Worker: React.FC = () => {
  return (
    <group dispose={null} scale={[0.5, 0.5, 0.5]}>
      {/* Body */}
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 1.5, 16]} />
        <meshStandardMaterial color="#1d4ed8" /> {/* Blue Uniform */}
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffedd5" /> {/* Skin tone */}
      </mesh>

      {/* Helmet */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <sphereGeometry args={[0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#fbbf24" /> {/* Yellow Hat */}
      </mesh>

      {/* Package being held */}
      <mesh position={[0.4, 1, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#854d0e" /> {/* Brown box */}
      </mesh>

      {/* Arms (Simple boxes) */}
      <mesh position={[0, 1.2, 0.4]} rotation={[0.5, 0, 0]}>
         <boxGeometry args={[0.8, 0.2, 0.2]} />
         <meshStandardMaterial color="#1d4ed8" />
      </mesh>
    </group>
  );
};