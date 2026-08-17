import React, { useState } from 'react';
import { Scroll, Search, BookOpen, ChevronDown, ChevronUp, ShieldCheck, Scale, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const RegulationsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    cap1: true,
    cap2: false,
    cap3: false,
    cap4: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const capitulos = [
    {
      id: 'cap1',
      title: 'Capítulo I: Disposiciones Generales y Cometidos',
      sub: 'Resolución N° 85/87 y Res. N° 50/2010 • Intendencia Departamental de Salto',
      articles: [
        {
          num: 'Art. 1°',
          title: 'Ámbito de Aplicación',
          text: 'El presente reglamento rige para todo el personal dependiente del Servicio Urbano de Pasajeros de la División Ómnibus de Salto, estableciendo sus deberes, obligaciones y derechos en el ejercicio de la función pública.',
        },
        {
          num: 'Art. 2°',
          title: 'Misión del Servicio',
          text: 'El servicio público de transporte urbano tiene carácter esencial. El personal deberá prestar sus funciones con el máximo de celo, eficiencia, puntualidad y corrección en el trato con los usuarios.',
        },
        {
          num: 'Art. 3°',
          title: 'Jerarquía y Mando',
          text: 'Los conductores, guardas e inspectores dependen jerárquicamente de la Dirección del Servicio y Jefatura de Turno, debiendo acatar las órdenes de servicio e instrucciones operativas impartidas.',
        },
      ],
    },
    {
      id: 'cap2',
      title: 'Capítulo II: Obligaciones del Personal de Conducción',
      sub: 'Presentación, toma de servicio, estado del vehículo y seguridad en tránsito',
      articles: [
        {
          num: 'Art. 4°',
          title: 'Presentación al Servicio',
          text: 'El conductor deberá presentarse a tomar servicio con 15 minutos de anticipación al horario de salida asignado en la planilla diaria, debidamente uniformado y con el carnet de salud y libreta de conducir vigentes.',
        },
        {
          num: 'Art. 5°',
          title: 'Revisión Pre-Operativa del Coche',
          text: 'Antes de salir del taller o garaje, es obligación verificar niveles de combustible, agua, aceite, presión de neumáticos, luces reglamentarias, estado de frenos y correcto funcionamiento de la boletera electrónica.',
        },
        {
          num: 'Art. 6°',
          title: 'Normas de Conducción y Tránsito',
          text: 'Queda terminantemente prohibido fumar dentro del ómnibus, utilizar teléfonos celulares particulares durante la marcha o transportar personas en la cabina que puedan distraer la atención de la vía.',
        },
        {
          num: 'Art. 7°',
          title: 'Paradas y Trato al Pasajero',
          text: 'El ascenso y descenso de pasajeros se realizará exclusivamente en las paradas fijadas, aproximando el ómnibus al cordón de la acera y manteniendo las puertas cerradas hasta la detención total.',
        },
      ],
    },
    {
      id: 'cap3',
      title: 'Capítulo III: Régimen Disciplinario y Sanciones',
      sub: 'Faltas leves, graves y procedimiento sumarial administrativo',
      articles: [
        {
          num: 'Art. 8°',
          title: 'Clasificación de Faltas',
          text: 'Las faltas administrativas se clasifican en Leves (demoras injustificadas, desprolijidad de uniforme), Graves (abandono de servicio, desacato a inspectores) y Muy Graves (conducir bajo efectos de alcohol o estupefacientes).',
        },
        {
          num: 'Art. 9°',
          title: 'Escala de Sanciones',
          text: 'Las sanciones aplicables según la gravedad son: Observación verbal, Apercibimiento por escrito, Suspensión de 1 a 30 días sin goce de sueldo, y Destitución según el Estatuto del Funcionario Municipal.',
        },
      ],
    },
    {
      id: 'cap4',
      title: 'Capítulo IV: Accidentes, Siniestros y Averías',
      sub: 'Procedimiento de auxilio y aviso inmediato al BSE y Taller',
      articles: [
        {
          num: 'Art. 10°',
          title: 'Accidentes en la Vía Pública',
          text: 'En caso de siniestro con o sin lesionados, el conductor detendrá la marcha inmediatamente, prestará auxilio a las víctimas, comunicará por vía de urgencia al 911 / BSE (1998) y a la Jefatura de Turno.',
        },
        {
          num: 'Art. 11°',
          title: 'Averías Mecánicas en Ruta',
          text: 'Ante desperfecto que impida continuar la marcha con seguridad, se estacionará en lugar seguro con balizas encendidas y se emitirá de inmediato el reporte de auxilio al Taller de la División.',
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wider">
                Reglamento del Servicio Urbano
              </h2>
              <p className="text-xs text-slate-500">
                Estatuto Funcional y Normas Operativas de Salto
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar artículo o norma..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong className="font-semibold text-amber-800">Nota Informativa:</strong> Esta recopilación digital es para consulta rápida de los choferes y personal de taller. Recuerde que esta aplicación no es un canal oficial de la Intendencia de Salto.
          </p>
        </div>
      </div>

      {/* Chapters Accordion */}
      <div className="space-y-4">
        {capitulos.map((cap) => {
          const isOpen = openSections[cap.id];
          const filteredArticles = cap.articles.filter(
            (a) =>
              !searchTerm ||
              a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
              a.num.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (searchTerm && filteredArticles.length === 0) return null;

          return (
            <div
              key={cap.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleSection(cap.id)}
                className="w-full p-4 sm:p-5 flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/60 transition border-b border-slate-100 text-left"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{cap.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{cap.sub}</p>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-4 sm:p-5 space-y-3"
                  >
                    {filteredArticles.map((art) => (
                      <div
                        key={art.num}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {art.num}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs">{art.title}</h4>
                        </div>
                        <p className="text-slate-600 leading-relaxed font-medium pl-1">{art.text}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
