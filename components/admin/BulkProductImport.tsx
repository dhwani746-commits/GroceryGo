'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import {
  Download,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  Info,
  X,
  AlertTriangle,
} from 'lucide-react';

interface PreviewRow {
  rowNumber: number;
  name: string;
  category: string;
  price: string;
  original_price: string;
  stock_quantity: string;
  description: string;
  image_urls: string[];
  is_visible: boolean;
  error?: string;
  isValid: boolean;
}

// Validation function for a single row's inputs
const validateRow = (
  name: string,
  category: string,
  priceStr: string,
  originalPriceStr: string,
  stockStr: string
): { isValid: boolean; error?: string } => {
  if (!name.trim()) {
    return { isValid: false, error: 'Product Name is missing' };
  }
  if (!category.trim()) {
    return { isValid: false, error: 'Category is missing' };
  }

  const price = parseFloat(priceStr);
  if (isNaN(price) || price <= 0) {
    return { isValid: false, error: 'Price must be a valid positive number' };
  }

  if (originalPriceStr.trim()) {
    const originalPrice = parseFloat(originalPriceStr);
    if (isNaN(originalPrice) || originalPrice <= price) {
      return { isValid: false, error: 'Original price must be greater than selling price' };
    }
  }

  const stock = parseInt(stockStr, 10);
  if (isNaN(stock) || stock < 0) {
    return { isValid: false, error: 'Stock quantity must be a non-negative integer' };
  }

  return { isValid: true };
};

export function BulkProductImport() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Handle body overflow lock when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  // Generate and download standard Excel template
  const handleDownloadTemplate = () => {
    const headers = [
      [
        'Product Name',
        'Category',
        'Price (INR)',
        'Original Price (INR)',
        'Stock Quantity',
        'Description',
        'Image URLs (comma-separated)',
        'Visible (TRUE/FALSE)',
      ],
    ];

    const sampleRow = [
      'Premium Plastic Bucket 15L',
      'Buckets',
      '299',
      '399',
      '50',
      'Heavy duty 15 liter plastic bucket with metal handle.',
      'https://picsum.photos/400, https://picsum.photos/401',
      'TRUE',
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([...headers, sampleRow]);
    
    // Set column widths for readability
    worksheet['!cols'] = [
      { wch: 30 }, // Product Name
      { wch: 15 }, // Category
      { wch: 15 }, // Price
      { wch: 20 }, // Original Price
      { wch: 15 }, // Stock Quantity
      { wch: 40 }, // Description
      { wch: 40 }, // Image URLs
      { wch: 20 }, // Visible
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'products_import_template.xlsx');
    toast.success('Template downloaded successfully!');
  };

  // Parse Excel file client-side
  const parseExcel = (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);
    setPreviewRows([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) throw new Error('Excel sheet is empty');
        
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });

        if (rows.length <= 1) {
          toast.error('The uploaded file does not contain any product rows.');
          setLoading(false);
          return;
        }

        const combinedPreviews: PreviewRow[] = [];

        // Skip header row (index 0)
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const name = String(row[0] || '').trim();
          const category = String(row[1] || '').trim();
          const priceStr = String(row[2] || '').trim();
          const originalPriceStr = String(row[3] || '').trim();
          const stockStr = String(row[4] || '').trim();
          const description = String(row[5] || '').trim();
          const imagesStr = String(row[6] || '').trim();
          const visibleStr = String(row[7] || '').trim().toUpperCase();

          const rowNum = i + 1; // Excel row line

          // Skip completely empty rows
          if (!name && !category && !priceStr && !stockStr) continue;

          const validation = validateRow(name, category, priceStr, originalPriceStr, stockStr);

          const image_urls = imagesStr
            ? imagesStr.split(',').map((url) => url.trim()).filter((url) => url.startsWith('http'))
            : [];

          combinedPreviews.push({
            rowNumber: rowNum,
            name,
            category,
            price: priceStr,
            original_price: originalPriceStr,
            stock_quantity: stockStr,
            description,
            image_urls,
            is_visible: visibleStr !== 'FALSE',
            error: validation.error,
            isValid: validation.isValid,
          });
        }

        setPreviewRows(combinedPreviews.sort((a, b) => a.rowNumber - b.rowNumber));
        setShowModal(true); // Open the verification modal

        const validCount = combinedPreviews.filter(p => p.isValid).length;
        if (validCount > 0) {
          toast.success(`Successfully parsed ${validCount} products!`);
        } else {
          toast.error('Found validation issues in the uploaded spreadsheet. Review them in the popup.');
        }
      } catch (err) {
        console.error('Error parsing file:', err);
        toast.error('Failed to parse Excel file. Make sure it is in valid .xlsx format.');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read the file.');
      setLoading(false);
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleCellChange = (rowNumber: number, field: keyof PreviewRow, val: string | boolean) => {
    setPreviewRows((prev) =>
      prev.map((row) => {
        if (row.rowNumber !== rowNumber) return row;

        const updatedRow = { ...row, [field]: val };
        
        // Re-run validation on the updated inputs
        const validation = validateRow(
          updatedRow.name,
          updatedRow.category,
          updatedRow.price,
          updatedRow.original_price,
          updatedRow.stock_quantity
        );

        updatedRow.isValid = validation.isValid;
        updatedRow.error = validation.error;
        return updatedRow;
      })
    );
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseExcel(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseExcel(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewRows([]);
    setShowModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit bulk imports to route handler
  const handleCommitImport = async () => {
    const validRows = previewRows.filter(r => r.isValid);
    if (validRows.length === 0) return;
    setLoading(true);
    setShowModal(false);

    try {
      // Map back to paise (₹1 = 100 paise) before sending
      const productsPayload = validRows.map((p) => ({
        name: p.name,
        category: p.category,
        price: Math.round(parseFloat(p.price) * 100),
        original_price: p.original_price.trim() ? Math.round(parseFloat(p.original_price) * 100) : null,
        stock_quantity: parseInt(p.stock_quantity, 10),
        description: p.description,
        image_urls: p.image_urls,
        is_visible: p.is_visible,
      }));

      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: productsPayload }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Bulk upload failed');

      toast.success(json.message || 'Products imported successfully!');
      router.push('/admin/products');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong during import');
      setShowModal(true); // Re-open modal so they can fix data
    } finally {
      setLoading(false);
    }
  };

  const validProducts = previewRows.filter(r => r.isValid);
  const invalidRows = previewRows.filter(r => !r.isValid);

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 text-sm text-neutral-600 flex items-start gap-4 shadow-inner/5">
        <Info className="text-brand-primary-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="space-y-2">
          <p className="font-semibold text-neutral-800">Bulk Upload Instructions</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Download the standard template worksheet first.</li>
            <li>Do not modify the columns structure or headers in the sheet.</li>
            <li><strong>Required fields:</strong> Product Name, Category, Price.</li>
            <li>Images must be complete URLs (separated by commas).</li>
          </ul>
          <button
            onClick={handleDownloadTemplate}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 text-xs font-semibold text-neutral-700 rounded-lg hover:bg-neutral-50 transition active:scale-95 shadow-sm"
          >
            <Download size={14} /> Download Template (.xlsx)
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl py-12 px-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-brand-primary-500 bg-brand-primary-50/50 scale-[0.99] ring-4 ring-brand-primary-50'
              : 'border-neutral-300 bg-white hover:border-neutral-400 hover:bg-neutral-50/30'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <div className="p-3 bg-neutral-100 rounded-full mb-4 text-neutral-500">
            <Upload size={24} />
          </div>
          <p className="font-semibold text-neutral-800 text-base">Drag &amp; drop Excel file here</p>
          <p className="text-neutral-500 text-xs mt-1">or click to browse from folder (supports .xlsx, .xls)</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
              <FileSpreadsheet size={24} />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-neutral-800 text-sm truncate">{file.name}</p>
              <p className="text-neutral-500 text-xs mt-0.5">
                {(file.size / 1024).toFixed(1)} KB • {previewRows.length} rows processed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-brand-primary-50 text-brand-primary-700 hover:bg-brand-primary-100 rounded-lg transition active:scale-95"
            >
              Verify &amp; Edit Data
            </button>
            <button
              onClick={clearFile}
              className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Remove file"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Progress loader */}
      {loading && (
        <div className="py-12 flex items-center justify-center flex-col gap-3 text-neutral-500">
          <Loader2 className="animate-spin text-brand-primary-600" size={32} />
          <p className="text-sm">Processing Excel sheet...</p>
        </div>
      )}

      {/* Data Verification & Editing Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Panel */}
          <div className="relative z-10 w-full max-w-6xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-100">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Verify &amp; Edit Import Data</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Edit cells directly in the table to fix validation issues dynamically</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1.5 hover:bg-neutral-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              
              {/* Report Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">Ready to Import</p>
                    <p className="text-xl font-bold text-emerald-800">{validProducts.length}</p>
                  </div>
                </div>

                <div className={`${invalidRows.length > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-neutral-50 border-neutral-200 text-neutral-500'} border rounded-xl p-4 flex items-center gap-3`}>
                  <div className={`p-2 rounded-lg ${invalidRows.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-400'}`}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Rows with Issues (Will be skipped unless edited)</p>
                    <p className="text-xl font-bold">{invalidRows.length}</p>
                  </div>
                </div>
              </div>

              {/* Rows List with Editable Cells */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-inner/5">
                <div className="overflow-x-auto max-h-[45vh]">
                  <table className="w-full text-left text-sm table-fixed min-w-[800px]">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 w-20">Excel Row</th>
                        <th className="px-4 py-3 w-[30%]">Product Name *</th>
                        <th className="px-4 py-3 w-[20%]">Category *</th>
                        <th className="px-4 py-3 w-32 text-right">Price *</th>
                        <th className="px-4 py-3 w-32 text-right">Stock *</th>
                        <th className="px-4 py-3 w-[25%]">Validation Issue / Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-700">
                      {previewRows.map((row) => (
                        <tr
                          key={row.rowNumber}
                          className={`hover:bg-neutral-50/50 transition-colors ${
                            row.isValid ? '' : 'bg-red-50/30'
                          }`}
                        >
                          {/* Row Number */}
                          <td className="px-4 py-3 text-xs text-neutral-400 font-semibold">
                            Row {row.rowNumber}
                          </td>

                          {/* Editable Name */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => handleCellChange(row.rowNumber, 'name', e.target.value)}
                              className="w-full px-2 py-1 text-sm font-semibold text-neutral-900 border border-transparent rounded bg-transparent hover:border-neutral-200 focus:bg-white focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-100 focus:outline-none transition-all truncate"
                            />
                          </td>

                          {/* Editable Category */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.category}
                              onChange={(e) => handleCellChange(row.rowNumber, 'category', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-transparent rounded bg-transparent hover:border-neutral-200 focus:bg-white focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-100 focus:outline-none transition-all text-xs"
                            />
                          </td>

                          {/* Editable Price */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.price}
                              onChange={(e) => handleCellChange(row.rowNumber, 'price', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-transparent rounded bg-transparent hover:border-neutral-200 focus:bg-white focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-100 focus:outline-none transition-all text-right font-medium"
                            />
                          </td>

                          {/* Editable Stock */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={row.stock_quantity}
                              onChange={(e) => handleCellChange(row.rowNumber, 'stock_quantity', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-transparent rounded bg-transparent hover:border-neutral-200 focus:bg-white focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-100 focus:outline-none transition-all text-right"
                            />
                          </td>

                          {/* Error / Status info */}
                          <td className="px-4 py-3">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded font-medium">
                                <CheckCircle2 size={12} /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded font-medium" title={row.error}>
                                <AlertCircle size={12} className="flex-shrink-0" /> {row.error}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 bg-neutral-50 border-t border-neutral-200">
              <div className="text-xs text-neutral-500 font-medium">
                {invalidRows.length > 0 && validProducts.length > 0 && (
                  <span className="flex items-center gap-1 text-amber-700">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    Warning: Skipping {invalidRows.length} row(s) containing unresolved errors.
                  </span>
                )}
              </div>
              <div className="flex gap-2 self-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-neutral-200 text-sm font-semibold text-neutral-700 bg-white rounded-lg hover:bg-neutral-50 transition active:scale-95"
                >
                  Close &amp; Keep Editing
                </button>
                <button
                  onClick={handleCommitImport}
                  disabled={validProducts.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary-600 text-white rounded-lg hover:bg-brand-primary-500 disabled:opacity-40 disabled:pointer-events-none transition text-sm font-semibold shadow-sm active:scale-95"
                >
                  Import {validProducts.length} Products
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
