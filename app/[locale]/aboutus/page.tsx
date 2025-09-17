import { Metadata } from "next"
import ScreenAboutUS from "@/modules/aboutUs/screenAboutUs";

export const metadata: Metadata = {
  title: "About Us",
  description: "Informacion sobre nosotrosxia",
  alternates: {
    canonical: 'https://mydomain.com/login'
  }
}

export default function AboutUsPage() {

  return(
    <div className="w-full">
      <ScreenAboutUS/>
    </div>
  );

}