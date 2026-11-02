import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

type Props = {
    label: string;
    icon: 'arrow-down' | 'arrow-right';
    variant?: 'primary' | 'secondary';
    onPress: () => void;
    disabled?: boolean;
};

/** A left-to-right fill for hover, keyboard focus, and touch. */
export function SlideButton({ label, icon, variant = 'primary', onPress, disabled = false }: Props) {
    const [progress] = useState(() => new Animated.Value(0));
    const interaction = useRef({ hover: false, focus: false, press: false });
    const [width, setWidth] = useState(0);
    const [reduceMotion, setReduceMotion] = useState(true);
    const primary = variant === 'primary';

    useEffect(() => {
        let active = true;
        AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
            if (active) setReduceMotion(enabled);
        }).catch(() => {});
        const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
        return () => { active = false; subscription.remove(); };
    }, []);

    function updateInteraction(kind: 'hover' | 'focus' | 'press', value: boolean) {
        interaction.current[kind] = value;
        const visible = Object.values(interaction.current).some(Boolean);
        progress.stopAnimation();
        if (reduceMotion) {
            progress.setValue(visible ? 1 : 0);
        } else {
            Animated.timing(progress, {
                toValue: visible ? 1 : 0,
                duration: 240,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true
            }).start();
        }
    }

    return <Pressable
        accessibilityRole='button'
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        onHoverIn={() => updateInteraction('hover', true)}
        onHoverOut={() => updateInteraction('hover', false)}
        onFocus={() => updateInteraction('focus', true)}
        onBlur={() => updateInteraction('focus', false)}
        onPressIn={() => updateInteraction('press', true)}
        onPressOut={() => updateInteraction('press', false)}
        style={[styles.button, primary ? styles.primary : styles.secondary, disabled && styles.disabled]}
    >
        <Animated.View pointerEvents='none' style={[StyleSheet.absoluteFill, primary ? styles.primaryFill : styles.secondaryFill, {
            transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [-Math.max(width, 1), 0] }) }]
        }]} />
        <View style={styles.content}>
            <Text style={primary ? styles.primaryText : styles.secondaryText}>{label}</Text>
            <MaterialDesignIcons name={icon} size={18} color={primary ? '#163e32' : '#fff'} />
        </View>
    </Pressable>;
}

const styles = StyleSheet.create({
    button: { borderRadius: 10, minHeight: 46, overflow: 'hidden', justifyContent: 'center' },
    primary: { backgroundColor: '#c8e4a2' }, secondary: { borderColor: '#729584', borderWidth: 1 },
    disabled: { opacity: 0.55 },
    primaryFill: { backgroundColor: '#b2d28d' }, secondaryFill: { backgroundColor: '#3b6855' },
    content: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, minHeight: 46 },
    primaryText: { color: '#163e32', fontWeight: '800', fontSize: 14 },
    secondaryText: { color: '#fff', fontWeight: '700', fontSize: 14 }
});
