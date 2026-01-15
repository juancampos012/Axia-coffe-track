import ViewLoans from "@/modules/loans/viewLoan";
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Loans",
  description: "Prestamos realizados en tu Axia",
  alternates: {
    canonical: 'https://mydomain.com/login'
  }
}

export default function viewLoanPage() {

  return(
    <div className="w-full">
        <ViewLoans/>
    </div>
  );

}