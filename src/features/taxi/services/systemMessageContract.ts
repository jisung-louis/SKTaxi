const warnedContexts = new Set<string>();

export const reportUnsupportedSystemMessageWrite = (context: string) => {
  if (warnedContexts.has(context)) {
    return;
  }

  warnedContexts.add(context);
  console.warn(
    `[TaxiParty] ${context}: Spring backend/system message write contract가 없어 클라이언트에서 시스템 메시지를 생성하지 않습니다.`,
  );
};
