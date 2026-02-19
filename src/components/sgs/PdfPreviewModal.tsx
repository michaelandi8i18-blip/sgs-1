'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Loader2, FileText, CheckCircle, MapPin, Clock, User, TreeDeciduous } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useOfflineStore } from '@/lib/store';
import { toast } from 'sonner';

interface TaskData {
  id?: string;
  nomorTask?: string;
  namaKrani?: string;
  divisi?: { kode: string; nama: string };
  kemandoran?: { kode: string; nama: string };
  notes?: string;
  submittedAt?: string;
  tphAttachments?: Array<{
    tphNumber: number;
    photos: string[];
    notes?: string;
    capturedAt?: string;
  }>;
  signature?: string;
  pdfData?: {
    nomorTask: string;
    namaKrani: string;
    divisi: { kode: string; nama: string };
    kemandoran: { kode: string; nama: string };
    notes?: string;
    submittedAt?: string;
    tphAttachments: Array<{
      tphNumber: number;
      photos: string[];
      notes?: string;
      capturedAt?: string;
    }>;
    signature: string;
    generatedAt: string;
    generatedBy: string;
  };
}

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskData: TaskData | null;
}

export function PdfPreviewModal({ isOpen, onClose, taskData }: PdfPreviewModalProps) {
  const { isOnline } = useOfflineStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const data = taskData?.pdfData || taskData;

  useEffect(() => {
    if (isOpen && data) {
      generatePdfClientSide();
    }
  }, [isOpen, data]);

  const generatePdfClientSide = async () => {
    if (!data) return;
    
    setIsGenerating(true);
    
    try {
      // Dynamic import of jsPDF
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // Header
      doc.setFontSize(20);
      doc.setTextColor(247, 147, 26); // Orange
      doc.text('SGS - SPGE Groundcheck System', margin, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Laporan Quality Control Buah Kelapa Sawit', margin, yPos);
      yPos += 15;

      // Line separator
      doc.setDrawColor(247, 147, 26);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 15;

      // Task Info
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Informasi Task', margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      
      const info = [
        ['Nomor Task', data.nomorTask || '-'],
        ['Nama Krani', data.namaKrani || '-'],
        ['Divisi', data.divisi ? `Divisi ${data.divisi.kode} - ${data.divisi.nama}` : '-'],
        ['Kemandoran', data.kemandoran ? `Kemandoran ${data.kemandoran.kode} - ${data.kemandoran.nama}` : '-'],
        ['Tanggal Submit', data.submittedAt ? new Date(data.submittedAt).toLocaleString('id-ID') : '-'],
      ];

      info.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 40, yPos);
        yPos += 7;
      });

      yPos += 10;

      // TPH Attachments
      if (data.tphAttachments && data.tphAttachments.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Dokumentasi TPH', margin, yPos);
        yPos += 10;

        for (const tph of data.tphAttachments) {
          // Check if we need a new page
          if (yPos > 240) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setTextColor(247, 147, 26);
          doc.text(`TPH ${tph.tphNumber}`, margin, yPos);
          yPos += 8;

          // Add photos (first one only for simplicity)
          if (tph.photos && tph.photos.length > 0) {
            try {
              const photoData = tph.photos[0];
              if (photoData && photoData.startsWith('data:image')) {
                doc.addImage(photoData, 'JPEG', margin, yPos, 50, 50);
                yPos += 55;
              }
            } catch {
              console.error('Failed to add image');
            }
          }
          yPos += 5;
        }
      }

      yPos += 10;

      // Notes
      if (data.notes) {
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Catatan Pemanen Buah Mentah', margin, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 2 * margin);
        doc.text(splitNotes, margin, yPos);
        yPos += splitNotes.length * 5 + 10;
      }

      // Signature
      if (data.signature) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Tanda Tangan Digital', margin, yPos);
        yPos += 10;

        try {
          doc.addImage(data.signature, 'PNG', margin, yPos, 60, 30);
          yPos += 35;
        } catch {
          console.error('Failed to add signature');
        }

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Ditandatangani secara digital pada ${new Date().toLocaleString('id-ID')}`, margin, yPos);
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `SGS Report - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Generate blob
      const blob = doc.output('blob');
      setPdfBlob(blob);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Gagal membuat PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SGS_Report_${data?.nomorTask || Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('PDF berhasil diunduh');
    onClose();
  };

  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            Preview Laporan PDF
          </DialogTitle>
          <DialogDescription>
            Periksa laporan sebelum mengunduh
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 sgs-gradient-main rounded-xl flex items-center justify-center">
                <TreeDeciduous className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">{data.nomorTask}</h3>
                <p className="text-gray-500 text-sm">Quality Control Report</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600">Krani:</span>
                <span className="font-medium">{data.namaKrani}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600">Divisi:</span>
                <span className="font-medium">{data.divisi?.kode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600">Kemandoran:</span>
                <span className="font-medium">{data.kemandoran?.kode}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <span className="text-gray-600">Total TPH:</span>
                <span className="font-medium">{data.tphAttachments?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* TPH Photos Preview */}
          {data.tphAttachments && data.tphAttachments.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Foto TPH</h4>
              <div className="grid grid-cols-4 gap-2">
                {data.tphAttachments.map((tph, idx) => (
                  <div key={idx} className="relative">
                    {tph.photos && tph.photos[0] && (
                      <img
                        src={tph.photos[0]}
                        alt={`TPH ${tph.tphNumber}`}
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                      />
                    )}
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                      TPH {tph.tphNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature Preview */}
          {data.signature && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Tanda Tangan Digital</h4>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <img
                  src={data.signature}
                  alt="Signature"
                  className="max-h-20 object-contain"
                />
              </div>
            </div>
          )}

          {/* Download Button */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Tutup
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isGenerating || !pdfBlob}
              className="flex-1 sgs-btn-primary"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
