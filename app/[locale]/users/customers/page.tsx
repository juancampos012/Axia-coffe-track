import { Metadata } from "next"

import ScreenCustomers from "@/modules/customers/ScreenCustomers";

export const metadata: Metadata = {
  title: "Customers",
  description: "Customers registered in your Axia",
  alternates: {
    canonical: 'https://mydomain.com/users/customers'
  }
}

export default function CustomersPage() {
  return(
    <div className="w-full h-full">
      <ScreenCustomers/>
    </div>
  );
}