import React, { useRef, useState, useEffect, Suspense } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, PanResponder } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';
import * as THREE from 'three';

// Separate ref to drive transforms from outside without re-rendering Castle
const castleTransform = {
  position: new THREE.Vector3(0, -0.5, -3),
  rotation: new THREE.Euler(0, 0, 0),
  scale: 1,
};

function Castle({ onLoaded }: { onLoaded: () => void }) {
  const { scene } = useGLTF(require('@/assets/modules/castle/castle.glb'));
  const groupRef = useRef<THREE.Group>(null);
  const normalizedScale = useRef(1);

  useEffect(() => {
    if (!groupRef.current) return;

    const box = new THREE.Box3().expandByObject(groupRef.current) && new THREE.Box3();
    box.expandByObject(groupRef.current);

    const size   = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const biggest = Math.max(size.x, size.y, size.z);
    if (biggest === 0) return;

    const TARGET_SIZE = 2;
    normalizedScale.current = TARGET_SIZE / biggest;

    // Apply base normalization directly to the scene, not the group
    // so the group is free to be driven by user transforms
    scene.scale.setScalar(normalizedScale.current);
    scene.position.set(
      -center.x * normalizedScale.current,
      -center.y * normalizedScale.current,
      -center.z * normalizedScale.current,
    );

    onLoaded();
  }, [scene]);

  // Drive the group every frame from the shared transform object
  // avoids React re-renders on every drag tick
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    let animId: number;
    const tick = () => {
      group.position.copy(castleTransform.position);
      group.rotation.copy(castleTransform.rotation);
      group.scale.setScalar(castleTransform.scale);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

function LoadingOverlay() {
  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.hintText}>Loading castle…</Text>
    </View>
  );
}

type Mode = 'rotate' | 'move';

export default function CastleAR() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [placed,  setPlaced]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode,    setMode]    = useState<Mode>('rotate');

  const lastTouch = useRef<{ x: number; y: number } | null>(null);

  // Reset transform when placing fresh
  function handlePlace() {
    castleTransform.position.set(0, -0.5, -3);
    castleTransform.rotation.set(0, 0, 0);
    castleTransform.scale = 1;
    setPlaced(true);
    setLoading(true);
  }

  function handleReset() {
    castleTransform.position.set(0, -0.5, -3);
    castleTransform.rotation.set(0, 0, 0);
    castleTransform.scale = 1;
    setPlaced(false);
    setLoading(false);
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => placed && !loading,
    onMoveShouldSetPanResponder:  () => placed && !loading,

    onPanResponderGrant: (e) => {
      lastTouch.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    },

    onPanResponderMove: (e) => {
      if (!lastTouch.current) return;
      const dx = e.nativeEvent.pageX - lastTouch.current.x;
      const dy = e.nativeEvent.pageY - lastTouch.current.y;
      lastTouch.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };

      if (mode === 'rotate') {
        castleTransform.rotation.x += dy * 0.01;
        castleTransform.rotation.y += dx * 0.01;
      } else {
        castleTransform.position.x += dx * 0.01;
        castleTransform.position.y -= dy * 0.01;
      }
    },

    onPanResponderRelease: () => { lastTouch.current = null; },
  });

  if (!permission) return null;

  if (!permission.granted) return (
    <View style={styles.center}>
      <Text style={styles.text}>Camera access needed</Text>
      <TouchableOpacity style={styles.btn} onPress={requestPermission}>
        <Text style={styles.btnText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onCameraReady={() => setCameraReady(true)}
      />

      {cameraReady && (
        <View style={StyleSheet.absoluteFill} {...(placed ? panResponder.panHandlers : {})}>
          <Canvas style={StyleSheet.absoluteFill}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
            <Suspense fallback={null}>
              {placed && <Castle onLoaded={() => setLoading(false)} />}
            </Suspense>
          </Canvas>
        </View>
      )}

      {loading && <LoadingOverlay />}

      {cameraReady && !placed && (
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handlePlace}>
          <View style={styles.hint}>
            <Text style={styles.hintText}>Tap to place the castle</Text>
          </View>
        </TouchableOpacity>
      )}

      {placed && !loading && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlBtn, mode === 'rotate' && styles.activeBtn]}
            onPress={() => setMode('rotate')}
          >
            <Text style={styles.text}>↻</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlBtn, mode === 'move' && styles.activeBtn]}
            onPress={() => setMode('move')}
          >
            <Text style={styles.text}>✥</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.controlBtn} onPress={() => { castleTransform.scale *= 1.3; }}>
            <Text style={styles.text}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => { castleTransform.scale *= 0.7; }}>
            <Text style={styles.text}>−</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.controlBtn} onPress={handleReset}>
            <Text style={styles.text}>⊙</Text>
          </TouchableOpacity>
        </View>
      )}

      {placed && !loading && (
        <View style={styles.modeLabel}>
          <Text style={styles.hintText}>{mode === 'rotate' ? 'Drag to rotate' : 'Drag to move'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#000' },
  hint:           { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 100 },
  hintText:       { color: '#fff', fontSize: 14, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, overflow: 'hidden' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', gap: 12 },
  modeLabel:      { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  controls:       { position: 'absolute', right: 16, top: '30%', gap: 10 },
  controlBtn:     { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  activeBtn:      { backgroundColor: 'rgba(255,255,255,0.5)', borderColor: '#fff' },
  divider:        { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  text:           { color: '#fff', fontSize: 20 },
  btn:            { backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  btnText:        { color: '#000', fontSize: 15, fontWeight: '600' },
});