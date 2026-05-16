import PartnerAccountDetail from '@/modules/accounts/PartnerAccountDetail';

export default async function PartnerAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PartnerAccountDetail partnerId={id} />;
}
