'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Toaster } from 'sonner';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [username, setUsername] = useState<string | undefined>();
  const pathname = usePathname();
  const supabase = createClient();

  // Fetch admin username
  useEffect(() => {
    const getUsername = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Try to get from profile first, fallback to email
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          
          setUsername(profile?.full_name || user.email?.split('@')[0] || 'Admin');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    getUsername();
  }, [supabase]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        username={username}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Bar with Hamburger */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-700"
            aria-label="Open sidebar"
          >
            <Menu size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
