'use client';
import AccountDetailView from './AccountDetail';
import {
  getSupplierAccountDetail,
  supplierPayment,
  supplierCharge,
  editSupplierMovement,
  editSupplierAccount,
} from '@/request/accounts';
import { useAuth } from '@/context/AuthContext';

export default function SupplierAccountDetail({ supplierId }: { supplierId: string }) {
  const { user } = useAuth();

  return (
    <AccountDetailView
      personId={supplierId}
      type="suppliers"
      personTypeName="Proveedor"
      abonoLabel="Ingreso"
      cargoLabel="Egreso"
      positiveLabel="Te deben"
      negativeLabel="Les debes"
      fetchDetail={getSupplierAccountDetail}
      registerPayment={(id, amount, description, affectsBalance) =>
        supplierPayment({ supplierId: id, amount, description, affectsBalance })
      }
      registerCharge={(id, amount, description, affectsBalance) =>
        supplierCharge({ supplierId: id, tenantId: user?.tenantId ?? '', amount, description, affectsBalance } as any)
      }
      editMovement={editSupplierMovement}
      editCharge={editSupplierAccount}
    />
  );
}
