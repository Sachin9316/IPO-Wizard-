import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { IPOData } from '../../types/ipo';

interface IPOLotInfoProps {
    item: IPOData;
}

const LotRow = ({ label, lots, shares, amount, colors, isLast }: any) => {
    return (
        <View style={[styles.lotRow, isLast && { borderBottomWidth: 0 }, { borderBottomColor: colors.border }]}>
            <View style={styles.lotRowLeft}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{label}</Text>
                <Text style={{ fontSize: 11, color: colors.text, opacity: 0.5, marginTop: 2 }}>{lots} Lot • {shares} Shares</Text>
            </View>
            <View style={styles.lotRowRight}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>₹{amount.toLocaleString('en-IN')}</Text>
            </View>
        </View>
    );
};

export const IPOLotInfo = ({ item }: IPOLotInfoProps) => {
    const { colors } = useTheme();

    return (
        <View style={styles.sectionCompact}>
            <Text style={[styles.sectionTitleCompact, { color: colors.text }]}>Min Investment</Text>
            <View style={styles.verticalLotList}>
                {(() => {
                    const lotSizeNum = parseInt(item.lotSize);
                    const lotAmount = (item.maxPrice || 0) * lotSizeNum;
                    if (!lotAmount) return null;
                    const isSME = item.type === 'SME';

                    if (isSME) {
                        return (
                            <>
                                <LotRow label="Retail (Min)" lots={1} shares={lotSizeNum} amount={lotAmount} colors={colors} />
                                <LotRow label="HNI (Min)" lots={2} shares={lotSizeNum * 2} amount={lotAmount * 2} colors={colors} isLast />
                            </>
                        );
                    }

                    const retailMaxLots = Math.floor(200000 / lotAmount);
                    const shniMinLots = retailMaxLots + 1;
                    const shniMaxLots = Math.floor(1000000 / lotAmount);
                    const bhniMinLots = shniMaxLots + 1;

                    return (
                        <>
                            <LotRow label="Retail (Min)" lots={1} shares={lotSizeNum} amount={lotAmount} colors={colors} />
                            <LotRow label="Retail (Max)" lots={retailMaxLots} shares={lotSizeNum * retailMaxLots} amount={lotAmount * retailMaxLots} colors={colors} />
                            <LotRow label="sNII (Min)" lots={shniMinLots} shares={lotSizeNum * shniMinLots} amount={lotAmount * shniMinLots} colors={colors} />
                            <LotRow label="sNII (Max)" lots={shniMaxLots} shares={lotSizeNum * shniMaxLots} amount={lotAmount * shniMaxLots} colors={colors} />
                            <LotRow label="bNII (Min)" lots={bhniMinLots} shares={lotSizeNum * bhniMinLots} amount={lotAmount * bhniMinLots} colors={colors} isLast />
                        </>
                    );
                })()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionCompact: {
        padding: 16,
    },
    sectionTitleCompact: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 12,
    },
    verticalLotList: {
        paddingTop: 8,
    },
    lotRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    lotRowLeft: {
        flexDirection: 'column',
    },
    lotRowRight: {
        alignItems: 'flex-end',
    },
});
