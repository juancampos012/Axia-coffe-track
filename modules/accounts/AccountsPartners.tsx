'use client';
import AccountsList from './AccountsList';
import { getPartnerAccountsSummary } from '@/request/accounts';

export default function AccountsPartners() {
  return (
    <AccountsList
      type="partners"
      title="Cuentas Aliados"
      subtitle="Libro de cuentas por aliado comercial"
      fetchFn={getPartnerAccountsSummary}
      positiveLabel="nos deben"
      negativeLabel="les debemos"
    />
  );
}
