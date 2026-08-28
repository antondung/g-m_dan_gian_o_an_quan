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

// ============================================================================
// HỆ THỐNG DANH TƯỚNG ĐẠI VIỆT (HEROES)
// ============================================================================
import type { HeroId, HeroDefinition, ArtifactId, ArtifactDefinition, WeatherType, WeatherEffect, PuzzleLevel, CampaignStage } from './advancedGameTypes';

export const HEROES_DATABASE: Record<HeroId, HeroDefinition> = {
  tran_hung_dao: {
    id: 'tran_hung_dao',
    name: 'Trần Hưng Đạo',
    title: 'Tiết Chế Quốc Công',
    avatar: '⚔️',
    quote: 'Nếu bệ hạ muốn hàng, xin hãy chém đầu thần trước đã!',
    passiveName: 'Vạn Kiếp Tông Bí',
    passiveDesc: 'Gia tăng +2 sát thương khi kích hoạt đòn Phục Kích hoặc Hãm Thành.',
    skillName: 'Hịch Tướng Sĩ',
    skillCost: 4,
    skillCooldown: 3,
    skillIcon: '🛡️',
    skillDesc: 'Dựng Khiên Thiết Giáp bảo vệ 1 ô trong 3 lượt (miễn nhiễm bị cướp quân và công kích).',
  },
  quang_trung: {
    id: 'quang_trung',
    name: 'Quang Trung',
    title: 'Bắc Bình Vương',
    avatar: '🔥',
    quote: 'Đánh cho để dài tóc, đánh cho để đen răng, đánh cho sử tri Nam quốc anh hùng chi hữu chủ!',
    passiveName: 'Thần Tốc Hành Quân',
    passiveDesc: 'Tăng 30% tốc độ rải quân. Mỗi khi rải qua Doanh Trại, nhận thêm ngay +1 quân dự bị.',
    skillName: 'Hành Quân Thần Tốc',
    skillCost: 5,
    skillCooldown: 4,
    skillIcon: '⚡',
    skillDesc: 'Cho phép bạn bốc tiếp 1 ô quân đi thêm một lượt ngay lập tức!',
  },
  hai_ba_trung: {
    id: 'hai_ba_trung',
    name: 'Hai Bà Trưng',
    title: 'Trưng Nữ Vương',
    avatar: '🐘',
    quote: 'Một xin rửa sạch nước thù, Hai xin đem lại nghiệp xưa họ Hùng!',
    passiveName: 'Lĩnh Nam Khởi Nghĩa',
    passiveDesc: 'Ruộng Lúa và Rừng Tre tự động nhân đôi sản lượng thu hoạch (+4 Lương/Gỗ mỗi lần rải qua).',
    skillName: 'Trống Đồng Xung Trận',
    skillCost: 3,
    skillCooldown: 3,
    skillIcon: '🥁',
    skillDesc: 'Hiệu triệu dân binh: Lập tức bổ sung +2 quân cho tất cả các ô thuộc quyền sở hữu của quân ta!',
  },
  ly_thuong_kiet: {
    id: 'ly_thuong_kiet',
    name: 'Lý Thường Kiệt',
    title: 'Thái Úy Quốc Công',
    avatar: '📜',
    quote: 'Nam quốc sơn hà Nam đế cư, Tiệt nhiên định phận tại thiên thư!',
    passiveName: 'Phạt Tống Tiên Phát',
    passiveDesc: 'Khởi đầu trận đấu với +3 Thế Khí và thành trì có thêm +10 Giáp hộ vệ.',
    skillName: 'Như Nguyệt Trận Đồ',
    skillCost: 4,
    skillCooldown: 4,
    skillIcon: '🌊',
    skillDesc: 'Kích hoạt trận đồ sông Như Nguyệt, ép đối phương bị đảo ngược hoàn toàn hướng rải ở lượt kế!',
  },
};

// ============================================================================
// HỆ THỐNG THẦN KHÍ & BẢO VẬT DÂN TỘC (ARTIFACTS)
// ============================================================================
export const ARTIFACTS_DATABASE: Record<ArtifactId, ArtifactDefinition> = {
  trong_dong: {
    id: 'trong_dong',
    name: 'Trống Đồng Ngọc Lũ',
    icon: '🥁',
    rarity: 'mythic',
    tagline: 'Linh khí ngàn năm Văn Lang',
    desc: 'Hào khí non sông hộ quốc an dân, tăng mạnh năng suất tích lũy lương thảo khí giới.',
    statBonus: '+15% Toàn bộ tài nguyên thu hoạch và khởi đầu với +1 Thế Khí.',
  },
  no_than: {
    id: 'no_than',
    name: 'Nỏ Thần Kim Quy',
    icon: '🏹',
    rarity: 'legendary',
    tagline: 'Nhất phát vạn tiễn linh thông',
    desc: 'Nỏ thiêng Cổ Loa thành. Tháp Canh tự động phóng tiễn tiễu trừ binh mã xâm phạm.',
    statBonus: 'Mỗi khi quân địch rải qua Tháp Canh ta, địch bị bắn hạ ngay 1 quân.',
  },
  thuan_thien_kiem: {
    id: 'thuan_thien_kiem',
    name: 'Thuận Thiên Kiếm',
    icon: '🗡️',
    rarity: 'mythic',
    tagline: 'Thuận lòng trời, dẹp yên bờ cõi',
    desc: 'Bảo kiếm Lam Sơn tỏa hào quang rực rỡ, uy lực trảm tướng phá thành kinh hồn bạt vía.',
    statBonus: 'Tăng +25% sát thương khi công kích trực tiếp vào Thành Trì đối phương.',
  },
  non_ba_tam: {
    id: 'non_ba_tam',
    name: 'Nón Ba Tầm Quai Thao',
    icon: '👒',
    rarity: 'epic',
    tagline: 'Nét duyên quan họ kết tinh linh khí',
    desc: 'Thanh thoát nhẹ nhàng, tâm trí minh mẫn giúp danh tướng xuất chiêu liên hồi.',
    statBonus: 'Giảm 1 điểm Thế Khí tiêu hao cho tất cả kỹ năng chủ động của Danh Tướng.',
  },
  gom_chu_dau: {
    id: 'gom_chu_dau',
    name: 'Bình Gốm Chu Đậu Cổ',
    icon: '🏺',
    rarity: 'legendary',
    tagline: 'Tinh hoa đất nung nước Việt',
    desc: 'Báu vật làng nghề gốm sứ cổ, tối ưu hóa vật liệu xây dựng và kiến thiết lãnh địa.',
    statBonus: 'Giảm 50% chi phí tài nguyên khi nâng cấp các ô đất lên 2★ và 3★.',
  },
};

// ============================================================================
// HỆ THỐNG THỜI TIẾT ĐỘNG (WEATHER SYSTEM)
// ============================================================================
export const WEATHER_TYPES_INFO: Record<WeatherType, WeatherEffect> = {
  clear: {
    type: 'clear',
    name: 'Trời Quang Mây Tạnh',
    icon: '☀️',
    durationTurns: 4,
    desc: 'Thời tiết ôn hòa, việc thu hoạch và hành quân diễn ra bình thường.',
    colorFilter: '#ffffff',
    ambientModifier: 1.0,
  },
  flood: {
    type: 'flood',
    name: 'Thủy Triều / Mưa Lũ',
    icon: '🌧️',
    durationTurns: 3,
    desc: 'Mưa lũ tràn về, Ruộng Lúa x2 sản lượng Lương nhưng bị ngập úng không thể bốc quân trong 1 hiệp.',
    colorFilter: '#90caf9',
    ambientModifier: 0.75,
  },
  fog: {
    type: 'fog',
    name: 'Sương Mù Chi Lăng',
    icon: '🌫️',
    durationTurns: 3,
    desc: 'Sương mù dày đặc che phủ chiến trường! Số quân trên toàn bộ ô của đối phương bị ẩn hoàn toàn (?).',
    colorFilter: '#b0bec5',
    ambientModifier: 0.65,
  },
  drought: {
    type: 'drought',
    name: 'Nắng Gắt Hạn Hán',
    icon: '🔥',
    durationTurns: 3,
    desc: 'Nắng lửa thiêu đốt: Sản lượng Lương giảm 1, nhưng quân lính hành quân thần tốc và hỏa công tăng 20% sát thương.',
    colorFilter: '#ffe082',
    ambientModifier: 1.25,
  },
  gale: {
    type: 'gale',
    name: 'Gió Mùa Đông Bắc',
    icon: '💨',
    durationTurns: 3,
    desc: 'Cuồng phong gầm thét cản trở bước chân: Tầm rải quân của cả hai phe bị giảm đi 1 ô.',
    colorFilter: '#cfd8dc',
    ambientModifier: 0.85,
  },
};

// ============================================================================
// CHẾ ĐỘ THẾ CỜ / GIẢI ĐỐ (PUZZLE DATABASE)
// ============================================================================
export const PUZZLE_LEVELS: PuzzleLevel[] = [
  {
    id: 1,
    title: 'Thế Cờ 1: Đoạt Quan Khai Quốc',
    historicalRef: 'Dựng Nền Độc Lập - Năm 938',
    difficulty: 'easy',
    maxTurns: 1,
    dialogue: 'Địch phòng thủ sơ hở ở ô Quan Trái. Chỉ cần 1 nước rải chuẩn xác, đoạt trọn ô Quan và mở ra chiến thắng!',
    initialBoard: {
      soldiers: [0, 4, 1, 0, 3, 5, 5, 5, 5, 5],
      quanL: 10,
      quanR: 10,
    },
    playerHp: 100,
    enemyHp: 100,
    resources: { food: 5, wood: 5, stone: 2 },
    objective: {
      type: 'capture_quantities',
      target: 10,
      label: 'Đoạt ít nhất 10 điểm quân (Ăn trọn 1 ô Quan)',
    },
    tip: 'Chọn ô số 1 (có 4 quân) và rải nghịch sang trái để ăn ô Quan Trái!',
  },
  {
    id: 2,
    title: 'Thế Cờ 2: Cứu Nguy Bạch Hạc',
    historicalRef: 'Phòng Tuyến Tam Đảo',
    difficulty: 'medium',
    maxTurns: 2,
    dialogue: 'Thành trì ta chỉ còn 10 HP! Cần khẩn cấp thu gom đủ 20 Lương để cứu nạn dân sinh và hồi phục sinh lực!',
    initialBoard: {
      soldiers: [5, 2, 4, 1, 0, 4, 3, 2, 5, 4],
      quanL: 10,
      quanR: 10,
    },
    playerHp: 10,
    enemyHp: 80,
    resources: { food: 4, wood: 2, stone: 1 },
    objective: {
      type: 'reach_food',
      target: 20,
      label: 'Tích lũy đạt 20 Lương thực trong 2 lượt',
    },
    tip: 'Hãy rải qua các ô Ruộng Lúa (ô 0 và ô 5) nhiều lần để nhân bội sản lượng Lương!',
  },
  {
    id: 3,
    title: 'Thế Cờ 3: Hãm Thành Phá Địch',
    historicalRef: 'Đại Phá Xương Giang',
    difficulty: 'hard',
    maxTurns: 2,
    dialogue: 'Cơ hội ngàn năm có một: Dọn sạch 2 cửa ngõ tiến vào Địch Thành để kích hoạt Hãm Thành và hạ gục đối thủ!',
    initialBoard: {
      soldiers: [0, 0, 3, 2, 5, 0, 3, 4, 2, 0],
      quanL: 5,
      quanR: 5,
    },
    playerHp: 75,
    enemyHp: 30,
    resources: { food: 10, wood: 8, stone: 6 },
    objective: {
      type: 'destroy_citadel',
      target: 0,
      label: 'Đánh sập Địch Thành (HP về 0) trong 2 lượt',
    },
    tip: 'Bốc quân từ ô 4 rải thuận để dọn sạch cửa ngõ và tung đòn phục kích kết liễu thành!',
  },
  {
    id: 4,
    title: 'Thế Cờ 4: Quét Sạch Biên Cương',
    historicalRef: 'Bình Ngô Đại Cáo',
    difficulty: 'master',
    maxTurns: 3,
    dialogue: 'Thế trận vây hãm đỉnh cao: Quét sạch toàn bộ quân số trên 5 ô đất của đối phương!',
    initialBoard: {
      soldiers: [6, 1, 0, 2, 4, 1, 2, 1, 1, 2],
      quanL: 10,
      quanR: 10,
    },
    playerHp: 90,
    enemyHp: 90,
    resources: { food: 15, wood: 10, stone: 8 },
    objective: {
      type: 'wipe_enemy_cells',
      target: 0,
      label: 'Dọn sạch quân trên toàn bộ 5 ô đất của quân địch',
    },
    tip: 'Tận dụng kỹ năng Đảo chiều hoặc bẻ hướng rải để thực hiện chuỗi ăn quân liên hoàn!',
  },
];

// ============================================================================
// CHIẾN DỊCH LỊCH SỬ ĐẠI VIỆT (CAMPAIGN MODE)
// ============================================================================
export const CAMPAIGN_STAGES: CampaignStage[] = [
  {
    id: 'stage_bach_dang',
    chapter: 1,
    year: 'Năm 938 & 1288',
    title: 'Huyết Chiến Bạch Đằng Giang',
    location: 'Cửa Sông Bạch Đằng - Vùng Đông Bắc',
    enemyName: 'Ô Mã Nhi & Giặc Nguyên Mông',
    enemyHero: 'tran_hung_dao',
    enemyAvatar: '⚓',
    weather: 'flood',
    storyIntro: 'Chiến thuyền giặc nghênh ngang tiến vào cửa sông Bạch Đằng. Nước triều đang dâng cuồn cuộn. Hãy vận dụng cọc gỗ và Đạo Thủy Trận để đón đầu địch khi thủy triều rút!',
    victorySpeech: 'Vạn Cổ Lưu Danh! Cọc gỗ nhô lên xuyên thủng chiến thuyền giặc, bắt sống tướng giặc Ô Mã Nhi!',
    defeatSpeech: 'Chiến tuyến vỡ lở, giặc Mông tràn qua cửa sông...',
    aiAggressiveness: 'balanced',
    playerBaseHp: 100,
    enemyBaseHp: 100,
    initialResources: { food: 10, wood: 15, stone: 5 },
    firstMove: 'player',
    rewardLp: 50,
    unlockArtifact: 'trong_dong',
  },
  {
    id: 'stage_nhu_nguyet',
    chapter: 2,
    year: 'Năm 1077',
    title: 'Phòng Tuyến Sông Như Nguyệt',
    location: 'Bờ Nam Sông Cầu - Kinh Bắc',
    enemyName: 'Quách Quỳ & Đại Quân Tống',
    enemyHero: 'ly_thuong_kiet',
    enemyAvatar: '🛡️',
    weather: 'gale',
    storyIntro: 'Thái úy Lý Thường Kiệt đắp lũy tre dày đặc dọc chiến tuyến bờ Nam sông Như Nguyệt. Bài thơ thần vang lên trong đêm khiến quân giặc rúng động tinh thần!',
    victorySpeech: 'Nam quốc sơn hà! Giặc Tống đại bại, Quách Quỳ buộc phải ký hòa ước rút quân về nước!',
    defeatSpeech: 'Phòng tuyến bờ Nam bị chọc thủng...',
    aiAggressiveness: 'economic',
    playerBaseHp: 120,
    enemyBaseHp: 120,
    initialResources: { food: 15, wood: 20, stone: 10 },
    firstMove: 'player',
    rewardLp: 75,
    unlockArtifact: 'thuan_thien_kiem',
  },
  {
    id: 'stage_chi_lang',
    chapter: 3,
    year: 'Năm 1427',
    title: 'Phục Kích Ải Chi Lăng',
    location: 'Hẻm Núi Chi Lăng - Xương Giang',
    enemyName: 'Liễu Thăng & Quân Minh Viện Binh',
    enemyHero: 'hai_ba_trung',
    enemyAvatar: '🏹',
    weather: 'fog',
    storyIntro: 'Mười vạn viện binh nhà Minh do Liễu Thăng dẫn đầu ồ ạt tràn qua ải. Giữa sương mù dày đặc và hẻm núi hiểm trở, nghĩa quân Lam Sơn đã giăng sẵn bẫy chông phục kích!',
    victorySpeech: 'Chém Liễu Thăng tại núi Mã Yên! Toàn bộ cánh quân cứu viện giặc bị tiêu diệt hoàn toàn!',
    defeatSpeech: 'Viện binh giặc hợp quân cùng thành Đông Quan...',
    aiAggressiveness: 'tactical',
    playerBaseHp: 110,
    enemyBaseHp: 130,
    initialResources: { food: 12, wood: 15, stone: 12 },
    firstMove: 'enemy',
    rewardLp: 100,
    unlockArtifact: 'no_than',
  },
  {
    id: 'stage_ngoc_hoi_dong_da',
    chapter: 4,
    year: 'Năm 1789',
    title: 'Thần Tốc Ngọc Hồi - Đống Đa',
    location: 'Cửa Ngõ Thăng Long',
    enemyName: 'Tôn Sĩ Nghị & 29 Vạn Quân Thanh',
    enemyHero: 'quang_trung',
    enemyAvatar: '🔥',
    weather: 'drought',
    storyIntro: 'Hoàng đế Quang Trung đích thân đốc chiến, thúc quân thần tốc ngày đêm từ Phú Xuân ra Bắc, công phá đồn Ngọc Hồi vào sáng mùng 5 Tết Kỷ Dậu!',
    victorySpeech: 'Mùng 5 Tết đại thắng Thăng Long! Tôn Sĩ Nghị hoảng loạn vượt cầu phao chạy trốn!',
    defeatSpeech: 'Khí thế hành quân bị gián đoạn trước đồn lũy kiên cố...',
    aiAggressiveness: 'aggressive',
    playerBaseHp: 120,
    enemyBaseHp: 150,
    initialResources: { food: 20, wood: 10, stone: 15 },
    firstMove: 'player',
    rewardLp: 150,
    unlockArtifact: 'non_ba_tam',
  },
];
