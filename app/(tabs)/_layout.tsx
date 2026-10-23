import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Tabs } from 'expo-router';

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#FF385C',
                tabBarInactiveTintColor: '#717171',
                tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
                tabBarStyle: { backgroundColor: '#FFFFFF', height: 60 }
            }}
        >
            <Tabs.Screen
                name='index'
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialDesignIcons color={null} name='tag-outline' size={null} />
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
                            color={null}
                            name='calendar-month-outline'
                            size={null}
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
                        <MaterialDesignIcons color={null} name='cart-outline' size={null} />
                    ),
                    title: 'Groceries'
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialDesignIcons color={null} name='account-cog-outline' size={null} />
                    ),
                    title: 'Savings Hub'
                }}
            />
        </Tabs>
    );
}
