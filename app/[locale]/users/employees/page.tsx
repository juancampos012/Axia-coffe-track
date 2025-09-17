import ScreenEmployees from "@/modules/employee/ScreenEmployees";
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Employees",
  description: "Employees registered in your Axia",
  alternates: {
    canonical: 'https://mydomain.com/users/employees'
  }
}

export default function EmployeesPage() {
  return(
    <div className="w-full h-full">
      <ScreenEmployees/>
    </div>
  );
}