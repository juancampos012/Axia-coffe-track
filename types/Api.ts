export interface UserDataLogin {
    email: string;
    password: string;
}

export type Compra = {
  date?: string;
  tenantId: string;
  supplierId: string;
  totalPrice: number;
  electronicBill?: boolean;
  products: SaleItemForAPI[];
};

// ─── Compra por Factor ───────────────────────────────────────────────────────

export interface FactorPurchaseItem {
  productId: string;
  productName: string;
  tenantId: string;
  /** Precio base del catálogo (ProductDAO.purchasePrice) */
  basePrice: number;
  /** Factor aplicado (ej: 0.92) */
  factor: number;
  /** Precio final = basePrice × factor */
  unitPrice: number;
  /** Cantidad en la unidad seleccionada */
  quantity: number;
  /** Unidad de medida */
  unit: DeliveryUnit;
  /** Subtotal = quantity × unitPrice */
  subtotal: number;
}

export interface FactorCompra {
  tenantId: string;
  /** ID del cliente (productor) al que se le compra */
  clientId: string;
  factor: number;
  totalPrice: number;
  date?: string;
  electronicBill?: boolean;
  products: FactorPurchaseItem[];
}

export interface Purchase {
    id: string;
    tenantId: string;
    supplierId: string;
    date: string; 
    totalPrice: number;
    createdAt: string;
    updatedAt: string;
    tenant: Tenant;
    supplier: SupplierDAO;
    products: PurchaseProduct[];
}

export type CreatedPurchase = {
    id: string;
    date: string;
    totalPrice: number;
    electronicBill: boolean;
    supplierId: string;
    supplier: SupplierDAO;
    tenantId: string;
    purchaseProducts: SaleProduct[];
};

export interface SaleProduct {
  productId: string;
  quantity: number;
}

export interface CreatedInvoice {
    id: string;
    date: string;
    totalPrice: number;
    electronicBill: boolean;
    clientId: string;
    tenantId: string;
    client: ClientDAO;
    invoiceProducts: SaleProduct[];
}

export interface SaleItem {
    id: number;
    name: string;
    productId: string;
    quantity: number;
    stock: number;
    tax: number;
    price: number;
    basePrice: number;
    tenantId: string;
    announcementId?: string | null;
}  

export interface Venta {
    clientId: string;
    totalPrice: number;
    tenantId: string;
    electronicBill?: boolean;
    products: SaleItemForAPI[];
    payment?: {
        amount: number;
        method: string;
    };
}

export interface Invoice {
    id: string;
    tenantId: string;
    clientId: string;
    paymentId: string | null;
    date: string; 
    totalPrice: number;
    electronicBill: boolean;
    createdAt: string;
    updatedAt: string;
    tenant: Tenant;
    client: ClientDAO;
    invoiceProducts: InvoiceProduct[];
    payment: null;
}

export interface Tenant {
    id: string;
    nit: string;
    name: string;
    address: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
}

export interface InvoiceProduct {
    id: string;
    tenantId: string;
    productId: string;
    invoiceId: string;
    quantity: number;
    product?: ProductDAO; 
}

export interface PurchaseProduct {
    id: string;
    tenantId: string;
    productId: string;
    purchaseInvoiceId: string;
    quantity: number;
    product?: ProductDAO; 
}

export interface EmployeeDAO {
    id: string;
    name: string;
    role: string;
    email: string;
}

export interface ClientDAO {
    id: string;
    tenantId: string;
    identification: string;
    firstName: string;
    middleName?: string;      // Agregado: Segundo nombre
    lastName: string;
    secondLastName?: string;  // Agregado: Segundo apellido
    email?: string;
    phone?: string;
    address?: string;
}

export interface SupplierDAO {
    id: string;
    tenantId: string;
    nit: string;
    name: string;
    phone: string;
    address: string;
}  

export interface UserDataRegister {
    name: string;
    email: string;
    role: string;
    password: string;
}

export interface ProductDAO {
    tenantId: string;
    supplier: SupplierDAO;
    name: string;
    id: string;
    salePrice: number;
    purchasePrice: number;
    tax: number;
    stock: number;
}

export interface StandarDAO {
    status: number;
    message: string;
    data: ProductDAO[];
}

export interface ApiResponse {
    success: boolean;
    message: string;
    user?: UserDataRegister; 
    token?: string;
    errors?: ErrorInterface [];
}

export interface ErrorInterface {
    location: string
    msg: string
    path: string
    type: string
    value: string
}

export interface ApiError {
    msg: string;
}

export interface ProductFormProps {
    onSuccess?: () => Promise<void> | void;
}

export interface SaleItemForAPI {
  announcementId: null;
  tenantId: string;
  productId: string;
  quantity: number;
  unitPrice: number; 
}

// Interfaces de Analytics
export interface SalesMetricsData {
  period: string;
  revenue: number;
  count: number;
}

export interface TopProductData {
  productName: string;
  totalSold: number;
  revenue: number;
}

export interface InventorySummaryData {
  summary: {
    totalProducts: number;
    totalStock: number;
    inventoryValue: number;
    avgStockPerProduct: number;
    lowStockCount: number;
  };
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    purchasePrice: number;
    salePrice: number;
  }>;
}

export interface CustomerMetricsData {
  totalCustomers: number;
  newCustomers: number;
  totalRevenue: number;
  averageOrderValue: number;
  segments: Array<{
    name: string;
    count: number;
  }>;
}

export interface ProfitabilityMetricsData {
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  yearOverYearChange: number;
  costBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number; // Add this property
  }>;
}

export interface InventoryHealthData {
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    purchasePrice: number;
  }>;
  turnoverRate: number;
  totalStockValue: number;
}

export interface ProductPerformanceData {
  topProducts: Array<{
    id: string;
    name: string;
    totalSold: number;
    revenue: number;
    profit: number;
  }>;
  averageOrderValue: number;
  orderCount: number;
}

export interface CustomerInsightsData {
  customerAcquisition: Array<{
    month: string;
    newCustomers: number;
  }>;
  topCustomers: Array<{
    id: string;
    name: string;
    orderCount: number;
    totalSpent: number;
  }>;
  repeatPurchaseRate: number;
  totalCustomers: number;
}

export interface DepositDao{
  supplierId: string;
  amount: number;
}

export interface Deposit{
  supplierId: string;
  amount: number;
  createdAt: string;
}

export type Company = {
  id: string;
  nit: string;
  name: string;
  address: string;
  phone: string;
  currentBalance: number;
  sector: string;
  createdAt: string;
  updatedAt: string;
};

export interface AnnouncementDAO {
  id: string;
  tenantId: string;
  clientId: string;

  title: string;
  description?: string | null;

  // Lógica de fijación (Kilos y Precios)
  // Nota: En Prisma son Decimal, en el Frontend los tratamos como number
  totalQuantity: number;
  remantQuantity: number;
  price: number;

  isActive: boolean;

  createdAt?: string | Date;
  updatedAt?: string | Date;

  // Relaciones opcionales
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    identification: string;
  };

  // Metadatos para el frontend (Opcional si los necesitas para el listado)
  _count?: {
    saleItems: number;
    purchaseItems: number;
  };
}

// @/types/Api.ts

export interface SaleInvoice {
  id: string;
  tenantId: string;
  clientId: string;
  date: string;
  totalPrice: number;
  createdAt: string;
  client?: {
    firstName: string;
    lastName: string;
  };
}

// BUSCA Y REEMPLAZA TODAS LAS APARICIONES DE DashboardMetricsData POR ESTA:
export interface DashboardMetricsData {
  inventory: {
    balance: number;
    stock: {
      coffee: number;
      wetCoffee: number;
      bean: number;
      pasilla: number;
      cacao: number;
    };
  };
  sales: {
    totalRevenue: number; 
    count: number;
    recent: SaleInvoice[]; // <--- Esto es lo que causaba el conflicto
  };
  topProducts: {
    name: string;
    total: number;
  }[];
  operations: {
    pendingLoans: number;
    activeContracts: number;
  };
}

// types/Api.ts

export interface PartnerDAO {
  id: string;

  tenantId: string;

  name: string;
  identification?: string;

  phone?: string;
  email?: string;
  address?: string;
  notes?: string;

  createdAt?: string;
  updatedAt?: string;
}

export type DeliveryUnit = 'kg' | 'sacos' | 'lonas' | 'bultos' | 'canastillas';

export interface DeliveryDAO {
  id: string;

  tenantId: string;
  partnerId: string;
  productId: string;

  /** Cantidad entregada (número de unidades o kilos) */
  quantity: number;
  /** Unidad de medida de la entrega */
  unit: DeliveryUnit;
  /** Equivalente en kg — solo si unit !== 'kg' (opcional) */
  productKg?: number;
  /** Precio por unidad — opcional */
  pricePerUnit?: number;
  /** Precio total calculado = quantity × pricePerUnit — opcional */
  totalPrice?: number;

  createdAt?: string;
  updatedAt?: string;

  partner?: PartnerDAO;
  product?: ProductDAO;
}