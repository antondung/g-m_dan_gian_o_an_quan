import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft,ArrowRight,BookOpen,Castle,ChevronLeft,ChevronRight,Coins,Compass,Flag,Hammer,HelpCircle,LockKeyhole,LogOut,Pause,Play,RotateCcw,Settings,Shield,Sparkles,Sprout,Swords,Target,Trees,Trophy,UserRound } from 'lucide-react'
import Board3D,{type Cell,type MarchEvent} from './Board3D'
import brandLogo from '../logo ô quan dựng nước.png'

type Screen='landing'|'profile'|'lobby'|'game'
type InfoModal='world'|'rules'|'chronicle'|null
type Resources={food:number;wood:number;stone:number}
type TurnPhase='player'|'player_marching'|'enemy'|'enemy_marching'|'siege_alert'|'siege_active'
type CombatBanner={type:'march'|'ambush'|'siege'|'reward'|'ai';title:string;detail:string}
const initialCells=():Cell[]=>['farm','forest','workshop','barracks','tower','farm','forest','workshop','barracks','tower'].map((building,id)=>({id,soldiers:5,building:building as Cell['building'],owner:id<5?'player':'enemy'}))
const DEFAULT_CELLS:Cell[]=initialCells()

const BUILDING_INFO: Record<Cell['building'], { name: string; icon: string; worker: string; output: string; desc: string }> = {
 farm: { name: 'RUỘNG LÚA', icon: '🌾', worker: 'Nông dân', output: '+2 Lương', desc: 'Canh tác lúa nước, nuôi quân tích cốc.' },
 forest: { name: 'RỪNG TRE', icon: '🎋', worker: 'Tiều phu', output: '+2 Gỗ', desc: 'Khai thác tre xanh, dựng chông đắp lũy.' },
 workshop: { name: 'XƯỞNG MỘC', icon: '🪓', worker: 'Thợ mộc', output: '+1 Đá / Vật liệu', desc: 'Chế tạo khí tài, xây dựng thành quách.' },
 barracks: { name: 'DOANH TRẠI', icon: '⚔️', worker: 'Binh sĩ', output: 'Phòng thủ + Đúc sắt', desc: 'Rèn luyện binh mã, chống vây hãm thành.' },
 tower: { name: 'THÁP CANH', icon: '🏹', worker: 'Quân canh', output: 'Tầm nhìn + Cung thủ', desc: 'Đài quan sát cao, chặn đứng đợt tiến công.' },
}

const lessons=[
 {tag:'BƯỚC 1 / 5',title:'Chào mừng đến chiến trường',text:'Bàn Ô Ăn Quan đã trở thành một vương quốc. Năm vùng gần thuộc Đại Thành; năm vùng xa thuộc địch.',tip:'Kéo chuột để xoay, cuộn để phóng to bàn cờ.'},
 {tag:'BƯỚC 2 / 5',title:'Mỗi người là một quân',text:'Con số trên vùng là số dân hiện có. Khi ban lệnh, toàn bộ dân được rải lần lượt qua các vùng kế tiếp.',tip:'Luật đếm và rải giữ nguyên tinh thần Ô Ăn Quan.'},
 {tag:'BƯỚC 3 / 5',title:'Mỗi vùng một nhiệm vụ',text:'Ruộng tạo lương, rừng lấy gỗ, xưởng tạo đá. Doanh trại và tháp canh bảo vệ Đại Thành.',tip:'Đường rải tốt vừa tạo tài nguyên, vừa giữ phòng tuyến.'},
 {tag:'BƯỚC 4 / 5',title:'Chọn một ô của quân ta',text:'Nhìn hàng 5 ô phía gần Đại Thành. Nhấn trực tiếp vào một ô có người; vòng sáng vàng sẽ xuất hiện quanh ô đó.',tip:'Bắt đầu bằng ô Ruộng lúa ở hàng quân ta.',action:'① NHẤN VÀO Ô RUỘNG LÚA ĐANG NHẤP NHÁY'},
 {tag:'BƯỚC 5 / 5',title:'Ban lệnh Rải Thuận',text:'Ô đã chọn sẽ rải toàn bộ người lần lượt sang các ô kế tiếp. Nút lệnh màu vàng đang sáng ở cạnh dưới màn hình.',tip:'Nhấn đúng nút RẢI THUẬN có mũi tên sang phải.',action:'② NHẤN NÚT RẢI THUẬN MÀU VÀNG'}]

function Brand(){return <div className="brand"><img className="brand-logo" src={brandLogo} alt="Ô Quan: Dựng Nước"/></div>}
function App(){
 const saved=localStorage.getItem('oquan-profile');const [profile,setProfile]=useState<string|null>(saved);const [name,setName]=useState('');const [screen,setScreen]=useState<Screen>('landing');const [activeModal,setActiveModal]=useState<InfoModal>(null);const [showGuide,setShowGuide]=useState(false);const [lesson,setLesson]=useState(0);const [missionOpen,setMissionOpen]=useState(false);const [citadelOpen,setCitadelOpen]=useState(false)
 const [missionPosition,setMissionPosition]=useState({x:12,y:78});const missionDrag=useRef<{pointerId:number;dx:number;dy:number}|null>(null)
 const [cells,setCells]=useState(initialCells);const [selected,setSelected]=useState<number|null>(null);const [hoveredCell,setHoveredCell]=useState<number|null>(null);const [resources,setResources]=useState<Resources>({food:30,wood:20,stone:12});
 
 const [round,setRound]=useState(1); // Hiệp đấu (1, 2, 3...)
 const [turnPhase,setTurnPhase]=useState<TurnPhase>('player'); // 'player' | 'player_marching' | 'enemy' | 'enemy_marching' | 'siege_active'
 const [siegeCountdown,setSiegeCountdown]=useState(3); // Đếm ngược chuẩn 3 -> 2 -> 1 -> Công Thành
 const [wave,setWave]=useState(1);
 const [castleHp,setCastleHp]=useState(100);
 const [enemyHp,setEnemyHp]=useState(100);
 const [score,setScore]=useState(0);
 const [message,setMessage]=useState('LƯỢT CỦA BẠN: Hãy chọn một ô quân ta (0 - 4) để ban lệnh.');
 const [history,setHistory]=useState<string[]>(['Bá tánh bắt đầu dựng nghiệp.']);
 const [viewKey,setViewKey]=useState(0)

 // Animation states
 const [marchEvent,setMarchEvent]=useState<MarchEvent|null>(null)
 const [siegeActive,setSiegeActive]=useState(false)
 const [ambushTarget,setAmbushTarget]=useState<number|null>(null)
 const [combatBanner,setCombatBanner]=useState<CombatBanner|null>(null)

 useEffect(()=>{if(screen==='lobby')setScreen('landing')},[screen])
 const mission=useMemo(()=>[{title:'Tích cốc phòng cơ',text:'Đưa dân qua Ruộng lúa',reward:'+8 lương',building:'farm'},{title:'Dựng lũy tre xanh',text:'Đưa dân qua Rừng tre',reward:'+6 gỗ',building:'forest'},{title:'Rèn binh giữ cõi',text:'Đưa dân qua Doanh trại',reward:'+10 uy danh',building:'barracks'}][(round-1)%3],[round])
 
 // Người chơi chọn ô (chỉ được chọn ô của mình khi đang ở lượt 'player')
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
   if(showGuide&&lesson===3)setLesson(4)
 }

 // NGƯỜI CHƠI BAN LỆNH
 const command=(direction:-1|1)=>{
   if(turnPhase!=='player'||selected===null||cells[selected].soldiers===0||marchEvent!==null)return;
   const sourceId=selected;
   const troops=cells[sourceId].soldiers;
   const path:number[]=[sourceId];
   for(let step=1;step<=troops;step++){
     path.push((sourceId+step*direction+100)%10);
   }

   setTurnPhase('player_marching');
   setSelected(null);

   // Rút quân ở ô nguồn
   setCells(prev=>{
     const next=prev.map(c=>({...c}));
     next[sourceId].soldiers=0;
     return next;
   });

   // Bắt đầu hoạt cảnh rải quân người chơi
   setMarchEvent({
     key:Date.now(),
     path,
     sourceId,
     direction,
     totalTroops:troops,
   });

   setCombatBanner({
     type:'march',
     title:`🎮 QUÂN TA RẢI ${direction===1?'THUẬN ➔':'NGƯỢC ⬅'} (${troops} QUÂN)`,
     detail:`Đang rải quân lần lượt qua từng vùng đất...`
   });
 }

 // Khi đạo quân vừa chạm tới từng ô
 const handleMarchStep=(stepIndex:number,tileId:number)=>{
   setCells(prev=>{
     const next=prev.map(c=>({...c}));
     next[tileId].soldiers+=1;
     return next;
   });

   const b=cells[tileId].building;
   const isPlayerTurn = turnPhase === 'player_marching';

   if(isPlayerTurn){
     let resGain='';
     if(b==='farm'){setResources(r=>({...r,food:r.food+2}));resGain='🌾 +2 LƯƠNG';}
     else if(b==='forest'){setResources(r=>({...r,wood:r.wood+2}));resGain='🎋 +2 GỖ';}
     else if(b==='workshop'){setResources(r=>({...r,stone:r.stone+1}));resGain='🪓 +1 ĐÁ';}
     setMessage(`[Quân ta bước ${stepIndex+1}/${marchEvent?.totalTroops}]: Rải 1 quân xuống [${BUILDING_INFO[b].name}] ${resGain ? `➔ ${resGain}` : ''}`);
   } else {
     setMessage(`[Địch bước ${stepIndex+1}/${marchEvent?.totalTroops}]: Địch rải 1 quân xuống [${BUILDING_INFO[b].name}]`);
   }
 }

 // KHI KẾT THÚC BƯỚC RẢI QUÂN (CỦA TA HOẶC CỦA ĐỊCH)
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

   // Kiểm tra thế phục kích
   if(next[gap].soldiers===0 && next[target].owner===opponentOwner && next[target].soldiers>0){
     const capturedCount=next[target].soldiers;
     next[target].soldiers=0;
     next[target].owner=isPlayerTurn ? 'player' : 'enemy';
     const dmg=capturedCount*4;

     if(isPlayerTurn){
       setEnemyHp(h=>Math.max(0,h-dmg));
       setScore(s=>s+capturedCount*10);
       setAmbushTarget(target);
       setCombatBanner({
         type:'ambush',
         title:`⚔️ PHỤC KÍCH ĐẠI THẮNG!`,
         detail:`Quân ta chiếm [${BUILDING_INFO[next[target].building].name}], thu phục ${capturedCount} lính địch, Địch Thành mất ${dmg} HP!`
       });
       setHistory(h=>[`[Hiệp ${round}] Quân ta phục kích thu phục ${capturedCount} lính, Địch Thành -${dmg} HP.`,...h].slice(0,6));
     } else {
       setCastleHp(h=>Math.max(0,h-dmg));
       setCombatBanner({
         type:'ambush',
         title:`⚠️ ĐỊCH PHỤC KÍCH QUÂN TA!`,
         detail:`Địch chiếm [${BUILDING_INFO[next[target].building].name}], bắt ${capturedCount} quân ta, Đại Thành mất ${dmg} HP!`
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

   setCells(next);

   if(isPlayerTurn){
     // Chi phí lương quân ta
     setResources(r=>({food:Math.max(0,r.food-2),wood:r.wood,stone:r.stone}));
     setScore(s=>s+5);

     // Chuyển sang lượt máy (AI) sau 1.5 giây để người chơi kịp nhìn
     setTimeout(()=>{
       triggerAiTurn(next);
     },1500);
   } else {
     // Lượt địch đã kết thúc -> Hoàn thành 1 Hiệp đấu trọn vẹn
     finishRound(next);
   }

   if(showGuide&&lesson===4&&direction===1)setShowGuide(false);
 }

 // LƯỢT CỦA MÁY (AI ĐỐI KHÁNG THÔNG MINH)
 const triggerAiTurn=(boardCells:Cell[])=>{
   setTurnPhase('enemy');
   setMessage('LƯỢT CỦA ĐỊCH: Đối phương đang suy tính nước rải quân...');

   setCombatBanner({
     type:'ai',
     title:`🤖 LƯỢT ĐỐI PHƯƠNG`,
     detail:`Địch đang quan sát thế trận để chọn ô rải quân...`
   });

   setTimeout(()=>{
     // AI tìm kiếm ô có quân thuộc quyền kiểm soát của địch (ô 5 đến 9 hoặc ô địch chiếm)
     const enemySlots = boardCells.map((c,idx)=>({cell:c,id:idx})).filter(item=>item.cell.owner==='enemy'&&item.cell.soldiers>0);

     if(enemySlots.length===0){
       // Địch không có quân -> Chuyển vòng tiếp theo
       finishRound(boardCells);
       return;
     }

     // Thuật toán AI: ưu tiên ô có thể ăn phục kích quân ta, nếu không thì chọn ô có nhiều quân nhất
     let bestChoice = enemySlots[0];
     let bestDirection: -1 | 1 = 1;
     let foundAmbush = false;

     for(const slot of enemySlots){
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

     // Nếu không có phục kích, chọn ô nhiều quân nhất
     if(!foundAmbush){
       bestChoice = enemySlots.reduce((max,curr)=>curr.cell.soldiers > max.cell.soldiers ? curr : max, enemySlots[0]);
       bestDirection = Math.random() > 0.5 ? 1 : -1;
     }

     const aiSourceId = bestChoice.id;
     const aiTroops = bestChoice.cell.soldiers;
     const aiPath: number[] = [aiSourceId];
     for(let step=1; step<=aiTroops; step++){
       aiPath.push((aiSourceId + step * bestDirection + 100) % 10);
     }

     setTurnPhase('enemy_marching');

     // Rút quân ở ô máy chọn
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

 // KẾT THÚC 1 HIỆP ĐẤU (SAU KHI CẢ TA VÀ ĐỊCH ĐỀU ĐÃ ĐI)
 const finishRound=(boardCells:Cell[])=>{
   const nextRound = round + 1;
   setRound(nextRound);

   const nextCountdown = siegeCountdown - 1;

   if(nextCountdown <= 0){
     // Kích hoạt Công Thành sau 2 giây
     setSiegeCountdown(3);
     setTurnPhase('siege_alert');
     setTimeout(()=>{
       triggerSiege(boardCells, wave);
     },1800);
   } else {
     setSiegeCountdown(nextCountdown);
     setTurnPhase('player');
     setMessage(`LƯỢT CỦA BẠN (Hiệp ${nextRound}): Chọn 1 ô quân ta để rải quân!`);
     setCombatBanner({
       type:'reward',
       title:`BẮT ĐẦU HIỆP ${nextRound}`,
       detail:`Lượt của bạn. Còn ${nextCountdown} hiệp nữa địch sẽ phát động đại đợt Công Thành!`
     });
   }
 }

 // KÍCH HOẠT CÔNG THÀNH RÕ RÀNG
 const triggerSiege=(boardCells:Cell[],currentWave:number)=>{
   const defense=boardCells.filter(c=>c.owner==='player'&&(c.building==='tower'||c.building==='barracks')).reduce((n,c)=>n+c.soldiers,0);
   const attackForce=currentWave*12;
   const damage=Math.max(5,attackForce-defense);

   setTurnPhase('siege_active');
   setCombatBanner({
     type:'siege',
     title:`🔥 ĐỢT CÔNG THÀNH THỨ ${currentWave}!`,
     detail:`Sức ép công kích địch: ${attackForce} ⚔️ | Lực lượng phòng thủ Đại Thành: ${defense} 🛡️ ➔ Đại Thành nhận ${damage} sát thương!`
   });

   // Cho đạo quân địch và cầu lửa tràn trận
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

 const handleAmbushDone=()=>{
   setAmbushTarget(null);
 }

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
   setMessage('LƯỢT CỦA BẠN: Hãy chọn một ô quân ta (0 - 4) để ban lệnh.');
   setHistory(['Một vận hội mới bắt đầu.']);
 }
 const createProfile=()=>{const n=name.trim()||'Thành chủ';localStorage.setItem('oquan-profile',n);setProfile(n);setScreen('landing')}
 const enterGame=(tutorial=false)=>{setScreen('game');if(tutorial){setLesson(0);setShowGuide(true)}}
 const startMissionDrag=(event:React.PointerEvent<HTMLElement>)=>{if(missionOpen||(event.target as HTMLElement).closest('button'))return;const box=event.currentTarget.getBoundingClientRect();missionDrag.current={pointerId:event.pointerId,dx:event.clientX-box.left,dy:event.clientY-box.top};event.currentTarget.setPointerCapture(event.pointerId);event.preventDefault()}
 const moveMissionDrag=(event:React.PointerEvent<HTMLElement>)=>{const drag=missionDrag.current;if(!drag||drag.pointerId!==event.pointerId)return;setMissionPosition({x:Math.max(0,Math.min(window.innerWidth-260,event.clientX-drag.dx)),y:Math.max(64,Math.min(window.innerHeight-48,event.clientY-drag.dy))})}
 const stopMissionDrag=(event:React.PointerEvent<HTMLElement>)=>{if(missionDrag.current?.pointerId===event.pointerId){missionDrag.current=null;event.currentTarget.releasePointerCapture(event.pointerId)}}
 if(screen==='landing')return <div className="landing screen"><div className="landing-glow"/><nav><Brand/><div className="landing-navlinks"><button type="button" onClick={()=>setActiveModal('world')}>THẾ GIỚI</button><button type="button" onClick={()=>setActiveModal('rules')}>LUẬT CHƠI</button><button type="button" onClick={()=>setActiveModal('chronicle')}>BIÊN NIÊN SỬ</button></div><button className="ghost login-button" onClick={()=>profile?enterGame(false):setScreen('profile')}>{profile?'VÀO CHIẾN TRƯỜNG':'ĐĂNG NHẬP'} <ChevronRight/></button></nav><section className="hero"><span className="overline">MỘT HUYỀN THOẠI DÂN GIAN · MỘT CHIẾN TRƯỜNG MỚI</span><h1>RẢI QUÂN<br/><em>DỰNG NƯỚC</em></h1><p>Điều dân, tích lương, dựng thành. Mỗi nước rải định đoạt vận mệnh một giang sơn.</p><div className="hero-actions"><button className="cta" onClick={()=>profile?enterGame(false):setScreen('profile')}><Play/> {profile?'TIẾP TỤC DỰNG NƯỚC':'BẮT ĐẦU DỰNG NƯỚC'}</button><button className="ghost" onClick={()=>{if(profile)enterGame(true);else setScreen('profile')}}><BookOpen/> TÌM HIỂU CÁCH CHƠI</button></div><div className="hero-proof"><span><b>10</b> vùng đất</span><span><b>2</b> thành trì</span><span><b>∞</b> thế cờ</span></div></section><div className="landing-board"><Board3D cells={DEFAULT_CELLS} selected={null} onSelect={()=>{}}/></div><div className="landing-flags" aria-hidden="true"><i/><i/><i/></div><section className="landing-features"><article><Sprout/><div><b>DỰNG NGHIỆP</b><span>Điều dân, tích lương và nuôi lớn từng vùng đất.</span></div></article><article><Shield/><div><b>GIỮ THÀNH</b><span>Dựng phòng tuyến trước từng đợt quân vây hãm.</span></div></article><article><Swords/><div><b>ĐỊNH THẾ CỜ</b><span>Một nước rải đúng lúc có thể đổi vận giang sơn.</span></div></article></section><aside className="daily-strategy"><span>THẾ CỜ HÔM NAY</span><b>“Lấy dân làm gốc,<br/>lấy thế làm thành.”</b><small>Thử thách: giữ Đại Thành qua 5 đợt vây</small></aside><footer><span>PHIÊN BẢN THỬ NGHIỆM</span><i/><span>CHIẾN THUẬT DÂN GIAN VIỆT</span><i/><span>VẠN THẾ CỜ</span></footer>

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
             Kế thừa $100\%$ tinh hoa đếm và rải quân của Ô Ăn Quan truyền thống, kết hợp cơ chế chiến thuật quản lý tài nguyên.
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
 if(screen==='profile')return <div className="profile-screen screen"><div className="profile-backdrop"><Board3D cells={DEFAULT_CELLS} selected={null} onSelect={()=>{}}/></div><button className="back-link" onClick={()=>setScreen('landing')}><ArrowLeft/> TRỞ VỀ</button><div className="profile-card ornamental"><div className="mini-seal">御</div><span className="overline">TÂN THÀNH CHỦ</span><h1>Khởi tạo hồ sơ</h1><p>Danh hiệu sẽ được khắc vào sử sách và dùng để lưu hành trình dựng nước.</p><label>TÊN HIỆU CỦA NGƯỜI</label><div className="carved-input"><UserRound/><input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&createProfile()} placeholder="Ví dụ: Minh Chủ" autoFocus/></div><button className="cta full" onClick={createProfile}>KHẮC TÊN VÀO SỬ SÁCH <ChevronRight/></button><small><Shield/> Hồ sơ prototype được lưu an toàn trên trình duyệt này</small></div></div>
 if(screen==='lobby')return <div className="lobby screen"><header><Brand/><div className="lobby-user"><div><span>THÀNH CHỦ</span><b>{profile}</b></div><div className="avatar"><UserRound/></div><button><Settings/></button></div></header><aside className="lobby-nav"><span className="nav-caption">ĐẠI SẢNH</span><button className="active"><Castle/> Tổng quan</button><button><Trophy/> Thành tựu</button><button><BookOpen/> Bách khoa</button><button onClick={()=>setScreen('landing')}><LogOut/> Trở về sảnh</button></aside><main className="lobby-main"><div className="lobby-title"><div><span className="overline">ĐẠI SẢNH THÀNH CHỦ</span><h1>Vận nước trong tay người</h1><p>Chọn chiến cuộc, quản trị giang sơn và viết tiếp sử Việt.</p></div><div className="rank"><span>UY DANH</span><b>{score||450}</b><small>HÀO KIỆT</small></div></div><section className="continue-card ornamental"><div><span className="overline">CHIẾN CUỘC ĐANG CHỜ</span><h2>Giữ vững Đại Thành</h2><p>Hiệp {round} · Đợt công thành {wave} · Thành còn {castleHp} HP</p><button className="cta" onClick={()=>enterGame(false)}><Play/> TIẾP TỤC CHIẾN CUỘC</button></div><Castle/></section><h2 className="section-title">Chọn con đường dựng nước</h2><div className="mode-grid"><button className="mode-card defense-mode" onClick={()=>enterGame(!localStorage.getItem('oquan-trained'))}><Shield/><span>KHẢ DỤNG</span><h3>Thủ Thành</h3><p>Tích lương, bố trí dân binh và chống lại từng đợt vây thành.</p><b>VÀO CHIẾN TRƯỜNG <ChevronRight/></b></button><button className="mode-card locked"><LockKeyhole/><span>SẮP RA MẮT</span><h3>Tranh Hùng</h3><p>Đấu trí cùng Thành chủ khác trên cùng một bàn Ô Quan.</p></button><button className="mode-card locked"><LockKeyhole/><span>SẮP RA MẮT</span><h3>Chiến Dịch</h3><p>Vượt qua các chương sử thi và thống nhất bờ cõi.</p></button></div></main></div>
 return <main className={`battle screen ${siegeActive ? 'screen-siege-alert' : ''}`}><div className="battle-world"><Board3D cells={cells} selected={selected} onSelect={selectCell} onHover={setHoveredCell} marchEvent={marchEvent} onMarchStep={handleMarchStep} onMarchDone={handleMarchDone} siegeActive={siegeActive} onSiegeDone={handleSiegeDone} ambushTarget={ambushTarget} onAmbushDone={handleAmbushDone} resetViewKey={viewKey}/></div><header className="top-hud hud"><Brand/><div className="resources"><Resource icon={<Sprout/>} label="LƯƠNG" value={resources.food} max={60} color="#6f9339"/><Resource icon={<Trees/>} label="GỖ" value={resources.wood} max={60} color="#a26432"/><Resource icon={<Hammer/>} label="ĐÁ" value={resources.stone} max={60} color="#8c929a"/><div className="prestige"><Coins/><span>UY DANH</span><b>{score}</b></div></div>
 
 <div className="turn-info">
   <b>HIỆP {String(round).padStart(2,'0')} · {turnPhase==='player'?'LƯỢT QUÂN TA':'LƯỢT ĐỊCH'}</b>
   <span className={siegeCountdown===1?'warning':''}>CÔNG THÀNH: {siegeCountdown} HIỆP NỮA</span>
 </div>
 
 <button title="Đặt lại góc nhìn toàn cảnh sa bàn" onClick={()=>setViewKey(k=>k+1)}><Compass/></button><button onClick={()=>setShowGuide(true)}><HelpCircle/></button><button onClick={()=>setScreen('lobby')}><Pause/></button><div className="avatar"><UserRound/></div></header>

 {/* LỚP CẢNH BÁO BÁO ĐỘNG CÔNG THÀNH TOÀN MÀN HÌNH (SIEGE CINEMATIC ALERT) */}
 {siegeActive && (
   <div className="siege-cinematic-banner">
     <div className="siege-badge-pulse">⚠️ BÁO ĐỘNG KHẨN CẤP: ĐỢT CÔNG THÀNH {wave - 1}</div>
     <h2>ĐẠI ĐỘI ĐỊCH ĐANG LAO VÀO CÔNG PHÁ ĐẠI THÀNH!</h2>
     <p>Các tháp canh và doanh trại đang dốc toàn lực bắn tên dựng khiên chống đỡ!</p>
   </div>
 )}

 {/* BANNER CHIẾN BÁO TRỰC QUAN KHI RẢI QUÂN, PHỤC KÍCH HOẶC CÔNG THÀNH */}
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

 {/* THẺ BÀI CHI TIẾT KHI RÊ CHUỘT (GỌN GÀNG, ĐẶT GÓC TRÊN KHÔNG CHE BÀN CỜ) */}
 {hoveredCell !== null && (
   <div className={`hover-detail-card hud ${cells[hoveredCell].owner}`}>
     <div className="card-header">
       <span className="card-icon">{BUILDING_INFO[cells[hoveredCell].building].icon}</span>
       <div>
         <h4>{BUILDING_INFO[cells[hoveredCell].building].name}</h4>
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
   </div>
 )}

 <aside className={`battle-left hud panel-frame collapsible ${missionOpen?'open':'compact draggable'}`} style={missionOpen?undefined:{left:missionPosition.x,top:missionPosition.y}} onPointerDown={startMissionDrag} onPointerMove={moveMissionDrag} onPointerUp={stopMissionDrag} onPointerCancel={stopMissionDrag}><button className="panel-toggle" onClick={()=>setMissionOpen(v=>!v)} title={missionOpen?'Thu gọn nhiệm vụ':'Mở bảng nhiệm vụ'}>{missionOpen?<ChevronLeft/>:<ChevronRight/>}</button>{missionOpen?<><span className="panel-kicker"><Target/> NHIỆM VỤ HIỆN TẠI</span><h2>{mission.title}</h2><p>{mission.text} trước khi địch mở đợt tiến công kế tiếp.</p><div className="mission-progress"><div><span>TIẾN ĐỘ</span><b>{Math.min(100,(round%3)*34)}%</b></div><i><em style={{width:`${Math.min(100,(round%3)*34)}%`}}/></i></div><div className="reward-box"><Sparkles/><span>PHẦN THƯỞNG<b>{mission.reward}</b></span></div><hr/><h3>NHIỆM VỤ TIẾP THEO</h3><div className="next-mission"><LockKeyhole/><span>Mở rộng bờ cõi<small>Chiếm một vùng của quân địch</small></span></div></>:<div className="compact-mission"><Target/><span>NHIỆM VỤ<b>{Math.min(100,(round%3)*34)}%</b></span><i><em style={{height:`${Math.min(100,(round%3)*34)}%`}}/></i></div>}</aside>
 <aside className={`battle-right hud panel-frame collapsible ${citadelOpen?'open':'compact'}`}><button className="panel-toggle" onClick={()=>setCitadelOpen(v=>!v)} title={citadelOpen?'Thu gọn thành trì':'Mở bảng thành trì'}>{citadelOpen?<ChevronRight/>:<ChevronLeft/>}</button>{citadelOpen?<><span className="panel-kicker"><Castle/> ĐẠI THÀNH</span><div className="citadel"><Castle/><div><b>ĐỘ BỀN THÀNH</b><span>{castleHp}/100</span><i><em style={{width:`${castleHp}%`}}/></i></div></div><div className="siege-alert"><Swords/><span>ĐỢT ĐỊCH KẾ TIẾP<b>Còn {siegeCountdown} hiệp chuẩn bị</b></span></div><h3>NHẬT KÝ CHIẾN TRƯỜNG</h3><div className="battle-log">{history.map((h,i)=><p key={i}><b>[Lượt {Math.max(1,round-i)}]</b> {h}</p>)}</div><button className="reset-link" onClick={reset}><RotateCcw/> DỰNG LẠI THẾ CỜ</button></>:<div className="compact-health"><div><Castle/><span>TA<b>{castleHp}</b></span><i><em style={{height:`${castleHp}%`}}/></i></div><div className="enemy"><Swords/><span>ĐỊCH<b>{enemyHp}</b></span><i><em style={{height:`${enemyHp}%`}}/></i></div></div>}</aside>
 <div className="selection-hint hud"><span>{turnPhase==='player' ? (selected===null?'CHƯA CHỌN ĐẠO QUÂN':`${cells[selected].soldiers} NGƯỜI SẴN SÀNG`) : 'ĐỐI PHƯƠNG ĐANG HÀNH ĐỘNG'}</span><b>{message}</b></div>

 <nav className="command-dock hud">
   {/* GIẢI PHÁP 5: SA BÀN CHIẾN LƯỢC TÍCH HỢP BÊN TRÁI COMMAND DOCK */}
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

   <button className="dock-minor"><Sparkles/><span>TRẬN PHÁP</span></button>
   <button className="dock-action secondary" disabled={turnPhase!=='player'||selected===null} onClick={()=>command(-1)}><ArrowLeft/><span>RẢI NGƯỢC</span></button>
   <button className="dock-action primary" disabled={turnPhase!=='player'||selected===null} onClick={()=>command(1)}><ArrowRight/><span>RẢI THUẬN</span></button>
   <button className="dock-minor danger" onClick={()=>setScreen('lobby')}><Flag/><span>RÚT LUI</span></button>
 </nav>
 {showGuide&&<div className={`guide-layer step-${lesson}`}><div className="guide-card ornamental"><span>{lessons[lesson].tag}</span><h2>{lessons[lesson].title}</h2><p>{lessons[lesson].text}</p><div className="tip"><BookOpen/> {lessons[lesson].tip}</div>{lessons[lesson].action?<b className="guide-action">{lessons[lesson].action}</b>:<button className="cta full" onClick={()=>setLesson(l=>{if(l===2)setSelected(0);return l+1})}>TIẾP TỤC <ChevronRight/></button>}<button className="skip" onClick={()=>{setShowGuide(false);setSelected(null);localStorage.setItem('oquan-trained','true')}}>Bỏ qua hướng dẫn</button></div></div>}
 {(castleHp<=0||enemyHp<=0)&&<div className="result-modal"><div className="ornamental"><Castle/><h2>{enemyHp<=0?'KHẢI HOÀN!':'ĐẠI THÀNH THẤT THỦ'}</h2><p>{enemyHp<=0?'Thế rải quân đã khuất phục địch thành.':'Hãy củng cố doanh trại và tháp canh trước đợt công thành.'}</p><button className="cta" onClick={reset}>DỰNG LẠI CƠ ĐỒ</button></div></div>}</main>
}
function Resource({icon,label,value,max,color}:{icon:React.ReactNode;label:string;value:number;max:number;color:string}){return <div className="resource">{icon}<div><span>{label}</span><i><em style={{width:`${Math.min(100,value/max*100)}%`,background:color}}/></i></div><b>{value}</b></div>}
export default App
