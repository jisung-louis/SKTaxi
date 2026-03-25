/**
 * mock runtime에서는 서버/Firestore 정리를 수행하지 않는다.
 * 화면 흐름 유지를 위해 성공으로 처리한다.
 */
export async function withdrawUser(
  _uid: string,
  _password?: string,
): Promise<void> {}
