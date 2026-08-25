export type BoardTile={id:number|string;asset:string;position:[number,number,number];rotation:[number,number,number]}
export const BOARD_LAYOUT:BoardTile[]=[
{id:0,asset:'01_O_RuongLua.glb',position:[-6,.18,1.92],rotation:[0,0,0]},
{id:1,asset:'02_O_RungTre.glb',position:[-3,.18,1.92],rotation:[0,0,0]},
{id:2,asset:'03_O_XuongMoc.glb',position:[0,.18,1.72],rotation:[0,0,0]},
{id:3,asset:'04_O_DoanhTrai.glb',position:[3,.18,1.92],rotation:[0,0,0]},
{id:4,asset:'05_O_ThapCanh.glb',position:[6,.18,1.92],rotation:[0,0,0]},
{id:5,asset:'01_O_RuongLua.glb',position:[-6,.18,-1.92],rotation:[0,Math.PI,0]},
{id:6,asset:'02_O_RungTre.glb',position:[-3,.18,-1.92],rotation:[0,Math.PI,0]},
{id:7,asset:'03_O_XuongMoc.glb',position:[0,.18,-1.72],rotation:[0,Math.PI,0]},
{id:8,asset:'04_O_DoanhTrai.glb',position:[3,.18,-1.92],rotation:[0,Math.PI,0]},
{id:9,asset:'05_O_ThapCanh.glb',position:[6,.18,-1.92],rotation:[0,Math.PI,0]},
{id:'player',asset:'06_O_Quan_DaiThanh.glb',position:[-10.2,.18,0],rotation:[0,0,0]},
{id:'enemy',asset:'07_O_Quan_DichThanh.glb',position:[10.2,.18,0],rotation:[0,Math.PI,0]},
]
export const tilePosition=(id:number)=>BOARD_LAYOUT.find(tile=>tile.id===id)!.position
