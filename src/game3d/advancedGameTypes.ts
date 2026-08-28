export type TerritoryKind = 'farm' | 'forest' | 'workshop' | 'barracks' | 'tower';
export type Doctrine = 'thuy_tran' | 'thao_thiet' | 'nong_binh';
export type BuildingBranch = 'eco' | 'military';

export type HeroId = 'tran_hung_dao' | 'quang_trung' | 'hai_ba_trung' | 'ly_thuong_kiet';
export type ArtifactId = 'trong_dong' | 'no_than' | 'thuan_thien_kiem' | 'non_ba_tam' | 'gom_chu_dau';
export type WeatherType = 'clear' | 'flood' | 'fog' | 'drought' | 'gale';

export interface HeroDefinition {
  id: HeroId;
  name: string;
  title: string;
  avatar: string;
  quote: string;
  passiveName: string;
  passiveDesc: string;
  skillName: string;
  skillCost: number; // Tiêu hao Thế Khí
  skillCooldown: number; // Số lượt chờ
  skillIcon: string;
  skillDesc: string;
}

export interface ArtifactDefinition {
  id: ArtifactId;
  name: string;
  icon: string;
  rarity: 'epic' | 'legendary' | 'mythic';
  tagline: string;
  desc: string;
  statBonus: string;
}

export interface WeatherEffect {
  type: WeatherType;
  name: string;
  icon: string;
  durationTurns: number;
  desc: string;
  colorFilter: string;
  ambientModifier: number;
}

export interface PuzzleObjective {
  type: 'capture_quantities' | 'reach_food' | 'destroy_citadel' | 'wipe_enemy_cells';
  target: number;
  label: string;
}

export interface PuzzleLevel {
  id: number;
  title: string;
  historicalRef: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'master';
  maxTurns: number;
  dialogue: string;
  initialBoard: {
    soldiers: number[]; // 10 ô dân
    quanL: number; // Ô Quan Trái
    quanR: number; // Ô Quan Phải
    buildings?: TerritoryKind[];
  };
  playerHp: number;
  enemyHp: number;
  resources: { food: number; wood: number; stone: number };
  objective: PuzzleObjective;
  tip: string;
}

export interface CampaignStage {
  id: string;
  chapter: number;
  year: string;
  title: string;
  location: string;
  enemyName: string;
  enemyHero: string;
  enemyAvatar: string;
  weather: WeatherType;
  storyIntro: string;
  victorySpeech: string;
  defeatSpeech: string;
  aiAggressiveness: 'balanced' | 'aggressive' | 'economic' | 'tactical';
  playerBaseHp: number;
  enemyBaseHp: number;
  initialResources: { food: number; wood: number; stone: number };
  firstMove: 'player' | 'enemy';
  rewardLp: number;
  unlockArtifact?: ArtifactId;
}

export interface UpgradedCell {
  id: number;
  soldiers: number;
  building: TerritoryKind;
  owner: 'player' | 'enemy' | 'neutral';
  stars: 1 | 2 | 3;
  branch?: BuildingBranch;
  spies: number; // Quân nội gián gài trong ô (của đối phương)
  shieldTurns?: number; // Số lượt ô này được bảo vệ bởi khiên danh tướng
}

export interface TacticalTrap {
  tileId: number;
  placedBy: 'player' | 'enemy';
  durationTurns: number;
}

export interface HeroSkillState {
  cooldown: number; // Số lượt còn lại trước khi hồi chiêu
  shieldedTileId: number | null; // Ô đang có khiên bảo hộ
  shieldRemainingTurns: number;
  extraTurnPending: boolean; // Kích hoạt lượt rải nối tiếp
  reverseNextEnemyTurn: boolean; // Đảo chiều đối phương
}

export interface GameSystemsState {
  momentum: { player: number; enemy: number }; // Điểm Thế Khí
  selectedDoctrine: { player?: Doctrine; enemy?: Doctrine };
  selectedHero: { player: HeroId; enemy: HeroId };
  equippedArtifacts: { player: ArtifactId[]; enemy: ArtifactId[] };
  currentWeather: WeatherEffect;
  weatherTurnsRemaining: number;
  heroSkillState: { player: HeroSkillState; enemy: HeroSkillState };
  traps: TacticalTrap[];
  resilienceUsed: { player: boolean; enemy: boolean }; // Cơ chế Toàn Dân Kháng Chiến (1 lần duy nhất)
  citadelGateLockdown: { player: boolean; enemy: boolean }; // Bị Hãm Thành khi 2 cửa ngõ trống
}
