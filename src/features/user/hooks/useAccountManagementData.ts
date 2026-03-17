import React from 'react';

import {accountManagementRepository} from '../data/repositories/accountManagementRepository';
import type {AccountManagementScreenViewData} from '../model/accountManagementViewData';

const mapViewData = ({
  accountHolder,
  accountNumber,
  bankNames,
  hideName,
  infoLines,
  isBankDropdownOpen,
  selectedBankName,
}: {
  accountHolder: string;
  accountNumber: string;
  bankNames: string[];
  hideName: boolean;
  infoLines: [string, string];
  isBankDropdownOpen: boolean;
  selectedBankName: string;
}): AccountManagementScreenViewData => ({
  accountHolder,
  accountNumber,
  bankNames,
  hideName,
  infoLines,
  isBankDropdownOpen,
  isSaveEnabled:
    Boolean(selectedBankName.trim()) &&
    Boolean(accountNumber.trim()) &&
    Boolean(accountHolder.trim()),
  selectedBankName,
});

export const useAccountManagementData = () => {
  const [accountHolder, setAccountHolder] = React.useState('');
  const [accountNumber, setAccountNumber] = React.useState('');
  const [bankNames, setBankNames] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [hideName, setHideName] = React.useState(false);
  const [infoLines, setInfoLines] = React.useState<[string, string]>([
    '',
    '',
  ]);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [selectedBankName, setSelectedBankName] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const source = await accountManagementRepository.getAccountManagement();
      setBankNames(source.bankNames);
      setInfoLines(source.infoLines);
      setSelectedBankName(source.account.bankName);
      setAccountNumber(source.account.accountNumber);
      setAccountHolder(source.account.accountHolder);
      setHideName(source.account.hideName);
    } catch (caughtError) {
      console.error('계좌 관리 데이터를 불러오지 못했습니다.', caughtError);
      setError('계좌 관리 정보를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  const save = React.useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      await accountManagementRepository.saveAccountManagement({
        accountHolder: accountHolder.trim(),
        accountNumber: accountNumber.trim(),
        bankName: selectedBankName,
        hideName,
      });
    } catch (caughtError) {
      console.error('계좌 정보를 저장하지 못했습니다.', caughtError);
      setError('계좌 정보를 저장하지 못했습니다.');
      throw new Error('계좌 정보를 저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  }, [accountHolder, accountNumber, hideName, selectedBankName]);

  return {
    data: mapViewData({
      accountHolder,
      accountNumber,
      bankNames,
      hideName,
      infoLines,
      isBankDropdownOpen,
      selectedBankName,
    }),
    error,
    loading,
    reload: load,
    save,
    saving,
    selectBank: (bankName: string) => {
      setSelectedBankName(bankName);
      setIsBankDropdownOpen(false);
    },
    setAccountHolder,
    setAccountNumber: (value: string) => {
      setAccountNumber(value.replace(/[^0-9]/g, ''));
    },
    setBankDropdownOpen: setIsBankDropdownOpen,
    setHideName,
  };
};
