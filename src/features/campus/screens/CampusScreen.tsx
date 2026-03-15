import React from 'react';

import { HomeScreen } from '@/features/home';

/**
 * Transitional Campus entrypoint for the v2 rollout.
 * The implementation delegates to the legacy home screen until
 * the Campus UI is rebuilt section by section in this feature.
 */
export const CampusScreen = () => <HomeScreen />;
