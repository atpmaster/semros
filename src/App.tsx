import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'

type LevelId = 'garden' | 'kitchen' | 'living'
type Screen = 'home' | 'levels' | 'play' | 'complete'
type ItemKind = 'star' | 'cake' | 'toy' | 'memory'

type Platform = { x: number; y: number; w: number; h: number }
type Item = { id: string; x: number; y: number; kind: ItemKind; label: string }
type Hazard = { id: string; x: number; y: number; kind: 'shadow' | 'pillow' }
type Npc = {
  id: string
  name: string
  role: string
  x: number
  y: number
  image: string
  message: string
  color: string
}
type Level = {
  id: LevelId
  number: number
  name: string
  subtitle: string
  story: string
  width: number
  accent: string
  platforms: Platform[]
  items: Item[]
  hazards: Hazard[]
  npcs: Npc[]
  goal: { x: number; label: string }
}
type Player = { x: number; y: number; vx: number; vy: number; direction: 1 | -1; onGround: boolean; frame: number }

const WORLD_HEIGHT = 500
const GROUND_Y = 420
const PLAYER_W = 64
const PLAYER_H = 104
const START_X = 92
const START_Y = GROUND_Y - PLAYER_H

const family = [
  { name: 'Baba Ahmet', role: 'Bahçe bekçisi', image: '/images/ahmet-npc.png', color: '#e88b62' },
  { name: 'Anne Sevil', role: 'Mutfak sihirbazı', image: '/images/sevil-npc.png', color: '#ef9f85' },
  { name: 'Abi Mesut', role: 'Yol gösterici', image: '/images/mesut-npc.png', color: '#89aef0' },
  { name: 'Büyük Abi Zafer', role: 'Neşe koruyucusu', image: '/images/zafer-npc.png', color: '#e8cb6e' },
]

const ground = (width: number): Platform => ({ x: 0, y: GROUND_Y, w: width, h: 80 })

const levels: Level[] = [
  {
    id: 'garden', number: 1, name: 'Bahçe Başlangıcı', subtitle: 'Neşe tohumlarını topla',
    story: 'Baba Ahmet bahçe kapısında bekliyor. Semra, aile ışığını yakmak için parlayan neşe tohumlarını bulmalı.', width: 2220, accent: '#f0b85b',
    platforms: [ground(2220), { x: 280, y: 348, w: 160, h: 24 }, { x: 560, y: 286, w: 170, h: 24 }, { x: 855, y: 350, w: 172, h: 24 }, { x: 1160, y: 272, w: 175, h: 24 }, { x: 1450, y: 342, w: 185, h: 24 }, { x: 1730, y: 250, w: 190, h: 24 }],
    items: [
      { id: 'garden-1', x: 205, y: 378, kind: 'star', label: 'Güneş tohumu' }, { id: 'garden-2', x: 360, y: 305, kind: 'star', label: 'Papatya ışığı' },
      { id: 'garden-3', x: 645, y: 242, kind: 'star', label: 'Salıncak yıldızı' }, { id: 'garden-4', x: 942, y: 307, kind: 'star', label: 'Kırmızı elma' },
      { id: 'garden-5', x: 1250, y: 228, kind: 'star', label: 'Neşe tohumu' }, { id: 'garden-6', x: 1815, y: 206, kind: 'memory', label: 'Aile anısı' },
    ],
    hazards: [{ id: 'garden-h1', x: 770, y: 385, kind: 'shadow' }, { id: 'garden-h2', x: 1395, y: 385, kind: 'shadow' }, { id: 'garden-h3', x: 1665, y: 385, kind: 'shadow' }],
    npcs: [{ ...family[0], id: 'ahmet', x: 505, y: GROUND_Y - 145, message: 'Aferin küçük kahraman! Yıldızların peşinden git; bahçe kapısındaki ışığı sen yakacaksın.' }],
    goal: { x: 2080, label: 'Bahçe kapısı' },
  },
  {
    id: 'kitchen', number: 2, name: 'Mutfak Zıplaması', subtitle: 'Tarçın yıldızlarını yakala',
    story: 'Anne Sevil mutfakta sıcacık bir sürpriz hazırlıyor. Tezgâhlara zıplayıp tarçın yıldızlarını topla.', width: 2260, accent: '#ee9071',
    platforms: [ground(2260), { x: 220, y: 330, w: 170, h: 24 }, { x: 475, y: 245, w: 180, h: 24 }, { x: 760, y: 335, w: 180, h: 24 }, { x: 1040, y: 260, w: 180, h: 24 }, { x: 1310, y: 330, w: 190, h: 24 }, { x: 1595, y: 240, w: 180, h: 24 }, { x: 1900, y: 320, w: 185, h: 24 }],
    items: [
      { id: 'kitchen-1', x: 300, y: 287, kind: 'cake', label: 'Kek kırıntısı' }, { id: 'kitchen-2', x: 555, y: 202, kind: 'cake', label: 'Tarçın yıldızı' },
      { id: 'kitchen-3', x: 845, y: 292, kind: 'cake', label: 'Kurabiye ışığı' }, { id: 'kitchen-4', x: 1130, y: 217, kind: 'cake', label: 'Bal damlası' },
      { id: 'kitchen-5', x: 1410, y: 287, kind: 'cake', label: 'Sürpriz yıldız' }, { id: 'kitchen-6', x: 1685, y: 197, kind: 'memory', label: 'Mutfak anısı' }, { id: 'kitchen-7', x: 1995, y: 277, kind: 'cake', label: 'Son lokma' },
    ],
    hazards: [{ id: 'kitchen-h1', x: 410, y: 385, kind: 'pillow' }, { id: 'kitchen-h2', x: 990, y: 385, kind: 'pillow' }, { id: 'kitchen-h3', x: 1810, y: 385, kind: 'pillow' }],
    npcs: [{ ...family[1], id: 'sevil', x: 650, y: GROUND_Y - 155, message: 'Semra, mutfak ışıkları senin zıplama ritmini bekliyor! Hepsini toplarsan aile sofrası kurulacak.' }],
    goal: { x: 2140, label: 'Sofra kapısı' },
  },
  {
    id: 'living', number: 3, name: 'Salonun Sırları', subtitle: 'Aile ışığını tamamla',
    story: 'Mesut ve Zafer salonda son iki ışığı saklıyor. Oyuncakların arasından ilerle, final kapısını birlikte açın.', width: 2320, accent: '#8ca8eb',
    platforms: [ground(2320), { x: 260, y: 355, w: 175, h: 24 }, { x: 520, y: 285, w: 175, h: 24 }, { x: 810, y: 350, w: 180, h: 24 }, { x: 1080, y: 260, w: 195, h: 24 }, { x: 1390, y: 330, w: 180, h: 24 }, { x: 1665, y: 250, w: 185, h: 24 }, { x: 1940, y: 340, w: 190, h: 24 }],
    items: [
      { id: 'living-1', x: 335, y: 312, kind: 'toy', label: 'Oyuncak araba' }, { id: 'living-2', x: 605, y: 242, kind: 'toy', label: 'Mavi top' },
      { id: 'living-3', x: 895, y: 307, kind: 'toy', label: 'Kırmızı blok' }, { id: 'living-4', x: 1178, y: 217, kind: 'toy', label: 'Kayıp düğme' },
      { id: 'living-5', x: 1475, y: 287, kind: 'toy', label: 'Kurdele' }, { id: 'living-6', x: 1758, y: 207, kind: 'memory', label: 'Büyük anı' }, { id: 'living-7', x: 2025, y: 297, kind: 'toy', label: 'Aile anahtarı' },
    ],
    hazards: [{ id: 'living-h1', x: 720, y: 385, kind: 'shadow' }, { id: 'living-h2', x: 1300, y: 385, kind: 'pillow' }, { id: 'living-h3', x: 1880, y: 385, kind: 'shadow' }],
    npcs: [{ ...family[2], id: 'mesut', x: 700, y: GROUND_Y - 148, message: 'Şuradaki mavi topu gördün mü? Sen zıpladıkça salonun gizli yolu ortaya çıkıyor.' }, { ...family[3], id: 'zafer', x: 1510, y: GROUND_Y - 155, message: 'Son ışıklar ileride! Büyük finali ancak senin cesaretin tamamlayabilir, Semra.' }],
    goal: { x: 2220, label: 'Aile ışığı' },
  },
]

const keyIsDown = (keys: Set<string>, names: string[]) => names.some((name) => keys.has(name))

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [levelIndex, setLevelIndex] = useState(0)
  const [player, setPlayer] = useState<Player>({ x: START_X, y: START_Y, vx: 0, vy: 0, direction: 1, onGround: true, frame: 0 })
  const [collected, setCollected] = useState<string[]>([])
  const [lives, setLives] = useState(3)
  const [score, setScore] = useState(0)
  const [notice, setNotice] = useState('Hazır mısın, Semra?')
  const [activeNpc, setActiveNpc] = useState<Npc | null>(null)
  const [memoryOpen, setMemoryOpen] = useState(false)
  const [cameraX, setCameraX] = useState(0)
  const keys = useRef<Set<string>>(new Set())
  const collectedRef = useRef<string[]>([])
  const playerRef = useRef(player)
  const livesRef = useRef(lives)
  const levelDoneRef = useRef(false)
  const hazardCooldown = useRef(0)
  const interactionLock = useRef(false)

  const level = levels[levelIndex]
  const progress = useMemo(() => Math.round((collected.length / level.items.length) * 100), [collected.length, level.items.length])
  const nearestNpc = useMemo(() => level.npcs.find((npc) => Math.abs(npc.x - player.x) < 112) ?? null, [level.npcs, player.x])

  useEffect(() => { playerRef.current = player }, [player])
  useEffect(() => { livesRef.current = lives }, [lives])

  const resetPlayer = useCallback(() => {
    const next = { x: START_X, y: START_Y, vx: 0, vy: 0, direction: 1 as const, onGround: true, frame: 0 }
    playerRef.current = next
    setPlayer(next)
    setCameraX(0)
  }, [])

  const resetLevel = useCallback((index = levelIndex) => {
    setLevelIndex(index)
    setCollected([])
    collectedRef.current = []
    setActiveNpc(null)
    setNotice(levels[index].story)
    setMemoryOpen(false)
    levelDoneRef.current = false
    hazardCooldown.current = 0
    interactionLock.current = false
    resetPlayer()
    setScreen('play')
  }, [levelIndex, resetPlayer])

  const startGame = () => {
    setScore(0)
    setLives(3)
    livesRef.current = 3
    resetLevel(0)
  }

  const advanceLevel = useCallback(() => {
    if (levelDoneRef.current) return
    levelDoneRef.current = true
    if (levelIndex === levels.length - 1) {
      setNotice('Aile ışığı tamamlandı! Hep birlikte başardınız!')
      setScreen('complete')
      return
    }
    setNotice(`${levels[levelIndex].name} tamamlandı! Sıradaki macera açılıyor...`)
    window.setTimeout(() => resetLevel(levelIndex + 1), 900)
  }, [levelIndex, resetLevel])

  const loseLife = useCallback(() => {
    if (hazardCooldown.current > 0 || levelDoneRef.current) return
    hazardCooldown.current = 1.2
    const nextLives = livesRef.current - 1
    setLives(nextLives)
    livesRef.current = nextLives
    if (nextLives <= 0) {
      setNotice('Canların bitti. Bir kez daha dene, Semra!')
      window.setTimeout(() => { setLives(3); livesRef.current = 3; resetPlayer() }, 700)
    } else {
      setNotice('Dikkat! Bir kalp gitti; macera devam ediyor.')
      resetPlayer()
    }
  }, [resetPlayer])

  const interact = useCallback(() => {
    if (nearestNpc) {
      setActiveNpc(nearestNpc)
      setNotice(`${nearestNpc.name}: ${nearestNpc.message}`)
    } else if (progress === 100) setNotice('Kapıya ulaştın! Neşeyi tamamlamak için biraz daha ilerle.')
  }, [nearestNpc, progress])

  useEffect(() => {
    if (screen !== 'play') return undefined
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (['arrowleft', 'arrowright', 'arrowup', ' ', 'a', 'd', 'w', 'e', 'enter'].includes(key)) event.preventDefault()
      keys.current.add(key)
      if (['arrowleft', 'a', 'arrowright', 'd'].includes(key)) {
        const step = ['arrowleft', 'a'].includes(key) ? -24 : 24
        const current = playerRef.current
        const next = { ...current, x: Math.max(16, Math.min(level.width - PLAYER_W - 16, current.x + step)), vx: step / 8, direction: step < 0 ? -1 as const : 1 as const }
        playerRef.current = next
        setPlayer(next)
      }
      if (['arrowup', 'w', ' '].includes(key) && playerRef.current.onGround) {
        const next = { ...playerRef.current, vy: -12.5, onGround: false, frame: 3 }
        playerRef.current = next
        setPlayer(next)
      }
      if ((key === 'e' || key === 'enter') && !interactionLock.current) { interactionLock.current = true; interact() }
    }
    const up = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      keys.current.delete(key)
      if (key === 'e' || key === 'enter') interactionLock.current = false
    }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [interact, level, screen])

  useEffect(() => {
    if (screen !== 'play') return undefined
    let animationFrame = 0
    let lastTime = performance.now()
    const tick = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.034); lastTime = time
      const current = playerRef.current
      const left = keyIsDown(keys.current, ['arrowleft', 'a']); const right = keyIsDown(keys.current, ['arrowright', 'd']); const jump = keyIsDown(keys.current, ['arrowup', 'w', ' '])
      const direction = left ? -1 : right ? 1 : current.direction
      let vx = current.vx
      if (left) vx -= 0.8; if (right) vx += 0.8; if (!left && !right) vx *= 0.78
      vx = Math.max(-6.2, Math.min(6.2, vx))
      let vy = current.vy + 0.52
      if (jump && current.onGround) vy = -12.5
      const x = Math.max(16, Math.min(level.width - PLAYER_W - 16, current.x + vx * 60 * dt))
      let y = current.y + vy * 60 * dt; let onGround = false
      const previousBottom = current.y + PLAYER_H; const nextBottom = y + PLAYER_H
      for (const platform of level.platforms) {
        const horizontal = x + PLAYER_W - 9 > platform.x && x + 9 < platform.x + platform.w
        if (horizontal && vy >= 0 && previousBottom <= platform.y + 8 && nextBottom >= platform.y) { y = platform.y - PLAYER_H; vy = 0; onGround = true; break }
      }
      if (y > WORLD_HEIGHT + 30) { loseLife(); animationFrame = window.requestAnimationFrame(tick); return }
      if (hazardCooldown.current > 0) hazardCooldown.current = Math.max(0, hazardCooldown.current - dt)
      const nextPlayer: Player = { x, y, vx, vy, direction: direction as 1 | -1, onGround, frame: !onGround ? 3 : Math.abs(vx) > 0.5 ? (Math.floor(time / 120) % 2) + 1 : 0 }
      playerRef.current = nextPlayer; setPlayer(nextPlayer); setCameraX(Math.max(0, Math.min(level.width - 1080, x - 360)))
      for (const item of level.items) {
        if (!collectedRef.current.includes(item.id) && Math.abs(item.x - (x + PLAYER_W / 2)) < 46 && Math.abs(item.y - (y + PLAYER_H / 2)) < 65) {
          collectedRef.current = [...collectedRef.current, item.id]; setCollected(collectedRef.current); setScore((old) => old + (item.kind === 'memory' ? 250 : 100)); setNotice(`${item.label} bulundu! +${item.kind === 'memory' ? 250 : 100} puan`)
        }
      }
      for (const hazard of level.hazards) if (Math.abs(hazard.x - (x + PLAYER_W / 2)) < 42 && Math.abs(hazard.y - (y + PLAYER_H)) < 44) loseLife()
      if (x > level.goal.x - 55 && collectedRef.current.length === level.items.length) advanceLevel()
      animationFrame = window.requestAnimationFrame(tick)
    }
    animationFrame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [advanceLevel, level, loseLife, screen])

  const pressControl = (name: string, event: ReactPointerEvent<HTMLButtonElement>) => { event.preventDefault(); keys.current.add(name); event.currentTarget.setPointerCapture(event.pointerId) }
  const releaseControl = (name: string, event: ReactPointerEvent<HTMLButtonElement>) => { event.preventDefault(); keys.current.delete(name) }
  const switchLevel = (index: number) => { setLevelIndex(index); setCollected([]); collectedRef.current = []; setNotice(levels[index].story); setScreen('levels') }

  if (screen === 'home') return <main className="app-shell home-shell"><div className="home-glow home-glow-one" /><div className="home-glow home-glow-two" /><section className="home-hero"><div className="eyebrow"><span className="sparkle">✦</span> Semra’nın macera günlüğü</div><h1>Semra’nın<br /><em>Neşe Macerası</em></h1><p className="hero-copy">Semra, aile ışığını yeniden yakmak için üç özel bölümde zıplayacak, toplayacak ve sevdikleriyle buluşacak.</p><div className="hero-actions"><button className="primary-button large" onClick={startGame}><span>▶</span> Oyuna başla</button><button className="ghost-button" onClick={() => setScreen('levels')}>Bölümleri gör <span>→</span></button></div><div className="hero-hint"><span>← →</span> koş <span>SPACE</span> zıpla <span>E</span> konuş</div></section><section className="home-art" aria-label="Semra ve ailesinin animasyonlu karakterleri"><div className="sun-disc" /><div className="hill hill-back" /><div className="hill hill-front" /><div className="home-card home-card-top"><span>3</span><small>özel bölüm</small></div><div className="home-card home-card-bottom"><span>♥</span><small>aile macerası</small></div><div className="home-character home-semilife"><img src="/images/semra-sprite.png" alt="Animasyonlu Semra" /></div><div className="family-lineup">{family.map((person) => <img key={person.name} src={person.image} alt={`Animasyonlu ${person.name}`} />)}</div><div className="art-caption">Fotoğraflardaki aile anılarından ilhamla <span>✦</span></div></section><footer className="privacy-note">Bu aile oyunu, özel fotoğrafları gereksiz kişisel bilgi eklemeden animasyonlaştırır.</footer></main>

  if (screen === 'levels') return <main className="app-shell levels-shell"><header className="simple-header"><button className="brand-mark" onClick={() => setScreen('home')}><span>✦</span> SEMRA</button><span className="header-note">Neşe Macerası</span></header><section className="levels-intro"><div className="eyebrow">MACERA HARİTASI</div><h1>Bir bölüm seç, <em>yola çık!</em></h1><p>Her bölümde ışıkları topla, aileden biriyle konuş ve kapıya ulaş.</p></section><section className="level-grid">{levels.map((item, index) => { const unlocked = index === 0 || index <= levelIndex; return <button key={item.id} className={`level-card theme-${item.id} ${!unlocked ? 'locked' : ''}`} onClick={() => unlocked && resetLevel(index)} disabled={!unlocked}><div className="level-number">0{item.number}</div><div className="level-illustration"><span className="level-sun" /><span className="level-cloud cloud-one" /><span className="level-cloud cloud-two" /><span className="level-silhouette">{item.id === 'garden' ? '🌳' : item.id === 'kitchen' ? '🍰' : '🛋️'}</span></div><div className="level-card-copy"><strong>{item.name}</strong><small>{item.subtitle}</small></div><span className="level-arrow">{unlocked ? '→' : '🔒'}</span></button> })}</section><section className="cast-strip"><div><span className="eyebrow">OYUN KADROSU</span><h2>Gerçek aile, animasyonlu macera.</h2></div><div className="cast-portraits">{family.map((person) => <div key={person.name} className="cast-item"><img src={person.image} alt={person.name} /><span>{person.name.replace('Büyük Abi ', 'B. ')}</span></div>)}</div></section><button className="back-link" onClick={() => setScreen('home')}>← Ana menü</button></main>

  if (screen === 'complete') return <main className="app-shell complete-shell"><div className="confetti confetti-one" /><div className="confetti confetti-two" /><div className="confetti confetti-three" /><div className="complete-badge">✦</div><div className="eyebrow">BÜYÜK FİNAL</div><h1>Aile ışığı <em>yandı!</em></h1><p>Semra bütün bölümleri tamamladı. Ahmet, Sevil, Mesut ve Zafer onunla gurur duyuyor.</p><div className="final-family">{family.map((person) => <img key={person.name} src={person.image} alt={person.name} />)}</div><div className="final-score"><span>TOPLAM PUAN</span><strong>{score.toLocaleString('tr-TR')}</strong></div><div className="hero-actions"><button className="primary-button" onClick={() => setMemoryOpen(true)}>📷 Gerçek aile anısını gör</button><button className="ghost-button" onClick={() => setScreen('home')}>Ana menüye dön <span>→</span></button></div>{memoryOpen && <MemoryModal onClose={() => setMemoryOpen(false)} />}</main>

  return <main className="app-shell game-shell"><header className="game-header"><button className="brand-mark" onClick={() => setScreen('levels')}><span>✦</span> SEMRA</button><div className="level-title"><small>BÖLÜM {level.number}</small><strong>{level.name}</strong></div><div className="game-stats"><div><small>NEŞE</small><strong>{score.toLocaleString('tr-TR')}</strong></div><div><small>CAN</small><strong className="hearts">{'♥'.repeat(lives)}<i>{'♥'.repeat(3 - lives)}</i></strong></div></div></header><section className={`game-viewport theme-${level.id}`} aria-label={`${level.name} oynanış alanı`}><div className="world" style={{ width: `${level.width}px`, transform: `translateX(${-cameraX}px)` }}><div className="parallax-sky" /><div className="parallax-sun" /><div className="parallax-cloud cloud-a" /><div className="parallax-cloud cloud-b" /><div className="parallax-hill hill-a" /><div className="parallax-hill hill-b" />{level.id === 'garden' && <><div className="world-decor tree-decor tree-one">🌳</div><div className="world-decor tree-decor tree-two">🌲</div></>}{level.id === 'kitchen' && <div className="world-decor kitchen-decor">🍳</div>}{level.id === 'living' && <div className="world-decor living-decor">🖼️</div>}<div className="world-sign" style={{ left: 58 }}><span>✦</span> SEMRA’NIN DÜNYASI</div>{level.platforms.map((platform, index) => <div key={`${platform.x}-${index}`} className={`platform ${index === 0 ? 'ground' : ''}`} style={{ left: platform.x, top: platform.y, width: platform.w, height: platform.h }} />)}{level.items.map((item) => !collected.includes(item.id) && <div key={item.id} className={`collectible collectible-${item.kind}`} style={{ left: item.x, top: item.y }} title={item.label}><span>{item.kind === 'cake' ? '✦' : item.kind === 'toy' ? '◆' : item.kind === 'memory' ? '▣' : '★'}</span></div>)}{level.hazards.map((hazard) => <div key={hazard.id} className={`hazard hazard-${hazard.kind}`} style={{ left: hazard.x, top: hazard.y }}><span>{hazard.kind === 'pillow' ? '☁' : '●'}</span></div>)}{level.npcs.map((npc) => <div key={npc.id} className={`npc npc-${npc.id}`} style={{ left: npc.x, top: npc.y, '--npc-accent': npc.color } as CSSProperties}><img src={npc.image} alt={`Animasyonlu ${npc.name}`} /><div className="npc-tag"><strong>{npc.name}</strong><small>{npc.role}</small></div>{nearestNpc?.id === npc.id && <div className="talk-indicator">E</div>}</div>)}<div className="goal-gate" style={{ left: level.goal.x }}><div className="gate-glow" /><span>✦</span><small>{level.goal.label}</small></div><div className={`player ${player.onGround && Math.abs(player.vx) > 0.5 ? 'running' : ''}`} style={{ left: player.x, top: player.y, transform: `scaleX(${player.direction})` }}><div className="player-sprite" style={{ backgroundPosition: `${player.frame * 33.3333}% 0` }} /><div className="player-shadow" /></div></div><div className="game-overlay-top"><div className="mission-copy"><span className="mission-icon">✦</span><div><strong>{level.subtitle}</strong><small>{notice}</small></div></div><div className="progress-pill"><span>{collected.length}/{level.items.length}</span><div><i style={{ width: `${progress}%` }} /></div></div></div>{nearestNpc && <button className="talk-prompt" onClick={interact}>E <span>{nearestNpc.name} ile konuş</span></button>}</section><div className="game-controls"><div className="control-guide"><span><b>← →</b> veya A D koş</span><span><b>SPACE</b> zıpla</span><span><b>E</b> konuş</span></div><div className="touch-controls"><button aria-label="Sola git" onPointerDown={(event) => pressControl('arrowleft', event)} onPointerUp={(event) => releaseControl('arrowleft', event)} onPointerCancel={(event) => releaseControl('arrowleft', event)}>←</button><button aria-label="Sağa git" onPointerDown={(event) => pressControl('arrowright', event)} onPointerUp={(event) => releaseControl('arrowright', event)} onPointerCancel={(event) => releaseControl('arrowright', event)}>→</button><button className="jump-control" aria-label="Zıpla" onPointerDown={(event) => pressControl(' ', event)} onPointerUp={(event) => releaseControl(' ', event)} onPointerCancel={(event) => releaseControl(' ', event)}>↑</button>{nearestNpc && <button className="talk-control" aria-label="Konuş" onClick={interact}>E</button>}</div></div>{activeNpc && <div className="dialog-backdrop" onClick={() => setActiveNpc(null)}><div className="dialog-card" onClick={(event) => event.stopPropagation()}><button className="dialog-close" onClick={() => setActiveNpc(null)}>×</button><img src={activeNpc.image} alt={activeNpc.name} /><div><span className="eyebrow">AİLEDEN MESAJ</span><h2>{activeNpc.name}</h2><p>“{activeNpc.message}”</p><button className="primary-button" onClick={() => setActiveNpc(null)}>Devam et</button></div></div></div>}</main>
}

function MemoryModal({ onClose }: { onClose: () => void }) {
  return <div className="dialog-backdrop" onClick={onClose}><div className="memory-card" onClick={(event) => event.stopPropagation()}><button className="dialog-close" onClick={onClose}>×</button><img src="/images/family-memory.jpg" alt="Aile anısı" /><div><span className="eyebrow">GERÇEK AİLE ANISI</span><h2>Birlikte daha güzel.</h2><p>Bu fotoğraf, oyunun sıcaklığına ilham veren aile anılarından biri. Oyundaki karakterler fotoğraflardaki kişilerin animasyonlaştırılmış yorumudur.</p><button className="primary-button" onClick={onClose}>Anıya sarıl ✦</button></div></div></div>
}

export default App
