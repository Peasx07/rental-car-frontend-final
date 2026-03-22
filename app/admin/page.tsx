import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { forceLogout } from '../actions'; 
import { revalidatePath } from 'next/cache'; // 💡 นำเข้า revalidatePath เพื่อให้รีเฟรชข้อมูลหลังลบเสร็จ

// กำหนด Type สำหรับข้อมูล Booking
interface Booking {
  _id: string;
  pickUpDate: string;
  dropOffDate: string;
  user: string; 
  car: {
    _id: string;
    make: string;
    model: string;
    licensePlate: string;
  };
}

export default async function AdminDashboard() {
  // 1. ดึง Token จาก Cookie
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // ถ้าไม่มี Token ให้เด้งกลับไปหน้า Login
  if (!token) {
    redirect('/login');
  }

  // =========================================================
  // 💡 เพิ่มฟังก์ชัน Server Action สำหรับ "ลบการจอง"
  // =========================================================
  async function deleteBooking(formData: FormData) {
    "use server"; // ประกาศว่าเป็นฟังก์ชันทำงานฝั่งเซิร์ฟเวอร์
    
    const bookingId = formData.get("bookingId")?.toString();
    if (!bookingId) return;

    // ต้องดึง Token มาแนบอีกรอบสำหรับการยิง Delete
    const cookieStore = await cookies();
    const currentToken = cookieStore.get('token')?.value;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });
      
      // ลบเสร็จ สั่งให้ Next.js ดึงข้อมูลใหม่และอัปเดตหน้าจอตารางทันที
      revalidatePath('/admin');
    } catch (err) {
      console.error("Delete booking error:", err);
    }
  }

  // 2. ยิง API ไปดึงข้อมูล Bookings ทั้งหมด
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store', 
  });

  const responseData = await res.json();
  const bookings: Booking[] = responseData.data || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans relative">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col sticky top-0 md:h-screen z-10">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {/* หน้า Bookings เป็นหน้าปัจจุบัน เลยให้เป็นสีฟ้า (Active) */}
          <Link href="/admin" className="block px-4 py-2 bg-blue-600 rounded-md text-white font-medium shadow-md">
            📋 จัดการการจอง (Bookings)
          </Link>
          {/* ลิงก์ไปหน้า Providers เป็นแบบ hover ธรรมดา */}
          <Link href="/admin/providers" className="block px-4 py-2 hover:bg-slate-800 rounded-md text-gray-300 transition">
            🏢 จัดการผู้ให้บริการ
          </Link>
          <Link 
            href="/" 
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition shadow-sm"
            >
            🏠 Back to Home
          </Link>
        </nav>
        <div className="p-4">
          <form action={forceLogout}>
            <button type="submit" className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition">
              🚪 ล็อกเอาท์
            </button>
          </form>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">ระบบจัดการการจองรถทั้งหมด</h1>
            <p className="text-gray-500 mt-1">แอดมินสามารถดู แก้ไข และยกเลิกการจองของทุกคนได้ที่นี่</p>
          </div>
        </header>

        {/* ================= TABLE ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-sm">
                  <th className="p-4 font-semibold">รหัสการจอง (ID)</th>
                  <th className="p-4 font-semibold">รถที่จอง</th>
                  <th className="p-4 font-semibold">วันรับรถ</th>
                  <th className="p-4 font-semibold">วันคืนรถ</th>
                  <th className="p-4 font-semibold text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 transition">
                      <td className="p-4 text-sm text-gray-500 font-mono">
                        {booking._id.substring(0, 8)}...
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-800">
                          {booking.car?.make} {booking.car?.model}
                        </div>
                        <div className="text-xs text-gray-500">
                          ทะเบียน: {booking.car?.licensePlate || '-'}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {new Date(booking.pickUpDate).toLocaleDateString('th-TH')}
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {new Date(booking.dropOffDate).toLocaleDateString('th-TH')}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          {/* ปุ่ม Edit: ลิงก์ไปหน้าแก้ที่คุณมีอยู่แล้ว */}
                          <Link 
                            href={`/reservations/edit/${booking._id}`}
                            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm hover:bg-yellow-200 transition"
                          >
                            แก้ไข
                          </Link>
                          
                          {/* 💡 เปลี่ยนปุ่ม Delete ให้ใช้ฟอร์มยิง Server Action แทน */}
                          <form action={deleteBooking} className="inline-block m-0 p-0">
                            <input type="hidden" name="bookingId" value={booking._id} />
                            <button 
                              type="submit" 
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition cursor-pointer"
                            >
                              ลบ
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      ยังไม่มีข้อมูลการจองในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}