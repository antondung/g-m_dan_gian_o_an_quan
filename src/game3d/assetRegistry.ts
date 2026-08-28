// All production GLBs in this folder are normalized to Three.js Y-up coordinates.
const BASE = import.meta.env.BASE_URL || '/'
export const O_QUAN_ASSET_BASE = `${BASE.replace(/\/$/, '')}/assets/o-quan-dung-nuoc`
export const O_QUAN_ASSETS = {
  board: { rice:'01_O_RuongLua.glb', bamboo:'02_O_RungTre.glb', woodshop:'03_O_XuongMoc.glb', camp:'04_O_DoanhTrai.glb', watchtower:'05_O_ThapCanh.glb', greatCity:'06_O_Quan_DaiThanh.glb', enemyCity:'07_O_Quan_DichThanh.glb' },
  buildings: { farmerHouse:'08_NhaNongDan.glb', warehouse:'09_NhaKho.glb', forge:'10_LoLuyen.glb', training:'11_TraiHuanLuyen.glb' },
  characters: { farmer:'12_NongDan.glb', woodcutter:'13_TieuPhu.glb', carpenter:'14_ThoMoc.glb', soldier:'15_BinhSi.glb', guard:'16_QuanCanh.glb', elite:'17_CamQuan.glb' },
  props: { redFlag:'18_CoHieuDo.glb', blueFlag:'19_CoHieuXanh.glb', drum:'20_TrongLenh.glb', cart:'21_XeBo.glb', bambooFence:'22_HangRaoTre.glb', stakes:'23_CocGo.glb', boat:'24_ThuyenNho.glb', gong:'25_TrongDong.glb' },
  resources: { food:'26_LuongThuc.glb', wood:'27_Go.glb', bamboo:'28_Tre.glb', stone:'29_Da.glb', iron:'30_Sat.glb', materials:'31_VatLieu.glb' },
} as const
export const assetUrl=(file:string)=>`${O_QUAN_ASSET_BASE}/${file}`
