import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { GameAudio } from './audio'

type Screen = 'home' | 'routes' | 'run' | 'complete'
type RunnerObjectKind = 'obstacle' | 'star' | 'family'
type RunnerObject = { id: number; kind: RunnerObjectKind; x: number; lane: number; airborne?: boolean; variant: string; person?: FamilyMember }
type FamilyMember = { name: string; shortName: string; role: string; image: string; color: string }
type Runner = { lane: number; y: number; vy: number; jumping: boolean; sliding: boolean; frame: number }
type Route = { name: string; subtitle: string; story: string; theme: string; icon: string; target: number; speed: number; accent: string }

const family: FamilyMember[] = [
  { name: 'Baba Ahmet', shortName: 'Ahmet', role: 'Turbo desteği', image: '/images/ahmet-npc.png', color: '#ef956b' },
  { name: 'Anne Sevil', shortName: 'Sevil', role: 'Tatlı kalkan', image: '/images/sevil-npc.png', color: '#f1ad91' },
  { name: 'Abi Mesut', shortName: 'Mesut', role: 'Şerit rehberi', image: '/images/mesut-npc.png', color: '#91b3ef' },
  { name: 'Büyük Abi Zafer', shortName: 'Zafer', role: 'Neşe enerjisi', image: '/images/zafer-npc.png', color: '#e9cf76' },
]

const routes: Route[] = [
  { name: 'Bahçe Bahar Hattı', subtitle: 'Çiçeklerin arasından ak', story: 'Baba Ahmet bahçe hattında ilk bayrağı sallıyor. Şerit değiştir, yıldızları topla ve rüzgâr gibi koş!', theme: 'garden', icon: '🌼', target: 520, speed: 30, accent: '#f2bf68' },
  { name: 'Mutfak Şeker Şeridi', subtitle: 'Kek bulutlarından kaç', story: 'Anne Sevil mutfak yolunu şeker yıldızlarıyla süsledi. Sürpriz kekler yaklaşırken ritmi hiç bozma!', theme: 'kitchen', icon: '🍰', target: 640, speed: 34, accent: '#ef9676' },
  { name: 'Salon Işık Tüneli', subtitle: 'Aile finaline yetiş', story: 'Mesut ve Zafer son ışıkları salonda saklıyor. Oyuncak trafiğini aş ve aile finaline koş!', theme: 'living', icon: '✨', target: 780, speed: 38, accent: '#94aef0' },
]

const lanePositions = [18, 50, 82]
const RUNNER_GROUND = 0

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [routeIndex, setRouteIndex] = useState(0)
  const [runner, setRunner] = useState<Runner>({ lane: 1, y: RUNNER_GROUND, vy: 0, jumping: false, sliding: false, frame: 1 })
  const [objects, setObjects] = useState<RunnerObject[]>([])
  const [distance, setDistance] = useState(0)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [streak, setStreak] = useState(0)
  const [shield, setShield] = useState(false)
  const [notice, setNotice] = useState('Şerit seç, neşeyi yakala!')
  const [muted, setMuted] = useState(false)
  const [celebration, setCelebration] = useState<string | null>(null)
  const [memoryOpen, setMemoryOpen] = useState(false)
  const runnerRef = useRef(runner)
  const objectsRef = useRef<RunnerObject[]>([])
  const distanceRef = useRef(0)
  const livesRef = useRef(lives)
  const shieldRef = useRef(false)
  const scoreRef = useRef(score)
  const streakRef = useRef(0)
  const objectId = useRef(0)
  const spawnTimer = useRef(.4)
  const shieldTimer = useRef(0)
  const ending = useRef(false)
  const slideTimer = useRef(0)
  const audioRef = useRef<GameAudio | null>(null)
  const keys = useRef(new Set<string>())

  if (!audioRef.current) audioRef.current = new GameAudio()

  const route = routes[routeIndex]

  useEffect(() => { runnerRef.current = runner }, [runner])
  useEffect(() => { livesRef.current = lives }, [lives])
  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { shieldRef.current = shield }, [shield])
  useEffect(() => () => audioRef.current?.destroy(), [])

  const clearRun = useCallback((index = routeIndex) => {
    const nextRunner = { lane: 1, y: RUNNER_GROUND, vy: 0, jumping: false, sliding: false, frame: 1 }
    runnerRef.current = nextRunner
    objectsRef.current = []
    distanceRef.current = 0
    livesRef.current = 3
    scoreRef.current = 0
    streakRef.current = 0
    shieldRef.current = false
    setRunner(nextRunner)
    setObjects([])
    setDistance(0)
    setScore(0)
    setLives(3)
    setStreak(0)
    setShield(false)
    setCelebration(null)
    spawnTimer.current = .4
    shieldTimer.current = 0
    slideTimer.current = 0
    ending.current = false
    setNotice(routes[index].story)
  }, [routeIndex])

  const startRun = useCallback((index = 0) => {
    audioRef.current?.start()
    setRouteIndex(index)
    clearRun(index)
    setScreen('run')
  }, [clearRun])

  const finishRun = useCallback(() => {
    if (ending.current) return
    ending.current = true
    audioRef.current?.play(routeIndex === routes.length - 1 ? 'victory' : 'level')
    if (routeIndex === routes.length - 1) {
      setNotice('Aile finaline ulaştın!')
      setScreen('complete')
      return
    }
    setNotice(`${route.name} tamamlandı! Yeni rota açılıyor...`)
    window.setTimeout(() => {
      const nextIndex = routeIndex + 1
      setRouteIndex(nextIndex)
      setScreen('run')
      clearRun(nextIndex)
    }, 1100)
  }, [clearRun, route.name, routeIndex])

  const takeHit = useCallback(() => {
    if (shieldRef.current) {
      setShield(false)
      shieldRef.current = false
      shieldTimer.current = 0
      audioRef.current?.play('memory')
      setNotice('Aile kalkanı seni korudu! Devam et!')
      setCelebration('KALKAN KURTARDI')
      window.setTimeout(() => setCelebration(null), 700)
      return
    }
    const nextLives = livesRef.current - 1
    audioRef.current?.play('hit')
    livesRef.current = nextLives
    setLives(nextLives)
    streakRef.current = 0
    setStreak(0)
    objectsRef.current = objectsRef.current.filter((item) => item.x > 25)
    setObjects(objectsRef.current)
    runnerRef.current = { ...runnerRef.current, lane: 1, y: 0, vy: 0, jumping: false, sliding: false }
    setRunner(runnerRef.current)
    if (nextLives <= 0) {
      setNotice('Aile alkışı! Rota yeniden başlıyor; bu kez başaracaksın.')
      window.setTimeout(() => { livesRef.current = 3; setLives(3); distanceRef.current = 0; setDistance(0) }, 850)
    } else {
      setNotice('Hop! Bir kalp gitti ama koşu devam ediyor.')
    }
  }, [])

  const collectObject = useCallback((item: RunnerObject) => {
    const nextStreak = streakRef.current + 1
    const base = item.kind === 'family' ? 200 : 75
    const points = base + Math.min(nextStreak - 1, 5) * 15
    streakRef.current = nextStreak
    setStreak(nextStreak)
    scoreRef.current += points
    setScore(scoreRef.current)
    if (item.kind === 'family') {
      shieldRef.current = true
      setShield(true)
      shieldTimer.current = 7
      setNotice(`${item.person?.name} desteği geldi! 7 saniye kalkanın var.`)
      audioRef.current?.play('memory')
      setCelebration(`${item.person?.shortName.toUpperCase()} DESTEĞİ  ·  +${points}`)
    } else {
      setNotice(`${item.variant === 'gold' ? 'Altın yıldız' : 'Neşe yıldızı'}! +${points} · Zincir x${nextStreak}`)
      audioRef.current?.play('collect')
      setCelebration(`+${points} NEŞE`)
    }
    window.setTimeout(() => setCelebration(null), 750)
  }, [])

  useEffect(() => {
    if (screen !== 'run') return undefined
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (['arrowleft', 'arrowright', 'a', 'd', 'arrowup', 'w', ' ', 'arrowdown', 's'].includes(key)) event.preventDefault()
      keys.current.add(key)
      const current = runnerRef.current
      if (key === 'arrowleft' || key === 'a') {
        const next = { ...current, lane: Math.max(0, current.lane - 1) }
        runnerRef.current = next; setRunner(next); audioRef.current?.play('talk')
      }
      if (key === 'arrowright' || key === 'd') {
        const next = { ...current, lane: Math.min(2, current.lane + 1) }
        runnerRef.current = next; setRunner(next); audioRef.current?.play('talk')
      }
      if ((key === 'arrowup' || key === 'w' || key === ' ') && !current.jumping && !current.sliding) {
        const next = { ...current, y: 1, vy: 620, jumping: true, frame: 3 }
        runnerRef.current = next; setRunner(next); audioRef.current?.play('jump')
      }
      if ((key === 'arrowdown' || key === 's') && !current.jumping) {
        const next = { ...current, sliding: true, frame: 2 }
        runnerRef.current = next; setRunner(next); slideTimer.current = .55
      }
    }
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase())
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [screen])

  useEffect(() => {
    if (screen !== 'run') return undefined
    let raf = 0
    let last = performance.now()
    const tick = (time: number) => {
      const dt = Math.min((time - last) / 1000, .04); last = time
      const current = runnerRef.current
      let y = current.y
      let vy = current.vy
      let jumping = current.jumping
      if (jumping) {
        y += vy * dt
        vy -= 1550 * dt
        if (y <= 0) { y = 0; vy = 0; jumping = false }
      }
      let sliding = current.sliding
      if (slideTimer.current > 0) { slideTimer.current = Math.max(0, slideTimer.current - dt); sliding = true } else sliding = false
      const nextRunner = { ...current, y, vy, jumping, sliding, frame: jumping ? 3 : sliding ? 2 : Math.floor(time / 130) % 2 + 1 }
      runnerRef.current = nextRunner
      setRunner(nextRunner)
      const speed = route.speed + Math.min(distanceRef.current / 180, 9)
      distanceRef.current += speed * dt
      setDistance(distanceRef.current)
      if (shieldTimer.current > 0) {
        shieldTimer.current = Math.max(0, shieldTimer.current - dt)
        if (shieldTimer.current === 0) { shieldRef.current = false; setShield(false) }
      }
      spawnTimer.current -= dt
      if (spawnTimer.current <= 0) {
        const lane = Math.floor(Math.random() * 3)
        const variant = Math.random() > .5 ? 'barrier' : 'ribbon'
        const nextObjects = [...objectsRef.current, { id: objectId.current++, kind: 'obstacle' as const, x: 0, lane, variant }]
        if (Math.random() > .18) nextObjects.push({ id: objectId.current++, kind: 'star', x: -5, lane: Math.floor(Math.random() * 3), airborne: Math.random() > .5, variant: Math.random() > .78 ? 'gold' : 'normal' })
        if (Math.random() > .82) { const person = family[Math.floor(Math.random() * family.length)]; nextObjects.push({ id: objectId.current++, kind: 'family', x: -12, lane: Math.floor(Math.random() * 3), variant: 'family', person }) }
        objectsRef.current = nextObjects
        spawnTimer.current = Math.max(.48, .86 - distanceRef.current / 2200)
      }
      const remaining: RunnerObject[] = []
      for (const item of objectsRef.current) {
        const nextX = item.x + speed * dt * 1.8
        if (nextX > 110) continue
        if (nextX > 78 && nextX < 96 && item.lane === current.lane) {
          if (item.kind === 'obstacle') {
            const cleared = current.jumping || (current.sliding && item.variant === 'ribbon')
            if (!cleared) { takeHit(); continue }
          } else if (item.kind === 'star') {
            const caught = !item.airborne || current.jumping || current.y > 35
            if (caught) { collectObject(item); continue }
          } else { collectObject(item); continue }
        }
        remaining.push({ ...item, x: nextX })
      }
      objectsRef.current = remaining
      setObjects(remaining)
      if (distanceRef.current >= route.target) finishRun()
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [finishRun, route, screen, takeHit, collectObject])

  const pressControl = (name: string, event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    keys.current.add(name)
    event.currentTarget.setPointerCapture(event.pointerId)
    const current = runnerRef.current
    if (name === 'arrowleft') {
      const next = { ...current, lane: Math.max(0, current.lane - 1) }
      runnerRef.current = next; setRunner(next); audioRef.current?.play('talk')
    } else if (name === 'arrowright') {
      const next = { ...current, lane: Math.min(2, current.lane + 1) }
      runnerRef.current = next; setRunner(next); audioRef.current?.play('talk')
    } else if (name === ' ' && !current.jumping && !current.sliding) {
      const next = { ...current, y: 1, vy: 620, jumping: true, frame: 3 }
      runnerRef.current = next; setRunner(next); audioRef.current?.play('jump')
    } else if (name === 'arrowdown' && !current.jumping) {
      const next = { ...current, sliding: true, frame: 2 }
      runnerRef.current = next; setRunner(next); slideTimer.current = .55
    }
  }
  const releaseControl = (name: string, event: ReactPointerEvent<HTMLButtonElement>) => { event.preventDefault(); keys.current.delete(name) }
  const toggleSound = () => { const next = !muted; setMuted(next); audioRef.current?.setMuted(next); if (!next) audioRef.current?.start() }

  if (screen === 'home') return <main className="app-shell dash-home"><header className="dash-header"><button className="brand-mark" onClick={() => setScreen('home')}><span>✦</span> SEMRA</button><div className="dash-logo">AİLE <em>DASH</em></div><span className="dash-season">SEZON 01 · NEŞE</span></header><section className="dash-hero"><div className="dash-copy"><div className="eyebrow"><span className="sparkle">✦</span> Yepyeni bir oyun modu</div><h1>Semra’nın<br /><em>Aile Dash’i</em></h1><p>Semra otomatik koşuyor. Sen şerit değiştir, zıpla, kay ve aile desteğini yakala. En uzun neşe zincirini kim yapacak?</p><div className="hero-actions"><button className="primary-button large" onClick={() => startRun(0)}><span>▶</span> Koşuyu başlat</button><button className="ghost-button" onClick={() => setScreen('routes')}>Rotaları seç <span>→</span></button></div><div className="dash-controls"><span><b>← →</b> ŞERİT</span><span><b>SPACE</b> ZIPLA</span><span><b>↓</b> KAY</span></div></div><div className="dash-cover"><div className="cover-sun" /><div className="cover-cloud cloud-left" /><div className="cover-cloud cloud-right" /><div className="cover-city city-back" /><div className="cover-city city-front" /><div className="cover-road" /><div className="cover-score"><strong>3</strong><small>rota</small></div><div className="cover-semra"><div className="player-sprite" /></div><div className="cover-family">{family.map((person) => <img key={person.name} src={person.image} alt={`Animasyonlu ${person.name}`} />)}</div><div className="cover-sticker">AİLECE<br /><em>KOŞ!</em></div></div></section><footer className="privacy-note">Fotoğraflardaki aile anılarından ilham alan, sevgi dolu ve güvenli bir oyun.</footer></main>

  if (screen === 'routes') return <main className="app-shell route-shell"><header className="dash-header"><button className="brand-mark" onClick={() => setScreen('home')}><span>✦</span> SEMRA</button><div className="dash-logo">AİLE <em>DASH</em></div><span className="dash-season">ROTA SEÇİMİ</span></header><section className="route-intro"><div className="eyebrow">MACERA ROTASI</div><h1>Bugün nerede <em>koşuyoruz?</em></h1><p>Her rotanın temposu farklı. Aile desteğini yakala, etap hedefini tamamla.</p></section><section className="route-grid">{routes.map((item, index) => <button key={item.name} className={`route-card route-${item.theme}`} onClick={() => startRun(index)}><div className="route-art"><span className="route-icon">{item.icon}</span><span className="route-lane" /><span className="route-lane lane-two" /><span className="route-mini-semra">✦</span><strong>0{index + 1}</strong></div><div className="route-copy"><small>ETAP {index + 1} · {item.target} NEŞE</small><h2>{item.name}</h2><p>{item.subtitle}</p><span className="route-play">▶ Koşuyu seç</span></div></button>)}</section><section className="family-banner"><div><span className="eyebrow">AİLE DESTEĞİ</span><h2>Yolda herkes yanında.</h2></div><div className="family-mini">{family.map((person) => <div key={person.name}><img src={person.image} alt={person.name} /><small>{person.shortName}</small></div>)}</div></section><button className="back-link" onClick={() => setScreen('home')}>← Ana menü</button></main>

  if (screen === 'complete') return <main className="app-shell dash-complete"><div className="victory-rays" /><div className="complete-badge">✦</div><div className="eyebrow">BÜYÜK AİLE FİNALİ</div><h1>Semra’nın neşesi<br /><em>her yere ulaştı!</em></h1><p>Üç rotayı da koştun. Ahmet, Sevil, Mesut ve Zafer final çizgisinde seni bekliyor.</p><div className="final-family">{family.map((person) => <img key={person.name} src={person.image} alt={person.name} />)}</div><div className="final-score"><span>TOPLAM NEŞE</span><strong>{score.toLocaleString('tr-TR')}</strong></div><div className="hero-actions"><button className="primary-button" onClick={() => setMemoryOpen(true)}>📷 Gerçek aile anısını gör</button><button className="ghost-button" onClick={() => setScreen('home')}>Yeni koşuya çık <span>→</span></button></div>{memoryOpen && <MemoryModal onClose={() => setMemoryOpen(false)} />}</main>

  return <main className="app-shell dash-run"><header className="run-header"><button className="brand-mark" onClick={() => setScreen('routes')}><span>✦</span> SEMRA</button><div className="run-stage"><small>ETAP {routeIndex + 1} / 3</small><strong>{route.name}</strong></div><div className="run-actions"><button className="sound-toggle" onClick={toggleSound} aria-label={muted ? 'Sesi aç' : 'Sesi kapat'}><span>{muted ? '🔇' : '🔊'}</span><small>{muted ? 'Sessiz' : 'Ses açık'}</small></button><div className="run-stat"><small>NEŞE</small><strong>{score.toLocaleString('tr-TR')}</strong></div><div className="run-stat"><small>CAN</small><strong className="hearts">{'♥'.repeat(lives)}<i>{'♥'.repeat(3 - lives)}</i></strong></div></div></header><section className={`dash-track theme-${route.theme}`} aria-label={`${route.name} otomatik koşu alanı`}><div className="run-sky"><div className="run-sun" /><div className="run-cloud cloud-one" /><div className="run-cloud cloud-two" /><div className="run-horizon horizon-one" /><div className="run-horizon horizon-two" /></div><div className="track-decor">{route.theme === 'garden' ? '🌳　🌼　🌳　🌿' : route.theme === 'kitchen' ? '🍰　🍪　🍰　🫖' : '🛋️　🪴　🖼️　🛋️'}</div><div className="run-road"><div className="road-stripe stripe-one" /><div className="road-stripe stripe-two" /><div className="road-stripe stripe-three" /><div className="road-lane lane-left" /><div className="road-lane lane-right" /></div>{objects.map((item) => <div key={item.id} className={`runner-object object-${item.kind} object-${item.variant} ${item.airborne ? 'object-air' : ''}`} style={{ left: `${lanePositions[item.lane]}%`, top: `${item.airborne ? 8 + Math.max(0, item.x) * .42 : 18 + Math.max(0, item.x) * .72}%`, '--depth': Math.max(.05, Math.min(1, item.x / 100)) } as CSSProperties}>{item.kind === 'star' ? <span>{item.variant === 'gold' ? '✦' : '★'}</span> : item.kind === 'family' ? <img src={item.person?.image} alt={`${item.person?.name} aile desteği`} /> : <span>{item.variant === 'barrier' ? (route.theme === 'kitchen' ? '🍰' : route.theme === 'living' ? '🧸' : '🪵') : '〰️'}</span>}</div>)}<div className={`runner-player ${runner.jumping ? 'is-jumping' : ''} ${runner.sliding ? 'is-sliding' : ''} ${shield ? 'has-shield' : ''}`} style={{ left: `${lanePositions[runner.lane]}%`, bottom: `calc(13% + ${runner.y}px)` }}><div className="runner-sprite" style={{ backgroundPosition: `${runner.frame * 33.3333}% 0` }} /><div className="runner-shadow" /></div><div className="run-hud"><div className="run-mission"><span>{route.icon}</span><div><strong>{route.subtitle}</strong><small>{notice}</small></div></div><div className="distance-meter"><div className="distance-top"><span>MESAFE</span><b>{Math.min(Math.round(distance), route.target)} / {route.target} m</b></div><div><i style={{ width: `${Math.min(100, distance / route.target * 100)}%` }} /></div></div></div>{shield && <div className="shield-timer">🛡️ AİLE KALKANI <b>{Math.ceil(shieldTimer.current)}s</b></div>}{celebration && <div className="run-celebration">✦ {celebration} ✦</div>}{streak > 1 && <div className="streak-badge">NEŞE ZİNCİRİ ×{streak}</div>}</section><div className="run-controls"><div className="control-guide"><span><b>← →</b> şerit değiştir</span><span><b>SPACE</b> zıpla</span><span><b>↓</b> kay</span><span><b>♫</b> müzik + efekt</span></div><div className="touch-controls"><button aria-label="Sola geç" onPointerDown={(event) => pressControl('arrowleft', event)} onPointerUp={(event) => releaseControl('arrowleft', event)} onPointerCancel={(event) => releaseControl('arrowleft', event)}>←</button><button aria-label="Sağa geç" onPointerDown={(event) => pressControl('arrowright', event)} onPointerUp={(event) => releaseControl('arrowright', event)} onPointerCancel={(event) => releaseControl('arrowright', event)}>→</button><button className="jump-control" aria-label="Zıpla" onPointerDown={(event) => pressControl(' ', event)} onPointerUp={(event) => releaseControl(' ', event)} onPointerCancel={(event) => releaseControl(' ', event)}>↑</button><button className="slide-control" aria-label="Kay" onPointerDown={(event) => pressControl('arrowdown', event)} onPointerUp={(event) => releaseControl('arrowdown', event)} onPointerCancel={(event) => releaseControl('arrowdown', event)}>⌄</button></div></div></main>
}

function MemoryModal({ onClose }: { onClose: () => void }) {
  return <div className="dialog-backdrop" onClick={onClose}><div className="memory-card" onClick={(event) => event.stopPropagation()}><button className="dialog-close" onClick={onClose}>×</button><img src="/images/family-memory.jpg" alt="Aile anısı" /><div><span className="eyebrow">GERÇEK AİLE ANI</span><h2>Birlikte daha güzel.</h2><p>Bu gerçek aile fotoğrafı, oyunun sevgi dolu dünyasına ilham veren anılardan biri.</p><button className="primary-button" onClick={onClose}>Koşuya dön ✦</button></div></div></div>
}

export default App
