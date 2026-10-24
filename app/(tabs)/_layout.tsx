import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Tabs } from 'expo-router';
import { theme } from '@/lib/theme';
import { Platform } from 'react-native';

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: '#717171',
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
                tabBarStyle:
                    Platform.OS === 'web'
                        ? { alignSelf: 'center', backgroundColor: '#FFFFFF', borderTopColor: '#EBEBEB', borderTopWidth: 1, height: 64, maxWidth: 860, width: '100%' }
                        : { backgroundColor: '#FFFFFF', height: 60 }
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
                    title: 'Savings Hub'
                }}
            />
        </Tabs>
    );
}
