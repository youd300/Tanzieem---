import React, { useState } from 'react';
import {
  Sparkles,
  Coins,
  Check,
  Lock,
  Moon,
  Sun,
  Palette,
  ShoppingBag,
  Info,
} from 'lucide-react';
import { RoomItem, UserProfile, AppLanguage } from '../types';
import { TRANSLATIONS } from '../services/i18n';
import { dataService } from '../services/dataService';
import { soundEngine } from '../services/soundEngine';
import { CompanionAvatar } from './CompanionAvatar';

interface SanctuaryRoomViewProps {
  user: UserProfile;
  lang: AppLanguage;
  onRefreshUser: () => void;
}

export const SanctuaryRoomView: React.FC<SanctuaryRoomViewProps> = ({
  user,
  lang,
  onRefreshUser,
}) => {
  const t = TRANSLATIONS[lang];
  const [items, setItems] = useState<RoomItem[]>(() => dataService.getRoomItems());
  const [activeTab, setActiveTab] = useState<'room' | 'store'>('room');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [purchaseFeedback, setPurchaseFeedback] = useState<string | null>(null);

  const reloadItems = () => {
    setItems([...dataService.getRoomItems()]);
    onRefreshUser();
  };

  const handleBuy = (item: RoomItem) => {
    soundEngine.playClick();
    const result = dataService.buyRoomItem(item.id);
    if (result.success) {
      soundEngine.playCoin();
      setPurchaseFeedback(result.message);
      reloadItems();
      setTimeout(() => setPurchaseFeedback(null), 3000);
    } else {
      setPurchaseFeedback(result.message);
      setTimeout(() => setPurchaseFeedback(null), 3000);
    }
  };

  const handleToggleEquip = (itemId: string) => {
    soundEngine.playClick();
    dataService.toggleEquipRoomItem(itemId);
    reloadItems();
  };

  const equippedItems = items.filter((i) => i.equipped);

  return (
    <div id="sanctuary-room-view" className="space-y-4 pb-20">
      {/* Header Tabs: Virtual Sanctuary vs Store */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('room');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'room'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            {t.virtualRoom}
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('store');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              activeTab === 'store'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t.inventoryShop}</span>
          </button>
        </div>

        {/* Current Coins display */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold text-xs font-tabular">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>{user.coins} Coins</span>
        </div>
      </div>

      {purchaseFeedback && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-cyan-300 text-xs font-bold text-center animate-in fade-in">
          {purchaseFeedback}
        </div>
      )}

      {/* Main Room View Mode (Screenshot 5 visual) */}
      {activeTab === 'room' && (
        <div className="space-y-4">
          {/* Layered Room Stage */}
          <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden glass-panel-glow border-cyan-500/30 p-4 flex flex-col justify-between">
            {/* Background Night Sky with Starry Moon Portal Window */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#060913] via-[#0b1224] to-[#080d1a] pointer-events-none" />

            {/* Glowing Stars */}
            <div className="absolute inset-0 opacity-60 pointer-events-none">
              <div className="absolute top-8 left-16 w-1 h-1 bg-white rounded-full animate-ping" />
              <div className="absolute top-14 right-28 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse" />
              <div className="absolute top-24 left-1/3 w-1 h-1 bg-violet-300 rounded-full" />
              <div className="absolute top-10 right-1/4 w-2 h-2 bg-blue-200 rounded-full blur-[1px]" />
            </div>

            {/* Panoramic Starry Moon Portal (Screenshot 5) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-cyan-500/30 bg-gradient-to-b from-indigo-950/70 to-slate-950/90 overflow-hidden flex items-center justify-center shadow-[0_0_35px_rgba(0,229,255,0.2)] pointer-events-none">
              {/* Crescent glowing moon */}
              <div className="absolute top-6 right-10 w-14 h-14 rounded-full bg-cyan-200/90 shadow-[0_0_20px_#00E5FF]" />
              <div className="absolute top-5 right-7 w-13 h-13 rounded-full bg-slate-950/90" />
              <div className="absolute bottom-2 text-[10px] tracking-widest text-cyan-400/60 uppercase font-mono">
                DEEP FLOW SECTOR
              </div>
            </div>

            {/* Room Architecture Elements */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/80 border border-cyan-500/30 text-cyan-300">
                Neo’s Sanctuary Room
              </span>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Night Flow Mode</span>
              </div>
            </div>

            {/* Center Stage: Companion on Cozy Floor Cushion + Cyber Desk */}
            <div className="relative z-10 flex items-end justify-center gap-6 pb-2">
              {/* Desk & Tech setup */}
              <div className="hidden sm:flex flex-col items-center">
                <div className="w-28 h-16 rounded-xl bg-slate-900/90 border border-cyan-500/40 p-2 shadow-lg flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-cyan-400">FOCUS CLOCK</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-center font-tabular text-cyan-300 font-extrabold text-sm tracking-wider">
                    25:00
                  </div>
                </div>
                <div className="w-36 h-2 bg-slate-800 rounded-full mt-1" />
              </div>

              {/* Neo the Cosmic Fox Companion sitting comfortably (Screenshot 5) */}
              <div className="flex flex-col items-center">
                <CompanionAvatar size={160} mood="focus" withGlow={true} />
                <div className="mt-1 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-400/40 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{user.companionName} is chilling in deep focus</span>
                </div>
              </div>

              {/* Ambient Lamp & Plant */}
              <div className="hidden sm:flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-cyan-400/20 border border-cyan-400/60 blur-[1px] animate-pulse flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-cyan-300" />
                </div>
                <div className="w-1.5 h-16 bg-slate-700" />
                <div className="w-8 h-2 bg-slate-800 rounded-full" />
              </div>
            </div>

            {/* Room Floor reflection */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent border-t border-cyan-500/10 pointer-events-none" />
          </div>

          {/* Equipped Sanctuary Items Inventory */}
          <div className="glass-panel rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Equipped Sanctuary Furnishings ({equippedItems.length})</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {items
                .filter((i) => i.owned)
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleEquip(item.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      item.equipped
                        ? 'bg-cyan-950/30 border-cyan-400/40 text-slate-100 shadow-[0_0_10px_rgba(0,229,255,0.15)]'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-cyan-400">
                        {item.category}
                      </span>
                      {item.equipped && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold truncate">{item.nameEn}</p>
                      <p className="text-[10px] text-slate-400 truncate">{item.descriptionEn}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-cyan-300">
                      {item.equipped ? 'Equipped' : 'Click to Equip'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Item Store Mode */}
      {activeTab === 'store' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl p-4 flex items-center justify-between border-amber-500/20">
            <div>
              <h3 className="text-sm font-bold text-amber-200">Tanzieem Sanctuary Store</h3>
              <p className="text-xs text-slate-400">
                Unlock handcrafted aesthetic room items using coins earned through deep work.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-extrabold text-sm font-tabular">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{user.coins}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item) => {
              const canAfford = user.coins >= item.cost;

              return (
                <div
                  key={item.id}
                  className="glass-panel rounded-2xl p-4 border-slate-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-800 text-slate-300">
                        {item.category}
                      </span>
                      {item.owned ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Owned</span>
                        </span>
                      ) : (
                        <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1 font-tabular">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>{item.cost} Coins</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-100">{item.nameEn}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    {item.owned ? (
                      <button
                        onClick={() => handleToggleEquip(item.id)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                          item.equipped
                            ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {item.equipped ? 'Currently Displayed in Sanctuary' : 'Equip in Sanctuary'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!canAfford}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:opacity-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? (
                          <>
                            <Coins className="w-3.5 h-3.5" />
                            <span>Unlock for {item.cost} Coins</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Need {item.cost - user.coins} more coins</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
