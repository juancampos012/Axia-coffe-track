import { Metadata } from "next"
import ScreenContactUS from "@/modules/contacUs/screenContactUs";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contactos sobre nosotros",
  alternates: {
    canonical: 'https://mydomain.com/login'
  }
}

export default function AboutUsPage() {

  return(
    <div className="w-full">
      <ScreenContactUS/>
    </div>
  );

}