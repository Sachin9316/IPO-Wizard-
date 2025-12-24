import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Search, Moon, Sun } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const CustomHeader = ({ title }: { title: string }) => {
    const { theme, toggleTheme, colors } = useTheme();

    return (
        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
            <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                <View style={styles.rightContainer}>
                    <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
                        {theme === 'dark' ? (
                            <Sun color={colors.text} size={24} />
                        ) : (
                            <Moon color={colors.text} size={24} />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Search color={colors.text} size={24} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: 16,
    },
});
