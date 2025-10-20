import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export default function ColorGame() {
  const [permission, requestPermission] = useCameraPermissions();
  const [targetColor, setTargetColor] = useState('#FF0000');
  const [stars, setStars] = useState(0);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  if (!permission?.granted)
    return <Button title="Permitir câmera" onPress={requestPermission} />;

  async function checkColor() {
    const photo = await cameraRef.current?.takePictureAsync({ skipProcessing: true });
    if (!photo?.uri) return;

    setPhotoUri(photo.uri);

    
    const small = await ImageManipulator.manipulateAsync(photo.uri, [
      { resize: { width: 20, height: 20 } },
    ]);

    
    const avg = '#FF0000';

    const dist = colorDistance(avg, targetColor);
    if (dist < 0.25) {
      const next = stars + 1;
      setStars(next);
      if (next >= 5) alert('Jogo finalizado!');
      nextLevel();
    }
  }

  function nextLevel() {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
    setTargetColor(colors[Math.floor(Math.random() * colors.length)]);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.colorBox, { backgroundColor: targetColor }]} />
      <Text style={styles.text}>Estrelas: {stars}</Text>
      <CameraView style={styles.camera} ref={cameraRef} />
      <Button title="Verificar cor" onPress={checkColor} />
      {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} />}
    </View>
  );
}


function colorDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  return (
    Math.sqrt(
      (rgb1.r - rgb2.r) ** 2 +
      (rgb1.g - rgb2.g) ** 2 +
      (rgb1.b - rgb2.b) ** 2
    ) / 441.67
  );
}


function hexToRgb(hex: string): { r: number; g: number; b: number } {
  if (!hex || typeof hex !== 'string') return { r: 0, g: 0, b: 0 };

  if (!hex.startsWith('#')) hex = `#${hex}`;

  if (hex.length === 4) {
    hex =
      '#' +
      hex[1] + hex[1] +
      hex[2] + hex[2] +
      hex[3] + hex[3];
  }

  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return { r: 0, g: 0, b: 0 };

  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#000' },
  colorBox: { width: 120, height: 120, margin: 10, borderRadius: 10 },
  text: { color: '#fff', fontSize: 20 },
  camera: { width: '90%', height: 300 },
  preview: { width: 100, height: 100, marginTop: 10 },
});
