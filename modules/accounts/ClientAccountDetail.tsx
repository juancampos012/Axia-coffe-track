'use client';
import AccountDetailView from './AccountDetail';
import {
  getClientAccountDetail,
  clientPayment,
  clientCharge,
  editClientMovement,
} from '@/request/accounts';
import { useAuth } from '@/context/AuthContext';

export default function ClientAccountDetail({ clientId }: { clientId: string }) {
  const { user } = useAuth();

  return (
    <AccountDetailView
      personId={clientId}
      type="clients"
      personTypeName="Cliente"
      abonoLabel="El cliente nos paga"
      cargoLabel="Registrar nueva deuda"
      positiveLabel="Te deben"
      negativeLabel="Les debes"
      fetchDetail={getClientAccountDetail}
      registerPayment={(id, amount, description, affectsBalance) =>
        clientPayment({ clientId: id, amount, description, affectsBalance })
      }
      registerCharge={(id, amount, description, affectsBalance) =>
        clientCharge({ clientId: id, tenantId: user?.tenantId ?? '', amount, description, affectsBalance } as any)
      }
      editMovement={editClientMovement}
    />
  );
}
