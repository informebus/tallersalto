import React, { useState, useRef } from 'react';
import { 
  Package, 
  CheckCircle, 
  Camera, 
  Plus, 
  Search, 
  X, 
  User, 
  Clock, 
  Check, 
  RotateCcw, 
  Image as ImageIcon,
  Tag,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../firebase';
import { ObjetoPerdidoItem } from '../../types';
import { comprimirImagen } from '../../utils/image';

interface ObjetosPerdidosViewProps {
  objetos: Record<string, ObjetoPerdidoItem>;
  currentUserEmail: string;
  onOpenImage: (src: string) => void;
}

export const ObjetosPerdidosView: React.FC<ObjetosPerdidosViewProps> = ({
  objetos,
  currentUserEmail,
  onOpenImage,
}) => {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Retenido' | 'Devuelto'>('Todos');

  // Form State
  const [articulo, setArticulo] = useState('');
  const [encontradoPor, setEncontradoPor] = useState(
    currentUserEmail ? currentUserEmail.split('@')[0] : 'Conductor'
  );
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Return Modal / Prompt State
  const [itemToReturn, setItemToReturn] = useState<{ id: string; articulo: string } | null>(null);
  const [entregadoA, setEntregadoA] = useState('');
  const [isReturning, setIsReturning] = useState(false);

  // Handle Photo Capture/Selection
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const compressed = await comprimirImagen(file, 1280, 0.75);
      setFotoBase64(compressed);
    } catch (err) {
      console.error('Error al procesar la foto:', err);
      alert('Hubo un error al procesar la imagen.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle New Item Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!articulo.trim()) {
      alert('Por favor ingrese la descripción del artículo encontrado.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ahora = new Date();
      const fechaStr = ahora.toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) + ' ' + ahora.toLocaleTimeString('es-UY', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const newItem: Omit<ObjetoPerdidoItem, 'id'> = {
        articulo: articulo.trim(),
        encontrado_por: encontradoPor.trim() || 'Conductor',
        fecha: fechaStr,
        estado: 'Retenido',
        ...(fotoBase64 ? { foto: fotoBase64 } : {}),
      };

      await db.ref('objetos_perdidos').push(newItem);

      // Reset form
      setArticulo('');
      setFotoBase64(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowRegisterForm(false);
    } catch (err) {
      console.error('Error al registrar objeto perdido:', err);
      alert('Error al guardar en la base de datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Marking Item as Delivered
  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToReturn) return;
    if (!entregadoA.trim()) {
      alert('Por favor indique a quién se le entrega el objeto.');
      return;
    }

    setIsReturning(true);
    try {
      await db.ref(`objetos_perdidos/${itemToReturn.id}`).update({
        estado: 'Devuelto',
        entregado_a: entregadoA.trim(),
      });

      setItemToReturn(null);
      setEntregadoA('');
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      alert('No se pudo actualizar el estado del objeto.');
    } finally {
      setIsReturning(false);
    }
  };

  // Convert objects record to sorted array (newest first)
  const itemsList: (ObjetoPerdidoItem & { id: string })[] = Object.entries(objetos || {})
    .filter(([_, item]) => typeof item === 'object' && item !== null)
    .map(([id, item]) => ({
      ...(item as ObjetoPerdidoItem),
      id,
    }))
    .reverse();

  const filteredItems = itemsList.filter((item) => {
    const matchesSearch = 
      (item.articulo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.encontrado_por || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.entregado_a || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'Todos' || item.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalRetenidos = itemsList.filter(i => i.estado === 'Retenido').length;
  const totalDevueltos = itemsList.filter(i => i.estado === 'Devuelto').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Objetos Perdidos
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {totalRetenidos} en custodia
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Registro y control de pertenencias halladas a bordo de las unidades
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowRegisterForm((prev) => !prev)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-xs sm:text-sm shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer shrink-0"
          >
            {showRegisterForm ? (
              <>
                <X className="w-4 h-4" />
                <span>Cerrar Formulario</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Registrar Objeto</span>
              </>
            )}
          </button>
        </div>

        {/* Collapsible Register Form */}
        <AnimatePresence>
          {showRegisterForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="mt-5 pt-5 border-t border-slate-800/80 space-y-4"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nuevo Artículo Hallado</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Descripción del Artículo <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Mochila negra con útiles, Billetera marrón en asiento 4, Celular..."
                    value={articulo}
                    onChange={(e) => setArticulo(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Encontrado por
                  </label>
                  <input
                    type="text"
                    value={encontradoPor}
                    onChange={(e) => setEncontradoPor(e.target.value)}
                    placeholder="Nombre o funcionario"
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Fotografía del Objeto (Opcional)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoSelect}
                      className="hidden"
                      id="objeto-foto-input"
                    />
                    <label
                      htmlFor="objeto-foto-input"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-950/70 border border-dashed border-slate-700 hover:border-amber-500/70 rounded-xl text-xs text-slate-300 hover:text-white cursor-pointer transition-colors"
                    >
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>{fotoBase64 ? 'Cambiar foto' : 'Tomar / Subir Foto'}</span>
                    </label>

                    {fotoBase64 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFotoBase64(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-2.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors"
                        title="Quitar foto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Photo Preview if selected */}
              {isCompressing && (
                <div className="text-xs text-amber-400 flex items-center gap-2 py-1">
                  <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>Optimizando fotografía...</span>
                </div>
              )}

              {fotoBase64 && !isCompressing && (
                <div className="relative inline-block mt-2">
                  <img
                    src={fotoBase64}
                    alt="Vista previa del objeto"
                    className="w-24 h-24 object-cover rounded-xl border border-amber-500/40 shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => onOpenImage(fotoBase64)}
                  />
                  <span className="absolute bottom-1 right-1 bg-slate-900/90 text-[10px] text-amber-300 px-1.5 py-0.5 rounded-md font-mono">
                    Adjunta
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Guardar Registro</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por artículo, chofer o destinatario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 border border-slate-800 rounded-xl shrink-0 self-start sm:self-auto">
          {(['Todos', 'Retenido', 'Devuelto'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === filter
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {filter === 'Todos' ? `Todos (${itemsList.length})` : 
               filter === 'Retenido' ? `Retenidos (${totalRetenidos})` : 
               `Devueltos (${totalDevueltos})`}
            </button>
          ))}
        </div>
      </div>

      {/* Items Cards List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-900/40 border border-dashed border-slate-800/80 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 text-slate-500 mx-auto flex items-center justify-center mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">
            {searchQuery || statusFilter !== 'Todos'
              ? 'No se encontraron objetos con ese criterio'
              : 'No hay objetos perdidos registrados'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Los artículos hallados por choferes o inspectores se mostrarán aquí para coordinar su entrega.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredItems.map((item) => {
            const isRetenido = item.estado === 'Retenido';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-slate-900/80 border rounded-2xl p-4 transition-all duration-150 relative overflow-hidden flex flex-col justify-between ${
                  isRetenido
                    ? 'border-amber-500/30 hover:border-amber-500/50 shadow-sm'
                    : 'border-slate-800/80 hover:border-slate-700/80 opacity-90'
                }`}
              >
                <div>
                  {/* Card Header: Status & Date */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isRetenido
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isRetenido ? (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Retenido / En Custodia</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Devuelto</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {item.fecha}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex items-start gap-3">
                    {/* Attached Photo thumbnail */}
                    {item.foto ? (
                      <button
                        onClick={() => onOpenImage(item.foto!)}
                        className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 shrink-0 group relative cursor-pointer"
                        title="Ver fotografía en tamaño completo"
                      >
                        <img
                          src={item.foto}
                          alt={item.articulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <ImageIcon className="w-4 h-4 text-white" />
                        </div>
                      </button>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-500 shrink-0">
                        <Tag className="w-5 h-5" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-100 leading-snug break-words">
                        {item.articulo}
                      </h4>

                      <div className="mt-2 space-y-1 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">
                            Encontrado por: <strong className="text-slate-300 font-medium">{item.encontrado_por}</strong>
                          </span>
                        </div>

                        {!isRetenido && item.entregado_a && (
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              Entregado a: <strong className="font-semibold">{item.entregado_a}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Button if Retenido */}
                {isRetenido && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
                    <button
                      onClick={() => setItemToReturn({ id: item.id, articulo: item.articulo })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Marcar como Devuelto</span>
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal: Confirm Delivery / Return */}
      <AnimatePresence>
        {itemToReturn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Registrar Devolución</h3>
                    <p className="text-xs text-slate-400">Confirmar entrega del artículo al propietario</p>
                  </div>
                </div>
                <button
                  onClick={() => setItemToReturn(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="text-slate-500 block mb-0.5">Artículo:</span>
                <strong className="text-white text-sm font-semibold">{itemToReturn.articulo}</strong>
              </div>

              <form onSubmit={handleConfirmReturn} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    ¿A quién se le entrega el objeto? <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre, Cédula de Identidad o Teléfono..."
                    value={entregadoA}
                    onChange={(e) => setEntregadoA(e.target.value)}
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setItemToReturn(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isReturning}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    {isReturning ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Actualizando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirmar Entrega</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
