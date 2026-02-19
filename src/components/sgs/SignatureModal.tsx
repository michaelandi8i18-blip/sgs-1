'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pen, RotateCcw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (signatureData: string) => void;
}

export function SignatureModal({ isOpen, onClose, onComplete }: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.scale(2, 2);
        context.strokeStyle = '#1a1a1a';
        context.lineWidth = 3;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        contextRef.current = context;
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    contextRef.current.beginPath();
    contextRef.current.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      e.preventDefault();
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    contextRef.current.lineTo(clientX - rect.left, clientY - rect.top);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (contextRef.current) {
      contextRef.current.closePath();
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      const signatureData = canvas.toDataURL('image/png');
      onComplete(signatureData);
      clearSignature();
      onClose();
    }
  };

  const handleClose = () => {
    clearSignature();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pen className="w-5 h-5 text-orange-500" />
            Tanda Tangan Digital
          </DialogTitle>
          <DialogDescription>
            Silakan buat tanda tangan Anda di area di bawah ini sebagai verifikasi
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Signature Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-48 border-2 border-dashed border-orange-300 rounded-xl cursor-crosshair bg-white touch-none"
            />
            
            {/* Placeholder text */}
            {!hasSignature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-sm">Gambar tanda tangan di sini</p>
              </div>
            )}
            
            {/* Border decoration */}
            <div className="absolute bottom-4 left-4 right-4 border-b-2 border-gray-300" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={clearSignature}
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Ulangi
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!hasSignature}
              className="flex-1 sgs-btn-primary"
            >
              <Check className="w-4 h-4 mr-2" />
              Konfirmasi
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Tanda tangan ini akan digunakan sebagai verifikasi pada dokumen PDF
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
