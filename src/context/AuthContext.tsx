import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfile, addUserPAN, startMagicLogin, checkMagicLoginStatus } from '../services/api';

interface AuthContextType {
    user: any;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    startLogin: (email: string) => Promise<string>; // Returns loginId
    pollLoginStatus: (loginId: string) => Promise<boolean>; // Returns true if success
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('auth_token');
            if (storedToken) {
                setToken(storedToken);
                try {
                    const profile = await fetchUserProfile(storedToken);
                    setUser(profile);
                } catch (e: any) {
                    // Only logout if token is invalid (401)
                    if (e.status === 401) {
                        await logout();
                    } else {
                        console.warn("Profile fetch failed, but keeping session:", e);
                        // Optional: Retry logic or partial state
                    }
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const startLogin = async (email: string) => {
        const data = await startMagicLogin(email);
        return data.loginId;
    };

    const pollLoginStatus = async (loginId: string) => {
        try {
            const data = await checkMagicLoginStatus(loginId);
            if (data.status === 'verified') {
                await completeLogin(data.token, data.user);
                return true;
            }
            return false;
        } catch (e) {
            console.error("Poll failed", e);
            return false;
        }
    };

    const completeLogin = async (authToken: string, userData: any) => {
        await AsyncStorage.setItem('auth_token', authToken);
        setToken(authToken);
        setUser(userData);

        // Sync Hybrid PANs
        try {
            const unsaved = await AsyncStorage.getItem('unsaved_pans');
            if (unsaved) {
                const pans = JSON.parse(unsaved);
                for (const p of pans) {
                    try {
                        await addUserPAN(authToken, { panNumber: p.panNumber, name: p.name });
                    } catch (err) { /* ignore dupes */ }
                }
                await AsyncStorage.removeItem('unsaved_pans');
                // Refresh profile
                const profile = await fetchUserProfile(authToken);
                setUser(profile);
            }
        } catch (e) { }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
    };

    const refreshProfile = async () => {
        if (token) {
            try {
                const profile = await fetchUserProfile(token);
                setUser(profile);
            } catch (e: any) {
                console.warn("Profile refresh failed:", e);
                if (e.status === 401) {
                    await logout();
                }
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, startLogin, pollLoginStatus, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
