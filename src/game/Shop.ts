import type { PlayerState, Tool, ToolId } from '../types';

export class Shop {
  static buy(state: PlayerState, tool: Tool): PlayerState | null {
    if (state.ownedTools.includes(tool.id)) return null;
    if (state.money < tool.price) return null;
    return {
      ...state,
      money: state.money - tool.price,
      ownedTools: [...state.ownedTools, tool.id],
    };
  }

  static owns(state: PlayerState, toolId: ToolId): boolean {
    return state.ownedTools.includes(toolId);
  }
}
