import { Platform } from 'react-native';
import Constants from 'expo-constants';

const DEV_HOST = Platform.select({
  android: '10.0.2.2',
  ios: 'localhost',
  default: 'localhost',
});

export const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  `http://${DEV_HOST}:8000`;
