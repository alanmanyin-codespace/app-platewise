import { GroceryItemRow } from '@/components/GroceryItemRow';
import { join } from '@/lib/array/join';
import { map } from '@/lib/array/map';
import { useAtom } from '@/lib/useAtom';
import { groceryItemsListAtom } from '@/logic/app-state/groceryItemsListAtom';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Tabs } from 'expo-router';
import {
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatNumber } from '@/lib/math/formatNumber';

export default function Groceries() {
    const [groceryItemsList] = useAtom(groceryItemsListAtom);
    const total = groceryItemsList.reduce((sum, item) => sum + item.flyerPrice, 0);

    return (
        <>
            <StatusBar barStyle='dark-content' />
            <Tabs.Screen
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialDesignIcons color={color} name='cart-outline' size={size} />
                    ),
                    title: 'Groceries'
                }}
            />
            <SafeAreaView edges={['top']} style={styles.groceriesSafeArea}>
                <View style={styles.groceriesHeader}>
                    <View style={styles.groceriesTopLine}>
                        <Text style={styles.groceriesTitle}>Smart Shopping List</Text>
                        <TouchableOpacity
                            onPress={() => {
                                Share.share({
                                    title: 'My Flyer Grocery List',
                                    message:
                                        'Smart Shopping List matched to Canadian grocery flyers from All About Savings!'
                                });
                            }}
                        >
                            <MaterialDesignIcons
                                color='#222222'
                                name='share-variant-outline'
                                size={22}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.groceriesSub}>
                        Grouped by weekly flyer sales for effortless shopping
                    </Text>
                    <View style={styles.savingsTallyCard}>
                        <View>
                            <Text style={styles.itemsLeft}>
                                {join([groceryItemsList.length, ' items in shopping cart'], {
                                    type: 'separator',
                                    separator: ''
                                })}
                            </Text>
                            <Text style={styles.flyerMatched}>All items flyer price-verified</Text>
                        </View>
                        <View style={styles.totalBadge}>
                            <Text style={styles.totalBadgeText}>Total ${formatNumber(total, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                    </View>
                </View>
                <ScrollView contentContainerStyle={styles.groceryListScrollContentContainer}>
                    {map(groceryItemsList, (item) => (
                        <GroceryItemRow key={item.id} groceryItemData={item} />
                    ))}
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    flyerMatched: {
        color: '#008A05',
        fontSize: 11,
        fontWeight: '600'
    },
    groceriesHeader: {
        alignSelf: 'center',
        maxWidth: 960,
        paddingBottom: 14,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 12,
        width: '100%'
    },
    groceriesSafeArea: {
        backgroundColor: '#FFFFFF',
        flexBasis: 0,
        flexGrow: 1,
        flexShrink: 1
    },
    groceriesSub: {
        color: '#717171',
        fontSize: 13,
        marginTop: 2
    },
    groceriesTitle: {
        color: '#222222',
        fontSize: 24,
        fontWeight: '800'
    },
    groceriesTopLine: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    groceryListScrollContentContainer: {
        alignSelf: 'center',
        maxWidth: 960,
        paddingBottom: 24,
        paddingLeft: 20,
        paddingRight: 20,
        width: '100%'
    },
    itemsLeft: {
        color: '#484848',
        fontSize: 12,
        fontWeight: '700'
    },
    savingsTallyCard: {
        alignItems: 'center',
        backgroundColor: '#F7F7F7',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingBottom: 10,
        paddingLeft: 14,
        paddingRight: 14,
        paddingTop: 10
    },
    totalBadge: {
        backgroundColor: '#222222',
        borderRadius: 8,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5
    },
    totalBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700'
    }
});
