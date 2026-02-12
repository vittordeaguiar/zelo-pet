import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const PERMISSION_TITLE = 'Permissão necessária';
const PERMISSION_MESSAGE =
  'Precisamos acessar sua galeria para adicionar fotos de pets e memórias.';

export const ensureMediaLibraryPermission = async () => {
  try {
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (current.granted) return true;

    if (!current.canAskAgain && current.status === ImagePicker.PermissionStatus.DENIED) {
      Alert.alert(PERMISSION_TITLE, PERMISSION_MESSAGE, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir ajustes',
          onPress: () => {
            Linking.openSettings();
          },
        },
      ]);
      return false;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted) return true;

    Alert.alert(PERMISSION_TITLE, PERMISSION_MESSAGE, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Abrir ajustes',
        onPress: () => {
          Linking.openSettings();
        },
      },
    ]);
    return false;
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível acessar a galeria.');
    return false;
  }
};

export const ensureCameraPermission = async () => {
  try {
    const current = await ImagePicker.getCameraPermissionsAsync();
    if (current.granted) return true;

    if (!current.canAskAgain && current.status === ImagePicker.PermissionStatus.DENIED) {
      Alert.alert(PERMISSION_TITLE, 'Precisamos acessar sua câmera para tirar fotos.', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir ajustes',
          onPress: () => {
            Linking.openSettings();
          },
        },
      ]);
      return false;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted) return true;

    Alert.alert(PERMISSION_TITLE, 'Precisamos acessar sua câmera para tirar fotos.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Abrir ajustes',
        onPress: () => {
          Linking.openSettings();
        },
      },
    ]);
    return false;
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível acessar a câmera.');
    return false;
  }
};

type LaunchOptions = {
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
  base64?: boolean;
};

export const launchImageLibrary = async (options: LaunchOptions = {}) => {
  const granted = await ensureMediaLibraryPermission();
  if (!granted) return null;

  try {
    const shouldReturnBase64 = options.base64 ?? false;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: shouldReturnBase64,
      quality: 0.8,
      allowsEditing: true,
      ...options,
    });

    if (result.canceled) return null;
    const asset = result.assets[0];
    if (!asset) return null;
    if (shouldReturnBase64 && asset.base64) {
      const mimeType = asset.mimeType ?? 'image/jpeg';
      return `data:${mimeType};base64,${asset.base64}`;
    }
    return asset.uri ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível abrir a galeria.';
    console.error('launchImageLibrary', error);
    Alert.alert('Erro', message);
    return null;
  }
};

export const launchCamera = async (options: LaunchOptions = {}) => {
  const granted = await ensureCameraPermission();
  if (!granted) return null;

  try {
    const shouldReturnBase64 = options.base64 ?? false;
    const result = await ImagePicker.launchCameraAsync({
      base64: shouldReturnBase64,
      quality: 0.8,
      allowsEditing: true,
      ...options,
    });

    if (result.canceled) return null;
    const asset = result.assets[0];
    if (!asset) return null;
    if (shouldReturnBase64 && asset.base64) {
      const mimeType = asset.mimeType ?? 'image/jpeg';
      return `data:${mimeType};base64,${asset.base64}`;
    }
    return asset.uri ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível abrir a câmera.';
    console.error('launchCamera', error);
    Alert.alert('Erro', message);
    return null;
  }
};
