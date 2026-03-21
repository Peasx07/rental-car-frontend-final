import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  // สั่งลบ Cookie ชื่อ 'token' แบบเด็ดขาดจากฝั่ง Server
  (await
        // สั่งลบ Cookie ชื่อ 'token' แบบเด็ดขาดจากฝั่ง Server
        cookies()).set('token', '', {
    expires: new Date(0),
    path: '/',
  });
  (await cookies()).delete('token');
  
  return NextResponse.json({ success: true });
}