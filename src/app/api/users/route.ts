import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser, hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        email: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data user' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, password, nama, role, email, phone } = body;

    if (!username || !password || !nama || !role) {
      return NextResponse.json({ success: false, error: 'Username, password, nama, dan role harus diisi' }, { status: 400 });
    }

    // Check if username exists
    const existing = await db.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Username sudah digunakan' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        nama,
        role,
        email,
        phone,
      },
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ success: true, data: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ success: false, error: 'Gagal membuat user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, nama, email, phone, isActive, password } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID user harus diisi' }, { status: 400 });
    }

    const updateData: {
      nama?: string;
      email?: string;
      phone?: string;
      isActive?: boolean;
      password?: string;
    } = { nama, email, phone, isActive };
    
    if (password) {
      updateData.password = await hashPassword(password);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        nama: true,
        role: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengupdate user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID user harus diisi' }, { status: 400 });
    }

    await db.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus user' }, { status: 500 });
  }
}
