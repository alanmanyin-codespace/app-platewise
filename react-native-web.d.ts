/// <reference types="expo/types/global" />
/// <reference types="expo/types/metro-require" />

import 'react-native';

declare module 'react-native' {
    interface PressableStateCallbackType {
        hovered?: boolean;
        focused?: boolean;
    }

    interface RefreshControlProps {
        size?: 'default' | 'large';
    }
}
