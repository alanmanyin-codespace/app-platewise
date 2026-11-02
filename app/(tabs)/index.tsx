import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { Image } from 'expo-image';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { SlideButton } from '@/components/SlideButton';
import { router, useIsFocused } from 'expo-router';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAtom } from '@/lib/useAtom';
import { HOME_EDGE_PADDING, HOME_MAX_WIDTH } from '@/lib/layout';
import { allergyFiltersAtom } from '@/logic/app-state/allergyFiltersAtom';
import { authReadyAtom, authSessionAtom } from '@/logic/auth/authState';
import { clearPendingInterview } from '@/logic/profile/pendingInterview';
import { openRecipeDetail } from '@/logic/actions/openRecipeDetail';
import { filterRecipes } from '@/logic/recipes/discover';
import { sampleRecipes } from '@/logic/recipes/sampleRecipes';
import type { Recipe } from '@/logic/types';

const stores = ['All stores', ...new Set(sampleRecipes.map((recipe) => recipe.store))];
const times = [{ label: 'Any time', value: null }, { label: '30 min or less', value: 30 }, { label: '20 min or less', value: 20 }];

export default function Home() {
    const focused = useIsFocused();
    const [store, setStore] = useState('All stores');
    const [maxMinutes, setMaxMinutes] = useState<number | null>(null);
    const [allergies] = useAtom(allergyFiltersAtom);
    const [session] = useAtom(authSessionAtom);
    const [authReady] = useAtom(authReadyAtom);
    const [discoveryY, setDiscoveryY] = useState(0);
    const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
    const { width } = useWindowDimensions();
    const wide = width >= 1024;
    const grid = width >= 700;
    const meals = useMemo(() => filterRecipes(sampleRecipes, { store, maxMinutes, excludedAllergens: allergies }), [store, maxMinutes, allergies]);

    function openProfile() {
        if (session) router.navigate('/(tabs)/profile');
        else {
            clearPendingInterview();
            router.push({ pathname: '/profile-interview', params: { mode: 'create' } });
        }
    }

    if (!focused) return null;

    return <SafeAreaView edges={['top']} style={styles.page}>
        <StatusBar barStyle='dark-content' />
        <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
            <View style={[styles.hero, wide && styles.heroWide]}>
                <View style={styles.heroCopy}>
                    <Text style={styles.eyebrow}>A LITTLE MORE ROOM AT THE TABLE</Text>
                    <Text accessibilityRole='header' accessibilityLevel={1} style={styles.heroTitle}>Eat better.{'\n'}Spend less.{'\n'}Waste less.</Text>
                    <Text style={styles.heroDescription}>Good meals start with a little inspiration. Explore approachable recipes and make a plan that works for you.</Text>
                    <View style={styles.profilePrompt}>
                        <View style={styles.profileIntro}>
                            <View style={styles.profileIcon}><MaterialDesignIcons name='account-heart-outline' size={23} color='#2d6a5b' /></View>
                            <View style={styles.profileIntroText}>
                                <Text style={styles.profileTitle}>{session ? 'Your preferences, your way' : 'Make PlateWise yours'}</Text>
                                <Text style={styles.profileDescription}>{session ? 'View or update your food preferences anytime.' : 'Create a profile to keep your food preferences in one place.'}</Text>
                            </View>
                        </View>
                        <View style={styles.profileAction}>
                            <SlideButton label={!authReady ? 'Please wait…' : session ? 'View your profile' : 'Create your profile'} icon='arrow-right' disabled={!authReady} onPress={openProfile} />
                        </View>
                    </View>
                    <View style={styles.heroActions}>
                        <SlideButton label='Browse meals' icon='arrow-down' variant='secondary' onPress={() => scrollRef.current?.scrollTo({ y: discoveryY, animated: true })} />
                        <SlideButton label='See a sample week' icon='arrow-right' variant='secondary' onPress={() => router.navigate('/(tabs)/planner')} />
                    </View>
                </View>
                <View style={[styles.heroImageFrame, wide && styles.heroImageWide]}>
                    <Image source={sampleRecipes[0].imageUrl} contentFit='cover' accessibilityLabel='A prepared salmon meal' style={styles.heroImage} />
                </View>
            </View>
            <View style={styles.discovery} onLayout={(event) => setDiscoveryY(event.nativeEvent.layout.y)}>
                <View style={styles.sectionHeading}>
                    <View style={styles.sectionHeadingText}>
                        <Text style={styles.kicker}>YOUR NEXT MEAL, SORTED</Text>
                        <Text accessibilityRole='header' accessibilityLevel={2} style={styles.sectionTitle}>Find something good</Text>
                        <Text style={styles.sectionSubtitle}>Simple ideas for everyday cooking. Pick a recipe to see what goes into it.</Text>
                    </View>
                    <Text style={styles.sampleTag}>Sample recipes</Text>
                </View>
                <Text style={styles.filterLabel}>PREP TIME</Text>
                <View style={styles.filterRow}>{times.map((item) => <FilterChip key={item.label} label={item.label} selected={maxMinutes === item.value} onPress={() => setMaxMinutes(item.value)} />)}</View>
                <Text style={styles.filterLabel}>STORE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storeFilters}>{stores.map((item) => <FilterChip key={item} label={item} selected={store === item} onPress={() => setStore(item)} />)}</ScrollView>
                <Text style={styles.resultCount}>{meals.length} {meals.length === 1 ? 'meal' : 'meals'} to explore{allergies.length > 0 ? ' · Your allergy filters are applied' : ''}</Text>
                {meals.length ? <View style={styles.grid}>{meals.map((meal) => <MealCard key={meal.id} recipe={meal} grid={grid} />)}</View> : <View style={styles.empty}>
                    <Text style={styles.emptyTitle}>No meals match those filters</Text><Text style={styles.emptyText}>Try another store or a longer prep time.</Text>
                    <Pressable accessibilityRole='button' onPress={() => { setStore('All stores'); setMaxMinutes(null); }}><Text style={styles.resetText}>Clear filters</Text></Pressable>
                </View>}
                <Text style={styles.disclaimer}>Recipes and store references are examples, not current flyer offers.</Text>
            </View>
        </ScrollView>
    </SafeAreaView>;
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
    return <Pressable accessibilityRole='button' accessibilityState={{ selected }} onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>;
}

function MealCard({ recipe, grid }: { recipe: Recipe; grid: boolean }) {
    return <Pressable accessibilityRole='button' accessibilityLabel={`${recipe.title}, ${recipe.prepTime}, serves ${recipe.servings}`} accessibilityHint='View recipe and ingredients' onPress={() => openRecipeDetail({ recipeData: recipe })} style={[styles.mealCard, grid && styles.mealCardGrid]}>
        <Image source={recipe.imageUrl} contentFit='cover' accessibilityLabel={`${recipe.title}, plated`} style={styles.mealImage} />
        <View style={styles.mealBody}>
            <View style={styles.mealMeta}><Text style={styles.mealStore}>{recipe.store} · SAMPLE</Text><Text style={styles.mealTime}>{recipe.prepTime}</Text></View>
            <Text style={styles.mealTitle}>{recipe.title}</Text>
            <Text numberOfLines={2} style={styles.ingredients}>{recipe.ingredients.map((item) => item.name.replace(/\s*\([^)]*\)/g, '')).join(' · ')}</Text>
            <View style={styles.mealFooter}><Text style={styles.servings}>Serves {recipe.servings}</Text><Text style={styles.viewRecipe}>View recipe  →</Text></View>
        </View>
    </Pressable>;
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: '#f7f8f4' }, content: { width: '100%', maxWidth: HOME_MAX_WIDTH, alignSelf: 'center', paddingHorizontal: HOME_EDGE_PADDING, paddingTop: 20, paddingBottom: 48 },
    hero: { backgroundColor: '#173f33', borderRadius: 20, overflow: 'hidden' }, heroWide: { flexDirection: 'row', minHeight: 390 }, heroCopy: { padding: 28, flex: 1, justifyContent: 'center' },
    eyebrow: { color: '#b9d8b3', fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 16 }, heroTitle: { color: '#fff', fontSize: 39, lineHeight: 45, fontWeight: '800', letterSpacing: -1 }, heroDescription: { color: '#dbe9dd', fontSize: 15, lineHeight: 23, maxWidth: 420, marginTop: 16 },
    profilePrompt: { maxWidth: 520, marginTop: 22, padding: 16, backgroundColor: '#edf4e6', borderRadius: 14, shadowColor: '#0b261c', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 5 },
    profileIntro: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 }, profileIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#d8e8ce', alignItems: 'center', justifyContent: 'center' }, profileIntroText: { flex: 1 },
    profileTitle: { color: '#203d30', fontSize: 16, fontWeight: '800' }, profileDescription: { color: '#50675a', fontSize: 13, lineHeight: 19, marginTop: 4 },
    profileAction: { alignItems: 'flex-start', marginTop: 14 },
    heroActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
    heroImageFrame: { height: 220, overflow: 'hidden', backgroundColor: '#6d846b' }, heroImageWide: { width: '42%', height: 'auto' }, heroImage: { width: '100%', height: '100%' },
    discovery: { paddingTop: 38 }, sectionHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 22 }, sectionHeadingText: { flexShrink: 1 }, kicker: { color: '#547461', fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: 7 }, sectionTitle: { color: '#213c30', fontSize: 28, fontWeight: '800', letterSpacing: -0.6 }, sectionSubtitle: { color: '#66746c', fontSize: 14, lineHeight: 21, marginTop: 7 }, sampleTag: { color: '#536b5c', backgroundColor: '#e7eee5', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, fontSize: 11, fontWeight: '700' },
    filterLabel: { color: '#748178', fontSize: 10, letterSpacing: 0.8, fontWeight: '800', marginBottom: 8 }, filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }, storeFilters: { gap: 8, paddingBottom: 2 }, chip: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dae2d9', borderRadius: 20, paddingHorizontal: 14, minHeight: 38, justifyContent: 'center' }, chipSelected: { backgroundColor: '#254f3d', borderColor: '#254f3d' }, chipText: { color: '#53645a', fontSize: 13, fontWeight: '600' }, chipTextSelected: { color: '#fff' }, resultCount: { color: '#748178', fontSize: 12, marginTop: 21, marginBottom: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }, mealCard: { width: '100%', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderColor: '#e5ebe3', borderWidth: 1 }, mealCardGrid: { width: '48%' }, mealImage: { width: '100%', height: 195, backgroundColor: '#dce7da' }, mealBody: { padding: 16 }, mealMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, mealStore: { color: '#63806b', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 }, mealTime: { color: '#64736a', fontSize: 12, fontWeight: '600' }, mealTitle: { color: '#23392e', fontSize: 18, fontWeight: '800', marginTop: 8 }, ingredients: { color: '#748178', fontSize: 13, lineHeight: 20, marginTop: 8, minHeight: 40 }, mealFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#edf1eb', paddingTop: 12, marginTop: 14 }, servings: { color: '#748178', fontSize: 12, fontWeight: '600' }, viewRecipe: { color: '#2d6a5b', fontSize: 13, fontWeight: '800' },
    empty: { backgroundColor: '#fff', borderRadius: 14, padding: 24 }, emptyTitle: { color: '#213c30', fontSize: 16, fontWeight: '800' }, emptyText: { color: '#748178', marginTop: 6 }, resetText: { color: '#2d6a5b', fontWeight: '700', marginTop: 14 }, disclaimer: { color: '#748178', fontSize: 12, lineHeight: 18, marginTop: 24 }
});
