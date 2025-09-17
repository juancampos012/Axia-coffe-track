import { Metadata } from "next"

import ScreenProducts from '@/modules/products/ScreenProducts'

export const metadata: Metadata = {
  title: "Products",
  description: "Products registered in your Axia",
  alternates: {
    canonical: 'https://mydomain.com/store/products'
  }
}

export default function ProductsPage() {
  return(
    <div className="w-full h-full">
      <ScreenProducts/>
    </div>
  );
}