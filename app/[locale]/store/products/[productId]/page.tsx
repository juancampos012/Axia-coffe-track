import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import ProductDetailServer from "@/modules/products/ProductDetail/ProductDetailServer";
import { ProductDAO } from "@/types/Api";
import { envVariables } from "@/utils/config";

export const dynamic = "force-dynamic";

// 1. Corregimos la interfaz: params ahora es una Promise
interface ProductPageProps {
    params: Promise<{
        productId: string;
    }>;
}

interface StaticParams {
    productId: string;
}

const getProduct = async (id: string): Promise<ProductDAO> => {
    try {
        const url = `${envVariables.API_URL}/products/${id}`;

        const cookieStore = await cookies();
        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join("; ");

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookieHeader,
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error("Response status:", response.status);
            throw new Error(`Error fetching product: ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        notFound();
    }
};

// 2. Corregimos generateMetadata con await params
export async function generateMetadata({
    params,
}: ProductPageProps): Promise<Metadata> {
    try {
        const { productId } = await params; // <--- AGREGADO AWAIT
        const product = await getProduct(productId);

        return {
            title: `Producto: ${product.name}`,
            description: `Detalles del producto ${product.name}`,
        };
    } catch {
        return {
            title: "Producto no encontrado",
            description: "El producto solicitado no existe",
        };
    }
}

export const generateStaticParams = async (): Promise<StaticParams[]> => {
    try {
        console.log("Generación de páginas estáticas desactivada");
        return [];
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
};

// 3. Corregimos la función principal con await params
export default async function ProductDetailAdmin({
    params,
}: ProductPageProps) {
    const { productId } = await params; // <--- AGREGADO AWAIT

    return <ProductDetailServer productId={productId} />;
}