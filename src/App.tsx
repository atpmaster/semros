import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { GameAudio } from './audio'

type Screen = 'home' | 'map' | 'mission' | 'complete'
type MemberId = 'sevil' | 'ahmet' | 'mesut' | 'zafer'
type MissionId = 'address' | 'shopping' | 'rhythm' | 'targets' | 'memory' | 'market' | 'relay' | 'sequence'

type FamilyMember = {
  id: MemberId
  name: string
  role: string
  image: string
  accent: string
  emoji: string
}

type Mission = {
  id: MissionId
  memberId: MemberId
  level: 1 | 2
  title: string
  station: string
  emoji: string
  description: string
  speech: string
}

const family: FamilyMember[] = [
  { id: 'sevil', name: 'Anne Sevil', role: 'Adres ustası', image: '/images/sevil-npc.png', accent: '#f26f91', emoji: '🧭' },
  { id: 'ahmet', name: 'Baba Ahmet', role: 'Alışveriş kaptanı', image: '/images/ahmet-npc.png', accent: '#f5a340', emoji: '🛒' },
  // Mesut ve Zafer görselleri önceki sürümde ters etiketlenmişti; doğru yüz eşleşmesi burada düzeltildi.
  { id: 'mesut', name: 'Abi Mesut', role: 'Ritim koçu', image: '/images/zafer-npc.png', accent: '#52c5b5', emoji: '🎵' },
  { id: 'zafer', name: 'Büyük Abi Zafer', role: 'Hedef şampiyonu', image: '/images/mesut-npc.png', accent: '#7d8cff', emoji: '🎯' },
]

const missions: Mission[] = [
  { id: 'address', memberId: 'sevil', level: 1, title: 'Adres yıldızlarını bul', station: 'Adres Meydanı', emoji: '🧭', description: 'Anne Sevil, aile parkının yolunu tarif ediyor. Semra’nın sorusuna doğru rotayı seçerek birlikte yolu bulun.', speech: 'Hazır mısın? Birlikte yolu bulalım!' },
  { id: 'shopping', memberId: 'ahmet', level: 1, title: 'Sepeti doldur', station: 'Renkli Pazar', emoji: '🛒', description: 'Ahmet Baba’nın sepeti boş kaldı. Listedeki ürünleri bularak alışverişi birlikte tamamlayın.', speech: 'Sepeti beraber dolduralım mı?' },
  { id: 'rhythm', memberId: 'mesut', level: 1, title: 'Ritmi yakala', station: 'Müzik Bahçesi', emoji: '🎵', description: 'Mesut Abi bir yıldız ritmi başlattı. Parlayan yıldızlara doğru sırayla dokun ve müziği tamamla.', speech: 'Benim ritmimi tekrar edebilir misin?' },
  { id: 'targets', memberId: 'zafer', level: 1, title: 'Hedefleri vur', station: 'Hedef Parkı', emoji: '🎯', description: 'Zafer Abi üç renkli hedef hazırladı. Hepsine dokunarak küçük şampiyon olduğunu göster.', speech: 'Hedefler seni bekliyor, küçük şampiyon!' },
  { id: 'memory', memberId: 'sevil', level: 2, title: 'Hatıra eşlerini bul', station: 'Hatıra Bahçesi', emoji: '🧠', description: 'Anne Sevil’in hatıra kartlarını eşleştir. Aynı sembolleri açarak albümün gizli sayfasını tamamla.', speech: 'Hatıraları eşleştirmeye hazır mısın?' },
  { id: 'market', memberId: 'ahmet', level: 2, title: 'Pazar sırasını kur', station: 'Hızlı Pazar', emoji: '⏱️', description: 'Ahmet Baba siparişleri karıştırdı. Ürünleri doğru sırada seçerek hızlı alışveriş ustası ol.', speech: 'Bu kez sırayı sen yöneteceksin!' },
  { id: 'relay', memberId: 'mesut', level: 2, title: 'Bayrak yarışını kazan', station: 'Koşu Pisti', emoji: '🏁', description: 'Mesut Abi ile aile bayrağını finale taşı. Koş düğmesine hızlıca dokunarak pistte ilerle.', speech: 'Semra, bayrağı birlikte taşıyalım!' },
  { id: 'sequence', memberId: 'zafer', level: 2, title: 'Renk hafızasını çöz', station: 'Şampiyonlar Sahası', emoji: '🏹', description: 'Zafer Abi’nin ışıklı hedefleri bir renk sırası saklıyor. Diziyi hatırlayıp dört doğru atış yap.', speech: 'Şimdi hedeflerin sırrını çözelim!' },
]

const addressOptions = [
  'Önce yıldızlı sokağa, sonra parka dönelim.',
  'Önce alışverişe, sonra köprüye gidelim.',
  'Düz devam edip bulut durağında bekleyelim.',
]

const shoppingItems = [
  { id: 'apple', label: 'Elma', emoji: '🍎' },
  { id: 'milk', label: 'Süt', emoji: '🥛' },
  { id: 'bread', label: 'Ekmek', emoji: '🍞' },
  { id: 'flower', label: 'Çiçek', emoji: '🌼' },
]

const marketItems = [
  { label: 'Domates', emoji: '🍅' },
  { label: 'Peynir', emoji: '🧀' },
  { label: 'Muz', emoji: '🍌' },
  { label: 'Çiçek', emoji: '🌷' },
  { label: 'Kurabiye', emoji: '🍪' },
]

const memoryDeck = ['🧭', '🌼', '🛒', '🧭', '🛒', '🌼']
const sequenceColors = ['red', 'blue', 'gold', 'green'] as const
const targetSequence = ['blue', 'gold', 'red', 'green']
const missionTitles: Record<MissionId, string> = {
  address: 'Semra adresi buluyor', shopping: 'Semra ve babası pazarda', rhythm: 'Semra ritmi yakalıyor', targets: 'Semra hedefleri vuruyor',
  memory: 'Semra hatıraları eşleştiriyor', market: 'Semra pazarı hızlandırıyor', relay: 'Semra bayrağı taşıyor', sequence: 'Semra renkleri hatırlıyor',
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [activeMission, setActiveMission] = useState<MissionId | null>(null)
  const [completed, setCompleted] = useState<MissionId[]>([])
  const [muted, setMuted] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [addressChoice, setAddressChoice] = useState<number | null>(null)
  const [shoppingSelected, setShoppingSelected] = useState<string[]>([])
  const [rhythmStep, setRhythmStep] = useState(0)
  const [targetHits, setTargetHits] = useState<number[]>([])
  const [memoryFlipped, setMemoryFlipped] = useState<number[]>([])
  const [memoryMatched, setMemoryMatched] = useState<number[]>([])
  const [marketStep, setMarketStep] = useState(0)
  const [relayProgress, setRelayProgress] = useState(0)
  const [sequenceStep, setSequenceStep] = useState(0)
  const [memoryOpen, setMemoryOpen] = useState(false)
  const audioRef = useRef<GameAudio | null>(null)

  useEffect(() => {
    audioRef.current = new GameAudio()
    return () => audioRef.current?.destroy()
  }, [])

  const play = (name: Parameters<GameAudio['play']>[0]) => audioRef.current?.play(name)

  const startAdventure = () => {
    audioRef.current?.start()
    setScreen('map')
  }

  const toggleSound = () => {
    const nextMuted = !muted
    setMuted(nextMuted)
    audioRef.current?.setMuted(nextMuted)
  }

  const openMission = (id: MissionId) => {
    setActiveMission(id)
    setAddressChoice(null)
    setShoppingSelected([])
    setRhythmStep(0)
    setTargetHits([])
    setMemoryFlipped([])
    setMemoryMatched([])
    setMarketStep(0)
    setRelayProgress(0)
    setSequenceStep(0)
    setFeedback('')
    setScreen('mission')
    play('talk')
  }

  const chooseAddress = (index: number) => {
    setAddressChoice(index)
    if (index === 0) {
      play('collect')
      setFeedback('Harika! Anne Sevil’in tarifini doğru buldun.')
    } else {
      play('hit')
      setFeedback('Birlikte tekrar bakalım. Yıldızlı sokaktan sonra parka dönüyoruz.')
    }
  }

  const chooseShoppingItem = (id: string) => {
    if (shoppingSelected.includes(id)) return
    const nextSelected = [...shoppingSelected, id]
    setShoppingSelected(nextSelected)
    play('collect')
    setFeedback(nextSelected.length === shoppingItems.length ? 'Sepet tamam! Ahmet Baba ile alışveriş görevi bitti.' : 'Sepete eklendi. Listedeki diğer ürünleri de bul!')
  }

  const tapRhythm = (index: number) => {
    if (index !== rhythmStep) {
      play('hit')
      setRhythmStep(0)
      setFeedback('Ritim şaştı! İlk yıldızdan başlayıp sırayı takip et.')
      return
    }
    const nextStep = rhythmStep + 1
    setRhythmStep(nextStep)
    play('collect')
    if (nextStep === 5) setFeedback('Mükemmel ritim! Mesut Abi seninle gurur duyuyor.')
  }

  const tapTarget = (index: number) => {
    if (targetHits.includes(index)) return
    const nextHits = [...targetHits, index]
    setTargetHits(nextHits)
    play('collect')
    setFeedback(nextHits.length === 3 ? 'Üç hedef de tamam! Zafer Abi’nin süper yardımcısısın.' : 'İsabet! Kalan hedefleri de yakala.')
  }

  const tapMemoryCard = (index: number) => {
    if (memoryFlipped.includes(index) || memoryMatched.includes(index) || memoryFlipped.length === 2) return
    const nextFlipped = [...memoryFlipped, index]
    setMemoryFlipped(nextFlipped)
    play('memory')
    if (nextFlipped.length !== 2) return
    const [first, second] = nextFlipped
    if (memoryDeck[first] === memoryDeck[second]) {
      const nextMatched = [...memoryMatched, first, second]
      setMemoryMatched(nextMatched)
      setMemoryFlipped([])
      play('collect')
      if (nextMatched.length === memoryDeck.length) setFeedback('Harika eşleştirme! Aile albümünün gizli sayfası açıldı.')
    } else {
      setFeedback('Bu ikili farklı. Kartları hatırlayıp yeniden dene!')
      window.setTimeout(() => setMemoryFlipped([]), 650)
    }
  }

  const tapMarketItem = (index: number) => {
    if (index < marketStep) return
    if (index !== marketStep) {
      play('hit')
      setMarketStep(0)
      setFeedback('Sıra karıştı! Domatesten başlayarak listeyi takip et.')
      return
    }
    const nextStep = marketStep + 1
    setMarketStep(nextStep)
    play('collect')
    if (nextStep === marketItems.length) setFeedback('Hızlı ve doğru! Pazar sırasını sen kurdun.')
  }

  const tapRelay = () => {
    if (relayProgress >= 8) return
    const nextProgress = relayProgress + 1
    setRelayProgress(nextProgress)
    play('jump')
    if (nextProgress === 8) {
      play('level')
      setFeedback('Bayrak sende! Mesut Abi ile birlikte yarışı kazandınız.')
    }
  }

  const tapSequenceTarget = (color: string) => {
    if (color !== targetSequence[sequenceStep]) {
      play('hit')
      setSequenceStep(0)
      setFeedback('Renk sırası şaştı. Mavi ile başlayıp ışıkları takip et!')
      return
    }
    const nextStep = sequenceStep + 1
    setSequenceStep(nextStep)
    play('collect')
    if (nextStep === targetSequence.length) setFeedback('Renk hafızası tamam! Zafer Abi’nin gizli hedefini buldun.')
  }

  const finishMission = () => {
    if (!activeMission) return
    const nextCompleted = completed.includes(activeMission) ? completed : [...completed, activeMission]
    setCompleted(nextCompleted)
    play('level')
    setFeedback('')
    setActiveMission(null)
    setScreen('map')
  }

  const finishAdventure = () => {
    play('victory')
    setScreen('complete')
  }

  const activeMissionDef = activeMission ? missions.find((mission) => mission.id === activeMission) : null
  const activePerson = activeMissionDef ? family.find((person) => person.id === activeMissionDef.memberId) : null
  const missionSolved = (() => {
    switch (activeMission) {
      case 'address': return addressChoice === 0
      case 'shopping': return shoppingSelected.length === shoppingItems.length
      case 'rhythm': return rhythmStep === 5
      case 'targets': return targetHits.length === 3
      case 'memory': return memoryMatched.length === memoryDeck.length
      case 'market': return marketStep === marketItems.length
      case 'relay': return relayProgress === 8
      case 'sequence': return sequenceStep === targetSequence.length
      default: return false
    }
  })()

  const renderMissionTask = () => {
    if (activeMission === 'address') {
      return <div className="task-block"><p className="task-label">Semra soruyor: “Anne, parka nasıl gideceğiz?”</p><div className="choice-list">{addressOptions.map((option, index) => <button className={`choice-button ${addressChoice === index ? (index === 0 ? 'correct' : 'wrong') : ''}`} key={option} onClick={() => chooseAddress(index)}><span className="choice-number">{index + 1}</span><span>{option}</span></button>)}</div></div>
    }
    if (activeMission === 'shopping') {
      return <div className="task-block"><p className="task-label">Ahmet Baba’nın alışveriş listesini tamamla:</p><div className="shopping-list">{shoppingItems.map((item) => { const selected = shoppingSelected.includes(item.id); return <button className={`shopping-item ${selected ? 'selected' : ''}`} key={item.id} onClick={() => chooseShoppingItem(item.id)} aria-pressed={selected}><span className="item-emoji">{item.emoji}</span><span>{item.label}</span><span className="item-check">{selected ? '✓' : '+'}</span></button> })}</div><div className="basket-meter"><span className="basket-fill" style={{ width: `${(shoppingSelected.length / shoppingItems.length) * 100}%` }} /></div><p className="meter-copy">Sepet: {shoppingSelected.length} / {shoppingItems.length}</p></div>
    }
    if (activeMission === 'rhythm') {
      return <div className="task-block"><p className="task-label">Mesut Abi’nin yıldız ritmini aynı sırayla tekrarla:</p><div className="rhythm-row">{Array.from({ length: 5 }, (_, index) => <button className={`rhythm-star ${index < rhythmStep ? 'lit' : ''}`} key={index} onClick={() => tapRhythm(index)} aria-label={`${index + 1}. ritim yıldızı`}>★</button>)}</div><p className="meter-copy">Ritim: {rhythmStep} / 5</p></div>
    }
    if (activeMission === 'targets') {
      return <div className="task-block"><p className="task-label">Zafer Abi’nin parkındaki üç hedefe dokun:</p><div className="target-board">{['red', 'blue', 'gold'].map((color, index) => <button className={`target target-${color} ${targetHits.includes(index) ? 'hit' : ''}`} key={color} onClick={() => tapTarget(index)} aria-label={`${color} hedef`}><span /></button>)}</div><p className="meter-copy">Hedef: {targetHits.length} / 3</p></div>
    }
    if (activeMission === 'memory') {
      return <div className="task-block"><p className="task-label">Aynı sembolleri bulup hatıra çiftlerini tamamla:</p><div className="memory-grid">{memoryDeck.map((card, index) => { const revealed = memoryFlipped.includes(index) || memoryMatched.includes(index); return <button className={`memory-tile ${revealed ? 'revealed' : ''} ${memoryMatched.includes(index) ? 'matched' : ''}`} key={`${card}-${index}`} onClick={() => tapMemoryCard(index)} aria-label={revealed ? `${card} hatıra kartı` : 'Kapalı hatıra kartı'}>{revealed ? card : '?'}</button> })}</div><p className="meter-copy">Eşleşen çift: {memoryMatched.length / 2} / 3</p></div>
    }
    if (activeMission === 'market') {
      return <div className="task-block"><p className="task-label">Ürünleri şu sırayla seç: domates → peynir → muz → çiçek → kurabiye</p><div className="market-sequence">{marketItems.map((item, index) => <button className={`market-item ${index < marketStep ? 'done' : ''} ${index === marketStep ? 'next' : ''}`} key={item.label} onClick={() => tapMarketItem(index)}><span>{item.emoji}</span><b>{index < marketStep ? '✓' : index + 1}</b><small>{item.label}</small></button>)}</div><p className="meter-copy">Sipariş: {marketStep} / {marketItems.length}</p></div>
    }
    if (activeMission === 'relay') {
      return <div className="task-block"><p className="task-label">Bayrağı finale götürmek için koş düğmesine 8 kez dokun:</p><div className="relay-track"><div className="relay-finish">🏁</div><div className="relay-runner" style={{ left: `${relayProgress * 10}%` }}>🏃‍♀️</div></div><button className="relay-button" onClick={tapRelay} disabled={relayProgress === 8}>{relayProgress === 8 ? 'Bayrak finişte! ✓' : 'Koş! +1 adım'}</button><p className="meter-copy">Pist: {relayProgress} / 8 adım</p></div>
    }
    return <div className="task-block"><p className="task-label">Işıkları doğru sırada yak: mavi → sarı → kırmızı → yeşil</p><div className="sequence-board">{sequenceColors.map((color) => <button className={`sequence-target sequence-${color} ${sequenceStep > targetSequence.indexOf(color) && targetSequence.slice(0, sequenceStep).includes(color) ? 'lit' : ''}`} key={color} onClick={() => tapSequenceTarget(color)} aria-label={`${color} hedef`}><span /></button>)}</div><p className="meter-copy">Renk dizisi: {sequenceStep} / {targetSequence.length}</p></div>
  }

  if (screen === 'home') {
    return <div className="app-shell home-screen"><header className="site-header home-header"><div className="brand-lockup"><span className="brand-mark">S</span><span>Semra’nın Aile Günü</span></div><span className="header-note">8 bölümlük sıcacık bir aile macerası</span></header><main className="home-hero"><section className="hero-copy"><span className="eyebrow coral">YENİ AİLE MACERASI</span><h1>Bugünün kahramanı <em>Semra!</em></h1><p>Semra, ailesiyle sekiz eğlenceli bölümü tamamlayıp günün büyük sürprizine ulaşacak. Her durakta sevdiği bir aile üyesi onu bekliyor.</p><div className="hero-actions"><button className="primary-button large" onClick={startAdventure}>Aile macerasını başlat <span>→</span></button><span className="play-hint">♫ Müzik, efekt ve 8 farklı mini oyun</span></div><div className="mission-preview">{missions.map((mission, index) => <div className="preview-pill" key={mission.id}><span className="preview-index">{index + 1}</span><span>{mission.title}</span></div>)}</div></section><section className="home-family-stage" aria-label="Aile karakterleri"><div className="stage-sun" /><div className="stage-cloud cloud-one" /><div className="stage-cloud cloud-two" /><span className="stage-caption">AİLE EKİBİ</span><div className="home-family-lineup">{family.map((person) => <div className="home-character" key={person.id}><div className="home-character-art"><img src={person.image} alt={person.name} /></div><strong>{person.name}</strong><span>{person.role}</span></div>)}</div><div className="home-semra"><div className="runner-sprite" /><span>SEMRA</span></div><div className="stage-path" /></section></main><footer className="home-footer"><span>Gerçek aile anılarından ilhamla, yalnızca sizin aileniz için.</span><span>İpucu: Bu macerada toplam 8 bölümü keşfet!</span></footer></div>
  }

  if (screen === 'map') {
    const allComplete = completed.length === missions.length
    return <div className="app-shell map-screen"><header className="site-header game-header"><button className="mini-brand" onClick={() => setScreen('home')}><span className="brand-mark">S</span><span>Semra’nın Aile Günü</span></button><div className="game-header-actions"><div className="progress-chip"><span className="progress-dot">★</span><span>Bölümler <b>{completed.length}/8</b></span></div><button className="sound-button" onClick={toggleSound}>{muted ? '🔇 Sesi aç' : '🔊 Sesi kapat'}</button></div></header><main className="map-main"><div className="map-heading"><div><span className="eyebrow teal">AİLE HARİTASI</span><h1>Herkes Semra’yı bekliyor!</h1><p>Dört aile istasyonunda toplam sekiz bölümü tamamla ve aile finalini aç.</p></div><div className="semra-status"><div className="tiny-runner"><div className="runner-sprite" /></div><span>Semra’nın günü</span><b>{completed.length === 0 ? 'Başlıyor' : `${completed.length} bölüm tamam`}</b></div></div><section className="family-map" aria-label="Aile görev haritası"><div className="map-decor decor-home">⌂</div><div className="map-decor decor-tree">🌳</div><div className="map-decor decor-flower">✿ ✿</div><div className="map-road road-one" /><div className="map-road road-two" /><div className="family-stations">{family.map((person, index) => { const personMissions = missions.filter((mission) => mission.memberId === person.id); return <article className={`family-station station-${person.id}`} key={person.id} style={{ '--station-accent': person.accent } as CSSProperties}><span className="station-number">{index + 1}</span><div className="station-art"><img src={person.image} alt={person.name} /></div><div className="station-copy"><strong>{person.name}</strong><small>{person.role}</small></div><div className="station-levels">{personMissions.map((mission) => { const done = completed.includes(mission.id); return <button className={`level-button ${done ? 'done' : ''}`} key={mission.id} onClick={() => openMission(mission.id)}><b>Seviye {mission.level}</b><span>{mission.emoji} {mission.title}</span><em>{done ? '✓' : '→'}</em></button> })}</div></article> })}</div><div className="map-semra"><div className="runner-sprite" /><span>Semra</span></div><div className="map-sign">AİLE PARKI <span>♥</span></div></section><div className="map-bottom-row"><div className="map-tip"><span>💡</span><p><b>Hepsi oyunun içinde!</b> Önce Seviye 1 görevlerini, sonra aynı aile üyesinin yaratıcı Seviye 2 oyunlarını aç.</p></div>{allComplete && <button className="primary-button final-button" onClick={finishAdventure}>Aile finaline git <span>→</span></button>}</div></main></div>
  }

  if (screen === 'mission' && activeMissionDef && activePerson && activeMission) {
    const missionIndex = missions.findIndex((mission) => mission.id === activeMission)
    return <div className={`app-shell mission-screen theme-${activeMission}`}><header className="site-header game-header"><button className="mini-brand" onClick={() => setScreen('map')}><span className="brand-mark">S</span><span>Semra’nın Aile Günü</span></button><div className="game-header-actions"><span className="mission-counter">BÖLÜM {missionIndex + 1} / 8</span><button className="sound-button" onClick={toggleSound}>{muted ? '🔇 Sesi aç' : '🔊 Sesi kapat'}</button></div></header><main className="mission-main"><button className="back-link" onClick={() => setScreen('map')}>← Haritaya dön</button><div className="mission-layout"><section className="mission-stage" style={{ '--stage-accent': activePerson.accent } as CSSProperties}><div className="stage-glow" /><div className="scene-spark spark-one">✦</div><div className="scene-spark spark-two">✦</div><div className="scene-location"><span>{activeMissionDef.emoji}</span>{activeMissionDef.station}</div><div className="scene-person"><img src={activePerson.image} alt={activePerson.name} /></div><div className="scene-semra"><div className="runner-sprite" /><span>Semra</span></div><div className="speech-bubble"><strong>{activePerson.name}</strong><span>{activeMissionDef.speech}</span></div><div className="stage-floor" /></section><section className="mission-panel"><span className="eyebrow" style={{ color: activePerson.accent }}>SEVİYE {activeMissionDef.level}</span><h1>{missionTitles[activeMission]}</h1><p className="mission-description">{activeMissionDef.description}</p>{renderMissionTask()}{feedback && <div className={`feedback ${missionSolved ? 'success' : 'info'}`}><span>{missionSolved ? '✓' : '✦'}</span>{feedback}</div>}<div className="mission-actions"><button className="text-button" onClick={() => setScreen('map')}>Daha sonra</button><button className="primary-button" disabled={!missionSolved} onClick={finishMission}>{missionSolved ? 'Bölümü tamamla' : 'Önce bölümü bitir'} <span>→</span></button></div></section></div></main></div>
  }

  return <div className="app-shell complete-screen"><header className="site-header game-header"><button className="mini-brand" onClick={() => setScreen('map')}><span className="brand-mark">S</span><span>Semra’nın Aile Günü</span></button><button className="sound-button" onClick={toggleSound}>{muted ? '🔇 Sesi aç' : '🔊 Sesi kapat'}</button></header><main className="complete-main"><span className="eyebrow gold">BÜYÜK AİLE FİNALİ</span><h1>Bravo Semra! Günün yıldızı sensin!</h1><p>Sekiz bölümü de ailenle birlikte tamamladın. Şimdi bu güzel günü bir aile hatırasıyla kutlayabilirsin.</p><div className="complete-family-lineup">{family.map((person) => <div className="complete-character" key={person.id}><img src={person.image} alt={person.name} /><strong>{person.name}</strong></div>)}<div className="complete-semra"><div className="runner-sprite" /><strong>Semra</strong></div></div><div className="complete-actions"><button className="primary-button large" onClick={() => setMemoryOpen(true)}>Aile hatırasını aç <span>♥</span></button><button className="outline-button" onClick={() => setScreen('map')}>Haritaya dön</button></div>{memoryOpen && <div className="memory-modal" role="dialog" aria-modal="true" aria-label="Aile hatırası" onClick={() => setMemoryOpen(false)}><div className="memory-card" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setMemoryOpen(false)}>×</button><span className="eyebrow coral">AİLE ALBÜMÜNDEN</span><h2>Birlikte her gün macera</h2><img src="/images/family-memory.jpg" alt="Aile hatırası" /><p>Bu hatıra yalnızca bu aile oyununun içinde, sevgiyle kullanılıyor.</p></div></div>}</main></div>
}

export default App
