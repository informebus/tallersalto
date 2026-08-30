import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from './firebase';
import firebase from './firebase';
import { 
  AuxilioItem, 
  CambioTurnoItem,
  CodigoItem, 
  ComunicadoItem, 
  CorteItem, 
  HorarioItem, 
  ObjetoPerdidoItem,
  PerfilItem, 
  PlanillaItem, 
  SectionTab, 
  TareaItem 
} from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { DriversView } from './components/views/DriversView';
import { SchedulesView } from './components/views/SchedulesView';
import { DirectoryView } from './components/views/DirectoryView';
import { ProfileView } from './components/views/ProfileView';
import { WorkshopView } from './components/views/WorkshopView';
import { ObjetosPerdidosView } from './components/views/ObjetosPerdidosView';
import { CambiosTurnoView } from './components/views/CambiosTurnoView';
import { ImageViewerModal } from './components/ImageViewerModal';
import { PinPromptModal } from './components/PinPromptModal';
import { MinigameModal } from './components/MinigameModal';
import { ReportBreakdownModal } from './components/ReportBreakdownModal';
import { DynamicBackground } from './components/DynamicBackground';

import { SaltoLogo } from './components/SaltoLogo';
import { AlertTriangle, Info } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<SectionTab>('tablero');

  // Realtime Database state
  const [auxilios, setAuxilios] = useState<Record<string, AuxilioItem>>({});
  const [comunicados, setComunicados] = useState<Record<string, ComunicadoItem>>({});
  const [cortes, setCortes] = useState<Record<string, CorteItem>>({});
  const [tareas, setTareas] = useState<Record<string, TareaItem>>({});
  const [horarios, setHorarios] = useState<Record<string, HorarioItem>>({});
  const [codigos, setCodigos] = useState<CodigoItem | null>(null);
  const [planilla, setPlanilla] = useState<PlanillaItem | null>(null);
  const [perfiles, setPerfiles] = useState<Record<string, PerfilItem>>({});
  const [objetosPerdidos, setObjetosPerdidos] = useState<Record<string, ObjetoPerdidoItem>>({});
  const [cambiosTurno, setCambiosTurno] = useState<Record<string, CambioTurnoItem>>({});

  // Modals & Overlays state
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [isMinigameOpen, setIsMinigameOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  
  // PIN Verification Modal
  const [pinModalConfig, setPinModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description?: string;
    expectedPin?: string;
    onSuccess: () => void;
  }>({
    isOpen: false,
    title: '',
    onSuccess: () => {},
  });

  // Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // Firebase Realtime DB listeners
  useEffect(() => {
    if (!user) return;

    const refAux = db.ref('auxilios');
    const refCom = db.ref('comunicados');
    const refCor = db.ref('cortes');
    const refTar = db.ref('tareas');
    const refHor = db.ref('horarios');
    const refCod = db.ref('codigos');
    const refPla = db.ref('planillas');
    const refPer = db.ref('perfiles');
    const refObj = db.ref('objetos_perdidos');
    const refCam = db.ref('cambios_turno');

    refAux.on('value', (s) => setAuxilios(s.val() || {}));
    refCom.on('value', (s) => setComunicados(s.val() || {}));
    refCor.on('value', (s) => setCortes(s.val() || {}));
    refTar.on('value', (s) => setTareas(s.val() || {}));
    refHor.on('value', (s) => setHorarios(s.val() || {}));
    refCod.on('value', (s) => setCodigos(s.val() || null));
    refPla.on('value', (s) => setPlanilla(s.val() || null));
    refPer.on('value', (s) => setPerfiles(s.val() || {}));
    refObj.on('value', (s) => setObjetosPerdidos(s.val() || {}));
    refCam.on('value', (s) => setCambiosTurno(s.val() || {}));

    return () => {
      refAux.off();
      refCom.off();
      refCor.off();
      refTar.off();
      refHor.off();
      refCod.off();
      refPla.off();
      refPer.off();
      refObj.off();
      refCam.off();
    };
  }, [user]);

  const handleRequestPin = (
    title: string,
    pin: string,
    onSuccess: () => void,
    description = 'Ingrese la clave de seguridad autorizada para confirmar.'
  ) => {
    setPinModalConfig({
      isOpen: true,
      title,
      expectedPin: pin,
      description,
      onSuccess: () => {
        setPinModalConfig((p) => ({ ...p, isOpen: false }));
        onSuccess();
      },
    });
  };

  const handleSelectTab = (tab: SectionTab) => {
    if (tab === 'taller') {
      handleRequestPin(
        'Acceso al Panel de Taller',
        '0987',
        () => setActiveTab('taller'),
        'Ingrese la clave del taller mecánico para acceder.'
      );
    } else {
      setActiveTab(tab);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('¿Está seguro de que desea cerrar la sesión?')) {
      await auth.signOut();
      setActiveTab('tablero');
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#0d4e83] p-1 border border-sky-500/30 flex items-center justify-center shadow-lg animate-pulse">
          <SaltoLogo className="w-full h-full" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Cargando División Ómnibus...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white relative">
      {/* Dynamic Background Wallpaper Slider */}
      <DynamicBackground />

      {/* App Header */}
      <Header
        user={user}
        onOpenMinigame={() => setIsMinigameOpen(true)}
        onOpenProfile={() => setActiveTab('perfil')}
        onOpenBreakdown={() => setIsBreakdownOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-24 md:pb-6 relative z-10">
        {!user ? (
          <LoginView />
        ) : (
          <div>
            {/* Nav Tabs */}
            <Navigation
              currentTab={activeTab}
              onSelectTab={handleSelectTab}
              auxiliosCount={Object.keys(auxilios || {}).length}
              cambiosCount={Object.values(cambiosTurno || {}).filter((c: CambioTurnoItem) => c && c.estado === 'Pendiente').length}
              objetosCount={Object.values(objetosPerdidos || {}).filter((o: ObjetoPerdidoItem) => o && o.estado === 'Retenido').length}
            />

            {/* View Switcher with Motion */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === 'tablero' && (
                  <DashboardView
                    auxilios={auxilios}
                    comunicados={comunicados}
                    cortes={cortes}
                    tareas={tareas}
                    planilla={planilla}
                    currentUserEmail={user.email || ''}
                    onOpenImage={(src) => setLightboxSrc(src)}
                    onRequestPin={handleRequestPin}
                    onOpenBreakdownModal={() => setIsBreakdownOpen(true)}
                  />
                )}

                {activeTab === 'conductores' && (
                  <DriversView
                    currentUserEmail={user.email || ''}
                    onOpenBreakdownModal={() => setIsBreakdownOpen(true)}
                  />
                )}

                {activeTab === 'cambios_turno' && (
                  <CambiosTurnoView
                    cambios={cambiosTurno}
                    currentUserEmail={user.email || ''}
                  />
                )}

                {activeTab === 'objetos_perdidos' && (
                  <ObjetosPerdidosView
                    objetos={objetosPerdidos}
                    currentUserEmail={user.email || ''}
                    onOpenImage={(src) => setLightboxSrc(src)}
                  />
                )}

                {activeTab === 'horarios' && (
                  <SchedulesView
                    horarios={horarios}
                    codigos={codigos}
                    onOpenImage={(src) => setLightboxSrc(src)}
                    onRequestPin={handleRequestPin}
                  />
                )}

                {activeTab === 'directorio' && (
                  <DirectoryView
                    perfiles={perfiles}
                    onOpenImage={(src) => setLightboxSrc(src)}
                    onGoToProfile={() => setActiveTab('perfil')}
                  />
                )}

                {activeTab === 'perfil' && (
                  <ProfileView
                    user={user}
                    onOpenImage={(src) => setLightboxSrc(src)}
                    onBackToDirectory={() => setActiveTab('directorio')}
                  />
                )}

                {activeTab === 'taller' && (
                  <WorkshopView
                    tareas={tareas}
                    auxilios={auxilios}
                    onOpenImage={(src) => setLightboxSrc(src)}
                    onRequestPin={handleRequestPin}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer with Unofficial App Disclaimer */}
      <footer className="mt-8 border-t border-slate-800 bg-slate-950/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-5 h-5 rounded overflow-hidden shrink-0">
              <SaltoLogo className="w-full h-full" />
            </div>
            <span className="font-semibold text-slate-300">División Ómnibus Salto</span>
          </div>

          <p className="text-[11px] text-slate-400 max-w-xl text-center sm:text-right leading-relaxed">
            <span className="font-semibold text-amber-400/90">Aviso:</span> Esta no es una aplicación oficial de la Intendencia de Salto. Es una herramienta colaborativa de apoyo operativo desarrollada para el personal.
          </p>
        </div>
      </footer>

      {/* Global Image Viewer Lightbox */}
      <ImageViewerModal
        src={lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />

      {/* PIN Authorization Modal */}
      <PinPromptModal
        isOpen={pinModalConfig.isOpen}
        title={pinModalConfig.title}
        description={pinModalConfig.description}
        expectedPin={pinModalConfig.expectedPin}
        onSuccess={pinModalConfig.onSuccess}
        onCancel={() => setPinModalConfig((p) => ({ ...p, isOpen: false }))}
      />

      {/* Easter Egg Minigame Modal */}
      <MinigameModal
        isOpen={isMinigameOpen}
        onClose={() => setIsMinigameOpen(false)}
      />

      {/* Immediate Breakdown Reporter SOS Modal */}
      <ReportBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        defaultDriver={user?.email ? user.email.split('@')[0] : ''}
      />
    </div>
  );
}
