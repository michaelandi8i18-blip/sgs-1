import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'sge-secret-key-2024-palm-oil-sgs-production';
const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
}

async function main() {
  console.log('\n🌱 Seeding Supabase database...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.digitalSignature.deleteMany();
  await prisma.tphAttachment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.kemandoran.deleteMany();
  await prisma.divisi.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Data cleared');

  // Admin
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: await hashPassword('admin123'),
      nama: 'Administrator SGS',
      role: 'admin',
      email: 'admin@sgs.com',
    },
  });
  console.log('✅ Admin:', admin.username);

  // User
  const user = await prisma.user.create({
    data: {
      username: 'krani1',
      password: await hashPassword('user123'),
      nama: 'Krani Divisi 1',
      role: 'user',
      email: 'krani1@sgs.com',
    },
  });
  console.log('✅ User:', user.username);

  // Divisi
  const d1 = await prisma.divisi.create({ data: { kode: '1', nama: 'Divisi 1' } });
  const d2 = await prisma.divisi.create({ data: { kode: '2', nama: 'Divisi 2' } });
  const d3 = await prisma.divisi.create({ data: { kode: '3', nama: 'Divisi 3' } });
  console.log('✅ Divisi:', d1.kode, d2.kode, d3.kode);

  // Kemandoran (auto-generated kode, with namaMandor)
  const k1 = await prisma.kemandoran.create({ 
    data: { kode: 'K1-001', nama: 'Kemandoran A', namaMandor: 'Pak Budi', divisiId: d1.id } 
  });
  const k2 = await prisma.kemandoran.create({ 
    data: { kode: 'K2-001', nama: 'Kemandoran B', namaMandor: 'Pak Ahmad', divisiId: d2.id } 
  });
  const k3 = await prisma.kemandoran.create({ 
    data: { kode: 'K3-001', nama: 'Kemandoran C', namaMandor: null, divisiId: d3.id } // Vacant
  });
  console.log('✅ Kemandoran:', k1.kode, k2.kode, k3.kode);

  console.log('\n═══════════════════════════════════════');
  console.log('🎉 SEED COMPLETED!');
  console.log('═══════════════════════════════════════');
  console.log('👤 Admin: admin / admin123');
  console.log('👤 User:  krani1 / user123\n');
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
