import React from 'react';

import {
  ACCOUNT_MANAGEMENT_BANK_NAMES,
  ACCOUNT_MANAGEMENT_INFO_LINES,
} from '../constants/accountManagement';
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
  const [error, setError] = React.useState<string | null>(null);
  const [hideName, setHideName] = React.useState(false);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [selectedBankName, setSelectedBankName] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const source = await accountManagementRepository.getAccountManagement();
      setSelectedBankName(source.bankName);
      setAccountNumber(source.accountNumber);
      setAccountHolder(source.accountHolder);
      setHideName(source.hideName);
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
      bankNames: [...ACCOUNT_MANAGEMENT_BANK_NAMES],
      hideName,
      infoLines: ACCOUNT_MANAGEMENT_INFO_LINES,
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
