'use client';
import AccountsList from './AccountsList';
import { getClientAccountsSummary } from '@/request/accounts';

export default function AccountsClients() {
  return (
    <AccountsList
      type="clients"
      title="Cuentas Clientes"
      subtitle="Libro de cuentas por cliente"
      fetchFn={getClientAccountsSummary}
      positiveLabel="nos deben"
      negativeLabel="les debemos"
    />
  );
}
