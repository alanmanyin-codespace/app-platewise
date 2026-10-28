import { StoreBadge } from '@/components/StoreBadge';
import { join } from '@/lib/array/join';
import { formatNumber } from '@/lib/math/formatNumber';
import { theme } from '@/lib/theme';
import { openRecipeDetail } from '@/logic/actions/openRecipeDetail';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Recipe } from '@/logic/types';

type Props = {
    recipeData?: Recipe;
};

export function DealRecipeCard({ recipeData }: Props) {
    if (!recipeData) {
        return null;
    }
    return (
        <Pressable
            accessibilityRole='button'
            accessibilityLabel={`${recipeData.title}, ${recipeData.store}, $${recipeData.flyerPrice} per meal`}
            accessibilityHint='Opens the full recipe'
            style={styles.cardPressable}
            onPress={() => {
                openRecipeDetail({ recipeData });
            }}
        >
            <View style={styles.cardImageContainer}>
                <Image
                    accessibilityLabel={`${recipeData.title}, plated`}
                    contentFit='cover'
                    source={recipeData.imageUrl}
                    style={styles.cardImage}
                />
                <View style={styles.savingsPill}>
                    <MaterialDesignIcons color='#FFFFFF' name='tag-outline' size={13} />
                    <Text style={styles.savingsPillText}>
                        {join(
                            [
                                'SAVE $',
                                formatNumber(recipeData.savings, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })
                            ],
                            { type: 'separator', separator: '' }
                        )}
                    </Text>
                </View>
                <View style={styles.timePill}>
                    <MaterialDesignIcons color='#FFFFFF' name='clock-outline' size={12} />
                    <Text style={styles.timePillText}>{recipeData.prepTime}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <View style={styles.storeRow}>
                    <StoreBadge storeName={recipeData.store} />
                    <Text style={styles.flyerDate}>{recipeData.flyerDate}</Text>
                </View>
                <Text style={styles.cardTitle}>{recipeData.title}</Text>
                <View style={styles.flyerItemMatched}>
                    <MaterialDesignIcons color={theme.colors.primary} name='check-decagram' size={14} />
                    <Text style={styles.matchedText}>
                        {join(['Flyer item: ', recipeData.flyerItem], {
                            type: 'separator',
                            separator: ''
                        })}
                    </Text>
                </View>
                <View style={styles.priceSummaryRow}>
                    <View style={styles.priceCluster}>
                        <Text style={styles.flyerPriceValue}>
                            {join(
                                [
                                    '$',
                                    formatNumber(recipeData.flyerPrice, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })
                                ],
                                { type: 'separator', separator: '' }
                            )}
                        </Text>
                        <Text style={styles.regularPriceValue}>
                            {join(
                                [
                                    '$',
                                    formatNumber(recipeData.originalPrice, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })
                                ],
                                { type: 'separator', separator: '' }
                            )}
                        </Text>
                        <Text style={styles.servingsSub}>/ meal</Text>
                    </View>
                    <View style={styles.actionBtnHint}>
                        <Text style={styles.actionBtnText}>View Recipe</Text>
                        <MaterialDesignIcons color={theme.colors.primary} name='chevron-right' size={16} />
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    actionBtnHint: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    actionBtnText: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: '700',
        marginRight: 2
    },
    cardBody: {
        padding: 14
    },
    cardImage: {
        height: '100%',
        width: '100%'
    },
    cardImageContainer: {
        height: 190,
        position: 'relative',
        width: '100%'
    },
    cardPressable: {
        backgroundColor: '#FFFFFF',
        borderColor: '#EBEBEB',
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 20,
        overflow: 'hidden'
    },
    cardTitle: {
        color: '#222222',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6
    },
    flyerDate: {
        color: '#717171',
        fontSize: 11
    },
    flyerItemMatched: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 10
    },
    flyerPriceValue: {
        color: '#222222',
        fontSize: 18,
        fontWeight: '800'
    },
    matchedText: {
        color: '#484848',
        fontSize: 12,
        marginLeft: 5
    },
    priceCluster: {
        alignItems: 'baseline',
        flexDirection: 'row'
    },
    priceSummaryRow: {
        alignItems: 'center',
        borderTopColor: '#F2F2F2',
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 8
    },
    regularPriceValue: {
        color: theme.colors.muted,
        fontSize: 13,
        marginLeft: 6,
        textDecorationLine: 'line-through'
    },
    savingsPill: {
        alignItems: 'center',
        backgroundColor: '#008A05',
        borderRadius: 20,
        flexDirection: 'row',
        left: 12,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5,
        position: 'absolute',
        top: 12
    },
    savingsPillText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 4
    },
    servingsSub: {
        color: '#717171',
        fontSize: 12,
        marginLeft: 6
    },
    storeRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6
    },
    timePill: {
        alignItems: 'center',
        backgroundColor: 'rgba(34,34,34,0.78)',
        borderRadius: 12,
        bottom: 12,
        flexDirection: 'row',
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 4,
        position: 'absolute',
        right: 12
    },
    timePillText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 3
    }
});
