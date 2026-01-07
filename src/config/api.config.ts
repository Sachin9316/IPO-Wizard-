console.log("process.env.EXPO_PUBLIC_BASE_URL", process.env.EXPO_PUBLIC_BASE_URL);
export const API_CONFIG = {
    // Fallback to local machine IP for Android Emulator (10.0.2.2) or standard localhost
    BASE_URL: process.env.EXPO_PUBLIC_BASE_URL + '/api'
};
