import ScreenInvoices from "@/modules/sales/ScreenSaleInvoice";

export default function MakeSalesPage() {
  return (
    <div className="w-full h-full min-h-screen flex bg-gradient-to-br from-gray-900 via-slate-800 ">
      <ScreenInvoices/>
    </div>
  );
}