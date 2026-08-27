import React from 'react'
import { Trophy, BookOpen, Settings, LogOut, Shield, Users, Medal, Swords, Target, Crown, Code2, Wifi } from 'lucide-react'
import brandLogo from '../logo ô quan dựng nước.png'
import boardImg from '../nền bàn cờ 1.png'
import { getRankColor, type RankTier } from './game3d/multiplayerManager'

interface LobbyPageProps {
  profile: string | null
  playerRankProfile: {
    tier: RankTier
    lp: number
    wins: number
    losses: number
  }
  onStartCampaign: () => void
  onOpenPvpLobby: () => void
  onStartRanked: () => void
  onOpenLeaderboard: () => void
  onOpenRules: () => void
  onOpenSettings: () => void
  onLogout: () => void
}

const MISSIONS = [
  {
    id: 1,
    icon: '🌾',
    title: 'Tích Cốc Phòng Cơ',
    desc: 'Thu hoạch 30 Lương thực từ Ruộng Lúa để nhận +10 Uy Danh.',
  },
  {
    id: 2,
    icon: '🎋',
    title: 'Đắp Lũy Tre Xanh',
    desc: 'Khai thác 25 Gỗ từ Rừng Tre củng cố thành lũy.',
  },
  {
    id: 3,
    icon: '⚔️',
    title: 'Luyện Khí Định Thế',
    desc: 'Tích lũy đủ 10 Thế Khí trong một trận chiến.',
  },
]

const GAME_MODES = [
  {
    id: 'campaign',
    tag: 'CHIẾN DỊCH',
    title: 'Thủ Thành Kháng Địch',
    desc: 'Chống lại toàn đợt công từ phía địch AI giặc ngoại xâm.',
    icon: Shield,
    themeClass: 'mode-campaign',
  },
  {
    id: 'pvp_custom',
    tag: 'ĐẤU BẠN BÈ',
    title: 'Tạo Phòng Đấu Bạn (Mã 6 Số)',
    desc: 'Chia sẻ mật số cho bạn bè cùng tham chiến đối kháng.',
    icon: Users,
    themeClass: 'mode-pvp',
  },
  {
    id: 'pvp_ranked',
    tag: 'LEO RANK',
    title: 'Đấu Xếp Hạng Toàn Quốc',
    desc: 'Ghép trận với chiến binh khắp đất nước để bứt phá thứ hạng.',
    icon: Medal,
    themeClass: 'mode-ranked',
  },
]

export const LobbyPage: React.FC<LobbyPageProps> = ({
  profile,
  playerRankProfile,
  onStartCampaign,
  onOpenPvpLobby,
  onStartRanked,
  onOpenLeaderboard,
  onOpenRules,
  onOpenSettings,
  onLogout,
}) => {
  return (
    <div className="vn-palace-lobby screen">
      {/* BACKGROUND HERO WITH CITADEL & VIETNAMESE FLAGS */}
      <div className="vn-hero-bg-layer">
        <div className="vn-sky-warmth" />
        <div className="vn-citadel-backdrop">
          {/* Cột cờ bên trái */}
          <div className="vn-flag-pole left">
            <div className="flag-pole-stick" />
            <div className="vn-flag-cloth">
              <span className="vn-star">★</span>
            </div>
          </div>
          {/* Cột cờ bên phải */}
          <div className="vn-flag-pole right">
            <div className="flag-pole-stick" />
            <div className="vn-flag-cloth">
              <span className="vn-star">★</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          1. HEADER (LEFT: PLAYER PROFILE, CENTER: LOGO, RIGHT: NAV BUTTONS)
          ========================================================================= */}
      <header className="vn-lobby-header">
        {/* A. BÊN TRÁI - THÔNG TIN NGƯỜI CHƠI */}
        <div className="vn-player-card">
          <div className="vn-avatar-gold-frame">
            <div className="avatar-inner-art">🏛️</div>
            <div className="avatar-seal-badge">御</div>
          </div>
          <div className="vn-player-meta">
            <b className="vn-player-name">{profile || 'antondung'}</b>
            <span
              className="vn-player-rank"
              style={{ color: getRankColor(playerRankProfile.tier) }}
            >
              {playerRankProfile.tier} ({playerRankProfile.lp} LP)
            </span>
          </div>
        </div>

        {/* B. CHÍNH GIỮA - LOGO CHÍNH XÁC CỦA GAME */}
        <div className="vn-logo-center-wrap">
          <img
            src={brandLogo}
            alt="Ô Quan Dựng Nước"
            className="vn-brand-main-logo"
          />
        </div>

        {/* C. BÊN PHẢI - 4 NÚT NAVIGATION */}
        <nav className="vn-lobby-nav-group">
          <button
            type="button"
            className="vn-nav-btn gold"
            onClick={onOpenLeaderboard}
          >
            <Trophy size={18} />
            <span>BẢNG VÀNG</span>
          </button>

          <button
            type="button"
            className="vn-nav-btn"
            onClick={onOpenRules}
          >
            <BookOpen size={18} />
            <span>BÁCH KHOA</span>
          </button>

          <button
            type="button"
            className="vn-nav-btn"
            onClick={onOpenSettings}
          >
            <Settings size={18} />
            <span>CÀI ĐẶT</span>
          </button>

          <button
            type="button"
            className="vn-nav-btn danger"
            onClick={onLogout}
          >
            <LogOut size={18} />
            <span>ĐĂNG XUẤT</span>
          </button>
        </nav>
      </header>

      {/* =========================================================================
          2. MAIN LOBBY STAGE (LEFT: NHIỆM VỤ | CENTER: HERO | RIGHT: GAME MODES)
          ========================================================================= */}
      <main className="vn-lobby-stage-layout">
        {/* LEFT PANEL: NHIỆM VỤ QUỐC GIA (PARCHMENT CARD STYLE) */}
        <aside className="vn-left-parchment-panel">
          <div className="parchment-header-row">
            <span className="parchment-seal-symbol">◎</span>
            <h2>NHIỆM VỤ QUỐC GIA</h2>
          </div>

          <div className="parchment-missions-list">
            {MISSIONS.map((m) => (
              <div key={m.id} className="vn-mission-parchment-card">
                <div className="mission-icon-circle">
                  <span>{m.icon}</span>
                </div>
                <div className="mission-text-content">
                  <h4>{m.title}</h4>
                  <p>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER HERO SECTION: GIANG SƠN HỘI TỤ + BÀN CỜ Ô QUAN + XUẤT TRẬN NGAY */}
        <section className="vn-center-hero-showcase">
          <div className="vn-epic-headline-group">
            <span className="vn-epic-kicker">CHIẾN TRƯỜNG DÂN GIAN ĐẠI VIỆT</span>
            <h1 className="vn-epic-main-title">GIANG SƠN HỘI TỤ</h1>
            <p className="vn-epic-subtitle">
              Một nước rải định đoạt vạn dặm non sông.<br />
              Hãy chọn chiến cuộc và xuất trận cùng các bậc hào kiệt!
            </p>
          </div>

          {/* BÀN CỜ Ô QUAN PERSPECTIVE DISPLAY */}
          <div className="vn-board-isometric-container">
            <img
              src={boardImg}
              alt="Bàn cờ Ô Quan"
              className="vn-o-an-quan-board-img"
            />
            <div className="vn-board-glow-accent" />
          </div>

          {/* NÚT CTA CHÍNH LỚN: XUẤT TRẬN NGAY */}
          <div className="vn-cta-battle-row">
            <button
              type="button"
              className="vn-grand-battle-cta-btn"
              onClick={onStartCampaign}
            >
              <Swords size={28} className="cta-swords-icon" />
              <span>XUẤT TRẬN NGAY</span>
            </button>
          </div>
        </section>

        {/* RIGHT PANEL: 3 CARDS CHẾ ĐỘ CHƠI */}
        <aside className="vn-right-modes-column">
          {GAME_MODES.map((mode) => {
            const IconComponent = mode.icon
            const clickHandler =
              mode.id === 'campaign'
                ? onStartCampaign
                : mode.id === 'pvp_custom'
                ? onOpenPvpLobby
                : onStartRanked

            return (
              <div
                key={mode.id}
                className={`vn-mode-select-card ${mode.themeClass}`}
                onClick={clickHandler}
              >
                <div className="mode-left-icon-circle">
                  <IconComponent size={24} />
                </div>
                <div className="mode-content-text">
                  <span className="mode-header-tag">{mode.tag}</span>
                  <h4>{mode.title}</h4>
                  <p>{mode.desc}</p>
                </div>
                <div className="mode-arrow-pointer">❯</div>
              </div>
            )
          })}
        </aside>
      </main>

      {/* =========================================================================
          3. FOOTER STATUS (LEFT: MÙA GIẢI, CENTER: MẠNG, RIGHT: PHIÊN BẢN)
          ========================================================================= */}
      <footer className="vn-lobby-parchment-footer">
        <div className="footer-status-col left">
          <Crown size={18} color="#d8a13a" />
          <div>
            <span>ĐẠI THÀNH HOÀNG GIA</span>
            <b>MÙA GIẢI: DỰNG THIÊN HẠ</b>
          </div>
        </div>

        <div className="footer-status-col center">
          <div className="network-live-pulse-dot" />
          <div>
            <span>HỆ THỐNG MẠNG</span>
            <b style={{ color: '#75b85a' }}>KẾT NỐI HOÀN HẢO</b>
          </div>
        </div>

        <div className="footer-status-col right">
          <Code2 size={18} color="#d8a13a" />
          <div>
            <span>PHIÊN BẢN PROTOTYPE</span>
            <b>VIETNAMESE STRATEGY SYSTEM</b>
          </div>
        </div>
      </footer>
    </div>
  )
}
export default LobbyPage
