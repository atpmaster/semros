import { useMemo, useState } from 'react'

type SpotId = 'garden' | 'kitchen' | 'living'

type Spot = {
  id: SpotId
  name: string
  emoji: string
  clue: string
  reward: string
  position: string
}

const spots: Spot[] = [
  {
    id: 'garden',
    name: 'Bahçe ipucu',
    emoji: '🌿',
    clue: 'Sarı çiçeğin yanında parlayan üç küçük yıldız var. Semra, en sevdiği oyunu hatırlıyor.',
    reward: 'Neşe yaprağı',
    position: 'hotspot-garden',
  },
  {
    id: 'kitchen',
    name: 'Mutfak kokusu',
    emoji: '🍰',
    clue: 'Fırından gelen tarçın kokusu, herkesin bir araya geldiği o güzel günü gösteriyor.',
    reward: 'Tarçın yıldızı',
    position: 'hotspot-kitchen',
  },
  {
    id: 'living',
    name: 'Salon sandığı',
    emoji: '🧸',
    clue: 'Sandığın kapağında beş renkli iz var. Her biri aileden birinin neşesini taşıyor.',
    reward: 'Aile ışığı',
    position: 'hotspot-living',
  },
]

const family = [
  { name: 'Ahmet', role: 'Baba', emoji: '🧔🏻‍♂️', color: 'coral', note: 'Macera kaptanı', portrait: 'family-memory', photoClass: 'photo-ahmet' },
  { name: 'Sevil', role: 'Anne', emoji: '👩🏻‍🦱', color: 'rose', note: 'Sıcaklık ustası', portrait: 'family-portrait', photoClass: 'photo-sevil' },
  { name: 'Semra', role: 'Küçük kız', emoji: '👧🏻', color: 'sun', note: 'Ana kahraman', portrait: 'family-portrait', photoClass: 'photo-semra' },
  { name: 'Mesut', role: 'Abi', emoji: '🧑🏻‍🦱', color: 'mint', note: 'İpucu avcısı', portrait: 'family-portrait', photoClass: 'photo-mesut' },
  { name: 'Zafer', role: 'Büyük abi', emoji: '🧑🏻‍🦰', color: 'blue', note: 'Neşe bekçisi', portrait: 'family-portrait', photoClass: 'photo-zafer' },
]

function App() {
  const [started, setStarted] = useState(false)
  const [activeSpot, setActiveSpot] = useState<SpotId>('garden')
  const [completed, setCompleted] = useState<SpotId[]>([])
  const [showPhoto, setShowPhoto] = useState(false)
  const [showHowTo, setShowHowTo] = useState(false)

  const active = spots.find((spot) => spot.id === activeSpot) ?? spots[0]
  const isFinished = completed.length === spots.length
  const nextSpot = useMemo(() => spots.find((spot) => !completed.includes(spot.id)), [completed])

  const startGame = () => {
    setStarted(true)
    document.getElementById('game')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const chooseSpot = (spot: Spot) => {
    setStarted(true)
    setActiveSpot(spot.id)
  }

  const collectClue = () => {
    if (!completed.includes(active.id)) {
      setCompleted((current) => [...current, active.id])
    }
    const next = spots.find((spot) => spot.id !== active.id && !completed.includes(spot.id))
    if (next) setActiveSpot(next.id)
  }

  return (
    <main className="app-shell">
      <nav className="topbar page-width" aria-label="Ana menü">
        <a className="brand" href="#top" aria-label="Semra ve Aile Işığı ana sayfa">
          <span className="brand-mark">S</span>
          <span>
            <strong>SEMRA'NIN</strong>
            <small>AİLE GÜNLÜĞÜ</small>
          </span>
        </a>
        <div className="topbar-actions">
          <span className="family-chip"><span className="live-dot" /> 5 karakter · 1 macera</span>
          <button className="icon-button" onClick={() => setShowHowTo(true)} aria-label="Nasıl oynanır?">?</button>
        </div>
      </nav>

      <section className="hero page-width" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span /> AİLE HİKÂYESİ · BÖLÜM 01</div>
          <h1>Semra ve<br /><em>Aile Işığı</em></h1>
          <p className="hero-lede">Bazen en büyük macera, aynı evin içindeki küçük neşeleri bulmaktır. Semra’nın peşine takıl, aile ışığını birlikte yakalım.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={startGame}>Oyuna başla <span>↗</span></button>
            <button className="text-button" onClick={() => setShowHowTo(true)}>Nasıl oynanır? <span>→</span></button>
          </div>
          <div className="hero-meta">
            <span><b>03</b> keşif noktası</span>
            <span><b>05</b> aile karakteri</span>
            <span><b>∞</b> kahkaha</span>
          </div>
        </div>

        <div className="hero-illustration" aria-label="Semra'nın evin önündeki çizim illüstrasyonu">
          <div className="sun-orb" />
          <div className="cloud cloud-one" />
          <div className="cloud cloud-two" />
          <div className="hero-spark spark-a">✦</div>
          <div className="hero-spark spark-b">✧</div>
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <div className="house">
            <div className="roof" />
            <div className="house-body"><div className="window window-left" /><div className="door" /><div className="window window-right" /></div>
            <div className="chimney" />
          </div>
          <div className="hero-character">
            <div className="character-shadow" />
            <div className="hero-head">👧🏻</div>
            <div className="hero-dress" />
            <div className="hero-bag">✦</div>
          </div>
          <div className="illustration-caption"><span className="caption-dot" /> Semra hazır!</div>
        </div>
      </section>

      <section className="story-strip page-width" aria-label="Hikâye özeti">
        <div className="story-icon">✦</div>
        <div><strong>Görev:</strong> Evde saklanan üç neşe parçasını bul ve aile ışığını yeniden yak.</div>
        <div className="story-rule" />
        <div className="story-note">Birlikte daha güzel</div>
      </section>

      <section className="game-section page-width" id="game">
        <div className="section-heading">
          <div><div className="eyebrow"><span /> OYUN ALANI</div><h2>Neşe haritası</h2></div>
          <div className="progress-summary"><span>{completed.length}</span> / 3 ipucu bulundu <div className="progress-track"><i style={{ width: `${(completed.length / 3) * 100}%` }} /></div></div>
        </div>

        <div className="game-layout">
          <div className="map-card">
            <div className="map-topline"><span className="map-label">SEMRA'NIN EVİ</span><span className="map-season">sıcak bir yaz günü · 2026</span></div>
            <div className="map-scene">
              <div className="map-sun">☼</div>
              <div className="map-cloud map-cloud-a" /><div className="map-cloud map-cloud-b" />
              <div className="map-hill map-hill-a" /><div className="map-hill map-hill-b" />
              <div className="map-house">
                <div className="map-roof" /><div className="map-house-body"><div className="map-window left" /><div className="map-door" /><div className="map-window right" /></div>
                <div className="map-flower flower-one">✿</div><div className="map-flower flower-two">✿</div>
              </div>
              <div className="map-tree"><span className="tree-top">♣</span><span className="tree-trunk" /></div>
              <div className="map-path" />
              <button className={`hotspot ${spots[0].position} ${activeSpot === 'garden' ? 'selected' : ''} ${completed.includes('garden') ? 'found' : ''}`} onClick={() => chooseSpot(spots[0])} aria-label="Bahçe ipucunu seç">
                <span>{completed.includes('garden') ? '✓' : spots[0].emoji}</span><b>Bahçe</b><small>{completed.includes('garden') ? 'bulundu' : 'ipucu'}</small>
              </button>
              <button className={`hotspot ${spots[1].position} ${activeSpot === 'kitchen' ? 'selected' : ''} ${completed.includes('kitchen') ? 'found' : ''}`} onClick={() => chooseSpot(spots[1])} aria-label="Mutfak ipucunu seç">
                <span>{completed.includes('kitchen') ? '✓' : spots[1].emoji}</span><b>Mutfak</b><small>{completed.includes('kitchen') ? 'bulundu' : 'ipucu'}</small>
              </button>
              <button className={`hotspot ${spots[2].position} ${activeSpot === 'living' ? 'selected' : ''} ${completed.includes('living') ? 'found' : ''}`} onClick={() => chooseSpot(spots[2])} aria-label="Salon ipucunu seç">
                <span>{completed.includes('living') ? '✓' : spots[2].emoji}</span><b>Salon</b><small>{completed.includes('living') ? 'bulundu' : 'ipucu'}</small>
              </button>
              <div className="map-character semra-marker"><span className="map-photo photo-semra" /><small>Semra</small></div>
              <div className="map-character family-marker"><span className="map-photo photo-ahmet" /><small>Ahmet</small></div>
            </div>
            <div className="map-footer"><span><i className="legend-dot active-dot" /> seçili nokta</span><span><i className="legend-dot found-dot" /> bulunan hatıra</span><span className="map-tip">Noktaları keşfet →</span></div>
          </div>

          <aside className="mission-panel">
            <div className="mission-kicker"><span className="pulse-dot" /> {started ? 'MACERA DEVAM EDİYOR' : 'SEMRA SENİ BEKLİYOR'}</div>
            <h3>{isFinished ? 'Aile ışığı yandı!' : active.name}</h3>
            <p className="mission-copy">{isFinished ? 'Üç neşe parçası bir araya geldi. Bu ışık, birlikte geçirilen her güzel günü hatırlatıyor.' : active.clue}</p>
            <div className="mission-reward"><span className="reward-icon">{isFinished ? '✨' : active.emoji}</span><div><small>BU NOKTADAN KAZAN</small><strong>{isFinished ? 'Kocaman bir aile gülümsemesi' : active.reward}</strong></div></div>
            {!isFinished && <button className="collect-button" onClick={collectClue}>{completed.includes(active.id) ? 'Bulundu ✓' : 'Hatırayı topla'} <span>→</span></button>}
            {isFinished && <button className="collect-button photo-button" onClick={() => setShowPhoto(true)}>Aile hatırasını aç <span>↗</span></button>}
            <div className="mission-quote"><span>“</span><div>Her küçük ipucu, bizi birbirimize biraz daha yaklaştırır.</div><small>— Semra’nın defteri</small></div>
          </aside>
        </div>
      </section>

      <section className="family-section page-width">
        <div className="section-heading compact-heading"><div><div className="eyebrow"><span /> OYUN EKİBİ</div><h2>Bizim aile</h2></div><span className="section-side-note">Herkesin ayrı bir süper gücü var.</span></div>
        <div className="family-grid">
          {family.map((member) => <article className={`family-card ${member.color} ${member.name === 'Semra' ? 'hero-member' : ''}`} key={member.name}>
            <div className="family-card-top"><span className={`family-avatar family-avatar-photo ${member.photoClass}`} role="img" aria-label={`${member.name} portresi`}><span className="portrait-fallback">{member.emoji}</span></span><span className="family-badge">{member.name === 'Semra' ? '★' : '♥'}</span></div>
            <strong>{member.name}</strong><span>{member.role}</span><small>{member.note}</small>
          </article>)}
        </div>
      </section>

      <section className="memory-section page-width">
        <div className="memory-copy"><div className="eyebrow"><span /> AİLE HATIRASI</div><h2>Gerçek bir günden,<br /><em>oyunun kalbine.</em></h2><p>Bu maceranın en güzel parçası, birlikte geçirilen gerçek anlardan geliyor. Fotoğraf; yalnızca bu oyun içindeki hatıra kartında, isim ve konum bilgisi olmadan kullanılıyor.</p><button className="outline-button" onClick={() => setShowPhoto(true)}>Hatırayı gör <span>↗</span></button></div>
        <button className="memory-photo" onClick={() => setShowPhoto(true)} aria-label="Aile hatırası fotoğrafını aç"><img src="/images/family-memory.jpg" alt="Ailenin birlikte kutlama yaptığı sıcak bir an" /><span className="photo-overlay"><i>✦</i> aile albümünden</span><span className="photo-corner">↗</span></button>
      </section>

      <footer className="footer page-width"><div className="footer-brand"><span className="brand-mark">S</span><span><strong>SEMRA'NIN</strong><small>AİLE GÜNLÜĞÜ</small></span></div><span>Birlikte yazılan küçük bir macera.</span><span className="footer-year">Bölüm 01 · Aile Işığı</span></footer>

      {showPhoto && <div className="modal-backdrop" role="presentation" onClick={() => setShowPhoto(false)}><div className="photo-modal" role="dialog" aria-modal="true" aria-label="Aile hatırası" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowPhoto(false)} aria-label="Kapat">×</button><img src="/images/family-memory.jpg" alt="Ailenin birlikte kutlama yaptığı sıcak bir an" /><div className="modal-copy"><div className="eyebrow"><span /> AİLE HATIRASI</div><h3>Birlikte olduğumuz anlar, en güzel hazinemiz.</h3><p>Bu fotoğraf, Semra’nın aile ışığına ilham veren gerçek bir hatıra.</p><small>Özel kullanım · Bu oyun için</small></div></div></div>}
      {showHowTo && <div className="modal-backdrop" role="presentation" onClick={() => setShowHowTo(false)}><div className="howto-modal" role="dialog" aria-modal="true" aria-label="Nasıl oynanır" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setShowHowTo(false)} aria-label="Kapat">×</button><div className="eyebrow"><span /> KÜÇÜK BİR REHBER</div><h3>Semra’nın peşinden git.</h3><p>Haritadaki üç noktayı keşfet, her birinden bir neşe parçası topla. Üçü birleşince aile ışığı yanacak ve gerçek aile hatırası açılacak.</p><div className="howto-steps"><div><b>01</b><span>Bir nokta seç</span></div><div><b>02</b><span>İpucunu oku</span></div><div><b>03</b><span>Hatırayı topla</span></div></div><button className="primary-button" onClick={() => { setShowHowTo(false); startGame() }}>Haritaya git <span>↗</span></button></div></div>}
    </main>
  )
}

export default App
