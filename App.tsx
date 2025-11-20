import React, { useState, useMemo } from 'react';
import { WarehouseScene } from './components/WarehouseScene';
import { InventoryTable } from './components/InventoryTable';
import { TARGET_ADDRESS, generateMockInventory, InventoryItem, SimulationStep, SimulationConfig, WAREHOUSE_CONFIG } from './types';
import { MapPin, Box, Truck, Info, Layout, Table as TableIcon, X, PackageOpen, Play, RotateCcw } from 'lucide-react';
import { Loader } from '@react-three/drei';

type Tab = '3d' | 'simulation' | 'table';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('3d');
  const [showLabels, setShowLabels] = useState(true);
  
  // Lift state up: Generate inventory once so both views share data
  const [inventory] = useState<InventoryItem[]>(() => generateMockInventory());
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Simulation State
  const [simStep, setSimStep] = useState<SimulationStep>('IDLE');
  const [simConfig, setSimConfig] = useState<SimulationConfig>({
    source: { s: 3, r: 2, l: 1, slot: 2 }, // Default to Target
    dest: { s: 1, r: 1, l: 1, slot: 1 } // Default to 1-1-1-1
  });

  const startSimulation = () => {
    if (simStep === 'IDLE') {
      setSimStep('MOVING_TO_SOURCE');
    }
  };

  const resetSimulation = () => {
    setSimStep('IDLE');
  };

  const handleSimInput = (type: 'source' | 'dest', field: string, value: number) => {
    setSimConfig(prev => ({
      ...prev,
      [type]: { ...prev[type], [field]: value }
    }));
  };

  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden font-sans text-white flex flex-col">
      
      {/* Navigation Tabs (Top Center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-800/90 backdrop-blur-md border border-gray-700 rounded-full p-1 flex gap-1 shadow-xl">
        <button
          onClick={() => setActiveTab('3d')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === '3d' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Layout className="w-4 h-4" />
          Croqui 3D
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === 'simulation' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Truck className="w-4 h-4" />
          Simulação
        </button>
        <button
          onClick={() => setActiveTab('table')}
          className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium transition-all ${
            activeTab === 'table' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          Estoque
        </button>
      </div>

      {/* Content Area */}
      <div className="relative w-full h-full">
        
        {/* 3D SCENE (Visible in both '3d' and 'simulation' tabs) */}
        {(activeTab === '3d' || activeTab === 'simulation') && (
          <>
            <div className="absolute inset-0 z-0">
              <WarehouseScene 
                showLabels={showLabels} 
                inventory={inventory} 
                onSelectSlot={setSelectedItem}
                simulationStep={simStep}
                simulationConfig={simConfig}
                setSimulationStep={setSimStep}
              />
            </div>

            {/* SIMULATION SIDEBAR PANEL (Only for 'simulation' tab) */}
            {activeTab === 'simulation' && (
              <div className="absolute top-20 left-6 z-10 max-w-sm w-full animate-in slide-in-from-left duration-300">
                <div className="bg-gray-800/90 backdrop-blur-md border border-gray-700 p-5 rounded-xl shadow-2xl">
                  <h1 className="text-xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Painel de Simulação
                  </h1>
                  
                  {/* Status Indicator */}
                  <div className="mb-4 bg-black/30 p-3 rounded border border-gray-600">
                    <span className="text-xs text-gray-400 uppercase font-bold">Status da Empilhadeira</span>
                    <div className="text-sm font-mono text-yellow-400 mt-1">
                      {simStep === 'IDLE' ? 'AGUARDANDO COMANDO' : simStep.replace(/_/g, ' ')}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* ORIGIN INPUTS */}
                    <div className="bg-gray-700/30 p-3 rounded border border-gray-600">
                      <h2 className="text-xs font-semibold text-red-400 uppercase mb-2 flex items-center gap-2">
                         Origem (Retirada)
                      </h2>
                      <div className="grid grid-cols-4 gap-2">
                         {['s','r','l','slot'].map((field, i) => (
                           <div key={`src-${field}`}>
                              <label className="text-[10px] text-gray-400 uppercase block">{['Rua','Pre','Niv','Apt'][i]}</label>
                              <input 
                                type="number" 
                                value={simConfig.source[field as keyof typeof simConfig.source]}
                                onChange={(e) => handleSimInput('source', field, parseInt(e.target.value))}
                                className="w-full bg-gray-800 border border-gray-600 rounded px-1 py-1 text-sm text-center focus:border-blue-500 outline-none"
                              />
                           </div>
                         ))}
                      </div>
                    </div>

                     {/* DESTINATION INPUTS */}
                    <div className="bg-gray-700/30 p-3 rounded border border-gray-600">
                      <h2 className="text-xs font-semibold text-green-400 uppercase mb-2 flex items-center gap-2">
                         Destino (Entrega)
                      </h2>
                      <div className="grid grid-cols-4 gap-2">
                         {['s','r','l','slot'].map((field, i) => (
                           <div key={`dest-${field}`}>
                              <label className="text-[10px] text-gray-400 uppercase block">{['Rua','Pre','Niv','Apt'][i]}</label>
                              <input 
                                type="number" 
                                value={simConfig.dest[field as keyof typeof simConfig.dest]}
                                onChange={(e) => handleSimInput('dest', field, parseInt(e.target.value))}
                                className="w-full bg-gray-800 border border-gray-600 rounded px-1 py-1 text-sm text-center focus:border-blue-500 outline-none"
                              />
                           </div>
                         ))}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2 mt-4">
                       <button 
                         onClick={startSimulation}
                         disabled={simStep !== 'IDLE'}
                         className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                       >
                         <Play className="w-4 h-4" /> Iniciar
                       </button>
                        <button 
                         onClick={resetSimulation}
                         className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                         title="Resetar Simulação"
                       >
                         <RotateCcw className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                  
                  {/* Info Overlay Content (Moved here) */}
                  <div className="mt-6 pt-4 border-t border-gray-600">
                    <div className="bg-gray-900/50 p-3 rounded border border-gray-700/50">
                        <h2 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-green-400" />
                        Endereço Alvo (Ref)
                        </h2>
                        <div className="grid grid-cols-4 gap-1 text-xs text-center">
                            <div className="bg-gray-800 p-1 rounded border border-gray-700">R:{TARGET_ADDRESS.street}</div>
                            <div className="bg-gray-800 p-1 rounded border border-gray-700">P:{TARGET_ADDRESS.rack}</div>
                            <div className="bg-gray-800 p-1 rounded border border-gray-700">N:{TARGET_ADDRESS.level}</div>
                            <div className="bg-gray-800 p-1 rounded border border-gray-700">A:{TARGET_ADDRESS.slot}</div>
                        </div>
                    </div>
                    <div className="mt-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={showLabels}
                                onChange={(e) => setShowLabels(e.target.checked)}
                                className="w-3 h-3 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700"
                            />
                            <span className="text-xs text-gray-400">Mostrar Etiquetas de Rua</span>
                        </label>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Legend (Visible in 3D views) */}
            <div className="absolute bottom-6 right-6 z-10 pointer-events-none">
              <div className="bg-gray-800/80 backdrop-blur p-4 rounded-lg shadow-lg pointer-events-auto border border-gray-700">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1">
                  <Info className="w-3 h-3" /> Legenda
                </h3>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-600 rounded-sm"></span>
                    <span>Central / Esc.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-sm"></span>
                    <span>Endereço Alvo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-yellow-700 rounded-sm"></span>
                    <span>Ocupado</span>
                  </li>
                   <li className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-600 rounded-sm border border-gray-400"></span>
                    <span>Vazio</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <Loader 
              containerStyles={{ backgroundColor: '#111827' }}
              innerStyles={{ backgroundColor: '#374151', height: '4px', width: '200px' }}
              barStyles={{ backgroundColor: '#60a5fa', height: '100%' }}
              dataStyles={{ color: '#9ca3af', fontFamily: 'sans-serif', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '1rem' }}
            />
          </>
        )}

        {/* TABLE VIEW */}
        {activeTab === 'table' && (
          <InventoryTable inventory={inventory} />
        )}

        {/* MODAL */}
        {selectedItem && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6 relative">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-xl ${selectedItem.isEmpty ? 'bg-gray-700 text-gray-400' : 'bg-blue-500/20 text-blue-400'}`}>
                     {selectedItem.isEmpty ? <PackageOpen className="w-8 h-8" /> : <Box className="w-8 h-8" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedItem.isEmpty ? 'Endereço Vazio' : selectedItem.description}
                    </h2>
                    <p className="text-sm text-gray-400 font-mono">
                      {selectedItem.productCode}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-xs text-gray-500 uppercase mb-1">Rua</div>
                        <div className="text-lg font-bold font-mono">{selectedItem.street}</div>
                      </div>
                       <div>
                        <div className="text-xs text-gray-500 uppercase mb-1">Prédio</div>
                        <div className="text-lg font-bold font-mono">{selectedItem.rack}</div>
                      </div>
                       <div>
                        <div className="text-xs text-gray-500 uppercase mb-1">Nível</div>
                        <div className="text-lg font-bold font-mono">{selectedItem.level}</div>
                      </div>
                       <div>
                        <div className="text-xs text-gray-500 uppercase mb-1">Apto</div>
                        <div className="text-lg font-bold font-mono">{selectedItem.slot}</div>
                      </div>
                   </div>

                   {!selectedItem.isEmpty && (
                     <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-lg border border-gray-700">
                       <span className="text-gray-400">Quantidade em Estoque</span>
                       <span className="text-2xl font-bold text-white">{selectedItem.qty}</span>
                     </div>
                   )}

                   {selectedItem.isTarget && (
                     <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-lg text-green-400 text-sm text-center font-medium">
                       Este é o endereço alvo da operação atual
                     </div>
                   )}
                </div>
              </div>
              <div className="bg-gray-900/50 p-4 text-center border-t border-gray-700">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-white text-sm font-medium"
                >
                  Fechar Detalhes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;