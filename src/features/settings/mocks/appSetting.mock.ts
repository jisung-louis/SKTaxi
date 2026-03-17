import type {AppSettingScreenSource} from '../model/appSettingSource';

export const appSettingMockData: AppSettingScreenSource = {
  sections: [
    {
      id: 'display',
      title: '화면',
      items: [
        {
          actionKey: 'darkMode',
          disabled: true,
          iconKey: 'darkMode',
          id: 'dark-mode',
          subtitle: '추후 지원 예정',
          title: '다크 모드',
          type: 'toggle',
        },
      ],
    },
    {
      id: 'legal',
      title: '법적 정보',
      items: [
        {
          actionKey: 'termsOfUse',
          iconKey: 'termsOfUse',
          id: 'terms-of-use',
          title: '이용약관',
          type: 'link',
        },
        {
          actionKey: 'privacyPolicy',
          iconKey: 'privacyPolicy',
          id: 'privacy-policy',
          title: '개인정보 처리방침',
          type: 'link',
        },
      ],
    },
    {
      id: 'app-info',
      title: '앱 정보',
      items: [
        {
          actionKey: 'appName',
          iconKey: 'appName',
          id: 'app-name',
          title: '앱 이름',
          type: 'value',
          value: '스쿠리 - SKURI',
        },
        {
          actionKey: 'appVersion',
          iconKey: 'appVersion',
          id: 'app-version',
          title: '버전',
          type: 'value',
          value: 'v0.0.1',
        },
      ],
    },
  ],
};
