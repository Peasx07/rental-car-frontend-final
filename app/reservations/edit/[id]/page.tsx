"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ไอคอนรถ
const CarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
    <rect x="2" y="10" width="20" height="8" rx="2" ry="2"></rect>
    <path d="M7 10V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5"></path>
    <circle cx="7" cy="18" r="2"></circle>
    <circle cx="17" cy="18" r="2"></circle>
  </svg>
);

export default function EditReservationPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id;

  const [loading, setLoading] = useState(true);
  const [carData, setCarData] = useState<any>(null);
  const [formData, setFormData] = useState({
    pickUpDate: "",
    dropOffDate: "",
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const bookingRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`, {
          method: "GET",
          credentials: "include",
        });

        if (bookingRes.ok) {
          const bookingResult = await bookingRes.json();
          const booking = bookingResult.data;
          
          const pickUp = booking.pickUpDate ? booking.pickUpDate.split('T')[0] : "";
          const dropOff = booking.dropOffDate ? booking.dropOffDate.split('T')[0] : "";
          setFormData({ pickUpDate: pickUp, dropOffDate: dropOff });

          // 🛠️ แก้ไข: ใช้ข้อมูลรถที่ติดมากับ Booking ทันที เพื่อให้คำนวณราคาได้เลยไม่ต้องรอ
          if (booking.car && typeof booking.car === 'object') {
            setCarData(booking.car);
          }

          // แอบดึงข้อมูลรูปรถเพิ่ม เผื่อ Backend ไม่ได้แนบรูปมาในเส้น Get Booking
          const carIdFetch = booking.car._id || booking.car;
          const carRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars/${carIdFetch}`);
          if (carRes.ok) {
            const carResult = await carRes.json();
            setCarData(carResult.data); // อัปเดตข้อมูลทับ เพื่อให้ได้รูปมาแสดง
          }
        }
      } catch (err) {
        console.error("Error fetching details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [bookingId]);

  const calculateTotal = () => {
    // 🛠️ แก้ไข: ดักจับว่าต้องมี carData.dailyRate ถึงจะคำนวณ
    if (!formData.pickUpDate || !formData.dropOffDate || !carData || !carData.dailyRate) return 0;
    
    const pDate = new Date(formData.pickUpDate);
    const dDate = new Date(formData.dropOffDate);
    
    if (dDate <= pDate) return 0;

    const diffTime = Math.abs(dDate.getTime() - pDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return (days * carData.dailyRate);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        alert("อัปเดตข้อมูลการจองสำเร็จ!");
        router.push("/reservations");
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.message || "ไม่สามารถอัปเดตได้"}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black/40 flex items-center justify-center">
      <div className="bg-white p-10 rounded-3xl animate-pulse font-bold text-zinc-500">Loading...</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-black/40 flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-2xl w-full max-w-2xl relative">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-zinc-900 mb-1">Modify Reservation</h1>
          <p className="text-zinc-500 font-medium">Change the date of your reservation</p>
        </div>

        {carData && (
          <div className="flex items-center gap-5 p-4 rounded-2xl border border-zinc-100 bg-zinc-50 mb-8">
            <div className="w-24 h-16 relative rounded-xl overflow-hidden bg-white border border-zinc-200">
              <Image 
                src={
                carData.picture 
                    ? (carData.picture.startsWith('http') 
                        ? carData.picture 
                        : `/img/${carData.picture}`) // เติม /img/ นำหน้าชื่อไฟล์เพื่อให้ตรงกับโฟลเดอร์ที่มีอยู่
                    : "/img/car_placeholder.png" // ใส่รูปสำรองไว้ในโฟลเดอร์ img เช่นกัน
                }
                alt={carData.model || "Car"} 
                fill 
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CarIcon />
                <p className="text-lg font-bold text-zinc-900">{carData.make} {carData.model || "Car Model"}</p>
              </div>
              <p className="text-sm text-zinc-600 font-bold">
                +{(carData.dailyRate || 0).toLocaleString()} THB per day
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Pick-up Date</label>
              <input 
                type="date" 
                required
                value={formData.pickUpDate}
                onChange={(e) => setFormData({ ...formData, pickUpDate: e.target.value })}
                className="w-full border border-zinc-200 text-zinc-900 font-bold p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-[#f8f9fc]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Drop-off Date</label>
              <input 
                type="date" 
                required
                value={formData.dropOffDate}
                onChange={(e) => setFormData({ ...formData, dropOffDate: e.target.value })}
                className="w-full border border-zinc-200 text-zinc-900 font-bold p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-[#f8f9fc]"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-zinc-100 gap-6">
            <div className="w-full md:w-auto text-center md:text-left">
              <p className="text-sm font-bold text-zinc-500 mb-1">Total Price</p>
              <p className="text-3xl font-black text-blue-600">
                {calculateTotal().toLocaleString()} <span className="text-lg text-zinc-900">THB</span>
              </p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <Link 
                href="/reservations" 
                className="w-full md:w-auto text-center bg-white border-2 border-zinc-200 text-zinc-600 px-6 py-4 rounded-2xl font-bold hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </Link>
              <button 
                type="submit" 
                className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </form>

      </div>
    </main>
  );
}