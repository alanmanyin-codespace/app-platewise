import { atom } from 'jotai';

export const weeklyPlanAtom = atom<any[]>([
    {
        day: 'Mon',
        meal: 'Maple-Glazed Salmon & Asparagus',
        store: 'Metro',
        cost: 12.48,
        savings: 9.5,
        time: '25m',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80'
    },
    {
        day: 'Tue',
        meal: 'Crispy Sheet-Pan Chicken Fajitas',
        store: 'No Frills',
        cost: 13.99,
        savings: 10,
        time: '30m',
        image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80'
    },
    {
        day: 'Wed',
        meal: 'Creamy Spinach Tortellini Bake',
        store: 'FreshCo',
        cost: 8.75,
        savings: 6.2,
        time: '20m',
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=400&q=80'
    },
    {
        day: 'Thu',
        meal: 'Ontario Apple Pork Chops',
        store: 'Food Basics',
        cost: 11.2,
        savings: 8.3,
        time: '35m',
        image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=400&q=80'
    },
    {
        day: 'Fri',
        meal: 'Loaded Beef Chili & Cornbread',
        store: 'Walmart',
        cost: 10.45,
        savings: 7.5,
        time: '40m',
        image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80'
    },
    {
        day: 'Sat',
        meal: 'Homemade Margherita Pizza',
        store: 'Metro',
        cost: 6.9,
        savings: 4.8,
        time: '25m',
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=400&q=80'
    },
    {
        day: 'Sun',
        meal: 'Golden Roasted Vegetable Curry',
        store: 'No Frills',
        cost: 7.8,
        savings: 5.5,
        time: '30m',
        image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=400&q=80'
    }
]);
