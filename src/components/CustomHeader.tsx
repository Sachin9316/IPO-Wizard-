import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useUI } from '../context/UIContext';
import { Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export const CustomHeader = ({ title, showActions = true, showSearch = true }: { title: string; showActions?: boolean; showSearch?: boolean }) => {
    const { colors } = useTheme();
    const { headerFilter, setHeaderFilter } = useUI();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ backgroundColor: colors.background, paddingTop: insets.top }}>
            <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                {showActions && (
                    <View style={styles.rightContainer}>
                        {/* Filter Toggle */}
                        <View style={[styles.toggleContainer, { borderColor: colors.border }]}>
                            <TouchableOpacity
                                style={[
                                    styles.toggleBtn,
                                    headerFilter === 'ALL' && { backgroundColor: colors.primary }
                                ]}
                                onPress={() => setHeaderFilter('ALL')}
                            >
                                <Text style={[
                                    styles.toggleText,
                                    { color: headerFilter === 'ALL' ? '#FFF' : colors.text }
                                ]}>All</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.toggleBtn,
                                    headerFilter === 'MAINBOARD' && { backgroundColor: colors.primary }
                                ]}
                                onPress={() => setHeaderFilter('MAINBOARD')}
                            >
                                <Text style={[
                                    styles.toggleText,
                                    { color: headerFilter === 'MAINBOARD' ? '#FFF' : colors.text }
                                ]}>Mainboard</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.toggleBtn,
                                    headerFilter === 'SME' && { backgroundColor: colors.primary }
                                ]}
                                onPress={() => setHeaderFilter('SME')}
                            >
                                <Text style={[
                                    styles.toggleText,
                                    { color: headerFilter === 'SME' ? '#FFF' : colors.text }
                                ]}>SME</Text>
                            </TouchableOpacity>
                        </View>

                        {showSearch && (
                            <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.iconButton}>
                                <Search color={colors.text} size={24} />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: 8,
    },
    toggleContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 20,
        overflow: 'hidden',
        marginRight: 0,
        height: 32,
    },
    toggleBtn: {
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
