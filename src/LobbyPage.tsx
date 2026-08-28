import React, { useState } from 'react'
import { Trophy, BookOpen, Settings, LogOut, Shield, Users, Medal, Swords, Target, Crown, Code2, Wifi, Sparkles, Scroll, Flame, Gem, Puzzle, Compass, X } from 'lucide-react'
import brandLogo from '../logo ô quan dựng nước.png'
import boardImg from '../nền bàn cờ 1.png'
import { getRankColor, type RankTier } from './game3d/multiplayerManager'
import type { HeroId, ArtifactId, CampaignStage, PuzzleLevel } from './game3d/advancedGameTypes'
import { HEROES_DATABASE, ARTIFACTS_DATABASE, CAMPAIGN_STAGES, PUZZLE_LEVELS } from './game3d/tacticsDatabase'

interface LobbyPageProps {
  profile: string | null
  playerRankProfile: {
    tier: RankTier
    lp: number
    wins: number
    losses: number
  }
  selectedHero: HeroId
  equippedArtifacts: ArtifactId[]
  onSelectHero: (heroId: HeroId) => void
  onToggleArtifact: (artifactId: ArtifactId) => void
  onStartCampaign: (stageId?: string) => void
  onStartPuzzle: (puzzleId: number) => void
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
    title: 'Chiến Dịch Lịch Sử',
    desc: 'Bạch Đằng, Như Nguyệt, Chi Lăng, Ngọc Hồi - Đống Đa.',
    icon: Shield,
    themeClass: 'mode-campaign',
  },
  {
    id: 'puzzle',
    tag: 'THẾ CỜ',
    title: 'Giải Đố & Luyện Cờ',
    desc: 'Vượt qua 4 thế trận hiểm hóc với số lượt giới hạn.',
    icon: Target,
    themeClass: 'mode-puzzle',
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
  selectedHero,
  equippedArtifacts,
  onSelectHero,
  onToggleArtifact,
  onStartCampaign,
  onStartPuzzle,
  onOpenPvpLobby,
  onStartRanked,
  onOpenLeaderboard,
  onOpenRules,
  onOpenSettings,
  onLogout,
}) => {
  const [modalType, setModalType] = useState<'heroes' | 'artifacts' | 'campaign_select' | 'puzzle_select' | null>(null)

  const currentHeroDef = HEROES_DATABASE[selectedHero]

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
        {/* A. BÊN TRÁI - THÔNG TIN NGƯỜI CHƠI & TƯỚNG ĐANG CHỌN */}
        <div className="vn-player-card">
          <div className="vn-avatar-gold-frame" onClick={() => setModalType('heroes')} style={{ cursor: 'pointer' }} title="Đổi Danh Tướng">
            <div className="avatar-inner-art">{currentHeroDef.avatar}</div>
            <div className="avatar-seal-badge">御</div>
          </div>
          <div className="vn-player-meta">
            <b className="vn-player-name">{profile || 'antondung'} · {currentHeroDef.name}</b>
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
          2. MAIN LOBBY STAGE (LEFT: NHIỆM VỤ & TƯỚNG | CENTER: HERO | RIGHT: GAME MODES)
          ========================================================================= */}
      <main className="vn-lobby-stage-layout">
        {/* LEFT PANEL: NHIỆM VỤ QUỐC GIA & TƯỚNG HIỆN TẠI */}
        <aside className="vn-left-parchment-panel">
          <div className="parchment-header-row">
            <span className="parchment-seal-symbol">◎</span>
            <h2>DANH TƯỚNG & CỔ VẬT</h2>
          </div>

          <div className="vn-hero-select-btn-row">
            <button
              type="button"
              className="vn-hero-select-trigger-btn"
              onClick={() => setModalType('heroes')}
            >
              <span>{currentHeroDef.avatar} {currentHeroDef.name}</span>
            </button>
            <button
              type="button"
              className="vn-hero-select-trigger-btn"
              onClick={() => setModalType('artifacts')}
            >
              <span>🏺 Cổ Vật ({equippedArtifacts.length}/2)</span>
            </button>
          </div>

          <div className="parchment-header-row" style={{ marginTop: '8px' }}>
            <span className="parchment-seal-symbol">📜</span>
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
              Đồng hành cùng {currentHeroDef.title} <b>{currentHeroDef.name}</b>.<br />
              "{currentHeroDef.quote}"
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
              onClick={() => setModalType('campaign_select')}
            >
              <Swords size={28} className="cta-swords-icon" />
              <span>XUẤT TRẬN CHIẾN DỊCH</span>
            </button>
          </div>
        </section>

        {/* RIGHT PANEL: CARDS CHẾ ĐỘ CHƠI */}
        <aside className="vn-right-modes-column">
          {GAME_MODES.map((mode) => {
            const IconComponent = mode.icon
            const clickHandler = () => {
              if (mode.id === 'campaign') setModalType('campaign_select')
              else if (mode.id === 'puzzle') setModalType('puzzle_select')
              else if (mode.id === 'pvp_custom') onOpenPvpLobby()
              else if (mode.id === 'pvp_ranked') onStartRanked()
            }

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
            <span>PHIÊN BẢN CHIẾN THUẬT</span>
            <b>HERO & ARTIFACT SYSTEM v1.2</b>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODALS: CHỌN DANH TƯỚNG / CỔ VẬT / CHIẾN DỊCH / THẾ CỜ
          ========================================================================= */}
      {modalType === 'heroes' && (
        <div className="vn-palace-modal-backdrop" onClick={() => setModalType(null)}>
          <div className="vn-palace-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="vn-palace-modal-header">
              <h2>👑 CHỌN DANH TƯỚNG XUẤT TRẬN</h2>
              <button type="button" className="ghost" onClick={() => setModalType(null)}><X size={20} /></button>
            </div>
            <div className="vn-palace-modal-body">
              <div className="vn-hero-grid-cards">
                {Object.values(HEROES_DATABASE).map((h) => {
                  const isSelected = selectedHero === h.id
                  return (
                    <div
                      key={h.id}
                      className={`vn-hero-selection-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        onSelectHero(h.id)
                        setModalType(null)
                      }}
                    >
                      <div className="hero-card-top-row">
                        <div className="hero-avatar-large">{h.avatar}</div>
                        <div className="hero-titles">
                          <h3>{h.name}</h3>
                          <span>{h.title}</span>
                        </div>
                      </div>
                      <div className="hero-quote-box">"{h.quote}"</div>
                      <div className="hero-skill-details">
                        <div><b>Nội tại: {h.passiveName}</b> - {h.passiveDesc}</div>
                        <div><b>Kỹ năng: {h.skillIcon} {h.skillName}</b> ({h.skillCost} ⚡) - {h.skillDesc}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {modalType === 'artifacts' && (
        <div className="vn-palace-modal-backdrop" onClick={() => setModalType(null)}>
          <div className="vn-palace-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="vn-palace-modal-header">
              <h2>🏺 TRANG BỊ THẦN KHÍ & CỔ VẬT (Tối đa 2)</h2>
              <button type="button" className="ghost" onClick={() => setModalType(null)}><X size={20} /></button>
            </div>
            <div className="vn-palace-modal-body">
              <div className="vn-artifact-grid-cards">
                {Object.values(ARTIFACTS_DATABASE).map((art) => {
                  const isEquipped = equippedArtifacts.includes(art.id)
                  return (
                    <div
                      key={art.id}
                      className={`vn-artifact-selection-item ${isEquipped ? 'selected' : ''}`}
                      onClick={() => onToggleArtifact(art.id)}
                    >
                      <div className="hero-card-top-row">
                        <div className="hero-avatar-large">{art.icon}</div>
                        <div className="hero-titles">
                          <h3>{art.name}</h3>
                          <span style={{ color: art.rarity === 'mythic' ? '#ff7875' : '#ffd048' }}>
                            {art.rarity.toUpperCase()} · {art.tagline}
                          </span>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#c6b9a3' }}>{art.desc}</p>
                      <div className="hero-skill-details">
                        <b>Hiệu ứng bảo vật:</b> {art.statBonus}
                      </div>
                      <button
                        type="button"
                        className={`vn-nav-btn ${isEquipped ? 'gold' : ''}`}
                        style={{ marginTop: '4px', justifyContent: 'center' }}
                      >
                        {isEquipped ? '✓ ĐANG TRANG BỊ' : '+ TRANG BỊ'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {modalType === 'campaign_select' && (
        <div className="vn-palace-modal-backdrop" onClick={() => setModalType(null)}>
          <div className="vn-palace-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="vn-palace-modal-header">
              <h2>⚔️ CHIẾN DỊCH LỊCH SỬ ĐẠI VIỆT</h2>
              <button type="button" className="ghost" onClick={() => setModalType(null)}><X size={20} /></button>
            </div>
            <div className="vn-palace-modal-body">
              <div className="vn-campaign-grid-cards">
                {CAMPAIGN_STAGES.map((stg) => (
                  <div
                    key={stg.id}
                    className="vn-campaign-item-card"
                    onClick={() => {
                      setModalType(null)
                      onStartCampaign(stg.id)
                    }}
                  >
                    <div className="hero-card-top-row">
                      <div className="hero-avatar-large">{stg.enemyAvatar}</div>
                      <div className="hero-titles">
                        <h3>Hồi {stg.chapter}: {stg.title}</h3>
                        <span>{stg.year} · {stg.location}</span>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#c6b9a3', lineHeight: '1.4' }}>{stg.storyIntro}</p>
                    <div className="hero-skill-details">
                      <div><b>Đối thủ:</b> {stg.enemyName}</div>
                      <div><b>Thời tiết:</b> {stg.weather.toUpperCase()} · <b>Thưởng:</b> +{stg.rewardLp} LP</div>
                    </div>
                    <button type="button" className="vn-grand-battle-cta-btn" style={{ height: '42px', fontSize: '14px', marginTop: '6px' }}>
                      XUẤT KÍCH CHIẾN DỊCH
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {modalType === 'puzzle_select' && (
        <div className="vn-palace-modal-backdrop" onClick={() => setModalType(null)}>
          <div className="vn-palace-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="vn-palace-modal-header">
              <h2>🧩 THẾ CỜ & GIẢI ĐỐ CHIẾN THUẬT</h2>
              <button type="button" className="ghost" onClick={() => setModalType(null)}><X size={20} /></button>
            </div>
            <div className="vn-palace-modal-body">
              <div className="vn-puzzle-grid-cards">
                {PUZZLE_LEVELS.map((puz) => (
                  <div
                    key={puz.id}
                    className="vn-puzzle-item-card"
                    onClick={() => {
                      setModalType(null)
                      onStartPuzzle(puz.id)
                    }}
                  >
                    <div className="hero-card-top-row">
                      <div className="hero-avatar-large">🎯</div>
                      <div className="hero-titles">
                        <h3>{puz.title}</h3>
                        <span style={{ color: puz.difficulty === 'master' ? '#ff7875' : '#ffd048' }}>
                          ĐỘ KHÓ: {puz.difficulty.toUpperCase()} · Giới hạn: {puz.maxTurns} lượt
                        </span>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '11.5px', color: '#c6b9a3' }}>{puz.dialogue}</p>
                    <div className="hero-skill-details">
                      <b>Mục tiêu ải:</b> {puz.objective.label}
                    </div>
                    <button type="button" className="vn-nav-btn gold" style={{ marginTop: '4px', justifyContent: 'center' }}>
                      PHÁ THẾ TRẬN NÀY
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default LobbyPage
