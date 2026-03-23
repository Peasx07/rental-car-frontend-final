"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// --- SVG Icons (เพื่อความสวยงามและคมชัด) ---
const UserIcon = () => (
  <svg className="size-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);
const PhoneIcon = () => (
  <svg className="size-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 1.968.756 3.82 2.112 5.226c2.083 2.152 5.176 3.033 8.163 2.373a8.16 8.16 0 0 0 3.12-.876c1.782-.931 3.238-2.31 4.14-4.004a8.131 8.131 0 0 0 .865-3.136a8.125 8.125 0 0 0-.422-2.583C19.782 2.651 18.318 1.5 16.638 1.5c-1.372 0-2.641.76-3.23 2.01l-.974 2.071c-.53 1.127-.085 2.5 1.054 3.085l.775.4a.501.501 0 0 1 .15.65c-.244.498-.567.97-.96 1.396a8.5 8.5 0 0 1-2.072 1.623a.5.5 0 0 1-.607-.123l-.4-.776a2.21 2.21 0 0 0-3.085-1.054l-2.071.974A2.21 2.21 0 0 0 3.1 11.232C2.5 13.064 2.25 14.986 2.25 16.875A8.125 8.125 0 0 0 6.75 22.5" />
  </svg>
);
const MailIcon = () => (
  <svg className="size-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);
const LockIcon = () => (
  <svg className="size-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    telephone: "",
    email: "",
    password: "",
    role: "user" // กำหนดให้คนที่สมัครหน้านี้เป็น user ธรรมดาเสมอ
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {

      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(formData),
 
        credentials: "include", 
      });

      const data = await res.json();

      if (data.success) {
        alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        router.push("/login");
      } else {
   
        alert("เกิดข้อผิดพลาด: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("ไม่สามารถติดต่อ Server ได้! โปรดเช็คว่า: \n1. เปิด Backend หรือยัง \n2. ตั้งค่า CORS ใน Backend หรือยัง");
    }
  };

  return (
    // Outer Container: จัดวางทุกอย่างไว้ตรงกลางจอ และกำหนดพื้นหลัง
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f9f9ff] font-sans text-zinc-900 p-4">
      
      {/* 🔝 ส่วน Header (HAP Rentals / Rental Car Booking) ตามที่คุณต้องการ */}
      <div className="mb-10 text-center">
        <p className="text-5xl font-extrabold text-zinc-950 tracking-tight">HAP Rentals</p>
        <h1 className="mt-2 text-xl font-medium  text-zinc-600 tracking-tighter">
          Rental Car Booking
        </h1>
      </div>

    
      {/* 📦 กล่องฟอร์มสมัครสมาชิก (Register Part) อยู่ตรงกลางจออย่างสมบูรณ์ */}
      <div className="w-full max-w-xl p-10 bg-white border border-zinc-100 rounded-3xl shadow-xl shadow-zinc-950/5">
        
        {/* Header ภายในกล่อง */}
        <div className="mb-12">
          
          {/* Tab Switcher (แกล้งๆ เหมือนในภาพเดิม) */}
          <div className="flex border-b border-zinc-100">
            <a href="/login" className="w-1/2 py-4 text-center text-sm font-semibold text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors">
              LOGIN
            </a>
            <div className="w-1/2 py-4 text-center text-sm font-semibold text-blue-600 uppercase tracking-widest border-b-2 border-blue-600">
              REGISTER
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Input Group: ชื่อ - นามสกุล */}
          <div>
            <label htmlFor="name" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wide mb-2">
              ชื่อ - นามสกุล / Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <UserIcon />
              </div>
              <input 
                type="text" name="name" id="name" required
                onChange={handleChange}
                placeholder="สมชาย ใจดี"
                className="w-full px-4 py-3 pl-12 rounded-xl border border-zinc-200 bg-white text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Input Group: เบอร์โทรศัพท์ */}
          <div>
            <label htmlFor="telephone" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wide mb-2">
              เบอร์โทรศัพท์ / Telephone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <PhoneIcon />
              </div>
              <input 
                type="tel" name="telephone" id="telephone" required
                onChange={handleChange}
                placeholder="0812345678"
                className="w-full px-4 py-3 pl-12 rounded-xl border border-zinc-200 bg-white text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Input Group: อีเมล */}
          <div>
            <label htmlFor="email" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wide mb-2">
              อีเมล / Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <MailIcon />
              </div>
              <input 
                type="email" name="email" id="email" required
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 pl-12 rounded-xl border border-zinc-200 bg-white text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>
          
          {/* Input Group: รหัสผ่าน */}
          <div>
            <label htmlFor="password" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wide mb-2">
              รหัสผ่าน / Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <LockIcon />
              </div>
              <input 
                type="password" name="password" id="password" required minLength={6}
                onChange={handleChange}
                placeholder="•••••••• อย่างน้อย 6 ตัวอักษร"
                className="w-full px-4 py-3 pl-12 rounded-xl border border-zinc-200 bg-white text-sm focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Register Button: ปุ่มสีฟ้า rounded เหมือนในภาพเดิม */}
          <button 
            type="submit"
            className="w-full mt-10 rounded-xl bg-blue-600 py-3.5 px-6 font-bold text-white text-sm hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 transform active:scale-[0.98]"
          >
            ลงทะเบียนตอนนี้ / Register now
          </button>
        </form>
          
        {/* Gray Bar ด้านล่างกล่อง เพื่อความสวยงาม */}
        <div className="mt-12 -mx-10 -mb-10 px-10 py-6 rounded-b-3xl bg-zinc-50 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-600">
              มีบัญชีอยู่แล้ว? <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">เข้าสู่ระบบ / Login now</a>
            </p>
        </div>

      </div>
    </div>
  );
}