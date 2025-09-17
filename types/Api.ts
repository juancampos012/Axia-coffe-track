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
    tenantId: string; // ← agregar esto
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
    lastName: string;
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
  tenantId: string;
  productId: string;
  quantity: number;
  product?: ProductDAO;
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

export interface DashboardMetricsData {
  sales: {
    count: number;
    total: number;
  };
  purchases: {
    count: number;
    total: number;
  };
  productsTotal: number;
  clientsTotal: number;
  suppliersTotal: number;  
  pendingOrders: number;  
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