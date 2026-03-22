"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ReservationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (bookingId: string) => {
    if (!confirm("คุณยืนยันที่จะยกเลิกการจองนี้ใช่หรือไม่?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        alert("ยกเลิกการจองสำเร็จ!");
        setBookings(bookings.filter(b => b._id !== bookingId));
      } else {
        alert(data.message || "เกิดข้อผิดพลาดในการยกเลิก");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!userRes.ok) {
          router.push("/login");
          return;
        }

        const userData = await userRes.json();
        if (!userData.success) {
          router.push("/login");
          return;
        }
        setUser(userData.data);

        const bookingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const bookingData = await bookingRes.json().catch(() => null);

        if (bookingRes.ok && bookingData?.success) {
          setBookings(bookingData.data || []);
        } else {
          setBookings([]); 
        }

      } catch (err) {
        console.error("Fetch System Error:", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [router]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="p-10 text-center text-zinc-500 font-bold text-xl animate-pulse">กำลังโหลดข้อมูลการจอง...</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8f9fc] text-zinc-900 font-sans pb-20">
      {/* --- Navbar --- */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-zinc-200 shadow-sm sticky top-0 z-10">
        <Link href="/" className="text-2xl font-black tracking-tight cursor-pointer">
          <span className="text-blue-600">HAP</span> Rentals
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-zinc-500">
          <Link href="/providers" className="cursor-pointer hover:text-zinc-900 transition-colors">
            Providers
          </Link>
          <Link href="/" className="cursor-pointer hover:text-zinc-900 transition-colors">Cars</Link>
          <span className="cursor-pointer text-blue-600 border-b-2 border-blue-600 pb-1">My Reservations</span>
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
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs uppercase">
              {user?.name ? user.name.charAt(0) : "U"}
            </div>
            <button onClick={handleLogout} className="text-sm font-semibold text-zinc-500 hover:text-red-500 transition-colors">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 flex items-center gap-3">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">ประวัติการจองของฉัน</h1>
          <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-sm font-bold">{bookings.length} รายการ</span>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-zinc-200 shadow-sm flex flex-col items-center">
            <span className="text-6xl mb-4">📭</span>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">ยังไม่พบข้อมูลการจอง</h2>
            {/* <p className="text-zinc-400 text-sm mb-6">หากคุณเห็นข้อมูลใน Database แต่ที่นี่ไม่ขึ้น กรุณาเช็ค User ID ใน Backend</p> */}
            <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors">ไปหน้าเลือกจองรถ</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking: any) => (
              <div key={booking._id} className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                
                {/* 📸 ส่วนแสดงรูปภาพรถ (ดึงจาก public/img/) */}
                <div className="relative w-full md:w-48 h-32 bg-zinc-100 rounded-2xl overflow-hidden shrink-0">
                  {booking.car?.picture ? (
                    <Image
                      src={`/img/${booking.car.picture}`}
                      alt={booking.car.model || "car"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-zinc-200 text-zinc-400">🚗</div>
                  )}
                </div>

                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                      ID: {booking._id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Confirmed</span>
                  </div>

                  <h3 className="text-xl font-black text-zinc-900">
                    {booking.car?.make} {booking.car?.model || "ไม่พบข้อมูลรถ"}
                  </h3>
                  
                  {/* 🏢 แสดงชื่อ Provider (ดึงผ่านข้อมูล Car) */}
                  <p className="text-sm font-bold text-zinc-500 mb-4 flex items-center gap-1">
                    <span className="text-blue-500">📍</span> 
                    {booking.car?.provider?.name || "ไม่ทราบชื่อผู้ให้บริการ"}
                  </p>

                  <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">วันรับรถ</p>
                      <p className="text-sm font-semibold">{formatDate(booking.pickUpDate || booking.date)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">วันส่งคืน</p>
                      <p className="text-sm font-semibold">{formatDate(booking.dropOffDate)}</p>
                    </div>
                  </div>
                </div>

                {/* ✅ ส่วนของเพื่อนข้อ 6 และ 7 (ปุ่ม Edit และ Delete) */}
                <div className="flex flex-col w-full md:w-32 gap-3 shrink-0 mt-4 md:mt-0 md:ml-4 md:border-l md:border-zinc-100 md:pl-6">
                  {/* ปุ่ม Edit: ดันไปหน้า /reservations/edit/[id] */}
                  <button 
                    onClick={() => router.push(`/reservations/edit/${booking._id}`)}
                    className="w-full bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors shadow-sm"
                  >
                    Edit
                  </button>
                  
                  {/* ปุ่ม Cancel: เรียกใช้ฟังก์ชัน handleDelete ด้านบน */}
                  <button 
                    onClick={() => handleDelete(booking._id)}
                    className="w-full bg-white border-2 border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}