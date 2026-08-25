export type TerritoryKind='farm'|'forest'|'workshop'|'barracks'|'tower'
export type SpawnPoint={position:[number,number,number];rotation:number;activity:'work'|'carry'|'train'|'guard'}

export const TERRITORY_SPAWNS:Record<TerritoryKind,SpawnPoint[]>={
  farm:[
    {position:[-.68,.22,-.34],rotation:.45,activity:'work'},
    {position:[.18,.22,.42],rotation:-2.15,activity:'work'},
    {position:[.7,.22,-.18],rotation:2.5,activity:'carry'},
    {position:[-.28,.22,.72],rotation:-.8,activity:'work'},
    {position:[.55,.22,.58],rotation:-2.7,activity:'carry'},
  ],
  forest:[
    {position:[-.72,.22,-.15],rotation:.7,activity:'work'},
    {position:[.52,.22,.48],rotation:-2.2,activity:'work'},
    {position:[.7,.22,-.52],rotation:2.7,activity:'carry'},
    {position:[-.3,.22,.68],rotation:-.5,activity:'work'},
    {position:[.1,.22,-.65],rotation:1.1,activity:'carry'},
  ],
  workshop:[
    {position:[-.62,.22,.18],rotation:.5,activity:'work'},
    {position:[.34,.22,.58],rotation:-2.6,activity:'work'},
    {position:[.72,.22,-.28],rotation:2.4,activity:'carry'},
    {position:[-.35,.22,-.62],rotation:.2,activity:'work'},
    {position:[.25,.22,-.55],rotation:-1.4,activity:'carry'},
  ],
  barracks:[
    {position:[-.65,.22,-.42],rotation:.3,activity:'train'},
    {position:[.05,.22,.55],rotation:-2.8,activity:'train'},
    {position:[.68,.22,-.2],rotation:2.2,activity:'guard'},
    {position:[-.48,.22,.55],rotation:-.4,activity:'train'},
    {position:[.45,.22,.48],rotation:-2.2,activity:'guard'},
  ],
  tower:[
    {position:[0,2.08,.05],rotation:.3,activity:'guard'},
    {position:[-.65,.22,-.45],rotation:.7,activity:'guard'},
    {position:[.58,.22,.5],rotation:-2.4,activity:'guard'},
    {position:[-.55,.22,.58],rotation:-.5,activity:'guard'},
    {position:[.65,.22,-.52],rotation:2.5,activity:'guard'},
  ],
}
