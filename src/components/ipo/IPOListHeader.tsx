import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Filter, X, Search } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

interface FilterState {
    category: string;
    status?: string;
    allotment?: string;
}

interface IPOListHeaderProps {
    type: 'SME' | 'Mainboard' | 'Alloted' | 'Listed' | 'Watchlist' | 'Open' | 'Closed' | 'ClosedListed';
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    upcomingFilter: { category: string };
    setUpcomingFilter: React.Dispatch<React.SetStateAction<{ category: string }>>;
    closedListedFilter: { category: string; status: string; allotment: string };
    setClosedListedFilter: React.Dispatch<React.SetStateAction<{ category: string; status: string; allotment: string }>>;
}

export const IPOListHeader = ({
    type,
    searchQuery,
    setSearchQuery,
    upcomingFilter,
    setUpcomingFilter,
    closedListedFilter,
    setClosedListedFilter
}: IPOListHeaderProps) => {
    const { colors } = useTheme();
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    if (type !== 'Alloted' && type !== 'ClosedListed') {
        return null; // Header not needed for other types
    }

    return (
        <View style={styles.headerContainer}>
            {/* Search Bar for Alloted & ClosedListed */}
            {(type === 'Alloted' || type === 'ClosedListed') && (
                <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search IPOs..."
                        placeholderTextColor={colors.text + '80'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X color={colors.text} size={20} />
                        </TouchableOpacity>
                    )}
                </View>
            )}



            {/* Filter Menu for ClosedListed & Mainboard */}
            {type === 'ClosedListed' && (
                <View style={{ zIndex: 3001 }}>
                    <TouchableOpacity
                        onPress={() => setShowFilterMenu(!showFilterMenu)}
                        style={[styles.filterButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                        <Filter color={(closedListedFilter.category !== 'ALL' || closedListedFilter.status !== 'ALL') ? colors.primary : colors.text} size={24} />
                    </TouchableOpacity>

                    {showFilterMenu && (
                        <View style={[styles.filterMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.filterTitle, { color: colors.text }]}>Category</Text>
                            <View style={styles.filterRow}>
                                {['ALL', 'Mainboard', 'SME'].map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={{
                                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                                            backgroundColor: (closedListedFilter.category === (cat === 'Mainboard' ? 'MAINBOARD' : cat)) ? colors.primary + '20' : colors.card,
                                            borderWidth: 1, borderColor: (closedListedFilter.category === (cat === 'Mainboard' ? 'MAINBOARD' : cat)) ? colors.primary : colors.border
                                        }}
                                        onPress={() => setClosedListedFilter(prev => ({ ...prev, category: cat === 'Mainboard' ? 'MAINBOARD' : cat }))}
                                    >
                                        <Text style={{ fontSize: 12, color: colors.text }}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={[styles.divider, { backgroundColor: colors.border }]} />

                            <Text style={[styles.filterTitle, { color: colors.text }]}>Status</Text>
                            <View style={styles.filterRow}>
                                {['ALL', 'CLOSED'].map((stat) => (
                                    <TouchableOpacity
                                        key={stat}
                                        style={{
                                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                                            backgroundColor: closedListedFilter.status === stat ? colors.primary + '20' : colors.card,
                                            borderWidth: 1, borderColor: closedListedFilter.status === stat ? colors.primary : colors.border
                                        }}
                                        onPress={() => setClosedListedFilter(prev => ({ ...prev, status: stat }))}
                                    >
                                        <Text style={{ fontSize: 12, color: colors.text, textTransform: 'capitalize' }}>{stat.toLowerCase()}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        zIndex: 3000
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        height: 48
    },
    searchInput: {
        flex: 1,
        fontSize: 16
    },
    filterButton: {
        height: 48,
        width: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
    },
    filterMenu: {
        position: 'absolute',
        top: 52,
        right: 0,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        minWidth: 200,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 4000
    },
    filterTitle: {
        fontWeight: 'bold',
        marginBottom: 8
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12
    },
    divider: {
        height: 1,
        marginBottom: 12
    }
});
