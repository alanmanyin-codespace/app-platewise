import { StyleSheet, Text, View } from 'react-native';

type Props = {
    storeName?: string;
};

export function StoreBadge({ storeName = 'Metro' }: Props) {
    return (
        <View style={styles.storeBadgeBox}>
            <Text style={styles.storeBadgeText}>{storeName}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    storeBadgeBox: {
        alignSelf: 'flex-start',
        backgroundColor: '#F7F7F7',
        borderColor: '#EBEBEB',
        borderRadius: 6,
        borderWidth: 1,
        paddingBottom: 3,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 3
    },
    storeBadgeText: {
        color: '#222222',
        fontSize: 11,
        fontWeight: '700'
    }
});
