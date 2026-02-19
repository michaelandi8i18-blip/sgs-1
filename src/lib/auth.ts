import { db } from './db';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { User } from '@prisma/client';

const SECRET_KEY = process.env.JWT_SECRET || 'sge-secret-key-2024-palm-oil';
const key = new TextEncoder().encode(SECRET_KEY);

export interface SessionUser {
  id: string;
  username: string;
  nama: string;
  role: string;
  email?: string | null;
}

// Hash password menggunakan simple hash (untuk production gunakan bcrypt)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SECRET_KEY);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}

// Generate JWT token
export async function generateToken(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ 
    id: user.id, 
    username: user.username, 
    nama: user.nama, 
    role: user.role,
    email: user.email 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
  
  return token;
}

// Verify JWT token
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const verified = await jwtVerify(token, key);
    return verified.payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

// Get current session user
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('sgs_token')?.value;
    
    if (!token) return null;
    
    const user = await verifyToken(token);
    return user;
  } catch {
    return null;
  }
}

// Set session cookie
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('sgs_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Clear session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('sgs_token');
}

// Authenticate user
export async function authenticateUser(username: string, password: string): Promise<{ success: boolean; user?: SessionUser; error?: string }> {
  try {
    const user = await db.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, error: 'Username tidak ditemukan' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Akun tidak aktif' };
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return { success: false, error: 'Password salah' };
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role,
      email: user.email,
    };

    return { success: true, user: sessionUser };
  } catch (error) {
    console.error('Auth error:', error);
    return { success: false, error: 'Terjadi kesalahan sistem' };
  }
}

// Create user
export async function createUser(data: {
  username: string;
  password: string;
  nama: string;
  role: string;
  email?: string;
  phone?: string;
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const existingUser = await db.user.findUnique({
      where: { username: data.username },
    });

    if (existingUser) {
      return { success: false, error: 'Username sudah digunakan' };
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await db.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        nama: data.nama,
        role: data.role,
        email: data.email,
        phone: data.phone,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error('Create user error:', error);
    return { success: false, error: 'Gagal membuat user' };
  }
}

// Generate unique task number
export async function generateTaskNumber(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  const count = await db.task.count({
    where: {
      createdAt: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
    },
  });
  
  const sequence = String(count + 1).padStart(4, '0');
  return `SGS-${dateStr}-${sequence}`;
}
