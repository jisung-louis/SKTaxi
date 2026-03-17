import type {ITaxiAcceptancePendingRepository} from './ITaxiAcceptancePendingRepository';
import type {
  TaxiAcceptancePendingAvatarViewData,
  TaxiAcceptancePendingSeed,
  TaxiAcceptancePendingSourceData,
} from '../../model/taxiAcceptancePendingViewData';

const delay = (duration: number) =>
  new Promise(resolve => setTimeout(resolve, duration));

const cloneAvatar = (
  avatar: TaxiAcceptancePendingAvatarViewData,
): TaxiAcceptancePendingAvatarViewData => {
  if (avatar.kind === 'image') {
    return {...avatar};
  }

  return {...avatar};
};

const cloneSeed = (
  seed: TaxiAcceptancePendingSeed,
): TaxiAcceptancePendingSeed => ({
  ...seed,
  leaderAvatar: cloneAvatar(seed.leaderAvatar),
  memberAvatars: seed.memberAvatars.map(cloneAvatar),
});

const cloneSourceData = (
  source: TaxiAcceptancePendingSourceData,
): TaxiAcceptancePendingSourceData => ({
  ...source,
  leaderAvatar: cloneAvatar(source.leaderAvatar),
  memberAvatars: source.memberAvatars.map(cloneAvatar),
});

export class MockTaxiAcceptancePendingRepository
  implements ITaxiAcceptancePendingRepository
{
  async getPendingRequestSource(
    seed: TaxiAcceptancePendingSeed,
  ): Promise<TaxiAcceptancePendingSourceData> {
    await delay(180);

    return cloneSourceData({
      ...cloneSeed(seed),
      cancelButtonLabel: '동승 요청 취소하기',
      cardTitle: '동승 요청한 파티 정보',
      requestState: 'pending',
      statusDescription: '파티장이 요청을 확인하고 있어요',
      statusTitle: '수락 대기중',
    });
  }

  async cancelRequest(_requestId: string): Promise<void> {
    await delay(120);
  }
}
