import { find } from "@/lib/array/find";
import { map } from "@/lib/array/map";
import { compare } from "@/lib/boolean/compare";
import { conditionalSafe } from "@/lib/boolean/conditional";
import { useAtom } from "@/lib/useAtom";
import { toggleAllergy } from "@/logic/actions/toggleAllergy";
import { allergyFiltersAtom } from "@/logic/app-state/allergyFiltersAtom";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import { Tabs } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
    const [availableAllergens] = useState<any[]>(["Peanuts", "Tree Nuts", "Dairy", "Gluten", "Shellfish", "Soy", "Eggs"]);
    const [allergyFilters] = useAtom(allergyFiltersAtom);
    const [canadianStores] = useState<any[]>([{ "name": "No Frills", "distance": "0.8 km", "status": "Flyer valid till Thu" }, { "name": "Metro", "distance": "1.2 km", "status": "Flyer valid till Wed" }, { "name": "FreshCo", "distance": "2.1 km", "status": "Flyer valid till Wed" }, { "name": "Walmart Supercentre", "distance": "3.4 km", "status": "Flyer valid till Wed" }, { "name": "Food Basics", "distance": "4.0 km", "status": "Flyer valid till Thu" }]);

    const isAllergenSelected = (allergen: string) =>
        Boolean(
            find(allergyFilters, (selectedAllergen) =>
                compare(selectedAllergen, allergen, 'equals')
            )
        );

    return <><StatusBar barStyle="dark-content"/><Tabs.Screen options={{ "headerShown": false, "tabBarIcon": ({ color, size }) => <MaterialDesignIcons color={color} name="account-cog-outline" size={size}/>, "title": "Savings Hub" }}/><SafeAreaView edges={["top"]} style={styles.profileSafeArea}><ScrollView contentContainerStyle={styles.profileScrollContentContainer}><Text style={styles.prefTitle}>Savings &amp; Allergies</Text><Text style={styles.prefSub}>Control what recipes are generated from flyer sale deals</Text><View style={styles.savingsTrophyCard}><Text style={styles.trophyHeadline}>October Savings To Date</Text><Text style={styles.trophyAmount}>&#36;143.20</Text><Text style={styles.trophySub}>Compared to standard Canadian shelf prices</Text></View><View style={styles.allergenSection}><Text style={styles.allergenSectionTitle}>Allergy &amp; Dietary Exclusion</Text><Text style={styles.allergenSectionDesc}>Tap to filter out recipes containing these ingredients automatically.</Text><View style={styles.allergenChipsWrap}>{map(availableAllergens, (item, index) => <Pressable key={index} style={{ "alignItems": "center", "backgroundColor": conditionalSafe([{ "condition": `${isAllergenSelected(item)} = true`, "value": "#FF385C" }], "#F7F7F7"), "borderColor": conditionalSafe([{ "condition": `${isAllergenSelected(item)} = true`, "value": "#FF385C" }], "#EBEBEB"), "borderRadius": 20, "borderWidth": 1, "flexDirection": "row", "marginBottom": 8, "marginRight": 8, "paddingBottom": 8, "paddingLeft": 12, "paddingRight": 12, "paddingTop": 8 }} onPress={() => { toggleAllergy({ "allergen": item }); }}><MaterialDesignIcons color={conditionalSafe([{ "condition": `${isAllergenSelected(item)} = true`, "value": "#FFFFFF" }], "#717171")} name={conditionalSafe([{ "condition": `${isAllergenSelected(item)} = true`, "value": "close-circle" }], "plus-circle-outline")} size={14}/><Text style={{ "color": conditionalSafe([{ "condition": `${isAllergenSelected(item)} = true`, "value": "#FFFFFF" }], "#222222"), "fontSize": 12, "fontWeight": "700", "marginLeft": 4 }}>{item}</Text></Pressable>)}</View></View><View><Text style={styles.allergenSectionTitle}>Tracked Grocery Stores</Text><Text style={styles.allergenSectionDesc}>Digital flyers parsed every Wednesday night for current discounts</Text>{map(canadianStores, ({ distance, name, status }, index) => <View key={index} style={styles.storeRowBox}><View><Text style={styles.storeListTitle}>{name}</Text><Text style={styles.storeListValid}>{status}</Text></View><Text style={styles.storeListDist}>{distance}</Text></View>)}</View></ScrollView></SafeAreaView></>;
}

const styles = StyleSheet.create({
        "allergenChipsWrap": {
            "flexDirection": "row",
            "flexWrap": "wrap"
        },
        "allergenSection": {
            "marginBottom": 24
        },
        "allergenSectionDesc": {
            "color": "#717171",
            "fontSize": 12,
            "marginBottom": 12
        },
        "allergenSectionTitle": {
            "color": "#222222",
            "fontSize": 16,
            "fontWeight": "700",
            "marginBottom": 6
        },
        "prefSub": {
            "color": "#717171",
            "fontSize": 13,
            "marginBottom": 18,
            "marginTop": 2
        },
        "prefTitle": {
            "color": "#222222",
            "fontSize": 24,
            "fontWeight": "800"
        },
        "profileSafeArea": {
            "backgroundColor": "#FFFFFF",
            "flexBasis": 0,
            "flexGrow": 1,
            "flexShrink": 1
        },
        "profileScrollContentContainer": {
            "paddingBottom": 32,
            "paddingLeft": 20,
            "paddingRight": 20,
            "paddingTop": 12
        },
        "savingsTrophyCard": {
            "backgroundColor": "#222222",
            "borderRadius": 16,
            "marginBottom": 24,
            "padding": 18
        },
        "storeListDist": {
            "color": "#717171",
            "fontSize": 12,
            "fontWeight": "600"
        },
        "storeListTitle": {
            "color": "#222222",
            "fontSize": 14,
            "fontWeight": "700"
        },
        "storeListValid": {
            "color": "#008A05",
            "fontSize": 11,
            "marginTop": 1
        },
        "storeRowBox": {
            "alignItems": "center",
            "borderBottomColor": "#F2F2F2",
            "borderBottomWidth": 1,
            "flexDirection": "row",
            "justifyContent": "space-between",
            "paddingBottom": 12,
            "paddingTop": 12
        },
        "trophyAmount": {
            "color": "#FFFFFF",
            "fontSize": 32,
            "fontWeight": "900",
            "marginBottom": 4,
            "marginTop": 4
        },
        "trophyHeadline": {
            "color": "#FF385C",
            "fontSize": 12,
            "fontWeight": "700",
            "textTransform": "uppercase"
        },
        "trophySub": {
            "color": "#B0B0B0",
            "fontSize": 12
        }
    });
