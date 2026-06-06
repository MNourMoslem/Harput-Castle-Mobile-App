import React from 'react';
import {
  Viro3DObject,
  ViroAmbientLight,
  ViroARPlaneSelector,
  ViroARScene,
  ViroARSceneNavigator,
  ViroDirectionalLight,
} from '@reactvision/react-viro';

import castleModel from '@/assets/modules/castle/castle.glb';

function CastleScene() {
  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={800} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0, -1, -0.2]}
        intensity={900}
      />
      <ViroARPlaneSelector>
        <Viro3DObject
          source={castleModel}
          type="GLB"
          position={[0, -0.15, -1.2]}
          scale={[0.12, 0.12, 0.12]}
          rotation={[0, 0, 0]}
        />
      </ViroARPlaneSelector>
    </ViroARScene>
  );
}

export default function ViroCastleAr() {
  return (
    <ViroARSceneNavigator
      autofocus
      initialScene={{ scene: CastleScene }}
      provider="none"
    />
  );
}