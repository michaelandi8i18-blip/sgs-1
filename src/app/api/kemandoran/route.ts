import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// GET - Fetch all kemandoran
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const divisiId = searchParams.get('divisiId');

    const where: { isActive: boolean; divisiId?: string } = { isActive: true };
    if (divisiId) where.divisiId = divisiId;

    const kemandoran = await db.kemandoran.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        divisi: true,
        _count: { select: { tasks: true } }
      }
    });

    return NextResponse.json({ success: true, data: kemandoran });
  } catch (error) {
    console.error('Get kemandoran error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data kemandoran' }, { status: 500 });
  }
}

// POST - Create new kemandoran
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nama, namaMandor, divisiId, deskripsi } = body;

    if (!nama || !divisiId) {
      return NextResponse.json({ success: false, error: 'Nama kemandoran dan divisi harus diisi' }, { status: 400 });
    }

    // Check if divisi exists
    const divisi = await db.divisi.findUnique({ where: { id: divisiId } });
    if (!divisi) {
      return NextResponse.json({ success: false, error: 'Divisi tidak ditemukan' }, { status: 400 });
    }

    // Count existing kemandoran for this divisi to generate kode
    const count = await db.kemandoran.count({ where: { divisiId } });
    
    // Generate kode: Divisi 1 -> K1-001, K1-002, etc.
    const kode = `K${divisi.kode}-${String(count + 1).padStart(3, '0')}`;

    const kemandoran = await db.kemandoran.create({
      data: { 
        kode, 
        nama, 
        namaMandor: namaMandor || null,
        divisiId, 
        deskripsi: deskripsi || null
      }
    });

    return NextResponse.json({ success: true, data: kemandoran });
  } catch (error) {
    console.error('Create kemandoran error:', error);
    return NextResponse.json({ success: false, error: 'Gagal membuat kemandoran' }, { status: 500 });
  }
}

// DELETE - Delete kemandoran
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID kemandoran harus diisi' }, { status: 400 });
    }

    // Check if kemandoran has tasks
    const tasksCount = await db.task.count({ where: { kemandoranId: id } });
    if (tasksCount > 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Tidak bisa menghapus kemandoran karena memiliki ${tasksCount} task terkait` 
      }, { status: 400 });
    }

    await db.kemandoran.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Kemandoran berhasil dihapus' });
  } catch (error) {
    console.error('Delete kemandoran error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus kemandoran' }, { status: 500 });
  }
}

// PUT - Update kemandoran
export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, nama, namaMandor, divisiId, deskripsi, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID kemandoran harus diisi' }, { status: 400 });
    }

    const updateData: {
      nama?: string;
      namaMandor?: string | null;
      divisiId?: string;
      deskripsi?: string | null;
      isActive?: boolean;
    } = {};
    
    if (nama !== undefined) updateData.nama = nama;
    if (namaMandor !== undefined) updateData.namaMandor = namaMandor || null;
    if (divisiId !== undefined) updateData.divisiId = divisiId;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const kemandoran = await db.kemandoran.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: kemandoran });
  } catch (error) {
    console.error('Update kemandoran error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengupdate kemandoran' }, { status: 500 });
  }
}
