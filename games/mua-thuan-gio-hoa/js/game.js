// =========================================================================
// MƯA THUẬN GIÓ HOÀ - GAME CONTROLLER (Tác giả: MaxNgo):
// - Lưu toàn bộ dữ liệu thông tin nhân vật & tiến trình ở máy người chơi (LocalStorage + Xuất/Nhập file .json)
// - Bảo mật theo chuẩn phát hành game (Chống XSS, Prototype Pollution, Kiểm tra toàn vẹn dữ liệu save)
// - 6 Mẫu Hàng Rào trang trí khuôn viên nhà & Ô Trang Phục 16 Quốc Phục Truyền Thống Thế Giới
// - Tự động chuyển tư thế bơi qua sông cho nhân vật và thú cưng (Cậu Vàng, Hoàng Thượng)
// =========================================================================

function escapeHtml(raw) {
  if (raw === null || raw === undefined) return '';
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeJsonParse(rawString) {
  if (!rawString || typeof rawString !== 'string') return null;
  return JSON.parse(rawString, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  });
}

class MuaThuanGioHoaGame {
  constructor() {
    this.state = {
      playerName: 'Kẻ Mộng Mơ',
      gender: 'male',
      age: 'youth',
      mood: 'bored',
      style: 'default',
      region: 'mountain',
      hasSavedProfile: false,
      coins: 15, // Khởi đầu vừa đủ để người chơi khám phá, lao động & giải đố kiếm Xu
      energy: 100,
      maxEnergy: 100,
      peace: 60,
      maxPeace: 100,
      ownedUpgrades: [],
      ownedTools: [],
      ownedStationProps: [],
      ownedCostumes: [],
      ownedLandExpansions: [],
      equippedCostume: null,
      activeFenceStyle: 'auto',
      completedQuests: [],
      petSettings: {
        dogFollow: true,
        catFollow: true
      },
      labelSettings: {
        showCharacterLabels: true,
        showObjectLabels: true,
        customNames: {}
      },
      uiPanels: {
        left: typeof window !== 'undefined' ? (window.innerWidth > 860 && window.innerHeight > 600) : true,
        music: typeof window !== 'undefined' ? (window.innerWidth > 860 && window.innerHeight > 600) : true,
        pets: false,
        cleanMode: false
      },
      audioSettings: {
        channel: 'chill',
        musicVol: 70,
        natureVol: 55,
        isMuted: false
      },
      savedPositions: {
        playerPos: null,
        petPos: null,
        catPos: null
      },
      lastSavedAt: null,
      feedbackList: [
        {
          author: 'MaxNgo (Tác giả)',
          cat: '💖 Lời nhắn gửi MaxNgo',
          text: 'Chào mừng bạn đến với Mưa Thuận Gió Hoà! Mọi góp ý xin gửi tại đây hoặc về email tannt4@gmail.com nhé.',
          time: 'Khởi tạo'
        }
      ],
      claimedCoffeeTiers: [],
      exteriorLayout: JSON.parse(JSON.stringify(window.GAME_DATA.defaultExteriorLayout)),
      interiorLayout: JSON.parse(JSON.stringify(window.GAME_DATA.defaultInteriorLayout)),
      weatherIndex: 0,
      isSleeping: false,
      isInsideHouse: false,
      isMoveMode: false,
      isGameStarted: false,
      activeStationKey: null,
      shopCategory: 'all',
      costumeRegionFilter: 'all',
      previewingCostumeId: 'costume_vietnam',
      quizStreak: 0,
      quizCategory: 'all'
    };

    this.weatherCycle = [
      {
        id: 'sunny',
        shortLabel: '🌤️ Nắng Ấm',
        label: '🌤️ Nắng Ấm Dịu Hoà',
        soundDesc: 'Tiếng chim hót ban mai & suối chảy hiền hoà',
        bonus: 1.0
      },
      {
        id: 'rain',
        shortLabel: '🌧️ Mưa Rào',
        label: '🌧️ Mưa Thuận Gió Hoà (+20% Xu)',
        soundDesc: 'Tiếng mưa rào rơi trên mái hiên & giọt nước tí tách',
        bonus: 1.2
      },
      {
        id: 'wind',
        shortLabel: '🍃 Gió Mát',
        label: '🍃 Gió Thảo Nguyên (+15% Xu)',
        soundDesc: 'Tiếng gió thảo nguyên rì rào & chuông gió leng keng',
        bonus: 1.15
      },
      {
        id: 'storm',
        shortLabel: '⛈️ Giông Bão',
        label: '⛈️ Giông Bão Rền Vang (+25% Xu)',
        soundDesc: 'Tiếng mưa lớn, gió hú & tiếng sấm rền vang ấm áp trong nhà',
        bonus: 1.25
      },
      {
        id: 'snow',
        shortLabel: '❄️ Tuyết Rơi',
        label: '❄️ Tuyết Rơi Tĩnh Lặng (+20% Xu)',
        soundDesc: 'Tiếng gió tuyết êm đềm & chuông băng pha lê ngân vang',
        bonus: 1.2
      },
      {
        id: 'mist',
        shortLabel: '🌫️ Sương Mù',
        label: '🌫️ Sương Mù Thanh Tịnh (+10% Xu)',
        soundDesc: 'Tiếng suối sương sớm & chuông thiền ngân sâu',
        bonus: 1.1
      },
      {
        id: 'sunset',
        shortLabel: '🌇 Hoàng Hôn',
        label: '🌇 Hoàng Hôn Tĩnh Lặng (+15% Xu)',
        soundDesc: 'Tiếng gió chiều êm ả & tiếng chim gọi bầy về tổ',
        bonus: 1.15
      }
    ];

    this.sleepTimer = null;
    this.passiveTimer = null;
    this.clockTimer = null;

    this._loadSavedState();

    // Initialize UI event listeners first (Safari & Chrome 100% responsive)
    this._bindIntroUI();
    this._bindHudUI();
    this._bindMoveLayoutUI();
    this._bindShopUI();
    this._bindCostumeUI();
    this._bindTravelUI();
    this._bindQuizUI();
    this._bindUpgradeUI();
    this._bindAuthorUI();
    this._bindAutoSaveLifecycle();

    // Initialize Native 3D World Engine
    this.world = new window.CozyWorld3D('canvas-container');
    this.world.setLayouts(this.state.exteriorLayout, this.state.interiorLayout);
    this.world.setPetSettings(this.state.petSettings);
    this.world.setLabelSettings(this.state.labelSettings);
    this.world.setActiveFenceStyle(this.state.activeFenceStyle || 'auto');
    this.world.buildRegion(this.state.region);
    this.world.buildCharacter({
      name: this.state.playerName,
      gender: this.state.gender,
      age: this.state.age,
      mood: this.state.mood,
      style: this.state.style,
      equippedCostume: this.state.equippedCostume
    });
    this.world.buildStarterHomeAndUpgrades(
      this.state.ownedUpgrades,
      this.state.ownedStationProps,
      this.state.ownedTools
    );
    this.world.setOwnedLandExpansions(this.state.ownedLandExpansions);
    const initWeather = this.weatherCycle[this.state.weatherIndex] || this.weatherCycle[0];
    this.world.setWeather(initWeather.id);
    this._restoreSavedWorldPositions();

    this.world.onGroundClickCallback = () => {
      if (this.isMobileViewport() && this.state.uiPanels) {
        if (this.state.uiPanels.left || this.state.uiPanels.music || this.state.uiPanels.pets) {
          this.state.uiPanels.left = false;
          this.state.uiPanels.music = false;
          this.state.uiPanels.pets = false;
          this.applyHudPanelVisibility();
        }
      }
      this._completeQuest('q_walk_click');
      this._saveState();
    };
    this.world.onStationClickCallback = (stationId) => {
      if (this.isMobileViewport() && this.state.uiPanels) {
        this.state.uiPanels.left = false;
        this.state.uiPanels.music = false;
        this.state.uiPanels.pets = false;
        this.applyHudPanelVisibility();
      }
      this._completeQuest('q_walk_click');
      this._triggerInteractable(stationId);
    };
    this.world.onSelectMovableCallback = () => {
      this.renderMoveLayoutPanel();
    };
    this.world.onPlaceMovableCallback = (mode, itemId, newPos, cost, itemName) => {
      this.executeRelocateItem(mode, itemId, newPos, cost, itemName);
    };

    this._syncIntroFormFromState();
    this._syncRealTimeClock();
    this._startMainLoop();
  }

  isMobileViewport() {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 860 || window.innerHeight <= 600;
  }

  _sanitizeLoadedState(parsed) {
    if (!parsed || typeof parsed !== 'object') return;

    const cleanStr = (val, fallback, maxLen = 40) => {
      if (typeof val !== 'string') return fallback;
      const trimmed = val.trim().slice(0, maxLen);
      return trimmed || fallback;
    };
    const clampNum = (val, min, max, fallback) => {
      const n = Number(val);
      if (!Number.isFinite(n)) return fallback;
      return Math.max(min, Math.min(max, n));
    };
    const cleanIdArray = (arr, maxItems = 100) => {
      if (!Array.isArray(arr)) return [];
      return arr
        .filter(item => typeof item === 'string' && item.length > 0 && item.length <= 64)
        .slice(0, maxItems);
    };

    this.state.playerName = cleanStr(parsed.playerName, 'Kẻ Mộng Mơ', 22);
    this.state.gender = ['male', 'female', 'free'].indexOf(parsed.gender) !== -1 ? parsed.gender : 'male';
    this.state.age = window.GAME_DATA.ages[parsed.age] ? parsed.age : 'youth';
    this.state.mood = window.GAME_DATA.moods[parsed.mood] ? parsed.mood : 'bored';
    this.state.style = (window.GAME_DATA.characterStyles && window.GAME_DATA.characterStyles[parsed.style]) ? parsed.style : 'default';
    this.state.region = window.GAME_DATA.regions[parsed.region] ? parsed.region : 'mountain';

    this.state.coins = Math.round(clampNum(parsed.coins, 0, 9999999, 15));
    this.state.maxEnergy = 100;
    this.state.maxPeace = 100;
    this.state.energy = clampNum(parsed.energy, 0, 100, 100);
    this.state.peace = clampNum(parsed.peace, 0, 100, 60);

    this.state.ownedUpgrades = cleanIdArray(parsed.ownedUpgrades, 20);
    this.state.ownedTools = cleanIdArray(parsed.ownedTools, 60);
    this.state.ownedStationProps = cleanIdArray(parsed.ownedStationProps, 60);
    this.state.ownedCostumes = cleanIdArray(parsed.ownedCostumes, 40);
    this.state.ownedLandExpansions = cleanIdArray(parsed.ownedLandExpansions, 20);
    this.state.completedQuests = cleanIdArray(parsed.completedQuests, 40);
    this.state.claimedCoffeeTiers = cleanIdArray(parsed.claimedCoffeeTiers, 20);

    const validCostume = (window.GAME_DATA.worldCostumes || []).some(c => c.id === parsed.equippedCostume);
    this.state.equippedCostume = (validCostume && this.state.ownedCostumes.indexOf(parsed.equippedCostume) !== -1)
      ? parsed.equippedCostume
      : null;

    const validFence = parsed.activeFenceStyle === 'auto' || (window.GAME_DATA.fenceStyles && window.GAME_DATA.fenceStyles[parsed.activeFenceStyle]);
    this.state.activeFenceStyle = validFence ? parsed.activeFenceStyle : 'auto';

    if (parsed.petSettings && typeof parsed.petSettings === 'object') {
      this.state.petSettings = {
        dogFollow: parsed.petSettings.dogFollow !== false,
        catFollow: parsed.petSettings.catFollow !== false
      };
    }

    if (parsed.labelSettings && typeof parsed.labelSettings === 'object') {
      const cleanedCustomNames = {};
      if (parsed.labelSettings.customNames && typeof parsed.labelSettings.customNames === 'object') {
        Object.keys(parsed.labelSettings.customNames).slice(0, 30).forEach((k) => {
          const safeKey = cleanStr(k, '', 32);
          const safeVal = cleanStr(parsed.labelSettings.customNames[k], '', 28);
          if (safeKey && safeVal) {
            cleanedCustomNames[safeKey] = safeVal;
          }
        });
      }
      this.state.labelSettings = {
        showCharacterLabels: parsed.labelSettings.showCharacterLabels !== false,
        showObjectLabels: parsed.labelSettings.showObjectLabels !== false,
        customNames: cleanedCustomNames
      };
    }

    if (parsed.uiPanels && typeof parsed.uiPanels === 'object') {
      this.state.uiPanels = {
        left: parsed.uiPanels.left !== false,
        music: parsed.uiPanels.music !== false,
        pets: !!parsed.uiPanels.pets,
        cleanMode: !!parsed.uiPanels.cleanMode
      };
    }

    if (parsed.audioSettings && typeof parsed.audioSettings === 'object') {
      this.state.audioSettings = {
        channel: cleanStr(parsed.audioSettings.channel, 'chill', 30),
        musicVol: clampNum(parsed.audioSettings.musicVol, 0, 100, 70),
        natureVol: clampNum(parsed.audioSettings.natureVol, 0, 100, 55),
        isMuted: !!parsed.audioSettings.isMuted
      };
    }

    if (parsed.savedPositions && typeof parsed.savedPositions === 'object') {
      const cleanPos = (p) => {
        if (!p || typeof p !== 'object') return null;
        return {
          x: clampNum(p.x, -26, 26, 0),
          y: 0,
          z: clampNum(p.z, -24, 24, 6)
        };
      };
      this.state.savedPositions = {
        playerPos: cleanPos(parsed.savedPositions.playerPos),
        petPos: cleanPos(parsed.savedPositions.petPos),
        catPos: cleanPos(parsed.savedPositions.catPos)
      };
    }

    if (Array.isArray(parsed.feedbackList) && parsed.feedbackList.length > 0) {
      this.state.feedbackList = parsed.feedbackList
        .filter(fb => fb && typeof fb === 'object')
        .slice(0, 25)
        .map(fb => ({
          author: cleanStr(fb.author, 'Người chơi', 28),
          cat: cleanStr(fb.cat, '💡 Góp ý', 45),
          text: cleanStr(fb.text, '', 350),
          time: cleanStr(fb.time, 'Gần đây', 24)
        }));
    }

    // Merge default layouts safely with coordinate clamping
    const defExt = JSON.parse(JSON.stringify(window.GAME_DATA.defaultExteriorLayout));
    if (parsed.exteriorLayout && typeof parsed.exteriorLayout === 'object') {
      Object.keys(defExt).forEach((k) => {
        if (parsed.exteriorLayout[k] && typeof parsed.exteriorLayout[k] === 'object') {
          defExt[k].x = clampNum(parsed.exteriorLayout[k].x, -24, 24, defExt[k].x);
          defExt[k].z = clampNum(parsed.exteriorLayout[k].z, -22, 22, defExt[k].z);
        }
      });
    }
    this.state.exteriorLayout = defExt;

    const defInt = JSON.parse(JSON.stringify(window.GAME_DATA.defaultInteriorLayout));
    if (parsed.interiorLayout && typeof parsed.interiorLayout === 'object') {
      Object.keys(defInt).forEach((k) => {
        if (parsed.interiorLayout[k] && typeof parsed.interiorLayout[k] === 'object') {
          defInt[k].x = clampNum(parsed.interiorLayout[k].x, -7.5, 7.5, defInt[k].x);
          defInt[k].z = clampNum(parsed.interiorLayout[k].z, -5.5, 4.8, defInt[k].z);
        }
      });
    }
    this.state.interiorLayout = defInt;

    this.state.weatherIndex = Math.round(clampNum(parsed.weatherIndex, 0, this.weatherCycle.length - 1, 0));
    this.state.quizStreak = Math.round(clampNum(parsed.quizStreak, 0, 9999, 0));
    this.state.lastSavedAt = cleanStr(parsed.lastSavedAt, null, 40);
    this.state.hasSavedProfile = true;
    this.state.isSleeping = false;
    this.state.isInsideHouse = false;
    this.state.isMoveMode = false;
  }

  _loadSavedState() {
    try {
      const raw = localStorage.getItem('MTGH_SAVE_V4') || localStorage.getItem('MTGH_SAVE_V3');
      if (raw) {
        const parsed = safeJsonParse(raw);
        if (parsed) {
          this._sanitizeLoadedState(parsed);
        }
      }
    } catch (e) {}
  }

  _restoreSavedWorldPositions() {
    if (!this.world || !this.state.savedPositions) return;
    const sp = this.state.savedPositions;
    if (sp.playerPos) {
      this.world.playerPos.x = sp.playerPos.x;
      this.world.playerPos.z = sp.playerPos.z;
      this.world.targetPos = null;
    }
    if (sp.petPos) {
      this.world.petPos.x = sp.petPos.x;
      this.world.petPos.z = sp.petPos.z;
    }
    if (sp.catPos) {
      this.world.catPos.x = sp.catPos.x;
      this.world.catPos.z = sp.catPos.z;
    }
  }

  _saveState() {
    try {
      this.state.hasSavedProfile = true;
      if (this.world && !this.state.isInsideHouse) {
        this.state.savedPositions = {
          playerPos: { x: Math.round(this.world.playerPos.x * 10) / 10, y: 0, z: Math.round(this.world.playerPos.z * 10) / 10 },
          petPos: { x: Math.round(this.world.petPos.x * 10) / 10, y: 0, z: Math.round(this.world.petPos.z * 10) / 10 },
          catPos: { x: Math.round(this.world.catPos.x * 10) / 10, y: 0, z: Math.round(this.world.catPos.z * 10) / 10 }
        };
      }
      if (window.audioEngine) {
        this.state.audioSettings = {
          channel: window.audioEngine.currentChannel || 'chill',
          musicVol: Math.round((window.audioEngine.musicVolume || 0.7) * 100),
          natureVol: Math.round((window.audioEngine.natureVolume || 0.55) * 100),
          isMuted: !!window.audioEngine.isMuted
        };
      }
      const now = new Date();
      this.state.lastSavedAt = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
      localStorage.setItem('MTGH_SAVE_V4', JSON.stringify(this.state));
    } catch (e) {}
  }

  _bindAutoSaveLifecycle() {
    window.addEventListener('beforeunload', () => {
      if (this.state.hasSavedProfile || this.state.isGameStarted) {
        this._saveState();
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && (this.state.hasSavedProfile || this.state.isGameStarted)) {
        this._saveState();
      }
    });
  }

  exportSaveToFile() {
    try {
      this._saveState();
      const dataStr = JSON.stringify(this.state, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = (this.state.playerName || 'NhanVat').replace(/[^a-zA-Z0-9_-]/g, '_');
      a.href = url;
      a.download = `MuaThuanGioHoa_${safeName}_Save.json`;
      document.body.appendChild(a);
      a.click();
      if (a.parentNode) a.parentNode.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      this.showToast('📥 Đã tải file sao lưu dữ liệu nhân vật (.json) về máy tính của bạn!');
    } catch (e) {
      this.showToast('⚠️ Không thể xuất file lưu trên trình duyệt này.');
    }
  }

  importSaveFromFile(file) {
    if (!file) return;
    if (file.size > 512 * 1024) {
      this.showToast('⚠️ File quá lớn hoặc không hợp lệ (Tối đa 512KB).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = safeJsonParse(String(ev.target.result || ''));
        if (!parsed || typeof parsed !== 'object') {
          this.showToast('⚠️ File dữ liệu nhân vật không đúng định dạng JSON.');
          return;
        }
        this._sanitizeLoadedState(parsed);
        this._saveState();
        if (this.world) {
          this.world.setLayouts(this.state.exteriorLayout, this.state.interiorLayout);
          this.world.setPetSettings(this.state.petSettings);
          this.world.setActiveFenceStyle(this.state.activeFenceStyle || 'auto');
          this.world.buildRegion(this.state.region);
          this.world.buildCharacter({
            gender: this.state.gender,
            age: this.state.age,
            mood: this.state.mood,
            style: this.state.style,
            equippedCostume: this.state.equippedCostume
          });
          this.world.buildStarterHomeAndUpgrades(
            this.state.ownedUpgrades,
            this.state.ownedStationProps,
            this.state.ownedTools
          );
          this._restoreSavedWorldPositions();
        }
        this._syncIntroFormFromState();
        this.refreshHUD();
        this.showToast(`📤 Đã khôi phục hồ sơ nhân vật "${this.state.playerName}" (${this.state.coins} Xu) từ máy tính!`);
      } catch (err) {
        this.showToast('⚠️ File dữ liệu bị lỗi, không thể đọc.');
      }
    };
    reader.readAsText(file);
  }

  // =======================================================================
  // REAL-TIME DAY & NIGHT CLOCK SYNCHRONIZED WITH SYSTEM TIME
  // =======================================================================
  _syncRealTimeClock() {
    const now = new Date();
    const hh = now.getHours();
    const mm = now.getMinutes();
    const ss = now.getSeconds();
    const hourFloat = hh + mm / 60;

    if (this.world) {
      this.world.setRealTimeHour(hourFloat);
    }

    const hhStr = String(hh).padStart(2, '0');
    const mmStr = String(mm).padStart(2, '0');
    const ssStr = String(ss).padStart(2, '0');

    let periodIcon = '☀️';
    if (hh >= 5 && hh < 7) periodIcon = '🌅';
    else if (hh >= 17 && hh < 19) periodIcon = '🌇';
    else if (hh >= 19 || hh < 5) periodIcon = '🌙';

    const clockEl = document.getElementById('hud-clock-label');
    if (clockEl) {
      clockEl.textContent = `${periodIcon} ${hhStr}:${mmStr}:${ssStr}`;
    }
  }

  // =======================================================================
  // INTRO, SAVED CHARACTER PROFILE & DREAM REGION MATCHER BINDINGS
  // =======================================================================
  syncOutfitDropdowns() {
    const styles = (window.GAME_DATA && window.GAME_DATA.characterStyles) || {};
    const allCostumes = (window.GAME_DATA && window.GAME_DATA.worldCostumes) || [];
    const ownedIds = this.state.ownedCostumes || [];
    const ownedCostumes = allCostumes.filter(c => ownedIds.indexOf(c.id) !== -1);
    const activeVal = this.state.equippedCostume || this.state.style || 'default';

    const buildOptionsHtml = (isCompact) => {
      let html = '<optgroup label="👕 Trang Phục Mặc Định (6 Phong cách)">';
      Object.keys(styles).forEach((k) => {
        const st = styles[k];
        const label = isCompact
          ? `${st.icon} ${st.name}`
          : `${st.icon} ${st.name} — ${st.desc}`;
        html += `<option value="${escapeHtml(k)}">${escapeHtml(label)}</option>`;
      });
      html += '</optgroup>';

      if (ownedCostumes.length > 0) {
        html += `<optgroup label="👘 Quốc Phục Thế Giới Đã Mua (${ownedCostumes.length})">`;
        ownedCostumes.forEach((c) => {
          const label = isCompact
            ? `${c.flag} ${c.country}: ${c.name}`
            : `${c.flag} ${c.country} — ${c.name} (${c.perkText})`;
          html += `<option value="${escapeHtml(c.id)}">${escapeHtml(label)}</option>`;
        });
        html += '</optgroup>';
      }
      return html;
    };

    const hudSel = document.getElementById('hud-select-style');
    if (hudSel) {
      hudSel.innerHTML = buildOptionsHtml(true);
      hudSel.value = activeVal;
    }

    const introSel = document.getElementById('select-style-drop');
    if (introSel) {
      introSel.innerHTML = buildOptionsHtml(false);
      introSel.value = activeVal;
    }

    const modalSel = document.getElementById('costume-owned-select');
    if (modalSel) {
      modalSel.innerHTML = buildOptionsHtml(true);
      modalSel.value = activeVal;
    }
  }

  applyOutfitSelection(val, showFeedback = true) {
    if (!val) return;
    const allCostumes = (window.GAME_DATA && window.GAME_DATA.worldCostumes) || [];
    const costumeObj = allCostumes.find(c => c.id === val);

    if (costumeObj && this.hasCostume(costumeObj.id)) {
      this.state.equippedCostume = costumeObj.id;
      this.state.previewingCostumeId = costumeObj.id;
      if (this.world) {
        this.world.setPreviewCostume(costumeObj.id);
        this.world.buildCharacter({
          name: this.state.playerName,
          gender: this.state.gender,
          age: this.state.age,
          mood: this.state.mood,
          style: this.state.style,
          equippedCostume: this.state.equippedCostume
        });
      }
      this._syncIntroFormFromState();
      this.renderCostumeItems();
      this.refreshHUD();
      this._saveState();
      if (showFeedback) {
        this.showToast(`👘 Đã thay trang phục: ${costumeObj.flag} ${costumeObj.country} — "${costumeObj.name}"!`);
      }
      return;
    }

    if (window.GAME_DATA.characterStyles && window.GAME_DATA.characterStyles[val]) {
      this.state.style = val;
      this.state.equippedCostume = null;
      if (this.world) {
        this.world.buildCharacter({
          name: this.state.playerName,
          gender: this.state.gender,
          age: this.state.age,
          mood: this.state.mood,
          style: this.state.style,
          equippedCostume: null
        });
      }
      this._syncIntroFormFromState();
      this.renderCostumeItems();
      this.refreshHUD();
      this._saveState();
      if (showFeedback) {
        const stObj = window.GAME_DATA.characterStyles[val];
        this.showToast(`${stObj.icon} Đã chọn trang phục: ${stObj.name}`);
      }
    }
  }

  _syncIntroFormFromState() {
    this.syncOutfitDropdowns();
    const nameInput = document.getElementById('input-player-name');
    if (nameInput) nameInput.value = this.state.playerName || 'Kẻ Mộng Mơ';

    const syncButtons = (containerId, selector, val) => {
      const container = document.getElementById(containerId);
      if (!container) return;
      const items = container.querySelectorAll(selector);
      for (let i = 0; i < items.length; i++) {
        if (items[i].getAttribute('data-value') === val) items[i].classList.add('active');
        else items[i].classList.remove('active');
      }
    };

    const setSelectVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setSelectVal('select-gender-drop', this.state.gender);
    setSelectVal('select-mood-drop', this.state.mood);
    setSelectVal('select-age-drop', this.state.age);
    setSelectVal('select-style-drop', this.state.equippedCostume || this.state.style || 'default');
    setSelectVal('select-region-drop', this.state.region);

    syncButtons('select-gender', '.pill-btn', this.state.gender);
    syncButtons('select-mood', '.pill-btn', this.state.mood);
    syncButtons('select-age', '.choice-card', this.state.age);
    syncButtons('select-style', '.choice-card', this.state.style || 'default');
    syncButtons('select-region', '.choice-card', this.state.region);

    const genderNames = { male: 'Chàng Trai', female: 'Cô Gái', free: 'Lữ Khách Tự Do' };
    const ageObj = window.GAME_DATA.ages[this.state.age] || window.GAME_DATA.ages.youth;
    const moodObj = window.GAME_DATA.moods[this.state.mood] || window.GAME_DATA.moods.bored;
    const styleObj = (window.GAME_DATA.characterStyles && window.GAME_DATA.characterStyles[this.state.style])
      || window.GAME_DATA.characterStyles.default;
    const regObj = window.GAME_DATA.regions[this.state.region] || window.GAME_DATA.regions.mountain;
    const equippedCostumeObj = this.getEquippedCostumeObject();

    const prevIcon = document.getElementById('preview-avatar-icon');
    if (prevIcon) prevIcon.textContent = equippedCostumeObj ? equippedCostumeObj.flag : moodObj.emoji;
    const prevSum = document.getElementById('preview-char-summary');
    if (prevSum) {
      const outfitTitle = equippedCostumeObj ? `${equippedCostumeObj.flag} ${equippedCostumeObj.name}` : `${styleObj.icon} ${styleObj.name}`;
      prevSum.textContent = `${outfitTitle} • ${genderNames[this.state.gender]} • ${ageObj.name}`;
    }
    const prevTrait = document.getElementById('preview-char-trait');
    if (prevTrait) {
      prevTrait.textContent = equippedCostumeObj
        ? `"${equippedCostumeObj.perkText} — ${ageObj.trait}"`
        : `"${styleObj.desc} — ${ageObj.trait}"`;
    }

    const regEmoji = document.getElementById('preview-region-emoji');
    if (regEmoji) regEmoji.textContent = regObj.emoji;
    const regTitle = document.getElementById('preview-region-title');
    if (regTitle) regTitle.textContent = regObj.title;
    const regHome = document.getElementById('preview-region-home');
    if (regHome) regHome.textContent = `🏠 Kiến trúc: ${regObj.homeName || 'Nhà Sàn Gỗ Thông'}`;
    const regDesc = document.getElementById('preview-region-desc');
    if (regDesc) regDesc.textContent = regObj.homeDesc || regObj.desc;

    // Update Saved Profile Banner
    const savedBanner = document.getElementById('saved-profile-banner');
    if (savedBanner) {
      if (this.state.hasSavedProfile) {
        savedBanner.classList.remove('hidden');
        const sumEl = document.getElementById('saved-profile-summary');
        const metaEl = document.getElementById('saved-profile-meta');
        const stageLevel = 1 + this.state.ownedUpgrades.length;
        const costumeCount = (this.state.ownedCostumes || []).length;
        if (sumEl) {
          sumEl.textContent = `${this.state.playerName} (${styleObj.icon} ${styleObj.shortLabel} • ${ageObj.name} • ${moodObj.emoji})`;
        }
        if (metaEl) {
          const savedTimeTxt = this.state.lastSavedAt ? ` • Lưu lúc ${this.state.lastSavedAt}` : '';
          metaEl.textContent = `${regObj.badge} • Nhà Cấp ${stageLevel}/6 • ${this.state.coins} 🪙 • ${costumeCount}/16 Quốc phục${savedTimeTxt}`;
        }
      } else {
        savedBanner.classList.add('hidden');
      }
    }

    if (this.world) {
      this.world.buildCharacter({
        name: this.state.playerName,
        gender: this.state.gender,
        age: this.state.age,
        mood: this.state.mood,
        style: this.state.style,
        equippedCostume: this.state.equippedCostume
      });
    }
  }

  _bindIntroUI() {
    const bindSelectDrop = (selectId, stateKey, onAfterSelect) => {
      const sel = document.getElementById(selectId);
      if (!sel) return;
      sel.addEventListener('change', (e) => {
        const val = e.target.value;
        if (!val) return;
        this.state[stateKey] = val;
        if (onAfterSelect) onAfterSelect(val);
        this._syncIntroFormFromState();
      });
    };

    bindSelectDrop('select-gender-drop', 'gender');
    bindSelectDrop('select-mood-drop', 'mood');
    bindSelectDrop('select-age-drop', 'age');
    const introStyleSel = document.getElementById('select-style-drop');
    if (introStyleSel) {
      introStyleSel.addEventListener('change', (e) => {
        this.applyOutfitSelection(e.target.value, true);
      });
    }
    bindSelectDrop('select-region-drop', 'region', (regVal) => {
      if (this.world) this.world.buildRegion(regVal);
    });

    const bindGroupSelection = (containerId, itemSelector, stateKey, onAfterSelect) => {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.addEventListener('click', (e) => {
        const target = e.target.closest(itemSelector);
        if (!target) return;
        const val = target.getAttribute('data-value');
        if (!val) return;
        this.state[stateKey] = val;
        if (onAfterSelect) onAfterSelect(val);
        this._syncIntroFormFromState();
      });
    };

    bindGroupSelection('select-gender', '.pill-btn', 'gender');
    bindGroupSelection('select-mood', '.pill-btn', 'mood');
    bindGroupSelection('select-age', '.choice-card', 'age');
    bindGroupSelection('select-style', '.choice-card', 'style');
    bindGroupSelection('select-region', '.choice-card', 'region', (regVal) => {
      if (this.world) this.world.buildRegion(regVal);
    });

    const runDreamMatcher = () => {
      const inputEl = document.getElementById('input-dream-place');
      const feedbackEl = document.getElementById('dream-match-feedback');
      const rawText = inputEl ? inputEl.value.trim() : '';
      if (!rawText) {
        feedbackEl.textContent = '⚠️ Hãy viết vài từ mô tả nơi bạn muốn tới nhé (VD: "biển nắng ấm", "rừng trúc yên tĩnh", "miệt vườn câu cá"...)';
        return;
      }
      const match = window.matchRegionFromDescription(rawText);
      if (match) {
        this.state.region = match.regionId;
        if (this.world) this.world.buildRegion(match.regionId);
        this._syncIntroFormFromState();
        const kwText = match.matchedWords.length > 0 ? ` (khớp ý: "${escapeHtml(match.matchedWords.join(', '))}")` : '';
        feedbackEl.innerHTML = `✨ <strong>Đã tìm thấy nơi lý tưởng:</strong> ${escapeHtml(match.region.emoji)} <strong>${escapeHtml(match.region.title)}</strong> — 🏠 <em>${escapeHtml(match.region.homeName)}</em>${kwText}!`;
      }
    };

    document.getElementById('btn-match-dream').addEventListener('click', runDreamMatcher);
    document.getElementById('input-dream-place').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runDreamMatcher();
      }
    });

    // Start or Save Character Configuration
    document.getElementById('btn-start-game').addEventListener('click', () => {
      const nameVal = document.getElementById('input-player-name').value.trim().slice(0, 22);
      if (nameVal) this.state.playerName = nameVal;

      const dreamVal = document.getElementById('input-dream-place').value.trim();
      if (dreamVal) {
        const autoMatch = window.matchRegionFromDescription(dreamVal);
        if (autoMatch) this.state.region = autoMatch.regionId;
      }

      this.startGameSession(false);
    });

    // Quick-resume saved character profile
    const btnContinue = document.getElementById('btn-continue-saved');
    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        this.startGameSession(true);
      });
    }

    // Export / Import local save file (.json) on player's computer
    const btnExportSave = document.getElementById('btn-export-save');
    if (btnExportSave) {
      btnExportSave.addEventListener('click', () => {
        this.exportSaveToFile();
      });
    }
    const btnImportSave = document.getElementById('btn-import-save');
    const fileInputImport = document.getElementById('input-import-save-file');
    if (btnImportSave && fileInputImport) {
      btnImportSave.addEventListener('click', () => {
        fileInputImport.click();
      });
      fileInputImport.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          this.importSaveFromFile(file);
          fileInputImport.value = '';
        }
      });
    }

    // Reset saved profile to start fresh
    const btnReset = document.getElementById('btn-reset-saved');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        localStorage.removeItem('MTGH_SAVE_V4');
        localStorage.removeItem('MTGH_SAVE_V3');
        this.state.playerName = 'Kẻ Mộng Mơ';
        this.state.gender = 'male';
        this.state.age = 'youth';
        this.state.mood = 'bored';
        this.state.style = 'default';
        this.state.region = 'mountain';
        this.state.coins = 15;
        this.state.energy = 100;
        this.state.peace = 60;
        this.state.ownedUpgrades = [];
        this.state.ownedTools = [];
        this.state.ownedStationProps = [];
        this.state.ownedCostumes = [];
        this.state.equippedCostume = null;
        this.state.activeFenceStyle = 'auto';
        this.state.completedQuests = [];
        this.state.hasSavedProfile = false;
        this.state.lastSavedAt = null;
        this.state.exteriorLayout = JSON.parse(JSON.stringify(window.GAME_DATA.defaultExteriorLayout));
        this.state.interiorLayout = JSON.parse(JSON.stringify(window.GAME_DATA.defaultInteriorLayout));
        if (this.world) {
          this.world.setActiveFenceStyle('auto');
          this.world.buildRegion('mountain');
        }
        this._syncIntroFormFromState();
        this.showToast('🔄 Đã làm mới hồ sơ! Bạn có thể thiết lập nhân vật mới từ đầu.');
      });
    }

    // Close button when opening Character Config modal from in-game
    const btnCloseIntro = document.getElementById('btn-close-intro');
    if (btnCloseIntro) {
      btnCloseIntro.addEventListener('click', () => {
        document.getElementById('intro-overlay').classList.add('hidden');
      });
    }
  }

  startGameSession(isQuickResume = false) {
    this.state.isGameStarted = true;
    const activeWeather = this.weatherCycle[this.state.weatherIndex] || this.weatherCycle[0];

    // CRITICAL FOR SAFARI (macOS & iOS): Unlock & start audio at 0.0ms of user click BEFORE any heavy 3D/DOM work!
    try {
      if (this.state.audioSettings) {
        this.state.audioSettings.isMuted = false;
        if (this.state.audioSettings.channel && window.audioEngine.channelTitles[this.state.audioSettings.channel]) {
          window.audioEngine.currentChannel = this.state.audioSettings.channel;
        }
        if (typeof this.state.audioSettings.musicVol === 'number') {
          window.audioEngine.musicVolume = Math.max(0.05, Math.min(1, this.state.audioSettings.musicVol / 100));
        }
        if (typeof this.state.audioSettings.natureVol === 'number') {
          window.audioEngine.natureVolume = Math.max(0.05, Math.min(1, this.state.audioSettings.natureVol / 100));
        }
      }
      window.audioEngine.isMuted = false;
      window.audioEngine.currentWeather = activeWeather.id;
      window.audioEngine.forcePlay();
    } catch (e) {}

    // On mobile viewports (e.g. 390 x 844), collapse all secondary panels by default on game entry
    // so the player immediately sees the 3D Character, touchable 3D Land, and Main Actions!
    if (this.isMobileViewport()) {
      this.state.uiPanels = {
        left: false,
        music: false,
        pets: false,
        cleanMode: false
      };
      const stPanel = document.getElementById('station-props-panel');
      if (stPanel) stPanel.classList.add('hidden');
      const mvPanel = document.getElementById('move-layout-panel');
      if (mvPanel) mvPanel.classList.add('hidden');
    }

    this._saveState();

    document.getElementById('intro-overlay').classList.add('hidden');
    document.getElementById('hud-container').classList.remove('hidden');

    const closeBtn = document.getElementById('btn-close-intro');
    if (closeBtn) closeBtn.classList.remove('hidden');

    this.world.setLayouts(this.state.exteriorLayout, this.state.interiorLayout);
    this.world.setPetSettings(this.state.petSettings);
    this.world.setLabelSettings(this.state.labelSettings);
    this.world.setActiveFenceStyle(this.state.activeFenceStyle || 'auto');
    this.world.buildRegion(this.state.region);
    this.world.buildCharacter({
      name: this.state.playerName,
      gender: this.state.gender,
      age: this.state.age,
      mood: this.state.mood,
      style: this.state.style,
      equippedCostume: this.state.equippedCostume
    });
    this.world.buildStarterHomeAndUpgrades(
      this.state.ownedUpgrades,
      this.state.ownedStationProps,
      this.state.ownedTools
    );
    if (isQuickResume) {
      this._restoreSavedWorldPositions();
    }

    this.world.setWeather(activeWeather.id);

    try {
      const mSlider = document.getElementById('slider-music-vol');
      if (mSlider) mSlider.value = Math.round(window.audioEngine.musicVolume * 100);
      const nSlider = document.getElementById('slider-nature-vol');
      if (nSlider) nSlider.value = Math.round(window.audioEngine.natureVolume * 100);

      window.audioEngine.setMusicVolume(Math.round(window.audioEngine.musicVolume * 100));
      window.audioEngine.setNatureVolume(Math.round(window.audioEngine.natureVolume * 100));
      window.audioEngine._syncAudioStatusUI();

      const nowPlayingEl = document.getElementById('now-playing-title');
      if (nowPlayingEl && window.audioEngine.channelTitles[window.audioEngine.currentChannel]) {
        nowPlayingEl.textContent = window.audioEngine.channelTitles[window.audioEngine.currentChannel];
      }
      const chSelect = document.getElementById('select-music-channel');
      if (chSelect) chSelect.value = window.audioEngine.currentChannel;
    } catch (e) {}

    this.applyHudPanelVisibility();
    this.refreshHUD();
    this._startTimers();

    const regObj = window.GAME_DATA.regions[this.state.region];
    if (isQuickResume) {
      this.showToast(`💾 Chào mừng ${this.state.playerName} quay trở lại ${regObj.name} (${regObj.homeName})!`);
    } else {
      this.showToast(`💾 Đã lưu toàn bộ thông tin nhân vật "${this.state.playerName}" trên máy của bạn!`);
    }
  }

  openCharacterConfigModal() {
    this._syncIntroFormFromState();
    const closeBtn = document.getElementById('btn-close-intro');
    if (closeBtn) {
      if (this.state.isGameStarted) closeBtn.classList.remove('hidden');
      else closeBtn.classList.add('hidden');
    }
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn && this.state.isGameStarted) {
      startBtn.textContent = '💾 Lưu Thay Đổi Nhân Vật & Quay Lại Game';
    }
    document.getElementById('intro-overlay').classList.remove('hidden');
  }

  // =======================================================================
  // PAID RELOCATION / REARRANGE MODE (NGOÀI SÂN & TRONG NHÀ)
  // =======================================================================
  _bindMoveLayoutUI() {
    const toggleMove = () => {
      if (this.state.isMoveMode) {
        this.closeMoveLayoutMode();
      } else {
        this.openMoveLayoutMode();
      }
    };

    const btnTopMove = document.getElementById('btn-top-move');
    if (btnTopMove) btnTopMove.addEventListener('click', toggleMove);

    const btnDockMove = document.getElementById('btn-dock-move');
    if (btnDockMove) btnDockMove.addEventListener('click', toggleMove);

    const btnCloseMove = document.getElementById('btn-close-move-panel');
    if (btnCloseMove) {
      btnCloseMove.addEventListener('click', () => {
        this.closeMoveLayoutMode();
      });
    }

    const moveSelect = document.getElementById('move-item-select');
    if (moveSelect) {
      moveSelect.addEventListener('change', (e) => {
        const key = e.target.value;
        if (key) {
          this.world.selectMovableItem(key);
          this.renderMoveLayoutPanel();
        }
      });
    }
  }

  openMoveLayoutMode() {
    if (this.state.isSleeping) return;
    this.state.isMoveMode = true;
    this.world.setMoveMode(true);
    document.getElementById('station-props-panel').classList.add('hidden');
    document.getElementById('hud-pets-panel').classList.add('hidden');
    document.getElementById('move-layout-panel').classList.remove('hidden');
    this.renderMoveLayoutPanel();
    this.refreshHUD();
    this.showToast('📐 Chế độ Sắp Xếp Vị Trí: Chọn 1 mục trong Drop list bên phải rồi Click chuột lên mặt đất / sàn nhà để chuyển vị trí.');
  }

  closeMoveLayoutMode() {
    this.state.isMoveMode = false;
    this.world.setMoveMode(false);
    document.getElementById('move-layout-panel').classList.add('hidden');
    this.refreshHUD();
  }

  renderMoveLayoutPanel() {
    const isInterior = this.state.isInsideHouse;
    const titleEl = document.getElementById('move-panel-title');
    const instEl = document.getElementById('move-panel-instruction');
    const listEl = document.getElementById('move-items-list');
    const moveSelect = document.getElementById('move-item-select');
    listEl.innerHTML = '';
    if (moveSelect) moveSelect.innerHTML = '<option value="">-- Chọn hạng mục cần di chuyển --</option>';

    titleEl.textContent = isInterior
      ? '📐 Kê Lại Đồ Nội Thất & Gia Dụng (-Xu)'
      : '📐 Di Chuyển Nhà, Vườn, Chuồng Gà, Lửa (-Xu)';

    const selectedId = this.world.moveMode.selectedId;
    if (selectedId) {
      instEl.innerHTML = `✅ Đang chọn: <strong style="color:#fde047;">${this.world.moveMode.selectedName}</strong> (-${this.world.moveMode.cost} 🪙).<br>👉 Hãy <strong>Click chuột lên vị trí mới</strong> trên mặt đất / sàn nhà!`;
    } else {
      instEl.innerHTML = `Chọn công trình / đồ vật trong Drop list bên dưới, sau đó <strong>Click lên mặt đất / sàn nhà</strong> nơi muốn đặt:`;
    }

    const dict = isInterior ? this.state.interiorLayout : this.state.exteriorLayout;
    const homeLevel = 1 + this.state.ownedUpgrades.length;

    Object.keys(dict).forEach((key) => {
      const item = dict[key];
      if (!isInterior) {
        if (key === 'windmill' && this.state.ownedUpgrades.indexOf('koi_windmill') === -1) return;
        if (key === 'bell' && this.state.ownedUpgrades.indexOf('sanctuary_bell') === -1) return;
      } else {
        if (!this.world.isInteriorItemVisible(item, homeLevel)) return;
      }

      if (moveSelect) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = `${item.icon} ${item.name} (-${item.moveCost} Xu • Tọa độ ${Math.round(item.x)}, ${Math.round(item.z)})`;
        if (selectedId === key) opt.selected = true;
        moveSelect.appendChild(opt);
      }

      const isSel = selectedId === key;
      const row = document.createElement('div');
      row.className = `st-prop-item ${isSel ? 'active-move' : ''}`;
      row.innerHTML = `
        <div class="st-prop-info">
          <div class="st-prop-name">${item.icon} ${item.name}</div>
          <div class="st-prop-bonus">Phí chuyển: -${item.moveCost} 🪙 • Tọa độ (${Math.round(item.x)}, ${Math.round(item.z)})</div>
        </div>
        <button type="button" class="btn-buy-st-prop">
          ${isSel ? '📍 Đang chọn' : 'Chọn'}
        </button>
      `;

      row.querySelector('.btn-buy-st-prop').addEventListener('click', () => {
        this.world.selectMovableItem(key);
        this.renderMoveLayoutPanel();
      });

      listEl.appendChild(row);
    });
  }

  executeRelocateItem(mode, itemId, newPos, cost, itemName) {
    if (this.state.coins < cost) {
      this.showToast(`⚠️ Bạn cần ${cost} Xu để di chuyển "${itemName}"! Hãy chặt củi, trồng rau hoặc giải đố kiếm thêm Xu nhé.`);
      return;
    }

    this.state.coins -= cost;
    if (mode === 'interior') {
      this.state.interiorLayout[itemId].x = newPos.x;
      this.state.interiorLayout[itemId].z = newPos.z;
    } else {
      this.state.exteriorLayout[itemId].x = newPos.x;
      this.state.exteriorLayout[itemId].z = newPos.z;
    }

    this.world.setLayouts(this.state.exteriorLayout, this.state.interiorLayout);
    this.world.spawnFloatingText(`-${cost} 🪙 (Đã dời ${itemName})`, newPos.x, 2.2, newPos.z, '#fde047');
    window.audioEngine.playUpgradeSfx();

    this._completeQuest('q_move_layout');
    this.showToast(`📐 Đã chuyển vị trí "${itemName}" tới tọa độ mới (-${cost} Xu)!`);
    this.renderMoveLayoutPanel();
    this.refreshHUD();
    this._saveState();
  }

  // =======================================================================
  // HUD, STREAMLINED PANEL TOGGLES & CORE GAMEPLAY ACTIONS
  // =======================================================================
  applyHudPanelVisibility() {
    const p = this.state.uiPanels || { left: true, music: true, pets: false, cleanMode: false };
    const leftPanel = document.getElementById('hud-left-panel');
    const musicPanel = document.getElementById('hud-music-panel');
    const petsPanel = document.getElementById('hud-pets-panel');

    const btnLeft = document.getElementById('btn-toggle-left-panel');
    const btnMusic = document.getElementById('btn-toggle-music-panel');
    const btnPets = document.getElementById('btn-toggle-pets-panel');
    const btnClean = document.getElementById('btn-toggle-clean-hud');

    if (p.cleanMode) {
      if (leftPanel) leftPanel.classList.add('hidden');
      if (musicPanel) musicPanel.classList.add('hidden');
      if (petsPanel) petsPanel.classList.add('hidden');
      if (btnLeft) btnLeft.classList.remove('active-toggle');
      if (btnMusic) btnMusic.classList.remove('active-toggle');
      if (btnPets) btnPets.classList.remove('active-toggle');
      if (btnClean) {
        btnClean.classList.add('active-toggle');
        btnClean.textContent = '👁️ Hiện HUD';
      }
      return;
    }

    if (btnClean) {
      btnClean.classList.remove('active-toggle');
      btnClean.textContent = '👁️ Gọn';
    }

    if (leftPanel) {
      leftPanel.classList.toggle('hidden', !p.left);
    }
    if (btnLeft) {
      btnLeft.classList.toggle('active-toggle', !!p.left);
    }

    if (musicPanel) {
      musicPanel.classList.toggle('hidden', !p.music);
    }
    if (btnMusic) {
      btnMusic.classList.toggle('active-toggle', !!p.music);
    }

    if (petsPanel) {
      petsPanel.classList.toggle('hidden', !p.pets);
      if (p.pets) this.renderPetsManagementPanel();
    }
    if (btnPets) {
      btnPets.classList.toggle('active-toggle', !!p.pets);
    }
  }

  _bindHudUI() {
    const applyMood = (moodKey) => {
      if (!window.GAME_DATA.moods[moodKey]) return;
      this.state.mood = moodKey;
      this.world.buildCharacter({
        name: this.state.playerName,
        gender: this.state.gender,
        age: this.state.age,
        mood: this.state.mood,
        style: this.state.style,
        equippedCostume: this.state.equippedCostume
      });
      const moodObj = window.GAME_DATA.moods[this.state.mood];
      const randomQuote = moodObj.quotes[Math.floor(Math.random() * moodObj.quotes.length)];
      document.getElementById('hud-thought-text').textContent = randomQuote;
      this.refreshHUD();
      this._saveState();
      this.showToast(`${moodObj.emoji} Đã lưu khuôn mặt & tâm trạng: ${moodObj.label}`);
    };

    const cycleMood = () => {
      const order = ['bored', 'funny', 'cute', 'zen'];
      const nextIdx = (order.indexOf(this.state.mood) + 1) % order.length;
      applyMood(order[nextIdx]);
    };

    document.getElementById('hud-avatar-emoji').addEventListener('click', cycleMood);
    document.getElementById('btn-next-thought').addEventListener('click', cycleMood);

    // Quick Save Character Config & Reopen Character Config Modal
    const btnOpenChar = document.getElementById('btn-open-char-config');
    if (btnOpenChar) {
      btnOpenChar.addEventListener('click', () => this.openCharacterConfigModal());
    }
    const btnSaveQuick = document.getElementById('btn-SaveCharQuick');
    if (btnSaveQuick) {
      btnSaveQuick.addEventListener('click', () => {
        this._saveState();
        this.showToast(`💾 Đã lưu cấu hình nhân vật "${this.state.playerName}" trên máy của bạn!`);
      });
    }

    // World Traditional Costumes Slot / Buttons ("👘 Ô Trang Phục")
    const openCostumes = () => this.openCostumeModal('all');
    const btnCostumesTop = document.getElementById('btn-open-costumes-top');
    if (btnCostumesTop) btnCostumesTop.addEventListener('click', openCostumes);
    const btnCostumeSlot = document.getElementById('btn-open-costume-slot');
    if (btnCostumeSlot) btnCostumeSlot.addEventListener('click', openCostumes);
    const btnDockCostumes = document.getElementById('btn-dock-costumes');
    if (btnDockCostumes) btnDockCostumes.addEventListener('click', openCostumes);

    // Streamlined Panel Toggles (with mobile mutual exclusion so panels never stack over the 3D viewport)
    const togglePanel = (key) => {
      this.state.uiPanels.cleanMode = false;
      const nextVal = !this.state.uiPanels[key];
      if (this.isMobileViewport() && nextVal) {
        this.state.uiPanels.left = false;
        this.state.uiPanels.music = false;
        this.state.uiPanels.pets = false;
        const stPanel = document.getElementById('station-props-panel');
        if (stPanel) stPanel.classList.add('hidden');
      }
      this.state.uiPanels[key] = nextVal;
      this.applyHudPanelVisibility();
      this._saveState();
    };

    document.getElementById('btn-toggle-left-panel').addEventListener('click', () => togglePanel('left'));
    document.getElementById('btn-close-left-panel').addEventListener('click', () => {
      this.state.uiPanels.left = false;
      this.applyHudPanelVisibility();
      this._saveState();
    });

    document.getElementById('btn-toggle-music-panel').addEventListener('click', () => togglePanel('music'));
    document.getElementById('btn-close-music-panel').addEventListener('click', () => {
      this.state.uiPanels.music = false;
      this.applyHudPanelVisibility();
      this._saveState();
    });

    document.getElementById('btn-toggle-pets-panel').addEventListener('click', () => togglePanel('pets'));
    document.getElementById('btn-close-pets-panel').addEventListener('click', () => {
      this.state.uiPanels.pets = false;
      this.applyHudPanelVisibility();
      this._saveState();
    });

    document.getElementById('btn-toggle-clean-hud').addEventListener('click', () => {
      this.state.uiPanels.cleanMode = !this.state.uiPanels.cleanMode;
      if (this.state.uiPanels.cleanMode) {
        document.getElementById('station-props-panel').classList.add('hidden');
      }
      this.applyHudPanelVisibility();
      this.showToast(
        this.state.uiPanels.cleanMode
          ? '👁️ Đã thu gọn các bảng phụ để ngắm trọn khung cảnh 3D!'
          : '👁️ Đã mở lại các bảng chức năng!'
      );
    });

    const hudStyleSelect = document.getElementById('hud-select-style');
    if (hudStyleSelect) {
      hudStyleSelect.addEventListener('change', (e) => {
        this.applyOutfitSelection(e.target.value, true);
      });
    }

    // 3D Label Visibility & Custom Label Renaming Controls
    const getDefaultLabelForTarget = (targetKey) => {
      const regObj = (window.GAME_DATA.regions && window.GAME_DATA.regions[this.state.region]) || window.GAME_DATA.regions.mountain;
      const defaults = {
        player: this.state.playerName || 'Kẻ Mộng Mơ',
        pet_dog: '🐕 Cậu Vàng',
        pet_cat: '🐈 Hoàng Thượng',
        pet_bird: '🦜 Chim Hót ♪',
        farm_chickens: '🐓 Đàn Gà Đẻ Trứng',
        farm_ducks: '🦆 Đàn Vịt Bơi Suối',
        house: regObj && regObj.homeName ? `🏠 ${regObj.homeName}` : '🏠 Ngôi Nhà Chính',
        garden: regObj && regObj.gardenLabel ? regObj.gardenLabel : 'Vườn rau',
        work: regObj && regObj.workLabel ? regObj.workLabel : 'Chặt củi',
        poultry: 'Nuôi gà vịt',
        fish: regObj && regObj.fishLabel ? regObj.fishLabel : 'Câu cá',
        fire: regObj && regObj.fireLabel ? regObj.fireLabel : 'Pha trà & Đố vui',
        bed: 'Ngủ nướng (Cấp 1)',
        indoor_bed: 'Ngủ trên giường ấm',
        indoor_cook: 'Nấu bữa cơm quê',
        indoor_tv: 'Xem Tivi giải trí',
        fridge: '🧊 Tủ Lạnh 2 Cánh'
      };
      return defaults[targetKey] || targetKey;
    };

    const syncLabelUI = () => {
      if (!this.state.labelSettings) {
        this.state.labelSettings = { showCharacterLabels: true, showObjectLabels: true, customNames: {} };
      }
      const ls = this.state.labelSettings;
      const chkChar = document.getElementById('chk-label-char');
      const chkObj = document.getElementById('chk-label-obj');
      const btnTopLabels = document.getElementById('btn-toggle-labels');
      const targetSel = document.getElementById('select-label-target');
      const customInput = document.getElementById('input-custom-label');

      if (chkChar) chkChar.checked = ls.showCharacterLabels !== false;
      if (chkObj) chkObj.checked = ls.showObjectLabels !== false;
      if (btnTopLabels) {
        const anyOn = ls.showCharacterLabels !== false || ls.showObjectLabels !== false;
        btnTopLabels.classList.toggle('active-toggle', anyOn);
        btnTopLabels.textContent = anyOn ? '🏷️ Nhãn' : '🏷️ Ẩn nhãn';
      }
      if (targetSel && customInput) {
        const key = targetSel.value;
        const customVal = (ls.customNames && ls.customNames[key]) || '';
        customInput.value = customVal;
        customInput.placeholder = `Mặc định: ${getDefaultLabelForTarget(key)}`;
      }
      if (this.world) {
        this.world.setLabelSettings(ls);
      }
    };
    this._syncLabelUI = syncLabelUI;

    const chkLabelChar = document.getElementById('chk-label-char');
    if (chkLabelChar) {
      chkLabelChar.addEventListener('change', (e) => {
        this.state.labelSettings.showCharacterLabels = !!e.target.checked;
        syncLabelUI();
        this._saveState();
        this.showToast(
          this.state.labelSettings.showCharacterLabels
            ? '🏷️ Đã hiện nhãn tên trên Nhân vật & Thú cưng!'
            : '🏷️ Đã ẩn nhãn tên trên Nhân vật & Thú cưng cho gọn gàng!'
        );
      });
    }

    const chkLabelObj = document.getElementById('chk-label-obj');
    if (chkLabelObj) {
      chkLabelObj.addEventListener('change', (e) => {
        this.state.labelSettings.showObjectLabels = !!e.target.checked;
        syncLabelUI();
        this._saveState();
        this.showToast(
          this.state.labelSettings.showObjectLabels
            ? '🏷️ Đã hiện nhãn tên trên Đồ vật & Công trình!'
            : '🏷️ Đã ẩn nhãn tên trên Đồ vật & Công trình cho gọn gàng!'
        );
      });
    }

    const btnToggleLabels = document.getElementById('btn-toggle-labels');
    if (btnToggleLabels) {
      btnToggleLabels.addEventListener('click', () => {
        const ls = this.state.labelSettings;
        const turnOff = ls.showCharacterLabels !== false || ls.showObjectLabels !== false;
        ls.showCharacterLabels = !turnOff;
        ls.showObjectLabels = !turnOff;
        syncLabelUI();
        this._saveState();
        this.showToast(
          turnOff
            ? '🏷️ Đã ẩn toàn bộ nhãn 3D trên Nhân vật & Đồ vật!'
            : '🏷️ Đã hiện lại toàn bộ nhãn 3D trên Nhân vật & Đồ vật!'
        );
      });
    }

    const selLabelTarget = document.getElementById('select-label-target');
    if (selLabelTarget) {
      selLabelTarget.addEventListener('change', () => {
        syncLabelUI();
      });
    }

    const saveCustomLabel = () => {
      const targetSel = document.getElementById('select-label-target');
      const customInput = document.getElementById('input-custom-label');
      if (!targetSel || !customInput) return;
      const key = targetSel.value;
      const newVal = customInput.value.trim().slice(0, 26);
      if (!this.state.labelSettings.customNames) {
        this.state.labelSettings.customNames = {};
      }
      if (newVal) {
        this.state.labelSettings.customNames[key] = newVal;
        if (key === 'player') {
          this.state.playerName = newVal;
          if (this.world) this.world.playerConfig.name = newVal;
        }
        this.showToast(`🏷️ Đã đổi tên nhãn hiển thị thành: "${newVal}"!`);
      } else {
        delete this.state.labelSettings.customNames[key];
        this.showToast(`🏷️ Đã khôi phục nhãn "${getDefaultLabelForTarget(key)}" về mặc định!`);
      }
      syncLabelUI();
      this.refreshHUD();
      this._saveState();
    };

    const btnSaveCustomLabel = document.getElementById('btn-save-custom-label');
    if (btnSaveCustomLabel) {
      btnSaveCustomLabel.addEventListener('click', saveCustomLabel);
    }
    const inputCustomLabel = document.getElementById('input-custom-label');
    if (inputCustomLabel) {
      inputCustomLabel.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveCustomLabel();
        }
      });
    }

    const btnResetCustomLabels = document.getElementById('btn-reset-custom-labels');
    if (btnResetCustomLabels) {
      btnResetCustomLabels.addEventListener('click', () => {
        this.state.labelSettings = {
          showCharacterLabels: true,
          showObjectLabels: true,
          customNames: {}
        };
        syncLabelUI();
        this.refreshHUD();
        this._saveState();
        this.showToast('🏷️ Đã khôi phục toàn bộ nhãn tên 3D về mặc định!');
      });
    }
    syncLabelUI();

    const hudMoodSelect = document.getElementById('hud-select-mood');
    if (hudMoodSelect) {
      hudMoodSelect.addEventListener('change', (e) => {
        const m = e.target.value;
        if (m) applyMood(m);
      });
    }

    const hudAgeSelect = document.getElementById('hud-select-age');
    if (hudAgeSelect) {
      hudAgeSelect.addEventListener('change', (e) => {
        const a = e.target.value;
        if (a && window.GAME_DATA.ages[a]) {
          this.state.age = a;
          this.world.buildCharacter({
            gender: this.state.gender,
            age: this.state.age,
            mood: this.state.mood,
            style: this.state.style,
            equippedCostume: this.state.equippedCostume
          });
          this.refreshHUD();
          this._saveState();
          const ageObj = window.GAME_DATA.ages[a];
          this.showToast(`👤 Đã lưu độ tuổi nhân vật: ${ageObj.name} (${ageObj.perkText})`);
        }
      });
    }

    // Weather Selection Controls (Top Bar next to Character, Audio Panel & Weather Status Pill)
    const topWeatherSelect = document.getElementById('hud-select-weather-top');
    if (topWeatherSelect) {
      topWeatherSelect.addEventListener('change', (e) => {
        this.setWeatherById(e.target.value, true);
      });
    }

    const audioWeatherSelect = document.getElementById('select-weather-audio');
    if (audioWeatherSelect) {
      audioWeatherSelect.addEventListener('change', (e) => {
        this.setWeatherById(e.target.value, true);
      });
    }

    const hudWeatherLabel = document.getElementById('hud-weather-label');
    if (hudWeatherLabel) {
      hudWeatherLabel.style.cursor = 'pointer';
      hudWeatherLabel.title = 'Bấm để chuyển đổi nhanh qua 7 kiểu thời tiết & âm thanh thiên nhiên';
      hudWeatherLabel.addEventListener('click', () => {
        const nextIdx = (this.state.weatherIndex + 1) % this.weatherCycle.length;
        const nextW = this.weatherCycle[nextIdx];
        if (nextW) this.setWeatherById(nextW.id, true);
      });
    }

    const btnCycleWeather = document.getElementById('btn-cycle-weather');
    if (btnCycleWeather) {
      btnCycleWeather.addEventListener('click', () => {
        const nextIdx = (this.state.weatherIndex + 1) % this.weatherCycle.length;
        const nextW = this.weatherCycle[nextIdx];
        if (nextW) this.setWeatherById(nextW.id, true);
      });
    }

    const toggleHouse = () => {
      if (this.state.isInsideHouse) {
        this.exitHouse();
      } else {
        this.enterHouse();
      }
    };
    const btnTopHouse = document.getElementById('btn-toggle-house');
    if (btnTopHouse) btnTopHouse.addEventListener('click', toggleHouse);
    const btnDockHouse = document.getElementById('btn-dock-house');
    if (btnDockHouse) btnDockHouse.addEventListener('click', toggleHouse);

    document.getElementById('btn-close-station-panel').addEventListener('click', () => {
      document.getElementById('station-props-panel').classList.add('hidden');
      this.state.activeStationKey = null;
    });

    // Music Sanctuary: One-Click Theme Pills + Theme Drop List + Track Drop List + Prev/Next + Safari-ready Mute
    const musicPanelEl = document.getElementById('hud-music-panel');
    const musicThemeSelect = document.getElementById('select-music-theme');
    const musicChannelSelect = document.getElementById('select-music-channel');
    const musicThemePillsWrap = document.getElementById('music-theme-pills');

    const musicCatalogByTheme = {
      chill: {
        groupLabel: '🎸 Chủ đề 1: Nhạc Chill',
        tracks: [
          { id: 'chill', label: '🎸 Chill 1: Acoustic Đồng Quê & Gió Thảo Nguyên' },
          { id: 'chill_lofi', label: '☕ Chill 2: Lofi Mưa Hiên Nhà & Đàn Guitar Ấm' },
          { id: 'chill_sunset', label: '🌇 Chill 3: Hoàng Hôn Bản Nhỏ (Dreamy Pad)' }
        ]
      },
      gentle: {
        groupLabel: '🎹 Chủ đề 2: Nhạc Nhẹ Nhàng',
        tracks: [
          { id: 'gentle', label: '🎹 Nhẹ Nhàng 1: Piano Sương Mai Tinh Khôi' },
          { id: 'gentle_waltz', label: '🍃 Nhẹ Nhàng 2: Bản Waltz Đồi Hoa (3/4 Êm Dịu)' },
          { id: 'gentle_lullaby', label: '🌙 Nhẹ Nhàng 3: Khúc Ru Đêm Trăng Thanh (Music Box)' }
        ]
      },
      water: {
        groupLabel: '🏞️ Chủ đề 3: Nước Chảy & Thiên Nhiên',
        tracks: [
          { id: 'water', label: '🏞️ Nước Chảy 1: Suối Đá Róc Rách & Sáo Trúc' },
          { id: 'water_rain', label: '🌧️ Nước Chảy 2: Mưa Rào Mái Hiên & Chuông Gió' },
          { id: 'water_sea', label: '🌊 Nước Chảy 3: Sóng Biển Rì Rào & Đàn Harp' }
        ]
      },
      zen: {
        groupLabel: '🪷 Chủ đề 4: Nhạc Thiền Tịnh Tâm',
        tracks: [
          { id: 'zen', label: '🪷 Nhạc Thiền 1: Chuông Xoay Himalaya 432Hz' },
          { id: 'zen_bamboo', label: '🎋 Nhạc Thiền 2: Rừng Trúc Tĩnh Lặng & Cổ Cầm' }
        ]
      },
      catholic: {
        groupLabel: '⛪ Chủ đề 5: Nhạc Công Giáo',
        tracks: [
          { id: 'catholic', label: '⛪ Nhạc Công Giáo 1: Thánh Ca Organ & Chuông Chiều' },
          { id: 'catholic_ave', label: '🙏 Nhạc Công Giáo 2: Khúc Nguyện Cầu Ave Maria' }
        ]
      }
    };

    const getThemeOfTrack = (trackId) => {
      if (!trackId) return 'chill';
      if (trackId.indexOf('chill') === 0) return 'chill';
      if (trackId.indexOf('gentle') === 0) return 'gentle';
      if (trackId.indexOf('water') === 0) return 'water';
      if (trackId.indexOf('zen') === 0) return 'zen';
      if (trackId.indexOf('catholic') === 0) return 'catholic';
      return 'chill';
    };

    // Rebuild <select id="select-music-channel"> without disabled/hidden optgroups (100% Safari native popup compatible)
    const rebuildMusicChannelOptions = (themeFilter, selectedTrackId) => {
      if (!musicChannelSelect) return;
      const themeKeys = (themeFilter && themeFilter !== 'all' && musicCatalogByTheme[themeFilter])
        ? [themeFilter]
        : ['chill', 'gentle', 'water', 'zen', 'catholic'];

      musicChannelSelect.innerHTML = '';
      themeKeys.forEach((tk) => {
        const groupInfo = musicCatalogByTheme[tk];
        if (!groupInfo) return;
        const optgroup = document.createElement('optgroup');
        optgroup.label = groupInfo.groupLabel;
        groupInfo.tracks.forEach((tr) => {
          const opt = document.createElement('option');
          opt.value = tr.id;
          opt.textContent = tr.label;
          if (tr.id === selectedTrackId) {
            opt.selected = true;
          }
          optgroup.appendChild(opt);
        });
        musicChannelSelect.appendChild(optgroup);
      });
      if (selectedTrackId) {
        musicChannelSelect.value = selectedTrackId;
      }
    };

    const updateMusicUI = (title) => {
      const curCh = window.audioEngine.currentChannel || 'chill';
      const curTheme = getThemeOfTrack(curCh);
      const nowPlayingEl = document.getElementById('now-playing-title');
      if (nowPlayingEl && title) nowPlayingEl.textContent = title;
      if (musicChannelSelect) {
        if (musicThemeSelect && musicThemeSelect.value !== 'all' && musicThemeSelect.value !== curTheme) {
          musicThemeSelect.value = 'all';
          rebuildMusicChannelOptions('all', curCh);
        }
        musicChannelSelect.value = curCh;
      }
      if (musicThemePillsWrap && musicThemePillsWrap.querySelectorAll) {
        const pills = musicThemePillsWrap.querySelectorAll('.music-pill-btn');
        for (let i = 0; i < pills.length; i++) {
          const pTheme = pills[i].getAttribute('data-mtheme');
          if (pills[i].classList) {
            pills[i].classList.toggle('active', pTheme === curTheme);
          }
        }
      }
      const muteBtn = document.getElementById('btn-toggle-mute');
      if (muteBtn) {
        muteBtn.textContent = window.audioEngine.isMuted ? '🔇 Đang Tắt' : '🔊 Đang Bật';
      }
      const dotEl = document.getElementById('audio-live-dot');
      if (dotEl) {
        dotEl.style.opacity = window.audioEngine.isMuted ? '0.2' : '1';
      }
      if (this.state.audioSettings) {
        this.state.audioSettings.channel = curCh;
        this.state.audioSettings.isMuted = !!window.audioEngine.isMuted;
      }
    };

    // Unlock Safari audio immediately when clicking anywhere inside the Music Control Panel
    if (musicPanelEl) {
      musicPanelEl.addEventListener('click', (e) => {
        if (e && e.target && typeof e.target.closest === 'function') {
          if (e.target.closest('#btn-toggle-mute') || e.target.closest('#btn-close-music-panel')) {
            return;
          }
        }
        if (!window.audioEngine.isMuted) {
          window.audioEngine.init();
        }
      });
    }

    if (musicThemePillsWrap) {
      musicThemePillsWrap.addEventListener('click', (e) => {
        const btn = e && e.target && typeof e.target.closest === 'function'
          ? e.target.closest('.music-pill-btn')
          : null;
        if (!btn) return;
        const theme = btn.getAttribute('data-mtheme') || 'chill';
        const groupInfo = musicCatalogByTheme[theme] || musicCatalogByTheme.chill;
        const curCh = window.audioEngine.currentChannel || 'chill';
        let targetTrack = groupInfo.tracks[0].id;
        // If already playing a track in this theme, cycle to the next track in the same theme!
        const curIdxInTheme = groupInfo.tracks.findIndex(t => t.id === curCh);
        if (curIdxInTheme !== -1) {
          targetTrack = groupInfo.tracks[(curIdxInTheme + 1) % groupInfo.tracks.length].id;
        }
        if (musicThemeSelect) {
          musicThemeSelect.value = theme;
        }
        rebuildMusicChannelOptions(theme, targetTrack);
        const title = window.audioEngine.setChannel(targetTrack);
        updateMusicUI(title);
        this._saveState();
        this.showToast(`🎵 Đang phát: ${title}`);
      });
    }

    if (musicThemeSelect && musicChannelSelect) {
      const themeStarterMap = {
        all: 'chill',
        chill: 'chill',
        gentle: 'gentle',
        water: 'water',
        zen: 'zen',
        catholic: 'catholic'
      };
      musicThemeSelect.addEventListener('change', (e) => {
        const theme = e.target.value || 'all';
        const targetTrack = theme === 'all'
          ? (window.audioEngine.currentChannel || 'chill')
          : (themeStarterMap[theme] || 'chill');
        rebuildMusicChannelOptions(theme, targetTrack);
        const title = window.audioEngine.setChannel(targetTrack);
        updateMusicUI(title);
        this._saveState();
        this.showToast(`🎵 Đã chuyển chủ đề nhạc: ${title}`);
      });
    }

    if (musicChannelSelect) {
      const handleChannelSelect = (e) => {
        const ch = e.target.value;
        if (!ch || ch === window.audioEngine.currentChannel) return;
        const title = window.audioEngine.setChannel(ch);
        updateMusicUI(title);
        this._saveState();
        this.showToast(`🎶 Đang phát: ${title}`);
      };
      musicChannelSelect.addEventListener('change', handleChannelSelect);
      musicChannelSelect.addEventListener('input', handleChannelSelect);
    }

    const btnPrevTrack = document.getElementById('btn-prev-track');
    if (btnPrevTrack) {
      btnPrevTrack.addEventListener('click', () => {
        if (musicThemeSelect && musicThemeSelect.value !== 'all') {
          musicThemeSelect.value = 'all';
          rebuildMusicChannelOptions('all', window.audioEngine.currentChannel);
        }
        const title = window.audioEngine.prevChannel();
        updateMusicUI(title);
        this._saveState();
        this.showToast(`⏮ ${title}`);
      });
    }

    const btnNextTrack = document.getElementById('btn-next-track');
    if (btnNextTrack) {
      btnNextTrack.addEventListener('click', () => {
        if (musicThemeSelect && musicThemeSelect.value !== 'all') {
          musicThemeSelect.value = 'all';
          rebuildMusicChannelOptions('all', window.audioEngine.currentChannel);
        }
        const title = window.audioEngine.nextChannel();
        updateMusicUI(title);
        this._saveState();
        this.showToast(`⏭ ${title}`);
      });
    }

    document.getElementById('btn-toggle-mute').addEventListener('click', (e) => {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      const muted = window.audioEngine.toggleMute();
      const btnEl = e.currentTarget || document.getElementById('btn-toggle-mute');
      if (btnEl) {
        btnEl.textContent = muted ? '🔇 Đang Tắt' : '🔊 Đang Bật';
      }
      const dotEl = document.getElementById('audio-live-dot');
      if (dotEl) dotEl.style.opacity = muted ? '0.2' : '1';
      if (this.state.audioSettings) {
        this.state.audioSettings.isMuted = muted;
      }
      this._saveState();
      if (window.audioEngine.usesSafariMusic) {
        window.audioEngine._syncAudioStatusUI();
        if (!muted) return;
      }
      this.showToast(muted ? '🔇 Đã tạm tắt tiếng nhạc & suối chảy.' : `🔊 Đã bật nhạc: ${window.audioEngine.channelTitles[window.audioEngine.currentChannel]}`);
    });

    document.getElementById('slider-music-vol').addEventListener('input', (e) => {
      window.audioEngine.setMusicVolume(Number(e.target.value));
    });

    document.getElementById('slider-nature-vol').addEventListener('input', (e) => {
      window.audioEngine.setNatureVolume(Number(e.target.value));
    });

    // Dock & Action Buttons
    document.getElementById('btn-open-shop').addEventListener('click', () => this.openShopModal('all'));
    document.getElementById('btn-open-travel').addEventListener('click', () => this.openTravelModal());

    document.getElementById('btn-act-work').addEventListener('click', () => this.performWork('work'));
    document.getElementById('btn-act-garden').addEventListener('click', () => this.performWork('garden'));
    document.getElementById('btn-act-poultry').addEventListener('click', () => this.performPoultryCare());
    document.getElementById('btn-act-fish').addEventListener('click', () => this.performFishing());
    document.getElementById('btn-act-kitchen').addEventListener('click', () => this.performKitchenOrTV());
    document.getElementById('btn-act-quiz').addEventListener('click', () => this.openQuizModal());
    document.getElementById('btn-act-sleep').addEventListener('click', () => this.startSleeping());
    document.getElementById('btn-open-upgrade').addEventListener('click', () => this.openUpgradeModal());
    document.getElementById('btn-wake-up').addEventListener('click', () => this.stopSleeping());

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE' && !this.state.isSleeping && this.world) {
        const nearest = this.world.getNearestInteractable();
        if (nearest) this._triggerInteractable(nearest.id);
      }
    });

    document.getElementById('proximity-prompt').addEventListener('click', () => {
      const nearest = this.world.getNearestInteractable();
      if (nearest) this._triggerInteractable(nearest.id);
    });
  }

  setWeatherById(weatherId, showNotification = true) {
    let idx = this.weatherCycle.findIndex(w => w.id === weatherId);
    if (idx === -1) idx = 0;
    this.state.weatherIndex = idx;
    const w = this.weatherCycle[idx];

    if (this.world) {
      this.world.setWeather(w.id);
    }

    if (window.audioEngine) {
      window.audioEngine.setWeatherSound(w.id);
    }

    this.refreshHUD();
    this._saveState();

    if (showNotification) {
      this.showToast(`🌦️ Đã chọn thời tiết: ${w.label} • 🔊 Âm thanh: ${w.soundDesc}`);
    }
  }

  _triggerInteractable(id) {
    if (id && id.indexOf('land_plot_') === 0) {
      this.performExpandedLandWork(id);
      return;
    }
    if (id === 'enter_house') this.enterHouse();
    else if (id === 'exit_house') this.exitHouse();
    else if (id === 'upgrade_house') this.openUpgradeModal();
    else if (id === 'interior_tea') this.openQuizModal();
    else if (id === 'cook_food') this.performCooking();
    else if (id === 'watch_tv') this.performWatchTV();
    else if (id === 'work') this.performWork('work');
    else if (id === 'garden') this.performWork('garden');
    else if (id === 'poultry') this.performPoultryCare();
    else if (id === 'fish') this.performFishing();
    else if (id === 'sleep') this.startSleeping();
    else if (id === 'quiz') this.openQuizModal();
  }

  // =======================================================================
  // ENTER / EXIT SPACIOUS HOUSE INTERIOR
  // =======================================================================
  enterHouse() {
    if (this.state.isSleeping) return;
    const hPos = this.state.exteriorLayout.house;
    const doEnter = () => {
      this.state.isInsideHouse = true;
      this.world.enterHouseInterior();
      this._completeQuest('q_enter_house');
      if (this.state.isMoveMode) this.renderMoveLayoutPanel();

      const level = 1 + this.state.ownedUpgrades.length;
      const stageInfo = window.GAME_DATA.homeInteriorStages[Math.min(5, level - 1)];
      this.showToast(`🏠 Đã vào trong nhà (${stageInfo.title})! Bạn có thể nấu ăn, xem Tivi hoặc bấm "Sắp Xếp" để kê lại đồ đạc.`);
      this.refreshHUD();
    };

    if (!this.state.isInsideHouse) {
      this.world.movePlayerToAndAct({ x: hPos.x, y: 0, z: hPos.z + 2.2 }, 'idle', 0.2, doEnter, 'Đang bước vào nhà...');
    } else {
      doEnter();
    }
  }

  exitHouse() {
    this.state.isInsideHouse = false;
    this.world.exitHouseExterior();
    if (this.state.isMoveMode) this.renderMoveLayoutPanel();
    this.showToast('🌿 Bạn đã bước ra ngoài khuôn viên sân vườn rộng rãi!');
    this.refreshHUD();
  }

  // =======================================================================
  // STATION ADD-ON PROPS PANEL (QUICK VIEW LINKED TO SURVIVAL SHOP)
  // =======================================================================
  showStationPropsMenu(stationKey) {
    if (this.state.isMoveMode || (this.state.uiPanels && this.state.uiPanels.cleanMode)) return;
    const cfg = window.GAME_DATA.stationProps[stationKey];
    if (!cfg) return;
    this.state.activeStationKey = stationKey;

    const panel = document.getElementById('station-props-panel');
    document.getElementById('station-panel-title').textContent = cfg.stationTitle;
    const listEl = document.getElementById('station-props-list');
    listEl.innerHTML = '';

    cfg.items.forEach((item) => {
      const owned = this.hasStationProp(item.id);
      const canAfford = this.state.coins >= item.cost;

      const row = document.createElement('div');
      row.className = `st-prop-item ${owned ? 'owned' : ''}`;
      row.innerHTML = `
        <div class="st-prop-info">
          <div class="st-prop-name">${item.icon} ${item.name}</div>
          <div class="st-prop-bonus">+${item.bonusCoins} Xu/lần • ${owned ? 'Đã lắp đặt' : `Giá: ${item.cost} 🪙`}</div>
        </div>
        <button type="button" class="btn-buy-st-prop" ${owned || !canAfford ? 'disabled' : ''}>
          ${owned ? '✅ Đã có' : `Mua (-${item.cost}🪙)`}
        </button>
      `;

      if (!owned) {
        const btn = row.querySelector('.btn-buy-st-prop');
        btn.addEventListener('click', () => this.buyStationProp(stationKey, item));
      }
      listEl.appendChild(row);
    });

    panel.classList.remove('hidden');
  }

  buyStationProp(stationKey, item) {
    if (this.state.coins < item.cost || this.hasStationProp(item.id)) return;
    this.state.coins -= item.cost;
    this.state.ownedStationProps.push(item.id);
    this.state.peace = Math.min(this.state.maxPeace, this.state.peace + 5);

    this.world.setStationProps(this.state.ownedStationProps);
    this.world.spawnFloatingText(`-${item.cost} 🪙 (${item.name})`, this.world.playerPos.x, 2.2, this.world.playerPos.z, '#fde047');
    window.audioEngine.playUpgradeSfx();

    this._completeQuest('q_buy_tool');
    this.showToast(`🪑 Đã mua "${item.name}" (-${item.cost} Xu) từ Cửa Hàng Sinh Tồn!`);
    if (this.state.activeStationKey) {
      this.showStationPropsMenu(this.state.activeStationKey);
    }
    this.renderShopItems();
    this.refreshHUD();
    this._saveState();
  }

  hasStationProp(propId) {
    return this.state.ownedStationProps.indexOf(propId) !== -1;
  }

  getStationPropsBonusCoins(stationKey) {
    const cfg = window.GAME_DATA.stationProps[stationKey];
    if (!cfg) return 0;
    return cfg.items
      .filter(it => this.hasStationProp(it.id))
      .reduce((sum, it) => sum + it.bonusCoins, 0);
  }

  hasTool(toolId) {
    return this.state.ownedTools.indexOf(toolId) !== -1;
  }

  hasCostume(costumeId) {
    return (this.state.ownedCostumes || []).indexOf(costumeId) !== -1;
  }

  hasLandExpansion(expansionId) {
    return (this.state.ownedLandExpansions || []).indexOf(expansionId) !== -1;
  }

  getEquippedCostumeObject() {
    if (!this.state.equippedCostume) return null;
    const list = window.GAME_DATA.worldCostumes || [];
    return list.find(c => c.id === this.state.equippedCostume) || null;
  }

  getEnergyCost(baseCost = 12) {
    let cost = baseCost;
    if (this.hasTool('camping_stove')) cost -= 2;
    if (this.hasTool('app_cookware_set')) cost -= 1;
    if (this.hasTool('app_fridge')) cost -= 2;
    return Math.max(4, cost);
  }

  getCoinMultiplier() {
    const peaceBonus = 1 + (this.state.peace / 100) * 0.25;
    const weatherBonus = this.weatherCycle[this.state.weatherIndex].bonus;
    let toolMult = 1.0;
    if (this.hasTool('repair_kit')) toolMult += 0.2;
    if (this.hasTool('pet_dog')) toolMult += 0.08;
    if (this.hasTool('pet_cat')) toolMult += 0.08;
    const eqCostume = this.getEquippedCostumeObject();
    if (eqCostume && eqCostume.coinMultiplierBonus) {
      toolMult += eqCostume.coinMultiplierBonus;
    }
    return peaceBonus * weatherBonus * toolMult;
  }

  // =======================================================================
  // ACTIVE JOB SIMULATIONS (CHẶT CỦI, TRỒNG RAU, CÂU CÁ, NUÔI GÀ VỊT, NẤU ĂN)
  // =======================================================================
  performWork(type) {
    if (this.state.isSleeping) return;
    if (this.state.isInsideHouse) this.exitHouse();
    if (this.state.isMoveMode) this.closeMoveLayoutMode();

    this.showStationPropsMenu(type === 'garden' ? 'garden' : 'work');

    const energyCost = this.getEnergyCost(12);
    if (this.state.energy < energyCost) {
      this.showToast('🥱 Bạn đã thấm mệt rồi! Hãy "Ngủ Nướng" hoặc vào bếp "Nấu Ăn" để hồi phục Thể lực nhé.');
      return;
    }

    const reg = window.GAME_DATA.regions[this.state.region];
    const ageObj = window.GAME_DATA.ages[this.state.age];
    const ext = this.state.exteriorLayout;
    const targetPos = type === 'garden'
      ? { x: ext.garden.x, y: 0, z: ext.garden.z }
      : { x: ext.work.x, y: 0, z: ext.work.z };

    const simState = type === 'garden' ? 'garden' : 'work';
    const simLabel = type === 'garden' ? '🚿 Đang tưới rau & chăm vườn...' : '🪓 Đang bổ củi & chế tác gỗ...';

    this.world.movePlayerToAndAct(targetPos, simState, 2.6, () => {
      this.state.energy = Math.max(0, this.state.energy - energyCost);

      // Balanced base coins (7~11 coins) so player enjoys working & progressing
      let baseCoins = type === 'garden' ? (8 + Math.floor(Math.random() * 4)) : (7 + Math.floor(Math.random() * 4));
      baseCoins += this.getStationPropsBonusCoins(type === 'garden' ? 'garden' : 'work');

      if (type === 'garden') {
        if (this.state.ownedUpgrades.indexOf('veg_garden') !== -1) baseCoins *= 1.25;
        if (this.hasTool('watering_can')) baseCoins *= 1.3;
      } else {
        if (this.hasTool('shelter_kit')) baseCoins *= 1.25;
      }

      const earned = Math.max(1, Math.round(baseCoins * ageObj.workBonus * this.getCoinMultiplier()));
      this.state.coins += earned;

      const peaceGain = type === 'garden' ? (this.hasTool('watering_can') ? 7 : 4) : 3;
      this.state.peace = Math.min(this.state.maxPeace, this.state.peace + peaceGain);

      window.audioEngine.playWorkSfx();
      this.world.spawnFloatingText(`+${earned} 🪙`, targetPos.x, 2.5, targetPos.z, '#34d399');
      this._completeQuest('q_work');

      if (type === 'garden') {
        this.showToast(`🌱 ${reg.gardenLabel}: +${earned} Xu An Nhiên!`);
      } else {
        this.showToast(`🪓 ${reg.workLabel}: +${earned} Xu An Nhiên!`);
      }
      this.refreshHUD();
      this._saveState();
    }, simLabel);
  }

  performFishing() {
    if (this.state.isSleeping) return;
    if (this.state.isInsideHouse) this.exitHouse();
    if (this.state.isMoveMode) this.closeMoveLayoutMode();

    this.showStationPropsMenu('fish');

    const fishLayout = this.state.exteriorLayout.fish;
    const fishPos = { x: fishLayout.x, y: 0, z: fishLayout.z };

    if (!this.hasTool('fishing_rod')) {
      this.world.movePlayerToAndAct(fishPos, 'idle', 0.5, () => {
        this.showToast('🎣 Bạn cần mua "Cần Câu Trúc" (35 Xu) trong Cửa Hàng Sinh Tồn để bắt đầu câu cá nhé!');
        this.openShopModal('tools');
      });
      return;
    }

    const energyCost = this.getEnergyCost(11);
    if (this.state.energy < energyCost) {
      this.showToast('🥱 Hết thể lực rồi! Hãy nằm ngủ nướng hoặc vào bếp nấu ăn nhé.');
      return;
    }

    const reg = window.GAME_DATA.regions[this.state.region];
    const ageObj = window.GAME_DATA.ages[this.state.age];

    this.world.movePlayerToAndAct(fishPos, 'fish', 3.0, () => {
      this.state.energy = Math.max(0, this.state.energy - energyCost);

      let baseCoins = 11 + Math.floor(Math.random() * 6);
      baseCoins += this.getStationPropsBonusCoins('fish');
      if (this.hasTool('lantern_net')) baseCoins *= 1.25;

      const earned = Math.max(1, Math.round(baseCoins * ageObj.workBonus * this.getCoinMultiplier()));
      this.state.coins += earned;

      const teaBonusPeace = this.hasStationProp('fish_tea_table') ? 10 : 5;
      this.state.peace = Math.min(this.state.maxPeace, this.state.peace + teaBonusPeace);

      window.audioEngine.playCoinSfx();
      this.world.spawnFloatingText(`🐟 +${earned} 🪙`, fishPos.x, 2.6, fishPos.z, '#38bdf8');
      this._completeQuest('q_work');
      this.showToast(`🐟 ${reg.fishLabel}: Câu được cá tươi nhận +${earned} Xu & +${teaBonusPeace} Tâm An!`);
      this.refreshHUD();
      this._saveState();
    }, '🎣 Đang thả câu chờ cá cắn câu...');
  }

  performPoultryCare() {
    if (this.state.isSleeping) return;
    if (this.state.isInsideHouse) this.exitHouse();
    if (this.state.isMoveMode) this.closeMoveLayoutMode();

    this.showStationPropsMenu('poultry');

    const pLayout = this.state.exteriorLayout.poultry || { x: -13, z: -1 };
    const pPos = { x: pLayout.x, y: 0, z: pLayout.z + 1.4 };

    const hasChickens = this.hasTool('farm_chickens');
    const hasDucks = this.hasTool('farm_ducks');

    if (!hasChickens && !hasDucks) {
      this.world.movePlayerToAndAct(pPos, 'idle', 0.4, () => {
        this.showToast('🐓 Bạn hãy mua "Đàn Gà Đẻ Trứng" (50 Xu) hoặc "Đàn Vịt Bơi Suối" (55 Xu) trong Cửa Hàng Sinh Tồn nhé!');
        this.openShopModal('pets');
      });
      return;
    }

    const energyCost = this.getEnergyCost(8);
    if (this.state.energy < energyCost) {
      this.showToast('🥱 Bạn hơi mệt rồi! Hãy nghỉ ngơi hoặc nấu bữa cơm quê ăn lấy sức nhé.');
      return;
    }

    const ageObj = window.GAME_DATA.ages[this.state.age];
    this.world.movePlayerToAndAct(pPos, 'poultry', 2.5, () => {
      this.state.energy = Math.max(0, this.state.energy - energyCost);

      let baseCoins = 0;
      if (hasChickens) baseCoins += 8 + Math.floor(Math.random() * 4);
      if (hasDucks) baseCoins += 9 + Math.floor(Math.random() * 4);
      baseCoins += this.getStationPropsBonusCoins('poultry');

      const earned = Math.max(2, Math.round(baseCoins * ageObj.workBonus * this.getCoinMultiplier()));
      this.state.coins += earned;
      this.state.peace = Math.min(this.state.maxPeace, this.state.peace + 6);

      window.audioEngine.playCoinSfx();
      this.world.spawnFloatingText(`🥚 +${earned} 🪙`, pLayout.x, 2.5, pLayout.z, '#fde047');
      this._completeQuest('q_work');
      this._completeQuest('q_pets_poultry');

      const flockLabel = hasChickens && hasDucks ? 'Đàn Gà & Vịt' : (hasChickens ? 'Đàn Gà' : 'Đàn Vịt');
      this.showToast(`🥚 Cho ${flockLabel} ăn thóc & thu hoạch trứng tươi: +${earned} Xu & +6 Tâm An!`);
      this.refreshHUD();
      this._saveState();
    }, '🌾 Đang rải thóc cho gà vịt & nhặt trứng...');
  }

  performExpandedLandWork(plotId) {
    if (this.state.isSleeping) return;
    if (this.state.isInsideHouse) this.exitHouse();
    if (this.state.isMoveMode) this.closeMoveLayoutMode();

    const allPlots = window.GAME_DATA.landExpansions || [];
    const plot = allPlots.find(p => p.id === plotId);
    if (!plot || !this.hasLandExpansion(plot.id)) {
      this.openShopModal('land_expansion');
      return;
    }

    const energyCost = this.getEnergyCost(10);
    if (this.state.energy < energyCost) {
      this.showToast('🥱 Bạn hơi mệt rồi! Hãy nghỉ ngơi hoặc vào bếp nấu ăn để hồi phục Thể lực nhé.');
      return;
    }

    const targetPos = { x: plot.coords.x, y: 0, z: plot.coords.z };
    const simState = plot.plotType === 'garden' ? 'garden' : 'poultry';
    const simLabel = plot.plotType === 'garden'
      ? `🌱 Đang canh tác & thu hoạch tại ${plot.shortTitle}...`
      : `🐓 Đang chăm đàn gà vịt & nhặt trứng tại ${plot.shortTitle}...`;
    const ageObj = window.GAME_DATA.ages[this.state.age] || window.GAME_DATA.ages.youth;

    this.world.movePlayerToAndAct(targetPos, simState, 2.5, () => {
      this.state.energy = Math.max(0, this.state.energy - energyCost);
      const baseCoins = (plot.harvestBaseCoins || 48) + Math.floor(Math.random() * 16);
      const earned = Math.max(10, Math.round(baseCoins * ageObj.workBonus * this.getCoinMultiplier()));
      const peaceGain = plot.peaceBonus || 18;

      this.state.coins += earned;
      this.state.peace = Math.min(this.state.maxPeace, this.state.peace + peaceGain);

      window.audioEngine.playCoinSfx();
      this.world.spawnFloatingText(`${plot.icon} +${earned} 🪙`, targetPos.x, 2.6, targetPos.z, '#fde047');
      this._completeQuest('q_work');
      this.showToast(`${plot.icon} Thu hoạch tại "${plot.shortTitle}": +${earned} Xu & +${peaceGain} Tâm An!`);
      this.refreshHUD();
      this._saveState();
    }, simLabel);
  }

  performKitchenOrTV() {
    if (this.state.isSleeping) return;
    const hasCook = this.hasTool('app_cookware_set') || this.hasTool('app_kitchen_cabinet');
    const hasTV = this.hasTool('app_tv');

    if (!hasCook && !hasTV) {
      this.showToast('🍳 Bạn hãy sắm "Bộ Dụng Cụ Nấu Ăn", "Nhà Bếp" hoặc "Tivi" trong Cửa Hàng Sinh Tồn nhé!');
      this.openShopModal('appliances');
      return;
    }

    if (hasCook) {
      this.performCooking();
    } else {
      this.performWatchTV();
    }
  }

  performCooking() {
    if (this.state.isSleeping) return;
    if (this.state.isMoveMode) this.closeMoveLayoutMode();

    const hasCook = this.hasTool('app_cookware_set') || this.hasTool('app_kitchen_cabinet');
    if (!hasCook) {
      this.showToast('🥘 Bạn cần mua "Bộ Dụng Cụ Nấu Ăn" (45 Xu) hoặc "Nhà Bếp" (75 Xu) ở Cửa Hàng Sinh Tồn để nấu cơm nhé!');
      this.openShopModal('appliances');
      return;
    }

    const runCookInside = () => {
      const kPos = this.state.interiorLayout.kitchen || { x: -4.2, z: 1.8 };
      const standPos = { x: kPos.x + 1.1, y: 0, z: kPos.z + 0.6 };

      this.world.movePlayerToAndAct(standPos, 'cook', 2.6, () => {
        const energyRecover = 24 + (this.hasTool('app_fridge') ? 10 : 0) + (this.hasTool('app_kitchen_cabinet') ? 6 : 0);
        const coinsBonus = Math.round((8 + (this.hasTool('app_kitchen_cabinet') ? 5 : 0)) * this.getCoinMultiplier());

        this.state.energy = Math.min(this.state.maxEnergy, this.state.energy + energyRecover);
        this.state.peace = Math.min(this.state.maxPeace, this.state.peace + 9);
        this.state.coins += coinsBonus;

        window.audioEngine.playCoinSfx();
        this.world.spawnFloatingText(`🍲 +${energyRecover}⚡ +${coinsBonus}🪙`, kPos.x, 2.2, kPos.z, '#fb923c');
        this.showToast(`🍲 Nấu bữa cơm quê thơm phức: Hồi phục +${energyRecover} Thể lực, +9 Tâm An & +${coinsBonus} Xu!`);
        this.refreshHUD();
        this._saveState();
      }, '🍳 Đang nấu bữa cơm quê nóng hổi...');
    };

    if (!this.state.isInsideHouse) {
      this.enterHouse();
      setTimeout(runCookInside, 450);
    } else {
      runCookInside();
    }
  }

  performWatchTV() {
    if (this.state.isSleeping) return;
    if (this.state.isMoveMode) this.closeMoveLayoutMode();

    if (!this.hasTool('app_tv')) {
      this.showToast('📺 Bạn cần mua "Tivi Màn Hình Phẳng" (110 Xu) tại Cửa Hàng Sinh Tồn để xem giải trí nhé!');
      this.openShopModal('appliances');
      return;
    }

    const runWatchInside = () => {
      const tvPos = this.state.interiorLayout.tv || { x: 0, z: -4.8 };
      const standPos = { x: tvPos.x, y: 0, z: tvPos.z + 1.8 };

      this.world.movePlayerToAndAct(standPos, 'idle', 2.2, () => {
        const coinsEarned = Math.round(9 * this.getCoinMultiplier());
        this.state.coins += coinsEarned;
        this.state.peace = Math.min(this.state.maxPeace, this.state.peace + 12);
        this.state.energy = Math.min(this.state.maxEnergy, this.state.energy + 8);

        window.audioEngine.playCoinSfx();
        this.world.spawnFloatingText(`📺 +12🪷 +${coinsEarned}🪙`, tvPos.x, 2.2, tvPos.z, '#38bdf8');
        this.showToast(`📺 Xem chương trình khám phá thiên nhiên trên Tivi: +12 Tâm An, +8 Thể lực & +${coinsEarned} Xu!`);
        this.refreshHUD();
        this._saveState();
      }, '📺 Đang thư giãn xem Tivi...');
    };

    if (!this.state.isInsideHouse) {
      this.enterHouse();
      setTimeout(runWatchInside, 450);
    } else {
      runWatchInside();
    }
  }

  // =======================================================================
  // PET COMPANIONS (DOG, CAT, BIRD IN CAGE) & LIVESTOCK PANEL
  // =======================================================================
  renderPetsManagementPanel() {
    const listEl = document.getElementById('pets-management-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const petTools = window.GAME_DATA.shopTools.filter(t => t.category === 'pets');
    petTools.forEach((pet) => {
      const owned = this.hasTool(pet.id);
      const row = document.createElement('div');
      row.className = `st-prop-item ${owned ? 'owned' : ''}`;

      let actionHtml = '';
      if (!owned) {
        actionHtml = `
          <button type="button" class="btn-buy-st-prop" data-buy-pet="${pet.id}">
            🛒 Mua (${pet.cost}🪙)
          </button>
        `;
      } else if (pet.id === 'pet_dog' || pet.id === 'pet_cat') {
        const isDog = pet.id === 'pet_dog';
        const following = isDog ? this.state.petSettings.dogFollow : this.state.petSettings.catFollow;
        actionHtml = `
          <div class="pet-action-pair">
            <button type="button" class="btn-buy-st-prop ${following ? 'active-follow' : ''}" data-toggle-follow="${isDog ? 'dog' : 'cat'}">
              ${following ? '🐾 Đang đi cùng' : '🏠 Nghỉ ở nhà'}
            </button>
            <button type="button" class="btn-buy-st-prop" data-care-pet="${pet.id}">
              💖 Vuốt ve
            </button>
          </div>
        `;
      } else if (pet.id === 'pet_bird_cage') {
        actionHtml = `
          <button type="button" class="btn-buy-st-prop" data-care-pet="pet_bird_cage">
            🎶 Nghe chim hót
          </button>
        `;
      } else {
        actionHtml = `
          <button type="button" class="btn-buy-st-prop" data-feed-poultry="${pet.id}">
            🌾 Cho ăn & Nhặt trứng
          </button>
        `;
      }

      row.innerHTML = `
        <div class="st-prop-info">
          <div class="st-prop-name">${pet.icon} ${pet.name}</div>
          <div class="st-prop-bonus">${owned ? `✅ ${pet.perkText}` : `Chưa sở hữu • Giá: ${pet.cost} 🪙`}</div>
        </div>
        ${actionHtml}
      `;

      const buyBtn = row.querySelector('[data-buy-pet]');
      if (buyBtn) {
        buyBtn.addEventListener('click', () => {
          this.openShopModal('pets');
        });
      }

      const followBtn = row.querySelector('[data-toggle-follow]');
      if (followBtn) {
        followBtn.addEventListener('click', () => {
          const which = followBtn.getAttribute('data-toggle-follow');
          this.togglePetFollow(which);
        });
      }

      const careBtn = row.querySelector('[data-care-pet]');
      if (careBtn) {
        careBtn.addEventListener('click', () => {
          this.careForPet(careBtn.getAttribute('data-care-pet'));
        });
      }

      const feedBtn = row.querySelector('[data-feed-poultry]');
      if (feedBtn) {
        feedBtn.addEventListener('click', () => {
          this.performPoultryCare();
        });
      }

      listEl.appendChild(row);
    });
  }

  togglePetFollow(which) {
    if (which === 'dog') {
      this.state.petSettings.dogFollow = !this.state.petSettings.dogFollow;
      this.showToast(
        this.state.petSettings.dogFollow
          ? '🐕 Cậu Vàng sẽ lon ton chạy theo bước chân bạn khắp nơi!'
          : '🐕 Cậu Vàng sẽ nằm nghỉ ngơi canh nhà cho bạn.'
      );
    } else {
      this.state.petSettings.catFollow = !this.state.petSettings.catFollow;
      this.showToast(
        this.state.petSettings.catFollow
          ? '🐈 Hoàng Thượng sẽ quấn quýt đi dạo cùng bạn!'
          : '🐈 Hoàng Thượng sẽ nằm sưởi nắng thư giãn ở nhà.'
      );
    }
    this.world.setPetSettings(this.state.petSettings);
    this.renderPetsManagementPanel();
    this._saveState();
  }

  careForPet(petId) {
    this.state.peace = Math.min(this.state.maxPeace, this.state.peace + 6);
    this.state.coins += 3;
    window.audioEngine.playCoinSfx();
    this.world.spawnFloatingText('💖 +6 Tâm An +3🪙', this.world.playerPos.x, 2.3, this.world.playerPos.z, '#f472b6');

    if (petId === 'pet_dog') {
      this.showToast('🐕 Bạn xoa đầu Cậu Vàng, chú vẫy đuôi mừng rỡ (+6 Tâm An, +3 Xu)!');
    } else if (petId === 'pet_cat') {
      this.showToast('🐈 Bạn vuốt ve Hoàng Thượng, tiếng kêu "gừ gừ" thật ấm áp (+6 Tâm An, +3 Xu)!');
    } else {
      this.showToast('🐦 Tiếng Chim Sơn Ca hót líu lo bên hiên nhà làm tâm hồn nhẹ nhõm (+6 Tâm An, +3 Xu)!');
    }
    this.refreshHUD();
    this._saveState();
  }

  // =======================================================================
  // UNIFIED SURVIVAL SHOP MODAL (ALL TOOLS + FENCES + APPLIANCES + PETS + STATION PROPS)
  // =======================================================================
  _bindShopUI() {
    document.getElementById('btn-close-shop').addEventListener('click', () => {
      document.getElementById('shop-modal').classList.add('hidden');
    });

    const syncShopCat = (cat) => {
      this.state.shopCategory = cat;
      const tabs = document.querySelectorAll('#shop-cat-tabs .q-tab');
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute('data-shopcat') === cat) tabs[i].classList.add('active');
        else tabs[i].classList.remove('active');
      }
      const shopSel = document.getElementById('shop-cat-select');
      if (shopSel) shopSel.value = cat;
      this.renderShopItems();
    };

    document.getElementById('shop-cat-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.q-tab');
      if (!tab) return;
      syncShopCat(tab.getAttribute('data-shopcat'));
    });

    const shopCatSelect = document.getElementById('shop-cat-select');
    if (shopCatSelect) {
      shopCatSelect.addEventListener('change', (e) => {
        syncShopCat(e.target.value);
      });
    }

    const fenceSelect = document.getElementById('select-active-fence');
    if (fenceSelect) {
      fenceSelect.addEventListener('change', (e) => {
        const val = e.target.value || 'auto';
        this.equipFenceStyle(val);
      });
    }
  }

  equipFenceStyle(fenceId) {
    if (fenceId !== 'auto' && !this.hasTool(fenceId)) return;
    this.state.activeFenceStyle = fenceId;
    if (this.world) {
      this.world.setActiveFenceStyle(fenceId);
    }
    this._saveState();
    this.renderShopItems();
    this.refreshHUD();

    if (fenceId === 'auto') {
      this.showToast('🎋 Đã chuyển hàng rào khuôn viên về chế độ tự động theo Cấp Nhà.');
    } else {
      const fTool = window.GAME_DATA.shopTools.find(t => t.id === fenceId);
      if (fTool) {
        this.showToast(`${fTool.icon} Đã trang trí khuôn viên nhà bằng: ${fTool.name}!`);
      }
    }
  }

  _syncFenceEquipBar() {
    const fenceSelect = document.getElementById('select-active-fence');
    const activeLabel = document.getElementById('active-fence-label');
    const allFences = window.GAME_DATA.shopTools.filter(t => t.category === 'fences');
    const ownedFences = allFences.filter(f => this.hasTool(f.id));

    if (fenceSelect) {
      fenceSelect.innerHTML = '<option value="auto">🏡 Tự động theo Cấp Nhà</option>';
      ownedFences.forEach((f) => {
        const opt = document.createElement('option');
        opt.value = f.id;
        opt.textContent = `${f.icon} ${f.name}`;
        if (this.state.activeFenceStyle === f.id) opt.selected = true;
        fenceSelect.appendChild(opt);
      });
      if (this.state.activeFenceStyle === 'auto') {
        fenceSelect.value = 'auto';
      }
    }

    if (activeLabel) {
      const currentFenceId = this.world ? this.world.getActiveFenceId() : null;
      const fObj = allFences.find(f => f.id === currentFenceId);
      activeLabel.textContent = fObj ? `${fObj.icon} ${fObj.name}` : 'Chưa lắp (Nâng cấp nhà hoặc mua Hàng rào)';
    }
  }

  openShopModal(defaultCategory = 'all') {
    this.state.shopCategory = defaultCategory;
    const tabs = document.querySelectorAll('#shop-cat-tabs .q-tab');
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].getAttribute('data-shopcat') === defaultCategory) tabs[i].classList.add('active');
      else tabs[i].classList.remove('active');
    }
    const shopSel = document.getElementById('shop-cat-select');
    if (shopSel) shopSel.value = defaultCategory;
    this.renderShopItems();
    document.getElementById('shop-modal').classList.remove('hidden');
  }

  _getAllUnifiedShopItems() {
    const list = [];
    // 1. Land Expansion Plots (Mua thêm đất để canh tác theo cấp độ, hiện mờ kèm thông báo khi chưa đủ Nhà Cấp 6 & 50.000 Xu)
    (window.GAME_DATA.landExpansions || []).forEach((lp) => {
      list.push({
        id: lp.id,
        isLandExpansion: true,
        isStationProp: false,
        isFence: false,
        stationKey: null,
        category: 'land_expansion',
        level: lp.level,
        plotType: lp.plotType,
        requiredHomeLevel: lp.requiredHomeLevel || 6,
        requiredPrevId: lp.requiredPrevId || null,
        unlockNotice: lp.unlockNotice || 'Bạn sẽ được mở rộng đất khi nhà nâng cấp 6 và số dư 50.000 Xu...',
        name: lp.name,
        shortTitle: lp.shortTitle,
        icon: lp.icon,
        cost: lp.cost,
        passiveCoins: lp.passiveCoins,
        harvestBaseCoins: lp.harvestBaseCoins,
        peaceBonus: lp.peaceBonus,
        coords: lp.coords,
        desc: lp.desc,
        perkText: lp.perkText
      });
    });

    // 2. Core Survival Tools, Courtyard Fences, Household Appliances & Pets/Livestock
    window.GAME_DATA.shopTools.forEach((t) => {
      list.push({
        id: t.id,
        isLandExpansion: false,
        isStationProp: false,
        isFence: !!t.isFence || t.category === 'fences',
        stationKey: null,
        category: t.category || 'tools',
        name: t.name,
        icon: t.icon,
        cost: t.cost,
        desc: t.desc,
        perkText: t.perkText
      });
    });

    // 3. All Station Add-on Props (Fishing Chair, Tea Table, Workbench, Garden Sprinkler, Poultry Trough...)
    const sp = window.GAME_DATA.stationProps;
    Object.keys(sp).forEach((stKey) => {
      sp[stKey].items.forEach((item) => {
        list.push({
          id: item.id,
          isLandExpansion: false,
          isStationProp: true,
          isFence: false,
          stationKey: stKey,
          category: item.category,
          name: item.name,
          icon: item.icon,
          cost: item.cost,
          desc: item.desc,
          perkText: item.perkText
        });
      });
    });

    return list;
  }

  renderShopItems() {
    document.getElementById('shop-wallet-coins').textContent = `${this.state.coins.toLocaleString('vi-VN')} 🪙`;
    this._syncFenceEquipBar();
    const container = document.getElementById('shop-items-container');
    container.innerHTML = '';

    const allItems = this._getAllUnifiedShopItems().filter(
      it => this.state.shopCategory === 'all' || it.category === this.state.shopCategory
    );

    const activeFenceId = this.world ? this.world.getActiveFenceId() : null;
    const homeLevel = 1 + (this.state.ownedUpgrades ? this.state.ownedUpgrades.length : 0);

    allItems.forEach((item) => {
      if (item.isLandExpansion) {
        const owned = this.hasLandExpansion(item.id);
        const reqHomeLevel = item.requiredHomeLevel || 6;
        const hasHomeLevel = homeLevel >= reqHomeLevel;
        const hasPrevPlot = !item.requiredPrevId || this.hasLandExpansion(item.requiredPrevId);
        const canAfford = this.state.coins >= item.cost;
        const isUnlockedToBuy = hasHomeLevel && hasPrevPlot && canAfford;
        const isDimmedLocked = !owned && !isUnlockedToBuy;

        let btnLabel = `🗺️ Mở Rộng Đất Cấp ${item.level}`;
        let btnDisabled = false;
        if (owned) {
          btnLabel = '🌾 Đến Khu Đất Canh Tác';
          btnDisabled = false;
        } else if (!hasHomeLevel) {
          btnLabel = `🔒 Cần Nhà Cấp ${reqHomeLevel}/6`;
          btnDisabled = true;
        } else if (!hasPrevPlot) {
          btnLabel = `🔒 Cần Mở Đất Cấp ${item.level - 1} Trước`;
          btnDisabled = true;
        } else if (!canAfford) {
          btnLabel = `🔒 Cần ${item.cost.toLocaleString('vi-VN')} Xu`;
          btnDisabled = true;
        }

        const lockNoticeHtml = !owned
          ? `<div class="land-lock-notice ${isUnlockedToBuy ? 'unlocked-ready' : ''}">
               <div>🔒 <strong>${escapeHtml(item.unlockNotice)}</strong></div>
               <div class="land-lock-progress">
                  tiến độ hiện tại: <strong>Nhà Cấp ${homeLevel}/${reqHomeLevel}</strong> • Số dư: <strong>${this.state.coins.toLocaleString('vi-VN')} / ${item.cost.toLocaleString('vi-VN')} Xu</strong>
                 ${item.requiredPrevId ? ` • Đất Cấp ${item.level - 1}: <strong>${hasPrevPlot ? '✅ Đã mở' : '⭕ Chưa mở'}</strong>` : ''}
               </div>
             </div>`
          : `<div class="land-lock-notice owned-land-banner">
               ✅ <strong>Đã mở rộng trên bản đồ 3D!</strong> Bạn có thể đi qua cầu gỗ để trồng rau / chăn nuôi gà vịt thu hoạch Xu lớn.
             </div>`;

        const card = document.createElement('div');
        card.className = `upgrade-item-card land-expansion-card ${owned ? 'owned' : ''} ${isDimmedLocked ? 'land-locked-dimmed' : ''}`;
        card.innerHTML = `
          <div class="up-top">
            <div class="up-icon">${item.icon}</div>
            <div>
              <div class="up-title">${item.name}</div>
              <div class="up-desc">${item.desc}</div>
              <div class="up-perk">✨ ${item.perkText}</div>
              ${lockNoticeHtml}
            </div>
          </div>
          <div class="up-bottom">
            <span style="font-size:0.85rem;font-weight:700;color:#fde68a;">
              ${owned ? '🌟 Đã mở rộng bản đồ' : `Chi phí mở đất: ${item.cost.toLocaleString('vi-VN')} 🪙`}
            </span>
            <button type="button" class="btn-buy-upgrade" ${btnDisabled ? 'disabled' : ''}>
              ${btnLabel}
            </button>
          </div>
        `;

        const btn = card.querySelector('.btn-buy-upgrade');
        if (btn && !btnDisabled) {
          btn.addEventListener('click', () => {
            if (owned) {
              document.getElementById('shop-modal').classList.add('hidden');
              this.performExpandedLandWork(item.id);
            } else {
              this.buyLandExpansion(item);
            }
          });
        }
        container.appendChild(card);
        return;
      }

      const owned = item.isStationProp ? this.hasStationProp(item.id) : this.hasTool(item.id);
      const canAfford = this.state.coins >= item.cost;
      const isFenceEquipped = item.isFence && owned && activeFenceId === item.id;

      let btnLabel = '🛒 Mua Ngay';
      let btnDisabled = false;
      if (owned) {
        if (item.isFence) {
          btnLabel = isFenceEquipped ? '🎋 Đang Trang Trí' : '🎋 Lắp Hàng Rào Này';
          btnDisabled = isFenceEquipped;
        } else {
          btnLabel = 'Đã Sở Hữu';
          btnDisabled = true;
        }
      } else if (!canAfford) {
        btnLabel = 'Chưa Đủ Xu';
        btnDisabled = true;
      }

      const card = document.createElement('div');
      card.className = `upgrade-item-card ${owned ? 'owned' : ''}`;
      card.innerHTML = `
        <div class="up-top">
          <div class="up-icon">${item.icon}</div>
          <div>
            <div class="up-title">${item.name}</div>
            <div class="up-desc">${item.desc}</div>
            <div class="up-perk">✨ ${item.perkText}</div>
          </div>
        </div>
        <div class="up-bottom">
          <span style="font-size:0.85rem;font-weight:700;color:#fde68a;">
            ${owned ? (isFenceEquipped ? '🌟 Đang lắp quanh sân' : '✅ Đã sở hữu') : `Giá bán: ${item.cost} 🪙`}
          </span>
          <button type="button" class="btn-buy-upgrade" ${btnDisabled ? 'disabled' : ''}>
            ${btnLabel}
          </button>
        </div>
      `;

      const btn = card.querySelector('.btn-buy-upgrade');
      if (btn && !btnDisabled) {
        btn.addEventListener('click', () => {
          if (owned && item.isFence) {
            this.equipFenceStyle(item.id);
          } else if (item.isStationProp) {
            this.buyStationProp(item.stationKey, item);
          } else {
            this.buyShopTool(item);
          }
        });
      }
      container.appendChild(card);
    });
  }

  buyLandExpansion(item) {
    if (!item || this.hasLandExpansion(item.id)) return;
    const homeLevel = 1 + (this.state.ownedUpgrades ? this.state.ownedUpgrades.length : 0);
    const reqLevel = item.requiredHomeLevel || 6;
    if (homeLevel < reqLevel) {
      this.showToast(`🔒 ${item.unlockNotice} (Hiện tại nhà bạn đang ở Cấp ${homeLevel}/${reqLevel}).`);
      return;
    }
    if (item.requiredPrevId && !this.hasLandExpansion(item.requiredPrevId)) {
      this.showToast(`🔒 Bạn hãy mở rộng Đất Cấp ${item.level - 1} trước khi mở Đất Cấp ${item.level} nhé!`);
      return;
    }
    if (this.state.coins < item.cost) {
      this.showToast(`🔒 ${item.unlockNotice} (Số dư hiện tại: ${this.state.coins.toLocaleString('vi-VN')} / ${item.cost.toLocaleString('vi-VN')} Xu).`);
      return;
    }

    this.state.coins -= item.cost;
    this.state.ownedLandExpansions.push(item.id);
    this.state.peace = Math.min(this.state.maxPeace, this.state.peace + (item.peaceBonus || 18));

    if (this.world) {
      this.world.setOwnedLandExpansions(this.state.ownedLandExpansions);
      if (item.coords) {
        this.world.spawnFloatingText(
          `🗺️ Đã mở ${item.shortTitle}!`,
          item.coords.x,
          2.8,
          item.coords.z,
          '#fde047'
        );
      }
    }

    window.audioEngine.playUpgradeSfx();
    this._completeQuest('q_buy_tool');
    this.showToast(`🗺️ Chúc mừng! Bạn đã mua "${item.name}" (-${item.cost.toLocaleString('vi-VN')} Xu) và mở rộng bản đồ canh tác!`);
    this.renderShopItems();
    this.refreshHUD();
    this._saveState();
  }

  buyShopTool(tool) {
    if (this.state.coins < tool.cost || this.hasTool(tool.id)) return;
    this.state.coins -= tool.cost;
    this.state.ownedTools.push(tool.id);
    this.state.peace = Math.min(this.state.maxPeace, this.state.peace + 6);

    if (tool.isFence || tool.category === 'fences') {
      this.state.activeFenceStyle = tool.id;
      this.world.setActiveFenceStyle(tool.id);
    }

    this.world.setOwnedTools(this.state.ownedTools);
    window.audioEngine.playUpgradeSfx();
    this._completeQuest('q_buy_tool');

    if (tool.category === 'pets') {
      this._completeQuest('q_pets_poultry');
      this.state.uiPanels.pets = true;
      this.applyHudPanelVisibility();
    }

    if (tool.isFence || tool.category === 'fences') {
      this.showToast(`🎋 Đã mua & lắp đặt "${tool.name}" (-${tool.cost} Xu) trang trí quanh khuôn viên nhà!`);
    } else {
      this.showToast(`🎉 Đã sắm "${tool.name}" (-${tool.cost} Xu) tại Cửa Hàng Sinh Tồn!`);
    }
    this.renderShopItems();
    this.renderPetsManagementPanel();
    if (this.state.isMoveMode) this.renderMoveLayoutPanel();
    this.refreshHUD();
    this._saveState();
  }

  // =======================================================================
  // WORLD TRADITIONAL COSTUMES MODAL ("👘 Ô TRANG PHỤC THẾ GIỚI" - 16 COUNTRIES)
  // =======================================================================
  _bindCostumeUI() {
    const btnClose = document.getElementById('btn-close-costumes');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        document.getElementById('costume-modal').classList.add('hidden');
      });
    }

    const btnUnequip = document.getElementById('btn-unequip-costume');
    if (btnUnequip) {
      btnUnequip.addEventListener('click', () => {
        this.unequipCostume();
      });
    }

    const ownedCostumeSel = document.getElementById('costume-owned-select');
    if (ownedCostumeSel) {
      ownedCostumeSel.addEventListener('change', (e) => {
        this.applyOutfitSelection(e.target.value, true);
      });
    }

    const syncCostumeRegion = (regionCat) => {
      this.state.costumeRegionFilter = regionCat;
      const tabs = document.querySelectorAll('#costume-region-tabs .q-tab');
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute('data-costumecat') === regionCat) tabs[i].classList.add('active');
        else tabs[i].classList.remove('active');
      }
      const sel = document.getElementById('costume-region-select');
      if (sel) sel.value = regionCat;
      this.renderCostumeItems();
    };

    const tabsContainer = document.getElementById('costume-region-tabs');
    if (tabsContainer) {
      tabsContainer.addEventListener('click', (e) => {
        const tab = e.target.closest('.q-tab');
        if (!tab) return;
        syncCostumeRegion(tab.getAttribute('data-costumecat'));
      });
    }

    const regSelect = document.getElementById('costume-region-select');
    if (regSelect) {
      regSelect.addEventListener('change', (e) => {
        syncCostumeRegion(e.target.value);
      });
    }
  }

  openCostumeModal(regionFilter = 'all') {
    this.state.costumeRegionFilter = regionFilter;
    const tabs = document.querySelectorAll('#costume-region-tabs .q-tab');
    for (let i = 0; i < tabs.length; i++) {
      if (tabs[i].getAttribute('data-costumecat') === regionFilter) tabs[i].classList.add('active');
      else tabs[i].classList.remove('active');
    }
    const sel = document.getElementById('costume-region-select');
    if (sel) sel.value = regionFilter;

    const initialPreview = this.state.equippedCostume || this.state.previewingCostumeId || 'costume_vietnam';
    this.selectPreviewCostume(initialPreview);
    this.renderCostumeItems();
    document.getElementById('costume-modal').classList.remove('hidden');
  }

  selectPreviewCostume(costumeId) {
    const costumes = window.GAME_DATA.worldCostumes || [];
    const found = costumes.find(c => c.id === costumeId) || costumes[0];
    if (!found) return;

    this.state.previewingCostumeId = found.id;
    if (this.world) {
      this.world.setPreviewCostume(found.id);
    }

    const flagEl = document.getElementById('costume-preview-flag');
    if (flagEl) flagEl.textContent = found.flag;

    const titleEl = document.getElementById('costume-preview-title');
    if (titleEl) {
      titleEl.textContent = `${found.flag} ${found.country} — ${found.name} (${found.cost} Xu)`;
    }

    const descEl = document.getElementById('costume-preview-desc');
    if (descEl) {
      descEl.innerHTML = `${escapeHtml(found.desc)}<br><strong style="color:#fde047;">✨ Đặc quyền khi mặc: ${escapeHtml(found.perkText)}</strong>`;
    }
  }

  renderCostumeItems() {
    const allCostumes = window.GAME_DATA.worldCostumes || [];
    const walletEl = document.getElementById('costume-wallet-coins');
    if (walletEl) walletEl.textContent = `${this.state.coins} 🪙`;

    const ownedCountEl = document.getElementById('costume-owned-count');
    if (ownedCountEl) {
      ownedCountEl.textContent = `${(this.state.ownedCostumes || []).length} / ${allCostumes.length}`;
    }

    const eqObj = this.getEquippedCostumeObject();
    const eqNameEl = document.getElementById('costume-equipped-name');
    const unequipBtn = document.getElementById('btn-unequip-costume');
    if (eqNameEl) {
      eqNameEl.textContent = eqObj
        ? `${eqObj.flag} ${eqObj.country}: ${eqObj.name}`
        : 'Trang phục mặc định theo Nhân vật';
    }
    if (unequipBtn) {
      unequipBtn.classList.toggle('hidden', !eqObj);
    }

    const container = document.getElementById('costume-items-container');
    if (!container) return;
    container.innerHTML = '';

    const filtered = allCostumes.filter(
      c => this.state.costumeRegionFilter === 'all' || c.regionGroup === this.state.costumeRegionFilter
    );

    filtered.forEach((costume) => {
      const owned = this.hasCostume(costume.id);
      const isEquipped = this.state.equippedCostume === costume.id;
      const isPreviewing = this.state.previewingCostumeId === costume.id;
      const canAfford = this.state.coins >= costume.cost;

      let btnLabel = `🛒 Mua Quốc Phục (${costume.cost} 🪙)`;
      let btnDisabled = false;
      if (owned) {
        if (isEquipped) {
          btnLabel = '🔄 Đang Mặc (Bấm để đổi về mặc định)';
          btnDisabled = false;
        } else {
          btnLabel = '✨ Mặc Trang Phục Này';
          btnDisabled = false;
        }
      } else if (!canAfford) {
        const missing = costume.cost - this.state.coins;
        btnLabel = `Thiếu ${missing} 🪙 (~15p chơi)`;
        btnDisabled = true;
      }

      const card = document.createElement('div');
      card.className = `upgrade-item-card costume-card ${owned ? 'owned' : ''} ${isEquipped ? 'equipped-costume' : ''} ${isPreviewing ? 'previewing-costume' : ''}`;
      card.innerHTML = `
        <div class="up-top">
          <div class="up-icon costume-flag-icon" title="Bấm để xem thử 3D trên nhân vật">${costume.flag}</div>
          <div>
            <div class="costume-country-tag">${costume.icon} Quốc gia: <strong>${costume.country}</strong></div>
            <div class="up-title">${costume.name}</div>
            <div class="up-desc">${costume.desc}</div>
            <div class="up-perk">✨ ${costume.perkText}</div>
          </div>
        </div>
        <div class="up-bottom">
          <button type="button" class="btn-text-xs btn-preview-costume">
            👁️ Xem thử 3D
          </button>
          <button type="button" class="btn-buy-upgrade" ${btnDisabled ? 'disabled' : ''}>
            ${btnLabel}
          </button>
        </div>
      `;

      const prevBtn = card.querySelector('.btn-preview-costume');
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          this.selectPreviewCostume(costume.id);
          this.renderCostumeItems();
        });
      }

      card.querySelector('.up-top').addEventListener('click', () => {
        this.selectPreviewCostume(costume.id);
        this.renderCostumeItems();
      });

      const actionBtn = card.querySelector('.btn-buy-upgrade');
      if (actionBtn && !btnDisabled) {
        actionBtn.addEventListener('click', () => {
          if (owned && isEquipped) {
            this.unequipCostume();
          } else {
            this.buyOrEquipCostume(costume);
          }
        });
      }

      container.appendChild(card);
    });
  }

  buyOrEquipCostume(costume) {
    if (!costume) return;
    const owned = this.hasCostume(costume.id);

    if (!owned) {
      if (this.state.coins < costume.cost) {
        this.showToast(`⚠️ Cần ${costume.cost} Xu để sở hữu "${costume.name}" (${costume.country})! Hãy làm việc, câu cá và giải đố khoảng 15 phút để tích lũy đủ Xu nhé.`);
        return;
      }
      this.state.coins -= costume.cost;
      this.state.ownedCostumes.push(costume.id);
      this.state.peace = Math.min(this.state.maxPeace, this.state.peace + (costume.peaceBonus || 15));
      window.audioEngine.playUpgradeSfx();
      this._completeQuest('q_buy_tool');
    } else {
      window.audioEngine.playCoinSfx();
    }

    this.state.equippedCostume = costume.id;
    this.state.previewingCostumeId = costume.id;

    if (this.world) {
      this.world.setPreviewCostume(costume.id);
      this.world.buildCharacter({
        name: this.state.playerName,
        gender: this.state.gender,
        age: this.state.age,
        mood: this.state.mood,
        style: this.state.style,
        equippedCostume: this.state.equippedCostume
      });
      this.world.spawnFloatingText(
        `${costume.flag} ${costume.country}!`,
        this.world.playerPos.x,
        2.5,
        this.world.playerPos.z,
        '#fde047'
      );
    }

    if (!owned) {
      this.showToast(`👘 Tuyệt vời! Bạn đã mua & khoác lên mình Quốc phục ${costume.flag} ${costume.country}: "${costume.name}" (-${costume.cost} Xu)!`);
    } else {
      this.showToast(`👘 Đã thay trang phục truyền thống ${costume.flag} ${costume.country}: "${costume.name}"!`);
    }

    this.selectPreviewCostume(costume.id);
    this.renderCostumeItems();
    this._syncIntroFormFromState();
    this.refreshHUD();
    this._saveState();
  }

  unequipCostume() {
    this.state.equippedCostume = null;
    if (this.world) {
      this.world.buildCharacter({
        name: this.state.playerName,
        gender: this.state.gender,
        age: this.state.age,
        mood: this.state.mood,
        style: this.state.style,
        equippedCostume: null
      });
    }
    this.renderCostumeItems();
    this._syncIntroFormFromState();
    this.refreshHUD();
    this._saveState();
    this.showToast('👕 Đã tháo Quốc phục, quay về trang phục mặc định của nhân vật.');
  }

  // =======================================================================
  // TRAVEL & NATURAL LANGUAGE REGION MATCHER MODAL
  // =======================================================================
  _bindTravelUI() {
    document.getElementById('btn-close-travel').addEventListener('click', () => {
      document.getElementById('travel-modal').classList.add('hidden');
    });

    const handleTravelMatch = () => {
      const raw = document.getElementById('input-travel-desc').value.trim();
      const resEl = document.getElementById('travel-match-result');
      if (!raw) {
        resEl.textContent = '⚠️ Bạn hãy nhập vài từ miêu tả nơi muốn đến nhé!';
        return;
      }
      const match = window.matchRegionFromDescription(raw);
      if (match) {
        this.switchRegion(match.regionId);
        const kw = match.matchedWords.length ? ` (phù hợp với mô tả "${match.matchedWords.join(', ')}")` : '';
        resEl.innerHTML = `✨ Đã đưa bạn tới: <strong>${match.region.emoji} ${match.region.title}</strong> — 🏠 <em>${match.region.homeName}</em>${kw}!`;
      }
    };

    document.getElementById('btn-travel-match').addEventListener('click', handleTravelMatch);
    document.getElementById('input-travel-desc').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleTravelMatch();
      }
    });

    const travelSelect = document.getElementById('travel-region-select');
    if (travelSelect) {
      travelSelect.addEventListener('change', (e) => {
        const regId = e.target.value;
        if (regId && window.GAME_DATA.regions[regId]) {
          this.switchRegion(regId);
          document.getElementById('travel-modal').classList.add('hidden');
        }
      });
    }
  }

  openTravelModal() {
    const travelSelect = document.getElementById('travel-region-select');
    if (travelSelect) travelSelect.value = this.state.region;

    const grid = document.getElementById('travel-region-grid');
    grid.innerHTML = '';
    const regions = window.GAME_DATA.regions;
    Object.keys(regions).forEach((key) => {
      const reg = regions[key];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `choice-card ${this.state.region === reg.id ? 'active' : ''}`;
      btn.innerHTML = `
        <div class="c-icon">${reg.emoji}</div>
        <div class="c-title">${reg.name}</div>
        <div class="c-sub">🏠 ${reg.homeName || reg.badge}</div>
      `;
      btn.addEventListener('click', () => {
        this.switchRegion(reg.id);
        document.getElementById('travel-modal').classList.add('hidden');
      });
      grid.appendChild(btn);
    });
    document.getElementById('travel-modal').classList.remove('hidden');
  }

  switchRegion(newRegionId) {
    this.state.region = newRegionId;
    if (this.state.isInsideHouse) this.exitHouse();
    this.world.buildRegion(newRegionId);
    this._syncIntroFormFromState();
    this.refreshHUD();
    this._saveState();
    const reg = window.GAME_DATA.regions[newRegionId];
    this.showToast(`🧭 Đã chuyển nơi sinh sống tới: ${reg.emoji} ${reg.title} (🏠 ${reg.homeName})`);
  }

  // =======================================================================
  // SLEEPING MECHANIC (5-SECOND RECOVERY CYCLE + LIVE PROGRESS BARS)
  // =======================================================================
  _updateSleepProgressUI(elapsedSec, tickCoins) {
    const energyPct = Math.max(0, Math.min(100, Math.round((this.state.energy / this.state.maxEnergy) * 100)));
    const energyBarEl = document.getElementById('sleep-energy-bar');
    const energyValEl = document.getElementById('sleep-energy-val');
    if (energyBarEl) energyBarEl.style.width = `${energyPct}%`;
    if (energyValEl) {
      energyValEl.textContent = `${Math.round(this.state.energy)} / ${this.state.maxEnergy} (${energyPct}%)`;
    }

    const cycleDuration = 5.0;
    const cycleRatio = Math.max(0, Math.min(1, elapsedSec / cycleDuration));
    const remainingSec = Math.max(0, cycleDuration - elapsedSec);
    const tickBarEl = document.getElementById('sleep-tick-bar');
    const countdownEl = document.getElementById('sleep-cycle-countdown');

    if (tickBarEl) tickBarEl.style.width = `${Math.round(cycleRatio * 100)}%`;
    if (countdownEl) {
      if (this.state.energy >= this.state.maxEnergy) {
        countdownEl.textContent = `Đã đầy 100% Thể Lực! (+${tickCoins} Xu sau ${remainingSec.toFixed(1)}s)`;
      } else {
        countdownEl.textContent = `+12 Thể Lực & +${tickCoins} Xu sau ${remainingSec.toFixed(1)}s`;
      }
    }
  }

  startSleeping() {
    if (this.state.isSleeping) return;
    if (this.state.isMoveMode) this.closeMoveLayoutMode();
    this.state.isSleeping = true;
    this.world.setPlayerState('sleep', 0, 'Đang ngủ nướng...');
    document.getElementById('sleep-overlay').classList.remove('hidden');

    const homeLevel = 1 + this.state.ownedUpgrades.length;
    const stageInfo = window.GAME_DATA.homeInteriorStages[Math.min(5, homeLevel - 1)];
    const ageObj = window.GAME_DATA.ages[this.state.age];
    const tickCoins = Math.max(1, Math.round(stageInfo.bonusCoinsOnRest * 0.45 * ageObj.sleepBonus));

    document.getElementById('sleep-status-sub').textContent =
      `Đang nghỉ ngơi trong ${stageInfo.title}. (Sau mỗi 5 giây: +12 Thể Lực, +${tickCoins} Xu & +5% Tâm An)`;

    this.sleepCycleElapsed = 0;
    this._updateSleepProgressUI(0, tickCoins);

    if (this.sleepTimer) clearInterval(this.sleepTimer);
    this.sleepTimer = setInterval(() => {
      if (!this.state.isSleeping) return;
      this.sleepCycleElapsed += 0.1;

      if (this.sleepCycleElapsed >= 5.0) {
        this.sleepCycleElapsed = 0;
        this.state.coins += tickCoins;
        this.state.energy = Math.min(this.state.maxEnergy, this.state.energy + 12);
        this.state.peace = Math.min(this.state.maxPeace, this.state.peace + 5);
        window.audioEngine.playCoinSfx();
        this.refreshHUD();
        this._saveState();
      }

      this._updateSleepProgressUI(this.sleepCycleElapsed, tickCoins);
    }, 100);
  }

  stopSleeping() {
    this.state.isSleeping = false;
    if (this.sleepTimer) clearInterval(this.sleepTimer);
    this.world.setPlayerState('idle', 0, '');
    document.getElementById('sleep-overlay').classList.add('hidden');
    this.showToast('🌅 Bạn thức dậy với cơ thể tràn đầy năng lượng để tiếp tục làm việc khám phá!');
    this.refreshHUD();
  }

  // =======================================================================
  // QUIZ / TRIVIA MODAL SYSTEM (WITH BRAINTEASER CATEGORY & DROP LIST)
  // =======================================================================
  _bindQuizUI() {
    document.getElementById('btn-close-quiz').addEventListener('click', () => {
      document.getElementById('quiz-modal').classList.add('hidden');
    });

    const syncQuizCat = (cat) => {
      this.state.quizCategory = cat;
      const tabs = document.querySelectorAll('#quiz-cat-tabs .q-tab');
      for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute('data-cat') === cat) tabs[i].classList.add('active');
        else tabs[i].classList.remove('active');
      }
      const quizSel = document.getElementById('quiz-cat-select');
      if (quizSel) quizSel.value = cat;
      this.loadNextQuestion();
    };

    document.getElementById('quiz-cat-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.q-tab');
      if (!tab) return;
      syncQuizCat(tab.getAttribute('data-cat'));
    });

    const quizCatSelect = document.getElementById('quiz-cat-select');
    if (quizCatSelect) {
      quizCatSelect.addEventListener('change', (e) => {
        syncQuizCat(e.target.value);
      });
    }

    document.getElementById('btn-next-question').addEventListener('click', () => {
      this.loadNextQuestion();
    });
  }

  openQuizModal() {
    const quizSel = document.getElementById('quiz-cat-select');
    if (quizSel) quizSel.value = this.state.quizCategory;
    document.getElementById('quiz-modal').classList.remove('hidden');
    this.loadNextQuestion();
  }

  loadNextQuestion() {
    const pool = window.GAME_DATA.questions.filter(
      q => this.state.quizCategory === 'all' || q.cat === this.state.quizCategory
    );
    const item = pool[Math.floor(Math.random() * pool.length)];
    this.currentQuizItem = item;

    const catBadges = {
      brainteaser: '🤪 Đố Mẹo Hóc Búa & Sự Thật Bất Ngờ Từ Cuộc Sống',
      nature: '🌾 Tri Thức Thiên Nhiên & Sinh Tồn',
      healing: '🪷 Triết Lý Sống Chậm & Chữa Lành',
      spiritual: '⛪ Tâm Linh, Thánh Ca & Văn Hoá'
    };
    const catBadgeEl = document.getElementById('quiz-category');
    if (catBadgeEl) {
      catBadgeEl.textContent = catBadges[item.cat] || '🌾 Tri Thức Mưa Thuận Gió Hoà';
    }

    const ageObj = window.GAME_DATA.ages[this.state.age];
    const baseReward = (item.cat === 'brainteaser' ? 13 : 11) + Math.min(8, this.state.quizStreak * 2);
    const finalReward = Math.round(baseReward * ageObj.quizBonus * this.getCoinMultiplier());
    this.currentQuizReward = finalReward;

    document.getElementById('quiz-streak-count').textContent = this.state.quizStreak;
    document.getElementById('quiz-reward-preview').textContent = `+${finalReward} Xu`;
    document.getElementById('quiz-question-text').textContent = item.q;
    document.getElementById('quiz-feedback-box').classList.add('hidden');

    const container = document.getElementById('quiz-options-container');
    container.innerHTML = '';

    const indices = item.options.map((_, idx) => idx);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = indices[i];
      indices[i] = indices[j];
      indices[j] = temp;
    }

    indices.forEach((origIdx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option-btn';
      btn.textContent = item.options[origIdx];
      btn.addEventListener('click', () => this._handleQuizAnswer(btn, origIdx === item.ans));
      container.appendChild(btn);
    });
  }

  _handleQuizAnswer(clickedBtn, isCorrect) {
    const allBtns = document.querySelectorAll('#quiz-options-container .quiz-option-btn');
    for (let i = 0; i < allBtns.length; i++) allBtns[i].disabled = true;

    const feedbackBox = document.getElementById('quiz-feedback-box');
    const feedbackText = document.getElementById('quiz-feedback-text');
    feedbackBox.classList.remove('hidden');

    if (isCorrect) {
      clickedBtn.classList.add('correct');
      this.state.quizStreak += 1;
      this.state.coins += this.currentQuizReward;
      this.state.peace = Math.min(this.state.maxPeace, this.state.peace + 5);
      window.audioEngine.playCoinSfx();
      this._completeQuest('q_quiz');
      feedbackText.textContent = `🎉 ${this.currentQuizItem.explain} (Nhận +${this.currentQuizReward} Xu!)`;
    } else {
      clickedBtn.classList.add('wrong');
      this.state.quizStreak = 0;
      const consolation = 3;
      this.state.coins += consolation;
      feedbackText.textContent = `💡 Chưa chính xác, bạn nhận +${consolation} Xu khích lệ! Đáp án đúng: "${this.currentQuizItem.options[this.currentQuizItem.ans]}" — ${this.currentQuizItem.explain}`;
    }

    document.getElementById('quiz-streak-count').textContent = this.state.quizStreak;
    this.refreshHUD();
    this._saveState();
  }

  // =======================================================================
  // HOME UPGRADE & DECORATION SYSTEM
  // =======================================================================
  _bindUpgradeUI() {
    document.getElementById('btn-close-upgrade').addEventListener('click', () => {
      document.getElementById('upgrade-modal').classList.add('hidden');
    });
  }

  openUpgradeModal() {
    this.renderUpgradeItems();
    document.getElementById('upgrade-modal').classList.remove('hidden');
  }

  getUpgradeEffectiveCost(up) {
    const discount = this.hasTool('shelter_kit') ? 0.85 : 1.0;
    return Math.round(up.cost * discount);
  }

  getPassiveIncomePer5Sec() {
    let total = window.GAME_DATA.upgrades
      .filter(u => this.state.ownedUpgrades.indexOf(u.id) !== -1)
      .reduce((sum, u) => sum + u.passiveCoins, 0);
    if (this.hasTool('repair_kit')) total += 1;
    if (this.hasTool('lantern_net')) total += 2;
    if (this.hasTool('app_kitchen_cabinet')) total += 2;
    if (this.hasTool('app_fridge')) total += 2;
    if (this.hasTool('app_tv')) total += 3;
    if (this.hasTool('pet_dog')) total += 1;
    if (this.hasTool('pet_cat')) total += 1;
    if (this.hasTool('pet_bird_cage')) total += 2;
    if (this.hasTool('farm_chickens')) total += 2;
    if (this.hasTool('farm_ducks')) total += 3;

    // Courtyard Fence passive bonuses
    window.GAME_DATA.shopTools
      .filter(t => t.category === 'fences' && this.hasTool(t.id))
      .forEach((f) => {
        total += f.passiveBonus || 0;
      });

    // Equipped World Traditional Costume passive bonus
    const eqCostume = this.getEquippedCostumeObject();
    if (eqCostume && eqCostume.passiveBonus) {
      total += eqCostume.passiveBonus;
    }

    // Expanded Cultivable Land passive bonuses
    (window.GAME_DATA.landExpansions || []).forEach((lp) => {
      if (this.hasLandExpansion(lp.id)) {
        total += lp.passiveCoins || 0;
      }
    });

    return total;
  }

  renderUpgradeItems() {
    document.getElementById('upgrade-wallet-coins').textContent = `${this.state.coins} 🪙`;
    document.getElementById('upgrade-passive-summary').textContent = `+${this.getPassiveIncomePer5Sec()} Xu / 5 giây`;

    const container = document.getElementById('upgrade-items-container');
    container.innerHTML = '';

    window.GAME_DATA.upgrades.forEach((up) => {
      const owned = this.state.ownedUpgrades.indexOf(up.id) !== -1;
      const finalCost = this.getUpgradeEffectiveCost(up);
      const canAfford = this.state.coins >= finalCost;

      const card = document.createElement('div');
      card.className = `upgrade-item-card ${owned ? 'owned' : ''}`;
      card.innerHTML = `
        <div class="up-top">
          <div class="up-icon">${up.icon}</div>
          <div>
            <div class="up-title">${up.name}</div>
            <div class="up-desc">${up.desc}</div>
            <div class="up-perk">✨ ${up.perkText}</div>
          </div>
        </div>
        <div class="up-bottom">
          <span style="font-size:0.85rem;font-weight:700;color:#fde68a;">
            ${owned ? '✅ Đã xây dựng hoàn tất' : `Chi phí: ${finalCost} 🪙 ${this.hasTool('shelter_kit') ? '(Giảm 15%)' : ''}`}
          </span>
          <button type="button" class="btn-buy-upgrade" ${owned || !canAfford ? 'disabled' : ''}>
            ${owned ? 'Đã Sở Hữu' : (canAfford ? '🔨 Nâng Cấp Ngay' : 'Chưa Đủ Xu')}
          </button>
        </div>
      `;

      if (!owned) {
        const btn = card.querySelector('.btn-buy-upgrade');
        btn.addEventListener('click', () => this.buyUpgrade(up, finalCost));
      }
      container.appendChild(card);
    });
  }

  buyUpgrade(up, finalCost) {
    if (this.state.coins < finalCost || this.state.ownedUpgrades.indexOf(up.id) !== -1) return;
    this.state.coins -= finalCost;
    this.state.ownedUpgrades.push(up.id);
    this.state.peace = Math.min(100, this.state.peace + up.peaceBonus);

    this.world.buildStarterHomeAndUpgrades(
      this.state.ownedUpgrades,
      this.state.ownedStationProps,
      this.state.ownedTools
    );
    window.audioEngine.playUpgradeSfx();

    if (up.id === 'wooden_cabin') this._completeQuest('q_upgrade1');

    const newLevel = 1 + this.state.ownedUpgrades.length;
    this.showToast(`🏡 Chúc mừng! Ngôi nhà của bạn đã nâng lên Cấp ${newLevel}/6 ("${up.name}")!`);
    this.renderUpgradeItems();
    this.refreshHUD();
    this._saveState();
  }

  // =======================================================================
  // AUTHOR MAXNGO, PLAYER FEEDBACK & COFFEE DONATE MODAL
  // =======================================================================
  _bindAuthorUI() {
    const openAuthor = () => this.openAuthorModal();
    const btnHudAuthor = document.getElementById('btn-open-author');
    if (btnHudAuthor) btnHudAuthor.addEventListener('click', openAuthor);

    const btnIntroAuthor = document.getElementById('btn-intro-author');
    if (btnIntroAuthor) btnIntroAuthor.addEventListener('click', openAuthor);

    const btnCloseAuthor = document.getElementById('btn-close-author');
    if (btnCloseAuthor) {
      btnCloseAuthor.addEventListener('click', () => {
        document.getElementById('author-modal').classList.add('hidden');
      });
    }

    const btnCopyEmail = document.getElementById('btn-copy-email');
    if (btnCopyEmail) {
      btnCopyEmail.addEventListener('click', () => {
        const emailAddr = 'tannt4@gmail.com';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(emailAddr).catch(() => {});
        }
        this.showToast('📋 Đã sao chép email nhận góp ý: tannt4@gmail.com!');
      });
    }

    const btnSubmitFeedback = document.getElementById('btn-submit-feedback');
    if (btnSubmitFeedback) {
      btnSubmitFeedback.addEventListener('click', () => {
        const catEl = document.getElementById('feedback-category');
        const msgEl = document.getElementById('feedback-message');
        const rawMsg = msgEl ? msgEl.value.trim() : '';
        if (!rawMsg) {
          this.showToast('⚠️ Bạn hãy viết vài dòng góp ý hoặc lời nhắn trước khi gửi về tannt4@gmail.com nhé!');
          return;
        }

        const catVal = catEl ? catEl.value : '💡 Góp ý';
        const playerName = this.state.playerName || 'Người chơi';
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}`;
        this.state.feedbackList.unshift({
          author: playerName,
          cat: catVal,
          text: rawMsg,
          time: timeStr
        });

        if (msgEl) msgEl.value = '';
        this.state.coins += 10;
        this.state.peace = Math.min(this.state.maxPeace, this.state.peace + 5);
        window.audioEngine.playCoinSfx();

        this.renderFeedbackHistory();
        this.refreshHUD();
        this._saveState();

        // Mở ứng dụng email gửi trực tiếp về tannt4@gmail.com
        const subject = encodeURIComponent(`[Mưa Thuận Gió Hoà] ${catVal} - từ ${playerName}`);
        const body = encodeURIComponent(
          `Chào tác giả MaxNgo,\n\nNgười chơi: ${playerName}\nChủ đề: ${catVal}\nThời gian: ${timeStr}\n\nNội dung góp ý:\n${rawMsg}\n\n---\nGửi từ game 3D Mưa Thuận Gió Hoà`
        );
        const mailtoUrl = `mailto:tannt4@gmail.com?subject=${subject}&body=${body}`;
        const mailLink = document.createElement('a');
        mailLink.href = mailtoUrl;
        mailLink.style.display = 'none';
        document.body.appendChild(mailLink);
        try {
          mailLink.click();
        } catch (e) {}
        if (mailLink.parentNode) mailLink.parentNode.removeChild(mailLink);

        this.showToast('💌 Đã ghi nhận & mở trình gửi email về tannt4@gmail.com! Tặng bạn +10 Xu Tri Ân.');
      });
    }
  }

  openAuthorModal() {
    this.renderFeedbackHistory();
    document.getElementById('author-modal').classList.remove('hidden');
  }

  renderFeedbackHistory() {
    const listEl = document.getElementById('feedback-history-list');
    const countEl = document.getElementById('feedback-count');
    if (!listEl) return;
    listEl.innerHTML = '';

    const items = this.state.feedbackList || [];
    if (countEl) countEl.textContent = items.length;

    items.slice(0, 12).forEach((fb) => {
      const div = document.createElement('div');
      div.className = 'feedback-item';
      div.innerHTML = `
        <div class="fb-head">
          <strong>👤 ${escapeHtml(fb.author)}</strong>
          <span class="fb-cat">${escapeHtml(fb.cat)} • ${escapeHtml(fb.time)}</span>
        </div>
        <div class="fb-body">${escapeHtml(fb.text)}</div>
      `;
      listEl.appendChild(div);
    });
  }

  // =======================================================================
  // QUESTS, HUD REFRESH & TIMERS
  // =======================================================================
  _completeQuest(questId) {
    if (this.state.completedQuests.indexOf(questId) !== -1) return;
    const qObj = window.GAME_DATA.quests.find(q => q.id === questId);
    if (!qObj) return;
    this.state.completedQuests.push(questId);
    this.state.coins += qObj.reward;
    this.showToast(`🏅 Hoàn thành nhật ký: "${qObj.text}" (+${qObj.reward} Xu!)`);
    this.refreshHUD();
  }

  refreshHUD() {
    const moodObj = window.GAME_DATA.moods[this.state.mood] || window.GAME_DATA.moods.bored;
    const regObj = window.GAME_DATA.regions[this.state.region] || window.GAME_DATA.regions.mountain;
    const eqCostume = this.getEquippedCostumeObject();

    document.getElementById('hud-avatar-emoji').textContent = moodObj.emoji;
    document.getElementById('hud-player-name').textContent = this.state.playerName;
    document.getElementById('hud-region-badge').textContent = regObj.badge;

    this.syncOutfitDropdowns();
    if (this._syncLabelUI) this._syncLabelUI();

    const hudMoodSelect = document.getElementById('hud-select-mood');
    if (hudMoodSelect) hudMoodSelect.value = this.state.mood || 'bored';

    const hudAgeSelect = document.getElementById('hud-select-age');
    if (hudAgeSelect) hudAgeSelect.value = this.state.age || 'youth';

    // Update Dedicated World Traditional Costume Slot ("👘 Ô Trang Phục Thế Giới")
    const slotIconEl = document.getElementById('hud-costume-slot-icon');
    const slotNameEl = document.getElementById('hud-costume-slot-name');
    const dockCostumeIcon = document.getElementById('dock-costume-icon');
    const dockCostumeBadge = document.getElementById('dock-costume-badge');
    const totalOwnedCostumes = (this.state.ownedCostumes || []).length;

    if (eqCostume) {
      if (slotIconEl) slotIconEl.textContent = eqCostume.flag;
      if (slotNameEl) slotNameEl.textContent = `${eqCostume.country}: ${eqCostume.name}`;
      if (dockCostumeIcon) dockCostumeIcon.textContent = eqCostume.flag;
      if (dockCostumeBadge) dockCostumeBadge.textContent = `Đang mặc: ${eqCostume.country} (${totalOwnedCostumes}/16)`;
    } else {
      const stObj = (window.GAME_DATA.characterStyles && window.GAME_DATA.characterStyles[this.state.style])
        || window.GAME_DATA.characterStyles.default;
      if (slotIconEl) slotIconEl.textContent = '👘';
      if (slotNameEl) slotNameEl.textContent = `Mặc định (${stObj.shortLabel})`;
      if (dockCostumeIcon) dockCostumeIcon.textContent = '👘';
      if (dockCostumeBadge) {
        dockCostumeBadge.textContent = totalOwnedCostumes > 0
          ? `Đã có ${totalOwnedCostumes}/16 Quốc phục`
          : '16 Quốc Phục Thế Giới';
      }
    }

    const stageCount = 1 + this.state.ownedUpgrades.length;
    const stageInfo = window.GAME_DATA.homeInteriorStages[Math.min(5, stageCount - 1)];
    document.getElementById('hud-home-stage').textContent = `${stageInfo.title} • ${regObj.homeName || ''}`;

    // House Enter/Exit button labels
    const topHouseBtn = document.getElementById('btn-toggle-house');
    const dockHouseIcon = document.getElementById('dock-house-icon');
    const dockHouseTitle = document.getElementById('dock-house-title');
    const dockHouseSub = document.getElementById('dock-house-sub');

    if (this.state.isInsideHouse) {
      if (topHouseBtn) topHouseBtn.textContent = '🚶 Ra Sân';
      dockHouseIcon.textContent = '🚶';
      dockHouseTitle.textContent = 'Ra Ngoài Sân';
      dockHouseSub.textContent = `Đang ở trong nhà Cấp ${stageCount}/6`;
    } else {
      if (topHouseBtn) topHouseBtn.textContent = '🚪 Vào Nhà';
      dockHouseIcon.textContent = '🚪';
      dockHouseTitle.textContent = 'Vào Trong Nhà';
      dockHouseSub.textContent = `Xem & kê đồ Cấp ${stageCount}/6`;
    }

    // Move button status
    const dockMoveTitle = document.getElementById('dock-move-title');
    const dockMoveSub = document.getElementById('dock-move-sub');
    if (this.state.isMoveMode) {
      dockMoveTitle.textContent = 'Thoát Sắp Xếp';
      dockMoveSub.textContent = 'Đang bật chế độ di chuyển';
    } else {
      dockMoveTitle.textContent = 'Sắp Xếp Vị Trí';
      dockMoveSub.textContent = this.state.isInsideHouse ? 'Kê đồ trong nhà (-Xu)' : 'Dời nhà, vườn, lửa (-Xu)';
    }

    const totalOwnedItems = this.state.ownedTools.length + this.state.ownedStationProps.length;
    if (totalOwnedItems === 0 && totalOwnedCostumes === 0) {
      document.getElementById('hud-tools-summary').textContent = '🎒 Hành trang: Chưa có (Mua tại Cửa Hàng Sinh Tồn)';
    } else {
      const icons = window.GAME_DATA.shopTools
        .filter(t => this.hasTool(t.id))
        .map(t => t.icon)
        .join(' ');
      const costumeBadge = eqCostume ? ` • ${eqCostume.flag}` : '';
      document.getElementById('hud-tools-summary').textContent =
        `🎒 Đã sắm: ${icons || '🪑'}${costumeBadge} (${this.state.ownedTools.length} đồ, ${totalOwnedCostumes} quốc phục)`;
    }

    const fishBonus = this.getStationPropsBonusCoins('fish');
    document.getElementById('dock-fish-sub').textContent = this.hasTool('fishing_rod')
      ? `+${11 + fishBonus}~${17 + fishBonus} Xu • Câu cá suối`
      : 'Mua Cần Câu ở Cửa Hàng';

    const hasPoultry = this.hasTool('farm_chickens') || this.hasTool('farm_ducks');
    const poultrySubEl = document.getElementById('dock-poultry-sub');
    if (poultrySubEl) {
      poultrySubEl.textContent = hasPoultry ? 'Cho ăn & Nhặt trứng (+Xu)' : 'Mua Gà/Vịt tại Cửa Hàng';
    }

    const hasKitchenOrTV = this.hasTool('app_cookware_set') || this.hasTool('app_kitchen_cabinet') || this.hasTool('app_tv');
    const kitchenSubEl = document.getElementById('dock-kitchen-sub');
    if (kitchenSubEl) {
      kitchenSubEl.textContent = hasKitchenOrTV ? 'Nấu cơm (+Sức) & Xem Tivi' : 'Sắm Bếp/Tivi ở Cửa Hàng';
    }

    document.getElementById('hud-coins').textContent = this.state.coins;
    const passive5 = this.getPassiveIncomePer5Sec();
    document.getElementById('hud-passive-rate').textContent = `+${passive5}/5s`;

    document.getElementById('hud-energy-text').textContent = `${Math.round(this.state.energy)}/${this.state.maxEnergy}`;
    document.getElementById('hud-energy-bar').style.width = `${(this.state.energy / this.state.maxEnergy) * 100}%`;

    const mult = this.getCoinMultiplier().toFixed(2);
    document.getElementById('hud-peace-text').textContent = `${Math.round(this.state.peace)}% (x${mult})`;
    document.getElementById('hud-peace-bar').style.width = `${this.state.peace}%`;

    const w = this.weatherCycle[this.state.weatherIndex] || this.weatherCycle[0];
    const weatherLabelEl = document.getElementById('hud-weather-label');
    if (weatherLabelEl) weatherLabelEl.textContent = w.shortLabel || w.label;
    const topWeatherSelect = document.getElementById('hud-select-weather-top');
    if (topWeatherSelect && topWeatherSelect.value !== w.id) {
      topWeatherSelect.value = w.id;
    }
    const audioWeatherSelect = document.getElementById('select-weather-audio');
    if (audioWeatherSelect && audioWeatherSelect.value !== w.id) {
      audioWeatherSelect.value = w.id;
    }

    const qList = document.getElementById('hud-quest-list');
    qList.innerHTML = '';
    window.GAME_DATA.quests.forEach((q) => {
      const done = this.state.completedQuests.indexOf(q.id) !== -1;
      const li = document.createElement('li');
      li.className = `quest-item ${done ? 'done' : ''}`;
      li.innerHTML = `
        <span>${done ? '✅' : '⭕'} ${q.text}</span>
        <strong style="color:#fde68a;">+${q.reward}🪙</strong>
      `;
      qList.appendChild(li);
    });

    const affordableUpgrade = window.GAME_DATA.upgrades.some(
      u => this.state.ownedUpgrades.indexOf(u.id) === -1 && this.state.coins >= this.getUpgradeEffectiveCost(u)
    );
    document.getElementById('dock-upgrade-badge').textContent = affordableUpgrade
      ? '✨ Đủ Xu nâng cấp mới!'
      : `Đang ở Cấp ${stageCount}/6`;

    if (this.state.activeStationKey && !this.state.isMoveMode) {
      this.showStationPropsMenu(this.state.activeStationKey);
    }
    if (this.state.uiPanels && this.state.uiPanels.pets) {
      this.renderPetsManagementPanel();
    }
  }

  _startTimers() {
    if (this.passiveTimer) clearInterval(this.passiveTimer);
    if (this.clockTimer) clearInterval(this.clockTimer);

    this.passiveTimer = setInterval(() => {
      const passive = this.getPassiveIncomePer5Sec();
      if (passive > 0) {
        this.state.coins += passive;
        this.refreshHUD();
        this._saveState();
      }
    }, 5000);

    // Real-time clock update every second
    this._syncRealTimeClock();
    this.clockTimer = setInterval(() => {
      this._syncRealTimeClock();
    }, 1000);
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3400);
  }

  _startMainLoop() {
    const animate = () => {
      requestAnimationFrame(animate);
      if (this.world) {
        this.world.update();
        const nearest = this.world.getNearestInteractable();
        const promptEl = document.getElementById('proximity-prompt');
        if (nearest && !this.state.isSleeping && !this.state.isMoveMode) {
          promptEl.classList.remove('hidden');
          document.getElementById('proximity-action-name').textContent = nearest.name;
        } else {
          promptEl.classList.add('hidden');
        }
      }
    };
    animate();
  }
}

window.MuaThuanGioHoaGame = MuaThuanGioHoaGame;

window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new MuaThuanGioHoaGame();
});
