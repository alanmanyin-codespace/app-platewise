import { atom } from 'jotai';

export const selectedRecipeAtom = atom<object>({
    id: 'r1',
    title: 'Maple-Glazed Salmon & Asparagus',
    store: 'Metro',
    flyerDate: 'Valid till Wed, Oct 25',
    flyerItem: 'Atlantic Salmon Fillets',
    originalPrice: 16.99,
    flyerPrice: 9.99,
    savings: 7,
    servings: 4,
    prepTime: '25 min',
    calories: '420 kcal',
    imageUrl:
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    allergens: ['Fish'],
    ingredients: [
        {
            name: 'Atlantic Salmon Fillets (600g)',
            store: 'Metro',
            isFlyerDeal: true,
            flyerPrice: 9.99,
            regPrice: 16.99
        },
        {
            name: 'Fresh Ontario Green Asparagus',
            store: 'Metro',
            isFlyerDeal: true,
            flyerPrice: 2.49,
            regPrice: 4.99
        },
        {
            name: 'Pure Canadian Maple Syrup',
            store: 'Metro',
            isFlyerDeal: false,
            flyerPrice: 6.49,
            regPrice: 6.49
        },
        {
            name: 'Dijon Mustard & Minced Garlic',
            store: 'Metro',
            isFlyerDeal: false,
            flyerPrice: 1.89,
            regPrice: 1.89
        }
    ],
    steps: [
        'Whisk maple syrup, Dijon mustard, minced garlic, and salt in a small bowl.',
        'Place salmon fillets and trimmed asparagus onto a parchment-lined baking sheet.',
        'Brush glaze generously across salmon and toss asparagus with olive oil.',
        'Roast in preheated oven at 400\u00B0F (200\u00B0C) for 14-16 minutes until salmon flakes tenderly.'
    ]
});
