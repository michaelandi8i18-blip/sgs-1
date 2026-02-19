import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, generateTaskNumber } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const where: {
      status?: string;
      userId?: string;
    } = {};
    
    if (status) where.status = status;
    if (userId) where.userId = userId;
    
    // Non-admin can only see their own tasks
    if (user.role !== 'admin') {
      where.userId = user.id;
    }

    const tasks = await db.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nama: true, username: true } },
        divisi: true,
        kemandoran: true,
        tphAttachments: true,
        signature: true,
      }
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data task' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { namaKrani, divisiId, kemandoranId, notes, tphAttachments } = body;

    if (!namaKrani || !divisiId || !kemandoranId) {
      return NextResponse.json({ success: false, error: 'Nama krani, divisi, dan kemandoran harus diisi' }, { status: 400 });
    }

    const nomorTask = await generateTaskNumber();

    const task = await db.task.create({
      data: {
        nomorTask,
        namaKrani,
        userId: user.id,
        divisiId,
        kemandoranId,
        notes,
        status: 'submitted',
        submittedAt: new Date(),
        tphAttachments: {
          create: tphAttachments?.map((tph: { tphNumber: number; photos: string; notes?: string; latitude?: number; longitude?: number }) => ({
            tphNumber: tph.tphNumber,
            photos: tph.photos,
            notes: tph.notes,
            latitude: tph.latitude,
            longitude: tph.longitude,
          })) || []
        }
      },
      include: {
        user: { select: { id: true, nama: true, username: true } },
        divisi: true,
        kemandoran: true,
        tphAttachments: true,
      }
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ success: false, error: 'Gagal membuat task' }, { status: 500 });
  }
}
