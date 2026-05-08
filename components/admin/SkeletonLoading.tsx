'use client';

// Skeleton loading components for admin pages

export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MobileCardSkeleton({ cards = 5 }: { cards?: number }) {
  return (
    <div className="animate-pulse divide-y divide-gray-100">
      {Array.from({ length: cards }).map((_, index) => (
        <div key={index} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-5 bg-gray-200 rounded w-5"></div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 space-y-3">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ products = 8 }: { products?: number }) {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: products }).map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full w-12"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UserCardSkeleton({ users = 8 }: { users?: number }) {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: users }).map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-28"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PromoCardSkeleton({ promos = 6 }: { promos?: number }) {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: promos }).map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full w-12"></div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div>
                <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div>
                <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FilterSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-200 rounded"></div>
            <div className="w-full h-10 bg-gray-200 rounded-lg pl-9"></div>
          </div>
          <div className="w-full sm:w-auto h-10 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-4 bg-gray-200 rounded"></div>
            <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Form Section */}
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>

            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-24 bg-gray-200 rounded w-full"></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>

        {/* User Profile Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>

          {/* User Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-3 bg-gray-200 rounded w-12 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-28"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>

        {/* Order Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
            <div className="h-8 bg-gray-200 rounded-full w-24"></div>
          </div>

          {/* Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-3 bg-gray-200 rounded w-12 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <div className="h-5 bg-gray-200 rounded w-12"></div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>

          {/* Right Column - Customer & Address */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-36 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>

            {/* Status Update */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="flex gap-2">
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PromoDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Usage History */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </th>
                  <th className="text-left px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </th>
                  <th className="text-left px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </th>
                  <th className="text-left px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </th>
                  <th className="text-left px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
