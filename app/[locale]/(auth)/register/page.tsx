import { Metadata } from "next"
import ScreenRegister from "@/modules/auth/register/ScreenRegister"

export const metadata: Metadata = {
  title: "Register",
  description: "Register to your account",
  alternates: {
    canonical: 'https://mydomain.com/register'
  }
}

export default function RegisterPage() {

  return <ScreenRegister/>

}
