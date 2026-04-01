import {getCurrentChatRoomIdFromNavigationState} from '../getCurrentChatRoomIdFromNavigationState';

describe('getCurrentChatRoomIdFromNavigationState', () => {
  it('중첩된 Main > CommunityTab > ChatDetail에서 현재 chatRoomId를 찾는다', () => {
    expect(
      getCurrentChatRoomIdFromNavigationState({
        index: 0,
        key: 'root',
        routeNames: ['Main'],
        routes: [
          {
            key: 'main',
            name: 'Main',
            state: {
              index: 1,
              key: 'tabs',
              routeNames: ['CampusTab', 'CommunityTab'],
              routes: [
                {key: 'campus', name: 'CampusTab'},
                {
                  key: 'community',
                  name: 'CommunityTab',
                  state: {
                    index: 0,
                    key: 'community-stack',
                    routeNames: ['BoardMain', 'ChatDetail'],
                    routes: [
                      {
                        key: 'chat-detail',
                        name: 'ChatDetail',
                        params: {
                          chatRoomId: 'room-1',
                        },
                      },
                    ],
                    stale: false,
                    type: 'stack',
                  },
                },
              ],
              stale: false,
              type: 'tab',
            },
          },
        ],
        stale: false,
        type: 'stack',
      }),
    ).toBe('room-1');
  });

  it('활성 leaf route가 ChatDetail이 아니면 undefined를 반환한다', () => {
    expect(
      getCurrentChatRoomIdFromNavigationState({
        index: 0,
        key: 'root',
        routeNames: ['Main'],
        routes: [
          {
            key: 'main',
            name: 'Main',
            state: {
              index: 0,
              key: 'tabs',
              routeNames: ['CampusTab'],
              routes: [{key: 'campus', name: 'CampusTab'}],
              stale: false,
              type: 'tab',
            },
          },
        ],
        stale: false,
        type: 'stack',
      }),
    ).toBeUndefined();
  });
});
