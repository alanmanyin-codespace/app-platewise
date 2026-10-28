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

    interface TextProps {
        /**
         * react-native-web only. Combined with accessibilityRole='header' it
         * picks the heading element: level 2 renders <h2>. Without it a header
         * always renders <h1>, which flattens the document outline.
         */
        accessibilityLevel?: number;
    }
}
