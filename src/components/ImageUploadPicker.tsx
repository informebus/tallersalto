import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, RefreshCw, Check } from 'lucide-react';

interface ImageUploadPickerProps {
  idPrefix?: string;
  label?: string;
  required?: boolean;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  accentColor?: 'blue' | 'orange' | 'emerald' | 'rose';
  helpText?: string;
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  idPrefix = 'upload',
  label = 'Adjuntar Foto',
  required = false,
  selectedFile,
  onFileSelect,
  accentColor = 'blue',
  helpText,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [selectedFile]);

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
    if (e.target) e.target.value = '';
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
    if (e.target) e.target.value = '';
  };

  const handleRemove = () => {
    onFileSelect(null);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  // Color classes
  const colorClasses = {
    blue: {
      activeBorder: 'border-blue-300 bg-blue-50/50',
      camBtn: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 active:bg-blue-200',
      badge: 'bg-blue-600 text-white',
    },
    orange: {
      activeBorder: 'border-orange-300 bg-orange-50/50',
      camBtn: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 active:bg-orange-200',
      badge: 'bg-orange-600 text-white',
    },
    emerald: {
      activeBorder: 'border-emerald-300 bg-emerald-50/50',
      camBtn: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 active:bg-emerald-200',
      badge: 'bg-emerald-600 text-white',
    },
    rose: {
      activeBorder: 'border-rose-300 bg-rose-50/50',
      camBtn: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 active:bg-rose-200',
      badge: 'bg-rose-600 text-white',
    },
  }[accentColor];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-1.5" id={`${idPrefix}-container`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label} {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          {selectedFile && (
            <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> Imagen seleccionada
            </span>
          )}
        </div>
      )}

      {/* Hidden file inputs for direct camera and gallery selection */}
      <input
        ref={cameraInputRef}
        id={`${idPrefix}-camera`}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        id={`${idPrefix}-gallery`}
        type="file"
        accept="image/*"
        onChange={handleGalleryChange}
        className="hidden"
      />

      {!selectedFile ? (
        <div className="grid grid-cols-2 gap-2">
          {/* Cámara Button */}
          <button
            type="button"
            id={`${idPrefix}-btn-camera`}
            onClick={() => cameraInputRef.current?.click()}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold shadow-xs transition active:scale-[0.98] ${colorClasses.camBtn}`}
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>Cámara</span>
          </button>

          {/* Galería Button */}
          <button
            type="button"
            id={`${idPrefix}-btn-gallery`}
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition active:scale-[0.98]"
          >
            <ImageIcon className="w-4 h-4 shrink-0 text-slate-500" />
            <span>Galería</span>
          </button>
        </div>
      ) : (
        /* Selected File Preview Box */
        <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${colorClasses.activeBorder}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Vista previa"
                className="w-12 h-12 rounded-lg object-cover border border-slate-300 bg-white shrink-0 shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate max-w-[140px] sm:max-w-[200px]">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {formatFileSize(selectedFile.size)} • Lista para enviar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Retake / Change options dropdown or simple buttons */}
            <button
              type="button"
              id={`${idPrefix}-btn-retake-cam`}
              onClick={() => cameraInputRef.current?.click()}
              title="Volver a tomar con la cámara"
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id={`${idPrefix}-btn-retake-gal`}
              onClick={() => galleryInputRef.current?.click()}
              title="Elegir otra de la galería"
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id={`${idPrefix}-btn-remove`}
              onClick={handleRemove}
              title="Quitar foto"
              className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {helpText && (
        <p className="text-[11px] text-slate-400">
          {helpText}
        </p>
      )}
    </div>
  );
};
