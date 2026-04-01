import type { CampusStackParamList } from '@/app/navigation/types';
import {
  navigateToCampusScreen as navigateToCampusScreenWithRoot,
  navigateToNoticeDetail,
  navigateToNoticeMain as navigateToNoticeMainWithRoot,
  navigateToTaxiAcceptancePending as navigateToTaxiAcceptancePendingWithRoot,
  navigateToTaxiScreen,
} from '@/app/navigation/services/appRouteNavigation';
import type { Party } from '@/features/taxi';

export const navigateToCampusScreen = <
  TScreen extends keyof CampusStackParamList,
>(
  _navigation: unknown,
  screen: TScreen,
  params?: CampusStackParamList[TScreen],
) => navigateToCampusScreenWithRoot(screen, params);

export const navigateToTaxiMain = (_navigation: unknown) => navigateToTaxiScreen();

export const navigateToTaxiAcceptancePending = (
  _navigation: unknown,
  {
    party,
    requestId,
  }: {
    party: Party;
    requestId: string;
  },
) => navigateToTaxiAcceptancePendingWithRoot(party, requestId);

export const navigateToNoticeMain = (_navigation: unknown) =>
  navigateToNoticeMainWithRoot();

export const createCampusEntryNavigation = (
  navigation: unknown,
) => {
  return {
    openCampusScreen: <TScreen extends keyof CampusStackParamList>(
      screen: TScreen,
      params?: CampusStackParamList[TScreen],
    ) => navigateToCampusScreen(navigation, screen, params),
    openNoticeDetail: (noticeId: string) =>
      navigateToNoticeDetail(noticeId),
    openNoticeList: () => navigateToNoticeMain(navigation),
    openPendingJoinRequest: ({
      party,
      requestId,
    }: {
      party: Party;
      requestId: string;
    }) => navigateToTaxiAcceptancePending(navigation, { party, requestId }),
    openTaxiMain: () => navigateToTaxiMain(navigation),
  };
};
