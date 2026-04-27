export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <nav className="px-4 py-8 space-y-4">
          <div className="px-4 py-2 font-bold text-lg">PlastiKart Admin</div>
          <a href="/admin/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
            Dashboard
          </a>
          <a href="/admin/products" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
            Products
          </a>
          <a href="/admin/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
            Orders
          </a>
          <a href="/admin/promos" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
            Promo Codes
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
