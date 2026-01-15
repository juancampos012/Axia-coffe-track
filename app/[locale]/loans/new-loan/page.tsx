import { Metadata } from "next"
import ScreenSimpleLoans from "@/modules/loans/ScreenLoans";

export const metadata: Metadata = {
  title: "Loans",
  description: "Prestamos realizados en tu Axia",
  alternates: {
    canonical: 'https://mydomain.com/login'
  }
}

export default function loansPage() {

  return(
    <div className="w-full">
      <ScreenSimpleLoans/>
    </div>
  );

}