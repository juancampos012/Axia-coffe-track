import { ProductDAO } from "@/types/Api";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { envVariables } from "@/utils/config";
import { cookies } from "next/headers";

interface ProductDetailServerProps {
    productId: string;
}

export async function ProductDetailServer({ productId }: ProductDetailServerProps) {
    let product: ProductDAO;
    
    try {
        console.log('Product ID:', productId);
        product = await getProduct(productId);
    } catch (error) {
        console.error("Error fetching product:", error);
        notFound();
    }
    
    return <ProductDetailClient product={product} />;
}

const getProduct = async (id: string): Promise<ProductDAO> => {
    try {
        const url = `${envVariables.API_URL}/products/${id}`;
        console.log('Fetching product by ID (server):', url);
        
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        
        const cookieHeader = allCookies
            .map(c => `${c.name}=${c.value}`)
            .join('; ');
        
        console.log('Available cookies:', allCookies.map(c => c.name));
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader
            },
            cache: 'no-store',
        });
        
        if (!response.ok) {
            console.error('Response status:', response.status);
            throw new Error(`Error fetching product: ${response.statusText}`);
        }
        
        return response.json();
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        notFound();
    }
};

export default ProductDetailServer;