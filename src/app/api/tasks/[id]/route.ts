import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const task = await db.task.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nama: true, username: true, email: true } },
        divisi: true,
        kemandoran: true,
        tphAttachments: true,
        signature: true,
      }
    });

    if (!task) {
      return NextResponse.json({ success: false, error: 'Task tidak ditemukan' }, { status: 404 });
    }

    // Non-admin can only see their own tasks
    if (user.role !== 'admin' && task.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data task' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus task' }, { status: 500 });
  }
}
