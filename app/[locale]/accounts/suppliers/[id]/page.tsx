import SupplierAccountDetail from '@/modules/accounts/SupplierAccountDetail';

export default async function SupplierAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SupplierAccountDetail supplierId={id} />;
}
