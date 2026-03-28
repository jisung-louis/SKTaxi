import type {AppVersionApiClient} from '../../api/appVersionApiClient';
import {SpringAppConfigRepository} from '../SpringAppConfigRepository';

describe('SpringAppConfigRepository', () => {
  it('백엔드 앱 버전 응답을 프론트 버전 설정 포맷으로 변환한다', async () => {
    const apiClient: AppVersionApiClient = {
      getAppVersion: jest.fn().mockResolvedValue({
        data: {
          platform: 'android',
          minimumVersion: '1.2.3',
          forceUpdate: true,
          title: '업데이트 안내',
          message: '새 버전으로 업데이트 해주세요.',
          showButton: true,
          buttonText: '업데이트',
          buttonUrl: 'https://play.google.com/store/apps/details?id=kr.skuri.app',
        },
      }),
    } as unknown as AppVersionApiClient;

    const repository = new SpringAppConfigRepository(apiClient);

    await expect(
      repository.getMinimumRequiredVersion('android'),
    ).resolves.toEqual({
      minimumVersion: '1.2.3',
      forceUpdate: true,
      modalConfig: {
        title: '업데이트 안내',
        message: '새 버전으로 업데이트 해주세요.',
        showButton: true,
        buttonText: '업데이트',
        buttonUrl: 'https://play.google.com/store/apps/details?id=kr.skuri.app',
      },
    });
  });
});
