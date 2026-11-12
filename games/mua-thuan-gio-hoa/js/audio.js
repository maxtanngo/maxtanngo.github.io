// =========================================================================
// MƯA THUẬN GIÓ HOÀ - GENERATIVE SOUNDSCAPE, WEATHER AUDIO & MUSIC SANCTUARY
// 100% Safari (macOS/iOS) & Chrome Compatible Dual-Engine Audio Architecture:
// 1. Pure PCM AudioBuffer Loop + Live Note Synthesizer (Zero BiquadFilter NaN bugs, zero AudioParam ramps)
// 2. DOM-Mounted HTML5 <audio> 22.05kHz PCM WAV Engine (Instant user-gesture unlock on Safari)
// 3. Dynamic 7-Weather Soundscape Engine (Nắng ấm, Mưa rào, Gió, Giông bão, Tuyết rơi, Sương mù, Hoàng hôn)
// =========================================================================

class HealingAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.currentChannel = 'chill';
    this.currentWeather = 'sunny';
    this.musicVolume = 0.75;
    this.natureVolume = 0.60;

    this.masterGain = null;
    this.musicGain = null;
    this.natureGain = null;
    this.loopSourceNode = null;
    this._activeLoopBufferKey = '';

    this.loopTimer = null;
    this.weatherTimer = null;
    this.stepIndex = 0;
    this.weatherStepIndex = 0;
    this._unlockBound = false;
    this._lastUnlockTime = 0;

    // Caches for pre-baked PCM AudioBuffers & WAV Data URIs
    this.loopBufferCache = {};
    this.noteBufferCache = {};
    this.wavCache = {};
    this.htmlAudio = null;
    this._activeWavKey = '';

    const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
    this.usesSafariMusic = /Version\/[\d.]+.*Safari\//.test(userAgent)
      && !/Chromium|Chrome|CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);
    this.safariMusicRequest = null;

    this.channelOrder = [
      'chill', 'chill_lofi', 'chill_sunset',
      'gentle', 'gentle_waltz', 'gentle_lullaby',
      'water', 'water_rain', 'water_sea',
      'zen', 'zen_bamboo',
      'catholic', 'catholic_ave'
    ];

    this.channelTitles = {
      chill: '🎸 Chill 1: Acoustic Đồng Quê & Gió Thảo Nguyên',
      chill_lofi: '☕ Chill 2: Lofi Mưa Hiên Nhà & Đàn Guitar Ấm',
      chill_sunset: '🌇 Chill 3: Hoàng Hôn Bản Nhỏ (Dreamy Pad)',
      gentle: '🎹 Nhẹ Nhàng 1: Piano Sương Mai Tinh Khôi',
      gentle_waltz: '🍃 Nhẹ Nhàng 2: Bản Waltz Đồi Hoa (3/4 Êm Dịu)',
      gentle_lullaby: '🌙 Nhẹ Nhàng 3: Khúc Ru Đêm Trăng Thanh (Music Box)',
      water: '🏞️ Nước Chảy 1: Suối Đá Róc Rách & Sáo Trúc',
      water_rain: '🌧️ Nước Chảy 2: Mưa Rào Mái Hiên & Chuông Gió',
      water_sea: '🌊 Nước Chảy 3: Sóng Biển Rì Rào & Đàn Harp',
      zen: '🪷 Nhạc Thiền 1: Chuông Xoay Himalaya Tịnh Tâm 432Hz',
      zen_bamboo: '🎋 Nhạc Thiền 2: Rừng Trúc Tĩnh Lặng & Đàn Cổ Cầm',
      catholic: '⛪ Nhạc Công Giáo 1: Thánh Ca Organ & Chuông Chiều',
      catholic_ave: '🙏 Nhạc Công Giáo 2: Khúc Nguyện Cầu Ave Maria Dịu Êm'
    };

    this.weatherSoundProfiles = {
      sunny: {
        id: 'sunny',
        name: '🌤️ Nắng Ấm (Chim hót ban mai & Suối chảy dịu êm)',
        noiseGainMult: 0.45
      },
      rain: {
        id: 'rain',
        name: '🌧️ Mưa Rào (Tiếng mưa rơi mái hiên & Giọt nước lộp độp)',
        noiseGainMult: 0.82
      },
      wind: {
        id: 'wind',
        name: '🍃 Gió Thảo Nguyên (Tiếng gió thổi vi vu & Chuông gió tre)',
        noiseGainMult: 0.72
      },
      storm: {
        id: 'storm',
        name: '⛈️ Giông Bão (Tiếng mưa bão rào rạt, Gió lớn & Sấm rền)',
        noiseGainMult: 0.96
      },
      snow: {
        id: 'snow',
        name: '❄️ Tuyết Rơi (Gió đông tĩnh lặng & Chuông băng pha lê)',
        noiseGainMult: 0.42
      },
      mist: {
        id: 'mist',
        name: '🌫️ Sương Mù (Không gian tĩnh lặng & Giọt sương mai)',
        noiseGainMult: 0.40
      },
      sunset: {
        id: 'sunset',
        name: '🌇 Hoàng Hôn (Gió chiều êm ả & Thanh âm đồng nội)',
        noiseGainMult: 0.48
      }
    };

    this._bindSafariUnlock();
    this._prewarmDefaultAudio();
  }

  _prewarmDefaultAudio() {
    // Pre-build the initial WAV data URI so that on the very first click in Safari,
    // htmlAudio.play() executes at 0.0ms with zero CPU blocking!
    if (typeof window === 'undefined') return;
    if (this.usesSafariMusic) {
      const audio = this._prepareSafariMusic();
      audio.addEventListener('pause', () => this._syncAudioStatusUI());
      audio.addEventListener('error', () => this._syncAudioStatusUI());
      return;
    }
    const warm = () => {
      try {
        this._ensureDomAudioElement();
        const wavUri = this._getOrBuildChannelWav(this.currentChannel, this.currentWeather);
        if (this.htmlAudio && wavUri && !this._activeWavKey) {
          this._activeWavKey = `${this.currentChannel}__${this.currentWeather}`;
          this.htmlAudio.src = wavUri;
        }
      } catch (e) {}
    };
    if (typeof document !== 'undefined' && document.body) {
      warm();
    } else if (typeof window.addEventListener === 'function') {
      window.addEventListener('DOMContentLoaded', warm);
    }
  }

  _ensureDomAudioElement() {
    if (this.htmlAudio) return this.htmlAudio;
    if (typeof document !== 'undefined' && document.getElementById) {
      const existing = document.getElementById('safari-healing-audio');
      if (existing) {
        existing.loop = true;
        existing.playsInline = true;
        this.htmlAudio = existing;
        return this.htmlAudio;
      }
    }
    if (typeof document !== 'undefined' && document.createElement && document.body) {
      try {
        const el = document.createElement('audio');
        el.id = 'safari-healing-audio';
        el.loop = true;
        el.preload = 'auto';
        el.playsInline = true;
        if (el.setAttribute) {
          el.setAttribute('playsinline', 'true');
          el.setAttribute('webkit-playsinline', 'true');
        }
        if (el.style) el.style.display = 'none';
        if (document.body.appendChild) {
          document.body.appendChild(el);
        }
        this.htmlAudio = el;
        return this.htmlAudio;
      } catch (e) {}
    }
    if (typeof window !== 'undefined' && typeof window.Audio === 'function') {
      try {
        this.htmlAudio = new window.Audio();
        this.htmlAudio.loop = true;
      } catch (e) {}
    }
    return this.htmlAudio;
  }

  _bindSafariUnlock() {
    if (this.usesSafariMusic || this._unlockBound || typeof window === 'undefined') return;
    this._unlockBound = true;

    const unlockOnGesture = (e) => {
      // Never auto-unmute if the user is clicking the Mute/Unmute toggle button itself
      if (e && e.target && typeof e.target.closest === 'function' && e.target.closest('#btn-toggle-mute')) {
        return;
      }
      if (this.isMuted) return;
      const now = Date.now ? Date.now() : 0;
      if (now - this._lastUnlockTime < 50 && this.isAudible()) return;
      this._lastUnlockTime = now;

      this.isPlaying = true;

      // STEP 1 (CRITICAL FOR SAFARI): Unlock WebAudio & HTML5 <audio> synchronously at 0.0ms of gesture!
      this._initWebAudioImmediate();
      this._syncWebAudioGains();
      this._ensureHtmlAudioPlaying();
      this._ensureWebAudioLoopPlaying();

      if (!this.loopTimer) {
        this._startSequencer();
      }
      if (!this.weatherTimer) {
        this._startWeatherLoop();
      }
      this._syncAudioStatusUI();
    };

    // Only bind to Safari WebKit's true user-activation events (click, touchend, mouseup, keydown)
    // Never bind pointerdown/mousedown/touchstart which Safari rejects and which would poison _lastUnlockTime!
    const trustedEvents = ['click', 'touchend', 'mouseup', 'keydown'];
    trustedEvents.forEach((evt) => {
      window.addEventListener(evt, unlockOnGesture, true);
    });
  }

  isAudible() {
    if (this.usesSafariMusic) {
      return !this.isMuted && !!this.safariMusicRequest?.playing && !this.htmlAudio.paused;
    }
    const webAudioRunning = !!(this.ctx && this.ctx.state === 'running' && this.loopSourceNode);
    const htmlAudioRunning = !!(this.htmlAudio && !this.htmlAudio.paused);
    return !this.isMuted && (webAudioRunning || htmlAudioRunning);
  }

  _syncAudioStatusUI() {
    if (typeof document === 'undefined' || !document.getElementById) return;
    try {
      const muteBtn = document.getElementById('btn-toggle-mute');
      const safariNeedsPlay = this.usesSafariMusic && !this.isMuted && !this.isAudible();
      if (muteBtn) {
        muteBtn.textContent = safariNeedsPlay ? '🔊 Bật nhạc' : this.isMuted ? '🔇 Đang Tắt' : '🔊 Đang Bật';
        if (muteBtn.setAttribute) {
          muteBtn.setAttribute('aria-pressed', this.isMuted ? 'true' : 'false');
          muteBtn.setAttribute('data-muted', this.isMuted ? 'true' : 'false');
        }
        if (muteBtn.classList) {
          muteBtn.classList.toggle('is-muted', !!this.isMuted);
        }
      }
      const dotEl = document.getElementById('audio-live-dot');
      if (dotEl && dotEl.style) {
        dotEl.style.opacity = this.isMuted || safariNeedsPlay ? '0.2' : '1';
      }
    } catch (e) {}
  }

  _stopAllAudioImmediate() {
    if (this.masterGain) {
      try {
        this.masterGain.gain.value = 0;
        if (this.ctx && this.masterGain.gain.setValueAtTime) {
          this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime || 0);
        }
      } catch (e) {}
    }
    if (this.musicGain) {
      try { this.musicGain.gain.value = 0; } catch (e) {}
    }
    if (this.natureGain) {
      try { this.natureGain.gain.value = 0; } catch (e) {}
    }
    if (this.loopSourceNode) {
      try {
        if (this.loopSourceNode.stop) this.loopSourceNode.stop(0);
        if (this.loopSourceNode.disconnect) this.loopSourceNode.disconnect();
      } catch (e) {}
      this.loopSourceNode = null;
      this._activeLoopBufferKey = '';
    }
    if (this.htmlAudio) {
      if (this.usesSafariMusic) this.safariMusicRequest = null;
      try {
        this.htmlAudio.muted = true;
        this.htmlAudio.volume = 0;
        if (typeof this.htmlAudio.pause === 'function') {
          this.htmlAudio.pause();
        }
      } catch (e) {}
    }
  }

  init() {
    this.isPlaying = true;
    if (this.isMuted) {
      this._stopAllAudioImmediate();
      this._syncAudioStatusUI();
      return;
    }
    this._initWebAudioImmediate();
    this._syncWebAudioGains();
    this._ensureHtmlAudioPlaying();
    this._ensureWebAudioLoopPlaying();
    if (!this.loopTimer) {
      this._startSequencer();
    }
    if (!this.weatherTimer) {
      this._startWeatherLoop();
    }
    this._syncAudioStatusUI();
  }

  forcePlay() {
    this.isMuted = false;
    this.isPlaying = true;
    this._activeLoopBufferKey = '';
    if (this.usesSafariMusic) this._ensureSafariMusicPlaying();
    this._initWebAudioImmediate();
    this._syncWebAudioGains();
    this._ensureHtmlAudioPlaying();
    this._ensureWebAudioLoopPlaying(true);
    if (!this.loopTimer) {
      this._startSequencer();
    } else {
      this._playStep();
    }
    if (!this.weatherTimer) {
      this._startWeatherLoop();
    } else {
      this._playWeatherSignatureSfx(this.currentWeather);
    }
    this._syncAudioStatusUI();
    return this.channelTitles[this.currentChannel] || '';
  }

  start(channelId) {
    if (channelId && this.channelTitles[channelId]) {
      this.currentChannel = channelId;
    }
    return this.forcePlay();
  }

  _initWebAudioImmediate() {
    const AudioCtx = (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext);
    if (!AudioCtx) return;

    if (!this.ctx) {
      try {
        this.ctx = new AudioCtx();
      } catch (e) {
        return;
      }
    }

    if (!this.masterGain && this.ctx) {
      try {
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : 1.0;
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = this.isMuted ? 0 : Math.max(0.05, this.musicVolume * 0.9);
        this.musicGain.connect(this.masterGain);

        this.natureGain = this.ctx.createGain();
        this.natureGain.gain.value = this.isMuted ? 0 : Math.max(0.05, this.natureVolume * 0.75);
        this.natureGain.connect(this.masterGain);
      } catch (e) {}
    }

    // Immediately resume & fire a 1-sample silent buffer at the very top of the user gesture!
    if (!this.isMuted && this.ctx) {
      try {
        if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
          const rp = this.ctx.resume();
          if (rp && typeof rp.then === 'function') {
            rp.then(() => {
              if (!this.isMuted) {
                this._syncWebAudioGains();
                this._ensureWebAudioLoopPlaying(true);
                this._playStep();
              }
            }).catch(() => {});
          }
        }
      } catch (e) {}

      try {
        const sr = this.ctx.sampleRate || 22050;
        const silentBuf = this.ctx.createBuffer(1, 2, sr);
        const src = this.ctx.createBufferSource();
        src.buffer = silentBuf;
        src.connect(this.ctx.destination);
        if (src.start) src.start(0);
        else if (src.noteOn) src.noteOn(0);
      } catch (e) {}
    }
  }

  _syncWebAudioGains() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const wp = this.weatherSoundProfiles[this.currentWeather] || this.weatherSoundProfiles.sunny;
      const now = this.ctx.currentTime || 0;
      if (this.isMuted) {
        this.masterGain.gain.value = 0;
        if (this.masterGain.gain.setValueAtTime) this.masterGain.gain.setValueAtTime(0, now);
        if (this.musicGain) this.musicGain.gain.value = 0;
        if (this.natureGain) this.natureGain.gain.value = 0;
      } else {
        this.masterGain.gain.value = 1.0;
        if (this.masterGain.gain.setValueAtTime) this.masterGain.gain.setValueAtTime(1.0, now);
        if (this.musicGain) this.musicGain.gain.value = Math.max(0.04, this.musicVolume * 0.92);
        if (this.natureGain) this.natureGain.gain.value = Math.max(0.04, this.natureVolume * (wp.noiseGainMult || 0.58));
      }
    } catch (e) {}
  }

  // =========================================================================
  // CONTINUOUS WEB AUDIO LOOP BUFFER (100% SAFARI WEBKIT HARDWARE THREAD)
  // =========================================================================
  _ensureWebAudioLoopPlaying(forceRestart = false) {
    if (this.usesSafariMusic) return;
    if (!this.ctx || !this.masterGain || this.isMuted) {
      if (this.isMuted && this.loopSourceNode) {
        try {
          if (this.loopSourceNode.stop) this.loopSourceNode.stop(0);
          if (this.loopSourceNode.disconnect) this.loopSourceNode.disconnect();
        } catch (e) {}
        this.loopSourceNode = null;
        this._activeLoopBufferKey = '';
      }
      return;
    }

    const desiredKey = `${this.currentChannel}__${this.currentWeather}`;
    if (!forceRestart && this.loopSourceNode && this._activeLoopBufferKey === desiredKey) {
      return;
    }

    if (this.loopSourceNode) {
      try {
        if (this.loopSourceNode.stop) this.loopSourceNode.stop(0);
        if (this.loopSourceNode.disconnect) this.loopSourceNode.disconnect();
      } catch (e) {}
      this.loopSourceNode = null;
    }

    try {
      // Always create AudioBuffer at this.ctx.sampleRate (44100/48000 on Safari) so WebKit never rejects sampleRate!
      // Synthesize at half-rate and upsample 2x so synthesis takes <1.5ms without stalling the user gesture.
      const ctxSr = this.ctx.sampleRate || 44100;
      const synthRate = Math.max(11025, Math.floor(ctxSr / 2));
      const cacheKey = `${desiredKey}_${ctxSr}`;
      let audioBuf = this.loopBufferCache[cacheKey];

      if (!audioBuf) {
        const samples = this._synthesizeLoopSamples(this.currentChannel, this.currentWeather, synthRate, 4);
        const outLen = samples.length * 2;
        audioBuf = this.ctx.createBuffer(1, outLen, ctxSr);
        const chanData = audioBuf.getChannelData(0);
        for (let i = 0; i < samples.length; i++) {
          const s = samples[i];
          chanData[i * 2] = s;
          chanData[i * 2 + 1] = s;
        }
        if (Object.keys(this.loopBufferCache).length < 28) {
          this.loopBufferCache[cacheKey] = audioBuf;
        }
      }

      const src = this.ctx.createBufferSource();
      src.buffer = audioBuf;
      src.loop = true;
      src.connect(this.musicGain || this.masterGain);
      if (src.start) src.start(0);
      else if (src.noteOn) src.noteOn(0);

      this.loopSourceNode = src;
      this._activeLoopBufferKey = desiredKey;
    } catch (e) {}
  }

  // =========================================================================
  // SAFARI HTML5 <audio> WAV ENGINE (WORKS ON BOTH file:// AND http(s)://)
  // =========================================================================
  _prepareSafariMusic() {
    const audio = this._ensureDomAudioElement();
    const key = this.currentChannel + '__' + this.currentWeather;
    if (this._activeWavKey !== key) {
      this.safariMusicRequest = null;
      this._activeWavKey = key;
      audio.src = 'assets/audio/' + key + '.mp3?v=2';
    }
    return audio;
  }

  _ensureSafariMusicPlaying() {
    if (this.isMuted) return;
    const audio = this._prepareSafariMusic();
    audio.muted = false;
    audio.volume = Math.max(0, Math.min(1, this.musicVolume * 0.72 + this.natureVolume * 0.28));
    if (this.safariMusicRequest && (this.safariMusicRequest.pending || !audio.paused)) return;

    const request = { pending: true, playing: false };
    this.safariMusicRequest = request;
    audio.play().then(() => {
      if (this.safariMusicRequest !== request) return;
      request.pending = false;
      request.playing = true;
      this._syncAudioStatusUI();
    }, (error) => {
      if (this.safariMusicRequest !== request) return;
      this.safariMusicRequest = null;
      console.warn('Safari music playback:', error.name, error.message);
      this._syncAudioStatusUI();
    });
  }

  _ensureHtmlAudioPlaying() {
    if (this.usesSafariMusic) {
      this._ensureSafariMusicPlaying();
      return;
    }
    try {
      const audioEl = this._ensureDomAudioElement();
      if (!audioEl) return;

      if (this.isMuted) {
        audioEl.muted = true;
        audioEl.volume = 0;
        if (!audioEl.paused && typeof audioEl.pause === 'function') {
          audioEl.pause();
        }
        return;
      }

      const wavKey = `${this.currentChannel}__${this.currentWeather}`;
      const wavSrc = this._getOrBuildChannelWav(this.currentChannel, this.currentWeather);
      if (wavSrc && this._activeWavKey !== wavKey) {
        this._activeWavKey = wavKey;
        audioEl.src = wavSrc;
      }

      const combinedVol = Math.max(0.05, Math.min(1, this.musicVolume * 0.72 + this.natureVolume * 0.28));
      audioEl.muted = false;
      audioEl.volume = combinedVol;

      if (audioEl.paused && typeof audioEl.play === 'function') {
        const playPromise = audioEl.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      }
    } catch (e) {}
  }

  _synthesizeLoopSamples(channelId, weatherId, sampleRate, durationSec) {
    const numSamples = Math.floor(sampleRate * durationSec);
    const samples = new Float32Array(numSamples);

    const progressions = {
      chill: [
        { chord: [174.61, 220.0, 261.63, 329.63], mel: [392.0, 440.0, 523.25, 440.0] },
        { chord: [130.81, 196.0, 246.94, 329.63], mel: [523.25, 493.88, 392.0, 329.63] }
      ],
      chill_lofi: [
        { chord: [220.0, 261.63, 329.63, 392.0], mel: [523.25, 493.88, 440.0, 392.0] },
        { chord: [146.83, 220.0, 261.63, 349.23], mel: [440.0, 523.25, 587.33, 493.88] }
      ],
      chill_sunset: [
        { chord: [155.56, 196.0, 233.08, 293.66], mel: [466.16, 523.25, 587.33, 466.16] },
        { chord: [116.54, 174.61, 233.08, 293.66], mel: [587.33, 523.25, 466.16, 392.0] }
      ],
      gentle: [
        { chord: [196.0, 246.94, 293.66, 392.0], mel: [587.33, 659.25, 783.99, 659.25] },
        { chord: [130.81, 196.0, 261.63, 329.63], mel: [523.25, 587.33, 659.25, 523.25] }
      ],
      gentle_waltz: [
        { chord: [174.61, 261.63, 349.23, 440.0], mel: [523.25, 659.25, 587.33, 523.25] },
        { chord: [130.81, 261.63, 329.63, 392.0], mel: [587.33, 523.25, 493.88, 523.25] }
      ],
      gentle_lullaby: [
        { chord: [261.63, 329.63, 392.0, 523.25], mel: [659.25, 783.99, 880.0, 783.99] },
        { chord: [220.0, 261.63, 329.63, 440.0], mel: [523.25, 659.25, 587.33, 523.25] }
      ],
      water: [
        { chord: [196.0, 293.66, 392.0, 440.0], mel: [587.33, 659.25, 783.99, 880.0] },
        { chord: [146.83, 220.0, 293.66, 440.0], mel: [659.25, 587.33, 523.25, 440.0] }
      ],
      water_rain: [
        { chord: [174.61, 261.63, 329.63, 392.0], mel: [783.99, 880.0, 1046.5, 880.0] },
        { chord: [146.83, 220.0, 261.63, 349.23], mel: [659.25, 783.99, 880.0, 659.25] }
      ],
      water_sea: [
        { chord: [196.0, 246.94, 293.66, 369.99], mel: [493.88, 587.33, 659.25, 493.88] },
        { chord: [174.61, 220.0, 261.63, 349.23], mel: [440.0, 523.25, 587.33, 440.0] }
      ],
      zen: [
        { chord: [216.0, 324.0, 432.0, 648.0], mel: [432.0, 648.0, 864.0, 432.0] },
        { chord: [144.0, 216.0, 288.0, 432.0], mel: [576.0, 432.0, 648.0, 432.0] }
      ],
      zen_bamboo: [
        { chord: [146.83, 220.0, 293.66, 440.0], mel: [440.0, 523.25, 659.25, 587.33] },
        { chord: [164.81, 246.94, 329.63, 493.88], mel: [587.33, 493.88, 440.0, 329.63] }
      ],
      catholic: [
        { chord: [130.81, 196.0, 261.63, 329.63], mel: [523.25, 493.88, 440.0, 392.0] },
        { chord: [174.61, 220.0, 261.63, 349.23], mel: [440.0, 523.25, 587.33, 523.25] }
      ],
      catholic_ave: [
        { chord: [130.81, 196.0, 261.63, 329.63], mel: [523.25, 587.33, 659.25, 523.25] },
        { chord: [146.83, 220.0, 293.66, 349.23], mel: [587.33, 659.25, 698.46, 659.25] }
      ]
    };

    const bars = progressions[channelId] || progressions.chill;
    let brownNoise = 0;
    let pinkNoise = 0;
    const halfDur = Math.max(1.0, durationSec * 0.5);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const barIdx = t < halfDur ? 0 : 1;
      const barTime = (t % halfDur) * (4.0 / halfDur);
      const bar = bars[barIdx];

      // 1. Warm harmonic pad chord
      const chordEnv = 0.3 + 0.7 * Math.sin((barTime / 4.0) * Math.PI);
      let sig = 0;
      for (let c = 0; c < bar.chord.length; c++) {
        const cf = bar.chord[c];
        sig += Math.sin(2 * Math.PI * cf * t) * 0.16 * chordEnv;
        sig += Math.sin(2 * Math.PI * (cf * 2) * t) * 0.055 * chordEnv;
      }

      // 2. Expressive plucked / piano melody note every 1.0s & arpeggio on 0.5s
      const noteIdx = Math.floor(barTime) % bar.mel.length;
      const noteLocalT = barTime % 1.0;
      const mf = bar.mel[noteIdx];
      const melEnv = Math.min(1, noteLocalT / 0.03) * Math.exp(-noteLocalT * 2.2);
      sig += (Math.sin(2 * Math.PI * mf * t) + 0.42 * Math.sin(2 * Math.PI * mf * 2 * t)) * 0.34 * melEnv;

      if (noteLocalT >= 0.5) {
        const subT = noteLocalT - 0.5;
        const arpFreq = bar.chord[(noteIdx + 1) % bar.chord.length] * 2;
        const arpEnv = Math.min(1, subT / 0.03) * Math.exp(-subT * 3.0);
        sig += Math.sin(2 * Math.PI * arpFreq * t) * 0.22 * arpEnv;
      }

      // 3. Weather-Specific Soundscape Layer baked directly into the loop
      const white = Math.random() * 2 - 1;
      brownNoise = (brownNoise + 0.04 * white) / 1.04;
      pinkNoise = (pinkNoise + 0.18 * white) / 1.18;

      if (weatherId === 'rain') {
        sig += pinkNoise * 0.18 + brownNoise * 0.14;
        const dropT = (t * 6.0) % 1.0;
        if (dropT < 0.08) {
          sig += Math.sin(2 * Math.PI * 1150 * dropT) * Math.exp(-dropT * 35) * 0.15;
        }
      } else if (weatherId === 'storm') {
        const gust = 0.65 + 0.35 * Math.sin(2 * Math.PI * 0.45 * t);
        sig += (pinkNoise * 0.24 + brownNoise * 0.28) * gust;
        if (t > 0.8 && t < 2.6) {
          const thT = t - 0.8;
          const thEnv = Math.min(1, thT / 0.15) * Math.exp(-thT * 1.4);
          sig += (Math.sin(2 * Math.PI * 52 * t) + Math.sin(2 * Math.PI * 78 * t) + brownNoise * 1.2) * 0.28 * thEnv;
        }
      } else if (weatherId === 'wind') {
        const breeze = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.32 * t);
        sig += brownNoise * 0.26 * breeze;
        const chimeT = (t * 2.0) % 1.0;
        const chimeFreqs = [1046.5, 1174.66, 1318.51, 1567.98];
        const cfChime = chimeFreqs[Math.floor(t * 2.0) % chimeFreqs.length];
        sig += Math.sin(2 * Math.PI * cfChime * t) * Math.exp(-chimeT * 6.0) * 0.12;
      } else if (weatherId === 'snow') {
        const snowBreeze = 0.4 + 0.4 * Math.sin(2 * Math.PI * 0.2 * t);
        sig += brownNoise * 0.12 * snowBreeze;
        const bellT = (t * 1.5) % 1.0;
        const snowNotes = [1318.51, 1567.98, 1975.53, 2093.0];
        const sf = snowNotes[Math.floor(t * 1.5) % snowNotes.length];
        sig += Math.sin(2 * Math.PI * sf * t) * Math.exp(-bellT * 5.0) * 0.13;
      } else if (weatherId === 'sunny') {
        sig += brownNoise * 0.10;
        const birdT = (t % 2.0) - 0.5;
        if (birdT >= 0 && birdT < 0.35) {
          const chirpFreq = 1760 + Math.sin(birdT * 45) * 320;
          sig += Math.sin(2 * Math.PI * chirpFreq * birdT) * Math.exp(-birdT * 7) * 0.15;
        }
      } else {
        sig += brownNoise * 0.12;
      }

      let loopFade = 1.0;
      if (t < 0.08) loopFade = t / 0.08;
      else if (t > durationSec - 0.08) loopFade = (durationSec - t) / 0.08;

      samples[i] = Math.max(-0.96, Math.min(0.96, sig * loopFade));
    }

    return samples;
  }

  _encodePcmToWavBuffer(samples, sampleRate) {
    const numSamples = samples.length;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeStr = (offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
    return buffer;
  }

  _getOrBuildChannelWavUrl(channelId, weatherId = 'sunny') {
    const cacheKey = `${channelId || 'chill'}__${weatherId || 'sunny'}`;
    if (!this.wavBlobUrlCache) this.wavBlobUrlCache = {};
    if (this.wavBlobUrlCache[cacheKey]) return this.wavBlobUrlCache[cacheKey];

    try {
      const sampleRate = 11025;
      const samples = this._synthesizeLoopSamples(channelId || 'chill', weatherId || 'sunny', sampleRate, 4);
      const wavBuffer = this._encodePcmToWavBuffer(samples, sampleRate);

      if (typeof Blob === 'function' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        const blobUrl = URL.createObjectURL(blob);
        this.wavBlobUrlCache[cacheKey] = blobUrl;
        return blobUrl;
      }

      const dataUri = this._encodeWavBufferToDataUri(wavBuffer);
      this.wavBlobUrlCache[cacheKey] = dataUri;
      this.wavCache[cacheKey] = dataUri;
      return dataUri;
    } catch (e) {
      return this._getOrBuildChannelWav(channelId, weatherId);
    }
  }

  _getOrBuildChannelWav(channelId, weatherId = 'sunny') {
    const cacheKey = `${channelId || 'chill'}__${weatherId || 'sunny'}`;
    if (this.wavCache[cacheKey]) return this.wavCache[cacheKey];

    try {
      const sampleRate = 11025;
      const samples = this._synthesizeLoopSamples(channelId || 'chill', weatherId || 'sunny', sampleRate, 4);
      const wavUri = this._encodePcmToWavDataUri(samples, sampleRate);
      this.wavCache[cacheKey] = wavUri;
      return wavUri;
    } catch (e) {
      return '';
    }
  }

  _encodeWavBufferToDataUri(buffer) {
    const bytes = new Uint8Array(buffer);
    if (typeof btoa === 'function') {
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const slice = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
        for (let j = 0; j < slice.length; j++) {
          binary += String.fromCharCode(slice[j]);
        }
      }
      return 'data:audio/wav;base64,' + btoa(binary);
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let b64 = '';
    const len = bytes.length;
    for (let i = 0; i < len; i += 3) {
      const b0 = bytes[i];
      const b1 = i + 1 < len ? bytes[i + 1] : 0;
      const b2 = i + 2 < len ? bytes[i + 2] : 0;
      const triplet = (b0 << 16) | (b1 << 8) | b2;
      b64 += chars[(triplet >> 18) & 63];
      b64 += chars[(triplet >> 12) & 63];
      b64 += i + 1 < len ? chars[(triplet >> 6) & 63] : '=';
      b64 += i + 2 < len ? chars[triplet & 63] : '=';
    }
    return 'data:audio/wav;base64,' + b64;
  }

  _encodePcmToWavDataUri(samples, sampleRate) {
    const buffer = this._encodePcmToWavBuffer(samples, sampleRate);
    return this._encodeWavBufferToDataUri(buffer);
  }

  // =========================================================================
  // WEATHER SOUNDSCAPE SWITCHER (PHÁT ÂM THANH THEO THỜI TIẾT ĐÃ CHỌN)
  // =========================================================================
  setWeatherSound(weatherId) {
    if (!this.weatherSoundProfiles[weatherId]) {
      weatherId = 'sunny';
    }
    this.currentWeather = weatherId;
    this.weatherStepIndex = 0;

    this._initWebAudioImmediate();
    this._syncWebAudioGains();
    this._ensureHtmlAudioPlaying();
    this._ensureWebAudioLoopPlaying(true);
    this._restartWeatherLoop();

    if (!this.isMuted) {
      this._playWeatherSignatureSfx(weatherId);
    }
    this._syncAudioStatusUI();

    return this.weatherSoundProfiles[weatherId].name;
  }

  _restartWeatherLoop() {
    if (this.weatherTimer) clearInterval(this.weatherTimer);
    this._startWeatherLoop();
  }

  _startWeatherLoop() {
    if (this.weatherTimer) clearInterval(this.weatherTimer);
    this.weatherTimer = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      this._playWeatherSignatureSfx(this.currentWeather);
    }, 3400);
  }

  _playWeatherSignatureSfx(weatherId) {
    if (this.isMuted || !this.ctx) return;
    const wStep = this.weatherStepIndex++;

    if (weatherId === 'sunny') {
      const baseF = wStep % 2 === 0 ? 1680 : 1920;
      this._playBufferedNote(baseF, 'sine', 0.14, 0.18, 0, 'nature');
      this._playBufferedNote(baseF * 1.18, 'sine', 0.18, 0.20, 0.14, 'nature');
    } else if (weatherId === 'rain') {
      const rainDrops = [987.77, 1174.66, 1318.51, 1567.98];
      for (let i = 0; i < 3; i++) {
        const rf = rainDrops[(wStep + i) % rainDrops.length];
        this._playBufferedNote(rf, 'sine', 0.22, 0.16, i * 0.25, 'nature');
      }
    } else if (weatherId === 'wind') {
      const chimeScale = [783.99, 880.0, 1046.5, 1174.66, 1318.51];
      for (let i = 0; i < 3; i++) {
        const cf = chimeScale[(wStep * 2 + i) % chimeScale.length];
        this._playBufferedNote(cf, 'triangle', 0.65, 0.18, i * 0.18, 'nature');
      }
    } else if (weatherId === 'storm') {
      this._playThunderRumble();
    } else if (weatherId === 'snow') {
      const snowChimes = [1318.51, 1567.98, 1975.53, 2093.0];
      const f1 = snowChimes[wStep % snowChimes.length];
      const f2 = snowChimes[(wStep + 1) % snowChimes.length];
      this._playBufferedNote(f1, 'sine', 0.85, 0.17, 0, 'nature');
      this._playBufferedNote(f2, 'sine', 0.95, 0.15, 0.32, 'nature');
    } else if (weatherId === 'mist') {
      this._playBufferedNote(880.0, 'sine', 0.75, 0.16, 0, 'nature');
    } else if (weatherId === 'sunset') {
      this._playBufferedNote(659.25, 'triangle', 0.8, 0.16, 0, 'nature');
      this._playBufferedNote(987.77, 'sine', 0.8, 0.14, 0.28, 'nature');
    }
  }

  _playThunderRumble() {
    if (!this.ctx || this.isMuted) return;
    try {
      const sr = this.ctx.sampleRate || 22050;
      const dur = 1.8;
      const len = Math.floor(sr * dur);
      const buf = this.ctx.createBuffer(1, len, sr);
      const data = buf.getChannelData(0);
      let lowNoise = 0;
      for (let i = 0; i < len; i++) {
        const t = i / sr;
        const white = Math.random() * 2 - 1;
        lowNoise = (lowNoise + 0.05 * white) / 1.05;
        const env = Math.min(1, t / 0.12) * Math.exp(-t * 1.65);
        const rumble = Math.sin(2 * Math.PI * 48 * t) * 0.45 + Math.sin(2 * Math.PI * 72 * t) * 0.35 + lowNoise * 1.4;
        data[i] = Math.max(-0.9, Math.min(0.9, rumble * env * 0.48));
      }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.connect(this.natureGain || this.masterGain);
      if (src.start) src.start(0);
      else if (src.noteOn) src.noteOn(0);
    } catch (e) {}
  }

  setChannel(channelId) {
    if (!this.channelTitles[channelId]) channelId = 'chill';
    this.currentChannel = channelId;
    this.stepIndex = 0;
    this.isMuted = false;
    this.isPlaying = true;

    this._initWebAudioImmediate();
    this._syncWebAudioGains();
    this._ensureHtmlAudioPlaying();
    this._ensureWebAudioLoopPlaying(true);

    this._restartSequencer();
    this._syncAudioStatusUI();
    return this.channelTitles[channelId] || '';
  }

  nextChannel() {
    const idx = this.channelOrder.indexOf(this.currentChannel);
    const nextIdx = (idx + 1) % this.channelOrder.length;
    return this.setChannel(this.channelOrder[nextIdx]);
  }

  prevChannel() {
    const idx = this.channelOrder.indexOf(this.currentChannel);
    const prevIdx = (idx - 1 + this.channelOrder.length) % this.channelOrder.length;
    return this.setChannel(this.channelOrder[prevIdx]);
  }

  setMusicVolume(val0to100) {
    this.musicVolume = Math.max(0, Math.min(100, Number(val0to100) || 0)) / 100;
    this._syncWebAudioGains();
    if (this.htmlAudio && !this.isMuted) {
      this.htmlAudio.volume = Math.max(0, Math.min(1, this.musicVolume * 0.72 + this.natureVolume * 0.28));
    }
  }

  setNatureVolume(val0to100) {
    this.natureVolume = Math.max(0, Math.min(100, Number(val0to100) || 0)) / 100;
    this._syncWebAudioGains();
    if (this.htmlAudio && !this.isMuted) {
      this.htmlAudio.volume = Math.max(0, Math.min(1, this.musicVolume * 0.72 + this.natureVolume * 0.28));
    }
  }

  toggleMute() {
    this.isPlaying = true;
    if (this.usesSafariMusic && !this.isMuted && !this.isAudible()) {
      this.forcePlay();
      return false;
    }
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this._stopAllAudioImmediate();
    } else {
      this.forcePlay();
      this.playCoinSfx();
    }

    this._syncAudioStatusUI();
    return this.isMuted;
  }

  _restartSequencer() {
    if (this.loopTimer) clearInterval(this.loopTimer);
    this._startSequencer();
  }

  _startSequencer() {
    if (this.usesSafariMusic) return;
    const intervals = {
      chill: 2400,
      chill_lofi: 2100,
      chill_sunset: 2700,
      gentle: 2100,
      gentle_waltz: 1950,
      gentle_lullaby: 2400,
      water: 1800,
      water_rain: 1650,
      water_sea: 2500,
      zen: 3500,
      zen_bamboo: 2800,
      catholic: 3200,
      catholic_ave: 2900
    };
    const intervalMs = intervals[this.currentChannel] || 2400;

    if (!this.isMuted) {
      this._playStep();
    }
    this.loopTimer = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
        try {
          const rp = this.ctx.resume();
          if (rp && typeof rp.catch === 'function') rp.catch(() => {});
        } catch (e) {}
      }
      this._playStep();
    }, intervalMs);
  }

  _playStep() {
    if (this.usesSafariMusic || !this.ctx || this.isMuted) return;
    const ch = this.currentChannel;
    const step = this.stepIndex++;

    if (ch === 'chill') {
      const chords = [
        [174.61, 220.00, 261.63, 329.63],
        [164.81, 196.00, 246.94, 293.66],
        [146.83, 174.61, 220.00, 261.63],
        [130.81, 196.00, 246.94, 329.63]
      ];
      const chord = chords[step % chords.length];
      chord.forEach((freq, idx) => {
        this._playTone(freq, 'triangle', 2.2, 0.18, idx * 0.08);
      });
      const melodyPool = [392.00, 440.00, 523.25, 587.33, 659.25];
      const melFreq = melodyPool[(step * 2 + Math.floor(Math.random() * 2)) % melodyPool.length];
      this._playTone(melFreq, 'sine', 1.4, 0.24, 0.65);

    } else if (ch === 'chill_lofi') {
      const chords = [
        [110.00, 164.81, 196.00, 246.94],
        [146.83, 185.00, 220.00, 261.63],
        [196.00, 246.94, 293.66, 369.99],
        [130.81, 164.81, 196.00, 246.94]
      ];
      const chord = chords[step % chords.length];
      chord.forEach((freq, idx) => {
        this._playTone(freq, 'sine', 1.9, 0.18, idx * 0.06);
      });
      const lofiNotes = [493.88, 523.25, 587.33, 659.25, 783.99];
      this._playTone(lofiNotes[step % lofiNotes.length], 'triangle', 1.1, 0.20, 0.45);
      this._playTone(lofiNotes[(step + 2) % lofiNotes.length], 'sine', 0.9, 0.18, 1.05);

    } else if (ch === 'chill_sunset') {
      const chords = [
        [155.56, 196.00, 233.08, 293.66],
        [116.54, 174.61, 233.08, 293.66],
        [130.81, 155.56, 196.00, 233.08],
        [103.83, 155.56, 196.00, 261.63]
      ];
      const chord = chords[step % chords.length];
      chord.forEach((freq) => {
        this._playPadNote(freq, 2.5, 0.16);
      });
      const topNotes = [466.16, 523.25, 587.33, 622.25];
      this._playTone(topNotes[step % topNotes.length], 'sine', 1.8, 0.20, 0.5);

    } else if (ch === 'gentle') {
      const arps = [
        [196.00, 246.94, 293.66, 392.00, 493.88],
        [164.81, 246.94, 329.63, 392.00, 493.88],
        [130.81, 196.00, 261.63, 329.63, 392.00],
        [146.83, 220.00, 293.66, 369.99, 440.00]
      ];
      const notes = arps[step % arps.length];
      notes.forEach((freq, i) => {
        this._playTone(freq, 'sine', 1.9, 0.20, i * 0.32);
      });

    } else if (ch === 'gentle_waltz') {
      const waltzBars = [
        { bass: 174.61, chord: [261.63, 349.23, 440.00], mel: 523.25 },
        { bass: 146.83, chord: [220.00, 293.66, 349.23], mel: 587.33 },
        { bass: 116.54, chord: [233.08, 293.66, 349.23], mel: 659.25 },
        { bass: 130.81, chord: [261.63, 329.63, 392.00], mel: 523.25 }
      ];
      const bar = waltzBars[step % waltzBars.length];
      this._playTone(bar.bass, 'triangle', 1.5, 0.22, 0);
      bar.chord.forEach((f) => {
        this._playTone(f, 'sine', 0.55, 0.16, 0.62);
        this._playTone(f, 'sine', 0.55, 0.15, 1.24);
      });
      this._playTone(bar.mel, 'sine', 1.2, 0.20, 0.31);

    } else if (ch === 'gentle_lullaby') {
      const lullabyNotes = [
        [523.25, 659.25, 783.99, 1046.50],
        [493.88, 587.33, 783.99, 987.77],
        [440.00, 523.25, 659.25, 880.00],
        [392.00, 493.88, 587.33, 783.99]
      ];
      const phrase = lullabyNotes[step % lullabyNotes.length];
      phrase.forEach((f, idx) => {
        this._playTone(f, 'sine', 1.6, 0.19, idx * 0.48);
      });

    } else if (ch === 'water') {
      const droplets = [783.99, 880.00, 1046.50, 1174.66, 1318.51];
      for (let i = 0; i < 2; i++) {
        const dFreq = droplets[Math.floor(Math.random() * droplets.length)];
        this._playTone(dFreq, 'sine', 0.45, 0.18, i * 0.55 + Math.random() * 0.2);
      }
      if (step % 2 === 0) {
        const fluteNotes = [293.66, 329.63, 392.00, 440.00, 523.25];
        const fFreq = fluteNotes[step % fluteNotes.length];
        this._playPadNote(fFreq, 1.6, 0.20);
      }

    } else if (ch === 'water_rain') {
      const chimes = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
      for (let i = 0; i < 3; i++) {
        const cFreq = chimes[(step + i * 2) % chimes.length];
        this._playTone(cFreq, 'sine', 0.7, 0.17, i * 0.42 + (step % 2) * 0.1);
      }
      const warmBass = [174.61, 196.00, 220.00, 261.63];
      this._playPadNote(warmBass[step % warmBass.length], 1.5, 0.16);

    } else if (ch === 'water_sea') {
      const harpRuns = [
        [196.00, 246.94, 293.66, 369.99, 392.00, 493.88],
        [174.61, 220.00, 261.63, 329.63, 349.23, 440.00],
        [164.81, 196.00, 246.94, 293.66, 329.63, 392.00]
      ];
      const run = harpRuns[step % harpRuns.length];
      run.forEach((f, idx) => {
        this._playTone(f, 'triangle', 1.8, 0.19, idx * 0.26);
      });

    } else if (ch === 'zen') {
      const bowlRoots = [216.0, 288.0, 324.0, 432.0];
      const root = bowlRoots[step % bowlRoots.length];
      this._playBowlStrike(root, 3.5, 0.26);
      this._playBowlStrike(root * 2.756, 2.4, 0.12);

    } else if (ch === 'zen_bamboo') {
      const guqinNotes = [146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63];
      const n1 = guqinNotes[step % guqinNotes.length];
      const n2 = guqinNotes[(step + 3) % guqinNotes.length];
      this._playTone(n1, 'triangle', 2.4, 0.22, 0);
      this._playTone(n2 * 2, 'sine', 1.9, 0.19, 0.95);
      if (step % 3 === 0) {
        this._playBowlStrike(432.0, 2.6, 0.17);
      }

    } else if (ch === 'catholic') {
      const sacredChords = [
        [130.81, 196.00, 261.63, 329.63],
        [123.47, 196.00, 246.94, 293.66],
        [110.00, 220.00, 261.63, 329.63],
        [130.81, 196.00, 261.63, 349.23],
        [174.61, 220.00, 261.63, 349.23],
        [130.81, 196.00, 261.63, 329.63],
        [146.83, 196.00, 246.94, 293.66],
        [130.81, 196.00, 261.63, 523.25]
      ];
      const chord = sacredChords[step % sacredChords.length];
      chord.forEach((freq) => {
        this._playOrganVoice(freq, 3.1, 0.16);
      });
      if (step % 4 === 0) {
        this._playChurchBell(523.25, 2.8, 0.20);
      }

    } else if (ch === 'catholic_ave') {
      const aveProgression = [
        { arp: [130.81, 196.00, 261.63, 329.63, 392.00, 329.63], mel: 523.25 },
        { arp: [130.81, 220.00, 293.66, 349.23, 440.00, 349.23], mel: 587.33 },
        { arp: [123.47, 196.00, 246.94, 349.23, 392.00, 349.23], mel: 493.88 },
        { arp: [130.81, 196.00, 261.63, 329.63, 392.00, 329.63], mel: 523.25 }
      ];
      const bar = aveProgression[step % aveProgression.length];
      bar.arp.forEach((f, idx) => {
        this._playTone(f, 'sine', 1.4, 0.17, idx * 0.42);
      });
      this._playOrganVoice(bar.mel, 2.7, 0.17);
    }
  }

  // =========================================================================
  // PRE-BAKED PCM AUDIOBUFFER NOTE ENGINE (100% SAFARI WEBKIT RELIABLE)
  // =========================================================================
  _playBufferedNote(freq, waveType, duration, peakGain, delaySec = 0, targetBus = 'music') {
    if (!this.ctx || this.isMuted) return;
    try {
      const sr = this.ctx.sampleRate || 22050;
      const cacheKey = `${waveType}_${Math.round(freq * 10)}_${Math.round(duration * 100)}_${Math.round(peakGain * 1000)}`;
      let buf = this.noteBufferCache[cacheKey];

      if (!buf) {
        const len = Math.max(64, Math.floor(sr * duration));
        buf = this.ctx.createBuffer(1, len, sr);
        const data = buf.getChannelData(0);
        const attackTime = Math.min(0.08, duration * 0.2);

        for (let i = 0; i < len; i++) {
          const t = i / sr;
          let env = 1.0;
          if (t < attackTime) {
            env = t / attackTime;
          } else {
            env = Math.exp(-(t - attackTime) / Math.max(0.08, duration * 0.38));
          }

          let wave = 0;
          if (waveType === 'triangle') {
            wave = Math.sin(2 * Math.PI * freq * t) * 0.78 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.22;
          } else if (waveType === 'organ') {
            const sustainEnv = t < 0.25 ? (t / 0.25) : (t > duration - 0.35 ? (duration - t) / 0.35 : 0.9);
            env = Math.max(0, sustainEnv);
            wave = Math.sin(2 * Math.PI * freq * t) * 0.65 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.25 + Math.sin(2 * Math.PI * freq * 3 * t) * 0.1;
          } else if (waveType === 'pad') {
            const padEnv = Math.sin((t / duration) * Math.PI);
            env = Math.max(0, padEnv);
            wave = Math.sin(2 * Math.PI * freq * t) * 0.8 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.2;
          } else {
            wave = Math.sin(2 * Math.PI * freq * t);
          }

          data[i] = Math.max(-0.98, Math.min(0.98, wave * env * peakGain));
        }

        if (Object.keys(this.noteBufferCache).length < 180) {
          this.noteBufferCache[cacheKey] = buf;
        }
      }

      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const destNode = targetBus === 'nature' ? (this.natureGain || this.masterGain) : (this.musicGain || this.masterGain);
      src.connect(destNode);
      const startTime = this.ctx.currentTime + Math.max(0, delaySec);
      if (src.start) src.start(startTime);
      else if (src.noteOn) src.noteOn(startTime);
    } catch (e) {}
  }

  _playTone(freq, type, duration, peakGain, delaySec = 0) {
    this._playBufferedNote(freq, type, duration, peakGain, delaySec, 'music');
  }

  _playPadNote(freq, duration, peakGain) {
    this._playBufferedNote(freq, 'pad', duration, peakGain, 0, 'music');
  }

  _playBowlStrike(freq, duration, peakGain) {
    this._playBufferedNote(freq, 'sine', duration, peakGain, 0, 'music');
  }

  _playOrganVoice(freq, duration, peakGain) {
    this._playBufferedNote(freq, 'organ', duration, peakGain, 0, 'music');
  }

  _playChurchBell(freq, duration, peakGain) {
    this._playBufferedNote(freq, 'sine', duration, peakGain, 0, 'music');
    this._playBufferedNote(freq * 2.0, 'sine', duration * 0.65, peakGain * 0.45, 0.02, 'music');
  }

  // =========================================================================
  // GAMEPLAY SOUND EFFECTS (COIN, WORK, UPGRADE)
  // =========================================================================
  playCoinSfx() {
    this._initWebAudioImmediate();
    if (!this.ctx || this.isMuted) return;
    this._playBufferedNote(587.33, 'sine', 0.25, 0.24, 0, 'music');
    this._playBufferedNote(880.00, 'sine', 0.35, 0.26, 0.09, 'music');
  }

  playWorkSfx() {
    this._initWebAudioImmediate();
    if (!this.ctx || this.isMuted) return;
    this._playBufferedNote(293.66, 'triangle', 0.22, 0.24, 0, 'music');
    this._playBufferedNote(440.00, 'sine', 0.28, 0.22, 0.10, 'music');
  }

  playUpgradeSfx() {
    this._initWebAudioImmediate();
    if (!this.ctx || this.isMuted) return;
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((f, i) => {
      this._playBufferedNote(f, 'triangle', 0.6, 0.24, i * 0.1, 'music');
    });
  }
}

window.audioEngine = new HealingAudioEngine();
