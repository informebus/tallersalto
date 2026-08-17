import React, { useState } from 'react';
import { BookOpen, Search, CheckCircle2, ChevronDown, ChevronUp, Cpu, Key, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ManualView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    fase1: true,
    fase2: true,
    fase3: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const stepsFase1 = [
    {
      num: '01',
      title: 'Encendido y Llave Maestra',
      desc: 'Colocar la llave de contacto en posición "ON" para alimentar la boletera. Esperar que la pantalla LCD realice el chequeo de inicio y muestre la versión del sistema.',
    },
    {
      num: '02',
      title: 'Inserción de Llave Dallas / Conductor',
      desc: 'Apoyar la llave magnética de conductor en el lector circular de la consola hasta escuchar el pitido de confirmación con su número de funcionario.',
    },
    {
      num: '03',
      title: 'Selección de Línea y Recorrido',
      desc: 'Digitar el código numérico de la línea (Ej: 01, 02, 07). Confirmar con tecla "ENTRAR" y elegir sentido de marcha (Ida o Vuelta).',
    },
  ];

  const stepsFase2 = [
    {
      num: '01',
      title: 'Cobro de Boleto Común en Efectivo',
      desc: 'Presionar tecla "1" (Boleto Común). Ingresar el importe recibido si se requiere cálculo de cambio automático o presionar "IMPRIMIR" directamente.',
    },
    {
      num: '02',
      title: 'Boleto Estudiante / Jubilado / Combinación',
      desc: 'Seleccionar la tecla rápida asignada a la categoría bonificada ("EST", "JUB" o "COMB"). La boletera emitirá el ticket con código QR de verificación.',
    },
    {
      num: '03',
      title: 'Multiventa de Boletos',
      desc: 'Para expender varios boletos iguales juntos, presionar la cantidad en el teclado numérico (Ej: 3) seguido de la tecla "X" y el tipo de boleto.',
    },
    {
      num: '04',
      title: 'Lectura de Tarjeta Electrónica STM',
      desc: 'Indicar al pasajero que apoye su tarjeta plástica en el lector frontal sin retirarla hasta que la luz verde se active y suene el doble tono de débito.',
    },
  ];

  const stepsFase3 = [
    {
      num: '01',
      title: 'Cambio de Línea o Sentido en Destino',
      desc: 'Al llegar a la terminal o punta de línea, presionar "MENU" -> "CAMBIO DE RECORRIDO" y alternar hacia el sentido contrario.',
    },
    {
      num: '02',
      title: 'Emisión de Pasada de Control e Inspección',
      desc: 'Al subir un inspector municipal, presionar la combinación de inspección "INSP" + "ENTRAR" para imprimir la tira con el total de pasajeros transportados.',
    },
    {
      num: '03',
      title: 'Cierre de Turno y Liquidación Z',
      desc: 'Al finalizar la jornada en taller o garaje, presionar "CIERRE" -> "RELEVO". Extraer la llave Dallas y guardar la tira impresa de liquidación para entrega en tesorería.',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wider">
                Manual de Uso de la Boletera
              </h2>
              <p className="text-xs text-slate-500">
                Instrucciones paso a paso para la consola de a bordo
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar procedimiento..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Fase 1: Arranque y Preparación */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection('fase1')}
          className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/60 transition border-b border-slate-100 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              01
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Fase 1: Arranque y Apertura de Turno
              </h3>
              <p className="text-xs text-slate-500">Llave de contacto, identificación Dallas y selección de línea</p>
            </div>
          </div>
          {expandedSections.fase1 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        <AnimatePresence>
          {expandedSections.fase1 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 sm:p-5 space-y-3"
            >
              {stepsFase1.map((step) => (
                <div key={step.num} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-1">{step.title}</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fase 2: Venta y Operatoria en Recorrido */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection('fase2')}
          className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/60 transition border-b border-slate-100 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Fase 2: Venta de Boletos y Cobro de Pasaje
              </h3>
              <p className="text-xs text-slate-500">Boleto común, categorías, multiventa y tarjeta magnética</p>
            </div>
          </div>
          {expandedSections.fase2 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        <AnimatePresence>
          {expandedSections.fase2 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 sm:p-5 space-y-3"
            >
              {stepsFase2.map((step) => (
                <div key={step.num} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-1">{step.title}</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fase 3: Cierre, Relevo y Liquidación */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection('fase3')}
          className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/60 transition border-b border-slate-100 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
              03
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Fase 3: Pasada de Control y Cierre de Turno
              </h3>
              <p className="text-xs text-slate-500">Inspección en tránsito, tira de relevo y liquidación Z</p>
            </div>
          </div>
          {expandedSections.fase3 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        <AnimatePresence>
          {expandedSections.fase3 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 sm:p-5 space-y-3"
            >
              {stepsFase3.map((step) => (
                <div key={step.num} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs mb-1">{step.title}</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
