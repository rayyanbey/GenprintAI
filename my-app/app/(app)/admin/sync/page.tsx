import { ProductSyncAdmin } from '@/components/Admin/ProductSyncAdmin';

export const metadata = {
  title: 'Sync Products | Admin | Genprint AI',
  description: 'Sync products from Printful to database',
};

export default function AdminSyncPage() {
  return <ProductSyncAdmin />;
}
