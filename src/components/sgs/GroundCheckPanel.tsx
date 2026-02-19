'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Trash2, Plus, Save, FileText, Download,
  MapPin, Clock, User, TreeDeciduous, ChevronDown,
  CheckCircle, Loader2, AlertCircle, Image as ImageIcon,
  Eye, X, Pen, FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore, useTaskStore, useOfflineStore, useUIStore } from '@/lib/store';
import { SignatureModal } from './SignatureModal';
import { PdfPreviewModal } from './PdfPreviewModal';
import { TaskHistoryModal } from './TaskHistoryModal';
import { toast } from 'sonner';

interface Divisi {
  id: string;
  kode: string;
  nama: string;
}

interface Kemandoran {
  id: string;
  kode: string;
  nama: string;
  divisiId: string;
}

interface TphPhoto {
  id: string;
  tphNumber: number;
  photoData: string;
  capturedAt: Date;
  latitude?: number;
  longitude?: number;
}

export function GroundCheckPanel() {
  const { user } = useAuthStore();
  const { 
    namaKrani, setNamaKrani,
    divisiId, setDivisi,
    kemandoranId, setKemandoran,
    notes, setNotes,
    tphPhotos, addTphPhoto, removeTphPhoto,
    clearTask, status, setStatus,
    currentTaskId, setCurrentTaskId
  } = useTaskStore();
  const { isOnline } = useOfflineStore();
  const { setShowSignatureModal, setShowPdfPreview } = useUIStore();

  const [divisiList, setDivisiList] = useState<Divisi[]>([]);
  const [kemandoranList, setKemandoranList] = useState<Kemandoran[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [currentTphNumber, setCurrentTphNumber] = useState(1);
  const [savedTaskData, setSavedTaskData] = useState<unknown>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch divisi and kemandoran
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [divisiRes] = await Promise.all([
          fetch('/api/divisi'),
        ]);
        const divisiData = await divisiRes.json();
        if (divisiData.success) {
          setDivisiList(divisiData.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Fetch kemandoran when divisi changes
  useEffect(() => {
    const fetchKemandoran = async () => {
      if (!divisiId) {
        setKemandoranList([]);
        return;
      }
      try {
        const res = await fetch(`/api/kemandoran?divisiId=${divisiId}`);
        const data = await res.json();
        if (data.success) {
          setKemandoranList(data.data);
        }
      } catch (error) {
        console.error('Error fetching kemandoran:', error);
      }
    };
    fetchKemandoran();
  }, [divisiId]);

  // Camera functions
  const startCamera = async (tphNum: number) => {
    try {
      setCurrentTphNumber(tphNum);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
      
      // Get location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Store location for later use
          },
          (error) => console.error('Geolocation error:', error)
        );
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Gagal mengakses kamera. Pastikan izin kamera diberikan.');
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        
        const newPhoto: TphPhoto = {
          id: `photo-${Date.now()}`,
          tphNumber: currentTphNumber,
          photoData,
          capturedAt: new Date(),
        };

        // Try to get location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              newPhoto.latitude = position.coords.latitude;
              newPhoto.longitude = position.coords.longitude;
              addTphPhoto(newPhoto);
            },
            () => {
              addTphPhoto(newPhoto);
            },
            { timeout: 5000 }
          );
        } else {
          addTphPhoto(newPhoto);
        }
        
        stopCamera();
        toast.success(`Foto TPH ${currentTphNumber} berhasil diambil`);
      }
    }
  }, [currentTphNumber, addTphPhoto, stopCamera]);

  // Get unique TPH numbers from photos
  const tphNumbers = [...new Set(tphPhotos.map(p => p.tphNumber))].sort((a, b) => a - b);
  const nextTphNumber = tphNumbers.length > 0 ? Math.max(...tphNumbers) + 1 : 1;

  // Save task
  const handleSave = async () => {
    if (!namaKrani || !divisiId || !kemandoranId) {
      toast.error('Mohon lengkapi semua field yang diperlukan');
      return;
    }

    if (tphPhotos.length === 0) {
      toast.error('Mohon ambil minimal 1 foto TPH');
      return;
    }

    setIsLoading(true);
    setStatus('saving');

    try {
      // Group photos by TPH number
      const tphAttachments = tphNumbers.map(tphNum => ({
        tphNumber: tphNum,
        photos: JSON.stringify(
          tphPhotos.filter(p => p.tphNumber === tphNum).map(p => p.photoData)
        ),
        notes: '',
        latitude: tphPhotos.find(p => p.tphNumber === tphNum)?.latitude,
        longitude: tphPhotos.find(p => p.tphNumber === tphNum)?.longitude,
      }));

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaKrani,
          divisiId,
          kemandoranId,
          notes,
          tphAttachments,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('saved');
        setCurrentTaskId(data.data.id);
        setSavedTaskData(data.data);
        toast.success('Task berhasil disimpan!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      setStatus('error');
      toast.error('Gagal menyimpan task. Data disimpan offline.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate PDF
  const handleGeneratePdf = async () => {
    if (!isOnline) {
      toast.error('Fitur PDF memerlukan koneksi internet');
      return;
    }
    if (!currentTaskId) {
      toast.error('Simpan task terlebih dahulu');
      return;
    }
    setShowSignatureModal(true);
  };

  const handleSignatureComplete = async (signatureData: string) => {
    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: currentTaskId,
          signatureData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSavedTaskData({ ...savedTaskData, signature: signatureData, pdfData: data.data });
        setShowPdfPreview(true);
        toast.success('PDF berhasil dibuat!');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('PDF error:', error);
      toast.error('Gagal membuat PDF');
    }
  };

  // Reset form
  const handleNewTask = () => {
    clearTask();
    setSavedTaskData(null);
    setStatus('draft');
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TreeDeciduous className="w-7 h-7 text-orange-500" />
            QC Buah - Ground Check
          </h2>
          <p className="text-gray-500 mt-1">
            Form pengumpulan data quality control buah kelapa sawit
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowHistory(true)}
          className="flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Riwayat Task
        </Button>
      </div>

      {/* Main Form */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Info Card */}
          <Card className="border-orange-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informasi Krani
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="namaKrani">Nama Krani *</Label>
                <Input
                  id="namaKrani"
                  value={namaKrani}
                  onChange={(e) => setNamaKrani(e.target.value)}
                  placeholder="Masukkan nama krani"
                  className="border-gray-200 focus:border-orange-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="divisi">Divisi *</Label>
                <Select value={divisiId} onValueChange={(value) => {
                  setDivisi(value);
                  setKemandoran('');
                }}>
                  <SelectTrigger className="border-gray-200 focus:border-orange-400">
                    <SelectValue placeholder="Pilih Divisi" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisiList.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        Divisi {d.kode} - {d.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kemandoran">Kemandoran *</Label>
                <Select 
                  value={kemandoranId} 
                  onValueChange={setKemandoran}
                  disabled={!divisiId}
                >
                  <SelectTrigger className="border-gray-200 focus:border-orange-400">
                    <SelectValue placeholder="Pilih Kemandoran" />
                  </SelectTrigger>
                  <SelectContent>
                    {kemandoranList.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        Kemandoran {k.kode} - {k.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card className="border-orange-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Catatan Pemanen Buah Mentah
              </CardTitle>
              <CardDescription className="text-green-100">
                Tulis nama-nama pemanen buah mentah
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Masukkan nama pemanen buah mentah (satu per baris)..."
                className="min-h-[150px] border-gray-200 focus:border-green-400"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - TPH Photos */}
        <div className="lg:col-span-2 space-y-6">
          {/* TPH Attachments Card */}
          <Card className="border-orange-100 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                TPH Attachments
              </CardTitle>
              <CardDescription className="text-orange-100">
                Ambil foto buah di setiap TPH (Tempat Pengumpulan Hasil)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Existing TPH Photos */}
              <div className="space-y-4 mb-6">
                {tphNumbers.map((tphNum) => {
                  const photos = tphPhotos.filter(p => p.tphNumber === tphNum);
                  return (
                    <motion.div
                      key={tphNum}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-orange-100 rounded-xl p-4 bg-orange-50/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          TPH {tphNum}
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startCamera(tphNum)}
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Tambah Foto
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {photos.map((photo) => (
                          <div key={photo.id} className="relative group">
                            <img
                              src={photo.photoData}
                              alt={`TPH ${tphNum}`}
                              className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => window.open(photo.photoData, '_blank')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeTphPhoto(photo.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            {photo.latitude && (
                              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                                <MapPin className="w-3 h-3 inline mr-1" />
                                GPS
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Add New TPH */}
              <Button
                onClick={() => startCamera(nextTphNumber)}
                className="w-full h-14 sgs-btn-primary text-lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Ambil Foto TPH {nextTphNumber}
              </Button>

              {tphPhotos.length === 0 && (
                <div className="mt-6 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                  <ImageIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400">Belum ada foto TPH</p>
                  <p className="text-sm text-gray-400">Klik tombol di atas untuk mulai mengambil foto</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {status !== 'saved' ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 h-14 sgs-btn-primary text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Simpan Task
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNewTask}
                  className="h-14 px-6"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleGeneratePdf}
                  disabled={!isOnline}
                  className="flex-1 h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg"
                >
                  <FileDown className="w-5 h-5 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNewTask}
                  className="h-14 px-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Task Baru
                </Button>
              </>
            )}
          </div>

          {/* Status Messages */}
          {status === 'saved' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
            >
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium text-green-700">Task berhasil disimpan!</p>
                <p className="text-sm text-green-600">
                  Anda dapat mengunduh PDF laporan atau membuat task baru
                </p>
              </div>
            </motion.div>
          )}

          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <div>
                <p className="font-medium text-amber-700">Mode Offline</p>
                <p className="text-sm text-amber-600">
                  Fitur download PDF memerlukan koneksi internet
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Camera Modal */}
      <Dialog open={showCamera} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg flex items-center gap-2">
                <Camera className="w-4 h-4" />
                TPH {currentTphNumber}
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white/70 text-sm">Pastikan foto buah terlihat jelas</p>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={stopCamera}
                className="rounded-full w-14 h-14"
              >
                <X className="w-6 h-6" />
              </Button>
              <Button
                onClick={capturePhoto}
                className="rounded-full w-20 h-20 sgs-btn-primary"
              >
                <Camera className="w-8 h-8" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={useUIStore.getState().showSignatureModal}
        onClose={() => useUIStore.getState().setShowSignatureModal(false)}
        onComplete={handleSignatureComplete}
      />

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={useUIStore.getState().showPdfPreview}
        onClose={() => useUIStore.getState().setShowPdfPreview(false)}
        taskData={savedTaskData}
      />

      {/* Task History Modal */}
      <TaskHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </div>
  );
}
