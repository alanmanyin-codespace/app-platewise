import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Tabs } from 'expo-router';
import { theme } from '@/lib/theme';
import { Platform, useWindowDimensions } from 'react-native';

/**
 * Below this width the bottom bar stays: it is thumb-reachable, which is the
 * whole point of the pattern. Above it a bottom bar is just a phone affordance
 * stranded on a desk, so navigation moves to a persistent left rail.
 */
const DESKTOP_MIN_WIDTH = 1024;

export default function Layout() {
    const { width } = useWindowDimensions();
    const isDesktop = Platform.OS === 'web' && width >= DESKTOP_MIN_WIDTH;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: '#717171',
                tabBarPosition: isDesktop ? 'left' : 'bottom',
                // The rail reads as a list of destinations, so the label sits
                // beside its icon; the bottom bar keeps labels stacked under.
                tabBarVariant: isDesktop ? 'material' : 'uikit',
                tabBarLabelPosition: isDesktop ? 'beside-icon' : 'below-icon',
                tabBarLabelStyle: isDesktop
                    ? { fontSize: 14, fontWeight: '600' }
                    : { fontSize: 11, fontWeight: '600' },
                tabBarStyle: isDesktop
                    ? {
                          backgroundColor: theme.colors.background,
                          borderRightColor: '#EBEBEB',
                          borderRightWidth: 1,
                          // The rail defaults to Material's 360dp navigation
                          // *drawer* width, which is wider than a third of the
                          // 860px content column. minWidth has to come down
                          // with width or it keeps winning in CSS.
                          minWidth: 232,
                          paddingTop: 12,
                          width: 232
                      }
                    : Platform.OS === 'web'
                      ? {
                            alignSelf: 'center',
                            backgroundColor: theme.colors.background,
                            borderTopColor: '#EBEBEB',
                            borderTopWidth: 1,
                            height: 64,
                            maxWidth: 860,
                            width: '100%'
                        }
                      : { backgroundColor: theme.colors.background, height: 60 }
            }}
        >
            <Tabs.Screen
                name='index'
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialDesignIcons color={color} name='tag-outline' size={size} />
                    ),
                    title: 'Deals'
                }}
            />
            <Tabs.Screen
                name='planner'
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
            <Tabs.Screen
                name='groceries'
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialDesignIcons color={color} name='cart-outline' size={size} />
                    ),
                    title: 'Groceries'
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialDesignIcons color={color} name='account-cog-outline' size={size} />
                    ),
                    title: 'Profile'
                }}
            />
        </Tabs>
    );
}
