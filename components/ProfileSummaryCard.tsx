import { getProfileCompletion, getProfileSummary } from '@/logic/profile/profileSelectors';
import type { Profile } from '@/logic/profile/types';
import { theme } from '@/lib/theme';
import { StyleSheet, Text, View } from 'react-native';

type Props = { profile: Profile | null };

export function ProfileSummaryCard({ profile }: Props) {
    const completion = getProfileCompletion(profile);
    const summary = getProfileSummary(profile);

    return (
        <View style={styles.card}>
            <Text style={styles.eyebrow}>YOUR PROFILE</Text>
            <Text style={styles.title}>{profile?.displayName || 'Your savings profile'}</Text>
            <Text style={styles.progress}>{completion}% complete</Text>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${completion}%` }]} />
            </View>
            {summary.slice(1).map((line) => (
                <Text key={line} style={styles.summaryLine}>
                    {line}
                </Text>
            ))}
            {!profile && <Text style={styles.empty}>Start a short conversation to personalize your savings.</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    card: { backgroundColor: '#222222', borderRadius: 16, marginBottom: 24, padding: 18 },
    empty: { color: '#B0B0B0', fontSize: 12, marginTop: 12 },
    eyebrow: { color: theme.colors.primary, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
    fill: { backgroundColor: theme.colors.primary, borderRadius: 3, height: 6 },
    progress: { color: '#B0B0B0', fontSize: 12, marginTop: 4 },
    summaryLine: { color: '#FFFFFF', fontSize: 12, marginTop: 8 },
    title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 4 },
    track: { backgroundColor: '#4A4A4A', borderRadius: 3, height: 6, marginTop: 10, overflow: 'hidden' }
});
