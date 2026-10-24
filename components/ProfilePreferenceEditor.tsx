import type { Profile, ProfileListField } from '@/logic/profile/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { profile: Profile; onToggle: (field: ProfileListField, value: string) => void };

const groups: { field: ProfileListField; label: string; options: string[] }[] = [
    { field: 'allergies', label: 'Allergies', options: ['Peanuts', 'Tree Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs'] },
    { field: 'dietaryPreferences', label: 'Dietary preferences', options: ['Vegetarian', 'High protein', 'Low carb', 'No preference'] },
    { field: 'mealPlanningPreferences', label: 'Meal planning', options: ['A few dinners', 'The whole week', 'Quick meals', 'Batch cooking'] },
    { field: 'preferredStores', label: 'Preferred stores', options: ['Metro', 'No Frills', 'FreshCo', 'Walmart', 'Food Basics'] }
];

export function ProfilePreferenceEditor({ profile, onToggle }: Props) {
    return (
        <View>
            {groups.map(({ field, label, options }) => (
                <View key={field} style={styles.group}>
                    <Text style={styles.label}>{label}</Text>
                    <View style={styles.chips}>
                        {options.map((option) => {
                            const selected = profile[field].includes(option);
                            return (
                                <Pressable key={option} onPress={() => onToggle(field, option)} style={[styles.chip, selected && styles.selectedChip]}>
                                    <Text style={[styles.chipText, selected && styles.selectedChipText]}>{option}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    chip: { borderColor: '#EBEBEB', borderRadius: 18, borderWidth: 1, marginBottom: 8, marginRight: 8, paddingHorizontal: 12, paddingVertical: 8 },
    chipText: { color: '#222222', fontSize: 12, fontWeight: '700' },
    chips: { flexDirection: 'row', flexWrap: 'wrap' },
    group: { marginBottom: 18 },
    label: { color: '#222222', fontSize: 16, fontWeight: '700', marginBottom: 8 },
    selectedChip: { backgroundColor: '#FF385C', borderColor: '#FF385C' },
    selectedChipText: { color: '#FFFFFF' }
});
