'use client';
import AccountDetailView from './AccountDetail';
import {
  getPartnerAccountDetail,
  partnerPayment,
  partnerCharge,
  editPartnerMovement,
  editPartnerAccount,
} from '@/request/accounts';
import { useAuth } from '@/context/AuthContext';

export default function PartnerAccountDetail({ partnerId }: { partnerId: string }) {
  const { user } = useAuth();

  return (
    <AccountDetailView
      personId={partnerId}
      type="partners"
      personTypeName="Aliado"
      abonoLabel="Ingreso"
      cargoLabel="Egreso"
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
      editCharge={editPartnerAccount}
    />
  );
}
