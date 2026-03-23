"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 🌟 ย้าย apiUrl มาไว้ข้างนอก
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function ProvidersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
    } catch (err: any) {
      console.log("Backend unreachable during logout, proceeding with local logout:", err.message);
    } finally {
      try {
        await fetch('/api/logout', { method: 'POST' });
      } catch (e) {
        console.log("Local API logout failed, clearing cookies manually.");
      }
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setTimeout(() => {
        window.location.replace("/login");
      }, 500); 
    }
  };

  useEffect(() => {
    // 🌟 1. สร้าง AbortController
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      const localToken = localStorage.getItem("token");
      try {
        // 🌟 2. แนบ signal เข้าไปตอน fetch auth
        const userRes = await fetch(`${apiUrl}/auth/me`, {
          method: "GET",
          headers: {
            ...(localToken ? { Authorization: `Bearer ${localToken}` } : {}),
          },
          credentials: "include",
          signal,
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.success) {
            setUser(userData.data);
            
            // 🌟 3. แนบ signal เข้าไปตอน fetch providers
            const providersRes = await fetch(`${apiUrl}/providers`, {
              method: "GET",
              headers: {
                ...(localToken ? { Authorization: `Bearer ${localToken}` } : {}),
              },
              credentials: "include", 
              signal,
            });
            const providersData = await providersRes.json();
            
            if (providersData.success) {
              setProviders(providersData.data);
            }
          } else {
            router.push("/login");
          }
        } else {
            router.push("/login");
        }
      } catch (err: any) {
        // 🌟 4. ดักจับ Error ตอนเปลี่ยนหน้า
        if (err.name === 'AbortError' || err.message === 'Failed to fetch') {
          console.log("Fetch aborted on Providers page due to fast navigation.");
        } else {
          console.error("Fetch Error:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // 🌟 5. Cleanup function
    return () => {
      controller.abort();
    };
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-10 text-center text-zinc-500 font-bold text-xl animate-pulse">กำลังโหลดข้อมูลพาร์ทเนอร์...</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* --- Navbar --- */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-zinc-200">
        <div className="text-2xl font-black tracking-tight">
          <Link href="/"><span className="text-blue-600">HAP</span> Rentals</Link>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-zinc-500">
          <span className="cursor-pointer text-blue-600 border-b-2 border-blue-600 pb-1">Providers</span>
          <Link href="/" className="cursor-pointer hover:text-zinc-900 transition-colors">Cars</Link>
          <Link href="/reservations" className="cursor-pointer hover:text-zinc-900 transition-colors">Reservations</Link>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* 💡 เพิ่มปุ่ม Admin Panel ตรงนี้ */}
          {user?.role === 'admin' && (
            <Link 
              href="/admin" 
              className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition shadow-sm"
            >
              Admin Panel
            </Link>
          )}

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
                    <span className="w-6 text-zinc-400">📞</span> {provider.tel || provider.telephone || "N/A"}
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