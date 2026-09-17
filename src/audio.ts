type SoundName = 'start' | 'jump' | 'collect' | 'memory' | 'hit' | 'talk' | 'level' | 'victory'

const noteFrequencies: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392,
  A4: 440,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
}

export class GameAudio {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private musicTimer: number | undefined
  private musicStep = 0
  private started = false
  private muted = false

  start() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return
      this.context = new AudioContextClass()
      this.master = this.context.createGain()
      this.master.gain.value = this.muted ? 0 : 0.16
      this.master.connect(this.context.destination)
    }
    if (this.context.state === 'suspended') void this.context.resume()
    if (this.started) return
    this.started = true
    this.startMusic()
    this.play('start')
  }

  setMuted(muted: boolean) {
    this.muted = muted
    if (this.master && this.context) this.master.gain.setTargetAtTime(muted ? 0 : 0.16, this.context.currentTime, 0.04)
  }

  isMuted() { return this.muted }

  play(name: SoundName) {
    if (!this.context || !this.master || this.muted) return
    const now = this.context.currentTime
    if (name === 'start') {
      this.tone('C5', .13, 'sine', .13, now)
      this.tone('E5', .16, 'sine', .11, now + .1)
      this.tone('G5', .23, 'sine', .1, now + .2)
    } else if (name === 'jump') {
      this.tone(440, .12, 'triangle', .085, now)
      this.tone(660, .16, 'triangle', .06, now + .07)
    } else if (name === 'collect') {
      this.tone('C5', .08, 'sine', .11, now)
      this.tone('E5', .1, 'sine', .09, now + .06)
      this.tone('G5', .18, 'sine', .08, now + .12)
    } else if (name === 'memory') {
      this.tone('G4', .12, 'triangle', .09, now)
      this.tone('C5', .12, 'triangle', .09, now + .09)
      this.tone('E5', .26, 'sine', .11, now + .18)
    } else if (name === 'hit') {
      this.tone(180, .16, 'sawtooth', .08, now)
      this.tone(110, .2, 'triangle', .07, now + .08)
    } else if (name === 'talk') {
      this.tone('E5', .08, 'sine', .07, now)
      this.tone('G5', .1, 'sine', .06, now + .09)
    } else if (name === 'level') {
      this.tone('C5', .12, 'sine', .1, now)
      this.tone('E5', .12, 'sine', .09, now + .12)
      this.tone('G5', .12, 'sine', .09, now + .24)
      this.tone('C5', .3, 'triangle', .1, now + .36)
    } else if (name === 'victory') {
      const notes = ['C5', 'E5', 'G5', 'C5', 'G5', 'C5']
      notes.forEach((note, index) => this.tone(note, .22, 'sine', .1, now + index * .13))
      this.tone('C4', .65, 'triangle', .06, now)
    }
  }

  destroy() {
    if (this.musicTimer) window.clearInterval(this.musicTimer)
    this.musicTimer = undefined
    if (this.context) void this.context.close()
    this.context = null
    this.master = null
  }

  private startMusic() {
    if (this.musicTimer || !this.context) return
    const melody = ['C5', 'E5', 'G5', 'E5', 'D5', 'F5', 'A4', 'F5']
    const bass = ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'F4', 'G4']
    const playStep = () => {
      if (!this.context || !this.master || this.muted) return
      const now = this.context.currentTime
      this.tone(melody[this.musicStep % melody.length], .25, 'sine', .035, now)
      this.tone(bass[this.musicStep % bass.length], .34, 'triangle', .026, now)
      if (this.musicStep % 4 === 0) this.tone('G4', .22, 'sine', .018, now + .02)
      this.musicStep += 1
    }
    playStep()
    this.musicTimer = window.setInterval(playStep, 390)
  }

  private tone(note: string | number, duration: number, type: OscillatorType, volume: number, when: number) {
    if (!this.context || !this.master) return
    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()
    const frequency = typeof note === 'number' ? note : noteFrequencies[note]
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, when)
    gain.gain.setValueAtTime(.0001, when)
    gain.gain.linearRampToValueAtTime(volume, when + .018)
    gain.gain.exponentialRampToValueAtTime(.0001, when + duration)
    oscillator.connect(gain)
    gain.connect(this.master)
    oscillator.start(when)
    oscillator.stop(when + duration + .03)
  }
}
