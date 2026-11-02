import type { Recipe } from '@/logic/types';

/** Demonstration recipes; prices and flyer dates are not live. */
export const sampleRecipes: Recipe[] = [
    {
        "id": "r1",
        "title": "Maple-Glazed Salmon & Asparagus",
        "store": "Metro",
        "flyerDate": "Till Wed, Oct 25",
        "flyerItem": "Fresh Atlantic Salmon Fillets",
        "originalPrice": 16.99,
        "flyerPrice": 9.99,
        "savings": 7,
        "servings": 4,
        "prepTime": "25 min",
        "calories": "420 kcal",
        "imageUrl": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
        "allergens": [
            "Fish"
        ],
        "ingredients": [
            {
                "name": "Atlantic Salmon Fillets (600g)",
                "store": "Metro",
                "isFlyerDeal": true,
                "flyerPrice": 9.99,
                "regPrice": 16.99
            },
            {
                "name": "Fresh Green Asparagus Bunch",
                "store": "Metro",
                "isFlyerDeal": true,
                "flyerPrice": 2.49,
                "regPrice": 4.99
            },
            {
                "name": "Pure Canadian Maple Syrup (250ml)",
                "store": "Metro",
                "isFlyerDeal": false,
                "flyerPrice": 6.49,
                "regPrice": 6.49
            },
            {
                "name": "Dijon Mustard & Fresh Garlic",
                "store": "Metro",
                "isFlyerDeal": false,
                "flyerPrice": 1.89,
                "regPrice": 1.89
            }
        ],
        "steps": [
            "Whisk maple syrup, Dijon mustard, minced garlic, and salt in a bowl.",
            "Place salmon fillets and asparagus onto a baking sheet lined with parchment.",
            "Brush glaze generously across salmon and drizzle olive oil over asparagus.",
            "Bake at 400°F (200°C) for 14-16 minutes until salmon is nicely glazed and flaky."
        ]
    },
    {
        "id": "r2",
        "title": "Crispy Sheet-Pan Chicken Fajitas",
        "store": "No Frills",
        "flyerDate": "Till Thu, Oct 26",
        "flyerItem": "Club Pack Chicken Breasts",
        "originalPrice": 18.5,
        "flyerPrice": 11,
        "savings": 7.5,
        "servings": 4,
        "prepTime": "30 min",
        "calories": "480 kcal",
        "imageUrl": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
        "allergens": [],
        "ingredients": [
            {
                "name": "Boneless Skinless Chicken Breasts (1kg)",
                "store": "No Frills",
                "isFlyerDeal": true,
                "flyerPrice": 11,
                "regPrice": 18.5
            },
            {
                "name": "Sweet Bell Peppers 3-pack",
                "store": "No Frills",
                "isFlyerDeal": true,
                "flyerPrice": 2.99,
                "regPrice": 5.49
            },
            {
                "name": "Yellow Onions 3lb Bag",
                "store": "No Frills",
                "isFlyerDeal": true,
                "flyerPrice": 1.99,
                "regPrice": 3.49
            },
            {
                "name": "Flour Tortillas 10-pack",
                "store": "No Frills",
                "isFlyerDeal": false,
                "flyerPrice": 2.99,
                "regPrice": 2.99
            }
        ],
        "steps": [
            "Slice chicken breasts and bell peppers into even strips.",
            "Toss on large sheet pan with cumin, chili powder, oregano, olive oil and salt.",
            "Roast at 425°F (220°C) for 20 minutes until edges caramelize.",
            "Serve sizzling warm with charred tortillas and fresh lime wedges."
        ]
    },
    {
        "id": "r3",
        "title": "Creamy Spinach Tortellini Bake",
        "store": "FreshCo",
        "flyerDate": "Till Wed, Oct 25",
        "flyerItem": "Olivieri Fresh Tortellini",
        "originalPrice": 8.99,
        "flyerPrice": 4.49,
        "savings": 4.5,
        "servings": 3,
        "prepTime": "20 min",
        "calories": "510 kcal",
        "imageUrl": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
        "allergens": [
            "Dairy",
            "Gluten"
        ],
        "ingredients": [
            {
                "name": "Olivieri Three Cheese Tortellini (700g)",
                "store": "FreshCo",
                "isFlyerDeal": true,
                "flyerPrice": 4.49,
                "regPrice": 8.99
            },
            {
                "name": "Organic Baby Spinach (312g)",
                "store": "FreshCo",
                "isFlyerDeal": true,
                "flyerPrice": 2.49,
                "regPrice": 4.49
            },
            {
                "name": "Heavy Whipping Cream (473ml)",
                "store": "FreshCo",
                "isFlyerDeal": false,
                "flyerPrice": 3.29,
                "regPrice": 3.29
            }
        ],
        "steps": [
            "Boil tortellini in salted water for 4 minutes and drain.",
            "Wilt spinach in a skillet with garlic and cream.",
            "Combine pasta with sauce, top with mozzarella and broil until bubbly."
        ]
    },
    {
        "id": "r4",
        "title": "Slow-Cooked Beef & Bean Chili",
        "store": "Walmart",
        "flyerDate": "Till Wed, Oct 25",
        "flyerItem": "Lean Ground Beef Value Pack",
        "originalPrice": 17,
        "flyerPrice": 10.97,
        "savings": 6.03,
        "servings": 6,
        "prepTime": "40 min",
        "calories": "450 kcal",
        "imageUrl": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80",
        "allergens": [],
        "ingredients": [
            {
                "name": "Lean Ground Beef (1.2kg)",
                "store": "Walmart",
                "isFlyerDeal": true,
                "flyerPrice": 10.97,
                "regPrice": 17
            },
            {
                "name": "Great Value Kidney Beans 2 Cans",
                "store": "Walmart",
                "isFlyerDeal": true,
                "flyerPrice": 1.94,
                "regPrice": 3
            },
            {
                "name": "Great Value Diced Tomatoes 2 Cans",
                "store": "Walmart",
                "isFlyerDeal": true,
                "flyerPrice": 2.5,
                "regPrice": 4.38
            }
        ],
        "steps": [
            "Brown ground beef in a deep pot with onions and garlic.",
            "Stir in spices, beans, crushed tomatoes and a splash of broth.",
            "Simmer gently on low heat for 35 minutes until rich and thick."
        ]
    }
];
