import { TerritoryKind, Doctrine, BuildingBranch, TacticalTrap, UpgradedCell } from './advancedGameTypes';

export interface CommandDefinition {
  id: string;
  name: string;
  cost: number;
  icon: string;
  desc: string;
  tier: 1 | 2 | 3;
}

export const TACTICAL_COMMANDS: CommandDefinition[] = [
  {
    id: 'reverse_flow',
    name: 'Bẻ Chiều Cờ',
    cost: 2,
    icon: '🔄',
    desc: 'Đảo ngược chiều rải ngay giữa lượt kế tiếp.',
    tier: 1,
  },
  {
    id: 'recruit_troop',
    name: 'Điểm Binh',
    cost: 2,
    icon: '🚩',
    desc: 'Bổ sung ngay +2 dân binh vào ô đã chọn.',
    tier: 1,
  },
  {
    id: 'spike_trap',
    name: 'Bãi Chông',
    cost: 3,
    icon: '🪵',
    desc: 'Cài bẫy chặn đứng đường rải của đối phương tại 1 ô trong 2 lượt.',
    tier: 2,
  },
  {
    id: 'lock_tile',
    name: 'Phong Thổ Lệnh',
    cost: 4,
    icon: '🔒',
    desc: 'Khóa 1 ô của địch, ngăn địch bốc ô này trong 1 lượt.',
    tier: 2,
  },
  {
    id: 'detonate_spies',
    name: 'Nội Ứng Ngoại Hợp',
    cost: 5,
    icon: '💥',
    desc: 'Kích nổ toàn bộ Nội Gián trong lãnh thổ địch, gây sát thương lớn lên Địch Thành.',
    tier: 3,
  },
];

export const DOCTRINES_INFO: Record<Doctrine, { name: string; icon: string; desc: string; perk: string }> = {
  thuy_tran: {
    name: 'Đạo Thủy Trận',
    icon: '🌊',
    desc: 'Chiến thuật Bạch Đằng Lưu: Dòng nước chảy xiết.',
    perk: 'Gom 2 ô liền kề rải cùng lúc; tăng 1 ô tầm rải.',
  },
  thao_thiet: {
    name: 'Đạo Thao Thiết',
    icon: '🧱',
    desc: 'Chiến thuật Lũy Thầy Trận: Bất khả xâm phạm.',
    perk: 'Địch rải qua sân ta bị giữ lại 2 quân/ô thay vì 1.',
  },
  nong_binh: {
    name: 'Đạo Nông Binh',
    icon: '🌾',
    desc: 'Chiến thuật Vạn Kiếp Phong: Ngụ binh ư nông.',
    perk: 'Quân trên Ruộng tự động phòng thủ, giảm 50% sát thương lên Thành.',
  },
};
