import type {
  NavigationState,
  PartialState,
  Route,
} from '@react-navigation/native';

type NavigationStateLike = NavigationState | PartialState<NavigationState>;
type NavigationRouteLike = Route<string> & {
  state?: NavigationStateLike;
  params?: Record<string, unknown>;
};

export const getCurrentLeafRouteFromNavigationState = (
  state: NavigationStateLike | undefined,
): NavigationRouteLike | undefined => {
  if (!state || !state.routes || state.routes.length === 0) {
    return undefined;
  }

  const activeRoute = state.routes[state.index ?? state.routes.length - 1] as
    | NavigationRouteLike
    | undefined;

  if (!activeRoute) {
    return undefined;
  }

  if (!activeRoute.state) {
    return activeRoute;
  }

  return getCurrentLeafRouteFromNavigationState(activeRoute.state);
};

export const getCurrentRouteNameFromNavigationState = (
  state: NavigationStateLike | undefined,
) => getCurrentLeafRouteFromNavigationState(state)?.name;
