export type TerritoryKind = 'farm' | 'forest' | 'workshop' | 'barracks' | 'tower';
export type Doctrine = 'thuy_tran' | 'thao_thiet' | 'nong_binh';
export type BuildingBranch = 'eco' | 'military';

export interface UpgradedCell {
  id: number;
  soldiers: number;
  building: TerritoryKind;
  owner: 'player' | 'enemy' | 'neutral';
  stars: 1 | 2 | 3;
  branch?: BuildingBranch;
  spies: number; // Quân nội gián gài trong ô (của đối phương)
}

export interface TacticalTrap {
  tileId: number;
  placedBy: 'player' | 'enemy';
  durationTurns: number;
}

export interface GameSystemsState {
  momentum: { player: number; enemy: number }; // Điểm Thế Khí
  selectedDoctrine: { player?: Doctrine; enemy?: Doctrine };
  traps: TacticalTrap[];
  resilienceUsed: { player: boolean; enemy: boolean }; // Cơ chế Toàn Dân Kháng Chiến (1 lần duy nhất)
  citadelGateLockdown: { player: boolean; enemy: boolean }; // Bị Hãm Thành khi 2 cửa ngõ trống
}
