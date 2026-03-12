import { SettlementData } from '../data/repositories/IPartyRepository';

export const buildInitialSettlementStatus = (
  memberIds: string[],
  leaderId?: string,
): Record<string, boolean> => {
  return memberIds.reduce<Record<string, boolean>>((acc, memberId) => {
    acc[memberId] = memberId === leaderId;
    return acc;
  }, {});
};

export const buildSettlementMembers = (
  memberIds: string[],
  leaderId?: string,
): SettlementData['members'] => {
  return memberIds.reduce<SettlementData['members']>((acc, memberId) => {
    acc[memberId] = {
      settled: memberId === leaderId,
    };
    return acc;
  }, {});
};
