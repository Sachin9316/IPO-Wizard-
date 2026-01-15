import { View, Text, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';

interface IPOHeroProps {
    item: IPOData;
    style?: StyleProp<ViewStyle>;
}

export const IPOHero = ({ item, style }: IPOHeroProps) => {
    const { colors } = useTheme();

    return (
        <View style={[
            styles.container,
            {
                borderColor: colors.border
            },
            style
        ]}>
            <View style={styles.logoContainer}>
                {item.logoUrl ? (
                    <Image source={{ uri: item.logoUrl }} style={styles.logo} resizeMode="contain" />
                ) : (
                    <View style={[styles.placeholderLogo, { backgroundColor: colors.background }]}>
                        <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold' }}>{item.name.charAt(0)}</Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.titleRow}>
                    <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
                </View>

                <View style={styles.badgeRow}>
                    {/* Size/Type Badge - Theme Color */}
                    <View style={[styles.badge, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                        <Text style={[styles.badgeText, { color: colors.primary }]}>{item.type}</Text>
                    </View>

                    {/* Status Badge - Red for Closed, Green for Open */}
                    <View style={[
                        styles.badge,
                        {
                            backgroundColor: item.status === 'Closed' ? '#EF444415' : (item.status === 'Open' ? '#4CAF5015' : colors.card),
                            borderColor: item.status === 'Closed' ? '#EF444430' : (item.status === 'Open' ? '#4CAF5030' : colors.border)
                        }
                    ]}>
                        <Text style={[
                            styles.badgeText,
                            {
                                color: item.status === 'Closed' ? '#EF4444' : (item.status === 'Open' ? '#4CAF50' : colors.text),
                                opacity: item.status === 'Closed' || item.status === 'Open' ? 1 : 0.6
                            }
                        ]}>
                            {item.status}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 16,
        borderWidth: 1,
    },
    logoContainer: {
        width: 52,
        height: 52,
        marginRight: 14,
        borderRadius: 10,
        overflow: 'hidden',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    placeholderLogo: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    titleRow: {
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 24,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});
