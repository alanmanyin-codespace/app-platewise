import { MealDayCard } from '@/components/MealDayCard';
import { map } from '@/lib/array/map';
import { useAtom } from '@/lib/useAtom';
import { weeklyPlanAtom } from '@/logic/app-state/weeklyPlanAtom';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Tabs } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatNumber } from '@/lib/math/formatNumber';

export default function Planner() {
    const [weeklyPlan] = useAtom(weeklyPlanAtom);
    const planCost = weeklyPlan.reduce((sum, item) => sum + item.cost, 0);
    const planSavings = weeklyPlan.reduce((sum, item) => sum + item.savings, 0);

    return (
        <>
            <StatusBar barStyle='dark-content' />
            <Tabs.Screen
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialDesignIcons
                            color={color}
                            name='calendar-month-outline'
                            size={size}
                        />
                    ),
                    title: 'Meal Plan'
                }}
            />
            <SafeAreaView edges={['top']} style={styles.plannerSafeArea}>
                <View style={styles.plannerHeader}>
                    <Text accessibilityRole='header' accessibilityLevel={1} style={styles.plannerTitle}>
                        This Week&apos;s Menu
                    </Text>
                    <Text style={styles.plannerSubtitle}>
                        Optimized for maximum flyer savings across your local stores
                    </Text>
                    <View style={styles.savingsOverviewCard}>
                        <View>
                            <Text style={styles.planCostLabel}>Estimated Week Cost</Text>
                            <Text style={styles.planCostNum}>${formatNumber(planCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                            <Text style={styles.familyCount}>7 dinners • 4 servings each</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.planSavedCol}>
                            <Text style={styles.planSavedLabel}>Total Saved</Text>
                            <Text style={styles.planSavedNum}>${formatNumber(planSavings, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                            <Text style={styles.savingsPercent}>42% less than normal</Text>
                        </View>
                    </View>
                </View>
                <ScrollView contentContainerStyle={styles.planListScrollContentContainer}>
                    {map(weeklyPlan, (item) => (
                        <MealDayCard key={item.day} dayPlanData={item} />
                    ))}
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    divider: {
        backgroundColor: '#FFD6DC',
        height: 45,
        width: 1
    },
    familyCount: {
        color: '#717171',
        fontSize: 11
    },
    planCostLabel: {
        color: '#717171',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    planCostNum: {
        color: '#222222',
        fontSize: 22,
        fontWeight: '800',
        marginTop: 2
    },
    planListScrollContentContainer: {
        alignSelf: 'center',
        maxWidth: 960,
        paddingBottom: 24,
        paddingLeft: 20,
        paddingRight: 20,
        width: '100%'
    },
    planSavedCol: {
        alignItems: 'flex-end'
    },
    planSavedLabel: {
        color: '#008A05',
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase'
    },
    planSavedNum: {
        color: '#008A05',
        fontSize: 22,
        fontWeight: '800',
        marginTop: 2
    },
    plannerHeader: {
        alignSelf: 'center',
        maxWidth: 960,
        paddingBottom: 14,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 12,
        width: '100%'
    },
    plannerSafeArea: {
        backgroundColor: '#FFFFFF',
        flexBasis: 0,
        flexGrow: 1,
        flexShrink: 1
    },
    plannerSubtitle: {
        color: '#717171',
        fontSize: 13,
        marginTop: 2
    },
    plannerTitle: {
        color: '#222222',
        fontSize: 24,
        fontWeight: '800'
    },
    savingsOverviewCard: {
        alignItems: 'center',
        backgroundColor: '#FFF8F9',
        borderColor: '#FFD6DC',
        borderRadius: 14,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,
        padding: 16
    },
    savingsPercent: {
        color: '#008A05',
        fontSize: 11,
        fontWeight: '600'
    }
});
