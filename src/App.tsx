import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { GameAudio } from './audio'

type Screen = 'home' | 'map' | 'mission' | 'complete'
type MissionId = 'address' | 'shopping' | 'mesut' | 'zafer'

type FamilyMember = {
  id: MissionId
  name: string
  role: string
  image: string
  station: string
  accent: string
  emoji: string
}

const family: FamilyMember[] = [
  {
    id: 'address',
    name: 'Anne Sevil',
    role: 'Adres ustası',
    image: '/images/sevil-npc.png',
    station: 'Adres Meydanı',
    accent: '#f26f91',
    emoji: '🧭',
  },
  {
    id: 'shopping',
    name: 'Baba Ahmet',
    role: 'Alışveriş kaptanı',
    image: '/images/ahmet-npc.png',
    station: 'Renkli Pazar',
    accent: '#f5a340',
    emoji: '🛒',
  },
  {
    id: 'mesut',
    name: 'Abi Mesut',
    role: 'Ritim koçu',
    image: '/images/mesut-npc.png',
    station: 'Müzik Bahçesi',
    accent: '#52c5b5',
    emoji: '🎵',
  },
  {
    id: 'zafer',
    name: 'Büyük Abi Zafer',
    role: 'Hedef şampiyonu',
    image: '/images/zafer-npc.png',
    station: 'Hedef Parkı',
    accent: '#7d8cff',
    emoji: '🎯',
  },
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

const missionTitles: Record<MissionId, string> = {
  address: 'Semra adresi buluyor',
  shopping: 'Semra ve babası pazarda',
  mesut: 'Semra ritmi yakalıyor',
  zafer: 'Semra hedefleri vuruyor',
}

const missionOrder: MissionId[] = ['address', 'shopping', 'mesut', 'zafer']

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [activeMission, setActiveMission] = useState<MissionId | null>(null)
  const [completed, setCompleted] = useState<MissionId[]>([])
  const [muted, setMuted] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [addressChoice, setAddressChoice] = useState<number | null>(null)
  const [shoppingSelected, setShoppingSelected] = useState<string[]>([])
  const [activityStep, setActivityStep] = useState(0)
  const [targetHits, setTargetHits] = useState<number[]>([])
  const [memoryOpen, setMemoryOpen] = useState(false)
  const audioRef = useRef<GameAudio | null>(null)

  useEffect(() => {
    audioRef.current = new GameAudio()
    return () => audioRef.current?.destroy()
  }, [])

  const play = (name: Parameters<GameAudio['play']>[0]) => audioRef.current?.play(name)

  const startAdventure = () => {
    audioRef.current?.start()
    play('start')
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
    setActivityStep(0)
    setTargetHits([])
    setFeedback('')
    setScreen('mission')
    play('talk')
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
    if (nextSelected.length === shoppingItems.length) {
      setFeedback('Sepet tamam! Ahmet Baba ile alışveriş görevi bitti.')
    } else {
      setFeedback('Sepete eklendi. Listedeki diğer ürünleri de bul!')
    }
  }

  const tapBeat = (index: number) => {
    if (index !== activityStep) {
      play('hit')
      setActivityStep(0)
      setFeedback('Ritim şaştı! İlk yıldızdan başlayıp sırayı takip et.')
      return
    }
    const nextStep = activityStep + 1
    setActivityStep(nextStep)
    play('collect')
    if (nextStep === 5) setFeedback('Mükemmel ritim! Mesut Abi seninle gurur duyuyor.')
  }

  const tapTarget = (index: number) => {
    if (targetHits.includes(index)) return
    const nextHits = [...targetHits, index]
    setTargetHits(nextHits)
    play('collect')
    if (nextHits.length === 3) {
      setFeedback('Üç hedef de tamam! Zafer Abi’nin süper yardımcısısın.')
    } else {
      setFeedback('İsabet! Kalan hedefleri de yakala.')
    }
  }

  const activePerson = activeMission ? family.find((person) => person.id === activeMission) : null
  const missionSolved = activeMission === 'address'
    ? addressChoice === 0
    : activeMission === 'shopping'
      ? shoppingSelected.length === shoppingItems.length
      : activeMission === 'mesut'
        ? activityStep === 5
        : activeMission === 'zafer'
          ? targetHits.length === 3
          : false

  const renderMissionTask = () => {
    if (activeMission === 'address') {
      return (
        <div className="task-block">
          <p className="task-label">Semra soruyor: “Anne, parka nasıl gideceğiz?”</p>
          <div className="choice-list">
            {addressOptions.map((option, index) => (
              <button
                className={`choice-button ${addressChoice === index ? (index === 0 ? 'correct' : 'wrong') : ''}`}
                key={option}
                onClick={() => chooseAddress(index)}
              >
                <span className="choice-number">{index + 1}</span>
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>
      )
    }

    if (activeMission === 'shopping') {
      return (
        <div className="task-block">
          <p className="task-label">Ahmet Baba’nın alışveriş listesini tamamla:</p>
          <div className="shopping-list">
            {shoppingItems.map((item) => {
              const selected = shoppingSelected.includes(item.id)
              return (
                <button
                  className={`shopping-item ${selected ? 'selected' : ''}`}
                  key={item.id}
                  onClick={() => chooseShoppingItem(item.id)}
                  aria-pressed={selected}
                >
                  <span className="item-emoji">{item.emoji}</span>
                  <span>{item.label}</span>
                  <span className="item-check">{selected ? '✓' : '+'}</span>
                </button>
              )
            })}
          </div>
          <div className="basket-meter" aria-label={`${shoppingSelected.length} / ${shoppingItems.length} ürün`}> 
            <span className="basket-fill" style={{ width: `${(shoppingSelected.length / shoppingItems.length) * 100}%` }} />
          </div>
          <p className="meter-copy">Sepet: {shoppingSelected.length} / {shoppingItems.length}</p>
        </div>
      )
    }

    if (activeMission === 'mesut') {
      return (
        <div className="task-block">
          <p className="task-label">Mesut Abi’nin yıldız ritmini aynı sırayla tekrarla:</p>
          <div className="rhythm-row">
            {Array.from({ length: 5 }, (_, index) => (
              <button
                className={`rhythm-star ${index < activityStep ? 'lit' : ''}`}
                key={index}
                onClick={() => tapBeat(index)}
                aria-label={`${index + 1}. ritim yıldızı`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="meter-copy">Ritim: {activityStep} / 5</p>
        </div>
      )
    }

    return (
      <div className="task-block">
        <p className="task-label">Zafer Abi’nin parkındaki üç hedefe dokun:</p>
        <div className="target-board">
          {['red', 'blue', 'gold'].map((color, index) => (
            <button
              className={`target target-${color} ${targetHits.includes(index) ? 'hit' : ''}`}
              key={color}
              onClick={() => tapTarget(index)}
              aria-label={`${color} hedef`}
            >
              <span />
            </button>
          ))}
        </div>
        <p className="meter-copy">Hedef: {targetHits.length} / 3</p>
      </div>
    )
  }

  if (screen === 'home') {
    return (
      <div className="app-shell home-screen">
        <header className="site-header home-header">
          <div className="brand-lockup">
            <span className="brand-mark">S</span>
            <span>Semra’nın Aile Günü</span>
          </div>
          <span className="header-note">Birlikte oynanan sıcacık bir macera</span>
        </header>
        <main className="home-hero">
          <section className="hero-copy">
            <span className="eyebrow coral">YENİ AİLE MACERASI</span>
            <h1>Bugünün kahramanı <em>Semra!</em></h1>
            <p>Semra, ailesiyle dört eğlenceli görevi tamamlayıp günün büyük sürprizine ulaşacak. Her durakta sevdiği bir aile üyesi onu bekliyor.</p>
            <div className="hero-actions">
              <button className="primary-button large" onClick={startAdventure}>Aile macerasını başlat <span>→</span></button>
              <span className="play-hint">♫ Müzik ve neşeli efektler hazır</span>
            </div>
            <div className="mission-preview">
              {family.map((person, index) => (
                <div className="preview-pill" key={person.id}>
                  <span className="preview-index">{index + 1}</span>
                  <span>{person.name.replace('Büyük ', '')}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="home-family-stage" aria-label="Aile karakterleri">
            <div className="stage-sun" />
            <div className="stage-cloud cloud-one" />
            <div className="stage-cloud cloud-two" />
            <span className="stage-caption">AİLE EKİBİ</span>
            <div className="home-family-lineup">
              {family.map((person) => (
                <div className="home-character" key={person.id}>
                  <div className="home-character-art"><img src={person.image} alt={person.name} /></div>
                  <strong>{person.name}</strong>
                  <span>{person.role}</span>
                </div>
              ))}
            </div>
            <div className="home-semra">
              <div className="runner-sprite" />
              <span>SEMRA</span>
            </div>
            <div className="stage-path" />
          </section>
        </main>
        <footer className="home-footer"><span>Gerçek aile anılarından ilhamla, yalnızca sizin aileniz için.</span><span>İpucu: Haritada tüm karakterlerle konuşmayı unutma!</span></footer>
      </div>
    )
  }

  if (screen === 'map') {
    const allComplete = completed.length === family.length
    return (
      <div className="app-shell map-screen">
        <header className="site-header game-header">
          <button className="mini-brand" onClick={() => setScreen('home')}><span className="brand-mark">S</span><span>Semra’nın Aile Günü</span></button>
          <div className="game-header-actions">
            <div className="progress-chip"><span className="progress-dot">★</span><span>Görevler <b>{completed.length}/4</b></span></div>
            <button className="sound-button" onClick={toggleSound}>{muted ? '🔇 Sesi aç' : '🔊 Sesi kapat'}</button>
          </div>
        </header>
        <main className="map-main">
          <div className="map-heading">
            <div><span className="eyebrow teal">AİLE HARİTASI</span><h1>Herkes Semra’yı bekliyor!</h1><p>Dört istasyona uğra, görevleri tamamla ve aile finalini aç.</p></div>
            <div className="semra-status"><div className="tiny-runner"><div className="runner-sprite" /></div><span>Semra’nın günü</span><b>{completed.length === 0 ? 'Başlıyor' : `${completed.length} görev tamam`}</b></div>
          </div>
          <section className="family-map" aria-label="Aile görev haritası">
            <div className="map-decor decor-home">⌂</div><div className="map-decor decor-tree">🌳</div><div className="map-decor decor-flower">✿ ✿</div>
            <div className="map-road road-one" /><div className="map-road road-two" />
            <div className="family-stations">
              {family.map((person, index) => {
                const done = completed.includes(person.id)
                return (
                  <button className={`family-station station-${person.id} ${done ? 'done' : ''}`} key={person.id} onClick={() => openMission(person.id)} style={{ '--station-accent': person.accent } as CSSProperties}>
                    <span className="station-number">{done ? '✓' : index + 1}</span>
                    <span className="station-art"><img src={person.image} alt={person.name} /></span>
                    <span className="station-copy"><strong>{person.name}</strong><small>{person.station}</small><em>{done ? 'Tamamlandı · Tekrar oyna' : `${person.emoji} Göreve git`}</em></span>
                  </button>
                )
              })}
            </div>
            <div className="map-semra"><div className="runner-sprite" /><span>Semra</span></div>
            <div className="map-sign">AİLE PARKI <span>♥</span></div>
          </section>
          <div className="map-bottom-row">
            <div className="map-tip"><span>💡</span><p><b>Her karakter görünür ve hazır!</b> Bir karta tıklayarak o aile üyesiyle özel görevine başlayabilirsin.</p></div>
            {allComplete && <button className="primary-button final-button" onClick={finishAdventure}>Aile finaline git <span>→</span></button>}
          </div>
        </main>
      </div>
    )
  }

  if (screen === 'mission' && activePerson && activeMission) {
    const missionIndex = missionOrder.indexOf(activeMission)
    return (
      <div className={`app-shell mission-screen theme-${activeMission}`}>
        <header className="site-header game-header">
          <button className="mini-brand" onClick={() => setScreen('map')}><span className="brand-mark">S</span><span>Semra’nın Aile Günü</span></button>
          <div className="game-header-actions"><span className="mission-counter">BÖLÜM {missionIndex + 1} / 4</span><button className="sound-button" onClick={toggleSound}>{muted ? '🔇 Sesi aç' : '🔊 Sesi kapat'}</button></div>
        </header>
        <main className="mission-main">
          <button className="back-link" onClick={() => setScreen('map')}>← Haritaya dön</button>
          <div className="mission-layout">
            <section className="mission-stage" style={{ '--stage-accent': activePerson.accent } as CSSProperties}>
              <div className="stage-glow" /><div className="scene-spark spark-one">✦</div><div className="scene-spark spark-two">✦</div>
              <div className="scene-location"><span>{activePerson.emoji}</span>{activePerson.station}</div>
              <div className="scene-person"><img src={activePerson.image} alt={activePerson.name} /></div>
              <div className="scene-semra"><div className="runner-sprite" /><span>Semra</span></div>
              <div className="speech-bubble"><strong>{activePerson.name}</strong><span>{activeMission === 'address' ? 'Hazır mısın? Birlikte yolu bulalım!' : activeMission === 'shopping' ? 'Sepeti beraber dolduralım mı?' : activeMission === 'mesut' ? 'Benim ritmimi tekrar edebilir misin?' : 'Hedefler seni bekliyor, küçük şampiyon!'}</span></div>
              <div className="stage-floor" />
            </section>
            <section className="mission-panel">
              <span className="eyebrow" style={{ color: activePerson.accent }}>GÖREV {missionIndex + 1}</span>
              <h1>{missionTitles[activeMission]}</h1>
              <p className="mission-description">{activeMission === 'address' ? 'Anne Sevil, Semra’ya aile parkının yolunu tarif ediyor. En doğru rotayı seçerek ona yardım et.' : activeMission === 'shopping' ? 'Ahmet Baba’nın sepeti boş kaldı. Listedeki her şeyi bulup alışverişi birlikte tamamlayın.' : activeMission === 'mesut' ? 'Mesut Abi müzik bahçesinde bir ritim başlattı. Parlayan yıldızlara doğru sırayla dokun.' : 'Zafer Abi hedef parkında eğlenceli bir oyun hazırladı. Üç renkli hedefi de isabet ettir.'}</p>
              {renderMissionTask()}
              {feedback && <div className={`feedback ${missionSolved ? 'success' : 'info'}`}><span>{missionSolved ? '✓' : '✦'}</span>{feedback}</div>}
              <div className="mission-actions"><button className="text-button" onClick={() => setScreen('map')}>Daha sonra</button><button className="primary-button" disabled={!missionSolved} onClick={finishMission}>{missionSolved ? 'Görevi tamamla' : 'Önce görevi bitir'} <span>→</span></button></div>
            </section>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell complete-screen">
      <header className="site-header game-header"><button className="mini-brand" onClick={() => setScreen('map')}><span className="brand-mark">S</span><span>Semra’nın Aile Günü</span></button><button className="sound-button" onClick={toggleSound}>{muted ? '🔇 Sesi aç' : '🔊 Sesi kapat'}</button></header>
      <main className="complete-main">
        <span className="eyebrow gold">BÜYÜK AİLE FİNALİ</span>
        <h1>Bravo Semra! Günün yıldızı sensin!</h1>
        <p>Dört görevi de ailenle birlikte tamamladın. Şimdi bu güzel günü bir aile hatırasıyla kutlayabilirsin.</p>
        <div className="complete-family-lineup">
          {family.map((person) => <div className="complete-character" key={person.id}><img src={person.image} alt={person.name} /><strong>{person.name}</strong></div>)}
          <div className="complete-semra"><div className="runner-sprite" /><strong>Semra</strong></div>
        </div>
        <div className="complete-actions"><button className="primary-button large" onClick={() => setMemoryOpen(true)}>Aile hatırasını aç <span>♥</span></button><button className="outline-button" onClick={() => setScreen('map')}>Haritaya dön</button></div>
        {memoryOpen && <div className="memory-modal" role="dialog" aria-modal="true" aria-label="Aile hatırası" onClick={() => setMemoryOpen(false)}><div className="memory-card" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setMemoryOpen(false)}>×</button><span className="eyebrow coral">AİLE ALBÜMÜNDEN</span><h2>Birlikte her gün macera</h2><img src="/images/family-memory.jpg" alt="Aile hatırası" /><p>Bu hatıra yalnızca bu aile oyununun içinde, sevgiyle kullanılıyor.</p></div></div>}
      </main>
    </div>
  )
}

export default App
