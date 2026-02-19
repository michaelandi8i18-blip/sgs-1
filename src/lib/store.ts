import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth Store
interface AuthState {
  user: {
    id: string;
    username: string;
    nama: string;
    role: string;
    email?: string | null;
  } | null;
  isAuthenticated: boolean;
  login: (user: AuthState['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'sgs-auth',
    }
  )
);

// Task Store for offline support
interface TphPhoto {
  id: string;
  tphNumber: number;
  photoData: string; // Base64
  capturedAt: Date;
  latitude?: number;
  longitude?: number;
}

interface TaskState {
  namaKrani: string;
  divisiId: string;
  kemandoranId: string;
  notes: string;
  tphPhotos: TphPhoto[];
  status: 'draft' | 'saving' | 'saved' | 'error';
  currentTaskId: string | null;
  
  setNamaKrani: (name: string) => void;
  setDivisi: (id: string) => void;
  setKemandoran: (id: string) => void;
  setNotes: (notes: string) => void;
  addTphPhoto: (photo: TphPhoto) => void;
  removeTphPhoto: (id: string) => void;
  clearTask: () => void;
  setStatus: (status: TaskState['status']) => void;
  setCurrentTaskId: (id: string | null) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      namaKrani: '',
      divisiId: '',
      kemandoranId: '',
      notes: '',
      tphPhotos: [],
      status: 'draft',
      currentTaskId: null,
      
      setNamaKrani: (namaKrani) => set({ namaKrani }),
      setDivisi: (divisiId) => set({ divisiId }),
      setKemandoran: (kemandoranId) => set({ kemandoranId }),
      setNotes: (notes) => set({ notes }),
      addTphPhoto: (photo) => set((state) => ({
        tphPhotos: [...state.tphPhotos, photo]
      })),
      removeTphPhoto: (id) => set((state) => ({
        tphPhotos: state.tphPhotos.filter(p => p.id !== id)
      })),
      clearTask: () => set({
        namaKrani: '',
        divisiId: '',
        kemandoranId: '',
        notes: '',
        tphPhotos: [],
        status: 'draft',
        currentTaskId: null
      }),
      setStatus: (status) => set({ status }),
      setCurrentTaskId: (currentTaskId) => set({ currentTaskId }),
    }),
    {
      name: 'sgs-task',
    }
  )
);

// Offline Queue Store
interface OfflineAction {
  id: string;
  type: 'create_task' | 'update_task' | 'create_photo';
  data: Record<string, unknown>;
  timestamp: number;
}

interface OfflineState {
  isOnline: boolean;
  queue: OfflineAction[];
  setOnline: (status: boolean) => void;
  addToQueue: (action: OfflineAction) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      isOnline: true,
      queue: [],
      setOnline: (isOnline) => set({ isOnline }),
      addToQueue: (action) => set((state) => ({
        queue: [...state.queue, action]
      })),
      removeFromQueue: (id) => set((state) => ({
        queue: state.queue.filter(a => a.id !== id)
      })),
      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'sgs-offline',
    }
  )
);

// UI Store
interface UIState {
  activePanel: 'groundcheck' | 'agronomy' | 'qa' | 'admin' | null;
  showLoginModal: boolean;
  showSignatureModal: boolean;
  showPdfPreview: boolean;
  setActivePanel: (panel: UIState['activePanel']) => void;
  setShowLoginModal: (show: boolean) => void;
  setShowSignatureModal: (show: boolean) => void;
  setShowPdfPreview: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activePanel: null,
  showLoginModal: false,
  showSignatureModal: false,
  showPdfPreview: false,
  setActivePanel: (activePanel) => set({ activePanel }),
  setShowLoginModal: (showLoginModal) => set({ showLoginModal }),
  setShowSignatureModal: (showSignatureModal) => set({ showSignatureModal }),
  setShowPdfPreview: (showPdfPreview) => set({ showPdfPreview }),
}));
