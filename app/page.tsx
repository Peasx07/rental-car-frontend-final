"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 🌟 ย้าย apiUrl มาไว้ข้างนอก
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [pickUpDate, setPickUpDate] = useState("");
  const [dropOffDate, setDropOffDate] = useState("");

  const getCarImage = (model?: string, make?: string) => {
    const name = `${model || ""} ${make || ""}`.toLowerCase();
    
    if (name.includes("3 series") || name.includes("bmw")) return "/img/bmw.jpg";
    if (name.includes("camry") || name.includes("toyota")) return "/img/camry.jpg";
    if (name.includes("city") || name.includes("honda")) return "/img/honda.jpg";
    if (name.includes("pajero") || name.includes("mitsu")) return "/img/mitsu.jpg";
    if (name.includes("nissan")) return "/img/nissan.jpg";
    return "/img/default-car.png"; 
  };

  let duration = 0;
  if (pickUpDate && dropOffDate) {
    const start = new Date(pickUpDate);
    const end = new Date(dropOffDate);
    const diffTime = end.getTime() - start.getTime();
    duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (duration <= 0) duration = 0;
  }

  const handleLogout = async () => {
    try {
      // 🌟 ใช้ apiUrl แทน
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

  const handleBooking = async () => {
    if (!selectedCar) {
      alert("กรุณาเลือกรถที่ต้องการจองก่อนครับ!");
      return;
    }
    if (!pickUpDate || !dropOffDate) {
      alert("กรุณาเลือกวันรับรถ และวันคืนรถก่อนทำการจองครับ!");
      return;
    }
    if (duration <= 0) {
      alert("วันคืนรถต้องอยู่หลังวันรับรถครับ!");
      return;
    }

    const bookingData = {
      date: pickUpDate,
      pickUpDate: pickUpDate,
      dropOffDate: dropOffDate,
      provider: selectedCar.provider?._id || selectedCar.provider 
    };

    try {
      // 🌟 ใช้ apiUrl แทน
      const res = await fetch(`${apiUrl}/cars/${selectedCar._id}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bookingData),
      });

      const data = await res.json();
      if (data.success) {
        alert("🎉 จองรถสำเร็จเรียบร้อย!");
        router.push("/reservations");
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) {
      console.error("Booking error:", err);
    }
  };

  useEffect(() => {
    // 🌟 1. สร้าง AbortController
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        // 🌟 2. ใช้ apiUrl และแนบ signal
        const userRes = await fetch(`${apiUrl}/auth/me`, {
          method: "GET",
          credentials: "include",
          signal,
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.success) {
            setUser(userData.data);
            
            // 🌟 3. ใช้ apiUrl และแนบ signal
            const carsRes = await fetch(`${apiUrl}/cars`, {
              method: "GET",
              credentials: "include", 
              signal,
            });
            const carsData = await carsRes.json();
            if (carsData.success) {
              const carList = carsData.data || [];
              setCars(carList);
              if (carList.length > 0) setSelectedCar(carList[0]);
            }
          } else {
            router.push("/login");
          }
        } else {
            router.push("/login");
        }
      } catch (err: any) {
        // 🌟 4. ดัก Error ถ้าผู้ใช้เปลี่ยนหน้า
        if (err.name === 'AbortError' || err.message === 'Failed to fetch') {
          console.log("Fetch aborted on Home page due to fast navigation.");
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

  // 🌟 ย้ายมาเช็ค loading ก่อน return โครงสร้างหลัก (คุณทำถูกแล้ว)
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="p-10 text-center text-zinc-500 font-bold text-xl animate-pulse">กำลังตรวจสอบสิทธิ์การเข้าถึง...</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-zinc-200">
        <Link href="/" className="text-2xl font-black tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
            <span className="text-blue-600">HAP</span> Rentals
        </Link>
        <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-zinc-500">
          
          <Link href="/providers" className="cursor-pointer hover:text-zinc-900 transition-colors">
            Providers
          </Link>
          
          <span className="cursor-pointer text-blue-600 border-b-2 border-blue-600 pb-1">Cars</span>
          <Link href="/reservations" className="cursor-pointer hover:text-zinc-900 transition-colors">Reservations</Link>
        </div>
        
        <div className="flex items-center space-x-6">
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

      <div className="max-w-[1400px] mx-auto px-8 py-10">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mb-4">
            Available Cars from <span className="text-blue-600">Our Partners</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 💡 ไม่ต้องแก้ตรงนี้ เพราะมีเช็ค cars && cars.length ไว้แล้ว */}
              {cars && cars.length > 0 ? cars.map((car: any) => (
                <div key={car._id} className={`bg-white rounded-3xl border ${selectedCar?._id === car._id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-zinc-200'} overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col`}>
                  
                  <div className="w-full h-[220px] bg-white flex items-center justify-center p-4 relative">
                      <img 
                        src={getCarImage(car.model, car.make)} 
                        alt={car.model || "car"}
                        className="max-w-full max-h-full object-contain"
                      />
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
                        🏢 {car.provider?.name || "Premium Partner"}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 mb-6 truncate">{car.make || "Unknown"} {car.model || ""}</h3>
                    
                    <div className="grid grid-cols-2 gap-y-4 mb-8">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Year</p>
                        <p className="text-sm font-semibold text-zinc-800">{car.year || "2024"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">License Plate</p>
                        <p className="text-sm font-semibold text-zinc-800">{car.licensePlate || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-auto pt-4 border-t border-zinc-100">
                      <div>
                        <span className="text-2xl font-black text-blue-600">฿{(car.dailyRate || car.pricePerDay || 0).toLocaleString()}</span>
                        <span className="text-xs font-semibold text-zinc-400"> /day</span>
                      </div>
                      <button 
                        onClick={() => setSelectedCar(car)}
                        className={`${selectedCar?._id === car._id ? 'bg-zinc-800' : 'bg-blue-600'} text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors`}
                      >
                        {selectedCar?._id === car._id ? 'Selected' : 'Select to Book'}
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-10 text-center text-zinc-500 font-medium bg-zinc-50 rounded-2xl border border-zinc-200">
                  กำลังโหลดข้อมูล หรือยังไม่มีรถในระบบ
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-[420px] bg-[#f8f9fc] rounded-[32px] p-8 border border-zinc-200 sticky top-10">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Reserve Your Vehicle</h2>

            <div className="bg-white p-3 rounded-2xl flex items-center gap-4 mb-6 shadow-sm border border-zinc-100">
              <div className="w-16 h-12 bg-zinc-100 rounded-lg flex items-center justify-center overflow-hidden">
                {selectedCar ? (
                  <img src={getCarImage(selectedCar.model, selectedCar.make)} className="w-full h-full object-contain" />
                ) : "🚗"}
              </div>
              <div className="flex-1 truncate">
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Selected Car</p>
                <p className="text-sm font-bold text-zinc-900 truncate">
                  {selectedCar ? `${selectedCar.make || ""} ${selectedCar.model || ""}` : "Select a car first"}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Pick-up Date</p>
              <input type="date" value={pickUpDate} onChange={(e) => setPickUpDate(e.target.value)} className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>
            <div className="mb-8">
              <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Drop-off Date</p>
              <input type="date" value={dropOffDate} onChange={(e) => setDropOffDate(e.target.value)} className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 outline-none" />
            </div>

            <div className="space-y-3 mb-6 border-b pb-6">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Duration</span>
                <span className="font-bold">{duration > 0 ? `${duration} Days` : "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Daily Rate</span>
                <span className="font-bold">฿{selectedCar ? (selectedCar.dailyRate || selectedCar.pricePerDay || 0).toLocaleString() : "0"}</span>
              </div>
            </div>

            <div className="bg-zinc-100/80 p-5 rounded-2xl flex items-center justify-between mb-6">
              <span className="font-bold">Total Price</span>
              <p className="text-2xl font-black text-blue-600">
                ฿{selectedCar && duration > 0 ? (((selectedCar.dailyRate || selectedCar.pricePerDay || 0) * duration)).toLocaleString() : "0"}
              </p>
            </div>

            <button 
              onClick={handleBooking}
              disabled={!selectedCar}
              className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg ${selectedCar ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}