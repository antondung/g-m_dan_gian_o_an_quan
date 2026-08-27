// MULTIPLAYER & RANKED MATCHMAKING SYSTEM (P2P / CROSS-TAB / BROADCASTCHANNEL)

export type RankTier = 'Tập Sự' | 'Dân Binh' | 'Hiệp Khách' | 'Tiên Phong' | 'Thống Lĩnh' | 'Đại Thành Chủ';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  tier: RankTier;
  lp: number;
  wins: number;
  losses: number;
  winRate: number;
  avatarIcon: string;
}

export interface PlayerRankProfile {
  lp: number;
  tier: RankTier;
  wins: number;
  losses: number;
}

export interface NetworkMessage {
  type: 'ROOM_CREATE' | 'ROOM_JOIN' | 'ROOM_JOINED' | 'ROOM_START' | 'GAME_MOVE' | 'GAME_TACTIC' | 'GAME_UPGRADE' | 'GAME_RESILIENCE' | 'GAME_SURRENDER' | 'MATCHMAKING_SEARCH';
  roomCode: string;
  senderName: string;
  senderRank: RankTier;
  payload?: any;
}

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Trần Hưng Đạo', tier: 'Đại Thành Chủ', lp: 2850, wins: 142, losses: 12, winRate: 92, avatarIcon: '👑' },
  { rank: 2, name: 'Lê Lợi', tier: 'Đại Thành Chủ', lp: 2680, wins: 128, losses: 18, winRate: 88, avatarIcon: '⚔️' },
  { rank: 3, name: 'Quang Trung', tier: 'Đại Thành Chủ', lp: 2540, wins: 115, losses: 14, winRate: 89, avatarIcon: '🔥' },
  { rank: 4, name: 'Lý Thường Kiệt', tier: 'Thống Lĩnh', lp: 1980, wins: 95, losses: 21, winRate: 82, avatarIcon: '🛡️' },
  { rank: 5, name: 'Ngô Quyền', tier: 'Thống Lĩnh', lp: 1850, wins: 88, losses: 24, winRate: 79, avatarIcon: '🌊' },
  { rank: 6, name: 'Đinh Bộ Lĩnh', tier: 'Tiên Phong', lp: 1420, wins: 72, losses: 26, winRate: 73, avatarIcon: '🚩' },
  { rank: 7, name: 'Phan Đình Giót', tier: 'Tiên Phong', lp: 1210, wins: 61, losses: 29, winRate: 68, avatarIcon: '💥' },
  { rank: 8, name: 'Yết Kiêu', tier: 'Hiệp Khách', lp: 920, wins: 48, losses: 22, winRate: 69, avatarIcon: '⚡' },
];

export function getRankTier(lp: number): RankTier {
  if (lp >= 2200) return 'Đại Thành Chủ';
  if (lp >= 1600) return 'Thống Lĩnh';
  if (lp >= 1000) return 'Tiên Phong';
  if (lp >= 500) return 'Hiệp Khách';
  if (lp >= 200) return 'Dân Binh';
  return 'Tập Sự';
}

export function getRankColor(tier: RankTier): string {
  switch (tier) {
    case 'Đại Thành Chủ': return '#ffd700';
    case 'Thống Lĩnh': return '#ff4d4f';
    case 'Tiên Phong': return '#b37feb';
    case 'Hiệp Khách': return '#1890ff';
    case 'Dân Binh': return '#52c41a';
    default: return '#8c8c8c';
  }
}

export class MultiplayerNetwork {
  private channel: BroadcastChannel | null = null;
  private onMessageCallback: ((msg: NetworkMessage) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('oquan_pvp_channel');
      this.channel.onmessage = (event) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(event.data);
        }
      };
    }
  }

  public setListener(callback: (msg: NetworkMessage) => void) {
    this.onMessageCallback = callback;
  }

  public broadcast(msg: NetworkMessage) {
    if (this.channel) {
      this.channel.postMessage(msg);
    }
    // Also save active room to localStorage for discovery
    if (msg.type === 'ROOM_CREATE') {
      localStorage.setItem(`oquan_room_${msg.roomCode}`, JSON.stringify({
        roomCode: msg.roomCode,
        hostName: msg.senderName,
        hostRank: msg.senderRank,
        createdAt: Date.now()
      }));
    }
  }

  // Generate 6-digit room code (000000 - 999999)
  public static generateRoomCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public static checkRoomExists(code: string): { hostName: string; hostRank: RankTier } | null {
    const raw = localStorage.getItem(`oquan_room_${code}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static getPlayerProfile(): PlayerRankProfile {
    const raw = localStorage.getItem('oquan_player_rank');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return { lp: 350, tier: 'Hiệp Khách', wins: 14, losses: 6 };
  }

  public static updatePlayerRank(won: boolean): { profile: PlayerRankProfile; lpChange: number } {
    const current = this.getPlayerProfile();
    const lpChange = won ? 25 : -15;
    const newLp = Math.max(0, current.lp + lpChange);
    const newTier = getRankTier(newLp);
    const newProfile: PlayerRankProfile = {
      lp: newLp,
      tier: newTier,
      wins: current.wins + (won ? 1 : 0),
      losses: current.losses + (won ? 0 : 1)
    };
    localStorage.setItem('oquan_player_rank', JSON.stringify(newProfile));
    return { profile: newProfile, lpChange };
  }

  public static getLeaderboard(playerName: string): LeaderboardEntry[] {
    const myProfile = this.getPlayerProfile();
    const totalGames = myProfile.wins + myProfile.losses;
    const winRate = totalGames > 0 ? Math.round((myProfile.wins / totalGames) * 100) : 0;
    
    const myEntry: LeaderboardEntry = {
      rank: 9,
      name: playerName || 'Bạn (Thành Chủ)',
      tier: myProfile.tier,
      lp: myProfile.lp,
      wins: myProfile.wins,
      losses: myProfile.losses,
      winRate,
      avatarIcon: '⭐'
    };

    const combined = [...DEFAULT_LEADERBOARD, myEntry].sort((a, b) => b.lp - a.lp);
    return combined.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }
}

export const networkManager = new MultiplayerNetwork();
