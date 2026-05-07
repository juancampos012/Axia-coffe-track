import { ProductDAO } from "@/types/Api";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { envVariables } from "@/utils/config";
import { cookies } from "next/headers";

interface ProductDetailServerProps {
    productId: string;
}

const getProduct = async (id: string): Promise<ProductDAO> => {
    try {
        const url = `${envVariables.API_URL}/products/${id}`;
        const cookieStore = await cookies();
        
        const cookieHeader = cookieStore.getAll()
            .map(c => `${c.name}=${c.value}`)
            .join('; ');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader
            },
            cache: 'no-store',
        });
        
        if (!response.ok) {
            if (response.status === 404) return notFound();
            throw new Error(`Error fetching product: ${response.statusText}`);
        }
        
        return response.json();
    } catch (error) {
        console.error(`[Server] Error fetching product ${id}:`, error);
        return notFound();
    }
};

export async function ProductDetailServer({ productId }: ProductDetailServerProps) {
    // Al ser un componente async, Next.js esperará a que termine el fetch
    const product = await getProduct(productId);
    
    // Pasamos el producto al componente de cliente
    return <ProductDetailClient product={product} />;
}

export default ProductDetailServer;