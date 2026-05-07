// app/[locale]/partners/[id]/page.tsx
import React from 'react';
import DeliveryDetailPage from '@/modules/delivery/DeliveryDetail';

// 1. Definimos params como una Promesa y la función como async
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    
    // 2. Esperamos a que los parámetros se resuelvan
    const resolvedParams = await params;
    const id = resolvedParams.id;

    return (
        <div className="w-full h-full overflow-hidden">
            {/* 3. Pasamos el ID ya extraído */}
            <DeliveryDetailPage deliveryId={id} />
        </div>
    );
}