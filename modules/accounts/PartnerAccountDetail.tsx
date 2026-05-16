'use client';
import AccountDetailView from './AccountDetail';
import {
  getPartnerAccountDetail,
  partnerPayment,
  partnerCharge,
  editPartnerMovement,
} from '@/request/accounts';
import { useAuth } from '@/context/AuthContext';

export default function PartnerAccountDetail({ partnerId }: { partnerId: string }) {
  const { user } = useAuth();

  return (
    <AccountDetailView
      personId={partnerId}
      type="partners"
      personTypeName="Aliado"
      abonoLabel="El aliado nos paga"
      cargoLabel="Registrar nueva deuda"
      positiveLabel="Te deben"
      negativeLabel="Les debes"
      fetchDetail={getPartnerAccountDetail}
      registerPayment={(id, amount, description, affectsBalance) =>
        partnerPayment({ partnerId: id, amount, description, affectsBalance })
      }
      registerCharge={(id, amount, description, affectsBalance) =>
        partnerCharge({ partnerId: id, tenantId: user?.tenantId ?? '', amount, description, affectsBalance } as any)
      }
      editMovement={editPartnerMovement}
    />
  );
}
