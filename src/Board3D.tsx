import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Clone, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { assetUrl, O_QUAN_ASSETS } from './game3d/assetRegistry'
import { BOARD_LAYOUT, tilePosition, type BoardTile } from './game3d/boardLayout'
import { TERRITORY_SPAWNS } from './game3d/territoryConfig'
import type { TacticalTrap, WeatherType } from './game3d/advancedGameTypes'
import { WEATHER_TYPES_INFO } from './game3d/tacticsDatabase'
import boardBackground from '../nền bàn cờ 1.png'

type Building = 'farm' | 'forest' | 'workshop' | 'barracks' | 'tower'
export type Cell = { 
  id: number; 
  soldiers: number; 
  building: Building; 
  owner: 'player' | 'enemy' | 'neutral';
  stars?: 1 | 2 | 3;
  spies?: number;
  shieldTurns?: number;
}

const dynamic: Record<Building, { role: string; resource: string; action: 'work' | 'train' | 'guard' }> = {
  farm: { role: O_QUAN_ASSETS.characters.farmer, resource: O_QUAN_ASSETS.resources.food, action: 'work' },
  forest: { role: O_QUAN_ASSETS.characters.woodcutter, resource: O_QUAN_ASSETS.resources.bamboo, action: 'work' },
  workshop: { role: O_QUAN_ASSETS.characters.carpenter, resource: O_QUAN_ASSETS.resources.materials, action: 'work' },
  barracks: { role: O_QUAN_ASSETS.characters.soldier, resource: O_QUAN_ASSETS.resources.iron, action: 'train' },
  tower: { role: O_QUAN_ASSETS.characters.guard, resource: O_QUAN_ASSETS.resources.stone, action: 'guard' },
}

// ---------------------------------------------------------------------------
// 3D MODEL LOADER & AUTO-FIT HELPER
// ---------------------------------------------------------------------------
function Model({
  file,
  height = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  file: string
  height?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  const { scene } = useGLTF(assetUrl(file))
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const scale = height / Math.max(size.y, 0.001)
    return {
      scale,
      offset: [-center.x * scale, -box.min.y * scale, -center.z * scale] as [number, number, number],
    }
  }, [scene, height])

  return (
    <group position={position} rotation={rotation}>
      <Clone object={scene} scale={fit.scale} position={fit.offset} castShadow receiveShadow />
    </group>
  )
}

// ---------------------------------------------------------------------------
// ANIMATED ACTOR / NPC
// ---------------------------------------------------------------------------
function Actor({
  file,
  position,
  phase,
  action,
  enemy,
  rotation = 0,
}: {
  file: string
  position: [number, number, number]
  phase: number
  action: 'work' | 'carry' | 'train' | 'guard'
  enemy: boolean
  rotation?: number
}) {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * 2.5 + phase
    // Chuyển động nhẹ nhàng của từng nhân vật, không làm nhảy cả ô đất
    ref.current.position.y = position[1] + Math.abs(Math.sin(t)) * 0.02
    ref.current.rotation.z = action === 'work' ? Math.sin(t) * 0.05 : 0
    ref.current.rotation.y =
      rotation +
      (enemy ? Math.PI : 0) +
      (action === 'train' ? Math.sin(t) * 0.08 : action === 'guard' ? Math.sin(t * 0.4) * 0.03 : 0)
  })

  return (
    <group ref={ref} position={position}>
      {/* Vòng đế nhận diện phe quân cờ: Xanh Hoàng Gia (Ta) / Đỏ Hắc Diện (Địch) */}
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 16]} />
        <meshStandardMaterial
          color={enemy ? '#c92a2a' : '#1c7ed6'}
          emissive={enemy ? '#5c0000' : '#0c325c'}
          emissiveIntensity={0.6}
          roughness={0.4}
        />
      </mesh>
      {/* Hào quang nhỏ chân quân */}
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.26, 16]} />
        <meshBasicMaterial color={enemy ? '#ff6b6b' : '#74c0fc'} />
      </mesh>

      <Model file={file} height={0.68} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// TILE SELECTION RING (VÒNG NHẬT QUANG VÀNG KHI CHỌN Ô)
// ---------------------------------------------------------------------------
function Selection({ enemy }: { enemy: boolean }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 3.5) * 0.045
      ref.current.scale.set(s, s, 1)
    }
  })

  return (
    <group position={[0, 0.38, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ref}>
        <ringGeometry args={[1.08, 1.18, 48]} />
        <meshBasicMaterial color={enemy ? '#e64938' : '#f5be38'} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[1.08, 32]} />
        <meshBasicMaterial color={enemy ? '#c93b2b' : '#e5a928'} transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// 1. DIORAMA RUỘNG LÚA (RICE TERRITORY - ART BIBLE REF)
// ---------------------------------------------------------------------------
const riceClumps = Array.from({ length: 30 }, (_, i) => ({
  x: -0.88 + (i % 6) * 0.35 + ((i * 5) % 3) * 0.03,
  z: -0.68 + Math.floor(i / 6) * 0.28 + ((i * 3) % 2) * 0.03,
  phase: i * 0.55,
  scale: 0.85 + (i % 4) * 0.08,
}))

function RiceClump({ x, z, phase, scale }: { x: number; z: number; phase: number; scale: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 2.0 + phase) * 0.06
    }
  })
  return (
    <group ref={ref} position={[x, 0.24, z]} scale={scale}>
      {[-0.06, 0, 0.06].map((offset, i) => (
        <mesh key={i} position={[offset, 0.14, 0]} rotation={[0, 0, (i - 1) * 0.15]} castShadow>
          <planeGeometry args={[0.07, 0.34]} />
          <meshStandardMaterial
            color={i === 1 ? '#ffd048' : '#e5a828'}
            emissive={i === 1 ? '#4a3205' : '#382500'}
            roughness={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

function RiceDetails() {
  return (
    <group>
      {/* Đất ruộng màu nâu phù sa màu mỡ */}
      <mesh position={[0, 0.205, 0.12]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.08, 1.55]} />
        <meshStandardMaterial color="#584125" roughness={0.92} />
      </mesh>
      {/* Mương dẫn nước xanh trong kè đá */}
      <mesh position={[0, 0.218, 0.65]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.14, 0.24]} />
        <meshStandardMaterial color="#387a74" roughness={0.18} metalness={0.08} />
      </mesh>
      {/* 30 Cụm lúa vàng trĩu hạt dập dờn theo gió */}
      {riceClumps.map((clump, i) => (
        <RiceClump key={i} {...clump} />
      ))}
      {/* Bờ cỏ xanh mướt hai bên ruộng */}
      {[-1.04, 1.04].map((x) => (
        <mesh key={x} position={[x, 0.27, 0.15]} castShadow receiveShadow>
          <boxGeometry args={[0.14, 0.14, 1.68]} />
          <meshStandardMaterial color="#5f8836" roughness={0.85} />
        </mesh>
      ))}
      {/* Nhà tranh nông dân góc hậu cảnh */}
      <Model file={O_QUAN_ASSETS.buildings.farmerHouse} height={0.58} position={[-0.62, 0.22, -0.68]} rotation={[0, 0.15, 0]} />
      {/* Bao lương thực thu hoạch */}
      <Model file={O_QUAN_ASSETS.resources.food} height={0.24} position={[0.78, 0.23, 0.72]} />
      {/* Xe bò chất rơm */}
      <Model file={O_QUAN_ASSETS.props.cart} height={0.3} position={[-0.82, 0.22, 0.76]} rotation={[0, 0.6, 0]} />
      {/* Bó tre gác bờ */}
      <Model file={O_QUAN_ASSETS.resources.bamboo} height={0.2} position={[0.55, 0.23, -0.7]} rotation={[0, 1.2, 0]} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// 2. DIORAMA RỪNG TRE (BAMBOO GROVE - ART BIBLE REF)
// ---------------------------------------------------------------------------
function BambooDetails() {
  return (
    <group>
      {/* Thảm cỏ xanh rừng rậm */}
      <mesh position={[0, 0.205, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.1, 1.8]} />
        <meshStandardMaterial color="#50782e" roughness={0.88} />
      </mesh>
      {/* 7 Cụm tre xanh ngọc cao vút có đốt và tán lá nhọn */}
      {[
        [-0.85, -0.58],
        [-0.52, 0.55],
        [0.5, -0.6],
        [0.76, 0.36],
        [-0.15, -0.65],
        [-0.75, 0.15],
        [0.25, 0.6],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.22, z]} rotation={[0, i * 0.7, 0]}>
          {[-0.08, 0, 0.08].map((dx, j) => (
            <group key={j} position={[dx, 0, 0]}>
              {/* Thân tre xanh ngọc có đốt */}
              <mesh position={[0, 0.58 + (j % 2) * 0.18, 0]} castShadow>
                <cylinderGeometry args={[0.028, 0.038, 1.15 + (j % 2) * 0.35, 7]} />
                <meshStandardMaterial color={j === 1 ? '#469c32' : '#5db542'} roughness={0.68} />
              </mesh>
              {/* Vòng đốt tre vàng nhạt */}
              {[0.3, 0.65, 1.0].map((yNode) => (
                <mesh key={yNode} position={[0, yNode, 0]}>
                  <cylinderGeometry args={[0.036, 0.036, 0.02, 6]} />
                  <meshStandardMaterial color="#88b542" roughness={0.8} />
                </mesh>
              ))}
              {/* Tán lá tre xanh nhọn trên đỉnh */}
              <mesh position={[0, 1.22 + (j % 2) * 0.35, 0]} castShadow>
                <coneGeometry args={[0.18, 0.36, 6]} />
                <meshStandardMaterial color="#358225" roughness={0.72} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {/* Đống gỗ đẽo xếp hình kim tự tháp 3 tầng */}
      <group position={[0.68, 0.22, 0.65]} rotation={[0, -0.3, 0]}>
        {[-0.08, 0, 0.08].map((z, idx) => (
          <mesh key={`b1-${idx}`} position={[0, 0.04, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.38, 6]} />
            <meshStandardMaterial color="#8a5628" roughness={0.85} />
          </mesh>
        ))}
        {[-0.04, 0.04].map((z, idx) => (
          <mesh key={`b2-${idx}`} position={[0, 0.1, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.38, 6]} />
            <meshStandardMaterial color="#965f30" roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[0, 0.16, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.38, 6]} />
          <meshStandardMaterial color="#a86e38" roughness={0.85} />
        </mesh>
      </group>
      {/* Bó tre tươi */}
      <Model file={O_QUAN_ASSETS.resources.bamboo} height={0.24} position={[0.22, 0.22, 0.72]} rotation={[0, 0.4, 0]} />
      {/* Hàng rào tre quanh lối vào */}
      <Model file={O_QUAN_ASSETS.props.bambooFence} height={0.34} position={[-0.78, 0.22, 0.76]} rotation={[0, 0.2, 0]} />
      {/* Phiến đá bậc lối đi phủ rêu */}
      {[
        [-0.1, -0.72],
        [0.16, 0.68],
        [-0.45, 0.05],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.24, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 7]} />
          <meshStandardMaterial color="#7a7668" roughness={0.92} />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// 3. DIORAMA XƯỞNG MỘC & LÒ NUNG (WORKSHOP & FORGE - ART BIBLE REF)
// ---------------------------------------------------------------------------
function WorkshopDetails() {
  return (
    <group>
      {/* Nền đất xưởng nện chặt pha mùn cưa */}
      <mesh position={[0, 0.205, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.1, 1.8]} />
        <meshStandardMaterial color="#6e5538" roughness={0.92} />
      </mesh>
      {/* Nhà xưởng mộc gỗ mái ngói xám */}
      <Model file={O_QUAN_ASSETS.buildings.warehouse} height={0.76} position={[-0.42, 0.22, -0.22]} />
      {/* Lò luyện nung kim loại đỏ lửa than */}
      <Model file={O_QUAN_ASSETS.buildings.forge} height={0.58} position={[0.62, 0.22, -0.58]} rotation={[0, -0.4, 0]} />
      {/* Hòm vật liệu xây dựng đóng đai sắt */}
      <Model file={O_QUAN_ASSETS.resources.materials} height={0.25} position={[0.74, 0.22, 0.52]} />
      {/* Xe bò kéo gỗ */}
      <Model file={O_QUAN_ASSETS.props.cart} height={0.28} position={[-0.78, 0.22, 0.65]} rotation={[0, 0.75, 0]} />
      {/* Bàn thợ mộc cưa xẻ gỗ thủ công */}
      <group position={[0.32, 0.32, -0.05]}>
        {/* Mặt bàn gỗ dày */}
        <mesh castShadow position={[0, 0.05, 0]}>
          <boxGeometry args={[0.88, 0.08, 0.36]} />
          <meshStandardMaterial color="#8a5628" roughness={0.82} />
        </mesh>
        {/* 4 Chân bàn gỗ */}
        {[-0.38, 0.38].map((bx) =>
          [-0.14, 0.14].map((bz) => (
            <mesh key={`${bx}-${bz}`} position={[bx, -0.08, bz]} castShadow>
              <boxGeometry args={[0.06, 0.18, 0.06]} />
              <meshStandardMaterial color="#6e421d" roughness={0.88} />
            </mesh>
          ))
        )}
        {/* Lưỡi cưa tay kim loại */}
        <mesh position={[0.15, 0.11, 0.02]} rotation={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.32, 0.04, 0.02]} />
          <meshStandardMaterial color="#b0b8c0" roughness={0.3} metalness={0.85} />
        </mesh>
      </group>
      {/* Các khúc gỗ xẻ tròn đặt bên cạnh bàn */}
      {[-0.12, 0.12].map((z) => (
        <mesh key={z} position={[0.52, 0.36, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.72, 8]} />
          <meshStandardMaterial color="#7a4620" roughness={0.88} />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// 4. DIORAMA DOANH TRẠI (BARRACKS & DRILL GROUND - ART BIBLE REF)
// ---------------------------------------------------------------------------
function BarracksDetails() {
  return (
    <group>
      {/* Nền sân tập đất nung */}
      <mesh position={[0, 0.205, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.1, 1.8]} />
        <meshStandardMaterial color="#634e3a" roughness={0.92} />
      </mesh>
      {/* Lều chỉ huy chóp nón vải bạt viền vàng */}
      <Model file={O_QUAN_ASSETS.buildings.training} height={0.78} position={[-0.28, 0.22, -0.15]} />
      {/* Trống lệnh đại tráng trên giá gỗ */}
      <Model file={O_QUAN_ASSETS.props.drum} height={0.34} position={[0.72, 0.22, 0.45]} />
      {/* Hàng rào cọc chông phòng thủ */}
      <Model file={O_QUAN_ASSETS.props.stakes} height={0.38} position={[-0.82, 0.22, 0.58]} />
      {/* Quặng sắt đúc vũ khí */}
      <Model file={O_QUAN_ASSETS.resources.iron} height={0.22} position={[0.42, 0.22, 0.72]} />
      {/* Bia bắn cung 3 vòng chuẩn (Trắng - Đỏ - Vàng) trên giá gỗ */}
      <group position={[-0.75, 0.42, -0.6]} rotation={[0, 0.4, 0]}>
        {/* Giá đỡ 3 chân */}
        <mesh position={[0, -0.12, -0.08]} rotation={[0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.45, 6]} />
          <meshStandardMaterial color="#6e421d" roughness={0.88} />
        </mesh>
        {/* Vòng ngoài trắng */}
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.03, 24]} />
          <meshStandardMaterial color="#e8eaed" roughness={0.7} />
        </mesh>
        {/* Vòng giữa đỏ */}
        <mesh position={[0, 0, 0.016]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 0.01, 24]} />
          <meshStandardMaterial color="#c4261d" roughness={0.65} />
        </mesh>
        {/* Tâm vàng */}
        <mesh position={[0, 0, 0.022]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.01, 24]} />
          <meshStandardMaterial color="#f5be38" roughness={0.5} />
        </mesh>
      </group>
      {/* Giá 3 ngọn giáo đứng canh */}
      {[-0.55, 0, 0.55].map((x, i) => (
        <group key={x} position={[x, 0.3, -0.72]} rotation={[0, 0, i % 2 ? 0.08 : -0.08]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.024, 0.8, 6]} />
            <meshStandardMaterial color="#7a4e28" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow>
            <coneGeometry args={[0.06, 0.18, 5]} />
            <meshStandardMaterial color="#b0b8c0" roughness={0.3} metalness={0.85} />
          </mesh>
        </group>
      ))}
      {/* Đống lửa trại rực than hồng */}
      <group position={[0.35, 0.24, 0.25]}>
        {/* Đá bao quanh lửa */}
        {[0, 1.2, 2.4, 3.6, 4.8].map((ang, idx) => (
          <mesh key={idx} position={[Math.cos(ang) * 0.12, 0, Math.sin(ang) * 0.12]} castShadow>
            <dodecahedronGeometry args={[0.04, 0]} />
            <meshStandardMaterial color="#7a7668" roughness={0.92} />
          </mesh>
        ))}
        {/* Khối than rực đỏ */}
        <mesh castShadow>
          <dodecahedronGeometry args={[0.09, 0]} />
          <meshStandardMaterial color="#e64818" emissive="#ff4500" emissiveIntensity={0.9} roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

// ---------------------------------------------------------------------------
// 5. DIORAMA THÁP CANH (WATCHTOWER - ART BIBLE REF)
// ---------------------------------------------------------------------------
function TowerDetails() {
  return (
    <group>
      {/* Nền đất đá kiên cố */}
      <mesh position={[0, 0.205, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[2.1, 1.8]} />
        <meshStandardMaterial color="#5e5a4c" roughness={0.92} />
      </mesh>
      {/* Cọc nhọn phòng thủ trước cổng */}
      <Model file={O_QUAN_ASSETS.props.stakes} height={0.4} position={[0.76, 0.22, 0.55]} />
      <Model file={O_QUAN_ASSETS.props.bambooFence} height={0.34} position={[-0.75, 0.22, 0.68]} />
      {/* Đống đá tảng phòng thủ */}
      <Model file={O_QUAN_ASSETS.resources.stone} height={0.26} position={[0.25, 0.22, 0.72]} />
      {/* Khối đá tảng kiên cố chân tháp */}
      {[
        [-0.8, -0.62],
        [0.72, -0.68],
        [-0.45, 0.52],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.28, z]} castShadow>
          <dodecahedronGeometry args={[0.17, 0]} />
          <meshStandardMaterial color="#7a7668" roughness={0.94} />
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// WORK EFFECT PARTICLES (HIỆU ỨNG SẢN XUẤT)
// ---------------------------------------------------------------------------
function WorkEffect({ kind }: { kind: Building }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      const pulse = 0.75 + Math.sin(clock.elapsedTime * 2.6) * 0.25
      ref.current.scale.setScalar(pulse)
      ref.current.position.y = 0.72 + Math.sin(clock.elapsedTime * 1.9) * 0.08
    }
  })
  const color =
    kind === 'farm'
      ? '#f5c642'
      : kind === 'forest'
      ? '#5db542'
      : kind === 'workshop'
      ? '#e68a3e'
      : kind === 'barracks'
      ? '#e64938'
      : '#88b5aa'

  return (
    <group ref={ref} position={[0.55, 0.72, -0.35]}>
      <mesh>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

function TerritoryDetails({ kind }: { kind: Building }) {
  if (kind === 'farm') return <RiceDetails />
  if (kind === 'forest') return <BambooDetails />
  if (kind === 'workshop') return <WorkshopDetails />
  if (kind === 'barracks') return <BarracksDetails />
  return <TowerDetails />
}

// ---------------------------------------------------------------------------
// DYNAMIC OCCUPANTS (NPCs SPAWNED ON TILE)
// ---------------------------------------------------------------------------
function DynamicOccupants({ cell }: { cell: Cell }) {
  const cfg = dynamic[cell.building]
  const enemy = cell.owner === 'enemy'
  const count = cell.soldiers === 0 ? 0 : Math.min(5, Math.max(1, Math.ceil(cell.soldiers / 2)))
  const spawns = TERRITORY_SPAWNS[cell.building]

  return (
    <group>
      {spawns.slice(0, count).map((spawn, i) => (
        <Actor
          key={i}
          file={cfg.role}
          action={spawn.activity}
          enemy={enemy}
          phase={i * 1.1}
          position={spawn.position}
          rotation={spawn.rotation}
        />
      ))}
      <Model file={cfg.resource} height={0.26} position={[0.78, 0.22, 0.52]} />
      <Model
        file={enemy ? O_QUAN_ASSETS.props.redFlag : O_QUAN_ASSETS.props.blueFlag}
        height={0.85}
        position={[-0.86, 0.2, -0.52]}
      />
    </group>
  )
}

// ---------------------------------------------------------------------------
// DAN TILE (Ô DÂN THUỘC BÀN CỜ)
// ---------------------------------------------------------------------------
function DanTile({
  tile,
  cell,
  selected,
  onSelect,
  onHover,
  hasTrap,
}: {
  tile: BoardTile
  cell: Cell
  selected: boolean
  onSelect: (id: number) => void
  onHover?: (id: number | null) => void
  hasTrap?: boolean
}) {
  const { scene } = useGLTF(assetUrl(tile.asset))
  const [hover, setHover] = useState(false)
  const enemy = cell.owner === 'enemy'
  const root = useMemo(() => scene.clone(true), [scene])

  const click = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (!enemy) onSelect(cell.id)
  }

  return (
    <group
      position={tile.position}
      rotation={tile.rotation}
      onClick={click}
    >
      {/* KHỐI NỀN ĐẤT TĨNH - TUYỆT ĐỐI KHÔNG NHẢY ĐỘNG */}
      <primitive object={root} />
      <TerritoryDetails kind={cell.building} />

      {/* Lưới tàng hình bắt sự kiện hover/click riêng biệt */}
      <mesh
        position={[0, 0.35, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
          onHover?.(cell.id)
        }}
        onPointerOut={() => {
          setHover(false)
          onHover?.(null)
        }}
      >
        <planeGeometry args={[2.8, 2.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* HIỂN THỊ CẤP SAO CỦA Ô (★ 1/2/3) */}
      {(cell.stars || 1) > 1 && (
        <group position={[0, 1.25, 0]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.08, 6]} />
            <meshStandardMaterial color="#f5be38" metalness={0.8} roughness={0.2} emissive="#f5be38" emissiveIntensity={0.3} />
          </mesh>
          <pointLight color="#ffc107" intensity={0.8} distance={1.5} />
        </group>
      )}

      {/* HIỂN THỊ KHIÊN BẢO VỆ DANH TƯỚNG (NẾU CÓ) */}
      {(cell.shieldTurns || 0) > 0 && (
        <group position={[0, 0.65, 0]}>
          <mesh>
            <sphereGeometry args={[1.25, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.8]} />
            <meshStandardMaterial
              color="#38d9a9"
              emissive="#0ca678"
              emissiveIntensity={0.6}
              transparent
              opacity={0.45}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <pointLight color="#20c997" intensity={2} distance={3} />
        </group>
      )}

      {/* HIỂN THỊ QUÂN NỘI GIÁN (NẾU CÓ) */}
      {(cell.spies || 0) > 0 && (
        <group position={[-0.45, 0.85, 0.35]}>
          <mesh>
            <coneGeometry args={[0.12, 0.3, 5]} />
            <meshStandardMaterial color="#e64938" emissive="#8b0000" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {/* HIỂN THỊ BÃI CHÔNG BẪY MỞ (NẾU CÓ) */}
      {hasTrap && (
        <group position={[0, 0.35, 0]}>
          {[-0.2, 0, 0.2].map((ox, idx) => (
            <mesh key={idx} position={[ox, 0.12, 0]} rotation={[0, 0, (idx - 1) * 0.2]}>
              <coneGeometry args={[0.06, 0.38, 4]} />
              <meshStandardMaterial color="#44474d" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
          <pointLight color="#ff3b30" intensity={1.2} distance={1.8} />
        </group>
      )}

      {/* Lớp phủ và Vòng hào quang nhận diện phe: XANH NGỌC (Ta) vs ĐỎ RỰC (Địch) */}
      <mesh position={[0, 0.221, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
        <planeGeometry args={[2.55, 2.15]} />
        <meshBasicMaterial
          color={cell.owner === 'player' ? '#1864ab' : cell.owner === 'enemy' ? '#c92a2a' : '#495057'}
          transparent
          opacity={0.38}
          depthWrite={false}
        />
      </mesh>

      {/* Vòng viền sáng quanh chân ô theo phe */}
      <mesh position={[0, 0.23, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.18, 1.28, 32]} />
        <meshBasicMaterial
          color={enemy ? '#ff4d4f' : '#4dabf7'}
          transparent
          opacity={hover ? 0.95 : 0.55}
        />
      </mesh>

      <DynamicOccupants cell={cell} />
      {cell.soldiers > 0 && <WorkEffect kind={cell.building} />}
      {selected && <Selection enemy={enemy} />}
      {hover && !selected && (
        <mesh position={[0, 0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.05, 1.14, 36]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
        </mesh>
      )}
    </group>
  )
}

// ---------------------------------------------------------------------------
// FLUTTERING BANNER / FLAG
// ---------------------------------------------------------------------------
function Flag({ enemy, position, height = 1.2 }: { enemy: boolean; position: [number, number, number]; height?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 2.2 + position[0]) * 0.035
    }
  })
  return (
    <group ref={ref}>
      <Model file={enemy ? O_QUAN_ASSETS.props.redFlag : O_QUAN_ASSETS.props.blueFlag} height={height} position={position} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// FORTRESS FOUNDATION & QUAN TILE (ĐẠI THÀNH & ĐỊCH THÀNH - ART BIBLE REF)
// ---------------------------------------------------------------------------
function FortressGround({ enemy }: { enemy: boolean }) {
  const stone = enemy ? '#343238' : '#81745b'
  const wall = enemy ? '#4a3c3a' : '#b08a58'
  const accent = enemy ? '#8f251d' : '#bd3b27'
  const roof = enemy ? '#241f25' : '#9f2f23'
  const glow = enemy ? '#ff3b22' : '#ffc05a'
  const corners: [number, number][] = [[-1.25,-.88],[-1.25,.88],[1.25,-.88],[1.25,.88]]
  return (
    <group>
      {/* Hào bảo vệ và móng ba tầng */}
      <mesh position={[0,.05,0]} rotation={[-Math.PI/2,0,0]}>
        <ringGeometry args={[1.75,2.25,8]} />
        <meshStandardMaterial color={enemy?'#381d18':'#276c70'} emissive={enemy?'#270805':'#092f33'} emissiveIntensity={.35} roughness={.28}/>
      </mesh>
      <mesh position={[0,.14,0]} receiveShadow castShadow><cylinderGeometry args={[1.72,1.95,.28,8]}/><meshStandardMaterial color={stone} roughness={.92}/></mesh>
      <mesh position={[0,.34,0]} receiveShadow castShadow><cylinderGeometry args={[1.48,1.66,.22,8]}/><meshStandardMaterial color={wall} roughness={.82}/></mesh>
      <mesh position={[0,.53,0]} receiveShadow castShadow><cylinderGeometry args={[1.2,1.4,.2,8]}/><meshStandardMaterial color={enemy?'#312d31':'#8d7658'} roughness={.86}/></mesh>

      {/* Cầu chính và cổng thành */}
      <mesh position={[-1.8,.2,0]} castShadow receiveShadow><boxGeometry args={[1.35,.2,.82]}/><meshStandardMaterial color={enemy?'#4a3024':'#9a846a'} roughness={.86} metalness={enemy?.25:0}/></mesh>
      <group position={[-1.12,.72,0]}>
        <mesh castShadow><boxGeometry args={[.25,.9,1.25]}/><meshStandardMaterial color={wall} roughness={.82}/></mesh>
        <mesh position={[-.15,.08,0]}><boxGeometry args={[.08,.58,.58]}/><meshStandardMaterial color={enemy?'#19191c':'#5b301e'} metalness={enemy?.65:.1} roughness={.5}/></mesh>
        <mesh position={[0,.55,0]} rotation={[0,0,Math.PI/4]} castShadow><boxGeometry args={[.82,.82,.82]}/><meshStandardMaterial color={roof} roughness={.72}/></mesh>
        <mesh position={[0,.55,0]} rotation={[0,0,Math.PI/4]}><boxGeometry args={[.86,.09,.9]}/><meshStandardMaterial color={accent} roughness={.68}/></mesh>
      </group>

      {/* Bốn tháp góc và đuốc */}
      {corners.map(([x,z],i)=>(
        <group key={i} position={[x,.55,z]}>
          <mesh castShadow><cylinderGeometry args={[.28,.36,.85,enemy?6:8]}/><meshStandardMaterial color={wall} roughness={.84}/></mesh>
          <mesh position={[0,.5,0]} castShadow><coneGeometry args={[.48,.34,enemy?6:8]}/><meshStandardMaterial color={roof} roughness={.7}/></mesh>
          {enemy&&<mesh position={[0,.1,z>0?.3:-.3]} rotation={[z>0?Math.PI/2:-Math.PI/2,0,0]}><coneGeometry args={[.06,.3,5]}/><meshStandardMaterial color="#9ca1a5" metalness={.8}/></mesh>}
          <pointLight position={[0,.18,0]} color={glow} intensity={1.6} distance={2.5}/>
          <mesh position={[0,.18,0]}><sphereGeometry args={[.065,8,8]}/><meshBasicMaterial color={glow}/></mesh>
        </group>
      ))}

      {/* Đại điện trung tâm */}
      <group position={[.2,.78,0]}>
        <mesh castShadow><boxGeometry args={[1.35,.72,1.2]}/><meshStandardMaterial color={enemy?'#3b3438':'#a97b4b'} roughness={.8}/></mesh>
        <mesh position={[0,.47,0]} rotation={[0,Math.PI/4,0]} castShadow><cylinderGeometry args={[.9,1.05,.32,4]}/><meshStandardMaterial color={roof} roughness={.68}/></mesh>
        <mesh position={[0,.68,0]} rotation={[0,Math.PI/4,0]} castShadow><cylinderGeometry args={[.58,.72,.25,4]}/><meshStandardMaterial color={accent} roughness={.65}/></mesh>
        <mesh position={[0,.9,0]} castShadow><coneGeometry args={[.12,.35,6]}/><meshStandardMaterial color={enemy?'#a2a6aa':'#d7ad55'} metalness={.65}/></mesh>
      </group>

      {/* Chông thép địch / lan can vàng phe ta */}
      {[-.9,-.45,0,.45,.9].map((z,i)=><mesh key={i} position={[-1.55,.48,z]} rotation={[0,0,enemy?-.55:0]} castShadow>{enemy?<coneGeometry args={[.07,.55,5]}/>:<cylinderGeometry args={[.035,.045,.55,6]}/>}<meshStandardMaterial color={enemy?'#64676a':'#c9a45b'} metalness={.65} roughness={.38}/></mesh>)}
    </group>
  )
}

function FortressAura({ enemy }: { enemy: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const motes = useMemo(() => Array.from({length:14},(_,i)=>({
    x:-1.3+(i%5)*.62,
    z:-1.05+((i*3)%7)*.34,
    y:.25+(i%4)*.22,
    phase:i*.71,
  })),[])
  useFrame(({clock})=>{
    if(!ref.current)return
    ref.current.children.forEach((child,i)=>{
      const p=motes[i]
      child.position.y=p.y+(clock.elapsedTime*.18+p.phase)%1.2
      child.position.x=p.x+Math.sin(clock.elapsedTime*1.3+p.phase)*.08
      child.scale.setScalar(.65+Math.sin(clock.elapsedTime*2+p.phase)*.25)
    })
  })
  return <group ref={ref}>{motes.map((p,i)=><mesh key={i} position={[p.x,p.y,p.z]}><sphereGeometry args={[enemy?.035:.028,6,6]}/><meshBasicMaterial color={enemy?'#ff4a26':'#ffd36b'} transparent opacity={.72}/></mesh>)}</group>
}

// ---------------------------------------------------------------------------
// GIẢI PHÁP 2: CỘT SÁNG NHẬN DIỆN TỪ XA (BEACON PILLARS)
// ---------------------------------------------------------------------------
function BeaconPillar({ enemy }: { enemy: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.4
      const s = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.08
      ref.current.scale.set(s, 1, s)
    }
  })
  const color = enemy ? '#ff321d' : '#e6ab33'
  return (
    <group position={[0, 1.8, 0]}>
      <mesh ref={ref}>
        <cylinderGeometry args={[0.22, 0.45, 6.5, 12, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <pointLight color={color} intensity={2.8} distance={8} position={[0, 1.2, 0]} />
    </group>
  )
}

function QuanTile({
  tile,
  enemy,
  onHover,
}: {
  tile: BoardTile
  enemy: boolean
  onHover?: (id: string | null) => void
}) {
  const { scene } = useGLTF(assetUrl(tile.asset))
  const root = useMemo(() => scene.clone(true), [scene])

  return (
    <group
      position={tile.position}
      rotation={tile.rotation}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover?.(enemy ? 'enemy' : 'player')
      }}
      onPointerOut={() => {
        onHover?.(null)
      }}
    >
      <FortressGround enemy={enemy} />
      <primitive object={root} />
      <FortressAura enemy={enemy} />
      <BeaconPillar enemy={enemy} />

      {/* Đội cấm quân dàn hai hàng bảo vệ cầu thành */}
      {[-0.72, -0.36, 0, 0.36, 0.72].map((z, i) => (
        <Actor
          key={i}
          file={O_QUAN_ASSETS.characters.elite}
          action="guard"
          enemy={enemy}
          phase={i}
          position={[-1.55, 0.34, z]}
          rotation={i % 2 ? 0.08 : -0.08}
        />
      ))}

      {/* Thống lĩnh đứng trên sân thượng đại điện */}
      <Actor file={O_QUAN_ASSETS.characters.elite} action="guard" enemy={enemy} phase={7} position={[.15,1.48,0]} rotation={-Math.PI/2}/>

      {/* 4 Ngọn cờ hoàng gia trên 4 góc lầu thành */}
      <Flag enemy={enemy} height={1.45} position={[1.25, 0.85, -0.88]} />
      <Flag enemy={enemy} height={1.25} position={[-1.25, 0.85, 0.88]} />
      <Flag enemy={enemy} height={1.25} position={[1.25, 0.85, 0.88]} />
      <Flag enemy={enemy} height={1.25} position={[-1.25, 0.85, -0.88]} />

      {/* Tượng Trống Đồng Đông Sơn bằng đồng vàng trước sảnh Đại Thành */}
      {!enemy && (
        <group position={[-.55, 0.62, 0]}>
          {/* Bệ đá chạm khắc */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.16, 0.42]} />
            <meshStandardMaterial color="#6e6858" roughness={0.9} />
          </mesh>
          {/* Trống đồng Đông Sơn */}
          <Model file={O_QUAN_ASSETS.props.gong} height={0.38} position={[0, 0.08, 0]} />
        </group>
      )}

      {/* Khối quặng sắt thô trước sảnh Địch Thành */}
      {enemy && (
        <Model file={O_QUAN_ASSETS.resources.iron} height={0.42} position={[-.55, 0.55, 0.65]} />
      )}
    </group>
  )
}

// ---------------------------------------------------------------------------
// MARCHING ANIMATION (HOẠT CẢNH RẢI QUÂN TỪNG BƯỚC RÕ RÀNG)
// ---------------------------------------------------------------------------
export type MarchEvent = {
  key: number
  path: number[]
  sourceId: number
  direction: 1 | -1
  totalTroops: number
  siegeAttack?: { wave: number; damage: number; defense: number }
  ambushTarget?: { cellId: number; captured: number; damage: number }
}

function StepMarker({ position, active }: { position: [number, number, number]; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current && active) {
      const s = 1 + Math.sin(clock.elapsedTime * 6) * 0.15
      ref.current.scale.set(s, s, 1)
    }
  })
  if (!active) return null
  return (
    <group position={[position[0], position[1] + 0.35, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh ref={ref}>
        <ringGeometry args={[1.15, 1.35, 32]} />
        <meshBasicMaterial color="#f5be38" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function March({
  marchData,
  onStep,
  onDone,
}: {
  marchData: MarchEvent
  onStep: (stepIndex: number, tileId: number) => void
  onDone: () => void
}) {
  const { path } = marchData
  const ref = useRef<THREE.Group>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const lastReportedStep = useRef(-1)
  const start = useRef(performance.now())
  const stepDuration = 800 // 800ms mỗi bước để người chơi theo dõi trọn vẹn từng ô

  useFrame(() => {
    if (!ref.current || path.length < 2) return
    const elapsed = performance.now() - start.current
    const totalSteps = path.length - 1
    const totalDuration = totalSteps * stepDuration
    const progress = Math.min(1, elapsed / totalDuration)
    const exactStep = progress * totalSteps
    const stepIdx = Math.min(totalSteps - 1, Math.floor(exactStep))
    const t = exactStep - stepIdx

    if (stepIdx !== lastReportedStep.current) {
      lastReportedStep.current = stepIdx
      setCurrentStep(stepIdx)
      onStep(stepIdx, path[stepIdx + 1])
    }

    const a = new THREE.Vector3(...tilePosition(path[stepIdx]))
    const b = new THREE.Vector3(...tilePosition(path[stepIdx + 1]))

    ref.current.position.lerpVectors(a, b, t)
    // Bước nhảy vòng cung parabol rõ nét chỉ cho đơn vị di chuyển (không ảnh hưởng ô đất)
    ref.current.position.y = 0.35 + Math.sin(t * Math.PI) * 0.75
    ref.current.rotation.y = Math.atan2(b.x - a.x, b.z - a.z)

    if (progress >= 1) {
      onDone()
    }
  })

  const remaining = Math.max(1, marchData.totalTroops - currentStep)
  const isEnemyMarch = path[0] >= 5

  return (
    <>
      {/* Vòng sáng chỉ điểm ô đang rải quân tới */}
      <StepMarker
        position={tilePosition(path[Math.min(path.length - 1, currentStep + 1)])}
        active={true}
      />

      {/* Đạo quân đang di chuyển */}
      <group ref={ref}>
        {/* Vòng đế nhận diện phe của đạo quân đang rải */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.32, 24]} />
          <meshStandardMaterial
            color={isEnemyMarch ? '#c92a2a' : '#1c7ed6'}
            emissive={isEnemyMarch ? '#5c0000' : '#0c325c'}
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* Người lính dẫn đầu */}
        <Actor
          file={isEnemyMarch ? O_QUAN_ASSETS.characters.soldier : O_QUAN_ASSETS.characters.soldier}
          action="work"
          enemy={isEnemyMarch}
          phase={0}
          position={[0, 0, 0]}
        />
        {/* Cờ lệnh: Đỏ (Địch) / Xanh (Ta) */}
        <Model
          file={isEnemyMarch ? O_QUAN_ASSETS.props.redFlag : O_QUAN_ASSETS.props.blueFlag}
          height={0.85}
          position={[0.25, 0.1, -0.15]}
        />

        {/* Khối huy hiệu đếm số quân trên đầu */}
        <group position={[0, 1.25, 0]}>
          <mesh>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial
              color={isEnemyMarch ? '#ff4d4f' : '#ffd048'}
              emissive={isEnemyMarch ? '#8b0000' : '#b38600'}
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      </group>
    </>
  )
}

// ---------------------------------------------------------------------------
// HIỆU ỨNG CÔNG THÀNH TOÀN CẢNH (SIEGE INVASION CINEMATIC - 4.5 GIÂY RÕ RÀNG)
// ---------------------------------------------------------------------------
function SiegeEffect({ active, onDone }: { active: boolean; onDone: () => void }) {
  const refArmy = useRef<THREE.Group>(null)
  const refMeteors = useRef<THREE.Group>(null)
  const refShield = useRef<THREE.Mesh>(null)
  const start = useRef(performance.now())

  useEffect(() => {
    if (active) start.current = performance.now()
  }, [active])

  useFrame(({ clock }) => {
    if (!active) return
    const elapsed = performance.now() - start.current
    const duration = 4500 // Kéo dài 4.5 giây để nhìn rõ trọn vẹn toàn bộ đạo quân tràn qua
    const p = Math.min(1, elapsed / duration)

    // 1. Đội quân địch tràn trận dọc theo trục bàn cờ
    if (refArmy.current) {
      const a = new THREE.Vector3(-10.2, 0.25, 2.1)
      const b = new THREE.Vector3(9.2, 0.35, -2.8)
      refArmy.current.position.lerpVectors(a, b, Math.min(1, p * 1.1))
      refArmy.current.position.y = 0.3 + Math.abs(Math.sin(clock.elapsedTime * 8)) * 0.14
    }

    // 2. Cầu lửa đạn pháo bay vồng trên không dội vào thành
    if (refMeteors.current) {
      const a = new THREE.Vector3(-9.5, 1.6, 2.1)
      const b = new THREE.Vector3(10.2, 0.9, -3.2)
      refMeteors.current.position.lerpVectors(a, b, p)
      refMeteors.current.position.y = 1.6 + Math.sin(p * Math.PI) * 4.8
      refMeteors.current.rotation.x = clock.elapsedTime * 5
      refMeteors.current.rotation.z = clock.elapsedTime * 4
    }

    // 3. Khiên phòng thủ Đại Thành lóe sáng đỡ đòn ở cuối pha
    if (refShield.current && p > 0.45) {
      const s = 1 + Math.sin((p - 0.45) * Math.PI * 3) * 0.3
      refShield.current.scale.set(s, s, s)
      const mat = refShield.current.material as THREE.MeshBasicMaterial
      mat.opacity = Math.sin((p - 0.45) * Math.PI * 1.8) * 0.8
    }

    if (p >= 1) {
      onDone()
    }
  })

  if (!active) return null

  return (
    <group>
      {/* ĐỘI QUÂN ĐỊCH LAO VÀO CÔNG THÀNH */}
      <group ref={refArmy}>
        {/* Hàng 5 thiết vệ cầm giáo lao nhanh */}
        {[-0.7, -0.35, 0, 0.35, 0.7].map((z, i) => (
          <group key={i} position={[(i % 2) * 0.4 - 0.2, 0, z]}>
            <Actor
              file={O_QUAN_ASSETS.characters.soldier}
              action="train"
              enemy={true}
              phase={i * 0.8}
              position={[0, 0, 0]}
              rotation={-Math.PI / 2}
            />
          </group>
        ))}
        {/* Tướng tiên phong vung đao bọc cờ đỏ */}
        <group position={[0.75, 0, 0]}>
          <Actor
            file={O_QUAN_ASSETS.characters.elite}
            action="guard"
            enemy={true}
            phase={1}
            position={[0, 0, 0]}
            rotation={-Math.PI / 2}
          />
          <Model file={O_QUAN_ASSETS.props.redFlag} height={1.0} position={[0.25, 0.1, -0.25]} />
        </group>
      </group>

      {/* 3 QUẢ CẦU LỬA PHÁ THÀNH */}
      <group ref={refMeteors}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.48, 14, 14]} />
          <meshBasicMaterial color="#ff2d12" />
        </mesh>
        <mesh position={[-0.4, -0.3, 0.25]}>
          <sphereGeometry args={[0.3, 10, 10]} />
          <meshBasicMaterial color="#ff6214" />
        </mesh>
        <mesh position={[0.35, -0.25, -0.3]}>
          <sphereGeometry args={[0.32, 10, 10]} />
          <meshBasicMaterial color="#ff4500" />
        </mesh>
        <pointLight color="#ff3b19" intensity={6} distance={9} />
      </group>

      {/* KHIÊN PHÒNG THỦ LŨY ĐẠI THÀNH */}
      <mesh ref={refShield} position={[8.8, 1.2, -2.9]} rotation={[0, -Math.PI / 4, 0]}>
        <sphereGeometry args={[2.6, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#40a9ff" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// HIỆU ỨNG PHỤC KÍCH ĐỊCH THÀNH (AMBUSH STRIKE - 2.5 GIÂY RÕ RÀNG)
// ---------------------------------------------------------------------------
function AmbushEffect({ targetCellId, active, onDone }: { targetCellId: number | null; active: boolean; onDone: () => void }) {
  const ref = useRef<THREE.Group>(null)
  const start = useRef(performance.now())

  useEffect(() => {
    if (active) start.current = performance.now()
  }, [active])

  useFrame(() => {
    if (!ref.current || !active || targetCellId === null) return
    const elapsed = performance.now() - start.current
    const duration = 2500 // Kéo dài 2.5 giây
    const p = Math.min(1, elapsed / duration)
    const a = new THREE.Vector3(...tilePosition(targetCellId))
    const b = new THREE.Vector3(-10.2, 1.2, 2.1) // Bắn phá Địch Thành

    ref.current.position.lerpVectors(a, b, p)
    ref.current.position.y = 0.5 + Math.sin(p * Math.PI) * 3.2

    if (p >= 1) {
      onDone()
    }
  })

  if (!active || targetCellId === null) return null

  return (
    <group ref={ref}>
      <mesh>
        <coneGeometry args={[0.42, 1.1, 8]} />
        <meshBasicMaterial color="#52c41a" />
      </mesh>
      <pointLight color="#a8f0b4" intensity={4} distance={6} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// FIREFLIES & ATMOSPHERIC PARTICLES
// ---------------------------------------------------------------------------
function Fireflies() {
  const points = useMemo(() => {
    const a = new Float32Array(96)
    for (let i = 0; i < a.length; i += 3) {
      a[i] = ((i % 11) - 5) * 1.6
      a[i + 1] = 0.5 + ((i % 5) * 0.25)
      a[i + 2] = (((i * 7) % 15) - 7) * 0.7
    }
    return a
  }, [])

  const ref = useRef<THREE.Points>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.02
      const mat = ref.current.material as THREE.PointsMaterial
      mat.opacity = 0.4 + Math.sin(clock.elapsedTime * 1.5) * 0.2
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffe585" size={0.06} transparent opacity={0.5} depthWrite={false} />
    </points>
  )
}

// ---------------------------------------------------------------------------
// PINE TREE HELPER (CÂY THÔNG XANH TRÊN ĐẢO & SƯỜN NÚI)
// ---------------------------------------------------------------------------
function PineTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Thân cây gỗ nâu */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.065, 0.45, 6]} />
        <meshStandardMaterial color="#54361e" roughness={0.9} />
      </mesh>
      {/* 3 Tầng tán lá thông xanh nhọn */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <coneGeometry args={[0.32, 0.48, 6]} />
        <meshStandardMaterial color="#2d5e32" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <coneGeometry args={[0.25, 0.42, 6]} />
        <meshStandardMaterial color="#38743e" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.94, 0]} castShadow>
        <coneGeometry args={[0.18, 0.35, 6]} />
        <meshStandardMaterial color="#468c4e" roughness={0.75} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// SAILING JUNK (THUYỀN BUỒM LƯỚT SÓNG)
// ---------------------------------------------------------------------------
function SailingJunk({
  position,
  rotation = 0,
  redSail = true,
  scale = 1,
}: {
  position: [number, number, number]
  rotation?: number
  redSail?: boolean
  scale?: number
}) {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.elapsedTime * 1.5 + position[0]
      ref.current.position.y = position[1] + Math.sin(t) * 0.025
      ref.current.rotation.z = Math.sin(t * 1.2) * 0.03
      ref.current.rotation.x = Math.cos(t * 0.9) * 0.02
    }
  })

  return (
    <group ref={ref} position={position} rotation={[0, rotation, 0]} scale={scale}>
      <Model file={O_QUAN_ASSETS.props.boat} height={0.42} position={[0, 0, 0]} />
      {/* Cột buồm gỗ */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.024, 0.85, 6]} />
        <meshStandardMaterial color="#6e421d" roughness={0.85} />
      </mesh>
      {/* Cánh buồm vải căng gió hình vòm */}
      <mesh position={[0, 0.52, 0.12]} rotation={[0.1, 0, 0]} castShadow>
        <planeGeometry args={[0.42, 0.58]} />
        <meshStandardMaterial
          color={redSail ? '#c4281c' : '#f0ede6'}
          side={THREE.DoubleSide}
          roughness={0.7}
        />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// FLYING CRANES (ĐÀN HẠC TRẮNG BAY LƯỢN)
// ---------------------------------------------------------------------------
function Crane({
  startPos,
  speed = 1,
  radius = 12,
  phase = 0,
}: {
  startPos: [number, number, number]
  speed?: number
  radius?: number
  phase?: number
}) {
  const ref = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.elapsedTime * 0.35 * speed + phase
      ref.current.position.x = startPos[0] + Math.cos(t) * radius
      ref.current.position.z = startPos[2] + Math.sin(t) * (radius * 0.6)
      ref.current.position.y = startPos[1] + Math.sin(t * 2) * 0.3
      ref.current.rotation.y = -t + Math.PI / 2
      // Vỗ cánh
      const wingFlap = Math.sin(clock.elapsedTime * 6 + phase) * 0.25
      const leftWing = ref.current.children[1] as THREE.Mesh
      const rightWing = ref.current.children[2] as THREE.Mesh
      if (leftWing && rightWing) {
        leftWing.rotation.z = wingFlap
        rightWing.rotation.z = -wingFlap
      }
    }
  })

  return (
    <group ref={ref} position={startPos} scale={0.7}>
      {/* Thân chim hạc trắng */}
      <mesh castShadow>
        <capsuleGeometry args={[0.06, 0.28, 4, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.5} />
      </mesh>
      {/* Cánh trái */}
      <mesh position={[-0.24, 0.02, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.42, 0.16]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      {/* Cánh phải */}
      <mesh position={[0.24, 0.02, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.42, 0.16]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function FlyingCranes() {
  return (
    <group>
      <Crane startPos={[-2, 4.2, -4]} speed={1.1} radius={14} phase={0} />
      <Crane startPos={[-4, 4.6, -3]} speed={1.1} radius={14.8} phase={0.5} />
      <Crane startPos={[3, 5.1, 2]} speed={0.9} radius={16} phase={2.2} />
    </group>
  )
}

// ---------------------------------------------------------------------------
// WATERFALL (THÁC NƯỚC ĐỔ TỪ KHE NÚI)
// ---------------------------------------------------------------------------
function Waterfall({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.75 + Math.sin(clock.elapsedTime * 8) * 0.15
    }
  })

  return (
    <group position={position}>
      {/* Dòng thác trắng tuôn chảy */}
      <mesh ref={ref} position={[0, 0, 0]} rotation={[-0.15, 0, 0]}>
        <planeGeometry args={[0.65, 3.8]} />
        <meshStandardMaterial color="#e0f4f7" roughness={0.1} transparent opacity={0.85} />
      </mesh>
      {/* Bọt nước chân thác */}
      <mesh position={[0, -1.85, 0.28]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 12]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------------------
// MOUNTAIN RANGES & HIGHLANDS (DÃY NÚI HÙNG VĨ BAO QUANH)
// ---------------------------------------------------------------------------
function MountainRanges() {
  return (
    <group>
      {/* === DÃY NÚI ĐÁ CAO GÓC TRÊN PHẢI (TOP-RIGHT RIDGE) === */}
      <group position={[18, 0, -18]}>
        {/* Đỉnh núi chính cao nhất */}
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <coneGeometry args={[5.2, 7.5, 7]} />
          <meshStandardMaterial color="#485056" roughness={0.92} />
        </mesh>
        {/* Đỉnh phủ đá sáng / rêu */}
        <mesh position={[0, 6.2, 0]} castShadow>
          <coneGeometry args={[1.8, 2.6, 7]} />
          <meshStandardMaterial color="#6a747c" roughness={0.88} />
        </mesh>
        {/* Pháo đài tiền đồn trên đỉnh núi cao */}
        <group position={[0, 7.2, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[1.2, 0.8, 1.2]} />
            <meshStandardMaterial color="#8a8578" roughness={0.9} />
          </mesh>
          <Flag enemy={false} height={1.2} position={[0.45, 0.8, 0]} />
        </group>
        {/* Các đỉnh núi phụ xung quanh tạo rặng núi liên hoàn */}
        <mesh position={[-4.5, 2.5, 2.5]} castShadow receiveShadow>
          <coneGeometry args={[3.8, 5.5, 6]} />
          <meshStandardMaterial color="#424a50" roughness={0.94} />
        </mesh>
        <mesh position={[4.2, 2.8, -3.5]} castShadow receiveShadow>
          <coneGeometry args={[4.2, 6.0, 7]} />
          <meshStandardMaterial color="#505860" roughness={0.92} />
        </mesh>
        <mesh position={[2.5, 1.8, 4.5]} castShadow receiveShadow>
          <coneGeometry args={[3.2, 4.0, 6]} />
          <meshStandardMaterial color="#3c444a" roughness={0.95} />
        </mesh>
        {/* Thác nước đổ từ vách núi */}
        <Waterfall position={[-2.8, 2.2, 4.8]} />
        {/* Rừng thông mọc trên sườn núi */}
        {[
          [-2.5, 1.2, 3.5],
          [-1.2, 1.8, 4.2],
          [2.0, 1.0, 5.2],
          [-3.8, 0.8, 2.2],
        ].map(([px, py, pz], idx) => (
          <PineTree key={idx} position={[px, py, pz]} scale={0.9 + (idx % 2) * 0.2} />
        ))}
      </group>

      {/* === DÃY NÚI ĐÁ GÓC TRÊN TRÁI (TOP-LEFT RIDGE) === */}
      <group position={[-19, 0, -17]}>
        <mesh position={[0, 3.0, 0]} castShadow receiveShadow>
          <coneGeometry args={[4.8, 6.5, 7]} />
          <meshStandardMaterial color="#454c52" roughness={0.94} />
        </mesh>
        <mesh position={[3.5, 2.2, 3.0]} castShadow receiveShadow>
          <coneGeometry args={[3.4, 4.8, 6]} />
          <meshStandardMaterial color="#3e454b" roughness={0.95} />
        </mesh>
        <mesh position={[-3.8, 2.4, -2.5]} castShadow receiveShadow>
          <coneGeometry args={[3.6, 5.2, 6]} />
          <meshStandardMaterial color="#4a5258" roughness={0.92} />
        </mesh>
        {/* Cây thông sườn núi tây */}
        {[
          [1.8, 1.0, 3.8],
          [3.2, 0.8, 2.2],
        ].map(([px, py, pz], idx) => (
          <PineTree key={idx} position={[px, py, pz]} scale={1.0} />
        ))}
      </group>

      {/* === DÃY ĐỒI NÚI GÓC DƯỚI TRÁI & PHẢI (PERIMETER HILLS) === */}
      <group position={[-20, 0, 13]}>
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
          <coneGeometry args={[4.2, 4.8, 6]} />
          <meshStandardMaterial color="#3a4248" roughness={0.95} />
        </mesh>
      </group>
      <group position={[19, 0, 14]}>
        <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
          <coneGeometry args={[4.0, 4.4, 6]} />
          <meshStandardMaterial color="#3d454a" roughness={0.95} />
        </mesh>
      </group>
    </group>
  )
}

// ---------------------------------------------------------------------------
// SURROUNDING ARCHIPELAGO & ISLETS (CÁC HÒN ĐẢO THÔNG XANH VEN SÔNG)
// ---------------------------------------------------------------------------
function SurroundingIslands() {
  return (
    <group>
      {/* === ĐẢO NHỎ TRUNG TÂM PHÍA NAM (SOUTH CENTRAL PINE ISLAND) === */}
      <group position={[0.5, -0.02, 4.5]}>
        {/* Thềm đất cát bãi bồi đảo */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[2.8, 18]} />
          <meshStandardMaterial color="#556b42" roughness={0.9} />
        </mesh>
        {/* Bãi cát đá ven bờ */}
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[3.2, 18]} />
          <meshStandardMaterial color="#35786a" roughness={0.6} transparent opacity={0.65} />
        </mesh>
        {/* Cụm 12 cây thông xanh mọc dày đặc trên đảo */}
        {[
          [-1.2, 0, -0.6],
          [-0.6, 0, 0.4],
          [0, 0, -0.8],
          [0.5, 0, 0.2],
          [1.1, 0, -0.3],
          [-0.8, 0, -1.2],
          [0.8, 0, 0.9],
          [-1.5, 0, 0.2],
          [1.4, 0, -0.9],
          [-0.2, 0, 1.1],
          [0.2, 0, -1.4],
        ].map(([ix, iy, iz], idx) => (
          <PineTree key={idx} position={[ix, iy, iz]} scale={0.75 + (idx % 4) * 0.15} />
        ))}
        {/* Tảng đá ven bờ đảo */}
        {[-1.6, 1.5, -0.4].map((rx, idx) => (
          <mesh key={idx} position={[rx, 0.12, 1.2]} castShadow>
            <dodecahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial color="#6a685e" roughness={0.94} />
          </mesh>
        ))}
      </group>

      {/* === ĐẢO ĐÁ PHÍA TÂY (WEST BAY ISLAND) === */}
      <group position={[-12.5, -0.02, 2.2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[2.2, 14]} />
          <meshStandardMaterial color="#4a5f38" roughness={0.92} />
        </mesh>
        {[-0.6, 0, 0.7].map((dx, idx) => (
          <PineTree key={idx} position={[dx, 0, (idx % 2) * 0.6 - 0.3]} scale={0.85 + idx * 0.15} />
        ))}
      </group>

      {/* === ĐẢO ĐÁ PHÍA ĐÔNG (EAST BAY ISLAND) === */}
      <group position={[13.2, -0.02, -3.2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[2.0, 14]} />
          <meshStandardMaterial color="#4a5f38" roughness={0.92} />
        </mesh>
        {[-0.5, 0.4].map((dx, idx) => (
          <PineTree key={idx} position={[dx, 0, idx * 0.5]} scale={0.9} />
        ))}
      </group>
    </group>
  )
}

// ---------------------------------------------------------------------------
// LILY PADS / HOA SEN HỒNG & BÈO SÚNG VEN BỜ
// ---------------------------------------------------------------------------
function LilyPads() {
  const clusters = useMemo(
    () => [
      { x: -4.2, z: 0.8, rot: 0.4, scale: 0.95 },
      { x: -1.6, z: 0.2, rot: -1.2, scale: 1.15 },
      { x: 1.2, z: -0.8, rot: 2.1, scale: 0.9 },
      { x: 3.8, z: -1.5, rot: -0.6, scale: 1.1 },
      { x: -6.5, z: 0.5, rot: 1.4, scale: 1.0 },
      { x: 6.2, z: -2.1, rot: 0.8, scale: 0.95 },
      { x: -2.8, z: 1.2, rot: 0.9, scale: 1.05 },
      { x: 2.5, z: -1.8, rot: -1.4, scale: 0.9 },
    ],
    []
  )

  return (
    <group position={[0, -0.04, 0]}>
      {clusters.map((c, i) => (
        <group key={i} position={[c.x, 0, c.z]} rotation={[0, c.rot, 0]} scale={c.scale}>
          {[-0.14, 0, 0.16].map((dx, j) => (
            <mesh key={j} position={[dx, 0, (j % 2) * 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.095 + (j % 2) * 0.03, 16, 0, Math.PI * 1.85]} />
              <meshStandardMaterial color={j === 1 ? '#4e8538' : '#3d6e2a'} roughness={0.6} side={THREE.DoubleSide} />
            </mesh>
          ))}
          {/* Bông hoa sen hồng */}
          <mesh position={[0.02, 0.035, 0.04]} castShadow>
            <coneGeometry args={[0.04, 0.09, 6]} />
            <meshStandardMaterial color="#f0809c" roughness={0.65} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------------------
// WATER WORLD & ENVIRONMENT (MẶT SÔNG NGỌC BÍCH, HẠM ĐỘI & NON NƯỚC)
// ---------------------------------------------------------------------------
function WaterWorld() {
  return (
    <group>
      {/* Thuyền tam bản neo đậu ven bờ sa bàn */}
      <Model file={O_QUAN_ASSETS.props.boat} height={0.4} position={[-3.2, -0.01, 0.05]} rotation={[0, 0.3, 0]} />
      <Model file={O_QUAN_ASSETS.props.boat} height={0.34} position={[3.6, -0.01, 0.15]} rotation={[0, Math.PI - 0.2, 0]} />
      <Model file={O_QUAN_ASSETS.props.boat} height={0.32} position={[-6.8, -0.01, 2.1]} rotation={[0, 0.8, 0]} />

      {/* Hạm đội thuyền buồm lướt sóng trên vịnh sông */}
      <SailingJunk position={[-8.5, -0.02, 3.8]} rotation={0.35} redSail={true} scale={1.05} />
      <SailingJunk position={[8.8, -0.02, 6.2]} rotation={-0.55} redSail={false} scale={1.15} />
      <SailingJunk position={[-13.5, -0.02, -3.8]} rotation={1.05} redSail={true} scale={0.95} />
      <SailingJunk position={[14.2, -0.02, -9.8]} rotation={-1.75} redSail={false} scale={1.2} />

      {/* Hoa sen & bèo súng ven bờ */}
      <LilyPads />

      {/* Bờ đá và cầu gỗ kết nối hai dải đất */}
      {[-6, -3, 0, 3, 6].map((x, i) => (
        <group key={x} position={[x, -0.01, -0.7 - x * 0.255]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <boxGeometry args={[1.82, 0.55, 0.1]} />
            <meshStandardMaterial color="#7a7668" roughness={0.92} />
          </mesh>
          {i < 4 && (
            <mesh position={[1.35, 0.12, -0.34]} rotation={[0, 0, -0.255]} castShadow>
              <boxGeometry args={[1.28, 0.12, 0.38]} />
              <meshStandardMaterial color="#82542e" roughness={0.85} />
            </mesh>
          )}
        </group>
      ))}

      {/* Dãy núi hùng vĩ & thác nước */}
      <MountainRanges />

      {/* Đàn hạc trắng bay lượn */}
      <FlyingCranes />

      {/* Đom đóm lấp lánh */}
      <Fireflies />
    </group>
  )
}

// ---------------------------------------------------------------------------
// MAIN 3D SCENE
// ---------------------------------------------------------------------------
function Scene({
  cells,
  selected,
  onSelect,
  onHover,
  marchEvent,
  onMarchStep,
  onMarchDone,
  siegeActive,
  onSiegeDone,
  ambushTarget,
  onAmbushDone,
  traps,
  weather = 'clear',
  controlsRef,
  resetViewKey,
}: {
  cells: Cell[]
  selected: number | null
  onSelect: (id: number) => void
  onHover?: (id: number | string | null) => void
  marchEvent: MarchEvent | null
  onMarchStep?: (stepIndex: number, tileId: number) => void
  onMarchDone?: () => void
  siegeActive?: boolean
  onSiegeDone?: () => void
  ambushTarget?: number | null
  onAmbushDone?: () => void
  traps?: TacticalTrap[]
  weather?: WeatherType
  controlsRef?: React.RefObject<OrbitControlsImpl | null>
  resetViewKey?: number
}) {
  useEffect(() => {
    if (resetViewKey && controlsRef?.current) {
      controlsRef.current.target.set(0, 0.35, -0.7)
      if ('zoom' in controlsRef.current.object) {
        ;(controlsRef.current.object as THREE.OrthographicCamera).zoom = 68
        controlsRef.current.object.updateProjectionMatrix()
      }
      controlsRef.current.reset()
    }
  }, [resetViewKey, controlsRef])

  useFrame(() => {
    if (controlsRef?.current) {
      const t = controlsRef.current.target
      t.x = THREE.MathUtils.clamp(t.x, -11, 11)
      t.z = THREE.MathUtils.clamp(t.z, -9, 7)
      t.y = THREE.MathUtils.clamp(t.y, -0.5, 3.5)
    }
  })

  const weatherConfig = WEATHER_TYPES_INFO[weather] || WEATHER_TYPES_INFO.clear
  const fogColor = weather === 'fog' ? '#607d8b' : weather === 'flood' ? '#1e3d59' : weather === 'drought' ? '#4a2810' : '#1c2e2a'
  const fogFar = weather === 'fog' ? 32 : 50

  return (
    <>
      {/* Rich atmospheric background and fog */}
      <fog attach="fog" args={[fogColor, 20, fogFar]} />

      {/* Dynamic Lighting based on Weather */}
      <ambientLight
        intensity={1.35 * weatherConfig.ambientModifier}
        color={weather === 'flood' ? '#d0ebff' : weather === 'drought' ? '#ffe8cc' : '#fff8f0'}
      />
      <hemisphereLight
        args={[
          weather === 'fog' ? '#90a4ae' : '#bfe3eb',
          weather === 'drought' ? '#8d6e63' : '#52402b',
          1.4 * weatherConfig.ambientModifier,
        ]}
      />
      <directionalLight
        position={[-10, 16, 8]}
        intensity={3.4 * (weather === 'fog' ? 0.6 : weatherConfig.ambientModifier)}
        color={weather === 'drought' ? '#ffcc80' : '#fff3db'}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0002}
      />
      {/* Soft cool fill light from opposite angle */}
      <directionalLight position={[12, 10, -10]} intensity={0.95} color="#a8dce8" />

      {/* Sông nước, bến thuyền & hoa sen */}
      <WaterWorld />

      {/* 10 Ô Dân cờ */}
      {BOARD_LAYOUT.filter((t) => typeof t.id === 'number').map((tile) => (
        <DanTile
          key={tile.id}
          tile={tile}
          cell={cells[tile.id as number]}
          selected={selected === tile.id}
          onSelect={onSelect}
          onHover={onHover}
          hasTrap={traps?.some((trap) => trap.tileId === (tile.id as number))}
        />
      ))}

      {/* 2 Thành trì Đại Bản Doanh */}
      <QuanTile tile={BOARD_LAYOUT.find((t) => t.id === 'player')!} enemy={false} onHover={onHover} />
      <QuanTile tile={BOARD_LAYOUT.find((t) => t.id === 'enemy')!} enemy={true} onHover={onHover} />

      {/* Hoạt cảnh rải quân tuần tự từng bước */}
      {marchEvent && (
        <March
          marchData={marchEvent}
          onStep={(step, tileId) => onMarchStep?.(step, tileId)}
          onDone={() => onMarchDone?.()}
        />
      )}

      {/* Hoạt cảnh đại đội địch công thành */}
      <SiegeEffect active={!!siegeActive} onDone={() => onSiegeDone?.()} />

      {/* Hoạt cảnh phục kích bắn phá Địch Thành */}
      <AmbushEffect targetCellId={ambushTarget ?? null} active={ambushTarget !== null} onDone={() => onAmbushDone?.()} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, 0.35, -0.7]}
        minPolarAngle={0.65}
        maxPolarAngle={0.88}
        minAzimuthAngle={-0.45}
        maxAzimuthAngle={0.45}
        minZoom={20}
        maxZoom={280}
        zoomSpeed={1.0}
        rotateSpeed={0.35}
        panSpeed={1.6}
        enablePan={true}
        screenSpacePanning={true}
        enableDamping
        dampingFactor={0.08}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE,
        }}
        touches={{
          ONE: THREE.TOUCH.PAN,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// BOARD 3D EXPORT COMPONENT
// ---------------------------------------------------------------------------
export default function Board3D(props: {
  cells: Cell[]
  selected: number | null
  onSelect: (id: number) => void
  onHover?: (id: number | string | null) => void
  marchEvent?: MarchEvent | null
  onMarchStep?: (stepIndex: number, tileId: number) => void
  onMarchDone?: () => void
  siegeActive?: boolean
  onSiegeDone?: () => void
  ambushTarget?: number | null
  onAmbushDone?: () => void
  traps?: TacticalTrap[]
  weather?: WeatherType
  controlsRef?: React.RefObject<OrbitControlsImpl | null>
  resetViewKey?: number
  isLanding?: boolean
}) {
  const localControlsRef = useRef<OrbitControlsImpl | null>(null)
  const effectiveRef = props.controlsRef || localControlsRef

  return (
    <Canvas
      orthographic
      shadows
      dpr={1}
      style={{
        backgroundImage: props.isLanding ? 'none' : `url("${boardBackground}")`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
      onContextMenu={(e) => e.preventDefault()}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.18,
      }}
      camera={{ position: [11, 13, 16], zoom: 68, near: 0.1, far: 100 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
        gl.domElement.addEventListener('webglcontextlost', (event) => event.preventDefault())
      }}
    >
      <Scene {...props} marchEvent={props.marchEvent ?? null} controlsRef={effectiveRef} />
    </Canvas>
  )
}

const preload = [
  ...Object.values(O_QUAN_ASSETS.board),
  ...Object.values(O_QUAN_ASSETS.buildings),
  ...Object.values(O_QUAN_ASSETS.characters),
  ...Object.values(O_QUAN_ASSETS.props),
  ...Object.values(O_QUAN_ASSETS.resources),
]
preload.forEach((file) => useGLTF.preload(assetUrl(file)))



