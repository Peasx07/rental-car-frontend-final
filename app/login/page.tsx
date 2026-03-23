"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ดึง API URL จาก Env หรือใช้ Localhost เป็นค่าสำรอง
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// --- Icons ---
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

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    console.log("🚀 พยายามเชื่อมต่อ API ที่:", `${apiUrl}/auth/login`);

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        // ✅ สำคัญมาก: ต้องใส่เพื่อให้ยอมรับ Cookie ข้ามโดเมน
        credentials: "include", 
      });

      const data = await res.json();

      if (data.success) {
        console.log("✅ Login Success! ข้อมูลที่ได้รับ:", data);
        
        // 🚨 เก็บ Token สำรองไว้ใน LocalStorage เผื่อเบราว์เซอร์บล็อก Cookie
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        alert("เข้าสู่ระบบสำเร็จ!");

        // 🚨 ใช้ window.location.href แทน router.push เพื่อบังคับให้เบราว์เซอร์ล้างค่าหน้าเว็บ
        // และวาร์ปไปหน้าหลักทันที
        window.location.href = "/"; 
      } else {
        alert("เข้าสู่ระบบไม่สำเร็จ: " + (data.message || "อีเมลหรือรหัสผ่านผิด"));
      }
    } catch (error: any) {
      console.error("❌ Login Error:", error);
      alert(`ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้: โปรดตรวจสอบ Backend (Error: ${error.message})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f9f9ff] p-4">
      <div className="mb-10 text-center">
        <p className="text-5xl font-extrabold text-zinc-950">HAP Rentals</p>
        <h1 className="mt-2 text-xl font-medium text-zinc-600">Login to your account</h1>
      </div>

      <div className="w-full max-w-md p-10 bg-white border border-zinc-100 rounded-3xl shadow-xl">
        <div className="flex border-b border-zinc-100 mb-8">
          <div className="w-1/2 py-4 text-center text-sm font-semibold text-blue-600 border-b-2 border-blue-600 uppercase">Login</div>
          <button 
            type="button"
            onClick={() => router.push('/register')}
            className="w-1/2 py-4 text-center text-sm font-semibold text-zinc-400 hover:text-zinc-600 uppercase"
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-2">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4"><MailIcon /></div>
              <input 
                type="email" name="email" required onChange={handleChange}
                placeholder="email@example.com"
                className="w-full px-4 py-3 pl-12 rounded-xl border border-zinc-200 focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4"><LockIcon /></div>
              <input 
                type="password" name="password" required onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 pl-12 rounded-xl border border-zinc-200 focus:ring-1 focus:ring-blue-400 focus:outline-none transition-all text-black"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full mt-6 rounded-xl py-3.5 font-bold text-white transition-all ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ / Login"}
          </button>
        </form>
      </div>
    </div>
  );
}