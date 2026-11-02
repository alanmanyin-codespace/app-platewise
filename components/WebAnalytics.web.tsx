import { Analytics } from '@vercel/analytics/react';
import { usePathname } from 'expo-router';

export function WebAnalytics() {
    const pathname = usePathname();
    return <Analytics route={pathname} path={pathname} />;
}
