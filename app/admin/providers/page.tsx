"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { forceLogout } from "../../actions"; // อาจจะต้องแก้เป็น ../../actions เพราะไฟล์อยู่ลึกขึ้น

export default function AdminProvidersDashboard() {
  const router = useRouter();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State สำหรับ Modal เพิ่ม/แก้ไข
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", address: "", telephone: "" });

  // โหลดข้อมูล Providers
  const fetchProviders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/providers`, {
        method: "GET",
        credentials: "include", // ส่ง Cookie Token ไปอัตโนมัติ
      });
      const data = await res.json();
      if (data.success) {
        setProviders(data.data);
      }
    } catch (err) {
      console.error("Fetch Providers Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const openModal = (provider: any = null) => {
    if (provider) {
      setEditingId(provider._id);
      setFormData({ name: provider.name, address: provider.address, telephone: provider.telephone });
    } else {
      setEditingId(null);
      setFormData({ name: "", address: "", telephone: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: "", address: "", telephone: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingId;
    const url = isEditing
      ? `${process.env.NEXT_PUBLIC_API_URL}/providers/${editingId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/providers`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        alert(isEditing ? "แก้ไขข้อมูลสำเร็จ!" : "เพิ่มผู้ให้บริการสำเร็จ!");
        fetchProviders();
        closeModal();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error("Submit Error:", err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ยืนยันการลบ ${name} หรือไม่?`)) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/providers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        alert("ลบข้อมูลสำเร็จ!");
        fetchProviders();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans relative">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col sticky top-0 md:h-screen z-10">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {/* สลับสีปุ่มให้ Provider เป็น Active */}
          <Link href="/admin" className="block px-4 py-2 hover:bg-slate-800 rounded-md text-gray-300 transition">
            📋 จัดการการจอง (Bookings)
          </Link>
          <Link href="/admin/providers" className="block px-4 py-2 bg-blue-600 rounded-md text-white font-medium shadow-md">
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
            <h1 className="text-3xl font-bold text-gray-800">ระบบจัดการผู้ให้บริการรถเช่า</h1>
            <p className="text-gray-500 mt-1">แอดมินสามารถเพิ่ม แก้ไข และลบพาร์ทเนอร์ได้ที่นี่</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition"
          >
            + เพิ่มผู้ให้บริการ
          </button>
        </header>

        {/* ================= TABLE ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-sm">
                  <th className="p-4 font-semibold w-1/4">ชื่อผู้ให้บริการ</th>
                  <th className="p-4 font-semibold w-1/4">เบอร์โทรศัพท์</th>
                  <th className="p-4 font-semibold w-2/4">ที่อยู่</th>
                  <th className="p-4 font-semibold text-center whitespace-nowrap">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-500 animate-pulse">กำลังโหลดข้อมูล...</td></tr>
                ) : providers.length > 0 ? (
                  providers.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-bold text-gray-800">{p.name}</td>
                      <td className="p-4 text-sm text-gray-600">{p.telephone}</td>
                      <td className="p-4 text-sm text-gray-600 line-clamp-2">{p.address}</td>
                      <td className="p-4 text-center space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => openModal(p)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm hover:bg-yellow-200 transition"
                        >
                          แก้ไข
                        </button>
                        <button 
                          onClick={() => handleDelete(p._id, p.name)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      ยังไม่มีข้อมูลผู้ให้บริการในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingId ? "แก้ไขข้อมูลผู้ให้บริการ" : "เพิ่มผู้ให้บริการใหม่"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">ชื่อผู้ให้บริการ</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">เบอร์โทรศัพท์</label>
                <input 
                  type="text" required value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">ที่อยู่</label>
                <textarea 
                  required rows={3} value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100">
                  ยกเลิก
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm">
                  {editingId ? "บันทึกข้อมูล" : "เพิ่มข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}