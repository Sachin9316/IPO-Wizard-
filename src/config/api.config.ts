import { Platform } from 'react-native';

const NATIVE_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
const WEB_BASE_URL = NATIVE_BASE_URL;

const isWeb = Platform.OS === 'web';

export const API_CONFIG = {
    BASE_URL: (isWeb ? WEB_BASE_URL : NATIVE_BASE_URL) + '/api'
};
