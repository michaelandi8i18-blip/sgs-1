'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Eye, Trash2, FileText, MapPin, User, TreeDeciduous, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';

interface Task {
  id: string;
  nomorTask: string;
  namaKrani: string;
  status: string;
  submittedAt: string;
  createdAt: string;
  divisi: { kode: string; nama: string };
  kemandoran: { kode: string; nama: string };
  _count?: { tphAttachments: number };
}

interface TaskHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaskHistoryModal({ isOpen, onClose }: TaskHistoryModalProps) {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Gagal memuat riwayat task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Yakin ingin menghapus task ini?')) return;
    
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Task berhasil dihapus');
        fetchTasks();
      } else {
        toast.error(data.error || 'Gagal menghapus task');
      }
    } catch {
      toast.error('Terjadi kesalahan');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Terkirim';
      case 'approved':
        return 'Disetujui';
      default:
        return 'Draft';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Riwayat Task
          </DialogTitle>
          <DialogDescription>
            Daftar task yang telah dibuat
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="sgs-spinner" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Belum ada task yang dibuat</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 sgs-gradient-main rounded-xl flex items-center justify-center">
                        <TreeDeciduous className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{task.nomorTask}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {task.namaKrani}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Divisi {task.divisi?.kode}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {task._count?.tphAttachments || 0} TPH
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(task.createdAt).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                      {user?.role === 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(task.id)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
