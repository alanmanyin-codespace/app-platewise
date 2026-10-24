import { join } from '@/lib/array/join';
import { conditionalSafe } from '@/lib/boolean/conditional';
import { formatNumber } from '@/lib/math/formatNumber';
import { toggleGroceryCheck } from '@/logic/actions/toggleGroceryCheck';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GroceryItem } from '@/logic/types';

type Props = {
    groceryItemData?: GroceryItem;
};

export function GroceryItemRow({ groceryItemData }: Props) {
    if (!groceryItemData) {
        return null;
    }
    return (
        <Pressable
            style={styles.groceryRowPress}
            onPress={() => {
                toggleGroceryCheck({ itemId: groceryItemData.id });
            }}
        >
            <View style={styles.checkIconWrap}>
                <MaterialDesignIcons
                    color={conditionalSafe(
                        [{ condition: `${groceryItemData.completed} = true`, value: '#008A05' }],
                        '#B0B0B0'
                    )}
                    name={conditionalSafe(
                        [
                            {
                                condition: `${groceryItemData.completed} = true`,
                                value: 'checkbox-marked-circle'
                            }
                        ],
                        'checkbox-blank-circle-outline'
                    )}
                    size={22}
                />
            </View>
            <View style={styles.groceryItemInfo}>
                <Text
                    style={{
                        color: conditionalSafe(
                            [
                                {
                                    condition: `${groceryItemData.completed} = true`,
                                    value: '#B0B0B0'
                                }
                            ],
                            '#222222'
                        ),
                        fontSize: 14,
                        fontWeight: '600',
                        textDecorationLine: conditionalSafe(
                            [
                                {
                                    condition: `${groceryItemData.completed} = true`,
                                    value: 'line-through'
                                }
                            ],
                            'none'
                        )
                    }}
                >
                    {groceryItemData.name}
                </Text>
                <View style={styles.grocerySubInfo}>
                    <Text style={styles.storeTag}>{groceryItemData.store}</Text>
                    <Text style={styles.recipeOrigin}>
                        {join(['for ', groceryItemData.recipe], {
                            type: 'separator',
                            separator: ''
                        })}
                    </Text>
                </View>
            </View>
            <View style={styles.groceryPriceCluster}>
                <Text style={styles.groceryFlyerPrice}>
                    {join(
                        [
                            '$',
                            formatNumber(groceryItemData.flyerPrice, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })
                        ],
                        { type: 'separator', separator: '' }
                    )}
                </Text>
                <Text style={styles.groceryRegPrice}>
                    {join(
                        [
                            '$',
                            formatNumber(groceryItemData.regPrice, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })
                        ],
                        { type: 'separator', separator: '' }
                    )}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    checkIconWrap: {
        marginRight: 12
    },
    groceryFlyerPrice: {
        color: '#222222',
        fontSize: 14,
        fontWeight: '700'
    },
    groceryItemInfo: {
        flexBasis: 0,
        flexGrow: 1,
        flexShrink: 1
    },
    groceryPriceCluster: {
        alignItems: 'flex-end',
        marginLeft: 8
    },
    groceryRegPrice: {
        color: '#B0B0B0',
        fontSize: 11,
        textDecorationLine: 'line-through'
    },
    groceryRowPress: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: '#EBEBEB',
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        marginBottom: 8,
        paddingBottom: 12,
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 12
    },
    grocerySubInfo: {
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 3
    },
    recipeOrigin: {
        color: '#B0B0B0',
        fontSize: 11
    },
    storeTag: {
        color: '#717171',
        fontSize: 11,
        fontWeight: '700',
        marginRight: 6
    }
});
