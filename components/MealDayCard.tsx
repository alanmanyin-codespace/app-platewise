import { join } from '@/lib/array/join';
import { formatNumber } from '@/lib/math/formatNumber';
import { theme } from '@/lib/theme';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import type { MealPlanDay } from '@/logic/types';

type Props = {
    dayPlanData?: MealPlanDay;
};

export function MealDayCard({ dayPlanData }: Props) {
    if (!dayPlanData) {
        return null;
    }
    return (
        <View style={styles.dayCardWrap}>
            <View style={styles.dayPillCol}>
                <Text style={styles.dayText}>{dayPlanData.day}</Text>
            </View>
            <Image
                accessibilityLabel={dayPlanData.meal ? `${dayPlanData.meal}, plated` : ''}
                contentFit='cover'
                source={dayPlanData.image}
                style={styles.dayMealThumb}
            />
            <View style={styles.dayPlanDetails}>
                <Text numberOfLines={1} style={styles.dayMealTitle}>
                    {dayPlanData.meal}
                </Text>
                <View style={styles.dayPlanMeta}>
                    <Text style={styles.dayStore}>{dayPlanData.store}</Text>
                    <Text style={styles.dayTime}>{dayPlanData.time}</Text>
                </View>
            </View>
            <View style={styles.dayCostCluster}>
                <Text style={styles.dayCost}>
                    {join(
                        [
                            '$',
                            formatNumber(dayPlanData.cost, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })
                        ],
                        { type: 'separator', separator: '' }
                    )}
                </Text>
                <Text style={styles.daySaved}>
                    {join(
                        [
                            '-$',
                            formatNumber(dayPlanData.savings, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })
                        ],
                        { type: 'separator', separator: '' }
                    )}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    dayCardWrap: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderColor: '#EBEBEB',
        borderRadius: 14,
        borderWidth: 1,
        flexDirection: 'row',
        marginBottom: 12,
        padding: 12
    },
    dayCost: {
        color: '#222222',
        fontSize: 14,
        fontWeight: '800'
    },
    dayCostCluster: {
        alignItems: 'flex-end',
        marginLeft: 8
    },
    dayMealThumb: {
        borderRadius: 8,
        height: 50,
        marginRight: 12,
        width: 50
    },
    dayMealTitle: {
        color: '#222222',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2
    },
    dayPillCol: {
        alignItems: 'center',
        backgroundColor: '#FFF0F2',
        borderRadius: 10,
        height: 44,
        justifyContent: 'center',
        marginRight: 12,
        width: 44
    },
    dayPlanDetails: {
        flexBasis: 0,
        flexGrow: 1,
        flexShrink: 1
    },
    dayPlanMeta: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    daySaved: {
        color: '#008A05',
        fontSize: 11,
        fontWeight: '700'
    },
    dayStore: {
        color: '#717171',
        fontSize: 11,
        fontWeight: '600',
        marginRight: 8
    },
    dayText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '800'
    },
    dayTime: {
        color: '#717171',
        fontSize: 11
    }
});
