import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { User as UserIcon, MoreVertical, Share2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

interface AllotmentResult {
    panNumber: string;
    name: string;
    status: 'ALLOTTED' | 'NOT_ALLOTTED' | 'NOT_APPLIED' | 'ERROR' | 'UNKNOWN';
    units?: number;
    message?: string;
}

interface AllotmentResultCardProps {
    item: AllotmentResult;
    index: number;
    fadeAnim: Animated.Value;
    isMenuOpen: boolean;
    refreshing: boolean;
    onRefresh: (item: AllotmentResult) => void;
    onMenuToggle: () => void;
    onShare: (item: AllotmentResult) => void;
    onReport: (item: AllotmentResult) => void;
}

export const AllotmentResultCard = ({
    item,
    index,
    fadeAnim,
    isMenuOpen,
    refreshing,
    onRefresh,
    onMenuToggle,
    onShare,
    onReport
}: AllotmentResultCardProps) => {
    const { colors } = useTheme();

    let statusColor, statusText;

    switch (item.status) {
        case 'ALLOTTED':
            statusColor = '#15803d'; // Green-700
            statusText = 'ALLOTTED';
            break;
        case 'NOT_ALLOTTED':
            statusColor = '#b91c1c'; // Red-700
            statusText = 'NOT ALLOTTED';
            break;
        case 'NOT_APPLIED':
            statusColor = '#475569'; // Slate-600
            statusText = 'NOT APPLIED';
            break;
        case 'UNKNOWN':
        default:
            statusColor = '#94a3b8'; // Slate-400 (Gray)
            statusText = 'UNKNOWN';
            break;
    }

    // Dark mode adjustments
    if (colors.background !== '#FFFFFF') {
        if (item.status === 'ALLOTTED') {
            statusColor = '#4ade80'; // Green-400
        } else if (item.status === 'NOT_ALLOTTED') {
            statusColor = '#f87171'; // Red-400
        } else {
            statusColor = '#94a3b8'; // Slate-400
        }
    }

    return (
        <Animated.View style={{
            opacity: fadeAnim,
            marginBottom: 10,
            transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [10 * (index + 1), 0] }) }],
            zIndex: isMenuOpen ? 100 : 1 // Bring active card to front
        }}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }]}>
                <View style={styles.cardContent}>
                    <View style={{ flex: 1, gap: 4 }}>
                        <Text style={[styles.cardName, { color: colors.text, fontSize: 16 }]} numberOfLines={1}>{item.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <UserIcon size={12} color={colors.text} style={{ opacity: 0.5 }} />
                            <Text style={[styles.cardPan, { color: colors.text }]}>{item.panNumber}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 10 }}>
                        <TouchableOpacity
                            style={{ alignItems: 'flex-end' }}
                            onPress={() => onRefresh(item)}
                            disabled={refreshing}
                        >
                            {refreshing ? (
                                <ActivityIndicator size="small" color={statusColor} />
                            ) : (
                                <>
                                    <Text style={[styles.cardStatus, { color: statusColor, fontSize: 13, fontWeight: '700' }]}>{statusText}</Text>
                                    {item.status === 'ALLOTTED' && (
                                        <Text style={{ fontSize: 11, color: statusColor, marginTop: 2, fontWeight: '500' }}>1 Lot / {item.units} Shares</Text>
                                    )}
                                    {(item.status === 'UNKNOWN' || item.status === 'ERROR') && item.message && (
                                        <Text style={{ fontSize: 10, color: statusColor, marginTop: 2, opacity: 0.8 }}>{item.message}</Text>
                                    )}
                                </>
                            )}
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity onPress={onMenuToggle} style={{ padding: 4 }}>
                                <MoreVertical size={20} color={colors.text} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>
                        </View >

                        {isMenuOpen && (
                            <View style={{
                                position: 'absolute',
                                top: 30,
                                right: 0,
                                backgroundColor: colors.card,
                                borderRadius: 12,
                                padding: 4,
                                borderWidth: 1,
                                borderColor: colors.border,
                                minWidth: 180,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 8,
                                elevation: 8,
                                zIndex: 1000
                            }}>
                                <TouchableOpacity
                                    onPress={() => onShare(item)}
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border + '33' }}
                                >
                                    <Share2 size={16} color={colors.primary} />
                                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>Share Result</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => onReport(item)}
                                    style={{ padding: 12 }}
                                >
                                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>Report Status Issue</Text>
                                    <Text style={{ color: colors.text, fontSize: 9, opacity: 0.5, marginTop: 4 }}>
                                        Contact us if allotted but facing issues
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View >
                </View >
            </View >
        </Animated.View >
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 8,
        marginBottom: 8,
        padding: 12,
        // Remove elevation for simpler look, or keep minimal
        borderWidth: 1,
        borderColor: '#EEE',
    },
    cardContent: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    cardName: { fontSize: 14, fontWeight: 'bold' },
    cardPan: { fontSize: 12, opacity: 0.6 },
    cardStatus: { fontSize: 12, fontWeight: 'bold' },
});
