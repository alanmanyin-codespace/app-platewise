import { useState } from 'react';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAtom } from '@/lib/useAtom';
import { pantryAtom, pantryHydratedAtom, removePantryItem } from '@/logic/pantry/pantryState';
import { normalizeIngredientId } from '@/logic/pantry/normalizeIngredient';
import { savePantry } from '@/logic/pantry/pantryStorage';
import { syncShoppingList } from '@/logic/pantry/syncShoppingList';
import type { PantryItem } from '@/logic/pantry/types';
import type { Unit } from '@/logic/pantry/units';

const units: Unit[] = ['g', 'kg', 'ml', 'l', 'piece'];

export default function Pantry() {
    const [items, setItems] = useAtom(pantryAtom);
    const [hydrated] = useAtom(pantryHydratedAtom);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [unit, setUnit] = useState<Unit>('g');
    const [editing, setEditing] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [photo, setPhoto] = useState<string | undefined>();
    const [processingPhoto, setProcessingPhoto] = useState(false);

    async function choosePhoto() {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
            if (result.canceled) return;
            setProcessingPhoto(true);
            const asset = result.assets[0];
            const resize = asset.width > 480 || asset.height > 480
                ? [{ resize: asset.width >= asset.height ? { width: 480 } : { height: 480 } }] : [];
            const image = await manipulateAsync(asset.uri, resize, { format: SaveFormat.JPEG, compress: 0.6, base64: true });
            if (!image.base64) throw new Error('Image conversion failed');
            setPhoto(`data:image/jpeg;base64,${image.base64}`);
        } catch {
            Alert.alert('Could not add photo', 'Please choose another image and try again.');
        } finally { setProcessingPhoto(false); }
    }

    async function persist(next: PantryItem[]) {
        setSaving(true);
        try {
            await savePantry(next);
            setItems(next);
            // Jotai's default store is updated synchronously by setItems.
            syncShoppingList();
            return true;
        } catch {
            Alert.alert('Could not save pantry', 'Please try again.');
            return false;
        } finally { setSaving(false); }
    }

    async function submit() {
        const ingredientId = normalizeIngredientId(name);
        const parsedAmount = Number(amount);
        if (!ingredientId || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Check your entry', 'Enter an ingredient name and a quantity greater than zero.');
            return;
        }
        if (items.some((item) => item.ingredientId === ingredientId && item.ingredientId !== editing)) {
            Alert.alert('Already in pantry', 'Edit the existing item to change its quantity.');
            return;
        }
        const next = [...items.filter((item) => item.ingredientId !== editing), { ingredientId, name: name.trim(), quantity: { amount: parsedAmount, unit }, ...(photo ? { photo } : {}) }];
        if (await persist(next)) { setName(''); setAmount(''); setPhoto(undefined); setEditing(null); }
    }

    return <SafeAreaView edges={['top']} style={styles.page}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
            <Text accessibilityRole='header' style={styles.title}>My Pantry</Text>
            <Text style={styles.subtitle}>Keep track of what you have so your shopping list includes only what you need.</Text>
            <View style={styles.card}>
                <Text style={styles.heading}>{editing ? 'Edit ingredient' : 'Add ingredient'}</Text>
                <View style={styles.entryRow}>
                    <View style={styles.entryFields}>
                        <TextInput accessibilityLabel='Ingredient name' placeholder='Ingredient name' value={name} onChangeText={setName} style={styles.input} />
                        <TextInput accessibilityLabel='Quantity' placeholder='Quantity' keyboardType='decimal-pad' value={amount} onChangeText={setAmount} style={styles.input} />
                    </View>
                    <Pressable accessibilityRole='button' accessibilityLabel={photo ? 'Change photo' : 'Add photo'} accessibilityHint='Choose an optional photo from your library' disabled={saving || processingPhoto} onPress={choosePhoto} style={styles.photoPlaceholder}>
                        {photo ? <Image source={{ uri: photo }} style={styles.preview} /> : <>
                            <MaterialDesignIcons name='camera-plus-outline' size={26} color='#b02c42' />
                            <Text style={styles.photoLabel}>{processingPhoto ? 'Preparing…' : 'Add photo'}</Text>
                            <Text style={styles.photoOptional}>Optional</Text>
                        </>}
                    </Pressable>
                </View>
                {photo && <Pressable accessibilityRole='button' disabled={saving || processingPhoto} onPress={() => setPhoto(undefined)}><Text style={styles.link}>Remove photo</Text></Pressable>}
                <View style={styles.units}>{units.map((choice) => <Pressable key={choice} accessibilityRole='button' accessibilityState={{ selected: unit === choice }} onPress={() => setUnit(choice)} style={[styles.unit, unit === choice && styles.selected]}><Text>{choice}</Text></Pressable>)}</View>
                <Pressable accessibilityRole='button' disabled={!hydrated || saving || processingPhoto} onPress={submit} style={styles.button}><Text style={styles.buttonText}>{editing ? 'Save changes' : 'Add to pantry'}</Text></Pressable>
                {editing && <Pressable onPress={() => { setEditing(null); setName(''); setAmount(''); setPhoto(undefined); }}><Text style={styles.link}>Cancel editing</Text></Pressable>}
            </View>
            {!hydrated ? <Text>Loading pantry…</Text> : items.length === 0 ? <Text style={styles.subtitle}>Your pantry is empty. Add an ingredient to get started.</Text> : items.map((item) => <View key={item.ingredientId} style={styles.row}>
                {item.photo && <Image source={{ uri: item.photo }} style={styles.thumbnail} accessibilityLabel={`${item.name} photo`} />}
                <View style={styles.item}><Text style={styles.heading}>{item.name}</Text><Text>{item.quantity.amount} {item.quantity.unit}</Text></View>
                <Pressable accessibilityRole='button' accessibilityLabel={`Edit ${item.name}`} disabled={saving} onPress={() => { setEditing(item.ingredientId); setName(item.name); setAmount(String(item.quantity.amount)); setUnit(item.quantity.unit); setPhoto(item.photo); }}><Text style={styles.link}>Edit</Text></Pressable>
                <Pressable accessibilityRole='button' accessibilityLabel={`Delete ${item.name}`} disabled={saving} onPress={() => { void persist(removePantryItem(items, item.ingredientId)); }}><Text style={styles.link}>Delete</Text></Pressable>
            </View>)}
        </ScrollView>
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: '#fff' }, content: { width: '100%', maxWidth: 960, alignSelf: 'center', padding: 20, paddingBottom: 40 },
    title: { fontSize: 24, fontWeight: '800', color: '#222' }, subtitle: { color: '#717171', marginTop: 6, marginBottom: 18 },
    card: { backgroundColor: '#f7f7f7', borderRadius: 14, padding: 16, marginBottom: 20 }, heading: { fontSize: 16, fontWeight: '700', color: '#222' },
    input: { backgroundColor: '#fff', borderColor: '#ddd', borderWidth: 1, borderRadius: 8, padding: 12, marginTop: 10 },
    units: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 }, unit: { paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 }, selected: { backgroundColor: '#ffe5e9', borderColor: '#d54158' },
    button: { backgroundColor: '#d54158', borderRadius: 8, padding: 12, alignItems: 'center' }, buttonText: { color: '#fff', fontWeight: '700' },
    entryRow: { flexDirection: 'row', alignItems: 'stretch', gap: 12, marginTop: 10 }, entryFields: { flex: 1, minWidth: 0, marginTop: -10 },
    photoPlaceholder: { width: 100, minHeight: 106, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: '#d9a5ad', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    photoLabel: { color: '#b02c42', fontWeight: '700', fontSize: 12, marginTop: 4 }, photoOptional: { color: '#717171', fontSize: 11, marginTop: 2 },
    preview: { width: '100%', height: '100%', position: 'absolute' }, thumbnail: { width: 48, height: 48, borderRadius: 8 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 14, borderWidth: 1, borderColor: '#eee', borderRadius: 10, marginBottom: 8 }, item: { flex: 1 }, link: { color: '#b02c42', fontWeight: '700', paddingVertical: 8 }
});
