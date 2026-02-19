import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const divisi = await db.divisi.findMany({
      where: { isActive: true },
      orderBy: { kode: 'asc' },
      include: {
        _count: { select: { kemandoran: true, tasks: true } }
      }
    });

    return NextResponse.json({ success: true, data: divisi });
  } catch (error) {
    console.error('Get divisi error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data divisi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { kode, nama, deskripsi } = body;

    if (!kode || !nama) {
      return NextResponse.json({ success: false, error: 'Kode dan nama harus diisi' }, { status: 400 });
    }

    // Check if kode already exists
    const existing = await db.divisi.findUnique({ where: { kode } });
    if (existing) {
      return NextResponse.json({ success: false, error: `Kode divisi "${kode}" sudah digunakan` }, { status: 400 });
    }

    const divisi = await db.divisi.create({
      data: { kode, nama, deskripsi }
    });

    return NextResponse.json({ success: true, data: divisi });
  } catch (error) {
    console.error('Create divisi error:', error);
    return NextResponse.json({ success: false, error: 'Gagal membuat divisi' }, { status: 500 });
  }
}
