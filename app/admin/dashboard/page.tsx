import { Banknote, CircleStar, Currency, Truck, UsersRound } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-white shadow rounded-lg p-6 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-700 font-bold">TOTAL ORDERS</div>
            <div className="text-sm font-medium text-gray-500">Total Orders</div>
            <div className="mt-2 text-2xl font-bold text-green-600">1,284</div>
          </div>
          <div className="flex items-center">
            <div className="bg-brand-primary-200 w-8 h-8 flex items-center justify-center mr-4">
              <Truck color="#0D2F5C" />
            </div>
          </div>
        </div>
          {/* Total Revenue */}
          <div className="bg-white shadow rounded-lg p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-700 font-bold">TOTAL REVENUE</div>
              <div className="text-sm font-medium text-gray-500">Total Revenue</div>
              <div className="mt-2 text-2xl font-bold text-green-600">$58,432</div>
            </div>
            <div className="flex items-center">
              <div className="bg-green-200 w-8 h-8 flex items-center justify-center mr-4">
                <Banknote color="#0D2F5C" />
              </div>
            </div>
          </div>
          {/* Active Promos */}
          <div className="bg-white shadow rounded-lg p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-700 font-bold">Active Promos</div>
              <div className="mt-2 text-2xl font-bold text-green-600">32</div>
            </div>
            <div className="flex items-center">
              <div className="bg-green-200 w-8 h-8 flex items-center justify-center mr-4">
                <CircleStar color="#0D2F5C" />
              </div>
            </div>
          </div>
          {/* Total Customers */}
          <div className="bg-white shadow rounded-lg p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-700 font-bold">Total Customers</div>
              <div className="mt-2 text-2xl font-bold text-green-600">2,854</div>
            </div>
            <div className="flex items-center">
              <div className="bg-green-200 w-8 h-8 flex items-center justify-center mr-4">
                <UsersRound color="#0D2F5C" />
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}