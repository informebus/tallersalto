import React, { useEffect, useState, useRef } from 'react';
import { User, Camera, Image as ImageIcon, Save, Phone, ShieldAlert, Home, HeartPulse, CreditCard, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../../firebase';
import firebase from '../../firebase';
import { comprimirFotoPerfil } from '../../utils/image';

interface ProfileViewProps {
  user: firebase.User;
  onOpenImage: (src: string) => void;
  onBackToDirectory: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onOpenImage, onBackToDirectory }) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [funcionario, setFuncionario] = useState('');
  const [tel, setTel] = useState('');
  const [emergencia, setEmergencia] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [salud, setSalud] = useState('');
  const [vencLibreta, setVencLibreta] = useState('');
  const [vencSalud, setVencSalud] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string>('https://via.placeholder.com/150?text=SIN+FOTO');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const camInputRef = useRef<HTMLInputElement>(null);
  const galInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    db.ref(`perfiles/${user.uid}`)
      .once('value')
      .then((snapshot) => {
        const d = snapshot.val();
        if (d) {
          setNombre(d.nombre || '');
          setApellido(d.apellido || '');
          setFuncionario(d.funcionario || '');
          setTel(d.tel || '');
          setEmergencia(d.emergencia || '');
          setDomicilio(d.domicilio || '');
          setSalud(d.salud || '');
          setVencLibreta(d.vencLibreta || '');
          setVencSalud(d.vencSalud || '');
          if (d.foto) setFotoPreview(d.foto);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsProcessingPhoto(true);
      try {
        const compressed = await comprimirFotoPerfil(file, 600, 0.85);
        setFotoPreview(compressed);
      } catch {
        setFotoPreview(URL.createObjectURL(file));
      } finally {
        setIsProcessingPhoto(false);
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      let finalFoto = fotoPreview;
      if (selectedFile) {
        finalFoto = await comprimirFotoPerfil(selectedFile, 600, 0.85);
      }

      const datos = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        funcionario: funcionario.trim(),
        tel: tel.trim(),
        emergencia: emergencia.trim(),
        domicilio: domicilio.trim(),
        salud: salud.trim(),
        vencLibreta,
        vencSalud,
        correo: user.email,
        foto: finalFoto.includes('placeholder') ? null : finalFoto,
      };

      await db.ref(`perfiles/${user.uid}`).set(datos);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      alert('Error al guardar datos: ' + message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-semibold">Cargando datos de perfil...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDirectory}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
            title="Volver al Directorio"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wider">Mi Perfil</h2>
            <p className="text-xs text-slate-500">Datos visibles para compañeros e inspectores de Salto</p>
          </div>
        </div>

        {savedSuccess && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            ¡Guardado!
          </motion.span>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        {/* Avatar Photo Section */}
        <div className="flex flex-col items-center justify-center text-center pb-5 border-b border-slate-100">
          <input
            ref={camInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <input
            ref={galInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />

          <div className="relative mb-3 group">
            <div className="w-28 h-28 aspect-square rounded-full overflow-hidden border-4 border-blue-500/20 bg-slate-100 shadow-md flex items-center justify-center relative">
              {isProcessingPhoto ? (
                <div className="flex flex-col items-center justify-center gap-1.5 p-2 text-blue-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-[10px] font-semibold">Procesando...</span>
                </div>
              ) : (
                <img
                  src={fotoPreview}
                  alt="Foto Carnet"
                  onClick={() => fotoPreview && !fotoPreview.includes('placeholder') && onOpenImage(fotoPreview)}
                  className="w-full h-full aspect-square object-cover cursor-pointer group-hover:scale-105 transition duration-300"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => camInputRef.current?.click()}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 font-semibold text-xs border border-blue-200 shadow-2xs transition"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Tomar con Cámara</span>
            </button>
            <button
              type="button"
              onClick={() => galInputRef.current?.click()}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-xs border border-slate-200 shadow-2xs transition"
            >
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>De Galería</span>
            </button>
          </div>
          <span className="text-[11px] text-slate-400 mt-1.5 font-medium">Foto carnet para el padrón municipal de choferes</span>
        </div>

        {/* Nombres y Apellidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nombre *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Gonzalo"
              className="w-full py-2.5 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Apellido *
            </label>
            <input
              type="text"
              required
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Ej: Finozzi"
              className="w-full py-2.5 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Número de Funcionario & Celular */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              N° de Funcionario
            </label>
            <input
              type="number"
              value={funcionario}
              onChange={(e) => setFuncionario(e.target.value)}
              placeholder="Ej: 1482"
              className="w-full py-2.5 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500/20 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Teléfono Celular
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder="Ej: 099 123 456"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Emergencia y Domicilio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">
              Teléfono de Emergencia (Familiar)
            </label>
            <div className="relative">
              <ShieldAlert className="w-4 h-4 text-rose-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={emergencia}
                onChange={(e) => setEmergencia(e.target.value)}
                placeholder="Ej: 098 765 432 (Esposa)"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-rose-300 text-slate-900 placeholder-slate-400 text-sm focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-500/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Dirección / Domicilio en Salto
            </label>
            <div className="relative">
              <Home className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={domicilio}
                onChange={(e) => setDomicilio(e.target.value)}
                placeholder="Ej: Artigas 1240"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Salud & Vencimientos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Prestador de Salud
            </label>
            <div className="relative">
              <HeartPulse className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={salud}
                onChange={(e) => setSalud(e.target.value)}
                placeholder="Ej: CAM Salto"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Venc. Carnet Salud
            </label>
            <input
              type="date"
              value={vencSalud}
              onChange={(e) => setVencSalud(e.target.value)}
              className="w-full py-2.5 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Venc. Libreta Conducir
            </label>
            <input
              type="date"
              value={vencLibreta}
              onChange={(e) => setVencLibreta(e.target.value)}
              className="w-full py-2.5 px-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                GUARDAR Y ACTUALIZAR MIS DATOS
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
