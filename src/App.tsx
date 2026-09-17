import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { GameAudio } from './audio'

type Screen = 'welcome' | 'show' | 'final'
type ActId = 'sevil' | 'ahmet' | 'mesut' | 'zafer' | 'family'

type Person = {
  id: ActId
  name: string
  role: string
  image: string
  color: string
}

type Act = {
  id: ActId
  title: string
  icon: string
  color: string
  personId: ActId
  voice: string
}

const family: Person[] = [
  { id: 'sevil', name: 'Anne Sevil', role: 'Sevgi kaptanı', image: '/images/sevil-npc.png', color: '#ff7892' },
  { id: 'ahmet', name: 'Baba Ahmet', role: 'Pazar kaptanı', image: '/images/ahmet-npc.png', color: '#f4aa3e' },
  { id: 'mesut', name: 'Abi Mesut', role: 'Ritim kaptanı', image: '/images/zafer-npc.png', color: '#53c4b0' },
  { id: 'zafer', name: 'Büyük Abi Zafer', role: 'Oyun kaptanı', image: '/images/mesut-npc.png', color: '#7c8cf1' },
]

const acts: Act[] = [
  { id: 'sevil', title: 'Kalp avı', icon: '💗', color: '#ff7892', personId: 'sevil', voice: 'Anne Sevil’in kalplerini bul. Parlayan kalplere dokun!' },
  { id: 'ahmet', title: 'Sepet şenliği', icon: '🛒', color: '#f4aa3e', personId: 'ahmet', voice: 'Baba Ahmet’in sepetini doldur. Ürün resimlerine dokun!' },
  { id: 'mesut', title: 'Balon yağmuru', icon: '🎈', color: '#53c4b0', personId: 'mesut', voice: 'Mesut Abi’nin balonlarını patlat. Balonlara dokun!' },
  { id: 'zafer', title: 'Pin devirme', icon: '🎳', color: '#7c8cf1', personId: 'zafer', voice: 'Zafer Abi ile pinleri devir. Pinlere dokun!' },
  { id: 'family', title: 'Fotoğraf zamanı', icon: '📸', color: '#f3c65c', personId: 'family', voice: 'Aile fotoğrafını tamamla. İki parçaya dokun ve yer değiştir!' },
]

const marketItems = [
  { id: 'apple', emoji: '🍎' },
  { id: 'bread', emoji: '🍞' },
  { id: 'milk', emoji: '🥛' },
  { id: 'flower', emoji: '🌼' },
  { id: 'cookie', emoji: '🍪' },
]

const heartSpots = [
  { left: '18%', top: '24%', rotate: '-12deg' },
  { left: '71%', top: '22%', rotate: '13deg' },
  { left: '48%', top: '43%', rotate: '-4deg' },
  { left: '23%', top: '64%', rotate: '9deg' },
  { left: '77%', top: '67%', rotate: '-15deg' },
]

const balloons = [
  { left: '13%', top: '30%', color: 'pink', emoji: '🎈' },
  { left: '30%', top: '17%', color: 'yellow', emoji: '🎈' },
  { left: '48%', top: '30%', color: 'blue', emoji: '🎈' },
  { left: '67%', top: '14%', color: 'green', emoji: '🎈' },
  { left: '82%', top: '34%', color: 'pink', emoji: '🎈' },
  { left: '24%', top: '55%', color: 'blue', emoji: '🎈' },
  { left: '58%', top: '59%', color: 'yellow', emoji: '🎈' },
  { left: '76%', top: '65%', color: 'green', emoji: '🎈' },
]

const pinSpots = [
  { left: '17%', top: '47%', rotate: '-9deg' },
  { left: '36%', top: '33%', rotate: '4deg' },
  { left: '56%', top: '41%', rotate: '-4deg' },
  { left: '76%', top: '31%', rotate: '8deg' },
  { left: '66%', top: '68%', rotate: '-7deg' },
]

function App() {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [actIndex, setActIndex] = useState(0)
  const [hearts, setHearts] = useState<number[]>([])
  const [marketCollected, setMarketCollected] = useState<number[]>([])
  const [poppedBalloons, setPoppedBalloons] = useState<number[]>([])
  const [downPins, setDownPins] = useState<number[]>([])
  const [puzzleOrder, setPuzzleOrder] = useState([2, 0, 3, 1])
  const [selectedPuzzle, setSelectedPuzzle] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [muted, setMuted] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)
  const audioRef = useRef<GameAudio | null>(null)

  useEffect(() => {
    audioRef.current = new GameAudio()
    return () => audioRef.current?.destroy()
  }, [])

  const play = (name: Parameters<GameAudio['play']>[0]) => audioRef.current?.play(name)

  const speak = (text: string) => {
    if (muted || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const voice = new SpeechSynthesisUtterance(text)
    voice.lang = 'tr-TR'
    voice.rate = 0.87
    voice.pitch = 1.12
    window.speechSynthesis.speak(voice)
  }

  const activeAct = acts[actIndex]
  const activePerson = family.find((person) => person.id === activeAct.personId) ?? family[0]
  const isActComplete = activeAct.id === 'sevil'
    ? hearts.length === heartSpots.length
    : activeAct.id === 'ahmet'
      ? marketCollected.length === marketItems.length
      : activeAct.id === 'mesut'
        ? poppedBalloons.length === balloons.length
        : activeAct.id === 'zafer'
          ? downPins.length === pinSpots.length
          : puzzleOrder.every((piece, index) => piece === index)

  const resetAct = () => {
    setHearts([])
    setMarketCollected([])
    setPoppedBalloons([])
    setDownPins([])
    setPuzzleOrder([2, 0, 3, 1])
    setSelectedPuzzle(null)
    setFeedback('')
  }

  const startShow = () => {
    audioRef.current?.start()
    speak('Merhaba Semra! Aile sirki başlıyor. Parlayan şeylere dokun!')
    setScreen('show')
  }

  const readAct = () => speak(activeAct.voice)

  const toggleSound = () => {
    const next = !muted
    setMuted(next)
    audioRef.current?.setMuted(next)
    if (next && 'speechSynthesis' in window) window.speechSynthesis.cancel()
  }

  const advance = () => {
    if (!isActComplete) return
    play('level')
    if (actIndex === acts.length - 1) {
      speak('Yaşasın! Semra ve ailesi büyük fotoğrafı tamamladı!')
      setScreen('final')
      return
    }
    const nextAct = actIndex + 1
    setActIndex(nextAct)
    resetAct()
    speak(acts[nextAct].voice)
  }

  const tapHeart = (index: number) => {
    if (hearts.includes(index)) return
    const next = [...hearts, index]
    setHearts(next)
    play('collect')
    if (next.length === heartSpots.length) {
      setFeedback('Bütün kalpler bulundu!')
      speak('Harika! Bütün kalpleri buldun.')
    }
  }

  const tapMarketItem = (index: number) => {
    if (marketCollected.includes(index)) return
    const next = [...marketCollected, index]
    setMarketCollected(next)
    play('collect')
    if (next.length === marketItems.length) {
      setFeedback('Sepet hazır!')
      speak('Sepet hazır! Baba Ahmet çok mutlu.')
    } else {
      speak('Sepete koydun! Bir ürün daha bul.')
    }
  }

  const popBalloon = (index: number) => {
    if (poppedBalloons.includes(index)) return
    const next = [...poppedBalloons, index]
    setPoppedBalloons(next)
    play('collect')
    if (next.length === balloons.length) {
      setFeedback('Balon yağmuru bitti!')
      speak('Pat pat! Bütün balonları patlattın.')
    }
  }

  const knockPin = (index: number) => {
    if (downPins.includes(index)) return
    const next = [...downPins, index]
    setDownPins(next)
    play('hit')
    if (next.length === pinSpots.length) {
      setFeedback('Strike! Bütün pinler devrildi!')
      speak('Strike! Zafer Abi ile bütün pinleri devirdin.')
    }
  }

  const tapPuzzlePiece = (slot: number) => {
    if (selectedPuzzle === null) {
      setSelectedPuzzle(slot)
      play('memory')
      speak('Şimdi başka bir parçaya dokun.')
      return
    }
    if (selectedPuzzle === slot) {
      setSelectedPuzzle(null)
      return
    }
    const next = [...puzzleOrder]
    ;[next[selectedPuzzle], next[slot]] = [next[slot], next[selectedPuzzle]]
    setPuzzleOrder(next)
    setSelectedPuzzle(null)
    play('memory')
    if (next.every((piece, index) => piece === index)) {
      setFeedback('Fotoğraf tamamlandı!')
      speak('Aile fotoğrafı tamamlandı! Çok güzel.')
    } else {
      speak('Parçalar yer değiştirdi. Fotoğrafa bakmaya devam et.')
    }
  }

  const renderToy = () => {
    if (activeAct.id === 'sevil') {
      return <div className="toy-area heart-hunt">{heartSpots.map((spot, index) => <button className={`heart-spot ${hearts.includes(index) ? 'found' : ''}`} key={index} style={{ left: spot.left, top: spot.top, transform: `rotate(${spot.rotate})` }} onClick={() => tapHeart(index)} aria-label="Kalp" disabled={hearts.includes(index)}>♥</button>)}<div className="toy-hint-icon">💗</div><div className="toy-count">{hearts.length} / {heartSpots.length}</div></div>
    }
    if (activeAct.id === 'ahmet') {
      return <div className="toy-area market-toy"><div className="toy-count">{marketCollected.length} / {marketItems.length}</div><div className="market-items">{marketItems.map((item, index) => <button className={`market-toy-item ${marketCollected.includes(index) ? 'collected' : ''}`} key={item.id} onClick={() => tapMarketItem(index)} aria-label="Ürün"><span>{item.emoji}</span>{marketCollected.includes(index) && <b>✓</b>}</button>)}</div><div className="toy-basket">🛒<span>{marketCollected.length === marketItems.length ? 'DOLU!' : 'Sepet'}</span></div></div>
    }
    if (activeAct.id === 'mesut') {
      return <div className="toy-area balloon-toy"><div className="toy-count">{poppedBalloons.length} / {balloons.length}</div>{balloons.map((balloon, index) => <button className={`balloon balloon-${balloon.color} ${poppedBalloons.includes(index) ? 'popped' : ''}`} key={index} style={{ left: balloon.left, top: balloon.top }} onClick={() => popBalloon(index)} aria-label="Balon">{poppedBalloons.includes(index) ? '✨' : balloon.emoji}</button>)}</div>
    }
    if (activeAct.id === 'zafer') {
      return <div className="toy-area bowling-toy"><div className="lane-arrow">➜</div><div className="toy-count">{downPins.length} / {pinSpots.length}</div><div className="bowling-ball">🎳</div>{pinSpots.map((spot, index) => <button className={`bowling-pin ${downPins.includes(index) ? 'down' : ''}`} key={index} style={{ left: spot.left, top: spot.top, transform: `rotate(${spot.rotate})` }} onClick={() => knockPin(index)} aria-label="Bowling pini"><span>⚪</span></button>)}</div>
    }
    return <div className="toy-area puzzle-toy"><div className="toy-count">{puzzleOrder.every((piece, index) => piece === index) ? '✓' : '2 parçaya dokun'}</div><div className="puzzle-frame">{puzzleOrder.map((piece, slot) => <button className={`puzzle-piece piece-${piece} ${selectedPuzzle === slot ? 'selected' : ''}`} key={slot} onClick={() => tapPuzzlePiece(slot)} aria-label="Fotoğraf parçası" />)}</div></div>
  }

  if (screen === 'welcome') {
    return <div className="new-game-shell welcome-screen"><header className="circus-header"><div className="circus-logo"><span>★</span><b>SEMRA’NIN</b><strong>AİLE SİRKİ</strong></div><div className="header-lights">● ● ● ● ●</div></header><main className="welcome-main"><div className="welcome-copy"><span className="ticket-label">TEK BİLET · 5 BÜYÜK SAHNE</span><h1>Şimdi sahne <em>Semra’nın!</em></h1><p>Ailenin bütün yıldızları gösteriye hazır. Parlayan şeylere dokun, oyunları keşfet ve final fotoğrafını birlikte tamamla.</p><button className="show-button" onClick={startShow}>Gösteriyi başlat <span>▶</span></button><div className="welcome-note">🔊 Oyun ne yapacağını sana sesli söyler.</div></div><div className="welcome-stage"><div className="curtain curtain-left" /><div className="curtain curtain-right" /><div className="stage-sign">BÜYÜK<br /><b>GÖSTERİ</b></div><div className="welcome-lineup">{family.map((person) => <div className="welcome-person" key={person.id}><img src={person.image} alt={person.name} /><span>{person.name}</span></div>)}</div><div className="welcome-hero"><div className="runner-sprite" /><b>SEMRA</b></div><div className="stage-footlights">● ● ● ● ● ● ●</div></div></main></div>
  }

  if (screen === 'show') {
    return <div className="new-game-shell show-screen" style={{ '--act-color': activeAct.color } as CSSProperties}><header className="show-header"><button className="show-logo" onClick={() => setScreen('welcome')}>★ <span>SEMRA’NIN AİLE SİRKİ</span></button><div className="act-dots">{acts.map((act, index) => <span className={index === actIndex ? 'active' : index < actIndex ? 'done' : ''} key={act.id}>{index < actIndex ? '✓' : act.icon}</span>)}</div><button className="show-sound" onClick={toggleSound}>{muted ? '🔇' : '🔊'}</button></header><main className="show-main"><div className="act-title"><div><span className="act-number">SAHNE {actIndex + 1} / 5</span><h1>{activeAct.title}</h1></div><button className="listen-act" onClick={readAct}>🔊 Dinle</button></div><div className="show-layout"><section className={`circus-stage stage-${activeAct.id}`}><div className="stage-backdrop" /><div className="stage-banner">{activeAct.icon} {activeAct.title}</div><div className="stage-character"><img src={activePerson.image} alt={activePerson.name} /><strong>{activePerson.name}</strong><span>{activePerson.role}</span></div><div className="stage-speech"><b>{activePerson.name}</b><span>{activeAct.voice}</span></div><div className="stage-semra"><div className="runner-sprite" /><b>Semra</b></div>{renderToy()}<div className="stage-floor" /></section><aside className="show-console"><div className="console-family">{family.map((person) => <div className={`console-person ${person.id === activePerson.id ? 'active' : ''}`} key={person.id}><img src={person.image} alt={person.name} /><span>{person.name.replace('Büyük ', '')}</span></div>)}</div><div className="console-message"><span className="console-icon">{activeAct.icon}</span><p><b>Bak ve dokun!</b><br />Oyunun sesini dinle, sonra sahnedeki büyük simgelere dokun.</p></div>{feedback && <div className="show-feedback">✨ {feedback}</div>}<button className="next-button" disabled={!isActComplete} onClick={advance}>{isActComplete ? actIndex === acts.length - 1 ? 'Final fotoğrafına git' : 'Sonraki sahne' : 'Sahnede oyna'} <span>→</span></button><div className="progress-bar"><span style={{ width: `${((actIndex + (isActComplete ? 1 : 0)) / acts.length) * 100}%` }} /></div></aside></div></main></div>
  }

  return <div className="new-game-shell final-screen" style={{ '--act-color': '#f3c65c' } as CSSProperties}><header className="show-header"><div className="show-logo">★ <span>SEMRA’NIN AİLE SİRKİ</span></div><button className="show-sound" onClick={toggleSound}>{muted ? '🔇' : '🔊'}</button></header><main className="final-main"><span className="ticket-label">BÜYÜK FİNAL</span><h1>Semra’nın aile gösterisi <em>harikaydı!</em></h1><p>Bütün sahneleri tamamladın. Şimdi aile fotoğrafınızı açabilirsin.</p><div className="final-lineup">{family.map((person) => <div className="final-person" key={person.id}><img src={person.image} alt={person.name} /><b>{person.name}</b></div>)}<div className="final-semra"><div className="runner-sprite" /><b>Semra</b></div></div><button className="show-button" onClick={() => setPhotoOpen(true)}>Aile fotoğrafını aç <span>📸</span></button><button className="restart-button" onClick={() => { resetAct(); setActIndex(0); setScreen('welcome') }}>Baştan oyna</button>{photoOpen && <div className="photo-modal" onClick={() => setPhotoOpen(false)}><div className="photo-card" onClick={(event) => event.stopPropagation()}><button className="close-photo" onClick={() => setPhotoOpen(false)}>×</button><span className="ticket-label">AİLE ALBÜMÜ</span><h2>Birlikte her gün gösteri!</h2><img src="/images/family-memory.jpg" alt="Aile hatırası" /><p>Bu hatıra yalnızca aile oyununun içinde, sevgiyle kullanılıyor.</p></div></div>}</main></div>
}

export default App
