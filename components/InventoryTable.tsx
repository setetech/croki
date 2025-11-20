import React from 'react';
import { InventoryItem } from '../types';
import { Search, Package } from 'lucide-react';

interface Props {
  inventory: InventoryItem[];
}

export const InventoryTable: React.FC<Props> = ({ inventory }) => {
  return (
    <div className="w-full h-full bg-gray-900 p-6 overflow-hidden flex flex-col text-gray-100 pt-20">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-blue-400">
            <Package className="w-6 h-6" />
            Estoque Geral
          </h2>
          <p className="text-gray-400 text-sm">Relatório completo de posições e produtos</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-gray-400">
           <Search className="w-4 h-4" />
           <span>{inventory.length} posições totais</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-800/50 border border-gray-700 rounded-xl shadow-inner">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-800 sticky top-0 z-10 shadow-md">
            <tr>
              <th className="p-4 font-semibold text-gray-400 border-b border-gray-700">Rua</th>
              <th className="p-4 font-semibold text-gray-400 border-b border-gray-700">Prédio</th>
              <th className="p-4 font-semibold text-gray-400 border-b border-gray-700">Nível</th>
              <th className="p-4 font-semibold text-gray-400 border-b border-gray-700">Apto</th>
              <th className="p-4 font-semibold text-gray-400 border-b border-gray-700">Cód. Produto</th>
              <th className="p-4 font-semibold text-gray-400 border-b border-gray-700">Descrição</th>
              <th className="p-4 font-semibold text-gray-400 border-b border-gray-700 text-right">Qtde</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-700/50">
            {inventory.map((item) => (
              <tr 
                key={item.id} 
                className={`hover:bg-gray-700/50 transition-colors ${item.isTarget ? 'bg-green-900/30 border-l-4 border-green-500' : (item.isEmpty ? 'text-gray-500' : '')}`}
              >
                <td className="p-4 font-mono">{item.street}</td>
                <td className="p-4 font-mono">{item.rack}</td>
                <td className="p-4 font-mono">{item.level}</td>
                <td className="p-4 font-mono">{item.slot}</td>
                <td className={`p-4 font-bold ${item.isTarget ? 'text-green-400' : (item.isEmpty ? 'text-gray-600' : 'text-blue-300')}`}>
                  {item.productCode}
                </td>
                <td className="p-4">{item.description}</td>
                <td className="p-4 text-right font-mono">{item.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};