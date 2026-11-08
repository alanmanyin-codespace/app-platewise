/**
 * What an ingredient key (as built by platewise-api, e.g. "unsalted butter",
 * "prawn") implies for allergies and diets. TheMealDB marks neither, so these are
 * PlateWise's own rules, matched on whole words.
 */
export type IngredientGroup = 'meat' | 'pork' | 'beef' | 'lamb' | 'goat' | 'chicken' | 'fish' | 'seafood' | 'dairy' | 'egg' | 'honey';
export type IngredientTagSet = { allergens: string[]; groups: IngredientGroup[] };

/** `except`: whole phrases that never match the rule, e.g. "cream of tartar". */
type Rule = { words: string[]; unless?: string[]; except?: string[] };

// A word listed in `unless` directly before the match cancels it ("coconut milk", "rice flour").
const ALLERGENS: Record<string, Rule> = {
    Dairy: {
        words: ['butter', 'buttermilk', 'cheese', 'cheddar', 'parmesan', 'mozzarella', 'ricotta', 'mascarpone', 'feta', 'brie', 'gruyere', 'paneer', 'milk', 'cream', 'yogurt', 'yoghurt', 'ghee', 'creme fraiche', 'custard', 'condensed milk'],
        unless: ['peanut', 'almond', 'cashew', 'coconut', 'soy', 'soya', 'oat', 'rice', 'cocoa', 'shea', 'vegan'],
        except: ['cream of tartar']
    },
    Gluten: {
        words: ['flour', 'bread', 'breadcrumb', 'pasta', 'spaghetti', 'penne', 'macaroni', 'lasagne', 'lasagna', 'linguine', 'fettuccine', 'tagliatelle', 'rigatoni', 'fusilli', 'farfalle', 'noodle', 'couscous', 'bulgur', 'barley', 'semolina', 'wheat', 'rye', 'pastry', 'filo', 'tortilla', 'biscuit', 'cracker', 'digestive biscuit', 'soy sauce', 'beer', 'bun', 'pitta', 'spelt', 'naan', 'baguette', 'brioche', 'croissant'],
        unless: ['rice', 'corn', 'almond', 'coconut', 'gram', 'chickpea', 'potato', 'tapioca', 'buckwheat', 'gluten-free', 'corn tortilla']
    },
    Peanuts: { words: ['peanut', 'groundnut'] },
    'Tree Nuts': { words: ['almond', 'cashew', 'walnut', 'pecan', 'hazelnut', 'pistachio', 'macadamia', 'brazil nut', 'pine nut', 'chestnut', 'praline', 'marzipan'] },
    Shellfish: { words: ['prawn', 'shrimp', 'crab', 'lobster', 'mussel', 'clam', 'oyster', 'scallop', 'squid', 'crayfish', 'langoustine'] },
    Fish: { words: ['fish', 'salmon', 'tuna', 'cod', 'haddock', 'mackerel', 'sardine', 'anchovy', 'trout', 'tilapia', 'halibut', 'sea bass', 'monkfish', 'herring', 'kipper', 'pilchard', 'swordfish', 'snapper', 'sole', 'plaice', 'pollock', 'worcestershire'] },
    Eggs: { words: ['egg', 'mayonnaise', 'meringue'], unless: ['vegan'] },
    Soy: { words: ['soy', 'soya', 'tofu', 'tempeh', 'edamame', 'miso'] },
    Sesame: { words: ['sesame', 'tahini'] }
};

const GROUPS: Partial<Record<IngredientGroup, Rule>> = {
    pork: { words: ['pork', 'bacon', 'ham', 'sausage', 'chorizo', 'pancetta', 'prosciutto', 'lard', 'gammon', 'salami', 'pepperoni'] },
    beef: { words: ['beef', 'steak', 'brisket', 'oxtail', 'veal', 'minced beef'] },
    lamb: { words: ['lamb', 'mutton'] },
    goat: { words: ['goat meat'] },
    chicken: { words: ['chicken', 'turkey', 'duck', 'goose'] },
    honey: { words: ['honey'] }
};
// Animal products that rule out vegetarian and vegan recipes without naming one animal.
const MEAT_ONLY: Rule = { words: ['gelatine', 'gelatin', 'suet', 'dripping'] };
const MEAT: IngredientGroup[] = ['pork', 'beef', 'lamb', 'goat', 'chicken'];

function matches(words: string[], rule: Rule): boolean {
    const text = words.join(' ');
    if (rule.except?.some((phrase) => text.includes(phrase))) return false;
    return rule.words.some((phrase) => {
        const target = phrase.split(' ');
        for (let i = 0; i + target.length <= words.length; i++) {
            if (target.every((word, n) => words[i + n] === word)) {
                const before = words[i - 1];
                if (!before || !rule.unless?.includes(before)) return true;
            }
        }
        return false;
    });
}

export function ingredientTags(key: string): IngredientTagSet {
    const words = key.toLowerCase().split(/\s+/).filter(Boolean);
    const allergens = Object.entries(ALLERGENS).filter(([, rule]) => matches(words, rule)).map(([name]) => name);
    const groups = (Object.entries(GROUPS) as [IngredientGroup, Rule][]).filter(([, rule]) => matches(words, rule)).map(([name]) => name);
    if (groups.some((group) => MEAT.includes(group)) || matches(words, MEAT_ONLY)) groups.push('meat');
    if (allergens.includes('Fish')) groups.push('fish');
    if (allergens.includes('Shellfish')) groups.push('seafood');
    if (allergens.includes('Dairy')) groups.push('dairy');
    if (allergens.includes('Eggs')) groups.push('egg');
    return { allergens, groups };
}
