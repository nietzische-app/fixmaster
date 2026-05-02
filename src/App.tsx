import { useEffect, useReducer, useRef } from 'react';
import type { Device, PartId, PlayerState, RepairOutcome, SlotId, ToolId } from './types';
import { LayerManager } from './game/LayerManager';
import { GameResult } from './game/GameResult';
import { PlayerProgress, INITIAL_PLAYER } from './game/PlayerProgress';
import { HintSystem } from './game/HintSystem';
import { PARTS, TOOLS } from './data/catalog';
import { createSmartphone } from './data/devices/smartphone';

type DragPayload =
  | { kind: 'tool'; toolId: ToolId }
  | { kind: 'part'; partId: PartId; trayIndex: number };

interface State {
  device: Device;
  player: PlayerState;
  tray: PartId[];
  highlights: SlotId[];
  outcome: RepairOutcome | null;
  flash: 'success' | 'explosion' | null;
}

type Action =
  | { type: 'install'; slotId: SlotId; partId: PartId; trayIndex: number }
  | { type: 'remove'; slotId: SlotId; toolId: ToolId }
  | { type: 'power_on' }
  | { type: 'reset' }
  | { type: 'hint'; kind: 'xray' | 'glow' }
  | { type: 'clear_flash' };

function initialState(): State {
  const device = createSmartphone();
  const installed = new Set(
    Object.values(device.slots)
      .map((s) => s.installedPartId)
      .filter((x): x is PartId => x !== null),
  );
  const correctMissing = [...new Set(Object.values(device.slots).map((s) => s.acceptsPartId))]
    .filter((p) => !installed.has(p));
  return {
    device,
    player: INITIAL_PLAYER,
    tray: [...device.decoyParts, ...correctMissing],
    highlights: [],
    outcome: null,
    flash: null,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'install': {
      const lm = new LayerManager(state.device);
      const slot = lm.slot(action.slotId);
      if (!slot) return state;
      const r = lm.install(action.slotId, action.partId, slot.tool);
      if (!r.ok) return state;
      const tray = [...state.tray];
      tray.splice(action.trayIndex, 1);
      return { ...state, device: lm.snapshot(), tray, highlights: [] };
    }
    case 'remove': {
      const tool = TOOLS[action.toolId];
      if (!tool) return state;
      const lm = new LayerManager(state.device);
      const r = lm.remove(action.slotId, tool.kind);
      if (!r.ok || !r.removed) return state;
      return {
        ...state,
        device: lm.snapshot(),
        tray: [...state.tray, r.removed],
        highlights: [],
      };
    }
    case 'power_on': {
      const outcome = GameResult.powerOn(state.device);
      const player = PlayerProgress.apply(state.player, outcome, state.device.id);
      return {
        ...state,
        outcome,
        player,
        flash: outcome.kind === 'success' ? 'success' : 'explosion',
      };
    }
    case 'reset':
      return { ...initialState(), player: state.player };
    case 'hint': {
      const r = HintSystem.buy(state.player, action.kind, state.device);
      if (!r) return state;
      return { ...state, player: r.state, highlights: r.reveal.map((x) => x.slotId) };
    }
    case 'clear_flash':
      return { ...state, flash: null };
  }
}

const dragRef: { current: DragPayload | null } = { current: null };

export function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.flash) return;
    const t = window.setTimeout(() => dispatch({ type: 'clear_flash' }), 900);
    return () => window.clearTimeout(t);
  }, [state.flash]);

  const lm = new LayerManager(state.device);
  const accessibleIds = new Set(lm.accessibleSlots().map((s) => s.id));

  function onSlotDrop(slotId: SlotId) {
    const payload = dragRef.current;
    dragRef.current = null;
    if (!payload) return;
    if (payload.kind === 'tool') {
      dispatch({ type: 'remove', slotId, toolId: payload.toolId });
    } else {
      dispatch({ type: 'install', slotId, partId: payload.partId, trayIndex: payload.trayIndex });
    }
  }

  return (
    <div className={`app ${state.flash ?? ''}`}>
      <Hud
        player={state.player}
        onHint={(kind) => dispatch({ type: 'hint', kind })}
        onReset={() => dispatch({ type: 'reset' })}
      />

      <div className="canvas" ref={canvasRef}>
        <div className="phone-body">
          {Object.values(state.device.slots).map((slot) => {
            const layer = state.device.layers.find((l) => l.id === slot.layerId)!;
            const accessible = accessibleIds.has(slot.id);
            const installed = slot.installedPartId;
            const isHighlighted = state.highlights.includes(slot.id);
            return (
              <div
                key={slot.id}
                className={`slot layer-${layer.order} ${accessible ? 'open' : 'locked'} ${
                  isHighlighted ? 'glow' : ''
                } ${installed ? 'filled' : 'empty'}`}
                style={{ left: `${slot.position.x * 100}%`, top: `${slot.position.y * 100}%` }}
                onDragOver={(e) => {
                  if (accessible) e.preventDefault();
                }}
                onDrop={() => accessible && onSlotDrop(slot.id)}
                title={`${slot.id} • ${slot.tool}`}
              >
                <span className="slot-icon">{installed ? PARTS[installed].icon : '·'}</span>
                <span className="slot-label">{installed ? PARTS[installed].name : 'boş'}</span>
              </div>
            );
          })}
        </div>

        <PartTray
          parts={state.tray}
          onDragStart={(partId, trayIndex) => {
            dragRef.current = { kind: 'part', partId, trayIndex };
          }}
        />
      </div>

      <ToolBelt
        owned={state.player.ownedTools}
        onDragStart={(toolId) => {
          dragRef.current = { kind: 'tool', toolId };
        }}
      />

      <button
        className="power"
        onClick={() => dispatch({ type: 'power_on' })}
        disabled={state.flash !== null}
      >
        ⏻ GÜÇ
      </button>

      {state.outcome && <OutcomeBanner outcome={state.outcome} onClose={() => dispatch({ type: 'reset' })} />}
    </div>
  );
}

function Hud(props: {
  player: PlayerState;
  onHint: (kind: 'xray' | 'glow') => void;
  onReset: () => void;
}) {
  const { player } = props;
  return (
    <header className="hud">
      <div className="hud-rank">
        <span className="badge">{player.rank}</span>
        <span className="xp">{player.xp} XP</span>
      </div>
      <div className="hud-money">₺ {player.money}</div>
      <div className="hud-hints">
        <button onClick={() => props.onHint('glow')} title="Doğru parçayı parlat (₺20)">💡</button>
        <button onClick={() => props.onHint('xray')} title="X-Ray (₺50)">🩻</button>
        <button onClick={props.onReset} title="Sıfırla">↺</button>
      </div>
    </header>
  );
}

function PartTray(props: {
  parts: PartId[];
  onDragStart: (partId: PartId, trayIndex: number) => void;
}) {
  return (
    <aside className="tray">
      <div className="tray-title">Parça Kutusu</div>
      <div className="tray-items">
        {props.parts.map((id, idx) => (
          <div
            key={`${id}-${idx}`}
            className="tray-item"
            draggable
            onDragStart={() => props.onDragStart(id, idx)}
            title={PARTS[id].name}
          >
            <span className="tray-icon">{PARTS[id].icon}</span>
            <span className="tray-name">{PARTS[id].name}</span>
          </div>
        ))}
        {props.parts.length === 0 && <div className="tray-empty">boş</div>}
      </div>
    </aside>
  );
}

function ToolBelt(props: { owned: ToolId[]; onDragStart: (id: ToolId) => void }) {
  return (
    <footer className="belt">
      {props.owned.map((id) => {
        const tool = TOOLS[id];
        if (!tool) return null;
        return (
          <div
            key={id}
            className="tool"
            draggable
            onDragStart={() => props.onDragStart(id)}
            title={tool.name}
          >
            <span className="tool-icon">{tool.icon}</span>
            <span className="tool-name">{tool.name}</span>
          </div>
        );
      })}
    </footer>
  );
}

function OutcomeBanner(props: { outcome: RepairOutcome; onClose: () => void }) {
  const { outcome } = props;
  if (outcome.kind === 'success') {
    return (
      <div className="banner success">
        <h2>BAŞARILI</h2>
        <p>+{outcome.reward.xp} XP · +₺{outcome.reward.money}</p>
        <button onClick={props.onClose}>Devam</button>
      </div>
    );
  }
  return (
    <div className="banner explosion">
      <h2>💥 PATLAMA</h2>
      <ul>
        {outcome.faults.map((f, i) => (
          <li key={i}>
            {f.type === 'missing_part'
              ? `${f.slotId}: eksik (${PARTS[f.expected].name})`
              : `${f.slotId}: yanlış parça (${PARTS[f.got].name} ≠ ${PARTS[f.expected].name})`}
          </li>
        ))}
      </ul>
      <button onClick={props.onClose}>Yeniden Dene</button>
    </div>
  );
}
