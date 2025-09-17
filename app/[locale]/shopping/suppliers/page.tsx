import { Metadata } from "next"

import ScreenSuppliers from "@/modules/suppliers/ScreenSuppliers";

export const metadata: Metadata = {
  title: "Suppliers",
  description: "Suppliers registered in your Axia",
  alternates: {
    canonical: 'https://mydomain.com/shopping/suppliers'
  }
}

export default function SuppliersPage() {
  return(
    <div className="w-full h-full">
      <ScreenSuppliers/>
    </div>
  );
}