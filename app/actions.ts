'use server'

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function forceLogout() {
  // สั่งลบ Cookie อย่างเป็นทางการของ Next.js
  (await
    // สั่งลบ Cookie อย่างเป็นทางการของ Next.js
    cookies()).delete('token');

  // สั่งเปลี่ยนหน้าจากฝั่ง Server ทันที
  redirect('/login');
}