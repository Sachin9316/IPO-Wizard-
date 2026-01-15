import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import { Trophy, Search, Cloud, Smartphone } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';

interface AllotmentFilterHeaderProps {
    ipo: IPOData;
    searchQuery: string;
    setSearchQuery: (text: string) => void;
    filterSource: 'ALL' | 'CLOUD' | 'LOCAL';
    setFilterSource: (source: 'ALL' | 'CLOUD' | 'LOCAL') => void;
    allottedCount: number;
}

export const AllotmentFilterHeader = ({
    ipo,
    searchQuery,
    setSearchQuery,
    filterSource,
    setFilterSource,
    allottedCount
}: AllotmentFilterHeaderProps) => {
    const { colors } = useTheme();
    const ipoName = ipo?.name || ipo?.companyName;
    const ipoLogo = ipo?.logoUrl || ipo?.icon;

    return (
        <View style={{ marginTop: allottedCount > 0 ? 0 : 16 }}>
            {allottedCount > 0 && (
                <View style={[styles.simpleBanner, { backgroundColor: colors.primary + '15', marginBottom: 16, borderRadius: 0, width: '100%' }]}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>🎉 {allottedCount} Applications Allotted!</Text>
                </View>
            )}

            <View style={{ paddingHorizontal: 16 }}>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View style={[styles.ipoIconContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {ipoLogo ? (
                            <Image source={{ uri: ipoLogo }} style={styles.ipoIcon} resizeMode="contain" />
                        ) : (
                            <Trophy size={20} color={colors.primary} />
                        )}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.companyTitle, { color: colors.text, marginBottom: 0 }]}>{ipoName}</Text>
                        <Text style={{ fontSize: 13, color: colors.text, opacity: 0.6 }}>
                            {ipo?.symbol} • {ipo?.type}
                        </Text>
                    </View>
                </View>

                <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Search size={18} color={colors.text} style={{ opacity: 0.5, marginRight: 8 }} />
                    <TextInput
                        style={{ flex: 1, color: colors.text, fontSize: 14, paddingVertical: 4 }}
                        placeholder="Search by name or PAN..."
                        placeholderTextColor={colors.text + '80'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filter Chips */}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 4 }}>
                    {(['ALL', 'CLOUD', 'LOCAL'] as const).map((type) => {
                        const isActive = filterSource === type;
                        let label = 'All';
                        let IconComponent = null;

                        if (type === 'CLOUD') {
                            label = 'Saved';
                            IconComponent = Cloud;
                        } else if (type === 'LOCAL') {
                            label = 'Unsaved';
                            IconComponent = Smartphone;
                        }

                        return (
                            <TouchableOpacity
                                key={type}
                                onPress={() => setFilterSource(type)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    paddingVertical: 6,
                                    paddingHorizontal: 16,
                                    borderRadius: 20,
                                    backgroundColor: isActive ? colors.primary : colors.card,
                                    borderWidth: 1,
                                    borderColor: isActive ? colors.primary : colors.border,
                                    gap: 6
                                }}
                            >
                                {IconComponent && (
                                    <IconComponent
                                        size={14}
                                        color={isActive ? '#FFF' : colors.text}
                                        style={{ opacity: isActive ? 1 : 0.6 }}
                                    />
                                )}
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: isActive ? '600' : '500',
                                    color: isActive ? '#FFF' : colors.text,
                                    opacity: isActive ? 1 : 0.7
                                }}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    simpleBanner: {
        padding: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 8
    },
    companyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 10, paddingVertical: 8,
        borderRadius: 8, borderWidth: 1,
    },
    ipoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    ipoIcon: {
        width: '100%',
        height: '100%'
    }
});
