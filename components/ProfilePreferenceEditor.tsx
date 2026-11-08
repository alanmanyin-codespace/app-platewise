import type { Profile, ProfileListField } from '@/logic/profile/types';
import { theme } from '@/lib/theme';
import { PROFILE_WIZARD_STEPS } from '@/logic/profile/profileWizard';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { profile: Profile; onToggle: (field: ProfileListField, value: string) => void };

const EXCLUSIVE = new Set(['None', 'No preference']);
const stepOptions = (field: ProfileListField) => (PROFILE_WIZARD_STEPS.find((step) => step.field === field)?.options ?? []).filter((option) => !EXCLUSIVE.has(option));

// Quick toggles for the fixed lists only; cuisines, proteins, disliked ingredients and stores come
// from platewise-api and are edited in the profile setup.
const groups: { field: ProfileListField; label: string; options: string[] }[] = [
    { field: 'allergies', label: 'Allergies', options: stepOptions('allergies') },
    { field: 'dietaryPreferences', label: 'Diet', options: stepOptions('dietaryPreferences') }
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
    selectedChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    selectedChipText: { color: '#FFFFFF' }
});
