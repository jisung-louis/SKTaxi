/**
 * mock runtime에서는 Firebase department 채팅방과 동기화하지 않는다.
 */
export function getDepartmentRoomId(department: string): string {
  return `mock-department-${department.trim().toLowerCase().replace(/\s+/g, '-')}`;
}

export async function leaveDepartmentRoom(
  _department: string,
  _uid: string,
): Promise<void> {}
