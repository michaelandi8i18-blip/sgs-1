import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    // Delete existing data first
    await db.digitalSignature.deleteMany({});
    await db.tphAttachment.deleteMany({});
    await db.task.deleteMany({});
    await db.kemandoran.deleteMany({});
    await db.divisi.deleteMany({});
    await db.user.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create default admin
    const hashedPassword = await hashPassword('admin123');
    const admin = await db.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        nama: 'Administrator',
        role: 'admin',
        email: 'admin@sgs.com',
      }
    });
    console.log('✅ Admin created:', admin.username);

    // Create sample user
    const userPassword = await hashPassword('user123');
    const sampleUser = await db.user.create({
      data: {
        username: 'krani1',
        password: userPassword,
        nama: 'Krani Divisi 1',
        role: 'user',
        email: 'krani1@sgs.com',
      }
    });
    console.log('✅ User created:', sampleUser.username);

    // Create divisi
    const divisi1 = await db.divisi.create({
      data: { kode: '1', nama: 'Divisi 1', deskripsi: 'Divisi Pertama' }
    });
    const divisi2 = await db.divisi.create({
      data: { kode: '2', nama: 'Divisi 2', deskripsi: 'Divisi Kedua' }
    });
    const divisi3 = await db.divisi.create({
      data: { kode: '3', nama: 'Divisi 3', deskripsi: 'Divisi Ketiga' }
    });
    console.log('✅ Divisi created');

    // Create kemandoran
    await db.kemandoran.createMany({
      data: [
        { kode: 'A', nama: 'Kemandoran A', divisiId: divisi1.id },
        { kode: 'B', nama: 'Kemandoran B', divisiId: divisi2.id },
        { kode: 'C', nama: 'Kemandoran C', divisiId: divisi3.id },
      ]
    });
    console.log('✅ Kemandoran created');

    return NextResponse.json({
      success: true,
      message: 'Database berhasil di-seed ulang!',
      credentials: {
        admin: { username: 'admin', password: 'admin123' },
        user: { username: 'krani1', password: 'user123' }
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
