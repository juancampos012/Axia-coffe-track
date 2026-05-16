'use client';
import AccountsList from './AccountsList';
import { getSupplierAccountsSummary } from '@/request/accounts';

export default function AccountsSuppliers() {
  return (
    <AccountsList
      type="suppliers"
      title="Cuentas Proveedores"
      subtitle="Libro de cuentas por proveedor"
      fetchFn={getSupplierAccountsSummary}
      positiveLabel="les debemos"
      negativeLabel="nos deben"
    />
  );
}
