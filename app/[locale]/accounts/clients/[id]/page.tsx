import ClientAccountDetail from '@/modules/accounts/ClientAccountDetail';

export default async function ClientAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClientAccountDetail clientId={id} />;
}
