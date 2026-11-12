// =========================================================================
// MƯA THUẬN GIÓ HOÀ - UNIVERSAL 3D ENGINE (CHROME + SAFARI 100% NATIVE)
// - Wide, spacious layout for Exterior Island & Interior Room
// - Paid Relocation / Placement Mode for both Exterior buildings & Interior furniture
// - Real-time Day & Night sky lighting synchronized with actual local clock
// - Removed physical 3D Shop Stall (all shopping unified in Survival Shop UI)
// =========================================================================

class CozyWorld3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Camera 3D Orbit State (Zoomed comfortably to see wide spacious layout)
    this.camAngle = 0.42;
    this.camPitch = 0.56;
    this.camZoom = 18.5;
    this.isDragging = false;
    this.dragDist = 0;
    this.downMouse = { x: 0, y: 0 };
    this.prevMouse = { x: 0, y: 0 };
    this.hoverGroundPt = { x: 0, z: 0 };

    // Scene Mode: 'exterior' | 'interior'
    this.sceneMode = 'exterior';
    this.regionId = 'mountain';
    this.weatherMode = 'sunny';
    this.isNightTime = false;
    this.realHourFloat = 12.0;

    // Move / Rearrange Mode State (Di chuyển vị trí nhà, vườn rau, đống lửa, nội thất...)
    this.moveMode = {
      active: false,
      selectedId: null,
      selectedName: '',
      cost: 15
    };

    // Custom Layouts (loaded from state or defaults)
    this.exteriorLayout = JSON.parse(JSON.stringify(window.GAME_DATA.defaultExteriorLayout));
    this.interiorLayout = JSON.parse(JSON.stringify(window.GAME_DATA.defaultInteriorLayout));

    // Character & Companion State
    this.playerConfig = {
      playerName: 'Kẻ Mộng Mơ',
      gender: 'male',
      age: 'youth',
      mood: 'bored',
      style: 'default',
      costume: null,
      equippedCostume: null
    };
    this.playerPos = { x: 0, y: 0, z: 2.0 };
    this.playerTarget = null;
    this.playerFacing = 0;
    this.smoothFacing = 0;
    this.playerSpeed = 0;
    this.walkCyclePhase = 0;
    this.stepDustTimer = 0;
    this.playerState = 'idle'; // idle | walk | work | garden | fish | sleep | pray
    this.actionTimer = 0;
    this.actionTotal = 0;
    this.actionLabel = '';
    this.onArriveCallback = null;

    this.petPos = { x: -2.2, y: 0, z: 2.5 };
    this.catPos = { x: 2.2, y: 0, z: 2.5 };
    this.dogVel = { x: 0, z: 0 };
    this.catVel = { x: 0, z: 0 };
    this.dogGaitPhase = 0;
    this.catGaitPhase = 0;
    this.dogBehavior = 'trot'; // trot | sit | sniff
    this.catBehavior = 'trot'; // trot | sit | groom
    this.petSettings = { dogFollow: true, catFollow: true };

    // Custom 3D Label Visibility & Rename Settings
    this.labelSettings = {
      showCharacterLabels: true,
      showObjectLabels: true,
      customNames: {}
    };

    // Click Marker & Footstep Dust Particles
    this.clickMarker = { active: false, x: 0, z: 0, timer: 0 };
    this.footstepParticles = [];

    // Owned Upgrades, Tools, Station Props & Land Expansions
    this.ownedUpgrades = [];
    this.ownedStationProps = [];
    this.ownedTools = [];
    this.ownedLandExpansions = [];

    // Generated Scenery Entities
    this.trees = [];
    this.hills = [];
    this.flowers = [];
    this.stars = [];
    this.interactables = [];
    this.rainDrops = [];
    this.floatingEffects = [];

    // Callbacks
    this.onGroundClickCallback = null;
    this.onStationClickCallback = null;
    this.onSelectMovableCallback = null;
    this.onPlaceMovableCallback = null;

    // Keyboard & Timing
    this.keys = {};
    this.lastTime = performance.now();
    this.elapsed = 0;

    this._resize();
    this._initParticles();
    this._bindInputs();
    this.buildRegion('mountain');
  }

  _resize() {
    this.width = window.innerWidth || 1024;
    this.height = window.innerHeight || 768;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
  }

  _initParticles() {
    this.rainDrops = [];
    for (let i = 0; i < 160; i++) {
      this.rainDrops.push({
        x: Math.random() * 2000,
        y: Math.random() * 1200,
        len: 14 + Math.random() * 14,
        speed: 550 + Math.random() * 280
      });
    }

    this.snowFlakes = [];
    for (let i = 0; i < 130; i++) {
      this.snowFlakes.push({
        x: Math.random() * 2000,
        y: Math.random() * 1200,
        r: 1.8 + Math.random() * 3.2,
        speedY: 48 + Math.random() * 65,
        driftX: 18 + Math.random() * 28,
        phase: Math.random() * Math.PI * 2
      });
    }

    this.windStreaks = [];
    for (let i = 0; i < 45; i++) {
      this.windStreaks.push({
        x: Math.random() * 2000,
        y: Math.random() * 1000,
        len: 45 + Math.random() * 75,
        speed: 260 + Math.random() * 220,
        isLeaf: i % 2 === 0,
        phase: Math.random() * Math.PI * 2,
        color: i % 4 === 0 ? '#fde047' : (i % 3 === 0 ? '#fb923c' : '#4ade80')
      });
    }

    this.stars = [];
    for (let i = 0; i < 95; i++) {
      this.stars.push({
        xFrac: Math.random(),
        yFrac: Math.random() * 0.48,
        r: 1 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  _bindInputs() {
    window.addEventListener('resize', () => this._resize());

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (this._lastTouchTime && Date.now() - this._lastTouchTime < 450) return;
      if (e.button === 0) {
        this.isDragging = true;
        this.dragDist = 0;
        this.downMouse = { x: e.clientX, y: e.clientY };
        this.prevMouse = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this._lastTouchTime && Date.now() - this._lastTouchTime < 450) return;
      const rect = this.canvas.getBoundingClientRect();
      this.hoverGroundPt = this.unprojectGround(e.clientX - rect.left, e.clientY - rect.top);

      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMouse.x;
      const dy = e.clientY - this.prevMouse.y;
      this.dragDist += Math.abs(dx) + Math.abs(dy);
      this.prevMouse = { x: e.clientX, y: e.clientY };
      if (this.dragDist > 6) {
        this.camAngle -= dx * 0.007;
        this.camPitch = Math.max(0.32, Math.min(1.05, this.camPitch + dy * 0.005));
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (this._lastTouchTime && Date.now() - this._lastTouchTime < 450) return;
      if (this.isDragging && e.button === 0) {
        this.isDragging = false;
        if (this.dragDist < 9 && e.target === this.canvas) {
          this._handleCanvasClick(e.clientX, e.clientY);
        }
      }
    });

    this.canvas.addEventListener('touchstart', (e) => {
      this._lastTouchTime = Date.now();
      if (e.touches.length === 1) {
        const t = e.touches[0];
        this.isDragging = true;
        this.dragDist = 0;
        this.downMouse = { x: t.clientX, y: t.clientY };
        this.prevMouse = { x: t.clientX, y: t.clientY };
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      this._lastTouchTime = Date.now();
      if (!this.isDragging || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - this.prevMouse.x;
      const dy = t.clientY - this.prevMouse.y;
      this.dragDist += Math.abs(dx) + Math.abs(dy);
      this.prevMouse = { x: t.clientX, y: t.clientY };
      if (this.dragDist > 8) {
        this.camAngle -= dx * 0.007;
        this.camPitch = Math.max(0.32, Math.min(1.05, this.camPitch + dy * 0.005));
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this._lastTouchTime = Date.now();
      if (this.isDragging) {
        this.isDragging = false;
        if (this.dragDist < 14) {
          this._handleCanvasClick(this.downMouse.x, this.downMouse.y);
        }
      }
    }, { passive: true });

    this.canvas.addEventListener('wheel', (e) => {
      this.camZoom = Math.max(12, Math.min(34, this.camZoom - e.deltaY * 0.015));
    }, { passive: true });
  }

  // =======================================================================
  // 3D PROJECTION & GROUND UNPROJECTION MATH
  // =======================================================================
  project3D(wx, wy, wz) {
    const isPortraitMobile = this.width <= 540 && this.height > this.width;
    const followWeight = isPortraitMobile ? 0.36 : 0.25;
    const focusX = this.sceneMode === 'interior' ? 0 : this.playerPos.x * followWeight;
    const focusZ = this.sceneMode === 'interior' ? 0 : this.playerPos.z * followWeight;

    const dx = wx - focusX;
    const dz = wz - focusZ;

    const cosA = Math.cos(this.camAngle);
    const sinA = Math.sin(this.camAngle);

    const rx = dx * cosA - dz * sinA;
    const rz = dx * sinA + dz * cosA;

    const sinP = Math.sin(this.camPitch);
    const cosP = Math.cos(this.camPitch);

    const fovDist = 42;
    const depth = rz * cosP + fovDist;
    const viewportZoomMult = isPortraitMobile
      ? Math.max(0.68, Math.min(0.84, this.width / 490))
      : (this.width <= 860 ? 0.88 : 1.0);
    const effectiveZoom = this.camZoom * viewportZoomMult;
    const scale = (effectiveZoom * fovDist) / Math.max(10, depth);

    const sx = this.width * 0.5 + rx * scale;
    const centerYRatio = isPortraitMobile ? 0.48 : 0.54;
    const sy = this.height * centerYRatio + (rz * sinP - wy * cosP) * scale;

    return { x: sx, y: sy, depth: rz, scale: scale };
  }

  unprojectGround(screenX, screenY) {
    let bestX = 0;
    let bestZ = 0;
    let step = 11.0;

    for (let iter = 0; iter < 9; iter++) {
      let localBestX = bestX;
      let localBestZ = bestZ;
      let bestErr = 1e9;

      for (let ix = -2; ix <= 2; ix++) {
        for (let iz = -2; iz <= 2; iz++) {
          const tx = bestX + ix * step;
          const tz = bestZ + iz * step;
          const p = this.project3D(tx, 0, tz);
          const err = (p.x - screenX) * (p.x - screenX) + (p.y - screenY) * (p.y - screenY);
          if (err < bestErr) {
            bestErr = err;
            localBestX = tx;
            localBestZ = tz;
          }
        }
      }
      bestX = localBestX;
      bestZ = localBestZ;
      step *= 0.45;
    }

    if (this.sceneMode === 'interior') {
      bestX = Math.max(-10.2, Math.min(10.2, bestX));
      bestZ = Math.max(-8.8, Math.min(8.8, bestZ));
    } else {
      const hasExpansions = this.ownedLandExpansions && this.ownedLandExpansions.length > 0;
      const maxR = hasExpansions ? 30.5 : 25.0;
      const r = Math.hypot(bestX, bestZ);
      if (r > maxR) {
        bestX = (bestX / r) * maxR;
        bestZ = (bestZ / r) * maxR;
      }
    }
    return { x: bestX, y: 0, z: bestZ };
  }

  isPointOnExpandedLand(wx, wz) {
    if (!this.ownedLandExpansions || this.ownedLandExpansions.length === 0) return false;
    const allPlots = (window.GAME_DATA && window.GAME_DATA.landExpansions) || [];
    for (let i = 0; i < allPlots.length; i++) {
      const plot = allPlots[i];
      if (this.ownedLandExpansions.indexOf(plot.id) === -1) continue;
      const c = plot.coords;
      if (!c) continue;
      const nx = (wx - c.x) / (c.rx + 0.8);
      const nz = (wz - c.z) / (c.rz + 0.8);
      if (nx * nx + nz * nz <= 1.0) return true;
      if (Math.hypot(wx - c.bridgeX, wz - c.bridgeZ) <= 2.8) return true;
    }
    return false;
  }

  // =======================================================================
  // MOVE / RELOCATE BUILDINGS & INTERIOR FURNITURE (COSTS COINS)
  // =======================================================================
  setLayouts(extLayout, intLayout) {
    if (extLayout) {
      for (const k in extLayout) {
        if (this.exteriorLayout[k]) {
          this.exteriorLayout[k].x = extLayout[k].x;
          this.exteriorLayout[k].z = extLayout[k].z;
        }
      }
    }
    if (intLayout) {
      for (const k in intLayout) {
        if (this.interiorLayout[k]) {
          this.interiorLayout[k].x = intLayout[k].x;
          this.interiorLayout[k].z = intLayout[k].z;
        }
      }
    }
    this._setupInteractables();
  }

  setMoveMode(active) {
    this.moveMode.active = active;
    this.moveMode.selectedId = null;
    this.moveMode.selectedName = '';
  }

  selectMovableItem(itemId) {
    const dict = this.sceneMode === 'interior' ? this.interiorLayout : this.exteriorLayout;
    const item = dict[itemId];
    if (!item) return;
    this.moveMode.active = true;
    this.moveMode.selectedId = itemId;
    this.moveMode.selectedName = item.name;
    this.moveMode.cost = item.moveCost || (this.sceneMode === 'interior' ? 10 : 15);
    if (this.onSelectMovableCallback) {
      this.onSelectMovableCallback(itemId, item);
    }
  }

  _handleCanvasClick(clientX, clientY) {
    if (this.playerState === 'sleep') return;
    const rect = this.canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    const worldPt = this.unprojectGround(sx, sy);

    // 1. IF IN MOVE / REARRANGE MODE:
    if (this.moveMode.active) {
      const dict = this.sceneMode === 'interior' ? this.interiorLayout : this.exteriorLayout;

      // Check if user clicked on a movable object to select it
      for (const key in dict) {
        if (!Object.prototype.hasOwnProperty.call(dict, key)) continue;
        if (this.sceneMode === 'exterior') {
          if (key === 'windmill' && this.ownedUpgrades.indexOf('koi_windmill') === -1) continue;
          if (key === 'bell' && this.ownedUpgrades.indexOf('sanctuary_bell') === -1) continue;
        } else {
          if (!this.isInteriorItemVisible(key)) continue;
        }

        const obj = dict[key];
        const p = this.project3D(obj.x, 1.0, obj.z);
        const distSq = (p.x - sx) * (p.x - sx) + (p.y - sy) * (p.y - sy);
        if (distSq < 48 * 48 && this.moveMode.selectedId !== key) {
          this.selectMovableItem(key);
          return;
        }
      }

      // If an item is already selected, place it at worldPt and charge coins!
      if (this.moveMode.selectedId && this.onPlaceMovableCallback) {
        this.onPlaceMovableCallback(
          this.sceneMode,
          this.moveMode.selectedId,
          { x: Number(worldPt.x.toFixed(2)), z: Number(worldPt.z.toFixed(2)) },
          this.moveMode.cost,
          this.moveMode.selectedName
        );
      }
      return;
    }

    // 2. NORMAL PLAY MODE: Check if clicked on an interactable station badge
    for (let i = 0; i < this.interactables.length; i++) {
      const st = this.interactables[i];
      if (st.mode && st.mode !== this.sceneMode) continue;
      const p = this.project3D(st.pos.x, 1.4, st.pos.z);
      const distSq = (p.x - sx) * (p.x - sx) + (p.y - sy) * (p.y - sy);
      if (distSq < 48 * 48) {
        this.clickMarker = { active: true, x: st.pos.x, z: st.pos.z, timer: 2.8 };
        this.movePlayerToAndAct(st.pos, 'idle', 0.4, () => {
          if (this.onStationClickCallback) this.onStationClickCallback(st.id);
        });
        return;
      }
    }

    // Otherwise walk to clicked ground point
    this.clickMarker = { active: true, x: worldPt.x, z: worldPt.z, timer: 3.0 };

    for (let i = 0; i < this.interactables.length; i++) {
      const st = this.interactables[i];
      if (st.mode && st.mode !== this.sceneMode) continue;
      if (Math.hypot(worldPt.x - st.pos.x, worldPt.z - st.pos.z) < 2.5) {
        this.movePlayerToAndAct(st.pos, 'idle', 0.4, () => {
          if (this.onStationClickCallback) this.onStationClickCallback(st.id);
        });
        return;
      }
    }

    this.movePlayerToAndAct(worldPt, 'idle', 0, null);
    if (this.onGroundClickCallback) {
      this.onGroundClickCallback(worldPt);
    }
  }

  hasOwnedTool(toolId) {
    return this.ownedTools.indexOf(toolId) !== -1;
  }

  isInteriorItemVisible(keyOrItem) {
    const item = typeof keyOrItem === 'string' ? this.interiorLayout[keyOrItem] : keyOrItem;
    if (!item) return false;
    const homeLevel = 1 + this.ownedUpgrades.length;
    if (item.requiresTool) {
      return this.hasOwnedTool(item.requiresTool);
    }
    if (item.altTool && this.hasOwnedTool(item.altTool)) {
      return true;
    }
    return homeLevel >= (item.minLevel || 1);
  }

  // =======================================================================
  // BUILD SPACIOUS REGION & DYNAMIC INTERACTABLE POSITIONS
  // =======================================================================
  buildRegion(regionId) {
    this.regionId = regionId;
    this.trees = [];
    this.hills = [];
    this.flowers = [];

    // Distant hills around the expanded 28-radius island
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      this.hills.push({
        x: Math.cos(a) * 28.5,
        z: Math.sin(a) * 28.5,
        r: 5.5 + (i % 3) * 1.8,
        h: 5.5 + (i % 3) * 2.5,
        snow: regionId === 'mountain' && i % 2 === 0
      });
    }

    // Perimeter Trees (Placed on outer ring 17.5..24.5 so central living area is wide open & clear)
    const treeCount = regionId === 'bamboo' ? 30 : 22;
    for (let i = 0; i < treeCount; i++) {
      const a = (i / treeCount) * Math.PI * 2 + (i % 3) * 0.1;
      const dist = 17.5 + (i % 4) * 2.1;
      const x = Math.cos(a) * dist;
      const z = Math.sin(a) * dist;
      if (x < -11 && x > -19) continue; // Keep stream clear
      this.trees.push({
        x: x,
        z: z,
        scale: 0.9 + (i % 3) * 0.22,
        type: regionId
      });
    }

    // Wildflowers scattered gently
    const flowerColors = ['#fbbf24', '#f472b6', '#60a5fa', '#fb7185', '#a78bfa'];
    for (let i = 0; i < 42; i++) {
      const a = (i * 1.7) % (Math.PI * 2);
      const r = 6.5 + (i % 8) * 2.3;
      const fx = Math.cos(a) * r;
      const fz = Math.sin(a) * r;
      if (fx < -11.5 && fx > -18.5) continue;
      this.flowers.push({
        x: fx,
        z: fz,
        color: flowerColors[i % flowerColors.length]
      });
    }

    this._setupInteractables();
  }

  _setupInteractables() {
    const ext = this.exteriorLayout;
    const intL = this.interiorLayout;
    const pout = ext.poultry || { x: -6.2, z: 7.2 };

    this.interactables = [
      // Exterior Stations (Read live coordinates from exteriorLayout!)
      {
        id: 'enter_house',
        layoutKey: 'house',
        mode: 'exterior',
        icon: '🚪',
        shortTitle: 'Vào Trong Nhà',
        name: 'Bước vào thăm Bên Trong Ngôi Nhà (Xem & kê lại nội thất)',
        pos: { x: ext.house.x, y: 0, z: ext.house.z + 2.5 }
      },
      {
        id: 'work',
        layoutKey: 'work',
        mode: 'exterior',
        icon: '🪓',
        shortTitle: 'Trạm Chặt Củi',
        name: 'Chặt củi & Chế tác gỗ kiếm Xu',
        pos: { x: ext.work.x, y: 0, z: ext.work.z }
      },
      {
        id: 'garden',
        layoutKey: 'garden',
        mode: 'exterior',
        icon: '🌱',
        shortTitle: 'Vườn Rau Hữu Cơ',
        name: 'Chăm sóc vườn rau & Tưới nước kiếm Xu',
        pos: { x: ext.garden.x, y: 0, z: ext.garden.z }
      },
      {
        id: 'poultry',
        layoutKey: 'poultry',
        mode: 'exterior',
        icon: '🐓',
        shortTitle: 'Chuồng Gà & Vịt',
        name: 'Cho đàn Gà, Vịt ăn thóc & Thu hoạch trứng tươi kiếm Xu',
        pos: { x: pout.x, y: 0, z: pout.z }
      },
      {
        id: 'fish',
        layoutKey: 'fish',
        mode: 'exterior',
        icon: '🎣',
        shortTitle: 'Bến Câu Cá Suối',
        name: 'Ngồi câu cá bên dòng suối mát (+Xu)',
        pos: { x: ext.fish.x, y: 0, z: ext.fish.z }
      },
      {
        id: 'quiz',
        layoutKey: 'fire',
        mode: 'exterior',
        icon: '🔥',
        shortTitle: 'Đống Lửa & Bàn Trà',
        name: 'Ngồi bên đống lửa uống trà & Giải đố nhận Xu',
        pos: { x: ext.fire.x, y: 0, z: ext.fire.z }
      },

      // Interior Stations (Read live coordinates from interiorLayout!)
      {
        id: 'exit_house',
        mode: 'interior',
        icon: '🚶',
        shortTitle: 'Ra Ngoài Sân',
        name: 'Bước ra ngoài sân vườn thiên nhiên rộng rãi',
        pos: { x: 0, y: 0, z: 9.2 }
      },
      {
        id: 'sleep',
        layoutKey: 'bed',
        mode: 'interior',
        icon: '🛌',
        shortTitle: 'Giường Ngủ Ấm',
        name: 'Nằm ngủ nướng trên giường trong nhà (+Xu chậm & Hồi sức)',
        pos: { x: intL.bed.x, y: 0, z: intL.bed.z }
      },
      {
        id: 'interior_tea',
        layoutKey: 'tea_table',
        mode: 'interior',
        icon: '🍵',
        shortTitle: 'Bàn Trà Đọc Sách',
        name: 'Thưởng trà đọc sách & Giải đố trong nhà',
        pos: { x: intL.tea_table.x, y: 0, z: intL.tea_table.z }
      },
      {
        id: 'upgrade_house',
        mode: 'interior',
        icon: '🏡',
        shortTitle: 'Nâng Cấp Nhà',
        name: 'Mở bảng nâng cấp ngôi nhà lên cấp độ cao hơn',
        pos: { x: 0, y: 0, z: -8.5 }
      }
    ];

    if (this.isInteriorItemVisible('kitchen') || this.isInteriorItemVisible('cookware')) {
      const kPos = this.isInteriorItemVisible('kitchen') ? intL.kitchen : intL.cookware;
      this.interactables.push({
        id: 'cook_food',
        layoutKey: 'kitchen',
        mode: 'interior',
        icon: '🍳',
        shortTitle: 'Nấu Cơm Quê',
        name: 'Nấu bữa cơm quê nóng hổi trong bếp (+Thể lực & +Xu)',
        pos: { x: kPos.x, y: 0, z: kPos.z }
      });
    }

    if (this.isInteriorItemVisible('tv') && intL.tv) {
      this.interactables.push({
        id: 'watch_tv',
        layoutKey: 'tv',
        mode: 'interior',
        icon: '📺',
        shortTitle: 'Xem Tivi',
        name: 'Bật Tivi xem chương trình thiên nhiên & ca nhạc (+Tâm An)',
        pos: { x: intL.tv.x, y: 0, z: intL.tv.z }
      });
    }

    // Expanded Cultivable Land Plots (Unlocked sequentially starting at House Level 6)
    const allPlots = (window.GAME_DATA && window.GAME_DATA.landExpansions) || [];
    for (let i = 0; i < allPlots.length; i++) {
      const plot = allPlots[i];
      if (this.ownedLandExpansions && this.ownedLandExpansions.indexOf(plot.id) !== -1 && plot.coords) {
        this.interactables.push({
          id: plot.id,
          mode: 'exterior',
          icon: plot.icon,
          shortTitle: plot.shortTitle || `Đất Cấp ${plot.level}`,
          name: `${plot.name} — Thu hoạch nông sản (+${plot.harvestBaseCoins} Xu & +${plot.peaceBonus} Tâm An)`,
          pos: { x: plot.coords.x, y: 0, z: plot.coords.z }
        });
      }
    }
  }

  enterHouseInterior() {
    this.sceneMode = 'interior';
    this.playerPos = { x: 0, y: 0, z: 6.5 };
    this.petPos = { x: -2.2, y: 0, z: 7.0 };
    this.catPos = { x: 2.2, y: 0, z: 7.0 };
    this.playerTarget = null;
    this.camAngle = 0.0;
    this.camPitch = 0.62;
    this.camZoom = 18.0;
    this._setupInteractables();
  }

  exitHouseExterior() {
    this.sceneMode = 'exterior';
    const h = this.exteriorLayout.house;
    this.playerPos = { x: h.x, y: 0, z: h.z + 3.8 };
    this.petPos = { x: h.x - 2.0, y: 0, z: h.z + 4.2 };
    this.catPos = { x: h.x + 2.0, y: 0, z: h.z + 4.2 };
    this.playerTarget = null;
    this.camAngle = 0.42;
    this.camPitch = 0.56;
    this.camZoom = 18.5;
    this._setupInteractables();
  }

  buildCharacter(config) {
    this.playerConfig = Object.assign({}, this.playerConfig, config);
    if (config && config.equippedCostume !== undefined) {
      this.playerConfig.costume = config.equippedCostume;
      this.playerConfig.equippedCostume = config.equippedCostume;
    } else if (config && config.costume !== undefined) {
      this.playerConfig.equippedCostume = config.costume;
      this.playerConfig.costume = config.costume;
    }
  }

  setLabelSettings(settings = {}) {
    if (!settings || typeof settings !== 'object') return;
    if (typeof settings.showCharacterLabels === 'boolean') {
      this.labelSettings.showCharacterLabels = settings.showCharacterLabels;
    }
    if (typeof settings.showObjectLabels === 'boolean') {
      this.labelSettings.showObjectLabels = settings.showObjectLabels;
    }
    if (settings.customNames && typeof settings.customNames === 'object') {
      this.labelSettings.customNames = Object.assign({}, settings.customNames);
    }
  }

  getCustomLabel(key, defaultText) {
    const map = (this.labelSettings && this.labelSettings.customNames) || {};
    if (key && typeof map[key] === 'string' && map[key].trim().length > 0) {
      return map[key].trim();
    }
    return defaultText;
  }

  updateCharacterMoodFace(moodId) {
    this.playerConfig.mood = moodId;
  }

  buildStarterHomeAndUpgrades(ownedUpgradeIds = [], ownedStationPropIds = [], ownedToolIds = []) {
    this.ownedUpgrades = ownedUpgradeIds.slice();
    this.ownedStationProps = ownedStationPropIds.slice();
    if (Array.isArray(ownedToolIds)) {
      this.ownedTools = ownedToolIds.slice();
    }
    this._setupInteractables();
  }

  setOwnedTools(ownedToolIds = []) {
    this.ownedTools = ownedToolIds.slice();
    this._setupInteractables();
  }

  setOwnedLandExpansions(expansionIds = []) {
    this.ownedLandExpansions = Array.isArray(expansionIds) ? expansionIds.slice() : [];
    this._setupInteractables();
  }

  setActiveFenceStyle(fenceId) {
    this.activeFenceStyle = fenceId || null;
  }

  setPreviewCostume(costumeId) {
    this.previewCostumeId = costumeId || null;
  }

  getActiveFenceId() {
    if (this.activeFenceStyle === 'none') return null;
    if (this.activeFenceStyle && this.hasOwnedTool(this.activeFenceStyle)) {
      return this.activeFenceStyle;
    }
    const order = [
      'fence_zen_torii',
      'fence_rose_vine',
      'fence_pine_log',
      'fence_stone_moss',
      'fence_white_picket',
      'fence_bamboo'
    ];
    for (let i = 0; i < order.length; i++) {
      if (this.hasOwnedTool(order[i])) return order[i];
    }
    return null;
  }

  setPetSettings(settings = {}) {
    this.petSettings = Object.assign({}, this.petSettings, settings);
  }

  setStationProps(ownedStationPropIds = []) {
    this.ownedStationProps = ownedStationPropIds.slice();
  }

  setWeather(mode) {
    this.weatherMode = mode;
  }

  setRealTimeHour(hourFloat) {
    this.realHourFloat = hourFloat;
    this.isNightTime = (hourFloat >= 18.5 || hourFloat < 5.5);
  }

  movePlayerToAndAct(targetVec, stateAfterArrive, durationSec = 2.5, onArrive = null, actionLabel = '') {
    if (!targetVec) return;
    this.playerTarget = { x: targetVec.x, y: 0, z: targetVec.z };
    this.pendingState = stateAfterArrive || 'idle';
    this.pendingDuration = durationSec || 0;
    this.pendingLabel = actionLabel || '';
    this.onArriveCallback = onArrive;
  }

  setPlayerState(state, durationSec = 0, label = '') {
    this.playerState = state;
    this.actionTimer = durationSec;
    this.actionTotal = Math.max(0.1, durationSec);
    this.actionLabel = label || '';
  }

  spawnFloatingText(text, wx, wy, wz, color = '#fde047') {
    this.floatingEffects.push({
      text: text,
      x: wx,
      y: wy,
      z: wz,
      color: color,
      life: 2.0,
      maxLife: 2.0
    });
  }

  getNearestInteractable() {
    let best = null;
    let bestDist = 3.2;
    for (let i = 0; i < this.interactables.length; i++) {
      const item = this.interactables[i];
      if (item.mode && item.mode !== this.sceneMode) continue;
      const d = Math.hypot(this.playerPos.x - item.pos.x, this.playerPos.z - item.pos.z);
      if (d < bestDist) {
        bestDist = d;
        best = item;
      }
    }
    return best;
  }

  // =======================================================================
  // MAIN UPDATE & 3D RENDERING PIPELINE
  // =======================================================================
  update() {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    this.elapsed += dt;

    this._updateMovementAndStates(dt);
    this._renderScene(dt);
    this._renderPreviewCanvases();
  }

  _renderPreviewCanvases() {
    const introCanvas = document.getElementById('preview-char-canvas');
    if (introCanvas && introCanvas.getContext) {
      const pctx = introCanvas.getContext('2d');
      const w = introCanvas.width;
      const h = introCanvas.height;
      pctx.clearRect(0, 0, w, h);

      // Soft warm backdrop glow inside preview box
      const grad = pctx.createRadialGradient(w * 0.5, h * 0.55, 8, w * 0.5, h * 0.55, w * 0.52);
      grad.addColorStop(0, 'rgba(52, 211, 153, 0.25)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
      pctx.fillStyle = grad;
      pctx.fillRect(0, 0, w, h);

      // Draw full character centered with large scale so face, age details & hands are crystal clear
      const prevState = this.playerState;
      const prevSwim = this.isPlayerSwimming;
      this.playerState = 'idle';
      this.isPlayerSwimming = false;
      this._drawCharacter(pctx, { x: w * 0.5, y: h * 0.88, scale: 34, isPreview: true });
      this.playerState = prevState;
      this.isPlayerSwimming = prevSwim;
    }

    const costumeCanvas = document.getElementById('preview-costume-canvas');
    if (costumeCanvas && costumeCanvas.getContext) {
      const cctx = costumeCanvas.getContext('2d');
      const w = costumeCanvas.width;
      const h = costumeCanvas.height;
      cctx.clearRect(0, 0, w, h);

      const grad = cctx.createRadialGradient(w * 0.5, h * 0.52, 10, w * 0.5, h * 0.52, w * 0.55);
      grad.addColorStop(0, 'rgba(251, 191, 36, 0.28)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
      cctx.fillStyle = grad;
      cctx.fillRect(0, 0, w, h);

      const prevState = this.playerState;
      const prevSwim = this.isPlayerSwimming;
      const prevCostume = this.playerConfig.costume;
      const prevEquipped = this.playerConfig.equippedCostume;
      this.playerState = 'idle';
      this.isPlayerSwimming = false;
      if (this.previewCostumeId) {
        const previewVal = this.previewCostumeId === 'none' ? null : this.previewCostumeId;
        this.playerConfig.costume = previewVal;
        this.playerConfig.equippedCostume = previewVal;
      }
      this._drawCharacter(cctx, { x: w * 0.5, y: h * 0.88, scale: 36, isPreview: true });
      this.playerConfig.costume = prevCostume;
      this.playerConfig.equippedCostume = prevEquipped;
      this.playerState = prevState;
      this.isPlayerSwimming = prevSwim;
    }

    const regCanvas = document.getElementById('preview-region-canvas');
    if (regCanvas && regCanvas.getContext) {
      this._renderRegionPreviewCanvas(regCanvas);
    }
  }

  _renderRegionPreviewCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const regId = this.regionId || 'mountain';
    const reg = (window.GAME_DATA && window.GAME_DATA.regions && window.GAME_DATA.regions[regId]) || window.GAME_DATA.regions.mountain;

    ctx.clearRect(0, 0, w, h);

    // 1. Regional Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.68);
    skyGrad.addColorStop(0, reg.skyTop || '#1e3a5f');
    skyGrad.addColorStop(1, reg.skyBottom || '#6495ed');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Sun / Warm Glow
    ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.24, 11, 0, Math.PI * 2);
    ctx.fill();

    // 2. Regional Horizon & Characteristic Landscape Backdrop
    if (regId === 'mountain') {
      ctx.fillStyle = '#1e3f2b';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.68);
      ctx.lineTo(w * 0.25, h * 0.25);
      ctx.lineTo(w * 0.55, h * 0.68);
      ctx.lineTo(w * 0.78, h * 0.30);
      ctx.lineTo(w, h * 0.68);
      ctx.closePath();
      ctx.fill();
      // Snow cap
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(w * 0.18, h * 0.37);
      ctx.lineTo(w * 0.25, h * 0.25);
      ctx.lineTo(w * 0.32, h * 0.37);
      ctx.closePath();
      ctx.fill();
    } else if (regId === 'sea') {
      // Turquoise ocean & gentle white wave
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, h * 0.50, w, h * 0.22);
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(10, h * 0.58);
      ctx.quadraticCurveTo(w * 0.5, h * 0.54 + Math.sin(this.elapsed * 2) * 2, w - 10, h * 0.58);
      ctx.stroke();
    } else if (regId === 'valley') {
      // Rolling green flower hills
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.68);
      ctx.quadraticCurveTo(w * 0.3, h * 0.38, w * 0.65, h * 0.68);
      ctx.quadraticCurveTo(w * 0.85, h * 0.45, w, h * 0.68);
      ctx.fill();
    } else if (regId === 'bamboo') {
      // Misty bamboo grove silhouettes
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 2.5;
      [18, 28, 38, w - 22, w - 34].forEach((bx) => {
        ctx.beginPath();
        ctx.moveTo(bx, h * 0.68);
        ctx.lineTo(bx + Math.sin(this.elapsed * 2 + bx) * 2, h * 0.18);
        ctx.stroke();
      });
    } else if (regId === 'river') {
      // Wide peaceful Mekong river water
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, h * 0.54, w, h * 0.22);
    } else if (regId === 'plateau') {
      // Golden steppe horizon
      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.68);
      ctx.quadraticCurveTo(w * 0.5, h * 0.42, w, h * 0.68);
      ctx.fill();
    }

    // 3. Ground Plane
    ctx.fillStyle = reg.groundBase || '#2d5a3c';
    ctx.fillRect(0, h * 0.66, w, h * 0.34);

    // 4. Draw Signature Regional Dwelling in the center
    this._drawHomeExterior(ctx, { x: w * 0.5, y: h * 0.88, scale: 12.5 }, false, regId, true);
  }


  isPointInRiverOrWater(wx, wz, isPlayer = false) {
    if (this.sceneMode !== 'exterior') return false;
    if (isPlayer && (this.playerState === 'fish' || this.playerState === 'sleep')) {
      return false;
    }

    // 1. Main Flowing River / Stream across the West side of the island
    if (wz >= -26.0 && wz <= 26.0) {
      const curve = Math.sin(wz * 0.16) * 1.6;
      const leftBankX = -18.2 + curve;
      const rightBankX = -12.6 + curve;
      if (wx >= leftBankX && wx <= rightBankX) {
        // If standing idle right on the wooden fishing dock planks, stay dry on the pier
        const fishDock = this.exteriorLayout && this.exteriorLayout.fish;
        if (isPlayer && this.playerState === 'idle' && fishDock) {
          if (Math.abs(wx - fishDock.x) < 1.1 && Math.abs(wz - fishDock.z) < 0.85) {
            return false;
          }
        }
        return true;
      }
    }

    // 2. Koi Pond near the Windmill (if upgraded)
    if (this.ownedUpgrades && this.ownedUpgrades.indexOf('koi_windmill') !== -1 && this.exteriorLayout && this.exteriorLayout.windmill) {
      const pondX = this.exteriorLayout.windmill.x - 2.0;
      const pondZ = this.exteriorLayout.windmill.z;
      if (Math.hypot(wx - pondX, wz - pondZ) <= 1.75) {
        return true;
      }
    }

    // 3. Outer water boundary around the island shore (unless standing on an unlocked Land Expansion plot!)
    if (Math.hypot(wx, wz) >= 24.4) {
      if (this.isPointOnExpandedLand(wx, wz)) {
        return false;
      }
      return true;
    }

    return false;
  }

  _updateMovementAndStates(dt) {
    if (this.clickMarker.active) {
      this.clickMarker.timer -= dt;
      if (this.clickMarker.timer <= 0) this.clickMarker.active = false;
    }

    for (let i = this.floatingEffects.length - 1; i >= 0; i--) {
      const ef = this.floatingEffects[i];
      ef.life -= dt;
      ef.y += dt * 1.1;
      if (ef.life <= 0) this.floatingEffects.splice(i, 1);
    }

    for (let i = this.footstepParticles.length - 1; i >= 0; i--) {
      const fp = this.footstepParticles[i];
      fp.life -= dt;
      fp.y += dt * 0.25;
      fp.r += dt * 0.45;
      if (fp.life <= 0) this.footstepParticles.splice(i, 1);
    }

    const wasPlayerSwimming = !!this.isPlayerSwimming;
    const prevPlayerX = this.playerPos.x;
    const prevPlayerZ = this.playerPos.z;

    if (this.playerState !== 'sleep') {
      let moveX = 0;
      let moveZ = 0;
      if (this.keys['KeyW'] || this.keys['ArrowUp']) moveZ -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) moveZ += 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

      const swimSpeedFactor = wasPlayerSwimming ? 0.78 : 1.0;

      if (moveX !== 0 || moveZ !== 0) {
        this.playerTarget = null;
        this.onArriveCallback = null;
        this.clickMarker.active = false;
        this.playerState = 'walk';

        const cosA = Math.cos(this.camAngle);
        const sinA = Math.sin(this.camAngle);
        const dx = moveX * cosA + moveZ * sinA;
        const dz = -moveX * sinA + moveZ * cosA;
        const len = Math.hypot(dx, dz) || 1;
        const targetSpeed = 6.2 * swimSpeedFactor;
        this.playerSpeed += (targetSpeed - this.playerSpeed) * Math.min(1, dt * 10.0);

        this.playerPos.x += (dx / len) * this.playerSpeed * dt;
        this.playerPos.z += (dz / len) * this.playerSpeed * dt;

        if (this.sceneMode === 'interior') {
          this.playerPos.x = Math.max(-10.0, Math.min(10.0, this.playerPos.x));
          this.playerPos.z = Math.max(-8.5, Math.min(8.8, this.playerPos.z));
        } else {
          const hasExpansions = this.ownedLandExpansions && this.ownedLandExpansions.length > 0;
          const maxR = hasExpansions ? 30.5 : 25.0;
          const r = Math.hypot(this.playerPos.x, this.playerPos.z);
          if (r > maxR) {
            this.playerPos.x = (this.playerPos.x / r) * maxR;
            this.playerPos.z = (this.playerPos.z / r) * maxR;
          }
        }
        this.playerFacing = Math.atan2(dx, dz);
      } else if (this.playerTarget) {
        const dx = this.playerTarget.x - this.playerPos.x;
        const dz = this.playerTarget.z - this.playerPos.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 0.35) {
          this.playerState = 'walk';
          // Natural ease-out slowdown as character approaches target destination
          const approachFactor = Math.min(1.0, Math.max(0.42, dist / 2.2));
          const targetSpeed = 6.8 * swimSpeedFactor * approachFactor;
          this.playerSpeed += (targetSpeed - this.playerSpeed) * Math.min(1, dt * 11.0);
          this.playerPos.x += (dx / dist) * this.playerSpeed * dt;
          this.playerPos.z += (dz / dist) * this.playerSpeed * dt;
          this.playerFacing = Math.atan2(dx, dz);
        } else {
          this.playerTarget = null;
          this.clickMarker.active = false;
          this.playerSpeed = 0;
          this.setPlayerState(this.pendingState || 'idle', this.pendingDuration || 0, this.pendingLabel || '');
          if (this.onArriveCallback) {
            const cb = this.onArriveCallback;
            this.onArriveCallback = null;
            cb();
          }
        }
      } else if (this.actionTimer > 0) {
        this.playerSpeed *= Math.max(0, 1 - dt * 12);
        this.actionTimer -= dt;
        if (this.actionTimer <= 0) {
          this.setPlayerState('idle', 0, '');
        }
      } else if (this.playerState === 'walk') {
        this.playerSpeed *= Math.max(0, 1 - dt * 12);
        this.playerState = 'idle';
      } else {
        this.playerSpeed *= Math.max(0, 1 - dt * 12);
      }
    }

    // Smoothly interpolate character facing angle & accumulate continuous stride phase
    let angleDiff = this.playerFacing - this.smoothFacing;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    this.smoothFacing += angleDiff * Math.min(1, dt * 12.0);

    const movedDist = Math.hypot(this.playerPos.x - prevPlayerX, this.playerPos.z - prevPlayerZ);
    if (this.playerState === 'walk' || movedDist > 0.001) {
      const ageFreqMult = (this.playerConfig && this.playerConfig.age === 'elder') ? 0.78 : 1.0;
      this.walkCyclePhase += dt * (4.2 + Math.max(2.5, this.playerSpeed) * 1.35) * ageFreqMult;
      this.stepDustTimer += dt;
      if (this.stepDustTimer > 0.24 && this.footstepParticles.length < 18) {
        this.stepDustTimer = 0;
        this.footstepParticles.push({
          x: this.playerPos.x + (Math.random() - 0.5) * 0.35,
          y: 0.05,
          z: this.playerPos.z + (Math.random() - 0.5) * 0.35,
          r: 0.14,
          life: 0.55,
          maxLife: 0.55,
          isWater: !!this.isPlayerSwimming
        });
      }
    }

    // Update real-time water / river swimming state for Player
    this.isPlayerSwimming = this.isPointInRiverOrWater(this.playerPos.x, this.playerPos.z, true);
    if (this.isPlayerSwimming && !wasPlayerSwimming) {
      this.spawnFloatingText('🏊 Bơi qua sông mát lành!', this.playerPos.x, 1.9, this.playerPos.z, '#38bdf8');
    }

    // Lifelike Dog & Cat movement: Spring-damper following + natural micro-behaviors (trot, sit, sniff/groom)
    const extH = this.exteriorLayout.house;
    const isPlayerMoving = this.playerState === 'walk';

    // 1. Companion Dog ("Cậu Vàng")
    const dogRestX = this.sceneMode === 'interior' ? -2.8 : extH.x - 2.6;
    const dogRestZ = this.sceneMode === 'interior' ? 1.5 : extH.z + 2.8;
    let targetDogX = dogRestX;
    let targetDogZ = dogRestZ;
    if (this.petSettings.dogFollow) {
      if (isPlayerMoving) {
        this.dogBehavior = 'trot';
        targetDogX = this.playerPos.x - Math.sin(this.smoothFacing) * 1.18 - Math.cos(this.smoothFacing) * 0.88;
        targetDogZ = this.playerPos.z - Math.cos(this.smoothFacing) * 1.18 + Math.sin(this.smoothFacing) * 0.88;
      } else {
        // Cycle naturally every 9 seconds between trotting, sitting & wagging, and curious sniffing
        const dogCycle = this.elapsed % 9.0;
        if (dogCycle < 3.6) {
          this.dogBehavior = 'trot';
          const orbitAngle = this.elapsed * 1.55;
          targetDogX = this.playerPos.x + Math.cos(orbitAngle) * 1.35;
          targetDogZ = this.playerPos.z + Math.sin(orbitAngle) * 0.95 + 0.25;
        } else if (dogCycle < 6.8) {
          this.dogBehavior = 'sit';
          targetDogX = this.playerPos.x - 1.22;
          targetDogZ = this.playerPos.z + 0.48;
        } else {
          this.dogBehavior = 'sniff';
          const sniffWiggle = Math.sin(this.elapsed * 4.5) * 0.28;
          targetDogX = this.playerPos.x - 1.45 + sniffWiggle;
          targetDogZ = this.playerPos.z + 0.85;
        }
      }
    } else {
      this.dogBehavior = 'sit';
    }
    const dogDx = targetDogX - this.petPos.x;
    const dogDz = targetDogZ - this.petPos.z;
    const dogDist = Math.hypot(dogDx, dogDz);
    const dogFollowSpeed = isPlayerMoving ? 5.2 : (this.dogBehavior === 'sit' ? 2.6 : 3.4);
    const dogStepX = dogDx * Math.min(1, dt * dogFollowSpeed);
    const dogStepZ = dogDz * Math.min(1, dt * dogFollowSpeed);
    this.petPos.x += dogStepX;
    this.petPos.z += dogStepZ;
    this.dogSpeed = dogDist > 0.08 ? dogDist * dogFollowSpeed * 0.45 : 0;
    this.dogGaitPhase += dt * (4.0 + Math.min(14, this.dogSpeed * 2.8));
    if (Math.abs(dogDx) > 0.03) {
      this.dogFacing = dogDx >= 0 ? 1 : -1;
    }
    this.isDogSwimming = this.hasOwnedTool('pet_dog') && this.isPointInRiverOrWater(this.petPos.x, this.petPos.z, false);

    // 2. Companion Cat ("Hoàng Thượng")
    const catRestX = this.sceneMode === 'interior' ? 2.8 : extH.x + 2.6;
    const catRestZ = this.sceneMode === 'interior' ? 1.5 : extH.z + 2.6;
    let targetCatX = catRestX;
    let targetCatZ = catRestZ;
    if (this.petSettings.catFollow) {
      if (isPlayerMoving) {
        this.catBehavior = 'trot';
        targetCatX = this.playerPos.x - Math.sin(this.smoothFacing) * 1.25 + Math.cos(this.smoothFacing) * 0.88;
        targetCatZ = this.playerPos.z - Math.cos(this.smoothFacing) * 1.25 - Math.sin(this.smoothFacing) * 0.88;
      } else {
        // Cycle naturally every 10 seconds between graceful weaving, sitting/purring, and paw grooming
        const catCycle = (this.elapsed + 2.5) % 10.0;
        if (catCycle < 3.8) {
          this.catBehavior = 'trot';
          const catOrbit = -this.elapsed * 1.35 + 2.2;
          targetCatX = this.playerPos.x + Math.cos(catOrbit) * 1.25;
          targetCatZ = this.playerPos.z + Math.sin(catOrbit) * 0.9 + 0.2;
        } else if (catCycle < 7.2) {
          this.catBehavior = 'sit';
          targetCatX = this.playerPos.x + 1.18;
          targetCatZ = this.playerPos.z + 0.45;
        } else {
          this.catBehavior = 'groom';
          targetCatX = this.playerPos.x + 1.25;
          targetCatZ = this.playerPos.z + 0.55;
        }
      }
    } else {
      this.catBehavior = 'sit';
    }
    const catDx = targetCatX - this.catPos.x;
    const catDz = targetCatZ - this.catPos.z;
    const catDist = Math.hypot(catDx, catDz);
    const catFollowSpeed = isPlayerMoving ? 4.9 : (this.catBehavior !== 'trot' ? 2.4 : 3.1);
    this.catPos.x += catDx * Math.min(1, dt * catFollowSpeed);
    this.catPos.z += catDz * Math.min(1, dt * catFollowSpeed);
    this.catSpeed = catDist > 0.08 ? catDist * catFollowSpeed * 0.45 : 0;
    this.catGaitPhase += dt * (3.8 + Math.min(13, this.catSpeed * 2.6));
    if (Math.abs(catDx) > 0.03) {
      this.catFacing = catDx >= 0 ? 1 : -1;
    }
    this.isCatSwimming = this.hasOwnedTool('pet_cat') && this.isPointInRiverOrWater(this.catPos.x, this.catPos.z, false);
  }

  _renderScene(dt) {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    if (this.sceneMode === 'interior') {
      this._renderInteriorScene(ctx);
    } else {
      this._renderExteriorScene(ctx, dt);
    }

    ctx.restore();
  }

  // =======================================================================
  // EXTERIOR 3D WORLD RENDERING (REAL-TIME DAY/NIGHT + SPACIOUS LAYOUT)
  // =======================================================================
  _renderExteriorScene(ctx, dt) {
    const reg = window.GAME_DATA.regions[this.regionId] || window.GAME_DATA.regions.mountain;
    const h = this.realHourFloat;
    const isDawn = (h >= 5.0 && h < 7.0);
    const isDusk = (h >= 17.0 && h < 19.0) || this.weatherMode === 'sunset';
    const isNight = (h >= 19.0 || h < 5.0);

    // 1. Real-Time Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    if (this.weatherMode === 'storm') {
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(0.55, '#1e293b');
      skyGrad.addColorStop(1, '#334155');
    } else if (this.weatherMode === 'rain') {
      skyGrad.addColorStop(0, isNight ? '#090d16' : '#1e293b');
      skyGrad.addColorStop(0.6, isNight ? '#1e293b' : '#475569');
      skyGrad.addColorStop(1, isNight ? '#334155' : '#94a3b8');
    } else if (this.weatherMode === 'snow') {
      skyGrad.addColorStop(0, isNight ? '#0f172a' : '#475569');
      skyGrad.addColorStop(0.55, isNight ? '#1e293b' : '#94a3b8');
      skyGrad.addColorStop(1, isNight ? '#334155' : '#e2e8f0');
    } else if (isNight) {
      skyGrad.addColorStop(0, '#050814');
      skyGrad.addColorStop(0.55, '#0f172a');
      skyGrad.addColorStop(1, '#1e293b');
    } else if (isDawn || isDusk || this.regionId === 'plateau') {
      skyGrad.addColorStop(0, '#4c1d95');
      skyGrad.addColorStop(0.5, '#ea580c');
      skyGrad.addColorStop(1, '#fde047');
    } else if (this.weatherMode === 'mist') {
      skyGrad.addColorStop(0, '#64748b');
      skyGrad.addColorStop(0.6, '#cbd5e1');
      skyGrad.addColorStop(1, '#f1f5f9');
    } else if (this.weatherMode === 'wind') {
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.55, '#38bdf8');
      skyGrad.addColorStop(1, '#e0f2fe');
    } else {
      skyGrad.addColorStop(0, '#1d4ed8');
      skyGrad.addColorStop(0.55, '#60a5fa');
      skyGrad.addColorStop(1, '#dbeafe');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Stars & Glowing Moon at Night OR Sun during Day
    if (isNight) {
      for (let i = 0; i < this.stars.length; i++) {
        const st = this.stars[i];
        const alpha = 0.4 + Math.sin(this.elapsed * 2.5 + st.phase) * 0.45;
        ctx.fillStyle = `rgba(254, 249, 195, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(st.xFrac * this.width, st.yFrac * this.height, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.arc(this.width * 0.8, this.height * 0.18, 36, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.weatherMode !== 'storm' && this.weatherMode !== 'rain') {
      ctx.fillStyle = isDusk ? 'rgba(251, 146, 60, 0.88)' : 'rgba(255, 251, 235, 0.82)';
      ctx.beginPath();
      ctx.arc(this.width * 0.78, this.height * 0.19, 44, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Outer Water Base & Spacious 27m Island Disk
    this._drawGroundDisk(ctx, 0, -0.4, 0, 38, reg.waterColor, 'rgba(255,255,255,0.2)');
    const groundTint = this.weatherMode === 'snow'
      ? (isNight ? '#94a3b8' : '#e2e8f0')
      : (isNight ? '#1b3b2b' : reg.groundColor);
    this._drawGroundDisk(ctx, 0, 0, 0, 27.5, groundTint, this.weatherMode === 'snow' ? '#64748b' : '#0f291e');

    // 2b. Expanded Cultivable Land Peninsulas & Bridges (Unlocked at House Level 6)
    this._drawExpandedLandGrounds(ctx, groundTint, isNight);

    // 3. Flowing Stream on West side (x = -14.5)
    this._drawStreamPolygon(ctx, reg.waterColor);

    // 4. If in Move Mode: Draw Placement Grid & Ghost Target
    if (this.moveMode.active) {
      this._drawMovePlacementPreview(ctx);
    }

    // 5. Collect Depth-Sorted 3D Renderables
    const ext = this.exteriorLayout;
    const pout = ext.poultry || { x: -6.2, z: 7.2 };
    const drawList = [];

    for (let i = 0; i < this.hills.length; i++) {
      const hill = this.hills[i];
      const p = this.project3D(hill.x, 0, hill.z);
      drawList.push({ depth: p.depth, draw: () => this._drawHill(ctx, hill, p, isNight) });
    }

    for (let i = 0; i < this.flowers.length; i++) {
      const fl = this.flowers[i];
      const p = this.project3D(fl.x, 0, fl.z);
      drawList.push({
        depth: p.depth,
        draw: () => {
          ctx.fillStyle = fl.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(2.2, 0.18 * p.scale), 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    for (let i = 0; i < this.trees.length; i++) {
      const tr = this.trees[i];
      const p = this.project3D(tr.x, 0, tr.z);
      drawList.push({ depth: p.depth, draw: () => this._drawTree(ctx, tr, p) });
    }

    // Movable Exterior Structures (Spaciously separated!)
    const homeP = this.project3D(ext.house.x, 0, ext.house.z);
    drawList.push({
      depth: homeP.depth,
      draw: () => this._drawHomeExterior(ctx, homeP, this.moveMode.selectedId === 'house')
    });

    const workP = this.project3D(ext.work.x, 0, ext.work.z);
    drawList.push({
      depth: workP.depth,
      draw: () => this._drawWoodStation(ctx, workP, this.moveMode.selectedId === 'work')
    });

    const gardenP = this.project3D(ext.garden.x, 0, ext.garden.z);
    drawList.push({
      depth: gardenP.depth,
      draw: () => this._drawGardenStation(ctx, gardenP, this.moveMode.selectedId === 'garden')
    });

    const poultryP = this.project3D(pout.x, 0, pout.z);
    drawList.push({
      depth: poultryP.depth,
      draw: () => this._drawPoultryStation(ctx, poultryP, pout, this.moveMode.selectedId === 'poultry')
    });

    const fishP = this.project3D(ext.fish.x, 0, ext.fish.z);
    drawList.push({
      depth: fishP.depth,
      draw: () => this._drawFishingStation(ctx, fishP, this.moveMode.selectedId === 'fish')
    });

    const fireP = this.project3D(ext.fire.x, 0, ext.fire.z);
    drawList.push({
      depth: fireP.depth,
      draw: () => this._drawCampfireAndTea(ctx, fireP, this.moveMode.selectedId === 'fire')
    });

    if (this.ownedUpgrades.indexOf('koi_windmill') !== -1) {
      const wmP = this.project3D(ext.windmill.x, 0, ext.windmill.z);
      drawList.push({
        depth: wmP.depth,
        draw: () => this._drawWindmillAndPond(ctx, wmP, this.moveMode.selectedId === 'windmill')
      });
    }

    if (this.ownedUpgrades.indexOf('sanctuary_bell') !== -1) {
      const bellP = this.project3D(ext.bell.x, 0, ext.bell.z);
      drawList.push({
        depth: bellP.depth,
        draw: () => this._drawBellTower(ctx, bellP, this.moveMode.selectedId === 'bell')
      });
    }

    // Expanded Cultivable Land Stations (Vegetable Gardens & Poultry/Duck Pastures)
    const allPlots = (window.GAME_DATA && window.GAME_DATA.landExpansions) || [];
    for (let i = 0; i < allPlots.length; i++) {
      const plot = allPlots[i];
      if (this.ownedLandExpansions && this.ownedLandExpansions.indexOf(plot.id) !== -1 && plot.coords) {
        const plotP = this.project3D(plot.coords.x, 0, plot.coords.z);
        drawList.push({
          depth: plotP.depth,
          draw: () => this._drawExpandedLandStation(ctx, plot, plotP)
        });
      }
    }

    // Companion Pets (Dog & Cat)
    if (this.hasOwnedTool('pet_dog')) {
      const dogP = this.project3D(this.petPos.x, 0, this.petPos.z);
      drawList.push({ depth: dogP.depth, draw: () => this._drawCompanionDog(ctx, dogP) });
    }
    if (this.hasOwnedTool('pet_cat')) {
      const catP = this.project3D(this.catPos.x, 0, this.catPos.z);
      drawList.push({ depth: catP.depth, draw: () => this._drawCompanionCat(ctx, catP) });
    }

    const playerP = this.project3D(this.playerPos.x, 0, this.playerPos.z);
    drawList.push({ depth: playerP.depth, draw: () => this._drawCharacter(ctx, playerP) });

    drawList.sort((a, b) => b.depth - a.depth);
    this._drawFootstepParticles(ctx);
    for (let i = 0; i < drawList.length; i++) {
      drawList[i].draw();
    }

    // Click Marker
    if (this.clickMarker.active) {
      const mp = this.project3D(this.clickMarker.x, 0, this.clickMarker.z);
      const pulse = 1 + Math.sin(this.elapsed * 8) * 0.2;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(mp.x, mp.y, 18 * pulse, 9 * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    this._drawInteractableLabels(ctx);
    this._drawFloatingEffects(ctx);

    if (this.weatherMode === 'rain' || this.weatherMode === 'storm') {
      const isStorm = this.weatherMode === 'storm';
      ctx.strokeStyle = isStorm ? 'rgba(224, 242, 254, 0.82)' : 'rgba(186, 230, 253, 0.65)';
      ctx.lineWidth = isStorm ? 2.1 : 1.6;
      ctx.beginPath();
      const windX = isStorm ? 180 : 60;
      const speedMult = isStorm ? 1.45 : 1.0;
      const slantX = isStorm ? 11 : 4;
      for (let i = 0; i < this.rainDrops.length; i++) {
        const r = this.rainDrops[i];
        r.y += r.speed * speedMult * dt;
        r.x -= windX * dt;
        if (r.y > this.height) {
          r.y = -20;
          r.x = Math.random() * (this.width + 260);
        }
        if (r.x < -50) {
          r.x = this.width + Math.random() * 120;
        }
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - slantX, r.y + r.len * (isStorm ? 1.35 : 1.0));
      }
      ctx.stroke();

      // Periodic subtle lightning flash in Storm weather
      if (isStorm) {
        const flashCycle = this.elapsed % 7.5;
        if (flashCycle > 6.8 && flashCycle < 7.05) {
          const flashAlpha = flashCycle < 6.92 ? 0.32 : 0.14;
          ctx.fillStyle = `rgba(240, 249, 255, ${flashAlpha})`;
          ctx.fillRect(0, 0, this.width, this.height);
        }
      }
    } else if (this.weatherMode === 'snow' && this.snowFlakes) {
      ctx.save();
      for (let i = 0; i < this.snowFlakes.length; i++) {
        const sf = this.snowFlakes[i];
        sf.y += sf.speedY * dt;
        sf.x += Math.sin(this.elapsed * 1.6 + sf.phase) * sf.driftX * dt;
        if (sf.y > this.height + 10) {
          sf.y = -12;
          sf.x = Math.random() * this.width;
        }
        if (sf.x > this.width + 10) sf.x = -10;
        if (sf.x < -10) sf.x = this.width + 10;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.beginPath();
        ctx.arc(sf.x, sf.y, sf.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (this.weatherMode === 'wind' && this.windStreaks) {
      ctx.save();
      for (let i = 0; i < this.windStreaks.length; i++) {
        const ws = this.windStreaks[i];
        ws.x += ws.speed * dt;
        ws.y += Math.sin(this.elapsed * 2.5 + ws.phase) * 35 * dt;
        if (ws.x > this.width + 120) {
          ws.x = -120;
          ws.y = Math.random() * this.height * 0.9;
        }
        if (ws.isLeaf) {
          ctx.fillStyle = ws.color;
          ctx.beginPath();
          ctx.ellipse(
            ws.x,
            ws.y,
            5.5,
            3.0,
            this.elapsed * 3.2 + ws.phase,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(ws.x, ws.y);
          ctx.quadraticCurveTo(
            ws.x - ws.len * 0.5,
            ws.y - 8 * Math.sin(this.elapsed * 2 + ws.phase),
            ws.x - ws.len,
            ws.y
          );
          ctx.stroke();
        }
      }
      ctx.restore();
    } else if (this.weatherMode === 'mist') {
      ctx.save();
      for (let m = 0; m < 4; m++) {
        const yBand = this.height * (0.35 + m * 0.14);
        const shiftX = Math.sin(this.elapsed * 0.4 + m * 1.5) * 60;
        const mistGrad = ctx.createLinearGradient(0, yBand - 45, 0, yBand + 45);
        mistGrad.addColorStop(0, 'rgba(241, 245, 249, 0)');
        mistGrad.addColorStop(0.5, 'rgba(241, 245, 249, 0.22)');
        mistGrad.addColorStop(1, 'rgba(241, 245, 249, 0)');
        ctx.fillStyle = mistGrad;
        ctx.fillRect(shiftX - 80, yBand - 45, this.width + 160, 90);
      }
      ctx.restore();
    }
  }

  // =======================================================================
  // SPACIOUS INTERIOR 3D ROOM SIMULATION (LEVELS 1 TO 6 + APPLIANCES & PETS)
  // =======================================================================
  _renderInteriorScene(ctx) {
    const homeLevel = 1 + this.ownedUpgrades.length;
    const stageInfo = window.GAME_DATA.homeInteriorStages[Math.min(5, homeLevel - 1)];

    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    if (homeLevel === 1) {
      bgGrad.addColorStop(0, '#1c1917');
      bgGrad.addColorStop(1, '#44403c');
    } else {
      bgGrad.addColorStop(0, '#1e130c');
      bgGrad.addColorStop(1, '#4a2c18');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Wide Spacious Room Floor (-11..11 X, -9.5..9.5 Z)
    const rx = 11.2;
    const rz = 9.6;
    const corners = [
      this.project3D(-rx, 0, -rz),
      this.project3D(rx, 0, -rz),
      this.project3D(rx, 0, rz),
      this.project3D(-rx, 0, rz)
    ];

    ctx.fillStyle = homeLevel === 1 ? '#57534e' : (homeLevel <= 3 ? '#92400e' : '#b45309');
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].x, corners[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Floor grid lines
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    for (let gx = -9; gx <= 9; gx += 3) {
      const p1 = this.project3D(gx, 0, -rz);
      const p2 = this.project3D(gx, 0, rz);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Walls
    const wallH = homeLevel === 1 ? 4.2 : 5.4;
    const topCorners = [
      this.project3D(-rx, wallH, -rz),
      this.project3D(rx, wallH, -rz),
      this.project3D(rx, wallH, rz),
      this.project3D(-rx, wallH, rz)
    ];

    ctx.fillStyle = homeLevel === 1 ? '#78716c' : '#d97706';
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(topCorners[1].x, topCorners[1].y);
    ctx.lineTo(topCorners[0].x, topCorners[0].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = homeLevel === 1 ? '#57534e' : '#b45309';
    ctx.beginPath();
    ctx.moveTo(corners[3].x, corners[3].y);
    ctx.lineTo(corners[0].x, corners[0].y);
    ctx.lineTo(topCorners[0].x, topCorners[0].y);
    ctx.lineTo(topCorners[3].x, topCorners[3].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(topCorners[2].x, topCorners[2].y);
    ctx.lineTo(topCorners[1].x, topCorners[1].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Window on back wall (Shows day/night outside!)
    if (homeLevel >= 2) {
      const winP = this.project3D(-4.0, 2.8, -rz + 0.2);
      const ws = winP.scale;
      ctx.fillStyle = this.isNightTime ? '#0f172a' : '#7dd3fc';
      ctx.fillRect(winP.x - 1.8 * ws, winP.y - 1.3 * ws, 3.6 * ws, 2.2 * ws);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.strokeRect(winP.x - 1.8 * ws, winP.y - 1.3 * ws, 3.6 * ws, 2.2 * ws);
    }

    // Hanging Bamboo Bird Cage in living room if owned!
    if (this.hasOwnedTool('pet_bird_cage')) {
      const bcP = this.project3D(-6.5, 2.6, -rz + 0.8);
      this._drawBirdCage(ctx, bcP.x, bcP.y, bcP.scale);
    }

    if (this.moveMode.active) {
      this._drawMovePlacementPreview(ctx);
    }

    // Draw Movable Interior Furniture & Appliances sorted by depth
    this._drawInteriorFurnitureSorted(ctx, homeLevel);

    // Interior Banner Header
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(this.width * 0.5 - 270, 92, 540, 56);
    ctx.strokeStyle = '#fbbf24';
    ctx.strokeRect(this.width * 0.5 - 270, 92, 540, 56);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 14px "Be Vietnam Pro", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏠 ' + stageInfo.title, this.width * 0.5, 114);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px "Be Vietnam Pro", sans-serif';
    ctx.fillText(stageInfo.subtitle, this.width * 0.5, 135);

    this._drawInteractableLabels(ctx);
    this._drawFloatingEffects(ctx);
  }

  _drawInteriorFurnitureSorted(ctx, level) {
    const intL = this.interiorLayout;
    const list = [];

    // 0. Rug on floor first (Level 3+)
    if (this.isInteriorItemVisible('rug')) {
      const rugP = this.project3D(intL.rug.x, 0, intL.rug.z);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.38)';
      ctx.beginPath();
      ctx.ellipse(rugP.x, rugP.y, 3.2 * rugP.scale, 1.6 * rugP.scale, 0, 0, Math.PI * 2);
      ctx.fill();
      if (this.moveMode.selectedId === 'rug') {
        this._drawSelectionHighlight(ctx, rugP.x, rugP.y, 3.3 * rugP.scale);
      }
      this._drawSmallTag(ctx, rugP.x, rugP.y, '🧶 Thảm Dệt', 'object', 'rug');
    }

    // 1. Bed / Sleeping Mat
    const bedP = this.project3D(intL.bed.x, 0, intL.bed.z);
    list.push({
      depth: bedP.depth,
      draw: () => {
        const s = bedP.scale;
        if (this.moveMode.selectedId === 'bed') this._drawSelectionHighlight(ctx, bedP.x, bedP.y, 2.2 * s);
        if (level === 1) {
          ctx.fillStyle = '#a8a29e';
          ctx.fillRect(bedP.x - 1.8 * s, bedP.y - 0.5 * s, 3.6 * s, 1.9 * s);
          ctx.strokeStyle = '#44403c';
          ctx.strokeRect(bedP.x - 1.8 * s, bedP.y - 0.5 * s, 3.6 * s, 1.9 * s);
          this._drawSmallTag(ctx, bedP.x, bedP.y - 0.8 * s, '🛌 Chiếu cói đơn sơ (Cấp 1)', 'object', 'indoor_bed');
        } else {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(bedP.x - 2.0 * s, bedP.y - 1.2 * s, 4.0 * s, 2.3 * s);
          ctx.fillStyle = level >= 4 ? '#f43f5e' : '#34d399';
          ctx.fillRect(bedP.x - 1.8 * s, bedP.y - 1.0 * s, 3.6 * s, 1.8 * s);
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(bedP.x - 1.5 * s, bedP.y - 0.9 * s, 1.2 * s, 0.75 * s);
          this._drawSmallTag(ctx, bedP.x, bedP.y - 1.45 * s, level >= 5 ? '🛌 Giường Gỗ Quý' : '🛌 Giường Gỗ Ấm Áp', 'object', 'indoor_bed');
        }
      }
    });

    // 2. Tea Table & Reading Lamp
    const tabP = this.project3D(intL.tea_table.x, 0, intL.tea_table.z);
    list.push({
      depth: tabP.depth,
      draw: () => {
        const ts = tabP.scale;
        if (this.moveMode.selectedId === 'tea_table') this._drawSelectionHighlight(ctx, tabP.x, tabP.y, 1.9 * ts);
        if (level === 1) {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(tabP.x - 1.0 * ts, tabP.y - 1.1 * ts, 2.0 * ts, 1.2 * ts);
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(tabP.x, tabP.y - 1.35 * ts, 0.28 * ts, 0, Math.PI * 2);
          ctx.fill();
          this._drawSmallTag(ctx, tabP.x, tabP.y - 1.7 * ts, '🍵 Thùng gỗ & Đèn dầu', 'object', 'indoor_tea');
        } else {
          ctx.fillStyle = '#92400e';
          ctx.fillRect(tabP.x - 1.7 * ts, tabP.y - 1.2 * ts, 3.4 * ts, 1.5 * ts);
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(tabP.x - 0.45 * ts, tabP.y - 0.8 * ts, 0.28 * ts, 0, Math.PI * 2);
          ctx.arc(tabP.x + 0.45 * ts, tabP.y - 0.8 * ts, 0.22 * ts, 0, Math.PI * 2);
          ctx.fill();
          this._drawSmallTag(ctx, tabP.x, tabP.y - 1.5 * ts, '🍵 Bàn Trà Đạo & Sách', 'object', 'indoor_tea');
        }
      }
    });

    // 3. Flat-Screen Smart TV & Cabinet (app_tv)
    if (this.isInteriorItemVisible('tv') && intL.tv) {
      const tvP = this.project3D(intL.tv.x, 0, intL.tv.z);
      list.push({
        depth: tvP.depth,
        draw: () => {
          const s = tvP.scale;
          if (this.moveMode.selectedId === 'tv') this._drawSelectionHighlight(ctx, tvP.x, tvP.y, 2.0 * s);
          // Wooden TV stand
          ctx.fillStyle = '#78350f';
          ctx.fillRect(tvP.x - 1.6 * s, tvP.y - 0.8 * s, 3.2 * s, 0.8 * s);
          // Flat-screen bezel
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(tvP.x - 1.45 * s, tvP.y - 2.35 * s, 2.9 * s, 1.45 * s);
          // Animated glowing TV screen
          const hueShift = Math.sin(this.elapsed * 2) * 0.15;
          ctx.fillStyle = hueShift > 0 ? '#0284c7' : '#059669';
          ctx.fillRect(tvP.x - 1.32 * s, tvP.y - 2.22 * s, 2.64 * s, 1.2 * s);
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(tvP.x + 0.6 * s, tvP.y - 1.8 * s, 0.22 * s, 0, Math.PI * 2);
          ctx.fill();
          this._drawSmallTag(ctx, tvP.x, tvP.y - 2.6 * s, '📺 Tivi Màn Hình Phẳng', 'object', 'indoor_tv');
        }
      });
    }

    // 4. Two-Door Refrigerator (app_fridge)
    if (this.isInteriorItemVisible('fridge') && intL.fridge) {
      const frP = this.project3D(intL.fridge.x, 0, intL.fridge.z);
      list.push({
        depth: frP.depth,
        draw: () => {
          const s = frP.scale;
          if (this.moveMode.selectedId === 'fridge') this._drawSelectionHighlight(ctx, frP.x, frP.y, 1.8 * s);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(frP.x - 1.05 * s, frP.y - 2.75 * s, 2.1 * s, 2.75 * s);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.strokeRect(frP.x - 1.05 * s, frP.y - 2.75 * s, 2.1 * s, 2.75 * s);
          // Freezer / Fridge divider & handles
          ctx.beginPath();
          ctx.moveTo(frP.x - 1.05 * s, frP.y - 1.65 * s);
          ctx.lineTo(frP.x + 1.05 * s, frP.y - 1.65 * s);
          ctx.stroke();
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(frP.x + 0.65 * s, frP.y - 2.4 * s, 0.14 * s, 0.55 * s);
          ctx.fillRect(frP.x + 0.65 * s, frP.y - 1.4 * s, 0.14 * s, 0.85 * s);
          this._drawSmallTag(ctx, frP.x, frP.y - 3.0 * s, '🧊 Tủ Lạnh 2 Cánh', 'object', 'fridge');
        }
      });
    }

    // 5. Kitchen Cabinet & Stove (Level 3+ OR app_kitchen_cabinet)
    if (this.isInteriorItemVisible('kitchen') && intL.kitchen) {
      const kitP = this.project3D(intL.kitchen.x, 0, intL.kitchen.z);
      list.push({
        depth: kitP.depth,
        draw: () => {
          const ks = kitP.scale;
          if (this.moveMode.selectedId === 'kitchen') this._drawSelectionHighlight(ctx, kitP.x, kitP.y, 2.1 * ks);
          ctx.fillStyle = this.hasOwnedTool('app_kitchen_cabinet') ? '#1e293b' : '#334155';
          ctx.fillRect(kitP.x - 1.75 * ks, kitP.y - 1.55 * ks, 3.5 * ks, 1.55 * ks);
          // Stove burners & sink
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(kitP.x - 0.75 * ks, kitP.y - 1.62 * ks, 0.32 * ks, 0, Math.PI * 2);
          ctx.arc(kitP.x - 0.05 * ks, kitP.y - 1.62 * ks, 0.28 * ks, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(kitP.x + 0.55 * ks, kitP.y - 1.68 * ks, 0.9 * ks, 0.22 * ks);
          this._drawSmallTag(ctx, kitP.x, kitP.y - 1.95 * ks, '🍳 Nhà Bếp & Bếp Nấu', 'object', 'indoor_cook');
        }
      });
    }

    // 6. Cookware Set & Prep Table (app_cookware_set)
    if (this.isInteriorItemVisible('cookware') && intL.cookware) {
      const cwP = this.project3D(intL.cookware.x, 0, intL.cookware.z);
      list.push({
        depth: cwP.depth,
        draw: () => {
          const cs = cwP.scale;
          if (this.moveMode.selectedId === 'cookware') this._drawSelectionHighlight(ctx, cwP.x, cwP.y, 1.7 * cs);
          ctx.fillStyle = '#92400e';
          ctx.fillRect(cwP.x - 1.3 * cs, cwP.y - 1.15 * cs, 2.6 * cs, 1.15 * cs);
          // Clay pot (Nồi đất) & Frying Pan (Chảo)
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.arc(cwP.x - 0.5 * cs, cwP.y - 1.35 * cs, 0.34 * cs, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(cwP.x + 0.45 * cs, cwP.y - 1.3 * cs, 0.32 * cs, 0, Math.PI * 2);
          ctx.fill();
          this._drawSmallTag(ctx, cwP.x, cwP.y - 1.75 * cs, '🥘 Bộ Nồi Chảo & Dao Thớt', 'object', 'cookware');
        }
      });
    }

    // 7. Brick Fireplace & Bookshelf (Level 4+)
    if (this.isInteriorItemVisible('fireplace')) {
      const fp = this.project3D(intL.fireplace.x, 0, intL.fireplace.z);
      list.push({
        depth: fp.depth,
        draw: () => {
          const fs = fp.scale;
          if (this.moveMode.selectedId === 'fireplace') this._drawSelectionHighlight(ctx, fp.x, fp.y, 2.2 * fs);
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(fp.x - 1.6 * fs, fp.y - 2.4 * fs, 3.2 * fs, 2.4 * fs);
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(fp.x, fp.y - 0.6 * fs, 0.65 * fs, 0, Math.PI * 2);
          ctx.fill();
          this._drawSmallTag(ctx, fp.x, fp.y - 2.65 * fs, '🔥 Lò Sưởi & Tủ Sách', 'object', 'fireplace');
        }
      });
    }

    // 8. Grand Piano & Meditation Sanctuary (Level 5+)
    if (this.isInteriorItemVisible('altar_piano')) {
      const ap = this.project3D(intL.altar_piano.x, 0, intL.altar_piano.z);
      list.push({
        depth: ap.depth,
        draw: () => {
          const as = ap.scale;
          if (this.moveMode.selectedId === 'altar_piano') this._drawSelectionHighlight(ctx, ap.x, ap.y, 2.2 * as);
          ctx.fillStyle = '#3b1909';
          ctx.fillRect(ap.x - 1.7 * as, ap.y - 1.9 * as, 3.4 * as, 1.9 * as);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(ap.x - 1.3 * as, ap.y - 1.15 * as, 2.6 * as, 0.28 * as);
          this._drawSmallTag(
            ctx,
            ap.x,
            ap.y - 2.15 * as,
            level >= 6 ? '🎹 Đàn Piano & Góc Tĩnh Tâm' : '🏺 Nội Thất Gỗ Quý',
            'object',
            'altar_piano'
          );
        }
      });
    }

    // Companion Pets (Dog & Cat) & Player inside the house
    if (this.hasOwnedTool('pet_dog')) {
      const dogP = this.project3D(this.petPos.x, 0, this.petPos.z);
      list.push({ depth: dogP.depth, draw: () => this._drawCompanionDog(ctx, dogP) });
    }
    if (this.hasOwnedTool('pet_cat')) {
      const catP = this.project3D(this.catPos.x, 0, this.catPos.z);
      list.push({ depth: catP.depth, draw: () => this._drawCompanionCat(ctx, catP) });
    }

    const playerP = this.project3D(this.playerPos.x, 0, this.playerPos.z);
    list.push({ depth: playerP.depth, draw: () => this._drawCharacter(ctx, playerP) });

    list.sort((a, b) => b.depth - a.depth);
    this._drawFootstepParticles(ctx);
    for (let i = 0; i < list.length; i++) list[i].draw();
  }

  _drawMovePlacementPreview(ctx) {
    const hp = this.project3D(this.hoverGroundPt.x, 0, this.hoverGroundPt.z);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.ellipse(hp.x, hp.y, 28, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (this.moveMode.selectedId) {
      this._drawSmallTag(
        ctx,
        hp.x,
        hp.y - 22,
        `📍 Click đặt "${this.moveMode.selectedName}" (-${this.moveMode.cost} 🪙)`,
        'system'
      );
    }
  }

  _drawSelectionHighlight(ctx, x, y, radius) {
    const pulse = 1 + Math.sin(this.elapsed * 8) * 0.12;
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * pulse, radius * 0.5 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  _drawFootstepParticles(ctx) {
    if (!this.footstepParticles || this.footstepParticles.length === 0) return;
    ctx.save();
    for (let i = 0; i < this.footstepParticles.length; i++) {
      const fp = this.footstepParticles[i];
      const p = this.project3D(fp.x, fp.y, fp.z);
      const alpha = Math.max(0, fp.life / fp.maxLife);
      const rad = Math.max(1.5, fp.size * p.scale * (1 + (1 - alpha) * 0.65));
      if (fp.isWater) {
        ctx.strokeStyle = `rgba(186, 230, 253, ${(alpha * 0.72).toFixed(2)})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, rad * 1.6, rad * 0.65, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(214, 211, 209, ${(alpha * 0.42).toFixed(2)})`;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, rad * 1.15, rad * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  _drawSmallTag(ctx, x, y, text, category = 'object', labelKey = '') {
    if (this.labelSettings) {
      if (category === 'character' && this.labelSettings.showCharacterLabels === false) return;
      if (category === 'object' && this.labelSettings.showObjectLabels === false) return;
    }
    let displayText = text;
    if (labelKey && this.labelSettings && this.labelSettings.customNames && this.labelSettings.customNames[labelKey]) {
      const custom = String(this.labelSettings.customNames[labelKey]).trim();
      if (custom) {
        // Preserve leading emoji if present in default text and not in custom text
        const firstSpace = String(text || '').indexOf(' ');
        const leadingPrefix = firstSpace > 0 && firstSpace <= 6 ? String(text).slice(0, firstSpace + 1) : '';
        displayText = custom.charCodeAt(0) > 255 ? custom : leadingPrefix + custom;
      }
    }
    if (!displayText) return;
    ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
    const w = ctx.measureText(displayText).width + 12;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(x - w / 2, y - 14, w, 18);
    ctx.fillStyle = category === 'character' ? '#bae6fd' : '#fde68a';
    ctx.textAlign = 'center';
    ctx.fillText(displayText, x, y - 1);
  }

  // =======================================================================
  // 3D OBJECT DRAWING HELPERS
  // =======================================================================
  _drawGroundDisk(ctx, wx, wy, wz, radius, fillColor, strokeColor) {
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    const steps = 44;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const px = wx + Math.cos(a) * radius;
      const pz = wz + Math.sin(a) * radius;
      const p = this.project3D(px, wy, pz);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  _drawStreamPolygon(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    const leftBank = [];
    const rightBank = [];
    for (let z = -25; z <= 25; z += 3.0) {
      const curve = Math.sin(z * 0.16) * 1.6;
      leftBank.push(this.project3D(-17.8 + curve, 0.02, z));
      rightBank.unshift(this.project3D(-13.2 + curve, 0.02, z));
    }
    const pts = leftBank.concat(rightBank);
    for (let i = 0; i < pts.length; i++) {
      if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
      else ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  _drawHill(ctx, h, p, isNight) {
    const w = h.r * p.scale;
    const heightPx = h.h * p.scale;
    ctx.fillStyle = isNight ? '#0f2419' : (this.regionId === 'sea' ? '#4d7c0f' : '#1e3f2b');
    ctx.beginPath();
    ctx.moveTo(p.x - w, p.y);
    ctx.quadraticCurveTo(p.x, p.y - heightPx * 1.6, p.x + w, p.y);
    ctx.closePath();
    ctx.fill();

    if (h.snow) {
      ctx.fillStyle = isNight ? '#cbd5e1' : '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(p.x - w * 0.38, p.y - heightPx * 0.52);
      ctx.quadraticCurveTo(p.x, p.y - heightPx * 1.6, p.x + w * 0.38, p.y - heightPx * 0.52);
      ctx.closePath();
      ctx.fill();
    }
  }

  _drawTree(ctx, tr, p) {
    const s = p.scale * tr.scale;
    const windMult = this.weatherMode === 'storm' ? 3.2 : (this.weatherMode === 'wind' ? 2.5 : 1.0);
    const windSpeed = this.weatherMode === 'storm' ? 4.5 : (this.weatherMode === 'wind' ? 3.4 : 2.0);
    const sway = Math.sin(this.elapsed * windSpeed + tr.x) * 3 * windMult;

    if (tr.type === 'bamboo') {
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = Math.max(3, 0.16 * s);
      for (let b = -1; b <= 1; b++) {
        ctx.beginPath();
        ctx.moveTo(p.x + b * 6, p.y);
        ctx.lineTo(p.x + b * 8 + sway, p.y - 3.6 * s);
        ctx.stroke();
      }
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(p.x + sway, p.y - 3.6 * s, 1.1 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (tr.type === 'sea') {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = Math.max(4, 0.25 * s);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(p.x + 0.4 * s, p.y - 1.5 * s, p.x + sway, p.y - 2.8 * s);
      ctx.stroke();

      ctx.fillStyle = '#65a30d';
      for (let a = 0; a < 5; a++) {
        const ang = (a / 5) * Math.PI * 2 + this.elapsed * 0.3;
        ctx.beginPath();
        ctx.ellipse(
          p.x + sway + Math.cos(ang) * 0.9 * s,
          p.y - 2.8 * s + Math.sin(ang) * 0.4 * s,
          0.9 * s,
          0.28 * s,
          ang,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(p.x - 0.2 * s, p.y - 1.2 * s, 0.4 * s, 1.2 * s);
      ctx.fillStyle = tr.type === 'mountain' ? '#14532d' : '#166534';
      for (let l = 0; l < 3; l++) {
        const w = (1.5 - l * 0.32) * s;
        const yBase = p.y - (0.9 + l * 0.85) * s;
        ctx.beginPath();
        ctx.moveTo(p.x - w + sway * 0.4, yBase);
        ctx.lineTo(p.x + sway, yBase - 1.3 * s);
        ctx.lineTo(p.x + w + sway * 0.4, yBase);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  _drawHomeExterior(ctx, p, isSelected, forceRegionId, hideTag) {
    const s = p.scale;
    const regId = forceRegionId || this.regionId || 'mountain';
    if (isSelected) this._drawSelectionHighlight(ctx, p.x, p.y, 3.6 * s);
    const hasCabin = this.ownedUpgrades.indexOf('wooden_cabin') !== -1 || !!forceRegionId;
    const scaleBoost = hasCabin ? 1.0 : 0.86;
    const u = s * scaleBoost;

    ctx.save();

    if (regId === 'mountain') {
      // 🏔️ Nhà Sàn Gỗ Thông & Mái Chữ A Vùng Cao (Alpine A-Frame Stilt Chalet)
      // Wooden stilts
      ctx.fillStyle = '#5c3a21';
      ctx.fillRect(p.x - 2.3 * u, p.y - 0.65 * u, 0.35 * u, 0.65 * u);
      ctx.fillRect(p.x + 1.95 * u, p.y - 0.65 * u, 0.35 * u, 0.65 * u);
      ctx.fillRect(p.x - 2.6 * u, p.y - 0.72 * u, 5.2 * u, 0.22 * u);

      // Stone chimney with warm smoke
      ctx.fillStyle = '#64748b';
      ctx.fillRect(p.x + 1.35 * u, p.y - 4.2 * u, 0.65 * u, 2.8 * u);
      ctx.fillStyle = 'rgba(226, 232, 240, 0.55)';
      const smokeY = (this.elapsed * 12) % 10;
      ctx.beginPath();
      ctx.arc(p.x + 1.68 * u, p.y - 4.4 * u - smokeY * 0.12 * u, 0.28 * u, 0, Math.PI * 2);
      ctx.fill();

      // Pine wood walls & steep A-frame roof
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.moveTo(p.x - 2.7 * u, p.y - 0.65 * u);
      ctx.lineTo(p.x, p.y - 4.55 * u);
      ctx.lineTo(p.x + 2.7 * u, p.y - 0.65 * u);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = Math.max(2, 0.14 * u);
      ctx.beginPath();
      ctx.moveTo(p.x - 2.95 * u, p.y - 0.5 * u);
      ctx.lineTo(p.x, p.y - 4.7 * u);
      ctx.lineTo(p.x + 2.95 * u, p.y - 0.5 * u);
      ctx.stroke();

      // Warm glowing attic window & wooden door
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 2.85 * u, 0.48 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#451a03';
      ctx.fillRect(p.x - 0.55 * u, p.y - 1.95 * u, 1.1 * u, 1.3 * u);

    } else if (regId === 'sea') {
      // 🏖️ Bungalow Biển Trắng Xanh & Chòi Lá Dừa (Coastal White-Blue Bungalow)
      // Sandy deck platform
      ctx.fillStyle = '#d97706';
      ctx.fillRect(p.x - 2.9 * u, p.y - 0.35 * u, 5.8 * u, 0.35 * u);

      // Crisp white coastal walls with turquoise trim
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(p.x - 2.5 * u, p.y - 2.55 * u, 5.0 * u, 2.2 * u);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(p.x - 2.5 * u, p.y - 0.75 * u, 5.0 * u, 0.4 * u);

      // Golden palm thatch roof
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(p.x - 3.2 * u, p.y - 2.45 * u);
      ctx.lineTo(p.x, p.y - 4.35 * u);
      ctx.lineTo(p.x + 3.2 * u, p.y - 2.45 * u);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Arched ocean-blue door & round porthole windows
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(p.x - 0.55 * u, p.y - 1.85 * u, 1.1 * u, 1.5 * u);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(p.x - 1.55 * u, p.y - 1.55 * u, 0.42 * u, 0, Math.PI * 2);
      ctx.arc(p.x + 1.55 * u, p.y - 1.55 * u, 0.42 * u, 0, Math.PI * 2);
      ctx.fill();

      // Surfboard leaning on the side & red/white lifebuoy
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.ellipse(p.x + 2.75 * u, p.y - 1.45 * u, 0.25 * u, 1.05 * u, 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = Math.max(2, 0.12 * u);
      ctx.beginPath();
      ctx.arc(p.x - 1.55 * u, p.y - 1.55 * u, 0.45 * u, 0, Math.PI * 2);
      ctx.stroke();

    } else if (regId === 'valley') {
      // 🌸 Nhà Cottage Cổ Tích Mái Ngói Đỏ & Giàn Hoa Leo (Flower Valley Cottage)
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(p.x - 2.65 * u, p.y - 2.6 * u, 5.3 * u, 2.6 * u);
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x - 2.65 * u, p.y - 2.6 * u, 5.3 * u, 2.6 * u);

      // Curved fairytale red-tile roof
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(p.x - 3.25 * u, p.y - 2.5 * u);
      ctx.quadraticCurveTo(p.x, p.y - 4.9 * u, p.x + 3.25 * u, p.y - 2.5 * u);
      ctx.closePath();
      ctx.fill();

      // Arched wooden door & glowing windows
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 1.2 * u, 0.6 * u, Math.PI, 0, false);
      ctx.lineTo(p.x + 0.6 * u, p.y);
      ctx.lineTo(p.x - 0.6 * u, p.y);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(p.x - 2.05 * u, p.y - 1.8 * u, 0.9 * u, 0.85 * u);
      ctx.fillRect(p.x + 1.15 * u, p.y - 1.8 * u, 0.9 * u, 0.85 * u);

      // Blooming pink & yellow climbing roses on walls
      const flowerPositions = [
        [-2.3, -2.2], [-1.8, -2.4], [1.9, -2.3], [2.35, -1.9], [-2.4, -1.1], [2.4, -0.9]
      ];
      flowerPositions.forEach((fp, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#f472b6' : '#facc15';
        ctx.beginPath();
        ctx.arc(p.x + fp[0] * u, p.y + fp[1] * u, 0.22 * u, 0, Math.PI * 2);
        ctx.fill();
      });

    } else if (regId === 'bamboo') {
      // 🎋 Am Trà Trúc Xanh & Hiên Đèn Lồng Tịnh Tâm (Zen Bamboo Pavilion)
      // Stone foundation & bamboo pillars
      ctx.fillStyle = '#475569';
      ctx.fillRect(p.x - 2.9 * u, p.y - 0.4 * u, 5.8 * u, 0.4 * u);
      ctx.fillStyle = '#dcfce7';
      ctx.fillRect(p.x - 2.5 * u, p.y - 2.55 * u, 5.0 * u, 2.15 * u);

      // Green bamboo columns
      ctx.fillStyle = '#15803d';
      [-2.5, -1.2, 1.2, 2.35].forEach((bx) => {
        ctx.fillRect(p.x + bx * u, p.y - 2.55 * u, 0.18 * u, 2.15 * u);
      });

      // Curved Oriental Zen emerald roof with upturned eaves
      ctx.fillStyle = '#065f46';
      ctx.beginPath();
      ctx.moveTo(p.x - 3.55 * u, p.y - 2.35 * u);
      ctx.quadraticCurveTo(p.x - 1.6 * u, p.y - 2.9 * u, p.x, p.y - 4.45 * u);
      ctx.quadraticCurveTo(p.x + 1.6 * u, p.y - 2.9 * u, p.x + 3.55 * u, p.y - 2.35 * u);
      ctx.closePath();
      ctx.fill();

      // Round Zen Shoji paper window & glowing red lanterns
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 1.5 * u, 0.72 * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Red hanging lanterns on both eaves
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(p.x - 2.85 * u, p.y - 2.05 * u, 0.26 * u, 0, Math.PI * 2);
      ctx.arc(p.x + 2.85 * u, p.y - 2.05 * u, 0.26 * u, 0, Math.PI * 2);
      ctx.fill();

    } else if (regId === 'river') {
      // 🛶 Nhà Chòi Lá Dừa Nước & Bến Xuồng Ba Lá (Mekong River Stilt House & Sampan)
      // Tall wooden river stilts & pier
      ctx.fillStyle = '#78350f';
      [-2.3, -0.9, 0.9, 2.3].forEach((sx) => {
        ctx.fillRect(p.x + sx * u, p.y - 0.85 * u, 0.24 * u, 0.85 * u);
      });
      ctx.fillStyle = '#92400e';
      ctx.fillRect(p.x - 2.8 * u, p.y - 0.9 * u, 5.6 * u, 0.25 * u);

      // Rustic timber walls & Nipa palm leaf roof (Mái lá dừa nước)
      ctx.fillStyle = '#b45309';
      ctx.fillRect(p.x - 2.4 * u, p.y - 2.75 * u, 4.8 * u, 1.85 * u);
      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.moveTo(p.x - 3.15 * u, p.y - 2.65 * u);
      ctx.lineTo(p.x - 1.2 * u, p.y - 4.15 * u);
      ctx.lineTo(p.x + 1.2 * u, p.y - 4.15 * u);
      ctx.lineTo(p.x + 3.15 * u, p.y - 2.65 * u);
      ctx.closePath();
      ctx.fill();

      // Warm doorway & terracotta rain jar (Lu nước mưa)
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(p.x - 0.55 * u, p.y - 2.15 * u, 1.1 * u, 1.25 * u);
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.arc(p.x - 2.15 * u, p.y - 1.15 * u, 0.35 * u, 0, Math.PI * 2);
      ctx.fill();

      // Wooden Sampan Boat (Xuồng ba lá) moored right in front
      const boatBob = Math.sin(this.elapsed * 2.6) * 0.06 * u;
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(p.x + 1.1 * u, p.y + 0.1 * u + boatBob);
      ctx.quadraticCurveTo(p.x + 2.35 * u, p.y + 0.55 * u + boatBob, p.x + 3.55 * u, p.y + 0.05 * u + boatBob);
      ctx.closePath();
      ctx.fill();

    } else if (regId === 'plateau') {
      // 🌾 Lều Du Mục Yurt Tròn & Cờ Dây Thảo Nguyên (Nomad Yurt Dome & Prayer Flags)
      // Cylindrical felt walls
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(p.x - 2.6 * u, p.y - 2.15 * u, 5.2 * u, 2.15 * u);

      // Decorative brocade band (Thổ cẩm thảo nguyên)
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(p.x - 2.6 * u, p.y - 2.15 * u, 5.2 * u, 0.35 * u);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(p.x - 2.6 * u, p.y - 1.8 * u, 5.2 * u, 0.16 * u);

      // Rounded Yurt Dome Roof & Crown Ring (Toono)
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 2.15 * u, 2.65 * u, Math.PI, 0, false);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#b45309';
      ctx.fillRect(p.x - 0.75 * u, p.y - 4.92 * u, 1.5 * u, 0.28 * u);

      // Ornate wooden door & warm windows
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(p.x - 0.6 * u, p.y - 1.65 * u, 1.2 * u, 1.65 * u);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(p.x - 1.55 * u, p.y - 1.1 * u, 0.36 * u, 0, Math.PI * 2);
      ctx.arc(p.x + 1.55 * u, p.y - 1.1 * u, 0.36 * u, 0, Math.PI * 2);
      ctx.fill();

      // Colorful Wind Prayer Flags fluttering beside the Yurt
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x + 1.8 * u, p.y - 4.1 * u);
      ctx.lineTo(p.x + 3.6 * u, p.y - 1.5 * u);
      ctx.stroke();
      ['#ef4444', '#38bdf8', '#22c55e', '#facc15'].forEach((fc, idx) => {
        ctx.fillStyle = fc;
        ctx.fillRect(p.x + (2.1 + idx * 0.35) * u, p.y - (3.65 - idx * 0.48) * u, 0.25 * u, 0.2 * u);
      });
    }

    ctx.restore();

    // Draw 3D Courtyard Fence around the house if player owns/equips a fence!
    const activeFenceId = !hideTag ? this.getActiveFenceId() : null;
    if (activeFenceId) {
      this._drawCourtyardFence(ctx, p, s, activeFenceId);
    }

    if (this.ownedUpgrades.indexOf('tea_veranda') !== -1 && !hideTag) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(p.x - 3.6 * s, p.y - 0.8 * s, 1.2 * s, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }

    // Hanging Bamboo Bird Cage on the porch if owned!
    if (this.hasOwnedTool('pet_bird_cage') && !hideTag) {
      this._drawBirdCage(ctx, p.x + 2.45 * s, p.y - 2.35 * s, s);
    }

    if (!hideTag) {
      const regObj = (window.GAME_DATA && window.GAME_DATA.regions && window.GAME_DATA.regions[regId]) || null;
      if (regObj && regObj.homeName) {
        this._drawSmallTag(ctx, p.x, p.y - 4.95 * u, '🏠 ' + regObj.homeName, 'object', 'house');
      }
    }
  }

  _drawCourtyardFence(ctx, p, s, fenceId) {
    const fCfg = (window.GAME_DATA && window.GAME_DATA.fenceStyles && window.GAME_DATA.fenceStyles[fenceId]) || {
      name: 'Hàng Rào Khuôn Viên',
      icon: '🎋',
      postColor: '#65a30d',
      railColor: '#a3e635',
      accentColor: '#eab308',
      gateColor: '#84cc16',
      styleType: 'bamboo'
    };

    const rx = 4.35 * s;
    const ry = 1.65 * s;
    const cy = p.y + 0.18 * s;
    const postH = 0.88 * s;

    ctx.save();

    // 1. Subtle courtyard border ring on the ground
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = Math.max(1.5, 0.08 * s);
    ctx.beginPath();
    ctx.ellipse(p.x, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Draw fence posts & connecting rails around the courtyard (leaving an open front gate at angle 0.36π .. 0.64π)
    const totalPosts = 18;
    const postCoords = [];
    for (let i = 0; i <= totalPosts; i++) {
      const ang = (i / totalPosts) * Math.PI * 2;
      // Leave front entrance gateway open around PI/2 (front of house)
      const normAng = ((ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const inFrontGate = normAng > Math.PI * 0.41 && normAng < Math.PI * 0.59;
      const px = p.x + Math.cos(ang) * rx;
      const py = cy + Math.sin(ang) * ry;
      postCoords.push({ px, py, ang: normAng, inFrontGate });
    }

    // Horizontal rails / stone wall / rose lattice between consecutive posts
    for (let i = 0; i < postCoords.length - 1; i++) {
      const a = postCoords[i];
      const b = postCoords[i + 1];
      if (a.inFrontGate || b.inFrontGate) continue;

      if (fCfg.styleType === 'stone') {
        // Low moss-covered stone wall segment
        ctx.fillStyle = fCfg.railColor;
        ctx.beginPath();
        ctx.moveTo(a.px, a.py);
        ctx.lineTo(b.px, b.py);
        ctx.lineTo(b.px, b.py - postH * 0.68);
        ctx.lineTo(a.px, a.py - postH * 0.68);
        ctx.closePath();
        ctx.fill();
        // Green moss cap
        ctx.strokeStyle = fCfg.accentColor;
        ctx.lineWidth = Math.max(2, 0.11 * s);
        ctx.beginPath();
        ctx.moveTo(a.px, a.py - postH * 0.68);
        ctx.lineTo(b.px, b.py - postH * 0.68);
        ctx.stroke();
      } else {
        // Upper and lower horizontal fence rails
        ctx.strokeStyle = fCfg.railColor;
        ctx.lineWidth = Math.max(2, 0.1 * s);
        ctx.beginPath();
        ctx.moveTo(a.px, a.py - postH * 0.32);
        ctx.lineTo(b.px, b.py - postH * 0.32);
        ctx.moveTo(a.px, a.py - postH * 0.72);
        ctx.lineTo(b.px, b.py - postH * 0.72);
        ctx.stroke();
      }

      // Fairy string lights for pine_log OR glowing lanterns for zen_torii
      if (fCfg.styleType === 'pine_log' || fCfg.styleType === 'zen_torii') {
        const midX = (a.px + b.px) * 0.5;
        const midY = (a.py + b.py) * 0.5 - postH * 0.58;
        ctx.fillStyle = fCfg.styleType === 'zen_torii' ? '#ef4444' : '#fde047';
        ctx.beginPath();
        ctx.arc(midX, midY, Math.max(2, 0.11 * s), 0, Math.PI * 2);
        ctx.fill();
      }

      // Blooming flowers along the fence for picket or rose_vine
      if (fCfg.hasFlowers) {
        const midX = (a.px + b.px) * 0.5;
        const midY = (a.py + b.py) * 0.5 - postH * (fCfg.styleType === 'rose_vine' ? 0.62 : 0.18);
        ctx.fillStyle = fCfg.flowerColor || '#fb7185';
        ctx.beginPath();
        ctx.arc(midX, midY, Math.max(2.2, 0.13 * s), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw vertical fence posts
    for (let i = 0; i < postCoords.length - 1; i++) {
      const pt = postCoords[i];
      if (pt.inFrontGate) continue;
      ctx.fillStyle = fCfg.postColor;
      const pw = Math.max(2.5, 0.15 * s);
      ctx.fillRect(pt.px - pw * 0.5, pt.py - postH, pw, postH);
      // Pointed white picket cap or stone lantern cap
      if (fCfg.styleType === 'picket') {
        ctx.beginPath();
        ctx.moveTo(pt.px - pw * 0.65, pt.py - postH);
        ctx.lineTo(pt.px, pt.py - postH - 0.18 * s);
        ctx.lineTo(pt.px + pw * 0.65, pt.py - postH);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 3. Decorative Front Courtyard Archway Gate (Cổng vòm trước sân nhà)
    const gateLeftX = p.x - 0.95 * s;
    const gateRightX = p.x + 0.95 * s;
    const gateY = cy + ry * 0.96;
    const gateH = 1.65 * s;

    ctx.fillStyle = fCfg.postColor;
    ctx.fillRect(gateLeftX - 0.12 * s, gateY - gateH, 0.24 * s, gateH);
    ctx.fillRect(gateRightX - 0.12 * s, gateY - gateH, 0.24 * s, gateH);

    // Gate top beam / arch
    ctx.strokeStyle = fCfg.gateColor;
    ctx.lineWidth = Math.max(3, 0.18 * s);
    ctx.beginPath();
    if (fCfg.styleType === 'zen_torii') {
      // Classic Torii double curved lintel
      ctx.moveTo(gateLeftX - 0.38 * s, gateY - gateH);
      ctx.quadraticCurveTo(p.x, gateY - gateH - 0.22 * s, gateRightX + 0.38 * s, gateY - gateH);
      ctx.moveTo(gateLeftX - 0.22 * s, gateY - gateH + 0.25 * s);
      ctx.lineTo(gateRightX + 0.22 * s, gateY - gateH + 0.25 * s);
    } else {
      ctx.moveTo(gateLeftX - 0.22 * s, gateY - gateH + 0.1 * s);
      ctx.quadraticCurveTo(p.x, gateY - gateH - 0.55 * s, gateRightX + 0.22 * s, gateY - gateH + 0.1 * s);
    }
    ctx.stroke();

    // Glowing Gate Lanterns at night or for stone/zen fences
    if (fCfg.hasLanterns || this.isNightTime) {
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(gateLeftX, gateY - gateH * 0.78, 0.16 * s, 0, Math.PI * 2);
      ctx.arc(gateRightX, gateY - gateH * 0.78, 0.16 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    this._drawSmallTag(ctx, p.x, gateY - gateH - 0.38 * s, `${fCfg.icon} ${fCfg.name}`, 'object', 'fence');
    ctx.restore();
  }

  _drawBirdCage(ctx, x, y, s) {
    const sway = Math.sin(this.elapsed * 2.5) * 0.08 * s;
    const cx = x + sway;
    // Hanging hook
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x, y - 0.45 * s);
    ctx.lineTo(cx, y);
    ctx.stroke();

    // Bamboo dome cage
    ctx.fillStyle = 'rgba(254, 243, 199, 0.25)';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, y + 0.35 * s, 0.38 * s, Math.PI, 0, false);
    ctx.lineTo(cx + 0.38 * s, y + 0.65 * s);
    ctx.lineTo(cx - 0.38 * s, y + 0.65 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Little songbird hopping inside
    const hop = Math.abs(Math.sin(this.elapsed * 7)) * 0.09 * s;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, y + 0.48 * s - hop, 0.14 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(cx + 0.12 * s, y + 0.46 * s - hop, 0.05 * s, 0, Math.PI * 2);
    ctx.fill();

    this._drawSmallTag(ctx, cx, y - 0.52 * s, '🦜 Chim Hót ♪', 'character', 'pet_bird');
  }

  _drawPoultryStation(ctx, p, pout, isSelected) {
    const s = p.scale;
    if (isSelected) this._drawSelectionHighlight(ctx, p.x, p.y, 2.7 * s);

    // Rustic fenced yard & straw ground
    ctx.fillStyle = 'rgba(217, 119, 6, 0.28)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 2.4 * s, 1.15 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Chicken Coop with thatched roof
    ctx.fillStyle = '#92400e';
    ctx.fillRect(p.x - 1.1 * s, p.y - 1.15 * s, 2.2 * s, 1.05 * s);
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(p.x - 1.35 * s, p.y - 1.1 * s);
    ctx.lineTo(p.x, p.y - 1.85 * s);
    ctx.lineTo(p.x + 1.35 * s, p.y - 1.1 * s);
    ctx.closePath();
    ctx.fill();

    // Optional Feed Trough & Egg Basket
    if (this.ownedStationProps.indexOf('farm_feed_trough') !== -1) {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(p.x + 1.1 * s, p.y - 0.35 * s, 1.1 * s, 0.35 * s);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(p.x + 1.18 * s, p.y - 0.38 * s, 0.94 * s, 0.14 * s);
    }
    if (this.ownedStationProps.indexOf('farm_egg_basket') !== -1) {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(p.x - 1.45 * s, p.y - 0.25 * s, 0.35 * s, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(p.x - 1.52 * s, p.y - 0.32 * s, 0.11 * s, 0, Math.PI * 2);
      ctx.arc(p.x - 1.36 * s, p.y - 0.32 * s, 0.11 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // 1. Animated Flock of Chickens (Rooster + Hens + Chicks) if farm_chickens is owned!
    if (this.hasOwnedTool('farm_chickens')) {
      for (let c = 0; c < 4; c++) {
        // Realistic chicken behavior: intermittent foraging stride + stop-and-peck + wing flutter
        const cycle = (this.elapsed * 0.75 + c * 1.4) % 4.0;
        const isPecking = cycle > 2.6;
        const walkProgress = isPecking ? 2.6 + (cycle - 2.6) * 0.12 : cycle;
        const ang = walkProgress * (0.9 + c * 0.15) + c * 1.6;
        const cx = p.x + Math.cos(ang) * (1.1 + (c % 2) * 0.55) * s;
        const cy = p.y + Math.sin(ang) * 0.48 * s;
        const peck = isPecking
          ? Math.abs(Math.sin(this.elapsed * 16 + c)) * 0.16 * s
          : Math.abs(Math.sin(this.elapsed * 6 + c)) * 0.04 * s;
        const bobY = isPecking ? 0 : Math.abs(Math.sin(this.elapsed * 11 + c)) * 0.04 * s;
        const dirC = -Math.sin(ang) >= 0 ? 1 : -1;

        // Tiny chicken feet
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = Math.max(1.2, 0.04 * s);
        ctx.beginPath();
        ctx.moveTo(cx - 0.04 * s, cy - 0.08 * s);
        ctx.lineTo(cx - 0.06 * s, cy);
        ctx.moveTo(cx + 0.04 * s, cy - 0.08 * s);
        ctx.lineTo(cx + 0.06 * s, cy);
        ctx.stroke();

        // Body
        ctx.fillStyle = c === 0 ? '#dc2626' : (c % 2 === 1 ? '#fef3c7' : '#f59e0b');
        ctx.beginPath();
        ctx.ellipse(cx, cy - 0.22 * s - bobY, 0.26 * s, 0.19 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head & Red Comb
        ctx.beginPath();
        ctx.arc(cx + dirC * 0.18 * s, cy - 0.36 * s + peck - bobY, 0.13 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx + dirC * 0.2 * s, cy - 0.48 * s + peck - bobY, 0.06 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      this._drawSmallTag(ctx, p.x, p.y - 2.05 * s, '🐓 Đàn Gà Đẻ Trứng', 'character', 'farm_chickens');
    }

    // 2. Animated Flock of Ducks swimming in the stream & bank if farm_ducks is owned!
    if (this.hasOwnedTool('farm_ducks')) {
      for (let d = 0; d < 4; d++) {
        const swimZ = pout.z - 2.0 + Math.sin(this.elapsed * 0.9 + d * 1.5) * 2.8;
        const swimX = -15.2 + Math.cos(this.elapsed * 1.1 + d) * 1.1;
        const dp = this.project3D(swimX, 0.05, swimZ);
        const ds = dp.scale;
        const tailWag = Math.sin(this.elapsed * 12 + d) * 0.04 * ds;
        // Water ripple under duck
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(dp.x, dp.y + 0.06 * ds, 0.38 * ds, 0.15 * ds, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Duck body (white/yellow) & green mallard head
        ctx.fillStyle = d % 2 === 0 ? '#ffffff' : '#fef08a';
        ctx.beginPath();
        ctx.ellipse(dp.x + tailWag * 0.3, dp.y - 0.12 * ds, 0.3 * ds, 0.18 * ds, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = d === 0 ? '#15803d' : '#fef08a';
        ctx.beginPath();
        ctx.arc(dp.x + 0.2 * ds, dp.y - 0.28 * ds, 0.13 * ds, 0, Math.PI * 2);
        ctx.fill();
        // Orange duck bill
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.ellipse(dp.x + 0.34 * ds, dp.y - 0.26 * ds, 0.09 * ds, 0.045 * ds, 0, 0, Math.PI * 2);
        ctx.fill();
        if (d === 0) {
          this._drawSmallTag(ctx, dp.x, dp.y - 0.55 * ds, '🦆 Đàn Vịt Bơi Suối', 'character', 'farm_ducks');
        }
      }
    }
  }

  _drawWindmillAndPond(ctx, p, isSelected) {
    const s = p.scale;
    if (isSelected) this._drawSelectionHighlight(ctx, p.x, p.y, 2.8 * s);
    // Koi Pond
    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.ellipse(p.x - 2.0 * s, p.y + 0.3 * s, 1.8 * s, 0.85 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Windmill Tower
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(p.x - 0.75 * s, p.y);
    ctx.lineTo(p.x - 0.38 * s, p.y - 4.0 * s);
    ctx.lineTo(p.x + 0.38 * s, p.y - 4.0 * s);
    ctx.lineTo(p.x + 0.75 * s, p.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    for (let b = 0; b < 4; b++) {
      const ang = this.elapsed * 1.4 + (b * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 3.6 * s);
      ctx.lineTo(p.x + Math.cos(ang) * 1.9 * s, p.y - 3.6 * s + Math.sin(ang) * 1.9 * s);
      ctx.stroke();
    }
    this._drawSmallTag(ctx, p.x, p.y - 4.3 * s, '🎏 Hồ Cá Koi & Cối Xay Gió');
  }

  _drawBellTower(ctx, p, isSelected) {
    const s = p.scale;
    if (isSelected) this._drawSelectionHighlight(ctx, p.x, p.y, 2.2 * s);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(p.x - 0.85 * s, p.y - 3.2 * s, 1.7 * s, 3.2 * s);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(p.x, p.y - 2.3 * s, 0.48 * s, 0, Math.PI, true);
    ctx.fill();
    this._drawSmallTag(ctx, p.x, p.y - 3.5 * s, '🔔 Tháp Chuông Nguyện Cầu');
  }

  _drawWoodStation(ctx, p, isSelected) {
    const s = p.scale;
    if (isSelected) this._drawSelectionHighlight(ctx, p.x, p.y, 2.4 * s);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(p.x - 0.7 * s, p.y - 0.75 * s, 1.4 * s, 0.75 * s);
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y - 0.75 * s, 0.7 * s, 0.28 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.ownedStationProps.indexOf('work_bench') !== -1) {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(p.x + 1.0 * s, p.y - 0.95 * s, 1.6 * s, 0.95 * s);
      this._drawSmallTag(ctx, p.x + 1.8 * s, p.y - 1.15 * s, '🪚 Bàn Cưa Gỗ');
    }
    if (this.ownedStationProps.indexOf('work_water_jug') !== -1) {
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(p.x - 1.3 * s, p.y - 0.45 * s, 0.4 * s, 0, Math.PI * 2);
      ctx.fill();
      this._drawSmallTag(ctx, p.x - 1.3 * s, p.y - 0.95 * s, '🏺 Nước Vối Mát');
    }
    if (this.ownedStationProps.indexOf('work_shed') !== -1) {
      ctx.fillStyle = '#92400e';
      ctx.fillRect(p.x - 1.7 * s, p.y - 2.2 * s, 3.6 * s, 0.28 * s);
    }
  }

  _drawGardenStation(ctx, p, isSelected) {
    const s = p.scale;
    if (isSelected) this._drawSelectionHighlight(ctx, p.x, p.y, 2.8 * s);
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 2.5 * s, 1.2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(p.x + i * 0.75 * s, p.y - 0.22 * s, 0.36 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.ownedStationProps.indexOf('garden_stool') !== -1) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(p.x + 1.8 * s, p.y - 0.6 * s, 0.8 * s, 0.6 * s);
      this._drawSmallTag(ctx, p.x + 2.1 * s, p.y - 0.8 * s, '🪑 Ghế Làm Vườn');
    }
    if (this.ownedStationProps.indexOf('garden_scarecrow') !== -1) {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(p.x - 2.0 * s, p.y - 1.8 * s, 0.22 * s, 1.8 * s);
      ctx.beginPath();
      ctx.arc(p.x - 1.9 * s, p.y - 1.9 * s, 0.4 * s, 0, Math.PI * 2);
      ctx.fill();
      this._drawSmallTag(ctx, p.x - 1.9 * s, p.y - 2.4 * s, '🌾 Bù Nhìn Rơm');
    }
    if (this.ownedStationProps.indexOf('garden_sprinkler') !== -1) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 0.9 * s, 1.0 * s, Math.PI, 0);
      ctx.stroke();
    }
  }

  _drawExpandedLandGrounds(ctx, groundTint, isNight) {
    const allPlots = (window.GAME_DATA && window.GAME_DATA.landExpansions) || [];
    const homeLevel = 1 + (this.ownedUpgrades ? this.ownedUpgrades.length : 0);

    for (let i = 0; i < allPlots.length; i++) {
      const plot = allPlots[i];
      const c = plot.coords;
      if (!c) continue;
      const isOwned = this.ownedLandExpansions && this.ownedLandExpansions.indexOf(plot.id) !== -1;

      if (!isOwned) {
        // Show a subtle blueprint boundary for the next expandable plot when player is at House Level 6
        const prevOwned = !plot.requiredPrevId || (this.ownedLandExpansions && this.ownedLandExpansions.indexOf(plot.requiredPrevId) !== -1);
        if (homeLevel >= 6 && prevOwned) {
          ctx.save();
          ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
          ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 5]);
          ctx.beginPath();
          const steps = 28;
          for (let k = 0; k <= steps; k++) {
            const a = (k / steps) * Math.PI * 2;
            const px = c.x + Math.cos(a) * c.rx;
            const pz = c.z + Math.sin(a) * c.rz;
            const sp = this.project3D(px, 0, pz);
            if (k === 0) ctx.moveTo(sp.x, sp.y);
            else ctx.lineTo(sp.x, sp.y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.setLineDash([]);
          const cp = this.project3D(c.x, 0.3, c.z);
          this._drawSmallTag(ctx, cp.x, cp.y, `🗺️ Có thể mở rộng: ${plot.shortTitle} (${plot.cost.toLocaleString('vi-VN')} 🪙)`);
          ctx.restore();
        }
        continue;
      }

      // 1. Draw Wooden Connecting Bridge from main island to the expanded land plot
      const b1 = this.project3D(c.bridgeX, 0.04, c.bridgeZ);
      const b2 = this.project3D(c.x, 0.04, c.z);
      ctx.save();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = Math.max(10, 1.35 * b1.scale);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(b1.x, b1.y);
      ctx.lineTo(b2.x, b2.y);
      ctx.stroke();

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = Math.max(6, 0.95 * b1.scale);
      ctx.beginPath();
      ctx.moveTo(b1.x, b1.y);
      ctx.lineTo(b2.x, b2.y);
      ctx.stroke();
      ctx.restore();

      // 2. Draw Stone Retaining Wall Rim & Fertile Land Peninsula
      ctx.save();
      ctx.fillStyle = isNight ? '#143325' : groundTint;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      const steps = 32;
      for (let k = 0; k <= steps; k++) {
        const a = (k / steps) * Math.PI * 2;
        const px = c.x + Math.cos(a) * c.rx;
        const pz = c.z + Math.sin(a) * c.rz;
        const sp = this.project3D(px, 0, pz);
        if (k === 0) ctx.moveTo(sp.x, sp.y);
        else ctx.lineTo(sp.x, sp.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  _drawExpandedLandStation(ctx, plot, p) {
    const s = p.scale;
    const isGarden = plot.plotType === 'garden';

    ctx.save();
    if (isGarden) {
      // Rich Organic Vegetable & Herb Beds on Expanded Plot
      ctx.fillStyle = '#451a03';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 2.9 * s, 1.38 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 2 Rows of Lush Crops (Cabbages, Strawberries & Golden Herbs)
      for (let row = -1; row <= 1; row += 2) {
        for (let col = -2; col <= 2; col++) {
          const cx = p.x + col * 0.82 * s;
          const cy = p.y + row * 0.36 * s - 0.16 * s;
          const sway = Math.sin(this.elapsed * 2.6 + col + row) * 0.04 * s;
          ctx.fillStyle = plot.level >= 3 ? '#10b981' : '#22c55e';
          ctx.beginPath();
          ctx.arc(cx + sway, cy, 0.34 * s, 0, Math.PI * 2);
          ctx.fill();

          // Fruit / Herb blossom accent
          ctx.fillStyle = plot.level >= 3 ? '#f43f5e' : '#fde047';
          ctx.beginPath();
          ctx.arc(cx + sway + 0.08 * s, cy - 0.1 * s, 0.11 * s, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Rotating Water Sprinkler Mist in Center
      const mistAngle = this.elapsed * 3.5;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 0.75 * s, 0.85 * s, mistAngle, mistAngle + Math.PI * 0.8);
      ctx.stroke();
    } else {
      // Expanded Poultry & Duck Pasture (Cozy Coop + Grazing Chickens & Ducks)
      ctx.fillStyle = '#3f6212';
      ctx.strokeStyle = '#a16207';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 3.0 * s, 1.42 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Wooden Coop House on the Expanded Pasture
      ctx.fillStyle = '#92400e';
      ctx.fillRect(p.x - 1.15 * s, p.y - 1.45 * s, 2.3 * s, 1.15 * s);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(p.x - 1.4 * s, p.y - 1.45 * s);
      ctx.lineTo(p.x, p.y - 2.25 * s);
      ctx.lineTo(p.x + 1.4 * s, p.y - 1.45 * s);
      ctx.closePath();
      ctx.fill();

      // Animated Grazing Chickens & Ducks on the new plot
      for (let k = -1; k <= 1; k++) {
        const bx = p.x + k * 1.15 * s + Math.sin(this.elapsed * 1.8 + k * 2) * 0.22 * s;
        const by = p.y + 0.32 * s;
        const peck = Math.abs(Math.sin(this.elapsed * 5 + k)) * 0.08 * s;
        ctx.fillStyle = k === 0 ? '#ffffff' : '#fef08a';
        ctx.beginPath();
        ctx.ellipse(bx, by - 0.16 * s, 0.25 * s, 0.17 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bx + 0.16 * s, by - 0.3 * s + peck, 0.12 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(bx + 0.18 * s, by - 0.4 * s + peck, 0.05 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this._drawSmallTag(ctx, p.x, p.y - 2.45 * s, `${plot.icon} ${plot.shortTitle} (+${plot.passiveCoins}🪙/5s)`);
    ctx.restore();
  }

  _drawFishingStation(ctx, p, isSelected) {
    const s = p.scale;
    if (isSelected) this._drawSelectionHighlight(ctx, p.x, p.y, 2.5 * s);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(p.x - 1.8 * s, p.y - 0.38 * s, 3.6 * s, 0.75 * s);
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(p.x - 1.8 * s, p.y - 0.38 * s, 3.6 * s, 0.75 * s);

    const ripple = Math.sin(this.elapsed * 3) * 0.25 + 0.75;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.ellipse(p.x - 2.5 * s, p.y + 0.3 * s, 0.7 * s * ripple, 0.3 * s * ripple, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (this.ownedStationProps.indexOf('fish_chair') !== -1) {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(p.x - 0.5 * s, p.y - 1.0 * s, 0.9 * s, 0.8 * s);
      this._drawSmallTag(ctx, p.x, p.y - 1.2 * s, '🪑 Ghế Ngồi Câu');
    }
    if (this.ownedStationProps.indexOf('fish_tea_table') !== -1) {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(p.x + 0.7 * s, p.y - 0.85 * s, 1.15 * s, 0.7 * s);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(p.x + 1.2 * s, p.y - 1.0 * s, 0.22 * s, 0, Math.PI * 2);
      ctx.fill();
      this._drawSmallTag(ctx, p.x + 1.35 * s, p.y - 1.3 * s, '🍵 Bàn Nước Bờ Suối');
    }
    if (this.ownedStationProps.indexOf('fish_umbrella') !== -1) {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 0.35 * s);
      ctx.lineTo(p.x, p.y - 2.6 * s);
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(p.x - 1.8 * s, p.y - 2.2 * s);
      ctx.quadraticCurveTo(p.x, p.y - 3.2 * s, p.x + 1.8 * s, p.y - 2.2 * s);
      ctx.closePath();
      ctx.fill();
    }
  }

  _drawCampfireAndTea(ctx, p, isSelected) {
    const s = p.scale;
    if (isSelected) this._drawSelectionHighlight(ctx, p.x, p.y, 1.8 * s);
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 0.8 * s, 0.38 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    const flicker = 0.85 + Math.sin(this.elapsed * 14) * 0.2;
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(p.x - 0.5 * s, p.y);
    ctx.quadraticCurveTo(p.x, p.y - 1.45 * s * flicker, p.x + 0.5 * s, p.y);
    ctx.closePath();
    ctx.fill();
  }

  _drawCompanionDog(ctx, p) {
    const s = p.scale;
    const isSwimming = !!this.isDogSwimming;
    const isSitting = !isSwimming && this.dogBehavior === 'sit' && (this.dogSpeed || 0) < 0.45;
    const isSniffing = !isSwimming && !isSitting && this.dogBehavior === 'sniff';
    const isRunning = !isSitting && ((this.dogSpeed || 0) > 0.85 || this.playerState === 'walk' || isSwimming);
    const isFollowing = !!(this.petSettings && this.petSettings.dogFollow);
    const runFreq = isSwimming ? 18 : (isRunning ? 14.5 : 8.0);
    const bounce = isSwimming
      ? Math.sin(this.elapsed * 7.5) * 0.08 * s
      : isSitting
        ? Math.sin(this.elapsed * 3.2) * 0.025 * s
        : Math.abs(Math.sin(this.elapsed * runFreq)) * (isRunning ? 0.16 : 0.06) * s;
    const wagFreq = isFollowing ? 22 : (isSitting ? 16 : 11);
    const wagAngle = Math.sin(this.elapsed * wagFreq) * 0.44;
    const legSwing = isSitting ? 0 : Math.sin(this.elapsed * runFreq) * (isRunning ? 0.24 : 0.09) * s;
    const legLift = isSitting ? 0 : Math.max(0, Math.cos(this.elapsed * runFreq)) * (isRunning ? 0.09 : 0.03) * s;
    const dir = (this.dogFacing || 1) >= 0 ? 1 : -1;

    ctx.save();
    ctx.translate(p.x, p.y + (isSwimming ? 0.16 * s : 0));

    if (isSwimming) {
      // Concentric water ripples & doggy-paddle splash around Cậu Vàng
      const ripple = 0.85 + Math.sin(this.elapsed * 9) * 0.18;
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.85)';
      ctx.lineWidth = Math.max(1.5, 0.07 * s);
      ctx.beginPath();
      ctx.ellipse(0, -0.08 * s, 0.68 * s * ripple, 0.26 * s * ripple, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.beginPath();
      ctx.ellipse(0, -0.08 * s, 0.92 * s * (2 - ripple), 0.34 * s * (2 - ripple), 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // 3D Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 0.56 * s, 0.22 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Scale horizontally for facing direction while keeping text upright later
    ctx.save();
    ctx.scale(dir, 1);
    if (isSwimming) {
      // Tilt body upward so head & front paws paddle at the water surface
      ctx.rotate(-0.22);
    }

    // 1. Back Legs (Submerged when swimming, tucked when sitting)
    if (!isSwimming) {
      ctx.strokeStyle = '#b45309';
      ctx.lineCap = 'round';
      ctx.lineWidth = Math.max(3, 0.13 * s);
      ctx.beginPath();
      if (isSitting) {
        ctx.moveTo(-0.24 * s, -0.18 * s);
        ctx.lineTo(-0.08 * s, -0.03 * s);
        ctx.moveTo(0.14 * s, -0.28 * s);
        ctx.lineTo(0.18 * s, -0.03 * s);
      } else {
        ctx.moveTo(-0.24 * s, -0.28 * s - bounce);
        ctx.lineTo(-0.28 * s - legSwing, -0.04 * s - legLift);
        ctx.moveTo(0.18 * s, -0.28 * s - bounce);
        ctx.lineTo(0.16 * s + legSwing, -0.04 * s - legLift * 0.5);
      }
      ctx.stroke();
    }

    // 2. Fluffy Curved Wagging Tail (Đuôi bông vẫy liên hồi)
    ctx.save();
    ctx.translate(-0.38 * s, (isSitting ? -0.24 : -0.38) * s - bounce);
    ctx.rotate(wagAngle);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = Math.max(4, 0.16 * s);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-0.22 * s, -0.18 * s, -0.14 * s, -0.36 * s);
    ctx.stroke();
    // Cream tail tip
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(-0.14 * s, -0.36 * s, 0.08 * s, 0, Math.PI * 2);
    ctx.fill();
    if (isFollowing) {
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.65)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(-0.14 * s, -0.36 * s, 0.15 * s, -0.8, 0.8);
      ctx.stroke();
    }
    ctx.restore();

    // 3. 3D Shaded Torso & Cream Chest (Thân Shiba/Cậu Vàng 3D có khối sáng tối)
    const torsoTilt = isSitting ? -0.32 : (isSniffing ? 0.15 : -0.06);
    const torsoY = (isSitting ? -0.29 : -0.35) * s - bounce;
    const bodyGrad = ctx.createRadialGradient(0.05 * s, torsoY - 0.07 * s, 0.05 * s, 0, torsoY, 0.5 * s);
    bodyGrad.addColorStop(0, '#fbbf24');
    bodyGrad.addColorStop(0.7, '#f59e0b');
    bodyGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, torsoY, 0.45 * s, 0.27 * s, torsoTilt, 0, Math.PI * 2);
    ctx.fill();

    // Fluffy cream chest & belly
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(0.18 * s, torsoY + 0.03 * s, 0.26 * s, 0.2 * s, 0.25, 0, Math.PI * 2);
    ctx.fill();

    // 4. Front Legs & White Paws (Doggy-paddle forward when swimming!)
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = Math.max(3.2, 0.14 * s);
    ctx.beginPath();
    if (isSwimming) {
      const paddle1 = Math.sin(this.elapsed * 18) * 0.16 * s;
      const paddle2 = Math.cos(this.elapsed * 18) * 0.16 * s;
      ctx.moveTo(0.16 * s, -0.28 * s - bounce);
      ctx.lineTo(0.38 * s + paddle1, -0.18 * s + paddle2 * 0.5);
      ctx.moveTo(0.26 * s, -0.26 * s - bounce);
      ctx.lineTo(0.46 * s - paddle1, -0.14 * s - paddle2 * 0.5);
      ctx.stroke();
      // White splash drops at front paws
      ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
      ctx.beginPath();
      ctx.arc(0.45 * s + paddle1, -0.18 * s, 0.055 * s, 0, Math.PI * 2);
      ctx.arc(0.52 * s - paddle1, -0.12 * s, 0.045 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (isSitting) {
      ctx.moveTo(0.18 * s, -0.3 * s);
      ctx.lineTo(0.22 * s, -0.03 * s);
      ctx.moveTo(0.27 * s, -0.3 * s);
      ctx.lineTo(0.31 * s, -0.03 * s);
      ctx.stroke();

      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(0.22 * s, -0.03 * s, 0.065 * s, 0, Math.PI * 2);
      ctx.arc(0.31 * s, -0.03 * s, 0.065 * s, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.moveTo(-0.18 * s, -0.24 * s - bounce);
      ctx.lineTo(-0.18 * s + legSwing, -0.03 * s - legLift * 0.5);
      ctx.moveTo(0.24 * s, -0.24 * s - bounce);
      ctx.lineTo(0.26 * s - legSwing, -0.03 * s - legLift);
      ctx.stroke();

      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.arc(-0.18 * s + legSwing, -0.03 * s - legLift * 0.5, 0.065 * s, 0, Math.PI * 2);
      ctx.arc(0.26 * s - legSwing, -0.03 * s - legLift, 0.065 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Red Collar & Golden Bell (Vòng cổ đỏ & chuông vàng lục lạc)
    const headDip = isSniffing ? Math.abs(Math.sin(this.elapsed * 8)) * 0.14 * s : 0;
    const headX = (isSitting ? 0.27 : 0.32) * s;
    const headY = (isSitting ? -0.64 : -0.6) * s - bounce + headDip;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = Math.max(2.5, 0.09 * s);
    ctx.beginPath();
    ctx.arc(headX - 0.08 * s, headY + 0.14 * s, 0.2 * s, 0.15 * Math.PI, 0.78 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(headX + 0.04 * s, headY + 0.27 * s, 0.065 * s, 0, Math.PI * 2);
    ctx.fill();

    // 6. 3D Head, Cheeks, Snout, Pink Tongue & Ears
    const headGrad = ctx.createRadialGradient(headX + 0.06 * s, headY - 0.08 * s, 0.04 * s, headX, headY, 0.3 * s);
    headGrad.addColorStop(0, '#fde047');
    headGrad.addColorStop(0.65, '#f59e0b');
    headGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(headX, headY, 0.27 * s, 0, Math.PI * 2);
    ctx.fill();

    // White cheek & snout mask
    ctx.fillStyle = '#fffbeb';
    ctx.beginPath();
    ctx.ellipse(headX + 0.14 * s, headY + 0.06 * s, 0.17 * s, 0.13 * s, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Cute pink panting tongue when happy/following
    const tongueBounce = Math.sin(this.elapsed * 12) * 0.02 * s;
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.ellipse(headX + 0.19 * s, headY + 0.15 * s + tongueBounce, 0.045 * s, 0.08 * s, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Perky / Floppy 3D Ears with subtle ear twitch
    const earTwitch = Math.sin(this.elapsed * 5.5) > 0.9 ? 0.12 : 0;
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.ellipse(headX - 0.1 * s, headY - 0.18 * s, 0.09 * s, 0.16 * s, -0.35 - earTwitch, 0, Math.PI * 2);
    ctx.ellipse(headX + 0.06 * s, headY - 0.22 * s, 0.08 * s, 0.15 * s, 0.25 + earTwitch, 0, Math.PI * 2);
    ctx.fill();

    // Shiny Eye (with natural blinking) & Nose
    const dogBlinking = (this.elapsed % 4.3) > 4.15;
    ctx.fillStyle = '#0f172a';
    if (dogBlinking) {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = Math.max(1.5, 0.045 * s);
      ctx.beginPath();
      ctx.moveTo(headX + 0.05 * s, headY - 0.05 * s);
      ctx.lineTo(headX + 0.15 * s, headY - 0.05 * s);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(headX + 0.1 * s, headY - 0.05 * s, 0.048 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX + 0.115 * s, headY - 0.065 * s, 0.018 * s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(headX + 0.27 * s, headY + 0.02 * s, 0.055 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // restore horizontal flip

    // Floating heart or water wave bubble
    if (isFollowing) {
      const heartY = -1.18 * s - bounce - Math.sin(this.elapsed * 4) * 0.08 * s;
      ctx.font = `${Math.max(10, Math.round(0.32 * s))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(isSwimming ? '💦' : (isSitting ? '🎵' : '💕'), 0, heartY);
    }

    const baseDogName = this.getCustomLabel('pet_dog', '🐕 Cậu Vàng');
    this._drawSmallTag(
      ctx,
      0,
      -0.95 * s - bounce,
      isSwimming ? `${baseDogName} (Đang bơi)` : baseDogName,
      'character',
      'pet_dog'
    );
    ctx.restore();
  }

  _drawCompanionCat(ctx, p) {
    const s = p.scale;
    const isSwimming = !!this.isCatSwimming;
    const isSitting = !isSwimming && (this.catBehavior === 'sit' || this.catBehavior === 'groom') && (this.catSpeed || 0) < 0.45;
    const isGrooming = !isSwimming && this.catBehavior === 'groom' && isSitting;
    const isRunning = !isSitting && ((this.catSpeed || 0) > 0.75 || this.playerState === 'walk' || isSwimming);
    const isFollowing = !!(this.petSettings && this.petSettings.catFollow);
    const runFreq = isSwimming ? 17 : (isRunning ? 13.5 : 7.5);
    const bounce = isSwimming
      ? Math.sin(this.elapsed * 7.8 + 0.9) * 0.07 * s
      : isSitting
        ? Math.sin(this.elapsed * 2.8) * 0.02 * s
        : Math.abs(Math.sin(this.elapsed * runFreq + 1.1)) * (isRunning ? 0.13 : 0.05) * s;
    const tailSway = Math.sin(this.elapsed * (isFollowing ? 10 : 4.5)) * 0.24 * s;
    const legSwing = isSitting ? 0 : Math.sin(this.elapsed * runFreq + 0.8) * (isRunning ? 0.2 : 0.07) * s;
    const dir = (this.catFacing || 1) >= 0 ? 1 : -1;

    ctx.save();
    ctx.translate(p.x, p.y + (isSwimming ? 0.15 * s : 0));

    if (isSwimming) {
      const ripple = 0.85 + Math.cos(this.elapsed * 9) * 0.18;
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.85)';
      ctx.lineWidth = Math.max(1.4, 0.065 * s);
      ctx.beginPath();
      ctx.ellipse(0, -0.06 * s, 0.58 * s * ripple, 0.22 * s * ripple, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, -0.06 * s, 0.82 * s * (2 - ripple), 0.3 * s * (2 - ripple), 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // 3D Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 0.48 * s, 0.19 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.scale(dir, 1);
    if (isSwimming) {
      ctx.rotate(-0.2);
    }

    // 1. Graceful S-Curved Wagging Tail (Held high above water when swimming)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(3.5, 0.12 * s);
    ctx.beginPath();
    ctx.moveTo(-0.32 * s, -0.28 * s - bounce);
    ctx.bezierCurveTo(
      -0.55 * s, -0.45 * s - bounce,
      -0.52 * s + tailSway * 0.6, -0.68 * s - bounce,
      -0.36 * s + tailSway, -0.82 * s - bounce
    );
    ctx.stroke();
    // Calico orange tip on tail
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.arc(-0.36 * s + tailSway, -0.82 * s - bounce, 0.065 * s, 0, Math.PI * 2);
    ctx.fill();

    // 2. 4 Dainty Animated Paws (Front paws paddling when swimming, raised paw when grooming)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = Math.max(2.8, 0.11 * s);
    ctx.beginPath();
    if (isSwimming) {
      const pad = Math.sin(this.elapsed * 17) * 0.14 * s;
      ctx.moveTo(0.15 * s, -0.24 * s - bounce);
      ctx.lineTo(0.34 * s + pad, -0.15 * s);
      ctx.moveTo(0.22 * s, -0.22 * s - bounce);
      ctx.lineTo(0.4 * s - pad, -0.12 * s);
      ctx.stroke();
    } else if (isSitting) {
      ctx.moveTo(-0.16 * s, -0.18 * s);
      ctx.lineTo(-0.08 * s, -0.03 * s);
      ctx.moveTo(0.14 * s, -0.24 * s);
      ctx.lineTo(0.18 * s, -0.03 * s);
      if (isGrooming) {
        const lickBob = Math.sin(this.elapsed * 9) * 0.05 * s;
        ctx.moveTo(0.22 * s, -0.28 * s);
        ctx.lineTo(0.36 * s, -0.44 * s + lickBob);
      } else {
        ctx.moveTo(0.22 * s, -0.24 * s);
        ctx.lineTo(0.26 * s, -0.03 * s);
      }
      ctx.stroke();
    } else {
      ctx.moveTo(-0.2 * s, -0.22 * s - bounce);
      ctx.lineTo(-0.22 * s - legSwing, -0.03 * s);
      ctx.moveTo(-0.12 * s, -0.22 * s - bounce);
      ctx.lineTo(-0.1 * s + legSwing, -0.03 * s);
      ctx.moveTo(0.14 * s, -0.22 * s - bounce);
      ctx.lineTo(0.14 * s + legSwing, -0.03 * s);
      ctx.moveTo(0.22 * s, -0.22 * s - bounce);
      ctx.lineTo(0.24 * s - legSwing, -0.03 * s);
      ctx.stroke();
    }

    // 3. 3D Shaded Cat Body with Calico Patches (Thân mèo tam thể / trắng tuyết 3D)
    const catTorsoY = (isSitting ? -0.26 : -0.3) * s - bounce;
    const bodyGrad = ctx.createRadialGradient(0.04 * s, catTorsoY - 0.05 * s, 0.04 * s, 0, catTorsoY, 0.42 * s);
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.75, '#f1f5f9');
    bodyGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, catTorsoY, 0.39 * s, 0.24 * s, isSitting ? -0.28 : 0, 0, Math.PI * 2);
    ctx.fill();

    // Cute ginger/calico spot on back
    ctx.fillStyle = 'rgba(251, 146, 60, 0.75)';
    ctx.beginPath();
    ctx.ellipse(-0.08 * s, catTorsoY - 0.1 * s, 0.15 * s, 0.09 * s, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Sky-blue ribbon collar & silver bell
    const headX = (isSitting ? 0.22 : 0.26) * s;
    const headY = (isSitting ? -0.56 : -0.53) * s - bounce;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = Math.max(2.2, 0.08 * s);
    ctx.beginPath();
    ctx.arc(headX - 0.06 * s, headY + 0.14 * s, 0.16 * s, 0.15 * Math.PI, 0.78 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(headX + 0.04 * s, headY + 0.25 * s, 0.055 * s, 0, Math.PI * 2);
    ctx.fill();

    // 4. 3D Cat Head, Pointed Ears, Emerald Eyes & Whiskers
    const headGrad = ctx.createRadialGradient(headX + 0.05 * s, headY - 0.06 * s, 0.03 * s, headX, headY, 0.25 * s);
    headGrad.addColorStop(0, '#ffffff');
    headGrad.addColorStop(0.8, '#e2e8f0');
    headGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(headX, headY, 0.23 * s, 0, Math.PI * 2);
    ctx.fill();

    // Outer ears
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(headX - 0.16 * s, headY - 0.12 * s);
    ctx.lineTo(headX - 0.08 * s, headY - 0.34 * s);
    ctx.lineTo(headX + 0.02 * s, headY - 0.16 * s);
    ctx.moveTo(headX + 0.02 * s, headY - 0.16 * s);
    ctx.lineTo(headX + 0.14 * s, headY - 0.34 * s);
    ctx.lineTo(headX + 0.19 * s, headY - 0.11 * s);
    ctx.fill();

    // Inner pink ears
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.moveTo(headX - 0.12 * s, headY - 0.14 * s);
    ctx.lineTo(headX - 0.07 * s, headY - 0.28 * s);
    ctx.lineTo(headX - 0.01 * s, headY - 0.16 * s);
    ctx.moveTo(headX + 0.05 * s, headY - 0.16 * s);
    ctx.lineTo(headX + 0.12 * s, headY - 0.28 * s);
    ctx.lineTo(headX + 0.15 * s, headY - 0.13 * s);
    ctx.fill();

    // Shiny emerald/amber eye (with slow cat blink) & pink nose
    const catBlinking = isGrooming || (this.elapsed % 4.8) > 4.62;
    if (catBlinking) {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = Math.max(1.4, 0.04 * s);
      ctx.beginPath();
      ctx.arc(headX + 0.09 * s, headY - 0.03 * s, 0.045 * s, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(headX + 0.09 * s, headY - 0.03 * s, 0.045 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(headX + 0.095 * s, headY - 0.03 * s, 0.018 * s, 0.038 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(headX + 0.2 * s, headY + 0.03 * s, 0.036 * s, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers (Ria mèo)
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.65)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(headX + 0.12 * s, headY + 0.05 * s);
    ctx.lineTo(headX + 0.28 * s, headY + 0.02 * s);
    ctx.moveTo(headX + 0.12 * s, headY + 0.08 * s);
    ctx.lineTo(headX + 0.27 * s, headY + 0.09 * s);
    ctx.stroke();

    ctx.restore(); // restore horizontal flip

    if (isFollowing) {
      const heartY = -1.08 * s - bounce - Math.cos(this.elapsed * 4.2) * 0.07 * s;
      ctx.font = `${Math.max(10, Math.round(0.3 * s))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(isSwimming ? '💦' : (isGrooming ? '✨' : '🐾'), 0, heartY);
    }

    const baseCatName = this.getCustomLabel('pet_cat', '🐈 Hoàng Thượng');
    this._drawSmallTag(
      ctx,
      0,
      -0.88 * s - bounce,
      isSwimming ? `${baseCatName} (Đang bơi)` : baseCatName,
      'character',
      'pet_cat'
    );
    ctx.restore();
  }

  _getWorldCostumeById(costumeId) {
    if (!costumeId || !window.GAME_DATA || !Array.isArray(window.GAME_DATA.worldCostumes)) return null;
    for (let i = 0; i < window.GAME_DATA.worldCostumes.length; i++) {
      if (window.GAME_DATA.worldCostumes[i].id === costumeId) {
        return window.GAME_DATA.worldCostumes[i];
      }
    }
    return null;
  }

  _drawCharacter(ctx, p) {
    const s = p.scale;
    const isWalk = this.playerState === 'walk';
    const age = this.playerConfig.age || 'youth';
    const gender = this.playerConfig.gender || 'male';
    const mood = this.playerConfig.mood || 'bored';
    const styleKey = this.playerConfig.style || 'default';
    const costumeId = this.playerConfig.costume || null;
    const worldCostume = this._getWorldCostumeById(costumeId);
    const stylePreset = (window.GAME_DATA && window.GAME_DATA.characterStyles && window.GAME_DATA.characterStyles[styleKey]) || null;

    // Outfit colors by Age & Gender (or overridden by selected Character Style OR World Traditional Costume!)
    const outfitPalettes = {
      youth: {
        male: { top: '#38bdf8', collar: '#0284c7', pants: '#1e293b', hatType: 'conical', hatColor: '#facc15', accent: '#bae6fd' },
        female: { top: '#f472b6', collar: '#db2777', pants: '#334155', hatType: 'conical', hatColor: '#facc15', accent: '#fbcfe8' },
        free: { top: '#a78bfa', collar: '#7c3aed', pants: '#1e293b', hatType: 'conical', hatColor: '#facc15', accent: '#ddd6fe' }
      },
      middle: {
        male: { top: '#0d9488', collar: '#115e59', pants: '#334155', hatType: 'conical', hatColor: '#facc15', accent: '#99f6e4' },
        female: { top: '#e11d48', collar: '#9f1239', pants: '#3f3f46', hatType: 'conical', hatColor: '#facc15', accent: '#fecdd3' },
        free: { top: '#6366f1', collar: '#4338ca', pants: '#334155', hatType: 'conical', hatColor: '#facc15', accent: '#c7d2fe' }
      },
      elder: {
        male: { top: '#78350f', collar: '#fde68a', pants: '#292524', hatType: 'conical', hatColor: '#facc15', accent: '#fef08a' },
        female: { top: '#92400e', collar: '#fef08a', pants: '#44403c', hatType: 'conical', hatColor: '#facc15', accent: '#fef08a' },
        free: { top: '#854d0e', collar: '#fef08a', pants: '#292524', hatType: 'conical', hatColor: '#facc15', accent: '#fef08a' }
      }
    };
    const agePal = outfitPalettes[age] || outfitPalettes.youth;
    const basePal = agePal[gender] || agePal.male;
    let pal = basePal;
    if (worldCostume) {
      pal = {
        top: worldCostume.top,
        collar: worldCostume.collar,
        pants: worldCostume.pants,
        hatType: worldCostume.hatType,
        hatColor: worldCostume.hatColor,
        accent: worldCostume.accent,
        pattern: worldCostume.pattern
      };
    } else if (stylePreset) {
      pal = {
        top: stylePreset.top || stylePreset.shirtColor || basePal.top,
        collar: stylePreset.collar || stylePreset.sleeveColor || basePal.collar,
        pants: stylePreset.pants || stylePreset.pantsColor || basePal.pants,
        hatType: stylePreset.hatType || basePal.hatType,
        hatColor: stylePreset.hatColor || stylePreset.capeColor || basePal.hatColor,
        accent: stylePreset.accent || basePal.accent,
        hairColor: stylePreset.hairColor || null
      };
    }

    // Automatic Swimming Pose ("Tư thế bơi qua sông") when in the river / water!
    if (this.isPlayerSwimming && !p.isPreview) {
      this._drawCharacterSwimming(ctx, p, s, pal, age, gender, mood, worldCostume);
      return;
    }

    // Age-specific posture & proportions
    const heightFactor = age === 'elder' ? 0.92 : (age === 'middle' ? 1.03 : 1.0);
    const torsoWidth = (age === 'middle' ? 1.06 : (age === 'elder' ? 0.98 : 0.94)) * s;
    const torsoHeight = 0.96 * heightFactor * s;
    const walkFreq = age === 'elder' ? 8.5 : 11.5;
    const stridePhase = isWalk ? (this.walkCyclePhase || this.elapsed * walkFreq) : 0;
    const bounce = isWalk
      ? Math.abs(Math.sin(stridePhase)) * 0.19 * s
      : Math.sin(this.elapsed * 2.4) * 0.045 * s;

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 0.74 * s, 0.3 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. 2-Segment Articulated Legs (Hip -> Knee -> Ankle) & Shoes with Natural Knee Flexion
    const legTopY = p.y - 0.56 * heightFactor * s - bounce;
    const legSwing = isWalk ? Math.sin(stridePhase) * 0.27 * s : 0;
    const leftLift = isWalk ? Math.max(0, Math.cos(stridePhase)) * 0.13 * s : 0;
    const rightLift = isWalk ? Math.max(0, -Math.cos(stridePhase)) * 0.13 * s : 0;
    const strideDir = Math.sin(this.smoothFacing || this.playerFacing || 0) >= 0 ? 1 : -1;

    const leftHipX = p.x - 0.23 * s;
    const rightHipX = p.x + 0.23 * s;
    const leftAnkleX = leftHipX - legSwing;
    const leftAnkleY = p.y - 0.06 * s - leftLift;
    const rightAnkleX = rightHipX + legSwing;
    const rightAnkleY = p.y - 0.06 * s - rightLift;

    const leftKneeX = (leftHipX + leftAnkleX) * 0.5 + strideDir * leftLift * 0.65;
    const leftKneeY = (legTopY + leftAnkleY) * 0.5 - leftLift * 0.25;
    const rightKneeX = (rightHipX + rightAnkleX) * 0.5 + strideDir * rightLift * 0.65;
    const rightKneeY = (legTopY + rightAnkleY) * 0.5 - rightLift * 0.25;

    // Optional Woodland Cloak back cape for 'wanderer' style
    const torsoTopY = legTopY - torsoHeight;
    if (!worldCostume && styleKey === 'wanderer') {
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.moveTo(p.x - torsoWidth * 0.62, torsoTopY + 0.1 * s);
      ctx.lineTo(p.x + torsoWidth * 0.62, torsoTopY + 0.1 * s);
      ctx.lineTo(p.x + torsoWidth * 0.85, legTopY + 0.25 * s);
      ctx.lineTo(p.x - torsoWidth * 0.85, legTopY + 0.25 * s);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = pal.pants;
    ctx.lineWidth = Math.max(4.5, 0.23 * s);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(leftHipX, legTopY);
    ctx.lineTo(leftKneeX, leftKneeY);
    ctx.lineTo(leftAnkleX, leftAnkleY);
    ctx.moveTo(rightHipX, legTopY);
    ctx.lineTo(rightKneeX, rightKneeY);
    ctx.lineTo(rightAnkleX, rightAnkleY);
    ctx.stroke();

    // Cute Shoes / Wooden Clogs (Golden Klompen for Netherlands!) with subtle toe tilt when lifting
    ctx.fillStyle = (worldCostume && worldCostume.id === 'costume_netherlands')
      ? '#eab308'
      : (age === 'elder' ? '#78350f' : '#0f172a');
    ctx.beginPath();
    ctx.ellipse(leftAnkleX, leftAnkleY + 0.03 * s, 0.16 * s, 0.09 * s, -legSwing / (1.8 * s), 0, Math.PI * 2);
    ctx.ellipse(rightAnkleX, rightAnkleY + 0.03 * s, 0.16 * s, 0.09 * s, legSwing / (1.8 * s), 0, Math.PI * 2);
    ctx.fill();

    // 2. Youth Backpack (when default or farmer style and not wearing World Costume)
    if (!worldCostume && age === 'youth' && (styleKey === 'default' || styleKey === 'farmer')) {
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(p.x - torsoWidth * 0.62, torsoTopY + 0.08 * s, torsoWidth * 1.24, torsoHeight * 0.78, 6)
        : ctx.rect(p.x - torsoWidth * 0.62, torsoTopY + 0.08 * s, torsoWidth * 1.24, torsoHeight * 0.78);
      ctx.fill();
    }

    // 3. Torso / Shirt
    ctx.fillStyle = pal.top;
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(p.x - torsoWidth * 0.5, torsoTopY, torsoWidth, torsoHeight, 9)
      : ctx.rect(p.x - torsoWidth * 0.5, torsoTopY, torsoWidth, torsoHeight);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // World Traditional Costume Pattern OR Style-specific Outfit Details
    if (worldCostume) {
      this._drawWorldCostumeDetails(ctx, p.x, torsoTopY, legTopY, torsoWidth, torsoHeight, s, worldCostume);
    } else if (styleKey === 'scholar') {
      // Áo Dài flowing front tunic flap & golden silk sash
      ctx.fillStyle = pal.top;
      ctx.beginPath();
      ctx.moveTo(p.x - torsoWidth * 0.44, legTopY - 0.05 * s);
      ctx.lineTo(p.x + torsoWidth * 0.44, legTopY - 0.05 * s);
      ctx.lineTo(p.x + torsoWidth * 0.52, legTopY + 0.34 * s);
      ctx.lineTo(p.x - torsoWidth * 0.52, legTopY + 0.34 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = pal.collar;
      ctx.lineWidth = Math.max(2, 0.07 * s);
      ctx.beginPath();
      ctx.moveTo(p.x - torsoWidth * 0.25, torsoTopY + 0.05 * s);
      ctx.lineTo(p.x + torsoWidth * 0.28, torsoTopY + 0.45 * s);
      ctx.stroke();
    } else if (styleKey === 'farmer') {
      // Denim overalls straps & bib pocket (Yếm bò nông trại)
      ctx.fillStyle = pal.collar;
      ctx.fillRect(p.x - torsoWidth * 0.36, torsoTopY + 0.28 * s, torsoWidth * 0.72, torsoHeight * 0.72);
      ctx.fillRect(p.x - torsoWidth * 0.34, torsoTopY, torsoWidth * 0.14, 0.32 * s);
      ctx.fillRect(p.x + torsoWidth * 0.2, torsoTopY, torsoWidth * 0.14, 0.32 * s);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(p.x - torsoWidth * 0.27, torsoTopY + 0.3 * s, 0.05 * s, 0, Math.PI * 2);
      ctx.arc(p.x + torsoWidth * 0.27, torsoTopY + 0.3 * s, 0.05 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (styleKey === 'artist') {
      // Cozy knitted scarf with hanging tail
      ctx.fillStyle = pal.collar;
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(p.x - torsoWidth * 0.48, torsoTopY - 0.04 * s, torsoWidth * 0.96, 0.22 * s, 5)
        : ctx.rect(p.x - torsoWidth * 0.48, torsoTopY - 0.04 * s, torsoWidth * 0.96, 0.22 * s);
      ctx.fill();
      ctx.fillRect(p.x + 0.1 * s, torsoTopY + 0.12 * s, 0.18 * s, 0.42 * s);
    } else if (styleKey === 'zen_robe') {
      // Crossed meditation robe collar & golden sash
      ctx.strokeStyle = pal.collar;
      ctx.lineWidth = Math.max(2.5, 0.09 * s);
      ctx.beginPath();
      ctx.moveTo(p.x - 0.26 * s, torsoTopY + 0.02 * s);
      ctx.lineTo(p.x + 0.12 * s, torsoTopY + 0.55 * s);
      ctx.moveTo(p.x + 0.26 * s, torsoTopY + 0.02 * s);
      ctx.lineTo(p.x, torsoTopY + 0.36 * s);
      ctx.stroke();
    } else if (age === 'middle') {
      ctx.fillStyle = pal.collar;
      ctx.beginPath();
      ctx.moveTo(p.x - 0.22 * s, torsoTopY);
      ctx.lineTo(p.x, torsoTopY + 0.25 * s);
      ctx.lineTo(p.x + 0.22 * s, torsoTopY);
      ctx.closePath();
      ctx.fill();
    } else if (age === 'elder') {
      ctx.strokeStyle = pal.collar;
      ctx.lineWidth = Math.max(2, 0.07 * s);
      ctx.beginPath();
      ctx.moveTo(p.x, torsoTopY + 0.05 * s);
      ctx.lineTo(p.x, torsoTopY + torsoHeight - 0.05 * s);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x - 0.1 * s, torsoTopY + 0.08 * s);
      ctx.lineTo(p.x - 0.1 * s, torsoTopY + 0.32 * s);
      ctx.moveTo(p.x + 0.1 * s, torsoTopY + 0.08 * s);
      ctx.lineTo(p.x + 0.1 * s, torsoTopY + 0.32 * s);
      ctx.stroke();
    }

    // 4. Natural Articulated Arms, Sleeves & Hands
    this._drawNaturalArmsAndHands(ctx, p, s, torsoTopY, torsoWidth, bounce, walkFreq, pal.top, age);

    // 5. Neck & Head
    const headY = torsoTopY - 0.52 * s;
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(p.x - 0.14 * s, torsoTopY - 0.12 * s, 0.28 * s, 0.18 * s);

    // Ears
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(p.x - 0.58 * s, headY + 0.02 * s, 0.13 * s, 0, Math.PI * 2);
    ctx.arc(p.x + 0.58 * s, headY + 0.02 * s, 0.13 * s, 0, Math.PI * 2);
    ctx.fill();

    // Head Circle with subtle 3D radial shading
    const skinGrad = ctx.createRadialGradient(p.x - 0.15 * s, headY - 0.18 * s, 0.08 * s, p.x, headY, 0.6 * s);
    skinGrad.addColorStop(0, '#fef08a');
    skinGrad.addColorStop(0.75, '#fde68a');
    skinGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = skinGrad;
    ctx.beginPath();
    ctx.arc(p.x, headY, 0.58 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 6. Hair & Age Features
    this._drawHairAndAgeDetails(ctx, p.x, headY, s, age, gender, pal.hairColor);

    // 7. Dynamic Mood Facial Expression
    this._drawFaceExpression(ctx, p.x, headY, s, mood, age);

    // 8. Style-Specific or World Traditional Headwear
    this._drawCharacterHeadwear(ctx, p.x, headY, s, pal);

    // 9. Overhead Player Name Tag (Can be toggled or renamed via labelSettings)
    if (!p.isPreview) {
      const defaultPlayerTag = worldCostume
        ? `${worldCostume.flag} ${this.playerConfig.name || 'Lữ Khách'}`
        : `👤 ${this.playerConfig.name || 'Lữ Khách'}`;
      this._drawSmallTag(ctx, p.x, headY - 1.16 * s, defaultPlayerTag, 'character', 'player');
      this._drawActiveJobSimulationProp(ctx, p, s, bounce);
    }
  }

  _drawCharacterSwimming(ctx, p, s, pal, age, gender, mood, worldCostume) {
    const swimBob = Math.sin(this.elapsed * 7.5) * 0.11 * s;
    const strokePhase = this.elapsed * 9.0;
    const swimDir = Math.sin(this.playerFacing || 0) >= 0 ? 1 : -1;
    const cx = p.x;
    const cy = p.y + 0.08 * s + swimBob;

    ctx.save();

    // 1. Expanding Water Ripples & Foam Wake around Swimming Character
    const rPulse = 0.85 + Math.sin(this.elapsed * 8) * 0.18;
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.9)';
    ctx.lineWidth = Math.max(2, 0.09 * s);
    ctx.beginPath();
    ctx.ellipse(cx, p.y, 1.25 * s * rPulse, 0.44 * s * rPulse, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = Math.max(1.5, 0.06 * s);
    ctx.beginPath();
    ctx.ellipse(cx, p.y, 1.65 * s * (2 - rPulse), 0.58 * s * (2 - rPulse), 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Fluttering Swimming Legs Kicking Water Behind Torso
    const kick1 = Math.sin(this.elapsed * 15) * 0.18 * s;
    const kick2 = Math.cos(this.elapsed * 15) * 0.18 * s;
    ctx.strokeStyle = pal.pants || '#1e293b';
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(4, 0.2 * s);
    ctx.beginPath();
    ctx.moveTo(cx - swimDir * 0.35 * s, cy - 0.12 * s);
    ctx.lineTo(cx - swimDir * 0.95 * s, cy - 0.08 * s + kick1);
    ctx.moveTo(cx - swimDir * 0.35 * s, cy - 0.04 * s);
    ctx.lineTo(cx - swimDir * 0.92 * s, cy + 0.04 * s + kick2);
    ctx.stroke();

    // White water splash droplets from kicking feet
    ctx.fillStyle = 'rgba(240, 249, 255, 0.92)';
    ctx.beginPath();
    ctx.arc(cx - swimDir * 1.05 * s, cy - 0.12 * s + kick1, 0.09 * s, 0, Math.PI * 2);
    ctx.arc(cx - swimDir * 1.12 * s, cy + 0.05 * s + kick2, 0.07 * s, 0, Math.PI * 2);
    ctx.fill();

    // 3. Horizontal Tilted Swimming Torso (Breaststroke / Freestyle posture)
    ctx.fillStyle = pal.top || '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(cx - swimDir * 0.12 * s, cy - 0.22 * s, 0.56 * s, 0.32 * s, swimDir * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = pal.collar || '#fde047';
    ctx.lineWidth = Math.max(2, 0.08 * s);
    ctx.stroke();

    // 4. Breaststroke / Freestyle Swimming Arms sweeping water on both sides
    const leftArmReachX = cx + swimDir * (0.42 + Math.sin(strokePhase) * 0.36) * s;
    const leftArmReachY = cy - (0.28 + Math.cos(strokePhase) * 0.14) * s;
    const rightArmReachX = cx + swimDir * (0.42 - Math.sin(strokePhase) * 0.36) * s;
    const rightArmReachY = cy - (0.14 - Math.cos(strokePhase) * 0.14) * s;

    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = Math.max(3.8, 0.18 * s);
    ctx.beginPath();
    ctx.moveTo(cx + swimDir * 0.12 * s, cy - 0.32 * s);
    ctx.lineTo(leftArmReachX, leftArmReachY);
    ctx.moveTo(cx + swimDir * 0.12 * s, cy - 0.18 * s);
    ctx.lineTo(rightArmReachX, rightArmReachY);
    ctx.stroke();

    // Hands & Water Splashes at hands
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(leftArmReachX, leftArmReachY, 0.11 * s, 0, Math.PI * 2);
    ctx.arc(rightArmReachX, rightArmReachY, 0.11 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
    ctx.beginPath();
    ctx.arc(leftArmReachX + swimDir * 0.12 * s, leftArmReachY + 0.04 * s, 0.06 * s, 0, Math.PI * 2);
    ctx.arc(rightArmReachX + swimDir * 0.12 * s, rightArmReachY + 0.04 * s, 0.06 * s, 0, Math.PI * 2);
    ctx.fill();

    // 5. Head Held Above the River Surface
    const headX = cx + swimDir * 0.22 * s;
    const headY = cy - 0.74 * s;

    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(headX - 0.55 * s, headY + 0.02 * s, 0.12 * s, 0, Math.PI * 2);
    ctx.arc(headX + 0.55 * s, headY + 0.02 * s, 0.12 * s, 0, Math.PI * 2);
    ctx.fill();

    const skinGrad = ctx.createRadialGradient(headX - 0.14 * s, headY - 0.16 * s, 0.08 * s, headX, headY, 0.56 * s);
    skinGrad.addColorStop(0, '#fef08a');
    skinGrad.addColorStop(0.75, '#fde68a');
    skinGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = skinGrad;
    ctx.beginPath();
    ctx.arc(headX, headY, 0.55 * s, 0, Math.PI * 2);
    ctx.fill();

    this._drawHairAndAgeDetails(ctx, headX, headY, s * 0.95, age, gender, pal.hairColor);
    this._drawFaceExpression(ctx, headX, headY, s * 0.95, mood, age);
    this._drawCharacterHeadwear(ctx, headX, headY, s * 0.95, pal);

    // Floating status tag
    const swimTag = worldCostume
      ? `🏊 ${worldCostume.flag} Đang bơi qua sông...`
      : '🏊 Đang bơi qua sông...';
    this._drawSmallTag(ctx, headX, headY - 1.15 * s, swimTag, 'character', 'player');

    ctx.restore();
  }

  _drawWorldCostumeDetails(ctx, cx, torsoTopY, legTopY, torsoWidth, torsoHeight, s, costume) {
    const pat = costume.pattern || '';
    ctx.save();

    if (pat === 'vn_lotus') {
      // Áo Dài Ngũ Thân Hoàng Kim: Long flowing tunic panels + crimson collar & golden lotus emblem
      ctx.fillStyle = costume.top;
      ctx.beginPath();
      ctx.moveTo(cx - torsoWidth * 0.46, legTopY - 0.06 * s);
      ctx.lineTo(cx + torsoWidth * 0.46, legTopY - 0.06 * s);
      ctx.lineTo(cx + torsoWidth * 0.56, legTopY + 0.38 * s);
      ctx.lineTo(cx - torsoWidth * 0.56, legTopY + 0.38 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = costume.collar;
      ctx.fillRect(cx - torsoWidth * 0.24, torsoTopY, torsoWidth * 0.48, 0.16 * s);
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx, torsoTopY + torsoHeight * 0.48, 0.14 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (pat === 'jp_obi') {
      // Kimono: Crossed Y-collar + Wide golden brocade Obi belt + long kimono skirt
      ctx.fillStyle = costume.top;
      ctx.fillRect(cx - torsoWidth * 0.46, legTopY - 0.05 * s, torsoWidth * 0.92, 0.36 * s);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2.5, 0.09 * s);
      ctx.beginPath();
      ctx.moveTo(cx - 0.24 * s, torsoTopY + 0.02 * s);
      ctx.lineTo(cx + 0.1 * s, torsoTopY + 0.48 * s);
      ctx.moveTo(cx + 0.24 * s, torsoTopY + 0.02 * s);
      ctx.lineTo(cx, torsoTopY + 0.32 * s);
      ctx.stroke();
      ctx.fillStyle = costume.accent;
      ctx.fillRect(cx - torsoWidth * 0.52, torsoTopY + torsoHeight * 0.52, torsoWidth * 1.04, 0.26 * s);
    } else if (pat === 'kr_hanbok') {
      // Hanbok: High waisted pink Chima skirt + white/red Y-collar & Goreum ribbon bow
      ctx.fillStyle = costume.pants;
      ctx.beginPath();
      ctx.moveTo(cx - torsoWidth * 0.48, torsoTopY + torsoHeight * 0.38);
      ctx.lineTo(cx + torsoWidth * 0.48, torsoTopY + torsoHeight * 0.38);
      ctx.lineTo(cx + torsoWidth * 0.68, legTopY + 0.38 * s);
      ctx.lineTo(cx - torsoWidth * 0.68, legTopY + 0.38 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = costume.collar;
      ctx.lineWidth = Math.max(2.5, 0.09 * s);
      ctx.beginPath();
      ctx.moveTo(cx, torsoTopY + torsoHeight * 0.38);
      ctx.lineTo(cx + 0.22 * s, torsoTopY + torsoHeight * 0.78);
      ctx.stroke();
    } else if (pat === 'cn_hanfu') {
      // Hanfu: Flowing emerald robes, crossed golden collar & jade pendant waist sash
      ctx.fillStyle = costume.accent;
      ctx.fillRect(cx - torsoWidth * 0.48, legTopY - 0.05 * s, torsoWidth * 0.96, 0.38 * s);
      ctx.strokeStyle = costume.collar;
      ctx.lineWidth = Math.max(2.5, 0.09 * s);
      ctx.beginPath();
      ctx.moveTo(cx - 0.26 * s, torsoTopY + 0.02 * s);
      ctx.lineTo(cx + 0.2 * s, torsoTopY + 0.55 * s);
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.fillRect(cx - torsoWidth * 0.5, torsoTopY + torsoHeight * 0.56, torsoWidth, 0.14 * s);
    } else if (pat === 'in_sari' || pat === 'th_sabai') {
      // Diagonal golden silk Sari / Sabai drape across chest
      ctx.fillStyle = costume.collar;
      ctx.beginPath();
      ctx.moveTo(cx - torsoWidth * 0.48, torsoTopY);
      ctx.lineTo(cx - torsoWidth * 0.12, torsoTopY);
      ctx.lineTo(cx + torsoWidth * 0.48, legTopY + 0.28 * s);
      ctx.lineTo(cx + torsoWidth * 0.12, legTopY + 0.28 * s);
      ctx.closePath();
      ctx.fill();
    } else if (pat === 'sc_tartan') {
      // Scottish Tartan Kilt & Sporran pouch + diagonal plaid sash
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - torsoWidth * 0.54, legTopY - 0.1 * s, torsoWidth * 1.08, 0.36 * s);
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - torsoWidth * 0.5, legTopY + 0.08 * s);
      ctx.lineTo(cx + torsoWidth * 0.5, legTopY + 0.08 * s);
      ctx.stroke();
      // Sporran leather pouch
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(cx, legTopY + 0.1 * s, 0.13 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (pat === 'es_flamenco') {
      // Layered red & black Flamenco ruffles
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.moveTo(cx - torsoWidth * 0.48, legTopY - 0.08 * s);
      ctx.lineTo(cx + torsoWidth * 0.48, legTopY - 0.08 * s);
      ctx.lineTo(cx + torsoWidth * 0.68, legTopY + 0.38 * s);
      ctx.lineTo(cx - torsoWidth * 0.68, legTopY + 0.38 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = Math.max(2, 0.08 * s);
      ctx.beginPath();
      ctx.moveTo(cx - torsoWidth * 0.55, legTopY + 0.12 * s);
      ctx.lineTo(cx + torsoWidth * 0.55, legTopY + 0.12 * s);
      ctx.moveTo(cx - torsoWidth * 0.64, legTopY + 0.28 * s);
      ctx.lineTo(cx + torsoWidth * 0.64, legTopY + 0.28 * s);
      ctx.stroke();
    } else if (pat === 'eg_usekh') {
      // Egyptian Golden Usekh Collar & Turquoise Royal Belt
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(cx, torsoTopY + 0.05 * s, torsoWidth * 0.46, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(cx - torsoWidth * 0.48, legTopY - 0.12 * s, torsoWidth * 0.96, 0.16 * s);
      ctx.fillRect(cx - 0.1 * s, legTopY - 0.12 * s, 0.2 * s, 0.42 * s);
    } else {
      // Ornate festive embroidery / royal sash for Bavaria, Netherlands, Russia, Mexico, Native America, Greece, Africa
      ctx.fillStyle = costume.collar;
      ctx.fillRect(cx - torsoWidth * 0.48, torsoTopY, torsoWidth * 0.96, 0.22 * s);
      ctx.fillStyle = costume.accent;
      ctx.fillRect(cx - 0.12 * s, torsoTopY, 0.24 * s, torsoHeight);
    }

    ctx.restore();
  }

  _drawNaturalArmsAndHands(ctx, p, s, torsoTopY, torsoWidth, bounce, walkFreq, sleeveColor, age) {
    const shoulderY = torsoTopY + 0.16 * s;
    const leftShoulderX = p.x - torsoWidth * 0.52;
    const rightShoulderX = p.x + torsoWidth * 0.52;

    // Compute natural joint angles depending on state & mood
    let leftUpperAngle = 0.18;
    let leftForeAngle = 0.28;
    let rightUpperAngle = -0.18;
    let rightForeAngle = -0.28;

    if (this.playerState === 'walk') {
      const sw = Math.sin(this.elapsed * walkFreq) * 0.52;
      leftUpperAngle = 0.15 + sw;
      leftForeAngle = 0.35 + sw * 0.6;
      rightUpperAngle = -0.15 - sw;
      rightForeAngle = -0.35 - sw * 0.6;
    } else if (this.playerState === 'work') {
      const chop = Math.sin(this.elapsed * 15) * 0.85;
      leftUpperAngle = 0.25;
      leftForeAngle = 0.45;
      rightUpperAngle = -0.75 + chop;
      rightForeAngle = -0.95 + chop * 1.1;
    } else if (this.playerState === 'garden') {
      leftUpperAngle = 0.25;
      leftForeAngle = 0.4;
      rightUpperAngle = -0.55 + Math.sin(this.elapsed * 5) * 0.12;
      rightForeAngle = -0.75;
    } else if (this.playerState === 'fish') {
      leftUpperAngle = -0.35;
      leftForeAngle = -0.55;
      rightUpperAngle = 0.45;
      rightForeAngle = 0.75 + Math.sin(this.elapsed * 4) * 0.08;
    } else if (this.playerState === 'pray' || this.playerConfig.mood === 'zen') {
      // Hands clasped together in front of chest in serene meditation/prayer
      leftUpperAngle = -0.25;
      leftForeAngle = -1.15;
      rightUpperAngle = 0.25;
      rightForeAngle = 1.15;
    } else if (this.playerConfig.mood === 'funny') {
      // One hand waving cheerfully
      leftUpperAngle = 0.2;
      leftForeAngle = 0.35;
      rightUpperAngle = -1.35 + Math.sin(this.elapsed * 7) * 0.25;
      rightForeAngle = -1.65 + Math.sin(this.elapsed * 7) * 0.35;
    } else {
      // Gentle natural breathing sway
      const breath = Math.sin(this.elapsed * 2.2) * 0.06;
      leftUpperAngle = 0.18 + breath;
      leftForeAngle = 0.28 + breath;
      rightUpperAngle = -0.18 - breath;
      rightForeAngle = -0.28 - breath;
    }

    const upperLen = 0.38 * s;
    const foreLen = 0.36 * s;

    // Helper to draw a complete 2-segment arm with sleeve, forearm, palm & thumb
    const drawArmSide = (sx, sy, uAngle, fAngle, isLeft) => {
      const elbowX = sx - Math.sin(uAngle) * upperLen;
      const elbowY = sy + Math.cos(uAngle) * upperLen;
      const handX = elbowX - Math.sin(fAngle) * foreLen;
      const handY = elbowY + Math.cos(fAngle) * foreLen;

      // Upper arm sleeve
      ctx.strokeStyle = sleeveColor;
      ctx.lineWidth = Math.max(4.5, 0.23 * s);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(elbowX, elbowY);
      ctx.stroke();

      // Forearm skin
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = Math.max(3.8, 0.18 * s);
      ctx.beginPath();
      ctx.moveTo(elbowX, elbowY);
      ctx.lineTo(handX, handY);
      ctx.stroke();

      // Natural Palm + Thumb
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(handX, handY, Math.max(2.8, 0.12 * s), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Thumb nub
      const thumbDir = isLeft ? 1 : -1;
      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.arc(handX + thumbDir * 0.07 * s, handY - 0.03 * s, Math.max(1.5, 0.055 * s), 0, Math.PI * 2);
      ctx.fill();

      return { handX, handY };
    };

    const leftHand = drawArmSide(leftShoulderX, shoulderY, leftUpperAngle, leftForeAngle, true);
    const rightHand = drawArmSide(rightShoulderX, shoulderY, rightUpperAngle, rightForeAngle, false);

    // Store hand positions for active job props or elder walking cane
    this.lastHands = { left: leftHand, right: rightHand };

    // If Elder (55+) in idle/walk state: Draw a rustic bamboo walking stick in left hand!
    if (age === 'elder' && (this.playerState === 'idle' || this.playerState === 'walk')) {
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = Math.max(2.5, 0.1 * s);
      ctx.beginPath();
      ctx.moveTo(leftHand.handX, leftHand.handY - 0.12 * s);
      ctx.lineTo(leftHand.handX - 0.12 * s, p.y);
      ctx.stroke();
    }
  }

  _drawCharacterHeadwear(ctx, cx, headY, s, pal) {
    const hatType = pal.hatType || 'conical';
    const hatColor = pal.hatColor || '#facc15';

    if (hatType === 'flower_crown') {
      // Full hair top + Romantic flower & pearl headband (Thư Sinh / Nàng Thơ Áo Dài)
      ctx.strokeStyle = hatColor;
      ctx.lineWidth = Math.max(3, 0.11 * s);
      ctx.beginPath();
      ctx.arc(cx, headY - 0.05 * s, 0.56 * s, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
      const flowerOffsets = [-0.36, -0.18, 0, 0.18, 0.36];
      flowerOffsets.forEach((ox, idx) => {
        ctx.fillStyle = idx % 2 === 0 ? '#f472b6' : '#fef08a';
        ctx.beginPath();
        ctx.arc(cx + ox * s, headY - (0.56 - Math.abs(ox) * 0.35) * s, 0.095 * s, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (hatType === 'straw_brim' || hatType === 'straw_daisy') {
      // Wide-brim Golden Straw Sun Hat with a white daisy (Nông Dân Mũ Cói Hoa Cúc)
      ctx.fillStyle = hatColor;
      ctx.beginPath();
      ctx.ellipse(cx, headY - 0.38 * s, 0.92 * s, 0.22 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      // Hat dome
      ctx.beginPath();
      ctx.arc(cx, headY - 0.42 * s, 0.52 * s, Math.PI, 0);
      ctx.fill();
      // Red ribbon & daisy flower
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = Math.max(2.5, 0.08 * s);
      ctx.beginPath();
      ctx.moveTo(cx - 0.5 * s, headY - 0.42 * s);
      ctx.lineTo(cx + 0.5 * s, headY - 0.42 * s);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + 0.34 * s, headY - 0.5 * s, 0.12 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(cx + 0.34 * s, headY - 0.5 * s, 0.055 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatType === 'beret') {
      // Tilted Painter's Beret (Hoạ Sĩ Mộng Mơ Đồi Thông)
      ctx.fillStyle = hatColor;
      ctx.beginPath();
      ctx.ellipse(cx - 0.08 * s, headY - 0.52 * s, 0.64 * s, 0.25 * s, -0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.22)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Beret stem
      ctx.beginPath();
      ctx.moveTo(cx - 0.12 * s, headY - 0.74 * s);
      ctx.lineTo(cx - 0.18 * s, headY - 0.88 * s);
      ctx.stroke();
    } else if (hatType === 'leaf_hood' || hatType === 'sprout') {
      // Woodland Hood rim + cute lucky green sprout on top (Lữ Khách Rừng Xanh)
      ctx.strokeStyle = hatColor;
      ctx.lineWidth = Math.max(3.5, 0.13 * s);
      ctx.beginPath();
      ctx.arc(cx, headY - 0.04 * s, 0.59 * s, 1.08 * Math.PI, 1.92 * Math.PI);
      ctx.stroke();
      // Sprout stem & 2 leaves
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = Math.max(2, 0.07 * s);
      ctx.beginPath();
      ctx.moveTo(cx, headY - 0.62 * s);
      ctx.lineTo(cx, headY - 0.96 * s);
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.ellipse(cx - 0.14 * s, headY - 0.96 * s, 0.14 * s, 0.07 * s, -0.4, 0, Math.PI * 2);
      ctx.ellipse(cx + 0.14 * s, headY - 0.96 * s, 0.14 * s, 0.07 * s, 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatType === 'lotus_hat') {
      // Golden Bamboo Meditation Hat with glowing pearl (Hiền Giả Trà Đạo)
      ctx.fillStyle = hatColor;
      ctx.beginPath();
      ctx.moveTo(cx - 0.98 * s, headY - 0.32 * s);
      ctx.quadraticCurveTo(cx, headY - 1.12 * s, cx + 0.98 * s, headY - 0.32 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx, headY - 0.78 * s, 0.09 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatType === 'vn_khandong') {
      // 🇻🇳 Việt Nam: Khăn Đóng Xếp Lớp Hoàng Kim & Ngọc Minh Châu
      for (let tier = 0; tier < 3; tier++) {
        const w = (0.58 - tier * 0.05) * s;
        const y = headY - (0.38 + tier * 0.11) * s;
        ctx.fillStyle = tier % 2 === 0 ? '#dc2626' : '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(cx, y, w, 0.12 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
      // Front V-fold & jade jewel
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(cx, headY - 0.42 * s, 0.09 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (hatType === 'jp_kanzashi') {
      // 🇯🇵 Nhật Bản: Búi tóc Kimono & Trâm cài hoa Anh Đào Kanzashi rủ tua rua
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.ellipse(cx, headY - 0.56 * s, 0.34 * s, 0.22 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Gold hairpin stick
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 0.52 * s, headY - 0.62 * s);
      ctx.lineTo(cx + 0.54 * s, headY - 0.48 * s);
      ctx.stroke();
      // Sakura flower cluster & dangling tassels on right
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(cx + 0.42 * s, headY - 0.46 * s, 0.14 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx + 0.42 * s, headY - 0.46 * s, 0.05 * s, 0, Math.PI * 2);
      ctx.fill();
      // Dangling sakura petals chains
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx + 0.4 * s, headY - 0.34 * s);
      ctx.lineTo(cx + 0.38 * s, headY - 0.04 * s);
      ctx.moveTo(cx + 0.47 * s, headY - 0.34 * s);
      ctx.lineTo(cx + 0.49 * s, headY - 0.08 * s);
      ctx.stroke();
    } else if (hatType === 'kr_gat') {
      // 🇰🇷 Hàn Quốc: Mũ Gat Hoàng Gia & Dải Ngọc Hổ Phách
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.ellipse(cx, headY - 0.42 * s, 0.98 * s, 0.19 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Cylindrical crown
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(cx - 0.34 * s, headY - 0.88 * s, 0.68 * s, 0.46 * s);
      ctx.beginPath();
      ctx.ellipse(cx, headY - 0.88 * s, 0.34 * s, 0.09 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Gold & jade band + amber bead chain
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 0.34 * s, headY - 0.46 * s);
      ctx.lineTo(cx + 0.34 * s, headY - 0.46 * s);
      ctx.stroke();
    } else if (hatType === 'cn_hairpin') {
      // 🇨🇳 Trung Hoa: Mão Ngọc & Trâm Phượng Hoàng Vàng (Buyao)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(cx, headY - 0.58 * s, 0.36 * s, 0.24 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Golden phoenix crown center
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(cx - 0.34 * s, headY - 0.48 * s);
      ctx.lineTo(cx, headY - 0.86 * s);
      ctx.lineTo(cx + 0.34 * s, headY - 0.48 * s);
      ctx.closePath();
      ctx.fill();
      // Jade stone + dangling pearl strings
      ctx.fillStyle = '#14b8a6';
      ctx.beginPath();
      ctx.arc(cx, headY - 0.6 * s, 0.09 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx - 0.36 * s, headY - 0.46 * s);
      ctx.lineTo(cx - 0.36 * s, headY - 0.12 * s);
      ctx.moveTo(cx + 0.36 * s, headY - 0.46 * s);
      ctx.lineTo(cx + 0.36 * s, headY - 0.12 * s);
      ctx.stroke();
    } else if (hatType === 'in_tikka') {
      // 🇮🇳 Ấn Độ: Khăn Voan Sari Đỏ Viền Vàng, Trang Sức Trán Maang Tikka & Bindi Đỏ
      ctx.fillStyle = 'rgba(185, 28, 28, 0.88)';
      ctx.beginPath();
      ctx.arc(cx, headY - 0.06 * s, 0.59 * s, 1.05 * Math.PI, 1.95 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Gold Maang Tikka chain & forehead pendant + red Bindi
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, headY - 0.38 * s, 0.085 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, headY - 0.19 * s, 0.055 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatType === 'th_chada') {
      // 🇹🇭 Thái Lan: Vương Miện Tháp Vàng Chada Hoàng Gia
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(cx - 0.44 * s, headY - 0.34 * s);
      ctx.lineTo(cx - 0.24 * s, headY - 0.78 * s);
      ctx.lineTo(cx, headY - 1.28 * s);
      ctx.lineTo(cx + 0.24 * s, headY - 0.78 * s);
      ctx.lineTo(cx + 0.44 * s, headY - 0.34 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // Ruby & emerald inlays
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, headY - 0.52 * s, 0.08 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatType === 'sc_tam') {
      // 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland: Mũ Nồi Tartan Tam o' Shanter & Quả Bông Đỏ
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.ellipse(cx - 0.06 * s, headY - 0.54 * s, 0.68 * s, 0.26 * s, -0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Dark headband + gold pom-pom on top
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 0.44 * s, headY - 0.42 * s, 0.88 * s, 0.1 * s);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx - 0.08 * s, headY - 0.78 * s, 0.11 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatType === 'de_alpine') {
      // 🇩🇪 Đức Bavaria: Mũ Phớt Xanh Rừng Alpine & Lông Vũ Trắng
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(cx, headY - 0.38 * s, 0.78 * s, 0.18 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 0.48 * s, headY - 0.38 * s);
      ctx.quadraticCurveTo(cx, headY - 1.02 * s, cx + 0.48 * s, headY - 0.38 * s);
      ctx.fill();
      // White feather on side
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(cx + 0.32 * s, headY - 0.44 * s);
      ctx.quadraticCurveTo(cx + 0.58 * s, headY - 0.82 * s, cx + 0.46 * s, headY - 1.05 * s);
      ctx.stroke();
    } else if (hatType === 'es_rose_comb') {
      // 🇪🇸 Tây Ban Nha: Lược Cài Tóc Cao Peineta & Hoa Hồng Đỏ Flamenco
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.roundRect(cx - 0.28 * s, headY - 0.98 * s, 0.56 * s, 0.48 * s, 6);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      // Bright crimson rose on side
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx + 0.38 * s, headY - 0.46 * s, 0.17 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(cx + 0.38 * s, headY - 0.46 * s, 0.08 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatType === 'nl_bonnet') {
      // 🇳🇱 Hà Lan: Mũ Ren Trắng Volendam Cánh Chuồn Cổ Điển
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(cx - 0.82 * s, headY - 0.18 * s);
      ctx.quadraticCurveTo(cx - 0.62 * s, headY - 0.86 * s, cx, headY - 0.78 * s);
      ctx.quadraticCurveTo(cx + 0.62 * s, headY - 0.86 * s, cx + 0.82 * s, headY - 0.18 * s);
      ctx.lineTo(cx + 0.46 * s, headY - 0.34 * s);
      ctx.lineTo(cx - 0.46 * s, headY - 0.34 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    } else if (hatType === 'ru_kokoshnik') {
      // 🇷🇺 Nga: Vương Miện Bán Nguyệt Hoàng Gia Kokoshnik Đính Ngọc Trai
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(cx - 0.68 * s, headY - 0.28 * s);
      ctx.quadraticCurveTo(cx - 0.72 * s, headY - 0.88 * s, cx, headY - 1.12 * s);
      ctx.quadraticCurveTo(cx + 0.72 * s, headY - 0.88 * s, cx + 0.68 * s, headY - 0.28 * s);
      ctx.quadraticCurveTo(cx, headY - 0.48 * s, cx - 0.68 * s, headY - 0.28 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      // Gold & pearl star motif in center
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx, headY - 0.68 * s, 0.11 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatType === 'mx_sombrero') {
      // 🇲🇽 Mexico: Mũ Vành Rộng Sombrero Thêu Chỉ Vàng Rực Rỡ
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(cx, headY - 0.36 * s, 1.18 * s, 0.25 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      // Tall dome
      ctx.beginPath();
      ctx.moveTo(cx - 0.46 * s, headY - 0.38 * s);
      ctx.quadraticCurveTo(cx, headY - 1.18 * s, cx + 0.46 * s, headY - 0.38 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Red & gold trim
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 0.44 * s, headY - 0.42 * s);
      ctx.lineTo(cx + 0.44 * s, headY - 0.42 * s);
      ctx.stroke();
    } else if (hatType === 'eg_nemes') {
      // 🇪🇬 Ai Cập: Mũ Sọc Vàng Xanh Pharaoh Nemes & Biểu Tượng Rắn Hổ Mang Vàng Uraeus
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(cx - 0.56 * s, headY - 0.66 * s);
      ctx.lineTo(cx + 0.56 * s, headY - 0.66 * s);
      ctx.lineTo(cx + 0.78 * s, headY + 0.25 * s);
      ctx.lineTo(cx + 0.42 * s, headY + 0.28 * s);
      ctx.lineTo(cx + 0.42 * s, headY - 0.32 * s);
      ctx.lineTo(cx - 0.42 * s, headY - 0.32 * s);
      ctx.lineTo(cx - 0.42 * s, headY + 0.28 * s);
      ctx.lineTo(cx - 0.78 * s, headY + 0.25 * s);
      ctx.closePath();
      ctx.fill();
      // Lapis blue stripes
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 2.4;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 0.22 * s, headY - 0.64 * s);
        ctx.lineTo(cx + i * 0.28 * s, headY - 0.34 * s);
        ctx.stroke();
      }
      // Golden Cobra Uraeus on forehead
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, headY - 0.52 * s, 0.11 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (hatType === 'na_feathers') {
      // 🪶 Bản Địa Bắc Mỹ: Băng Đô Thổ Cẩm & Vầng Lông Vũ Đại Bàng
      const featherAngles = [-0.85, -0.52, -0.25, 0, 0.25, 0.52, 0.85];
      featherAngles.forEach((ang) => {
        ctx.save();
        ctx.translate(cx, headY - 0.34 * s);
        ctx.rotate(ang);
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(0, -0.52 * s, 0.08 * s, 0.32 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(0, -0.72 * s, 0.06 * s, 0.12 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      // Beaded headband
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 0.54 * s, headY - 0.42 * s, 1.08 * s, 0.13 * s);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(cx - 0.54 * s, headY - 0.42 * s, 1.08 * s, 0.13 * s);
    } else if (hatType === 'gr_laurel') {
      // 🇬🇷 Hy Lạp Cổ Đại: Vòng Nguyệt Quế Vàng Olympus
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(cx, headY - 0.16 * s, 0.56 * s, 1.12 * Math.PI, 1.88 * Math.PI);
      ctx.stroke();
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const lx = cx + i * 0.14 * s;
        const ly = headY - (0.58 - Math.abs(i) * 0.05) * s;
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(lx, ly, 0.11 * s, 0.055 * s, i * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (hatType === 'af_kufi') {
      // 🌍 Châu Phi: Mũ Hoàng Gia Kufi Thổ Cẩm Vàng Xanh Đỏ
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(cx - 0.52 * s, headY - 0.34 * s);
      ctx.lineTo(cx - 0.46 * s, headY - 0.78 * s);
      ctx.quadraticCurveTo(cx, headY - 0.92 * s, cx + 0.46 * s, headY - 0.78 * s);
      ctx.lineTo(cx + 0.52 * s, headY - 0.34 * s);
      ctx.closePath();
      ctx.fill();
      // Geometric Kente band
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(cx - 0.5 * s, headY - 0.54 * s, 1.0 * s, 0.11 * s);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(cx - 0.51 * s, headY - 0.42 * s, 1.02 * s, 0.09 * s);
    } else {
      // Classic Vietnamese Conical Hat (Nón lá truyền thống)
      ctx.fillStyle = hatColor;
      ctx.beginPath();
      ctx.moveTo(cx - 0.92 * s, headY - 0.3 * s);
      ctx.lineTo(cx, headY - 1.02 * s);
      ctx.lineTo(cx + 0.92 * s, headY - 0.3 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  _drawHairAndAgeDetails(ctx, cx, cy, s, age, gender, customHairColor) {
    const hairColor = age === 'elder' ? '#f1f5f9' : (customHairColor || (age === 'middle' ? '#475569' : '#1e293b'));
    ctx.fillStyle = hairColor;

    // Top hair cap (visible when wearing beret, flower crown, or leaf sprout)
    ctx.beginPath();
    ctx.arc(cx, cy - 0.08 * s, 0.56 * s, Math.PI, 0);
    ctx.fill();

    // Side locks / bangs
    ctx.beginPath();
    ctx.arc(cx - 0.42 * s, cy - 0.15 * s, 0.18 * s, 0, Math.PI * 2);
    ctx.arc(cx + 0.42 * s, cy - 0.15 * s, 0.18 * s, 0, Math.PI * 2);
    ctx.fill();

    // Female / Free long hair pigtails or side braid
    if (gender === 'female' || gender === 'free') {
      ctx.beginPath();
      ctx.ellipse(cx - 0.54 * s, cy + 0.18 * s, 0.12 * s, 0.26 * s, 0.2, 0, Math.PI * 2);
      ctx.ellipse(cx + 0.54 * s, cy + 0.18 * s, 0.12 * s, 0.26 * s, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Middle-aged features: stylish round glasses
    if (age === 'middle') {
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.65)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx - 0.2 * s, cy - 0.04 * s, 0.14 * s, 0, Math.PI * 2);
      ctx.arc(cx + 0.2 * s, cy - 0.04 * s, 0.14 * s, 0, Math.PI * 2);
      ctx.moveTo(cx - 0.06 * s, cy - 0.04 * s);
      ctx.lineTo(cx + 0.06 * s, cy - 0.04 * s);
      ctx.stroke();
    }

    // Elder (55+) features: white eyebrows & wise silver beard for male
    if (age === 'elder') {
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = Math.max(2, 0.07 * s);
      ctx.beginPath();
      ctx.moveTo(cx - 0.32 * s, cy - 0.18 * s);
      ctx.lineTo(cx - 0.1 * s, cy - 0.2 * s);
      ctx.moveTo(cx + 0.1 * s, cy - 0.2 * s);
      ctx.lineTo(cx + 0.32 * s, cy - 0.18 * s);
      ctx.stroke();

      if (gender === 'male') {
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(cx - 0.16 * s, cy + 0.32 * s);
        ctx.quadraticCurveTo(cx, cy + 0.72 * s, cx + 0.16 * s, cy + 0.32 * s);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  _drawFaceExpression(ctx, cx, cy, s, mood, age) {
    // Rosy cheeks (more vibrant when Cute or Funny)
    ctx.fillStyle = (mood === 'cute' || mood === 'funny')
      ? 'rgba(244, 63, 94, 0.42)'
      : 'rgba(251, 113, 133, 0.24)';
    ctx.beginPath();
    ctx.arc(cx - 0.32 * s, cy + 0.1 * s, 0.11 * s, 0, Math.PI * 2);
    ctx.arc(cx + 0.32 * s, cy + 0.1 * s, 0.11 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.fillStyle = '#1e293b';
    ctx.lineWidth = Math.max(1.8, 0.065 * s);
    ctx.lineCap = 'round';

    if (mood === 'bored') {
      // 🥱 Chán Phố Thị: Half-lidded droopy eyes, dark eye-bags, sleepy yawn mouth & sweat drop
      ctx.beginPath();
      ctx.moveTo(cx - 0.32 * s, cy - 0.06 * s);
      ctx.lineTo(cx - 0.08 * s, cy - 0.04 * s);
      ctx.moveTo(cx + 0.08 * s, cy - 0.04 * s);
      ctx.lineTo(cx + 0.32 * s, cy - 0.06 * s);
      ctx.stroke();

      // Half pupils
      ctx.beginPath();
      ctx.arc(cx - 0.2 * s, cy - 0.03 * s, 0.06 * s, 0, Math.PI);
      ctx.arc(cx + 0.2 * s, cy - 0.03 * s, 0.06 * s, 0, Math.PI);
      ctx.fill();

      // Dark eye bags from city overtime
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.65)';
      ctx.lineWidth = Math.max(1.2, 0.04 * s);
      ctx.beginPath();
      ctx.arc(cx - 0.2 * s, cy + 0.01 * s, 0.1 * s, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.moveTo(cx + 0.1 * s, cy + 0.03 * s);
      ctx.arc(cx + 0.2 * s, cy + 0.01 * s, 0.1 * s, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();

      // Sleepy oval yawn mouth
      ctx.fillStyle = '#9f1239';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 0.21 * s, 0.09 * s, 0.12 * s, 0, 0, Math.PI * 2);
      ctx.fill();

    } else if (mood === 'funny') {
      // 🤪 Hài Hước Tỉnh Bơ: Playful winking left eye `> <`, wide right eye, big grin & tongue sticking out
      ctx.beginPath();
      ctx.moveTo(cx - 0.3 * s, cy - 0.11 * s);
      ctx.lineTo(cx - 0.12 * s, cy - 0.03 * s);
      ctx.lineTo(cx - 0.3 * s, cy + 0.04 * s);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx + 0.2 * s, cy - 0.04 * s, 0.08 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + 0.22 * s, cy - 0.06 * s, 0.03 * s, 0, Math.PI * 2);
      ctx.fill();

      // Laughing mouth + pink tongue out
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx, cy + 0.14 * s, 0.17 * s, 0, Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(cx + 0.05 * s, cy + 0.25 * s, 0.09 * s, 0, Math.PI);
      ctx.fill();

    } else if (mood === 'zen') {
      // 😌 Thiền Định An Nhiên: Curved peaceful closed eyes, mindfulness dot on forehead & serene smile
      ctx.beginPath();
      ctx.arc(cx - 0.2 * s, cy - 0.05 * s, 0.1 * s, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + 0.2 * s, cy - 0.05 * s, 0.1 * s, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Golden mindfulness dot between eyebrows
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, cy - 0.17 * s, 0.045 * s, 0, Math.PI * 2);
      ctx.fill();

      // Serene smile
      ctx.beginPath();
      ctx.arc(cx, cy + 0.14 * s, 0.14 * s, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();

    } else {
      // 😊 Dễ Thương Yêu Đời: Big sparkling anime eyes with white highlights & natural eye blinking
      const isBlinking = (this.elapsed % 4.1) > 3.94;
      if (isBlinking) {
        ctx.beginPath();
        ctx.arc(cx - 0.2 * s, cy - 0.04 * s, 0.095 * s, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 0.2 * s, cy - 0.04 * s, 0.095 * s, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(cx - 0.2 * s, cy - 0.04 * s, 0.095 * s, 0, Math.PI * 2);
        ctx.arc(cx + 0.2 * s, cy - 0.04 * s, 0.095 * s, 0, Math.PI * 2);
        ctx.fill();

        // Sparkling eye highlights
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 0.23 * s, cy - 0.07 * s, 0.038 * s, 0, Math.PI * 2);
        ctx.arc(cx + 0.17 * s, cy - 0.07 * s, 0.038 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sweet happy smile
      ctx.beginPath();
      ctx.arc(cx, cy + 0.13 * s, 0.16 * s, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }
  }

  _drawActiveJobSimulationProp(ctx, p, s, bounce) {
    const rightHand = (this.lastHands && this.lastHands.right)
      ? this.lastHands.right
      : { handX: p.x + 0.48 * s, handY: p.y - 1.1 * s - bounce };

    if (this.playerState === 'work') {
      const swing = Math.sin(this.elapsed * 15) * 0.9;
      ctx.save();
      ctx.translate(rightHand.handX, rightHand.handY);
      ctx.rotate(swing);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0.85 * s, -0.55 * s);
      ctx.stroke();
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0.65 * s, -0.75 * s, 0.38 * s, 0.35 * s);
      ctx.restore();
    } else if (this.playerState === 'garden') {
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(rightHand.handX, rightHand.handY - 0.2 * s, 0.55 * s, 0.45 * s);
      ctx.fillStyle = '#bae6fd';
      for (let d = 0; d < 4; d++) {
        const dropY = ((this.elapsed * 4 + d * 0.25) % 1) * 0.85 * s;
        ctx.beginPath();
        ctx.arc(rightHand.handX + (0.5 + d * 0.12) * s, rightHand.handY + dropY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.playerState === 'fish') {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(rightHand.handX, rightHand.handY);
      ctx.lineTo(p.x - 2.4 * s, p.y - 2.3 * s);
      ctx.stroke();

      const bob = Math.sin(this.elapsed * 6) * 6;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x - 2.4 * s, p.y - 2.3 * s);
      ctx.lineTo(p.x - 2.5 * s, p.y + 0.15 * s + bob);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(p.x - 2.5 * s, p.y + 0.15 * s + bob, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.playerState === 'poultry') {
      // Bamboo grain basket & scattering golden corn seeds for chickens & ducks
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(rightHand.handX + 0.15 * s, rightHand.handY, 0.28 * s, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      for (let g = 0; g < 5; g++) {
        const gy = ((this.elapsed * 4.5 + g * 0.2) % 1) * 0.85 * s;
        ctx.beginPath();
        ctx.arc(rightHand.handX + (0.25 + g * 0.14) * s, rightHand.handY + gy, 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.playerState === 'cook') {
      // Holding frying pan & rising warm steam
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(rightHand.handX + 0.35 * s, rightHand.handY, 0.32 * s, 0.14 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      const steamOffset = (this.elapsed * 25) % 14;
      ctx.beginPath();
      ctx.moveTo(rightHand.handX + 0.35 * s, rightHand.handY - 4 - steamOffset);
      ctx.lineTo(rightHand.handX + 0.38 * s, rightHand.handY - 14 - steamOffset);
      ctx.stroke();
    } else if (this.playerState === 'pray') {
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 1.3 * s, (1.1 + Math.sin(this.elapsed * 4) * 0.1) * s, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (this.actionTimer > 0 && this.actionLabel) {
      const ratio = Math.max(0, Math.min(1, 1 - this.actionTimer / this.actionTotal));
      const bw = 135;
      const bx = p.x - bw / 2;
      const by = p.y - 3.35 * s;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(bx - 6, by - 22, bw + 12, 36);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx - 6, by - 22, bw + 12, 36);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px "Be Vietnam Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.actionLabel, p.x, by - 7);

      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(bx, by, bw, 7);
      ctx.fillStyle = '#34d399';
      ctx.fillRect(bx, by, bw * ratio, 7);
    }
  }

  _drawInteractableLabels(ctx) {
    if (this.labelSettings && this.labelSettings.showObjectLabels === false) return;
    for (let i = 0; i < this.interactables.length; i++) {
      const st = this.interactables[i];
      if (st.mode && st.mode !== this.sceneMode) continue;
      const p = this.project3D(st.pos.x, 1.95, st.pos.z);

      const customTitle = this.getCustomLabel(st.id, st.shortTitle);
      if (!customTitle) continue;
      const text = (customTitle.charCodeAt(0) > 255 ? '' : st.icon + ' ') + customTitle;
      ctx.font = 'bold 12px "Be Vietnam Pro", sans-serif';
      const w = ctx.measureText(text).width + 18;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.84)';
      ctx.fillRect(p.x - w / 2, p.y - 14, w, 24);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(p.x - w / 2, p.y - 14, w, 24);

      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(text, p.x, p.y + 2);
    }
  }

  _drawFloatingEffects(ctx) {
    for (let i = 0; i < this.floatingEffects.length; i++) {
      const ef = this.floatingEffects[i];
      const p = this.project3D(ef.x, ef.y, ef.z);
      ctx.save();
      ctx.globalAlpha = Math.max(0, ef.life / ef.maxLife);
      ctx.font = 'bold 15px "Be Vietnam Pro", sans-serif';
      ctx.fillStyle = ef.color;
      ctx.textAlign = 'center';
      ctx.fillText(ef.text, p.x, p.y);
      ctx.restore();
    }
  }
}

window.CozyWorld3D = CozyWorld3D;
