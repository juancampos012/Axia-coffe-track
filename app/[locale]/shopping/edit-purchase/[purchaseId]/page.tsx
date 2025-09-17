import ScreenEditPurchase from '@/modules/make-purchase/ScreenEditPurchase';

interface PageProps {
  params: Promise<{ purchaseId: string }>;
}

export default async function EditPurchasePage({ params }: PageProps) {
  const { purchaseId } = await params;

  return (
    <div className="container mx-auto mt-6">
      <ScreenEditPurchase invoiceId={purchaseId} />
    </div>
  );
}
