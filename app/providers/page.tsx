"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProvidersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ฟังก์ชัน Logout แบบเดิม
  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      await fetch('/api/logout', { method: 'POST' });
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setTimeout(() => {
        window.location.replace("/login");
      }, 500); 
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. เช็ค User Session
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.success) {
            setUser(userData.data);
            
            // 2. ดึงข้อมูล Providers ทั้งหมด
            // ** อย่าลืมเช็คว่า Backend ของคุณใช้ Endpoint ชื่อนี้หรือไม่นะครับ **
            const providersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/providers`, {
              method: "GET",
              credentials: "include", 
            });
            const providersData = await providersRes.json();
            
            if (providersData.success) {
              setProviders(providersData.data);
            }
          } else {
            router.push("/login");
          }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-10 text-center text-zinc-500 font-bold text-xl animate-pulse">กำลังโหลดข้อมูลพาร์ทเนอร์...</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* --- Navbar แบบเดียวกับหน้าหลัก --- */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-zinc-200">
        <div className="text-2xl font-black tracking-tight">
          <Link href="/"><span className="text-blue-600">HAP</span> Rentals</Link>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-zinc-500">
          {user?.role === 'admin' && (
            <Link href="/dashboard" className="cursor-pointer hover:text-zinc-900 transition-colors">Dashboard</Link>
          )}
          <span className="cursor-pointer text-blue-600 border-b-2 border-blue-600 pb-1">Providers</span>
          <Link href="/" className="cursor-pointer hover:text-zinc-900 transition-colors">Cars</Link>
          <Link href="/reservations" className="cursor-pointer hover:text-zinc-900 transition-colors">Reservations</Link>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs uppercase overflow-hidden">
               {user?.name ? user.name.charAt(0) : "U"}
            </div>
            <button onClick={handleLogout} className="text-sm font-semibold text-zinc-500 hover:text-red-500 transition-colors">Logout</button>
          </div>
        </div>
      </nav>

      {/* --- เนื้อหาหน้า Providers --- */}
      <div className="max-w-[1400px] mx-auto px-8 py-10">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mb-4">
            Our Trusted <span className="text-blue-600">Partners</span>
          </h1>
          <p className="text-zinc-500 font-medium">รายชื่อบริษัทรถเช่าที่ให้บริการร่วมกับเรา</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.length > 0 ? (
            providers.map((provider: any) => (
              <div key={provider._id} className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm hover:shadow-lg transition-all flex flex-col">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner">
                  🏢
                </div>
                <h3 className="text-2xl font-black text-zinc-900 mb-2 truncate">{provider.name}</h3>
                <p className="text-sm text-zinc-500 mb-6 flex-grow">
                  {provider.address || "ยังไม่มีข้อมูลที่อยู่"}
                </p>
                
                <div className="space-y-3 border-t border-zinc-100 pt-6">
                  <div className="flex items-center text-sm font-semibold text-zinc-700">
                    <span className="w-6 text-zinc-400">📞</span> {provider.tel || "N/A"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-zinc-500">
              ไม่มีข้อมูล Provider ในระบบขณะนี้
            </div>
          )}
        </div>
      </div>
    </main>
  );
}