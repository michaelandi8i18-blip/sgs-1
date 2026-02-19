import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, signatureData } = body;

    if (!taskId || !signatureData) {
      return NextResponse.json({ success: false, error: 'Task ID dan tanda tangan harus diisi' }, { status: 400 });
    }

    // Get task with all details
    const task = await db.task.findUnique({
      where: { id: taskId },
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

    // Save signature if not exists
    if (!task.signature) {
      await db.digitalSignature.create({
        data: {
          userId: user.id,
          taskId: taskId,
          signatureData: signatureData,
        }
      });
    }

    // Generate PDF report data
    const pdfData = {
      nomorTask: task.nomorTask,
      namaKrani: task.namaKrani,
      divisi: task.divisi,
      kemandoran: task.kemandoran,
      notes: task.notes,
      submittedAt: task.submittedAt,
      tphAttachments: task.tphAttachments.map(tph => ({
        tphNumber: tph.tphNumber,
        photos: JSON.parse(tph.photos),
        notes: tph.notes,
        capturedAt: tph.capturedAt,
      })),
      signature: signatureData,
      generatedAt: new Date(),
      generatedBy: user.nama,
    };

    return NextResponse.json({ 
      success: true, 
      data: pdfData,
      message: 'Data PDF berhasil disiapkan'
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ success: false, error: 'Gagal generate PDF' }, { status: 500 });
  }
}
