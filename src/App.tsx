import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft,ArrowRight,BookOpen,Castle,ChevronLeft,ChevronRight,Coins,Compass,Flag,Hammer,HelpCircle,LockKeyhole,LogOut,Pause,Play,RotateCcw,Settings,Shield,Sparkles,Sprout,Swords,Target,Trees,Trophy,UserRound,Flame,Zap,Volume2,VolumeX,Music,Users,Copy,Check,Medal,CloudRain,Sun,Wind,Crown } from 'lucide-react'
import Board3D,{type Cell,type MarchEvent} from './Board3D'
import type { TacticalTrap, Doctrine, HeroId, ArtifactId, WeatherType } from './game3d/advancedGameTypes'
import { TACTICAL_COMMANDS, DOCTRINES_INFO, HEROES_DATABASE, ARTIFACTS_DATABASE, WEATHER_TYPES_INFO, CAMPAIGN_STAGES, PUZZLE_LEVELS } from './game3d/tacticsDatabase'
import { sound } from './game3d/audioManager'
import { MultiplayerNetwork, networkManager, type RankTier, type LeaderboardEntry, getRankColor } from './game3d/multiplayerManager'
import { LobbyPage } from './LobbyPage'
import brandLogo from '../logo ô quan dựng nước.png'

type Screen='landing'|'profile'|'lobby'|'game'|'pvp_lobby'|'ranked_matchmaking'|'leaderboard'
type InfoModal='world'|'rules'|'chronicle'|'tactics'|'doctrines'|'settings'|'create_room'|'hero_detail'|null
type Resources={food:number;wood:number;stone:number}
type TurnPhase='player'|'player_marching'|'enemy'|'enemy_marching'|'siege_alert'|'siege_active'
type CombatBanner={type:'march'|'ambush'|'siege'|'reward'|'ai'|'tactic';title:string;detail:string}
type GameMode='ai_defense'|'campaign'|'puzzle'|'pvp_custom'|'pvp_ranked'

const initialCells=():Cell[]=>['farm','forest','workshop','barracks','tower','farm','forest','workshop','barracks','tower'].map((building,id)=>({id,soldiers:5,building:building as Cell['building'],owner:id<5?'player':'enemy',stars:1,spies:0,shieldTurns:0}))
const DEFAULT_CELLS:Cell[]=initialCells()

const BUILDING_INFO: Record<Cell['building'], { name: string; icon: string; worker: string; output: string; desc: string }> = {
 farm: { name: 'RUỘNG LÚA', icon: '🌾', worker: 'Nông dân', output: '+2 Lương', desc: 'Canh tác lúa nước, nuôi quân tích cốc.' },
 forest: { name: 'RỪNG TRE', icon: '🎋', worker: 'Tiều phu', output: '+2 Gỗ', desc: 'Khai thác tre xanh, dựng chông đắp lũy.' },
 workshop: { name: 'XƯỞNG MỘC', icon: '🪓', worker: 'Thợ mộc', output: '+1 Đá / Vật liệu', desc: 'Chế tạo khí tài, xây dựng thành quách.' },
 barracks: { name: 'DOANH TRẠI', icon: '⚔️', worker: 'Binh sĩ', output: 'Phòng thủ + Đúc sắt', desc: 'Rèn luyện binh mã, chống vây hãm thành.' },
 tower: { name: 'THÁP CANH', icon: '🏹', worker: 'Quân canh', output: 'Tầm nhìn + Cung thủ', desc: 'Đài quan sát cao, chặn đứng đợt tiến công.' },
}

const lessons = [
  {
    tag: 'BƯỚC 1 / 8 · TỔNG QUAN CHIẾN ĐỊA',
    title: 'Chào Mừng Thành Chủ',
    text: 'Bàn Ô Ăn Quan nay đã hóa cõi non nước Đại Việt: 5 vùng gần thuộc Đại Thành (Quân Ta - Viền Xanh); 5 vùng xa thuộc Địch Thành (Kẻ Địch - Viền Đỏ).',
    tip: 'Rê chuột vào bất kỳ ô đất hoặc thành trì nào để xem ngay thông tin chi tiết (HP, lính, tài nguyên thu được).',
  },
  {
    tag: 'BƯỚC 2 / 8 · ĐỘNG CƠ RẢI QUÂN & TÀI NGUYÊN',
    title: 'Một Người Là Một Quân',
    text: 'Con số trên mỗi ô là số dân binh. Khi ban lệnh, toàn bộ quân trong ô được bốc lên và rải lần lượt từng viên qua các ô tiếp theo theo vành đai.',
    tip: 'Rải qua Ruộng nhận Lương 🌾, qua Rừng nhận Gỗ 🎋, qua Xưởng nhận Đá 🪓. Dùng tài nguyên để NÂNG CẤP Ô lên 2★, 3★!',
  },
  {
    tag: 'BƯỚC 3 / 8 · THẾ KHÍ & TRẬN PHÁP',
    title: 'Thế Khí & Kho Trận Pháp',
    text: 'Thanh THẾ KHÍ (⚡ 3/10) trên đầu dùng để tung Trận Pháp tức thời: Bẻ Chiều Cờ (đổi hướng rải), Cài Bãi Chông, Điểm Binh (+2 lính), Khóa ô địch, Kích nổ gián điệp!',
    tip: 'Mở nút [TRẬN PHÁP] ở thanh dưới để chọn phép lệnh phù hợp với cục diện.',
  },
  {
    tag: 'BƯỚC 4 / 8 · QUỐC SÁCH ĐẠO TRỊ QUỐC',
    title: 'Ban Hành Đạo Trị Quốc',
    text: 'Nút [ĐẠO QUỐC] cho phép chọn 1 trong 3 Đạo: Đạo Thủy Trận (tăng tốc độ rải), Đạo Thao Thiết (giữ rụng 2 quân địch), Đạo Nông Binh (lúa tự thủ thành).',
    tip: 'Mỗi Đạo thay đổi trực tiếp quy luật vật lý của bàn cờ để khắc chế lối chơi của địch.',
  },
  {
    tag: 'BƯỚC 5 / 8 · BẢNG NHIỆM VỤ & THÀNH TRÌ',
    title: 'Nhiệm Vụ & Cứu Nguy Giang Sơn',
    text: 'Bên trái là bảng [NHIỆM VỤ] (kéo thả tùy ý), bên phải là [NHẬT KÝ THÀNH TRÌ]. Nếu nguy cấp cạn quân, hãy nhấn nút [CỨU NGUY] để kích hoạt Toàn Dân Kháng Chiến (+2 quân toàn sân)!',
    tip: 'Nút Cứu Nguy chỉ được kích hoạt 1 lần duy nhất trong toàn bộ ván đấu.',
  },
  {
    tag: 'BƯỚC 6 / 8 · HÃM THÀNH & ĐOẠT QUAN',
    title: 'Quy Luật Công Thành',
    text: 'Ô Quan là đại bản doanh. Nếu bạn rút cạn quân ở cả 2 ô cửa ngõ của Địch Thành, địch sẽ bị HÃM THÀNH (mất 20% giáp mỗi lượt) và mở đường cho ta đập tan sào huyệt!',
    tip: 'Mỗi 3 hiệp địch cũng sẽ phát động đại đợt Công Thành vào Đại Thành ta. Hãy củng cố Doanh Trại và Tháp Canh!',
  },
  {
    tag: 'BƯỚC 7 / 8 · THỰC HÀNH CHỌN VÙNG',
    title: 'Chọn Vùng Đất Khởi Binh',
    text: 'Hãy nhấp chuột vào ô Ruộng Lúa (ô số 0 có 5 quân, vòng phát sáng vàng) ở hàng quân ta để chọn đạo quân xuất trận.',
    tip: 'Chỉ được bốc các ô thuộc quyền kiểm soát của quân ta (viền xanh).',
    action: '👉 NHẤN VÀO Ô RUỘNG LÚA (Ô ĐẦU TIÊN BÊN TRÁI)',
  },
  {
    tag: 'BƯỚC 8 / 8 · BAN LỆNH HÀNH QUÂN',
    title: 'Xuất Binh Rải Thuận',
    text: 'Tuyệt vời! Bây giờ hãy nhấn nút RẢI THUẬN (màu vàng kim ở thanh điều khiển dưới) để phân bổ 5 quân binh đi thu hoạch lúa và củng cố tiền tuyến!',
    tip: 'Nút Rải Thuận có mũi tên hướng sang phải ➔',
    action: '👉 NHẤN NÚT RẢI THUẬN MÀU VÀNG Ở DƯỚI',
  },
]

function Brand(){return <div className="brand"><img className="brand-logo" src={brandLogo} alt="Ô Quan: Dựng Nước"/></div>}

function App(){
 const saved=localStorage.getItem('oquan-profile');const [profile,setProfile]=useState<string|null>(saved);const [name,setName]=useState('');const [screen,setScreen]=useState<Screen>('landing');const [activeModal,setActiveModal]=useState<InfoModal>(null);const [showGuide,setShowGuide]=useState(false);const [lesson,setLesson]=useState(0);const [missionOpen,setMissionOpen]=useState(false);const [citadelOpen,setCitadelOpen]=useState(false)
 const [missionPosition,setMissionPosition]=useState({x:12,y:78});const missionDrag=useRef<{pointerId:number;dx:number;dy:number}|null>(null)
 const [cells,setCells]=useState(initialCells);const [selected,setSelected]=useState<number|null>(null);const [hoveredCell,setHoveredCell]=useState<number|string|null>(null);const [resources,setResources]=useState<Resources>({food:30,wood:20,stone:12});
 
 const [soundMuted,setSoundMuted]=useState(false);
 const [bgmMuted,setBgmMuted]=useState(false);

 useEffect(()=>{
   sound.enabled = !soundMuted;
   sound.bgmEnabled = !bgmMuted;
   if(screen==='game' && !bgmMuted) {
     sound.startBGM();
   } else {
     sound.stopBGM();
   }
 },[soundMuted,bgmMuted,screen]);

 const [gameMode,setGameMode]=useState<GameMode>('ai_defense');
 const [isHost,setIsHost]=useState(true);
 const [roomCode,setRoomCode]=useState('');
 const [inputRoomCode,setInputRoomCode]=useState('');
 const [opponentName,setOpponentName]=useState('Địch Quân');
 const [opponentRank,setOpponentRank]=useState<RankTier>('Hiệp Khách');
 const [copiedCode,setCopiedCode]=useState(false);
 const [matchmakingTimer,setMatchmakingTimer]=useState(0);
 const [playerRankProfile,setPlayerRankProfile]=useState(MultiplayerNetwork.getPlayerProfile());
 const [leaderboardData,setLeaderboardData]=useState<LeaderboardEntry[]>([]);

 // HERO, ARTIFACT & WEATHER STATES
 const [selectedHero, setSelectedHero] = useState<HeroId>('tran_hung_dao');
 const [enemyHero, setEnemyHero] = useState<HeroId>('ly_thuong_kiet');
 const [equippedArtifacts, setEquippedArtifacts] = useState<ArtifactId[]>(['trong_dong', 'no_than']);
 const [currentWeather, setCurrentWeather] = useState<WeatherType>('clear');
 const [weatherTurnsRemaining, setWeatherTurnsRemaining] = useState(4);
 const [heroSkillCooldown, setHeroSkillCooldown] = useState(0);
 const [heroExtraTurn, setHeroExtraTurn] = useState(false);

 // CAMPAIGN & PUZZLE STATES
 const [activeCampaignStageId, setActiveCampaignStageId] = useState<string>('stage_bach_dang');
 const [activePuzzleId, setActivePuzzleId] = useState<number | null>(null);
 const [puzzleTurnsLeft, setPuzzleTurnsLeft] = useState<number>(3);

 const toggleArtifact = (artId: ArtifactId) => {
   setEquippedArtifacts(prev => {
     if (prev.includes(artId)) {
       return prev.filter(id => id !== artId);
     }
     if (prev.length >= 2) {
       return [prev[1], artId];
     }
     return [...prev, artId];
   });
 };

 useEffect(()=>{
   networkManager.setListener((msg)=>{
     if(msg.roomCode !== roomCode && gameMode !== 'pvp_ranked') return;

     if(msg.type === 'ROOM_JOIN' && isHost) {
       setOpponentName(msg.senderName);
       setOpponentRank(msg.senderRank);
       networkManager.broadcast({
         type: 'ROOM_JOINED',
         roomCode,
         senderName: profile || 'Chủ Phòng',
         senderRank: playerRankProfile.tier,
       });
       setCombatBanner({
         type:'reward',
         title:`⚔️ ĐỐI THỦ ĐÃ VÀO PHÒNG!`,
         detail:`${msg.senderName} (${msg.senderRank}) đã tham chiến! Sẵn sàng xuất kích.`
       });
     } else if(msg.type === 'ROOM_JOINED' && !isHost) {
       setOpponentName(msg.senderName);
       setOpponentRank(msg.senderRank);
       setScreen('game');
       setCombatBanner({
         type:'reward',
         title:`ĐÃ VÀO PHÒNG CHIẾN TRANH!`,
         detail:`Đối đầu cùng Chủ phòng ${msg.senderName} (${msg.senderRank})!`
       });
     } else if(msg.type === 'GAME_MOVE') {
       if(msg.payload) {
         executeNetworkOpponentMove(msg.payload.sourceId, msg.payload.direction, msg.payload.troops);
       }
     } else if(msg.type === 'GAME_TACTIC') {
       sound.playTacticCast();
       setCombatBanner({
         type:'tactic',
         title:`⚠️ ĐỐI THỦ TUNG TRẬN PHÁP!`,
         detail:`${opponentName} vừa kích hoạt phép lệnh chiến thuật!`
       });
     }
   });
 },[roomCode, isHost, gameMode, opponentName, profile, playerRankProfile]);

 const executeNetworkOpponentMove=(sourceId: number, direction: -1 | 1, troops: number)=>{
   const path: number[] = [sourceId];
   for(let step=1; step<=troops; step++){
     path.push((sourceId + step * direction + 100) % 10);
   }
   setTurnPhase('enemy_marching');
   setCells(prev=>{
     const next=prev.map(c=>({...c}));
     next[sourceId].soldiers = 0;
     return next;
   });
   setMarchEvent({
     key: Date.now(),
     path,
     sourceId,
     direction,
     totalTroops: troops,
   });
   setCombatBanner({
     type:'ai',
     title:`👤 ${opponentName.toUpperCase()} RẢI ${direction===1?'THUẬN':'NGƯỢC'} (${troops} QUÂN)`,
     detail:`Đối thủ điều quân tiến công!`
   });
 };

 const [round,setRound]=useState(1);
 const [turnPhase,setTurnPhase]=useState<TurnPhase>('player');
 const [siegeCountdown,setSiegeCountdown]=useState(3);
 const [wave,setWave]=useState(1);
 const [castleHp,setCastleHp]=useState(100);
 const [enemyHp,setEnemyHp]=useState(100);
 const [score,setScore]=useState(0);
 const [momentum,setMomentum]=useState(3);
 const [playerDoctrine,setPlayerDoctrine]=useState<Doctrine>('thuy_tran');
 const [traps,setTraps]=useState<TacticalTrap[]>([]);
 const [resilienceUsed,setResilienceUsed]=useState(false);
 const [reverseNextMarch,setReverseNextMarch]=useState(false);
 const [lockedEnemyCell,setLockedEnemyCell]=useState<number|null>(null);

 const [message,setMessage]=useState('LƯỢT CỦA BẠN: Hãy chọn một ô quân ta (0 - 4) để ban lệnh.');
 const [history,setHistory]=useState<string[]>(['Bá tánh bắt đầu dựng nghiệp.']);
 const [viewKey,setViewKey]=useState(0)

 const [marchEvent,setMarchEvent]=useState<MarchEvent|null>(null)
 const [siegeActive,setSiegeActive]=useState(false)
 const [ambushTarget,setAmbushTarget]=useState<number|null>(null)
 const [combatBanner,setCombatBanner]=useState<CombatBanner|null>(null)

 const mission=useMemo(()=>[{title:'Tích cốc phòng cơ',text:'Đưa dân qua Ruộng lúa',reward:'+8 lương',building:'farm'},{title:'Dựng lũy tre xanh',text:'Đưa dân qua Rừng tre',reward:'+6 gỗ',building:'forest'},{title:'Rèn binh giữ cõi',text:'Đưa dân qua Doanh trại',reward:'+10 uy danh',building:'barracks'}][(round-1)%3],[round])
 
 const selectCell=(id:number)=>{
   if(turnPhase!=='player'||marchEvent!==null||siegeActive)return
   if(cells[id].owner!=='player'){
     setMessage('Đây là vùng đất của địch! Hãy chọn ô thuộc quân ta (ô 0 đến 4).');
     return;
   }
   if(cells[id].soldiers===0){
     setMessage('Ô này đang không có quân để rải!');
     return;
   }
   setSelected(id);
   setMessage(`Đã chọn [${BUILDING_INFO[cells[id].building].name}] (${cells[id].soldiers} quân). Nhấn RẢI THUẬN hoặc RẢI NGƯỢC!`);
   if(showGuide && lesson === 6) setLesson(7);
 }

 const command=(direction:-1|1)=>{
   if(turnPhase!=='player'||selected===null||cells[selected].soldiers===0||marchEvent!==null)return;
   const effectiveDir = reverseNextMarch ? (direction === 1 ? -1 : 1) as (-1 | 1) : direction;
   if(reverseNextMarch) setReverseNextMarch(false);

   const sourceId=selected;
   const troops=cells[sourceId].soldiers;
   const path:number[]=[sourceId];
   for(let step=1;step<=troops;step++){
     path.push((sourceId+step*effectiveDir+100)%10);
   }

   setTurnPhase('player_marching');
   setSelected(null);

   setCells(prev=>{
     const next=prev.map(c=>({...c}));
     next[sourceId].soldiers=0;
     return next;
   });

   setMarchEvent({
     key:Date.now(),
     path,
     sourceId,
     direction:effectiveDir,
     totalTroops:troops,
   });

   if(gameMode !== 'ai_defense' && roomCode) {
     networkManager.broadcast({
       type: 'GAME_MOVE',
       roomCode,
       senderName: profile || 'Thành Chủ',
       senderRank: playerRankProfile.tier,
       payload: { sourceId, direction: effectiveDir, troops }
     });
   }

   setCombatBanner({
     type:'march',
     title:`🎮 QUÂN TA RẢI ${effectiveDir===1?'THUẬN ➔':'NGƯỢC ⬅'} (${troops} QUÂN)`,
     detail:`Đang rải quân lần lượt qua từng vùng đất...`
   });
 }

 const handleMarchStep=(stepIndex:number,tileId:number)=>{
   const isPlayerTurn = turnPhase === 'player_marching';
   sound.playStoneClick();

   setCells(prev=>{
     const next=prev.map(c=>({...c}));
     next[tileId].soldiers+=1;
     if(isPlayerTurn && next[tileId].owner === 'enemy') {
       next[tileId].spies = (next[tileId].spies || 0) + 1;
     }
     return next;
   });

   const b=cells[tileId].building;
   const star=cells[tileId].stars || 1;

   // Cổ vật Nỏ Thần: Bắn tỉa địch khi địch đi qua Tháp Canh của ta
   if(!isPlayerTurn && b === 'tower' && cells[tileId].owner === 'player' && equippedArtifacts.includes('no_than')) {
     setCells(prev => {
       const next = prev.map(c => ({...c}));
       if(next[tileId].soldiers > 1) {
         next[tileId].soldiers -= 1;
         sound.playWoodBlock();
       }
       return next;
     });
   }

   if(isPlayerTurn){
     let resGain='';
     let multiplier = star >= 2 ? 2 : 1;

     // Nội tại Hai Bà Trưng: x2 Lương & Gỗ
     if(selectedHero === 'hai_ba_trung' && (b === 'farm' || b === 'forest')) {
       multiplier *= 2;
     }

     // Hiệu ứng Thời tiết: Mưa Lũ x2 Lương, Hạn hán -1 Lương
     let weatherFoodBonus = 0;
     if(currentWeather === 'flood' && b === 'farm') weatherFoodBonus = 2;
     if(currentWeather === 'drought' && b === 'farm') weatherFoodBonus = -1;

     // Cổ vật Trống Đồng: +15% tài nguyên
     const artBonus = equippedArtifacts.includes('trong_dong') ? 1.15 : 1;

     if(b==='farm'){
       const addFood = Math.max(1, Math.round((2 * multiplier + weatherFoodBonus) * artBonus));
       setResources(r=>({...r,food:r.food + addFood}));
       resGain=`🌾 +${addFood} LƯƠNG`;
       sound.playWoodBlock();
     }
     else if(b==='forest'){
       const addWood = Math.max(1, Math.round((2 * multiplier) * artBonus));
       setResources(r=>({...r,wood:r.wood + addWood}));
       resGain=`🎋 +${addWood} GỖ`;
       sound.playWoodBlock();
     }
     else if(b==='workshop'){
       const addStone = Math.max(1, Math.round((1 * multiplier) * artBonus));
       setResources(r=>({...r,stone:r.stone + addStone}));
       resGain=`🪓 +${addStone} ĐÁ`;
       sound.playWoodBlock();
     }
     setMessage(`[Quân ta bước ${stepIndex+1}/${marchEvent?.totalTroops}]: Rải 1 quân xuống [${BUILDING_INFO[b].name} ${star}★] ${resGain ? `➔ ${resGain}` : ''}`);
   } else {
     setMessage(`[Địch bước ${stepIndex+1}/${marchEvent?.totalTroops}]: Địch rải 1 quân xuống [${BUILDING_INFO[b].name}]`);
   }
 }

 const handleMarchDone=()=>{
   if(!marchEvent)return;
   const {path,direction,totalTroops}=marchEvent;
   const lastDrop=path[path.length-1];
   const isPlayerTurn = turnPhase === 'player_marching';
   setMarchEvent(null);

   const next=cells.map(c=>({...c}));
   const gap=(lastDrop+direction+10)%10;
   const target=(gap+direction+10)%10;
   const opponentOwner = isPlayerTurn ? 'enemy' : 'player';

   // Kiểm tra Khiên Danh Tướng: Nếu ô mục tiêu có khiên thì miễn nhiễm cướp quân
   const isTargetShielded = (next[target]?.shieldTurns || 0) > 0;

   if(next[gap].soldiers===0 && next[target].owner===opponentOwner && next[target].soldiers>0 && !isTargetShielded){
     const capturedCount=next[target].soldiers;
     next[target].soldiers=0;
     next[target].owner=isPlayerTurn ? 'player' : 'enemy';
     
     // Hiệu ứng Danh tướng & Cổ vật: Trần Hưng Đạo +2 dmg, Thuận Thiên Kiếm +25% dmg
     let dmg=capturedCount*4;
     if(isPlayerTurn) {
       if(selectedHero === 'tran_hung_dao') dmg += 2;
       if(equippedArtifacts.includes('thuan_thien_kiem')) dmg = Math.round(dmg * 1.25);
     }

     if(isPlayerTurn){
       setEnemyHp(h=>Math.max(0,h-dmg));
       setScore(s=>s+capturedCount*10);
       setMomentum(m=>Math.min(10,m+2));
       setAmbushTarget(target);
       sound.playDongSonDrum();
       setCombatBanner({
         type:'ambush',
         title:`⚔️ PHỤC KÍCH ĐẠI THẮNG!`,
         detail:`Quân ta chiếm [${BUILDING_INFO[next[target].building].name}], thu phục ${capturedCount} lính địch (+2 Thế Khí), Địch Thành mất ${dmg} HP!`
       });
       setHistory(h=>[`[Hiệp ${round}] Quân ta phục kích thu phục ${capturedCount} lính (+2 Thế Khí), Địch Thành -${dmg} HP.`,...h].slice(0,6));
     } else {
       setCastleHp(h=>Math.max(0,h-dmg));
       setMomentum(m=>Math.min(10,m+1));
       sound.playDongSonDrum();
       setCombatBanner({
         type:'ambush',
         title:`⚠️ ĐỊCH PHỤC KÍCH QUÂN TA!`,
         detail:`Địch chiếm [${BUILDING_INFO[next[target].building].name}], bắt ${capturedCount} quân ta (+1 Thế Khí Phẫn Nộ), Đại Thành mất ${dmg} HP!`
       });
       setHistory(h=>[`[Hiệp ${round}] Địch phục kích chiếm [${BUILDING_INFO[next[target].building].name}], Đại Thành -${dmg} HP.`,...h].slice(0,6));
     }
   } else {
     setCombatBanner({
       type: isPlayerTurn ? 'reward' : 'ai',
       title: isPlayerTurn ? `QUÂN TA RẢI XONG` : `ĐỊCH ĐÃ RẢI XONG`,
       detail: isPlayerTurn ? `Đã hoàn tất phân bổ ${totalTroops} quân vào các vùng đất.` : `Địch đã củng cố lực lượng phòng tuyến.`
     });
   }

   // Giảm thời gian Khiên danh tướng
   next.forEach(c => {
     if (c.shieldTurns && c.shieldTurns > 0) c.shieldTurns -= 1;
   });

   setCells(next);

   if(isPlayerTurn){
     setResources(r=>({food:Math.max(0,r.food-2),wood:r.wood,stone:r.stone}));
     setScore(s=>s+5);

     // Kiểm tra Kỹ năng Quang Trung: Đi thêm 1 lượt ngay
     if(heroExtraTurn) {
       setHeroExtraTurn(false);
       setTurnPhase('player');
       setMessage('⚡ HÀNH QUÂN THẦN TỐC: Bạn được bốc tiếp 1 ô quân đi thêm lượt!');
       setCombatBanner({
         type:'tactic',
         title:'⚡ HÀNH QUÂN THẦN TỐC!',
         detail:'Danh tướng Quang Trung thúc quân đi tiếp lượt thứ hai!'
       });
       return;
     }

     if(gameMode === 'ai_defense' || gameMode === 'campaign' || gameMode === 'puzzle') {
       if(gameMode === 'puzzle') {
         setPuzzleTurnsLeft(t => {
           const nextTurns = t - 1;
           if(nextTurns <= 0 && enemyHp > 0) {
             setCombatBanner({
               type:'ai',
               title:'HẾT LƯỢT ĐI THẾ CỜ!',
               detail:'Bạn đã dùng hết số lượt giới hạn của thế cờ.'
             });
           }
           return nextTurns;
         });
       }
       setTimeout(()=>{
         triggerAiTurn(next);
       },1500);
     } else {
       setTurnPhase('enemy');
       setMessage(`LƯỢT CỦA ${opponentName.toUpperCase()}: Đang chờ đối thủ ban lệnh...`);
     }
   } else {
     finishRound(next);
   }

   if(showGuide && lesson === 7 && direction === 1) {
     setShowGuide(false);
     localStorage.setItem('oquan-trained', 'true');
   }
 }

 const triggerAiTurn=(boardCells:Cell[])=>{
   setTurnPhase('enemy');
   setMessage('LƯỢT CỦA ĐỊCH: Đối phương đang suy tính nước rải quân...');

   setCombatBanner({
     type:'ai',
     title:`🤖 LƯỢT ĐỐI PHƯƠNG`,
     detail:`Địch đang quan sát thế trận để chọn ô rải quân...`
   });

   setTimeout(()=>{
     const enemySlots = boardCells.map((c,idx)=>({cell:c,id:idx})).filter(item=>item.cell.owner==='enemy'&&item.cell.soldiers>0);

     if(enemySlots.length===0){
       finishRound(boardCells);
       return;
     }

     let availableSlots = enemySlots;
     if(lockedEnemyCell !== null) {
       availableSlots = enemySlots.filter(s => s.id !== lockedEnemyCell);
       setLockedEnemyCell(null);
     }
     if(availableSlots.length === 0) availableSlots = enemySlots;

     let bestChoice = availableSlots[0];
     let bestDirection: -1 | 1 = 1;
     let foundAmbush = false;

     for(const slot of availableSlots){
       for(const dir of [1, -1] as (-1 | 1)[]){
         const troops = slot.cell.soldiers;
         const lastDrop = (slot.id + troops * dir + 100) % 10;
         const gap = (lastDrop + dir + 10) % 10;
         const target = (gap + dir + 10) % 10;

         if(boardCells[gap].soldiers === 0 && boardCells[target].owner === 'player' && boardCells[target].soldiers > 0){
           bestChoice = slot;
           bestDirection = dir;
           foundAmbush = true;
           break;
         }
       }
       if(foundAmbush) break;
     }

     if(!foundAmbush){
       bestChoice = availableSlots.reduce((max,curr)=>curr.cell.soldiers > max.cell.soldiers ? curr : max, availableSlots[0]);
       bestDirection = Math.random() > 0.5 ? 1 : -1;
     }

     const aiSourceId = bestChoice.id;
     const aiTroops = bestChoice.cell.soldiers;
     const aiPath: number[] = [aiSourceId];
     for(let step=1; step<=aiTroops; step++){
       aiPath.push((aiSourceId + step * bestDirection + 100) % 10);
     }

     setTurnPhase('enemy_marching');

     setCells(prev=>{
       const next=prev.map(c=>({...c}));
       next[aiSourceId].soldiers=0;
       return next;
     });

     setMarchEvent({
       key:Date.now(),
       path:aiPath,
       sourceId:aiSourceId,
       direction:bestDirection,
       totalTroops:aiTroops,
     });

     setCombatBanner({
       type:'ai',
       title:`🤖 ĐỊCH BAN LỆNH RẢI ${bestDirection===1?'THUẬN':'NGƯỢC'} (${aiTroops} QUÂN)`,
       detail:`Địch điều phối ${aiTroops} quân từ [${BUILDING_INFO[boardCells[aiSourceId].building].name}] tiến công!`
     });
   },1600);
 }

 const finishRound=(boardCells:Cell[])=>{
   const nextRound = round + 1;
   setRound(nextRound);

   // Hồi chiêu kỹ năng tướng
   if (heroSkillCooldown > 0) setHeroSkillCooldown(c => c - 1);

   // Cập nhật chu kỳ thời tiết mỗi 3-4 hiệp
   if (weatherTurnsRemaining <= 1) {
     const weatherPool: WeatherType[] = ['clear', 'flood', 'fog', 'drought', 'gale'];
     const nextWeather = weatherPool[Math.floor(Math.random() * weatherPool.length)];
     setCurrentWeather(nextWeather);
     setWeatherTurnsRemaining(WEATHER_TYPES_INFO[nextWeather].durationTurns);
     setCombatBanner({
       type:'reward',
       title:`${WEATHER_TYPES_INFO[nextWeather].icon} THỜI TIẾT ĐỔI: ${WEATHER_TYPES_INFO[nextWeather].name.toUpperCase()}`,
       detail: WEATHER_TYPES_INFO[nextWeather].desc
     });
   } else {
     setWeatherTurnsRemaining(t => t - 1);
   }

   const nextCountdown = siegeCountdown - 1;

   if(nextCountdown <= 0 && (gameMode === 'ai_defense' || gameMode === 'campaign')){
     setSiegeCountdown(3);
     setTurnPhase('siege_alert');
     setTimeout(()=>{
       triggerSiege(boardCells, wave);
     },1800);
   } else {
     setSiegeCountdown(nextCountdown <= 0 ? 3 : nextCountdown);
     setTurnPhase('player');
     setMessage(`LƯỢT CỦA BẠN (Hiệp ${nextRound}): Chọn 1 ô quân ta để rải quân!`);
     setCombatBanner({
       type:'reward',
       title:`BẮT ĐẦU HIỆP ${nextRound}`,
       detail:`Lượt của bạn. Chuẩn bị củng cố phòng tuyến và điều phối quân dân!`
     });
   }
 }

 const triggerSiege=(boardCells:Cell[],currentWave:number)=>{
   const defense=boardCells.filter(c=>c.owner==='player'&&(c.building==='tower'||c.building==='barracks')).reduce((n,c)=>n+c.soldiers,0);
   const attackForce=currentWave*12;
   const damage=Math.max(5,attackForce-defense);

   setTurnPhase('siege_active');
   sound.playSiegeAlarm();
   setCombatBanner({
     type:'siege',
     title:`🔥 ĐỢT CÔNG THÀNH THỨ ${currentWave}!`,
     detail:`Sức ép công kích địch: ${attackForce} ⚔️ | Lực lượng phòng thủ Đại Thành: ${defense} 🛡️ ➔ Đại Thành nhận ${damage} sát thương!`
   });

   setTimeout(()=>{
     setSiegeActive(true);
     setCastleHp(h=>Math.max(0,h-damage));
     setWave(w=>w+1);
     setHistory(h=>[`🔥 [Đợt ${currentWave}] Địch công thành gây ${damage} HP (Phòng thủ cản ${defense}).`,...h].slice(0,6));
   },1200);
 }

 const handleSiegeDone=()=>{
   setSiegeActive(false);
   setTurnPhase('player');
   setMessage(`Đã đẩy lùi đợt công thành! LƯỢT CỦA BẠN (Hiệp ${round}): Hãy củng cố phòng tuyến!`);
   setCombatBanner({
     type:'reward',
     title:`ĐẨY LÙI ĐỢT CÔNG THÀNH!`,
     detail:`Đại Thành vẫn đứng vững! Hãy tiếp tục điều quân tích lương cho đợt vây tiếp theo.`
   });
 }

 const executeHeroSkill=()=>{
   const hero = HEROES_DATABASE[selectedHero];
   // Nón Ba Tầm: Giảm 1 điểm tiêu hao Thế Khí
   const costReduction = equippedArtifacts.includes('non_ba_tam') ? 1 : 0;
   const finalCost = Math.max(1, hero.skillCost - costReduction);

   if(momentum < finalCost || heroSkillCooldown > 0) return;

   sound.playDongSonDrum();
   setMomentum(m => m - finalCost);
   setHeroSkillCooldown(hero.skillCooldown);

   if(selectedHero === 'tran_hung_dao'){
     const targetTile = selected !== null ? selected : 0;
     setCells(prev => {
       const next = prev.map(c => ({...c}));
       next[targetTile].shieldTurns = 3;
       return next;
     });
     setCombatBanner({
       type:'tactic',
       title:`🛡️ HỊCH TƯỚNG SĨ: KHIÊN THIẾT GIÁP`,
       detail:`Trần Hưng Đạo dựng Khiên Thiết Giáp hộ trì [${BUILDING_INFO[cells[targetTile].building].name}] bất khả xâm phạm trong 3 lượt!`
     });
   } else if(selectedHero === 'quang_trung'){
     setHeroExtraTurn(true);
     setCombatBanner({
       type:'tactic',
       title:`⚡ HÀNH QUÂN THẦN TỐC`,
       detail:`Hoàng đế Quang Trung phát lệnh thần tốc: Bạn sẽ được bốc quân đi tiếp ngay sau lượt này!`
     });
   } else if(selectedHero === 'hai_ba_trung'){
     setCells(prev => {
       const next = prev.map(c => ({...c}));
       for(let i=0; i<5; i++){
         if(next[i].owner === 'player') next[i].soldiers += 2;
       }
       return next;
     });
     setCombatBanner({
       type:'tactic',
       title:`🥁 TRỐNG ĐỒNG XUNG TRẬN`,
       detail:`Trưng Nữ Vương hiệu triệu bách tính: Bổ sung ngay +2 quân cho toàn bộ 5 vùng đất quân ta!`
     });
   } else if(selectedHero === 'ly_thuong_kiet'){
     setReverseNextMarch(true);
     setCombatBanner({
       type:'tactic',
       title:`🌊 NHƯ NGUYỆT TRẬN ĐỒ`,
       detail:`Thái úy Lý Thường Kiệt bày trận đồ trên sông, ép nước đi kế tiếp bị đổi hướng thần sầu!`
     });
   }
 };

 const executeTactic=(commandId: string)=>{
   const cmd = TACTICAL_COMMANDS.find(c=>c.id===commandId);
   if(!cmd || momentum < cmd.cost) return;

   sound.playTacticCast();
   setMomentum(m=>m-cmd.cost);
   setActiveModal(null);

   if(commandId === 'reverse_flow'){
     setReverseNextMarch(true);
     setCombatBanner({
       type:'tactic',
       title:`✨ TRẬN PHÁP: BẺ CHIỀU CỜ`,
       detail:`Nước rải kế tiếp sẽ tự động đổi chiều ngược lại hướng ban lệnh!`
     });
   } else if(commandId === 'recruit_troop' && selected !== null){
     setCells(prev=>{
       const next=prev.map(c=>({...c}));
       next[selected].soldiers += 2;
       return next;
     });
     setCombatBanner({
       type:'tactic',
       title:`🚩 TRẬN PHÁP: ĐIỂM BINH`,
       detail:`Đã bổ sung +2 binh sĩ vào [${BUILDING_INFO[cells[selected].building].name}]!`
     });
   } else if(commandId === 'spike_trap' && selected !== null){
     setTraps(prev=>[...prev, { tileId: selected, placedBy: 'player', durationTurns: 2 }]);
     setCombatBanner({
       type:'tactic',
       title:`🪵 TRẬN PHÁP: BÃI CHÔNG`,
       detail:`Đã cài bẫy chông mở tại [${BUILDING_INFO[cells[selected].building].name}] trong 2 lượt!`
     });
   } else if(commandId === 'lock_tile'){
     const enemySlots = cells.filter(c=>c.owner==='enemy'&&c.soldiers>0);
     if(enemySlots.length>0){
       const target = enemySlots[0].id;
       setLockedEnemyCell(target);
       setCombatBanner({
         type:'tactic',
         title:`🔒 TRẬN PHÁP: PHONG THỔ LỆNH`,
         detail:`Đã khóa [${BUILDING_INFO[cells[target].building].name}] của địch trong 1 lượt!`
       });
     }
   } else if(commandId === 'detonate_spies'){
     const totalSpies = cells.reduce((acc, c)=>acc + (c.spies || 0), 0);
     const spyDmg = totalSpies * 12 + 10;
     setEnemyHp(h=>Math.max(0, h-spyDmg));
     setCells(prev=>prev.map(c=>({...c, spies: 0})));
     setCombatBanner({
       type:'tactic',
       title:`💥 NỘI ỨNG NGOẠI HỢP!`,
       detail:`Kích nổ toàn bộ ${totalSpies} quân gián điệp, Địch Thành chấn động nhận ${spyDmg} sát thương!`
     });
   }

   if(gameMode !== 'ai_defense' && roomCode) {
     networkManager.broadcast({
       type: 'GAME_TACTIC',
       roomCode,
       senderName: profile || 'Thành Chủ',
       senderRank: playerRankProfile.tier,
       payload: { commandId }
     });
   }
 }

 const upgradeBuilding=(id: number)=>{
   if(cells[id].owner!=='player') return;
   const currentStar = cells[id].stars || 1;
   if(currentStar >= 3) return;

   const cost = currentStar === 1 ? {food:10,wood:10,stone:5} : {food:20,wood:20,stone:12};
   if(resources.food < cost.food || resources.wood < cost.wood || resources.stone < cost.stone){
     setMessage(`Không đủ tài nguyên! Cần ${cost.food} Lương, ${cost.wood} Gỗ, ${cost.stone} Đá.`);
     return;
   }

   setResources(r=>({
     food: r.food - cost.food,
     wood: r.wood - cost.wood,
     stone: r.stone - cost.stone,
   }));

   setCells(prev=>{
     const next=prev.map(c=>({...c}));
     next[id].stars = ((next[id].stars || 1) + 1) as 1 | 2 | 3;
     return next;
   });

   setCombatBanner({
     type:'reward',
     title:`⭐ THĂNG CẤP THÀNH CÔNG!`,
     detail:`[${BUILDING_INFO[cells[id].building].name}] đã thăng lên cấp ${currentStar + 1}★, tăng gấp đôi sản lượng!`
   });
 }

 const handleAmbushDone=()=>{
   setAmbushTarget(null);
 }

 const triggerResilience=()=>{
   if(resilienceUsed) return;
   setResilienceUsed(true);
   setCells(prev=>{
     const next=prev.map(c=>({...c}));
     for(let i=0; i<5; i++){
       next[i].soldiers += 2;
     }
     return next;
   });
   setCombatBanner({
     type:'reward',
     title:`🔥 TOÀN DÂN KHÁNG CHIẾN!`,
     detail:`Mở kho Quan nhà, chiêu mộ +2 quân cho toàn bộ 5 ô đất sân nhà cứu nguy bờ cõi!`
   });
 }

 const startCampaignStage=(stageId: string)=>{
   const stage = CAMPAIGN_STAGES.find(s=>s.id===stageId) || CAMPAIGN_STAGES[0];
   setActiveCampaignStageId(stage.id);
   setGameMode('campaign');
   setOpponentName(stage.enemyName);
   setEnemyHero(stage.enemyHero as HeroId);
   setCurrentWeather(stage.weather);
   setWeatherTurnsRemaining(WEATHER_TYPES_INFO[stage.weather].durationTurns);
   setCastleHp(stage.playerBaseHp);
   setEnemyHp(stage.enemyBaseHp);
   setResources(stage.initialResources);
   setRound(1);
   setTurnPhase(stage.firstMove === 'player' ? 'player' : 'enemy');
   setCells(initialCells());
   setScreen('game');
   setCombatBanner({
     type:'reward',
     title:`⚔️ HỒI ${stage.chapter}: ${stage.title.toUpperCase()}`,
     detail: stage.storyIntro
   });
 };

 const startPuzzleStage=(puzzleId: number)=>{
   const puzzle = PUZZLE_LEVELS.find(p=>p.id===puzzleId) || PUZZLE_LEVELS[0];
   setActivePuzzleId(puzzle.id);
   setGameMode('puzzle');
   setPuzzleTurnsLeft(puzzle.maxTurns);
   setOpponentName(puzzle.historicalRef);
   setCastleHp(puzzle.playerHp);
   setEnemyHp(puzzle.enemyHp);
   setResources(puzzle.resources);
   setRound(1);
   setTurnPhase('player');

   // Khởi tạo bàn cờ theo thế cờ
   const puzCells: Cell[] = puzzle.initialBoard.soldiers.map((s, id) => ({
     id,
     soldiers: s,
     building: (puzzle.initialBoard.buildings?.[id] || ['farm','forest','workshop','barracks','tower','farm','forest','workshop','barracks','tower'][id]) as Cell['building'],
     owner: id < 5 ? 'player' : 'enemy',
     stars: 1,
     spies: 0,
   }));
   setCells(puzCells);
   setScreen('game');
   setCombatBanner({
     type:'reward',
     title:`🧩 THẾ CỜ: ${puzzle.title.toUpperCase()}`,
     detail:`Mục tiêu: ${puzzle.objective.label} (Tối đa ${puzzle.maxTurns} lượt)`
   });
 };

 const reset=()=>{
   setCells(initialCells());
   setSelected(null);
   setMarchEvent(null);
   setSiegeActive(false);
   setAmbushTarget(null);
   setCombatBanner(null);
   setTurnPhase('player');
   setRound(1);
   setSiegeCountdown(3);
   setResources({food:30,wood:20,stone:12});
   setWave(1);
   setCastleHp(100);
   setEnemyHp(100);
   setScore(0);
   setCurrentWeather('clear');
   setHeroSkillCooldown(0);
   setHeroExtraTurn(false);
   setMessage('LƯỢT CỦA BẠN: Hãy chọn một ô quân ta (0 - 4) để ban lệnh.');
   setHistory(['Một vận hội mới bắt đầu.']);
 }

 const createCustomRoom=()=>{
   const code = MultiplayerNetwork.generateRoomCode();
   setRoomCode(code);
   setIsHost(true);
   setGameMode('pvp_custom');
   setOpponentName('Đang chờ bạn...');
   networkManager.broadcast({
     type: 'ROOM_CREATE',
     roomCode: code,
     senderName: profile || 'Thành Chủ',
     senderRank: playerRankProfile.tier,
   });
   setScreen('game');
   setActiveModal('create_room');
 };

 const joinCustomRoom=(code: string)=>{
   const trimmed = code.trim();
   if(trimmed.length !== 6) {
     alert('Mã phòng phải gồm đúng 6 chữ số!');
     return;
   }
   setRoomCode(trimmed);
   setIsHost(false);
   setGameMode('pvp_custom');
   networkManager.broadcast({
     type: 'ROOM_JOIN',
     roomCode: trimmed,
     senderName: profile || 'Thành Chủ',
     senderRank: playerRankProfile.tier,
   });
   setActiveModal(null);
   setScreen('game');
 };

 const startRankedMatchmaking=()=>{
   setGameMode('pvp_ranked');
   setScreen('ranked_matchmaking');
   setMatchmakingTimer(0);
   
   const interval = window.setInterval(()=>{
     setMatchmakingTimer(t => t + 1);
   }, 1000);

   setTimeout(()=>{
     clearInterval(interval);
     const fakeOpponents = [
       { name: 'Quang Trung', rank: 'Đại Thành Chủ' as RankTier },
       { name: 'Ngô Quyền', rank: 'Thống Lĩnh' as RankTier },
       { name: 'Đinh Bộ Lĩnh', rank: 'Tiên Phong' as RankTier },
       { name: 'Yết Kiêu', rank: 'Hiệp Khách' as RankTier },
       { name: 'Trần Bình Trọng', rank: 'Hiệp Khách' as RankTier },
     ];
     const matched = fakeOpponents[Math.floor(Math.random() * fakeOpponents.length)];
     setOpponentName(matched.name);
     setOpponentRank(matched.rank);
     setRoomCode(MultiplayerNetwork.generateRoomCode());
     setIsHost(true);
     setScreen('game');
     setCombatBanner({
       type:'reward',
       title:`⚔️ ĐÃ TÌM THẤY ĐỐI THỦ RANK!`,
       detail:`Đối đầu cùng ${matched.name} (${matched.rank})!`
     });
   }, 3200);
 };

 const openLeaderboard=()=>{
   setLeaderboardData(MultiplayerNetwork.getLeaderboard(profile || 'Bạn'));
   setScreen('leaderboard');
 };

 const createProfile=()=>{
   const n=name.trim()||'Thành chủ';
   localStorage.setItem('oquan-profile',n);
   setProfile(n);
   enterGame(true);
 }
 const enterGame=(tutorial=false)=>{
   setScreen('game');
   if(tutorial || !localStorage.getItem('oquan-trained')){
     setLesson(0);
     setShowGuide(true);
   }
 }
 const startMissionDrag=(event:React.PointerEvent<HTMLElement>)=>{if(missionOpen||(event.target as HTMLElement).closest('button'))return;const box=event.currentTarget.getBoundingClientRect();missionDrag.current={pointerId:event.pointerId,dx:event.clientX-box.left,dy:event.clientY-box.top};event.currentTarget.setPointerCapture(event.pointerId);event.preventDefault()}
 const moveMissionDrag=(event:React.PointerEvent<HTMLElement>)=>{const drag=missionDrag.current;if(!drag||drag.pointerId!==event.pointerId)return;setMissionPosition({x:Math.max(0,Math.min(window.innerWidth-260,event.clientX-drag.dx)),y:Math.max(64,Math.min(window.innerHeight-48,event.clientY-drag.dy))})}
 const stopMissionDrag=(event:React.PointerEvent<HTMLElement>)=>{if(missionDrag.current?.pointerId===event.pointerId){missionDrag.current=null;event.currentTarget.releasePointerCapture(event.pointerId)}}

 if(screen==='landing') return (
   <div className="landing screen">
     <div className="landing-glow"/>
     <nav>
       <Brand/>
       <div className="landing-navlinks">
         <button type="button" onClick={()=>setActiveModal('world')}>THẾ GIỚI</button>
         <button type="button" onClick={()=>setActiveModal('rules')}>LUẬT CHƠI</button>
         <button type="button" onClick={()=>setActiveModal('chronicle')}>BIÊN NIÊN SỬ</button>
       </div>
       <button className="ghost login-button" onClick={()=>profile?setScreen('lobby'):setScreen('profile')}>
         {profile?'VÀO ĐẠI SẢNH':'ĐĂNG NHẬP'} <ChevronRight/>
       </button>
     </nav>
     <section className="hero">
       <span className="overline">MỘT HUYỀN THOẠI DÂN GIAN · MỘT CHIẾN TRƯỜNG MỚI</span>
       <h1>RẢI QUÂN<br/><em>DỰNG NƯỚC</em></h1>
       <p>Điều dân, tích lương, dựng thành. Mỗi nước rải định đoạt vận mệnh một giang sơn.</p>
       <div className="hero-actions">
         <button className="cta" onClick={()=>profile?setScreen('lobby'):setScreen('profile')}>
           <Play/> {profile?'VÀO ĐẠI SẢNH THÀNH CHỦ':'BẮT ĐẦU DỰNG NƯỚC'}
         </button>
         <button className="ghost" onClick={()=>{if(profile)enterGame(true);else setScreen('profile')}}>
           <BookOpen/> TÌM HIỂU CÁCH CHƠI
         </button>
       </div>
       <div className="hero-proof">
         <span><b>10</b> vùng đất</span>
         <span><b>2</b> thành trì</span>
         <span><b>∞</b> thế cờ</span>
       </div>
     </section>
     <div className="landing-board">
       <Board3D cells={DEFAULT_CELLS} selected={null} onSelect={()=>{}} isLanding={true}/>
     </div>
     <div className="landing-flags" aria-hidden="true"><i/><i/><i/></div>
     <section className="landing-features">
       <article><Sprout/><div><b>DỰNG NGHIỆP</b><span>Điều dân, tích lương và nuôi lớn từng vùng đất.</span></div></article>
       <article><Shield/><div><b>GIỮ THÀNH</b><span>Dựng phòng tuyến trước từng đợt quân vây hãm.</span></div></article>
       <article><Swords/><div><b>ĐỊNH THẾ CỜ</b><span>Một nước rải đúng lúc có thể đổi vận giang sơn.</span></div></article>
     </section>
     <aside className="daily-strategy">
       <span>THẾ CỜ HÔM NAY</span>
       <b>“Lấy dân làm gốc,<br/>lấy thế làm thành.”</b>
       <small>Thử thách: giữ Đại Thành qua 5 đợt vây</small>
     </aside>
     <footer>
       <span>PHIÊN BẢN PROTOTYPE · CHIẾN THUẬT DÂN GIAN VIỆT NAM</span>
     </footer>

     {activeModal && (
       <div className="info-modal-backdrop" onClick={()=>setActiveModal(null)}>
         <div className="info-modal-card ornamental" onClick={e=>e.stopPropagation()}>
           <button className="modal-close" onClick={()=>setActiveModal(null)}>✕</button>

           {activeModal === 'world' && (
             <div className="modal-content">
               <span className="overline"><Compass/> THẾ GIỚI & BỐI CẢNH</span>
               <h2>Giang Sơn Ô Quan: Dựng Nước</h2>
               <p className="lead">
                 Bàn cờ dân gian ngàn năm nay đã thức giấc, hóa thành một cõi bờ non nước với hai đầu thành trì và mười vùng đất trù phú.
               </p>

               <div className="modal-grid-2">
                 <div className="info-box">
                   <h3><Castle/> Đại Thành (Phe Ta)</h3>
                   <p>Đại bản doanh hoàng gia ngói đỏ mái đao, ngự trên thềm đá chạm hoa văn sóng nước cổ truyền. Nơi hội tụ tinh hoa dân tộc với biểu tượng <b>Trống Đồng Đông Sơn</b> thiêng liêng.</p>
                 </div>
                 <div className="info-box danger">
                   <h3><Swords/> Địch Thành (Kẻ Thù)</h3>
                   <p>Pháo đài hắc diện bao quanh bởi lửa than và quặng sắt. Chúng không ngừng dòm ngó bờ cõi và phát động các đợt công thành vây hãm Đại Thành.</p>
                 </div>
               </div>

               <hr/>

               <h3>5 Vùng Đất Trù Phú</h3>
               <div className="territory-list">
                 <div className="territory-item"><b>🌾 Ruộng Lúa:</b> Canh tác lúa nước, thu hoạch lương thực nuôi sống quân dân.</div>
                 <div className="territory-item"><b>🎋 Rừng Tre:</b> Khai thác tre ngà, dựng lũy tre xanh chống giặc ngoại xâm.</div>
                 <div className="territory-item"><b>🪓 Xưởng Mộc & Lò Nung:</b> Cưa xẻ gỗ quý, đúc đá và vật liệu kiến tạo thành quách.</div>
                 <div className="territory-item"><b>⚔️ Doanh Trại:</b> Rèn cán luyện quân, chuẩn bị lực lượng phòng thủ vững chắc.</div>
                 <div className="territory-item"><b>🏹 Tháp Canh:</b> Đài quan sát tiền tuyến, bố trí quân canh quan sát động tĩnh kẻ địch.</div>
               </div>
             </div>
           )}

           {activeModal === 'rules' && (
             <div className="modal-content">
               <span className="overline"><BookOpen/> HỆ THỐNG LUẬT CHƠI</span>
               <h2>Quy Luật Rải Quân Dựng Nghiệp</h2>
               <p className="lead">
                 Kế thừa 100% tinh hoa đếm và rải quân của Ô Ăn Quan truyền thống, kết hợp cơ chế chiến thuật quản lý tài nguyên.
               </p>

               <div className="rule-step">
                 <div className="step-num">1</div>
                 <div>
                   <h4>Chọn Vùng Đất & Ban Lệnh</h4>
                   <p>Nhấp chọn một ô thuộc quyền kiểm soát có người. Chọn lệnh <b>RẢI THUẬN</b> (qua phải) hoặc <b>RẢI NGƯỢC</b> (qua trái).</p>
                 </div>
               </div>

               <div className="rule-step">
                 <div className="step-num">2</div>
                 <div>
                   <h4>Hành Quân & Thu Thập Tài Nguyên</h4>
                   <p>Mỗi bước quân đi qua một vùng sẽ kích hoạt sản xuất ngay lập tức: <b>+2 Lương</b> (Ruộng), <b>+2 Gỗ</b> (Rừng), <b>+1 Đá</b> (Xưởng).</p>
                 </div>
               </div>

               <div className="rule-step">
                 <div className="step-num">3</div>
                 <div>
                   <h4>Phục Kích & Thu Phục Đất Địch</h4>
                   <p>Nếu điểm rơi quân kết thúc cách 1 ô trống và ô kế tiếp là quân địch, người chơi lập tức <b>Phục Kích</b>: thu nạp toàn bộ số quân địch, đổi chủ quyền ô đất sang quân ta và trừ trực tiếp máu Địch Thành!</p>
                 </div>
               </div>

               <div className="rule-step">
                 <div className="step-num">4</div>
                 <div>
                   <h4>Thủ Thành Kháng Địch</h4>
                   <p>Mỗi 3 lượt, địch sẽ phát động 1 đợt <b>Công Thành</b>. Lực lượng phòng thủ tại Doanh Trại và Tháp Canh sẽ giảm sát thương lên Đại Thành.</p>
                 </div>
               </div>
             </div>
           )}

           {activeModal === 'chronicle' && (
             <div className="modal-content">
               <span className="overline"><Trophy/> BIÊN NIÊN SỬ</span>
               <h2>Sử Sách Giang Sơn Đại Thành</h2>
               <p className="lead">
                 Ghi nhận những trang sử vàng son của các bậc tiền nhân trong hành trình mở cõi và giữ vững bờ cõi.
               </p>

               <div className="chronicle-timeline">
                 <div className="timeline-item">
                   <div className="timeline-date">KỶ NGUYÊN I</div>
                   <h4>Khai Sơn Phá Thạch</h4>
                   <p>Bá tánh men theo dòng sông Hồng ngọc bích, dựng nên những thước ruộng đầu tiên và lũy tre giữ làng.</p>
                 </div>

                 <div className="timeline-item">
                   <div className="timeline-date">KỶ NGUYÊN II</div>
                   <h4>Đúc Đồng Dựng Lũy</h4>
                   <p>Vua ban chiếu rèn Trống Đồng Đông Sơn làm báu vật trấn quốc, xây đài tháp canh và mở xưởng chế tác.</p>
                 </div>

                 <div className="timeline-item">
                   <div className="timeline-date">KỶ NGUYÊN III</div>
                   <h4>Kháng Địch Giữ Thành</h4>
                   <p>Địch Thành trỗi dậy từ phương Bắc. Toàn dân đồng lòng lấy dân làm gốc, lấy thế làm thành, viết tiếp thiên sử thi.</p>
                 </div>
               </div>

               <div className="chronicle-badge">
                 <Sparkles/> <span>Thành tích của người sẽ được khắc vào sử sách sau mỗi trận khải hoàn!</span>
               </div>
             </div>
           )}

           <button className="cta full" onClick={()=>setActiveModal(null)}>ĐÃ HIỂU <ChevronRight/></button>
         </div>
       </div>
     )}
   </div>
 );

 if(screen==='profile') return (
   <div className="profile-screen screen">
     <div className="profile-backdrop"><Board3D cells={DEFAULT_CELLS} selected={null} onSelect={()=>{}} isLanding={true}/></div>
     <button className="back-link" onClick={()=>setScreen('landing')}><ArrowLeft/> TRỞ VỀ</button>
     <div className="profile-card ornamental">
       <div className="mini-seal">御</div>
       <span className="overline">TÂN THÀNH CHỦ</span>
       <h1>Khởi tạo hồ sơ</h1>
       <p>Danh hiệu sẽ được khắc vào sử sách và dùng để lưu hành trình dựng nước.</p>
       <label>TÊN HIỆU CỦA NGƯỜI</label>
       <div className="carved-input">
         <UserRound/>
         <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&createProfile()} placeholder="Ví dụ: Minh Chủ" autoFocus/>
       </div>
       <button className="cta full" onClick={createProfile}>KHẮC TÊN VÀO SỬ SÁCH <ChevronRight/></button>
       <small><Shield/> Hồ sơ prototype được lưu an toàn trên trình duyệt này</small>
     </div>
   </div>
 );

 if(screen==='lobby') return (
   <LobbyPage
     profile={profile}
     playerRankProfile={playerRankProfile}
     selectedHero={selectedHero}
     equippedArtifacts={equippedArtifacts}
     onSelectHero={setSelectedHero}
     onToggleArtifact={toggleArtifact}
     onStartCampaign={(stageId)=>{
       if(stageId) startCampaignStage(stageId);
       else {
         setGameMode('ai_defense');
         enterGame(!localStorage.getItem('oquan-trained'));
       }
     }}
     onStartPuzzle={(puzzleId)=>startPuzzleStage(puzzleId)}
     onOpenPvpLobby={()=>setScreen('pvp_lobby')}
     onStartRanked={startRankedMatchmaking}
     onOpenLeaderboard={openLeaderboard}
     onOpenRules={()=>setActiveModal('rules')}
     onOpenSettings={()=>setActiveModal('settings')}
     onLogout={()=>setScreen('landing')}
   />
 );

 if(screen==='pvp_lobby') return (
   <div className="pvp-lobby-screen screen">
     <div className="profile-backdrop"><Board3D cells={DEFAULT_CELLS} selected={null} onSelect={()=>{}} isLanding={true}/></div>
     <button className="back-link" onClick={()=>setScreen('lobby')}><ArrowLeft/> TRỞ VỀ ĐẠI SẢNH</button>
     
     <div className="pvp-lobby-card ornamental">
       <div className="mini-seal">⚔️</div>
       <span className="overline">ĐẤU TRÍ TRỰC TUYẾN</span>
       <h1>Phòng Đấu Bạn Bè</h1>
       <p>Tạo phòng chiến thuật hoặc nhập mã số 6 chữ số từ bạn bè để bắt đầu trận cờ đối kháng.</p>

       <div className="pvp-action-row">
         <button className="cta full" onClick={createCustomRoom}>
           <Castle/> TẠO PHÒNG MỚI (LẤY MÃ 6 SỐ)
         </button>
         
         <div className="join-room-box">
           <label>HOẶC NHẬP MÃ PHÒNG (6 SỐ)</label>
           <div className="carved-input">
             <input
               value={inputRoomCode}
               onChange={e=>setInputRoomCode(e.target.value.replace(/\D/g,'').slice(0,6))}
               placeholder="Ví dụ: 829104"
               maxLength={6}
             />
             <button className="cta" disabled={inputRoomCode.length!==6} onClick={()=>joinCustomRoom(inputRoomCode)}>
               VÀO PHÒNG
             </button>
           </div>
         </div>
       </div>
     </div>
   </div>
 );

 if(screen==='ranked_matchmaking') return (
   <div className="matchmaking-screen screen">
     <div className="profile-backdrop"><Board3D cells={DEFAULT_CELLS} selected={null} onSelect={()=>{}} isLanding={true}/></div>
     <div className="matchmaking-modal ornamental">
       <div className="radar-spinner"/>
       <span className="overline">HỆ THỐNG GHÉP ĐẤU TOÀN QUỐC</span>
       <h2>Đang Tìm Đối Thủ Leo Rank...</h2>
       <div className="matchmaking-player-badge">
         <UserRound/>
         <div>
           <b>{profile || 'Thành Chủ'}</b>
           <span style={{color: getRankColor(playerRankProfile.tier)}}>{playerRankProfile.tier} ({playerRankProfile.lp} LP)</span>
         </div>
       </div>
       <div className="timer-badge">⏳ Thời gian tìm: {matchmakingTimer}s</div>
       <p>Hệ thống đang quét các Thành Chủ có bậc Rank tương đương...</p>
       <button className="ghost full" onClick={()=>setScreen('lobby')}>HỦY TÌM TRẬN</button>
     </div>
   </div>
 );

 if(screen==='leaderboard') return (
   <div className="leaderboard-screen screen">
     <header><Brand/><button className="back-link" onClick={()=>setScreen('lobby')}><ArrowLeft/> TRỞ VỀ</button></header>
     <main className="leaderboard-main ornamental">
       <div className="leaderboard-header">
         <div className="leaderboard-title">
           <Trophy size={32} color="#ffd700"/>
           <div>
             <span className="overline">BẢNG VÀNG DANH VỌNG</span>
             <h1>Bảng Xếp Hạng Thành Chủ Đại Việt</h1>
           </div>
         </div>
         <div className="my-rank-summary">
           <span>Hạng Của Bạn: <b>#9</b></span>
           <span style={{color: getRankColor(playerRankProfile.tier)}}>{playerRankProfile.tier} ({playerRankProfile.lp} LP)</span>
         </div>
       </div>

       <div className="leaderboard-table-wrap">
         <table className="leaderboard-table">
           <thead>
             <tr>
               <th>HẠNG</th>
               <th>THÀNH CHỦ</th>
               <th>BẬC RANK</th>
               <th>ĐIỂM LP</th>
               <th>THẮNG / THUA</th>
               <th>TỶ LỆ THẮNG</th>
             </tr>
           </thead>
           <tbody>
             {leaderboardData.map(entry => (
               <tr key={entry.rank} className={entry.name.includes('Bạn') ? 'my-row' : ''}>
                 <td className="rank-col">
                   {entry.rank === 1 ? '🥇 1' : entry.rank === 2 ? '🥈 2' : entry.rank === 3 ? '🥉 3' : `#${entry.rank}`}
                 </td>
                 <td className="name-col">
                   <span className="avatar-ico">{entry.avatarIcon}</span>
                   <b>{entry.name}</b>
                 </td>
                 <td style={{color: getRankColor(entry.tier), fontWeight: 800}}>{entry.tier}</td>
                 <td className="lp-col">{entry.lp} LP</td>
                 <td>{entry.wins}T / {entry.losses}B</td>
                 <td>
                   <div className="winrate-bar">
                     <span>{entry.winRate}%</span>
                     <i><em style={{width:`${entry.winRate}%`}}/></i>
                   </div>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </main>
   </div>
 );

 return <main className={`battle screen ${siegeActive ? 'screen-siege-alert' : ''}`}><div className="battle-world"><Board3D cells={cells} selected={selected} onSelect={selectCell} onHover={setHoveredCell} marchEvent={marchEvent} onMarchStep={handleMarchStep} onMarchDone={handleMarchDone} siegeActive={siegeActive} onSiegeDone={handleSiegeDone} ambushTarget={ambushTarget} onAmbushDone={handleAmbushDone} traps={traps} weather={currentWeather} resetViewKey={viewKey}/></div><header className="top-hud hud"><Brand/><div className="resources"><Resource icon={<Sprout/>} label="LƯƠNG" value={resources.food} max={60} color="#6f9339"/><Resource icon={<Trees/>} label="GỖ" value={resources.wood} max={60} color="#a26432"/><Resource icon={<Hammer/>} label="ĐÁ" value={resources.stone} max={60} color="#8c929a"/><div className="resource momentum-resource" title="Thế Khí dùng thi triển Trận Pháp"><Zap color="#ffd048"/><div><span>THẾ KHÍ</span><i><em style={{width:`${Math.min(100,(momentum/10)*100)}%`,background:'linear-gradient(90deg,#d97706,#f59e0b,#fde047)'}}/></i></div><b>{momentum}/10</b></div><div className="prestige"><Coins/><span>UY DANH</span><b>{score}</b></div></div>
 
 <div className="turn-info">
   <b>HIỆP {String(round).padStart(2,'0')} · {turnPhase==='player'?'LƯỢT QUÂN TA':`LƯỢT ${opponentName.toUpperCase()}`}</b>
   <span className={siegeCountdown===1?'warning':''}>
     {gameMode==='puzzle' ? `THẾ CỜ: CÒN ${puzzleTurnsLeft} LƯỢT` : gameMode==='ai_defense' || gameMode==='campaign' ? `CÔNG THÀNH: ${siegeCountdown} HIỆP NỮA` : `ĐỐI ĐẦU PVP: PHÒNG #${roomCode || '000000'}`}
   </span>
 </div>

 <div className="weather-hud-pill" title={WEATHER_TYPES_INFO[currentWeather].desc}>
   <span>{WEATHER_TYPES_INFO[currentWeather].icon} {WEATHER_TYPES_INFO[currentWeather].name}</span>
   <small>({weatherTurnsRemaining} hiệp)</small>
 </div>
 
 <button title="Đặt lại góc nhìn toàn cảnh sa bàn" onClick={()=>setViewKey(k=>k+1)}><Compass/></button><button title="Cài đặt âm thanh" onClick={()=>setActiveModal('settings')}><Settings/></button><button onClick={()=>setShowGuide(true)}><HelpCircle/></button><button onClick={()=>setScreen('lobby')}><Pause/></button><div className="avatar" onClick={()=>setActiveModal('hero_detail')} style={{cursor:'pointer'}} title="Chi tiết Danh Tướng">{HEROES_DATABASE[selectedHero].avatar}</div></header>

 {siegeActive && (
   <div className="siege-cinematic-banner">
     <div className="siege-badge-pulse">⚠️ BÁO ĐỘNG KHẨN CẤP: ĐỢT CÔNG THÀNH {wave - 1}</div>
     <h2>ĐẠI ĐỘI ĐỊCH ĐANG LAO VÀO CÔNG PHÁ ĐẠI THÀNH!</h2>
     <p>Các tháp canh và doanh trại đang dốc toàn lực bắn tên dựng khiên chống đỡ!</p>
   </div>
 )}

 {combatBanner && (
   <div className={`combat-banner-hud hud ${combatBanner.type}`}>
     <div className="combat-banner-inner">
       <div className="banner-badge">
         {combatBanner.type === 'march' && '🚩 QUÂN TA RẢI'}
         {combatBanner.type === 'ai' && '🤖 ĐỊCH RẢI'}
         {combatBanner.type === 'ambush' && '⚔️ PHỤC KÍCH'}
         {combatBanner.type === 'siege' && '🔥 CÔNG THÀNH'}
         {combatBanner.type === 'reward' && '✨ CHIẾN CUỘC'}
       </div>
       <div className="banner-text">
         <h3>{combatBanner.title}</h3>
         <p>{combatBanner.detail}</p>
       </div>
       <button className="banner-close" onClick={()=>setCombatBanner(null)}>✕</button>
     </div>
   </div>
 )}

 {hoveredCell !== null && (
   <div className={`hover-detail-card hud ${typeof hoveredCell === 'string' ? hoveredCell : cells[hoveredCell].owner}`}>
     {typeof hoveredCell === 'string' ? (
       hoveredCell === 'player' ? (
         <>
           <div className="card-header">
             <span className="card-icon">🏛️</span>
             <div>
               <h4>ĐẠI THÀNH (BẢN DOANH)</h4>
               <span className="card-owner player">★ HOÀNG GIA ĐẠI VIỆT</span>
             </div>
           </div>
           <div className="card-badges">
             <div className="mini-badge">
               <span>🛡️ Độ Bền Thành:</span>
               <b>{castleHp} / 100 HP</b>
             </div>
             <div className="mini-badge gain">
               <span>⚔️ Phòng Tuyến:</span>
               <b>{cells.filter(c=>c.owner==='player'&&(c.building==='tower'||c.building==='barracks')).reduce((n,c)=>n+c.soldiers,0)} Giáp Cản</b>
             </div>
           </div>
         </>
       ) : (
         <>
           <div className="card-header">
             <span className="card-icon">🏰</span>
             <div>
               <h4>{opponentName.toUpperCase()} ({opponentRank})</h4>
               <span className="card-owner enemy">◆ PHÁO ĐÀI ĐỐI PHƯƠNG</span>
             </div>
           </div>
           <div className="card-badges">
             <div className="mini-badge">
               <span>⚔️ Độ Bền Địch:</span>
               <b>{enemyHp} / 100 HP</b>
             </div>
             <div className="mini-badge" style={{color: '#ff6b6b'}}>
               <span>🔥 Trạng Thái:</span>
               <b>{gameMode==='ai_defense'?`Đợt ${wave} (${wave*12} Sức Ép)`:'Đối Kháng Trực Tiếp'}</b>
             </div>
           </div>
         </>
       )
     ) : (
       <>
         <div className="card-header">
           <span className="card-icon">{BUILDING_INFO[cells[hoveredCell].building].icon}</span>
           <div>
             <h4>{BUILDING_INFO[cells[hoveredCell].building].name} {((cells[hoveredCell].stars || 1) > 1) ? `${cells[hoveredCell].stars}★` : ''}</h4>
             <span className={`card-owner ${cells[hoveredCell].owner}`}>
               {cells[hoveredCell].owner === 'player' ? '★ QUÂN TA' : '◆ ĐỊCH QUÂN'}
             </span>
           </div>
         </div>
         <div className="card-badges">
           <div className="mini-badge">
             <span>👥 Quân:</span>
             <b>{cells[hoveredCell].soldiers}</b>
           </div>
           <div className="mini-badge">
             <span>🔨 Nghề:</span>
             <b>{BUILDING_INFO[cells[hoveredCell].building].worker}</b>
           </div>
           <div className="mini-badge gain">
             <span>📦 Thu:</span>
             <b>{BUILDING_INFO[cells[hoveredCell].building].output}</b>
           </div>
         </div>
       </>
     )}
   </div>
 )}

 <aside className={`battle-left hud panel-frame collapsible ${missionOpen?'open':'compact draggable'}`} style={missionOpen?undefined:{left:missionPosition.x,top:missionPosition.y}} onPointerDown={startMissionDrag} onPointerMove={moveMissionDrag} onPointerUp={stopMissionDrag} onPointerCancel={stopMissionDrag}><button className="panel-toggle" onClick={()=>setMissionOpen(v=>!v)} title={missionOpen?'Thu gọn nhiệm vụ':'Mở bảng nhiệm vụ'}>{missionOpen?<ChevronLeft/>:<ChevronRight/>}</button>{missionOpen?<><span className="panel-kicker"><Target/> NHIỆM VỤ HIỆN TẠI</span><h2>{mission.title}</h2><p>{mission.text} trước khi địch mở đợt tiến công kế tiếp.</p><div className="mission-progress"><div><span>TIẾN ĐỘ</span><b>{Math.min(100,(round%3)*34)}%</b></div><i><em style={{width:`${Math.min(100,(round%3)*34)}%`}}/></i></div><div className="reward-box"><Sparkles/><span>PHẦN THƯỞNG<b>{mission.reward}</b></span></div><hr/><h3>NHIỆM VỤ TIẾP THEO</h3><div className="next-mission"><LockKeyhole/><span>Mở rộng bờ cõi<small>Chiếm một vùng của quân địch</small></span></div></>:<div className="compact-mission"><Target/><span>NHIỆM VỤ<b>{Math.min(100,(round%3)*34)}%</b></span><i><em style={{height:`${Math.min(100,(round%3)*34)}%`}}/></i></div>}</aside>
 <aside className={`battle-right hud panel-frame collapsible ${citadelOpen?'open':'compact'}`}><button className="panel-toggle" onClick={()=>setCitadelOpen(v=>!v)} title={citadelOpen?'Thu gọn thành trì':'Mở bảng thành trì'}>{citadelOpen?<ChevronRight/>:<ChevronLeft/>}</button>{citadelOpen?<><span className="panel-kicker"><Castle/> ĐẠI THÀNH</span><div className="citadel"><Castle/><div><b>ĐỘ BỀN THÀNH</b><span>{castleHp}/100</span><i><em style={{width:`${castleHp}%`}}/></i></div></div><div className="siege-alert"><Swords/><span>ĐỢT ĐỊCH KẾ TIẾP<b>Còn {siegeCountdown} hiệp chuẩn bị</b></span></div><h3>NHẬT KÝ CHIẾN TRƯỜNG</h3><div className="battle-log">{history.map((h,i)=><p key={i}><b>[Lượt {Math.max(1,round-i)}]</b> {h}</p>)}</div><button className="reset-link" onClick={reset}><RotateCcw/> DỰNG LẠI THẾ CỜ</button></>:<div className="compact-health"><div><Castle/><span>TA<b>{castleHp}</b></span><i><em style={{height:`${castleHp}%`}}/></i></div><div className="enemy"><Swords/><span>ĐỊCH<b>{enemyHp}</b></span><i><em style={{height:`${enemyHp}%`}}/></i></div></div>}</aside>
 <div className="selection-hint hud"><span>{turnPhase==='player' ? (selected===null?'CHƯA CHỌN ĐẠO QUÂN':`${cells[selected].soldiers} NGƯỜI SẴN SÀNG`) : 'ĐỐI PHƯƠNG ĐANG HÀNH ĐỘNG'}</span><b>{message}</b></div>

 <nav className="command-dock hud">
   <div className="dock-minimap">
     <div className="minimap-citadel enemy" title={`Địch Thành (${enemyHp} HP)`}>
       <Castle/>
       <span>{enemyHp}</span>
     </div>
     <div className="minimap-board">
       <div className="minimap-row enemy-row">
         {[9,8,7,6,5].map(id=>(
           <button
             key={id}
             type="button"
             className={`mini-cell ${cells[id].owner} ${selected===id?'active':''} ${hoveredCell===id?'hovered':''}`}
             onClick={()=>selectCell(id)}
             onMouseEnter={()=>setHoveredCell(id)}
             onMouseLeave={()=>setHoveredCell(null)}
             title={`${BUILDING_INFO[cells[id].building].name}: ${cells[id].soldiers} quân`}
           >
             <i className="cell-ico">{BUILDING_INFO[cells[id].building].icon}</i>
             <b>{cells[id].soldiers}</b>
           </button>
         ))}
       </div>
       <div className="minimap-row player-row">
         {[0,1,2,3,4].map(id=>(
           <button
             key={id}
             type="button"
             className={`mini-cell ${cells[id].owner} ${selected===id?'active':''} ${hoveredCell===id?'hovered':''}`}
             onClick={()=>selectCell(id)}
             onMouseEnter={()=>setHoveredCell(id)}
             onMouseLeave={()=>setHoveredCell(null)}
             title={`${BUILDING_INFO[cells[id].building].name}: ${cells[id].soldiers} quân`}
           >
             <i className="cell-ico">{BUILDING_INFO[cells[id].building].icon}</i>
             <b>{cells[id].soldiers}</b>
           </button>
         ))}
       </div>
     </div>
     <div className="minimap-citadel player" title={`Đại Thành (${castleHp} HP)`}>
       <Castle/>
       <span>{castleHp}</span>
     </div>
   </div>

   <div className="dock-divider" />

   {/* NÚT THI TRIỂN KỸ NĂNG DANH TƯỚNG */}
   <button
     className="dock-minor hero-skill-btn"
     disabled={momentum < (equippedArtifacts.includes('non_ba_tam') ? Math.max(1, HEROES_DATABASE[selectedHero].skillCost - 1) : HEROES_DATABASE[selectedHero].skillCost) || heroSkillCooldown > 0}
     onClick={executeHeroSkill}
     title={`${HEROES_DATABASE[selectedHero].skillName}: ${HEROES_DATABASE[selectedHero].skillDesc}`}
   >
     <span>{HEROES_DATABASE[selectedHero].skillIcon}</span>
     <span>{heroSkillCooldown > 0 ? `HỒI (${heroSkillCooldown})` : HEROES_DATABASE[selectedHero].skillName}</span>
   </button>

   <button className="dock-minor" onClick={()=>setActiveModal('tactics')} title="Mở danh sách Trận Pháp"><Sparkles/><span>TRẬN PHÁP</span></button>
   <button className="dock-minor" onClick={()=>setActiveModal('doctrines')} title="Xem Đạo Trị Quốc"><Flame/><span>ĐẠO QUỐC</span></button>
   {selected !== null && cells[selected].owner === 'player' && (
     <button className="dock-minor" onClick={()=>upgradeBuilding(selected)} title="Nâng cấp công trình ô này"><Hammer/><span>NÂNG Ô ({cells[selected].stars || 1}★)</span></button>
   )}
   {!resilienceUsed && (
     <button className="dock-minor" style={{color:'#ff7875'}} onClick={triggerResilience} title="Cứu nguy toàn dân kháng chiến"><Shield/><span>CỨU NGUY</span></button>
   )}
   <button className="dock-action secondary" disabled={turnPhase!=='player'||selected===null} onClick={()=>command(-1)}><ArrowLeft/><span>RẢI NGƯỢC</span></button>
   <button className="dock-action primary" disabled={turnPhase!=='player'||selected===null} onClick={()=>command(1)}><ArrowRight/><span>RẢI THUẬN</span></button>
   <button className="dock-minor danger" onClick={()=>setScreen('lobby')}><Flag/><span>RÚT LUI</span></button>
 </nav>
 
 {activeModal && (
   <div className="tactical-flyout-overlay" onClick={()=>setActiveModal(null)}>
     <div className="tactical-flyout-widget" onClick={e=>e.stopPropagation()}>

       {activeModal === 'hero_detail' && (
         <>
           <div className="flyout-header">
             <div className="flyout-title-group">
               <div className="flyout-badge-icon">{HEROES_DATABASE[selectedHero].avatar}</div>
               <div>
                 <span className="overline"><Crown size={14}/> {HEROES_DATABASE[selectedHero].title}</span>
                 <h2>{HEROES_DATABASE[selectedHero].name}</h2>
               </div>
             </div>
             <button className="flyout-close-btn" onClick={()=>setActiveModal(null)}>✕</button>
           </div>
           <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:'12px'}}>
             <div className="hero-quote-box">"{HEROES_DATABASE[selectedHero].quote}"</div>
             <div className="hero-skill-details">
               <div><b>Nội tại: {HEROES_DATABASE[selectedHero].passiveName}</b> - {HEROES_DATABASE[selectedHero].passiveDesc}</div>
               <div><b>Kỹ năng: {HEROES_DATABASE[selectedHero].skillIcon} {HEROES_DATABASE[selectedHero].skillName}</b> ({HEROES_DATABASE[selectedHero].skillCost} Thế Khí, hồi {HEROES_DATABASE[selectedHero].skillCooldown} hiệp) - {HEROES_DATABASE[selectedHero].skillDesc}</div>
             </div>
             <h3>Bảo Vật Trang Bị:</h3>
             <div style={{display:'flex',gap:'10px'}}>
               {equippedArtifacts.map(artId => (
                 <div key={artId} style={{background:'rgba(255,255,255,0.08)',padding:'8px 12px',borderRadius:'8px',fontSize:'11.5px'}}>
                   <b>{ARTIFACTS_DATABASE[artId].icon} {ARTIFACTS_DATABASE[artId].name}</b>: {ARTIFACTS_DATABASE[artId].statBonus}
                 </div>
               ))}
             </div>
           </div>
         </>
       )}
       
       {activeModal === 'tactics' && (
         <>
           <div className="flyout-header">
             <div className="flyout-title-group">
               <div className="flyout-badge-icon">⚡</div>
               <div>
                 <span className="overline"><Sparkles/> BẢN TỒN TRẬN PHÁP</span>
                 <h2>Mệnh Lệnh Chiến Thuật Tức Thời</h2>
               </div>
             </div>
             <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
               <div className="momentum-gauge">
                 <Zap/> <span>THẾ KHÍ: <b>{momentum} / 10</b></span>
               </div>
               <button className="flyout-close-btn" onClick={()=>setActiveModal(null)}>✕</button>
             </div>
           </div>

           <div className="tactics-card-deck">
             {TACTICAL_COMMANDS.map(cmd => {
               const canAfford = momentum >= cmd.cost;
               return (
                 <button
                   key={cmd.id}
                   type="button"
                   className="tactic-card-widget"
                   disabled={!canAfford}
                   onClick={()=>executeTactic(cmd.id)}
                   title={cmd.name}
                 >
                   <div className="tactic-card-icon-frame">{cmd.icon}</div>
                   <h4>{cmd.name}</h4>
                   <p>{cmd.desc}</p>
                   <div className="tactic-card-cost-pill">
                     <Zap size={11}/> {cmd.cost} THẾ KHÍ
                   </div>
                 </button>
               );
             })}
           </div>
         </>
       )}

       {activeModal === 'doctrines' && (
         <>
           <div className="flyout-header">
             <div className="flyout-title-group">
               <div className="flyout-badge-icon">📜</div>
               <div>
                 <span className="overline"><Flame/> ĐẠO TRỊ QUỐC</span>
                 <h2>Quốc Sách Kỷ Nguyên Đại Việt</h2>
               </div>
             </div>
             <button className="flyout-close-btn" onClick={()=>setActiveModal(null)}>✕</button>
           </div>

           <div className="doctrines-card-deck">
             {(['thuy_tran', 'thao_thiet', 'nong_binh'] as Doctrine[]).map(docKey => {
               const doc = DOCTRINES_INFO[docKey];
               const isActive = playerDoctrine === docKey;
               return (
                 <div
                   key={docKey}
                   className={`doctrine-card-widget ${isActive ? 'active' : ''}`}
                   onClick={()=>{
                     setPlayerDoctrine(docKey);
                     setActiveModal(null);
                     setCombatBanner({
                       type:'reward',
                       title:`📜 ĐÃ BAN CHIẾU: ${doc.name}`,
                       detail: doc.perk
                     });
                   }}
                 >
                   <div className="doctrine-header-row">
                     <div className="doctrine-icon-box">{doc.icon}</div>
                     <div className="doctrine-name-group">
                       <h4>{doc.name}</h4>
                       <span className="doctrine-status-tag">{isActive ? '★ ĐANG BAN HÀNH' : 'CHƯA CHỌN'}</span>
                     </div>
                   </div>
                   <p className="doctrine-desc">{doc.desc}</p>
                   <div className="doctrine-perk-box">
                     ✦ {doc.perk}
                   </div>
                 </div>
               );
             })}
           </div>
         </>
       )}

       {activeModal === 'settings' && (
         <>
           <div className="flyout-header">
             <div className="flyout-title-group">
               <div className="flyout-badge-icon">⚙️</div>
               <div>
                 <span className="overline"><Settings/> CÀI ĐẶT TRẬN ĐỊA</span>
                 <h2>Âm Hưởng Dân Gian & Hiệu Ứng</h2>
               </div>
             </div>
             <button className="flyout-close-btn" onClick={()=>setActiveModal(null)}>✕</button>
           </div>

           <div className="settings-grid-widget">
             <div
               className={`setting-toggle-card ${!soundMuted ? 'active' : ''}`}
               onClick={()=>setSoundMuted(v=>!v)}
             >
               <div className="setting-info">
                 <h4>{soundMuted ? <VolumeX size={18}/> : <Volume2 size={18}/>} Hiệu Ứng Trận Địa</h4>
                 <p>Tiếng sỏi đá, mõ làng, trống đồng Đông Sơn và tù và báo động.</p>
               </div>
               <div className={`toggle-switch-ui ${!soundMuted ? 'on' : ''}`}>
                 <div className="toggle-switch-handle"/>
               </div>
             </div>

             <div
               className={`setting-toggle-card ${!bgmMuted ? 'active' : ''}`}
               onClick={()=>setBgmMuted(v=>!v)}
             >
               <div className="setting-info">
                 <h4><Music size={18}/> Nhạc Nền Ngũ Cung</h4>
                 <p>Giai điệu dân gian truyền thống êm dịu, trầm hùng theo nhịp cờ.</p>
               </div>
               <div className={`toggle-switch-ui ${!bgmMuted ? 'on' : ''}`}>
                 <div className="toggle-switch-handle"/>
               </div>
             </div>
           </div>
         </>
       )}

       {activeModal === 'create_room' && (
         <>
           <div className="flyout-header">
             <div className="flyout-title-group">
               <div className="flyout-badge-icon">👑</div>
               <div>
                 <span className="overline"><Users/> PHÒNG ĐẤU BẠN BÈ</span>
                 <h2>Mã Phòng Chiến Trận Của Bạn</h2>
               </div>
             </div>
             <button className="flyout-close-btn" onClick={()=>setActiveModal(null)}>✕</button>
           </div>

           <div className="room-code-display-box">
             <span className="room-code-digits">{roomCode}</span>
             <button
               className="copy-code-btn"
               onClick={()=>{
                 navigator.clipboard.writeText(roomCode);
                 setCopiedCode(true);
                 setTimeout(()=>setCopiedCode(false), 2000);
               }}
             >
               {copiedCode ? <Check size={18} color="#52c41a"/> : <Copy size={18}/>}
               <span>{copiedCode ? 'ĐÃ SAO CHÉP' : 'SAO CHÉP MÃ'}</span>
             </button>
           </div>
           <p style={{textAlign:'center',color:'#a0b2c6',fontSize:'11.5px',margin:'12px 0 16px'}}>
             Gửi mã 6 chữ số này cho bạn bè. Khi bạn bè nhập mã và tham gia, trận đấu sẽ tự động bắt đầu!
           </p>
           <button className="cta full" onClick={()=>{setActiveModal(null);setScreen('game');}}>
             VÀO BÀN CỜ CHỜ ĐỐI THỦ <ChevronRight/>
           </button>
         </>
       )}

     </div>
   </div>
 )}

 {showGuide&&<div className={`guide-layer step-${lesson}`}><div className="guide-card ornamental"><span>{lessons[lesson].tag}</span><h2>{lessons[lesson].title}</h2><p>{lessons[lesson].text}</p><div className="tip"><BookOpen/> {lessons[lesson].tip}</div>{lessons[lesson].action?<b className="guide-action">{lessons[lesson].action}</b>:<button className="cta full" onClick={()=>setLesson(l=>{if(l===5)setSelected(0);return l+1})}>TIẾP TỤC <ChevronRight/></button>}<button className="skip" onClick={()=>{setShowGuide(false);setSelected(null);localStorage.setItem('oquan-trained','true')}}>Bỏ qua hướng dẫn</button></div></div>}
 {(castleHp<=0||enemyHp<=0)&&<div className="result-modal"><div className="ornamental"><Castle/><h2>{enemyHp<=0?'KHẢI HOÀN!':'ĐẠI THÀNH THẤT THỦ'}</h2><p>{enemyHp<=0?'Thế rải quân đã khuất phục địch thành.':'Hãy củng cố doanh trại và tháp canh trước đợt công thành.'}</p><button className="cta" onClick={reset}>DỰNG LẠI CƠ ĐỒ</button></div></div>}</main>
}
function Resource({icon,label,value,max,color}:{icon:React.ReactNode;label:string;value:number;max:number;color:string}){return <div className="resource">{icon}<div><span>{label}</span><i><em style={{width:`${Math.min(100,value/max*100)}%`,background:color}}/></i></div><b>{value}</b></div>}
export default App
