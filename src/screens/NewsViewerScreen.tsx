import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../theme/ThemeContext';
import { ArrowLeft, Share2, ExternalLink, RotateCcw } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

export const NewsViewerScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { url, title } = route.params;
    const [loading, setLoading] = useState(true);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Share2 color={colors.text} size={22} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.webviewContainer}>
                <WebView
                    source={{ uri: url }}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.loader}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    )}
                    domStorageEnabled={true}
                    javaScriptEnabled={true}
                    style={{ flex: 1, backgroundColor: colors.background }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: { padding: 4 },
    titleContainer: { flex: 1, marginHorizontal: 12 },
    title: { fontSize: 16, fontWeight: 'bold' },
    headerRight: { flexDirection: 'row' },
    iconBtn: { padding: 4 },
    webviewContainer: { flex: 1 },
    loader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
