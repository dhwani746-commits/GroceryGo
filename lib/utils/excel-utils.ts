// Utility functions for Excel template generation and parsing
import * as XLSX from 'xlsx';

export interface ProductRow {
  name: string;
  slug: string;
  price: string;
  category: string;
  description: string;
  image_urls: string;
  stock_quantity: number;
}

// Generate and download Excel template
export function downloadExcelTemplate() {
  const templateData: ProductRow[] = [
    {
      name: 'Fresh Shimla Apples 1kg',
      slug: 'fresh-shimla-apples-1kg',
      price: '180.00',
      category: 'Fruits & Vegetables',
      description: 'Crisp and juicy farm fresh Shimla apples',
      image_urls: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
      stock_quantity: 100,
    },
    {
      name: 'Amul Taaza T-Special Milk 1L',
      slug: 'amul-taaza-milk-1l',
      price: '68.00',
      category: 'Dairy & Bakery',
      description: 'Pasteurised toned milk',
      image_urls: 'https://images.unsplash.com/photo-1550583724-b2692b85b150',
      stock_quantity: 200,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  // Set column widths
  worksheet['!cols'] = [
    { wch: 30 }, // name
    { wch: 30 }, // slug
    { wch: 12 }, // price
    { wch: 22 }, // category
    { wch: 45 }, // description
    { wch: 55 }, // image_urls
    { wch: 15 }, // stock_quantity
  ];

  XLSX.writeFile(workbook, 'grocerygo-products-template.xlsx');
}

// Parse uploaded Excel file
export async function parseExcelFile(file: File): Promise<ProductRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<ProductRow>(worksheet);

        // Validate required fields
        const validatedData = jsonData.map((row) => ({
          name: String(row.name || '').trim(),
          slug: String(row.slug || '').trim(),
          price: String(row.price || '0'),
          category: String(row.category || '').trim(),
          description: String(row.description || '').trim(),
          image_urls: String(row.image_urls || ''),
          stock_quantity: Number(row.stock_quantity) || 0,
        }));

        resolve(validatedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}
