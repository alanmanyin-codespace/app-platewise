import { StoreBadge } from '@/components/StoreBadge';
import { join } from '@/lib/array/join';
import { map } from '@/lib/array/map';
import { calcSafe } from '@/lib/math/calc';
import { formatNumber } from '@/lib/math/formatNumber';
import { theme } from '@/lib/theme';
import { useAtom } from '@/lib/useAtom';
import { addRecipeIngredientsToGroceries } from '@/logic/actions/addRecipeIngredientsToGroceries';
import { selectedRecipeAtom } from '@/logic/app-state/selectedRecipeAtom';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useStore } from 'jotai';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RecipeDetail() {
    const [selectedRecipe] = useAtom(selectedRecipeAtom);
    const store = useStore();

    return (
        <>
            <StatusBar barStyle='light-content' />
            <View style={styles.detailRoot}>
                <ScrollView contentContainerStyle={styles.detailScrollContentContainer}>
                    <View style={styles.detailHeroContainer}>
                        <Image
                            accessibilityLabel={`${selectedRecipe.title}, plated`}
                            contentFit='cover'
                            source={selectedRecipe.imageUrl}
                            style={styles.detailHeroImage}
                        />
                        <TouchableOpacity
                            accessibilityRole='button'
                            accessibilityLabel='Go back'
                            style={styles.backNavButton}
                            onPress={() => {
                                router.back();
                            }}
                        >
                            <MaterialDesignIcons color='#222222' name='arrow-left' size={22} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.detailContent}>
                        <View style={styles.detailBadgesRow}>
                            <StoreBadge storeName={selectedRecipe.store} />
                            <View style={styles.savingsFlag}>
                                <Text style={styles.savingsFlagText}>
                                    {join(
                                        [
                                            'SAVE $',
                                            formatNumber(selectedRecipe.savings, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })
                                        ],
                                        { type: 'separator', separator: '' }
                                    )}
                                </Text>
                            </View>
                        </View>
                        <Text accessibilityRole='header' accessibilityLevel={1} style={styles.detailTitle}>
                            {selectedRecipe.title}
                        </Text>
                        <View style={styles.metricsBar}>
                            <View style={styles.metricTime}>
                                <MaterialDesignIcons
                                    color='#717171'
                                    name='clock-outline'
                                    size={18}
                                />
                                <Text style={styles.timeVal}>{selectedRecipe.prepTime}</Text>
                            </View>
                            <View style={styles.metricTime}>
                                <MaterialDesignIcons
                                    color='#717171'
                                    name='silverware-fork-knife'
                                    size={18}
                                />
                                <Text style={styles.timeVal}>
                                    {join([selectedRecipe.servings, ' servings'], {
                                        type: 'separator',
                                        separator: ''
                                    })}
                                </Text>
                            </View>
                            <View style={styles.metricTime}>
                                <MaterialDesignIcons color='#717171' name='fire' size={18} />
                                <Text style={styles.timeVal}>{selectedRecipe.calories}</Text>
                            </View>
                        </View>
                        <Text accessibilityRole='header' accessibilityLevel={2} style={styles.ingHeading}>
                            Ingredients &amp; Flyer Deals
                        </Text>
                        {map(
                            selectedRecipe.ingredients,
                            ({ flyerPrice, isFlyerDeal, name, regPrice }, index) => (
                                <View key={index} style={styles.ingRow}>
                                    <View style={styles.ingNameWrap}>
                                        <Text style={styles.ingName}>{name}</Text>
                                        {isFlyerDeal && (
                                            <Text style={styles.flyerBadge}>
                                                ★ MATCHED TO THIS WEEK&apos;S FLYER
                                            </Text>
                                        )}
                                    </View>
                                    <View style={styles.ingPriceCluster}>
                                        <Text style={styles.ingFlyerPrice}>
                                            {join(
                                                [
                                                    '$',
                                                    formatNumber(flyerPrice, {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    })
                                                ],
                                                { type: 'separator', separator: '' }
                                            )}
                                        </Text>
                                        {isFlyerDeal && (
                                            <Text style={styles.ingRegPrice}>
                                                {join(
                                                    [
                                                        '$',
                                                        formatNumber(regPrice, {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2
                                                        })
                                                    ],
                                                    { type: 'separator', separator: '' }
                                                )}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            )
                        )}
                        <Text accessibilityRole='header' accessibilityLevel={2} style={styles.stepsHeading}>
                            Step-by-Step Instructions
                        </Text>
                        {map(selectedRecipe.steps, (item, index) => (
                            <View key={index} style={styles.stepRow}>
                                <View style={styles.stepNumCircle}>
                                    <Text style={styles.stepNumText}>
                                        {calcSafe(`${index} + 1`)}
                                    </Text>
                                </View>
                                <Text style={styles.stepText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
                <View style={styles.bottomFloatingBar}>
                    <View>
                        <View style={styles.costRow}>
                            <Text style={styles.price}>
                                {join(
                                    [
                                        '$',
                                        formatNumber(selectedRecipe.flyerPrice, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })
                                    ],
                                    { type: 'separator', separator: '' }
                                )}
                            </Text>
                            <Text style={styles.reg}>
                                {join(
                                    [
                                        '$',
                                        formatNumber(selectedRecipe.originalPrice, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })
                                    ],
                                    { type: 'separator', separator: '' }
                                )}
                            </Text>
                        </View>
                        <Text style={styles.storeLabel}>
                            {join(['Available at ', selectedRecipe.store], {
                                type: 'separator',
                                separator: ''
                            })}
                        </Text>
                    </View>
                    <TouchableOpacity
                        accessibilityRole='button'
                        accessibilityLabel='Add all ingredients to grocery list'
                        style={styles.addGroceriesBtn}
                        onPress={() => {
                            addRecipeIngredientsToGroceries({
                                recipe: store.get(selectedRecipeAtom)
                            });
                        }}
                    >
                        <MaterialDesignIcons color='#FFFFFF' name='cart-plus' size={18} />
                        <Text style={styles.addGroceriesText}>Add to Grocery List</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    addGroceriesBtn: {
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
        flexDirection: 'row',
        paddingBottom: 12,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 12
    },
    addGroceriesText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 6
    },
    backNavButton: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 19,
        boxShadow: [
            {
                offsetX: 0,
                offsetY: 2,
                blurRadius: 4,
                color: '#00000026'
            }
        ],
        height: 38,
        justifyContent: 'center',
        left: 18,
        position: 'absolute',
        top: 48,
        width: 38
    },
    bottomFloatingBar: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderTopColor: '#EBEBEB',
        borderTopWidth: 1,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        left: 0,
        paddingBottom: 28,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 12,
        position: 'absolute',
        right: 0
    },
    costRow: {
        alignItems: 'baseline',
        flexDirection: 'row'
    },
    detailBadgesRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    detailContent: {
        padding: 20
    },
    detailHeroContainer: {
        height: 280,
        position: 'relative',
        width: '100%'
    },
    detailHeroImage: {
        height: '100%',
        width: '100%'
    },
    detailRoot: {
        backgroundColor: '#FFFFFF',
        flexBasis: 0,
        flexGrow: 1,
        flexShrink: 1
    },
    detailScrollContentContainer: {
        alignSelf: 'center',
        maxWidth: 760,
        paddingBottom: 110,
        width: '100%'
    },
    detailTitle: {
        color: '#222222',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 12
    },
    flyerBadge: {
        color: '#008A05',
        fontSize: 11,
        fontWeight: '700',
        marginTop: 2
    },
    ingFlyerPrice: {
        color: '#222222',
        fontSize: 13,
        fontWeight: '700'
    },
    ingHeading: {
        color: '#222222',
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 10
    },
    ingName: {
        color: '#222222',
        fontSize: 13,
        fontWeight: '600'
    },
    ingNameWrap: {
        flexBasis: 0,
        flexGrow: 1,
        flexShrink: 1,
        marginRight: 8
    },
    ingPriceCluster: {
        alignItems: 'flex-end'
    },
    ingRegPrice: {
        color: theme.colors.muted,
        fontSize: 11,
        textDecorationLine: 'line-through'
    },
    ingRow: {
        alignItems: 'center',
        borderBottomColor: '#F2F2F2',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
        paddingTop: 10
    },
    metricTime: {
        alignItems: 'center'
    },
    metricsBar: {
        backgroundColor: '#F7F7F7',
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingBottom: 12,
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 12
    },
    price: {
        color: '#222222',
        fontSize: 20,
        fontWeight: '800'
    },
    reg: {
        color: theme.colors.muted,
        fontSize: 12,
        marginLeft: 6,
        textDecorationLine: 'line-through'
    },
    savingsFlag: {
        backgroundColor: '#008A05',
        borderRadius: 12,
        paddingBottom: 4,
        paddingLeft: 9,
        paddingRight: 9,
        paddingTop: 4
    },
    savingsFlagText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700'
    },
    stepNumCircle: {
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        height: 24,
        justifyContent: 'center',
        marginRight: 10,
        marginTop: 2,
        width: 24
    },
    stepNumText: {
        color: '#222222',
        fontSize: 11,
        fontWeight: '700'
    },
    stepRow: {
        flexDirection: 'row',
        marginBottom: 14
    },
    stepText: {
        color: '#484848',
        flexBasis: 0,
        flexGrow: 1,
        flexShrink: 1,
        fontSize: 13,
        lineHeight: 19
    },
    stepsHeading: {
        color: '#222222',
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 12,
        marginTop: 20
    },
    storeLabel: {
        color: '#008A05',
        fontSize: 11,
        fontWeight: '700'
    },
    timeVal: {
        color: '#222222',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 2
    }
});
