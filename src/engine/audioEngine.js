(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AudioEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let audioCtx = null;
  let isMuted = false;
  let masterVolume = 0.8;
  let bgmVolume = 0.6;
  let sfxVolume = 0.8;

  let currentBgmTrack = null;
  let currentBgmName = null;

  function getAudioContext() {
    if (!audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  // Howler asset map with correct uppercase /Audio/ path
  const HOWLER_TRACKS = {};

  function initHowler() {
    if (typeof Howl === 'undefined') return;

    try {
      HOWLER_TRACKS.map = new Howl({
        src: ['./Audio/map.wav', './audio/map.wav'],
        html5: true,
        loop: true,
        volume: masterVolume * bgmVolume
      });

      HOWLER_TRACKS.battle = new Howl({
        src: ['./Audio/battle.mp3', './audio/battle.mp3'],
        html5: true,
        loop: true,
        volume: masterVolume * bgmVolume
      });

      HOWLER_TRACKS.initBattle = new Howl({
        src: ['./Audio/initBattle.wav', './audio/initBattle.wav'],
        html5: true,
        volume: masterVolume * sfxVolume
      });

      HOWLER_TRACKS.initFireball = new Howl({
        src: ['./Audio/initFireball.wav', './audio/initFireball.wav'],
        html5: true,
        volume: masterVolume * sfxVolume
      });

      HOWLER_TRACKS.fireballHit = new Howl({
        src: ['./Audio/fireballHit.wav', './audio/fireballHit.wav'],
        html5: true,
        volume: masterVolume * sfxVolume
      });

      HOWLER_TRACKS.tackleHit = new Howl({
        src: ['./Audio/tackleHit.wav', './audio/tackleHit.wav'],
        html5: true,
        volume: masterVolume * sfxVolume
      });

      HOWLER_TRACKS.victory = new Howl({
        src: ['./Audio/victory.wav', './audio/victory.wav'],
        html5: true,
        volume: masterVolume * bgmVolume
      });
    } catch (e) {
      console.warn('Howler sound initialization notice:', e);
    }
  }

  // --- Synthetic 8-bit Sound Generator (Web Audio API) ---
  function playSynth(type) {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const effectiveVol = masterVolume * sfxVolume;
    const now = ctx.currentTime;

    try {
      if (type === 'select') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1320, now + 0.04);
        gain.gain.setValueAtTime(0.15 * effectiveVol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'cancel') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(220, now + 0.04);
        gain.gain.setValueAtTime(0.15 * effectiveVol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'hit' || type === 'tackleHit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        gain.gain.setValueAtTime(0.3 * effectiveVol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'superEffective') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.setValueAtTime(520, now + 0.06);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);
        gain.gain.setValueAtTime(0.35 * effectiveVol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'ballThrow') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
        gain.gain.setValueAtTime(0.2 * effectiveVol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === 'ballShake') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.25 * effectiveVol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'ballCatch') {
        // 4-note victory arpeggio: C5 -> E5 -> G5 -> C6
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + idx * 0.12;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteStart);
          gain.gain.setValueAtTime(0.25 * effectiveVol, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + 0.2);
        });
      } else if (type === 'levelUp') {
        // Triumphant 5-note fanfare
        const notes = [440, 554.37, 659.25, 880, 1108.73];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + idx * 0.1;
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, noteStart);
          gain.gain.setValueAtTime(0.2 * effectiveVol, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + 0.25);
        });
      } else if (type === 'heal') {
        // Pokémon Center healing melody
        const notes = [659.25, 783.99, 987.77, 1318.51, 987.77, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + idx * 0.14;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteStart);
          gain.gain.setValueAtTime(0.2 * effectiveVol, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + 0.2);
        });
      } else if (type === 'faint') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.35);
        gain.gain.setValueAtTime(0.25 * effectiveVol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'coins') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(987.77, now);
        osc2.frequency.setValueAtTime(1318.51, now + 0.06);
        gain.gain.setValueAtTime(0.2 * effectiveVol, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.1);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.2);
      }
    } catch (e) {
      console.warn('Synth playback notice:', e);
    }
  }

  function playBgm(name) {
    if (currentBgmName === name && currentBgmTrack && currentBgmTrack.playing && currentBgmTrack.playing()) {
      return;
    }
    stopBgm();
    currentBgmName = name;

    const track = HOWLER_TRACKS[name];
    if (track) {
      currentBgmTrack = track;
      track.volume(isMuted ? 0 : masterVolume * bgmVolume);
      track.play();
    }
  }

  function stopBgm() {
    if (currentBgmTrack) {
      try { currentBgmTrack.stop(); } catch (e) {}
      currentBgmTrack = null;
    }
    currentBgmName = null;
  }

  function playSfx(name) {
    if (isMuted) return;

    // Check if Howler track exists
    const track = HOWLER_TRACKS[name];
    if (track) {
      try {
        track.volume(masterVolume * sfxVolume);
        track.play();
        return;
      } catch (e) {}
    }

    // Fall back to synthetic audio
    playSynth(name);
  }

  function setMasterVolume(vol) {
    masterVolume = Math.max(0, Math.min(1, vol));
    updateVolumes();
  }

  function setBgmVolume(vol) {
    bgmVolume = Math.max(0, Math.min(1, vol));
    updateVolumes();
  }

  function setSfxVolume(vol) {
    sfxVolume = Math.max(0, Math.min(1, vol));
    updateVolumes();
  }

  function setMuted(muted) {
    isMuted = !!muted;
    updateVolumes();
  }

  function updateVolumes() {
    const effectiveBgm = isMuted ? 0 : masterVolume * bgmVolume;
    const effectiveSfx = isMuted ? 0 : masterVolume * sfxVolume;

    if (currentBgmTrack && currentBgmTrack.volume) {
      currentBgmTrack.volume(effectiveBgm);
    }

    Object.keys(HOWLER_TRACKS).forEach(key => {
      if (key === 'map' || key === 'battle' || key === 'victory') {
        HOWLER_TRACKS[key].volume(effectiveBgm);
      } else {
        HOWLER_TRACKS[key].volume(effectiveSfx);
      }
    });
  }

  // Auto-init on load if window exists
  if (typeof window !== 'undefined') {
    initHowler();
    const unlockAudio = () => {
      getAudioContext();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });
  }

  return {
    initHowler,
    getAudioContext,
    playBgm,
    stopBgm,
    playSfx,
    playSynth,
    setMasterVolume,
    setBgmVolume,
    setSfxVolume,
    setMuted,
    isMuted: () => isMuted,
    getMasterVolume: () => masterVolume,
    getBgmVolume: () => bgmVolume,
    getSfxVolume: () => sfxVolume
  };
});
