import { sampleRecipes } from '@/logic/recipes/sampleRecipes';
import { DealRecipeCard } from "@/components/DealRecipeCard";
import { filter } from "@/lib/array/filter";
import { map } from "@/lib/array/map";
import { compare } from "@/lib/boolean/compare";
import { conditionalSafe } from "@/lib/boolean/conditional";
import { theme } from "@/lib/theme";
import { useAtom } from "@/lib/useAtom";
import { activeStoreFilterAtom } from "@/logic/app-state/activeStoreFilterAtom";
import { allergyFiltersAtom } from "@/logic/app-state/allergyFiltersAtom";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { Tabs } from "expo-router";
import { useStore } from "jotai";
import { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
    const [storeFilterOptions] = useState<any[]>(["All Stores", "Metro", "No Frills", "FreshCo", "Walmart"]);
    const store = useStore();
    const [activeStoreFilter] = useAtom(activeStoreFilterAtom);
    const [allergyFilters] = useAtom(allergyFiltersAtom);
    const dealsList = sampleRecipes;

    const visibleDeals = filter(
        dealsList,
        (deal) =>
            compare(activeStoreFilter, 'All Stores', 'equals') ||
            compare(deal.store, activeStoreFilter, 'equals')
    );

    const allergySafeDeals = filter(
        visibleDeals,
        (deal) =>
            !deal.allergens.some((allergen: string) =>
                allergyFilters.some((selectedAllergen) =>
                    compare(allergen, selectedAllergen, 'equals')
                )
            )
    );

    return <><StatusBar barStyle="dark-content"/><Tabs.Screen options={{ "headerShown": false, "tabBarIcon": ({ color, size }) => <MaterialDesignIcons color={color} name="tag-outline" size={size}/>, "title": "Deals" }}/><SafeAreaView edges={["top"]} style={styles.exploreSafeArea}><View style={styles.exploreHeader}><View style={styles.topLocationRow}><View style={styles.locationGroup}><MaterialDesignIcons color={theme.colors.primary} name="map-marker" size={18}/><Text style={styles.locationText}>Sample stores</Text></View><View style={styles.savingsStat}><Text style={styles.savingsStatText}>Example data</Text></View></View><Text accessibilityRole="header" accessibilityLevel={1} style={styles.pageMainTitle}>Sample Deals</Text><Text style={styles.pageSubtitle}>Example meals and illustrative store prices</Text></View><View style={styles.storeFilterScroll}><ScrollView contentContainerStyle={styles.filtersScrollContentContainer} horizontal showsHorizontalScrollIndicator={false}>{map(storeFilterOptions, (item, storeFiltersRepeaterIndex) => <Pressable key={storeFiltersRepeaterIndex} accessibilityRole="button" accessibilityLabel={`Filter deals by ${item}`} aria-pressed={item === activeStoreFilter} style={{ "backgroundColor": conditionalSafe([{ "condition": `${item} = ${activeStoreFilter}`, "value": "#222222" }], "#F7F7F7"), "borderColor": conditionalSafe([{ "condition": `${item} = ${activeStoreFilter}`, "value": "#222222" }], "#EBEBEB"), "borderRadius": 20, "borderWidth": 1, "marginRight": 8, "paddingBottom": 7, "paddingLeft": 14, "paddingRight": 14, "paddingTop": 7 }} onPress={() => { store.set(activeStoreFilterAtom, item); }}><Text style={{ "color": conditionalSafe([{ "condition": `${item} = ${activeStoreFilter}`, "value": "#FFFFFF" }], "#484848"), "fontSize": 12, "fontWeight": "700" }}>{item}</Text></Pressable>)}</ScrollView></View><ScrollView contentContainerStyle={styles.dealsScrollViewContentContainer}><View style={styles.allergenBanner}><MaterialDesignIcons color="#008A05" name="shield-check-outline" size={20}/><Text style={styles.bannerText}>Sample recipes and prices; offers are not current.</Text></View>{map(allergySafeDeals, (item) => <DealRecipeCard key={item.id} recipeData={item}/>)}</ScrollView></SafeAreaView></>;
}

const styles = StyleSheet.create({
        "allergenBanner": {
            "alignItems": "center",
            "backgroundColor": "#F9F9F9",
            "borderColor": "#EEEEEE",
            "borderRadius": 12,
            "borderWidth": 1,
            "flexDirection": "row",
            "marginBottom": 16,
            "padding": 12
        },
        "bannerText": {
            "color": "#484848",
            "flexBasis": 0,
            "flexGrow": 1,
            "flexShrink": 1,
            "fontSize": 12,
            "marginLeft": 8
        },
        "dealsScrollViewContentContainer": {
            "alignSelf": "center",
            "maxWidth": 960,
            "paddingBottom": 24,
            "paddingLeft": 20,
            "paddingRight": 20,
            "width": "100%"
        },
        "exploreHeader": {
            "alignSelf": "center",
            "maxWidth": 960,
            "paddingBottom": 10,
            "paddingLeft": 20,
            "paddingRight": 20,
            "paddingTop": 12,
            "width": "100%"
        },
        "exploreSafeArea": {
            "backgroundColor": "#FFFFFF",
            "flexBasis": 0,
            "flexGrow": 1,
            "flexShrink": 1
        },
        "filtersScrollContentContainer": {
            "alignItems": "center",
            "alignSelf": "center",
            "maxWidth": 960,
            "paddingLeft": 20,
            "paddingRight": 20,
            "width": "100%"
        },
        "locationGroup": {
            "alignItems": "center",
            "flexDirection": "row"
        },
        "locationText": {
            "color": "#222222",
            "fontSize": 13,
            "fontWeight": "700",
            "marginLeft": 4
        },
        "pageMainTitle": {
            "color": "#222222",
            "fontSize": 24,
            "fontWeight": "800",
            "marginTop": 10
        },
        "pageSubtitle": {
            "color": "#717171",
            "fontSize": 13,
            "marginTop": 3
        },
        "savingsStat": {
            "backgroundColor": "#FFF0F2",
            "borderRadius": 12,
            "paddingBottom": 4,
            "paddingLeft": 9,
            "paddingRight": 9,
            "paddingTop": 4
        },
        "savingsStatText": {
            "color": theme.colors.primary,
            "fontSize": 11,
            "fontWeight": "700"
        },
        "storeFilterScroll": {
            "height": 44,
            "marginBottom": 8
        },
        "topLocationRow": {
            "alignItems": "center",
            "flexDirection": "row",
            "justifyContent": "space-between"
        }
    });
