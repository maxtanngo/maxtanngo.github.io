// =========================================================================
// MƯA THUẬN GIÓ HOÀ - DỮ LIỆU CỐT TRUYỆN, 6 VÙNG ĐẤT, CỬA HÀNG SINH TỒN TẬP TRUNG,
// BỐ CỤC RỘNG RÃI NGOÀI SÂN & TRONG NHÀ, CHI PHÍ DI CHUYỂN ĐỒ VẬT & KINH TẾ CÂN BẰNG
// =========================================================================

window.GAME_DATA = {
  // Chi phí mỗi lần người chơi di chuyển / sắp xếp lại công trình ngoài sân hoặc đồ nội thất trong nhà
  moveExteriorCost: 15,
  moveInteriorCost: 10,

  // Vị trí mặc định rộng rãi, cách xa nhau thoáng đãng ngoài sân
  defaultExteriorLayout: {
    house: { x: 0, z: -11.5, name: 'Ngôi Nhà / Lều Trại', icon: '🏡', moveCost: 18 },
    garden: { x: -12.5, z: -2.0, name: 'Vườn Rau Hữu Cơ', icon: '🌱', moveCost: 15 },
    work: { x: 12.5, z: -2.0, name: 'Trạm Chặt Củi & Chế Tác', icon: '🪓', moveCost: 15 },
    poultry: { x: -6.2, z: 7.2, name: 'Chuồng Gà & Bến Vịt Quê', icon: '🐓', moveCost: 14 },
    fire: { x: 3.5, z: 6.8, name: 'Đống Lửa Trại & Bàn Trà', icon: '🔥', moveCost: 12 },
    fish: { x: -13.5, z: 9.5, name: 'Bến Câu Cá Bên Suối', icon: '🎣', moveCost: 15 },
    windmill: { x: 11.5, z: -10.5, name: 'Hồ Cá Koi & Cối Xay Gió', icon: '🎏', moveCost: 18 },
    bell: { x: -9.5, z: -11.5, name: 'Tháp Chuông Nguyện Cầu', icon: '🔔', moveCost: 18 }
  },

  // Vị trí mặc định rộng rãi của các đồ vật bên trong ngôi nhà (Người chơi đều có thể di chuyển và trả phí Xu)
  defaultInteriorLayout: {
    bed: { x: -7.8, z: -4.8, name: 'Giường Ngủ / Chiếu Cói', icon: '🛌', minLevel: 1, moveCost: 10 },
    tea_table: { x: 6.8, z: -3.5, name: 'Bàn Trà & Đèn Đọc Sách', icon: '🍵', minLevel: 1, moveCost: 10 },
    tv: { x: 4.5, z: -7.8, name: 'Tivi Màn Hình Phẳng & Kệ', icon: '📺', minLevel: 1, requiresTool: 'app_tv', moveCost: 10 },
    fridge: { x: -9.2, z: -0.2, name: 'Tủ Lạnh 2 Cánh Trữ Đồ Ăn', icon: '🧊', minLevel: 1, requiresTool: 'app_fridge', moveCost: 10 },
    kitchen: { x: -7.8, z: 4.2, name: 'Nhà Bếp & Bếp Nấu Ấm Cúng', icon: '🍳', minLevel: 3, altTool: 'app_kitchen_cabinet', moveCost: 12 },
    cookware: { x: -4.2, z: 4.8, name: 'Bàn Soạn & Dụng Cụ Nấu Ăn', icon: '🥘', minLevel: 1, requiresTool: 'app_cookware_set', moveCost: 8 },
    rug: { x: 0, z: 1.2, name: 'Thảm Dệt Trung Tâm', icon: '🧶', minLevel: 3, moveCost: 8 },
    fireplace: { x: 0, z: -8.2, name: 'Lò Sưởi Gạch Đỏ & Tủ Sách', icon: '🔥', minLevel: 4, moveCost: 14 },
    altar_piano: { x: 7.2, z: 3.8, name: 'Đàn Piano & Góc Tĩnh Tâm', icon: '🎹', minLevel: 5, moveCost: 15 }
  },

  regions: {
    mountain: {
      id: 'mountain',
      name: 'Đỉnh Núi Mây Mù',
      badge: '⛰️ Đỉnh Núi',
      emoji: '⛰️',
      title: 'Đỉnh Núi Mây Mù (Tây Bắc / Đà Lạt)',
      desc: 'Rừng thông reo vi vu, sương mù bảng lảng, không khí se lạnh và những khóm trà cổ thụ thanh tịnh.',
      homeName: 'Nhà Sàn Gỗ Thông & Mái Chữ A Vùng Cao',
      homeDesc: 'Nơi ở bằng gỗ thông ấm áp có ống khói đá cuội, hiên ngắm biển mây và đồi thông xanh ngắt.',
      styleType: 'alpine_chalet',
      wallColor: '#78350f',
      roofColor: '#451a03',
      accentColor: '#fbbf24',
      keywords: [
        'núi', 'đồi', 'cao nguyên', 'đà lạt', 'sapa', 'tây bắc', 'mây', 'sương',
        'thông', 'lạnh', 'se lạnh', 'trà', 'chè', 'rừng thông', 'yên tĩnh trên cao'
      ],
      groundColor: '#2f6f4e',
      hillColor: '#1e3f2b',
      waterColor: '#0284c7',
      workLabel: 'Chặt củi thông & Hái búp trà sương sớm',
      gardenLabel: 'Chăm vườn thảo mộc & Cải mèo trên núi',
      fishLabel: 'Câu cá suối nguồn trên đỉnh núi'
    },
    sea: {
      id: 'sea',
      name: 'Bờ Biển Nắng Ấm',
      badge: '🏖️ Gần Biển',
      emoji: '🏖️',
      title: 'Làng Chài Gần Biển Xanh (Phú Yên / Côn Đảo)',
      desc: 'Bãi cát vàng mịn, rặng dừa nghiêng bóng, gió biển mát rượi và tiếng sóng vỗ về suốt ngày đêm.',
      homeName: 'Bungalow Biển Trắng Xanh & Chòi Lá Dừa',
      homeDesc: 'Ngôi nhà gỗ sơn trắng - xanh biển mát lành, mái lá dừa cạn, dựng ván lướt sóng và phao biển trước hiên.',
      styleType: 'beach_bungalow',
      wallColor: '#f8fafc',
      roofColor: '#0284c7',
      accentColor: '#38bdf8',
      keywords: [
        'biển', 'đảo', 'hải đảo', 'cát', 'sóng', 'dừa', 'làng chài', 'phú yên',
        'nha trang', 'phú quốc', 'côn đảo', 'vịnh', 'nắng ấm', 'bờ biển', 'đại dương'
      ],
      groundColor: '#d9a94e',
      hillColor: '#4d7c0f',
      waterColor: '#0ea5e9',
      workLabel: 'Nhặt vỏ sò, củi khô & Đan lưới bên rặng dừa',
      gardenLabel: 'Trồng rau muống biển & Chăm vườn dừa',
      fishLabel: 'Thả câu cá biển bên cầu tàu gỗ'
    },
    valley: {
      id: 'valley',
      name: 'Thung Lũng Suối Hoa',
      badge: '🌾 Thung Lũng',
      emoji: '🌾',
      title: 'Thung Lũng Hoa & Suối Đá (Mộc Châu / Ninh Bình)',
      desc: 'Thảo nguyên xanh mướt, dòng suối trong vắt chảy quanh hiên nhà và hoa dại nở rộ bốn mùa.',
      homeName: 'Nhà Cottage Cổ Tích Mái Ngói Đỏ & Giàn Hoa Leo',
      homeDesc: 'Ngôi nhà tường kem vàng ấm áp, mái ngói đỏ tươi có vòm hoa hồng leo rực rỡ và cửa sổ tròn thơ mộng.',
      styleType: 'flower_cottage',
      wallColor: '#fef3c7',
      roofColor: '#e11d48',
      accentColor: '#f472b6',
      keywords: [
        'thung lũng', 'suối', 'hoa', 'đồng cỏ', 'thảo nguyên', 'mộc châu', 'ninh bình',
        'bướm', 'cánh đồng hoa', 'thơ mộng', 'dòng nước', 'cỏ xanh'
      ],
      groundColor: '#4d8b3b',
      hillColor: '#2e5c1e',
      waterColor: '#06b6d4',
      workLabel: 'Đẽo gỗ suối & Thu gom cành khô',
      gardenLabel: 'Tưới luống hoa hướng dương & Rau sạch',
      fishLabel: 'Câu cá suối trong vắt bên cầu gỗ'
    },
    bamboo: {
      id: 'bamboo',
      name: 'Rừng Trúc Thiền Tự',
      badge: '🎍 Rừng Trúc',
      emoji: '🎍',
      title: 'Rừng Trúc Cổ Thụ & Am Thiền (Yên Tử / Tây Thiên)',
      desc: 'Rừng trúc xanh ngắt thẳng tắp rì rào trong gió, thác nước trắng xoá và không gian tĩnh mặc tuyệt đối.',
      homeName: 'Am Trà Trúc Xanh & Hiên Đèn Lồng Tịnh Tâm',
      homeDesc: 'Tịnh thất dựng từ thân trúc già xanh ngọc, mái đao uốn cong truyền thống, treo đèn lồng đỏ và bàn trà đạo.',
      styleType: 'zen_pavilion',
      wallColor: '#166534',
      roofColor: '#115e59',
      accentColor: '#ef4444',
      keywords: [
        'trúc', 'tre', 'rừng trúc', 'thiền', 'chùa', 'am', 'yên tử', 'tĩnh tâm',
        'nhà thờ', 'cầu nguyện', 'thác nước', 'rừng sâu', 'ẩn cư', 'thanh tịnh'
      ],
      groundColor: '#2d6a4f',
      hillColor: '#1b4332',
      waterColor: '#0d9488',
      workLabel: 'Đẵn tre khô & Đan lát đồ thủ công',
      gardenLabel: 'Trồng nấm hương & Thảo dược dưới tán trúc',
      fishLabel: 'Ngồi câu cá tĩnh tâm bên hồ ngọc bích'
    },
    river: {
      id: 'river',
      name: 'Miệt Vườn Sông Nước',
      badge: '🛶 Miệt Vườn',
      emoji: '🛶',
      title: 'Cù Lao Miệt Vườn Sông Nước (Miền Tây / Cửu Long)',
      desc: 'Kênh rạch hiền hoà, cầu khỉ bắc ngang, vườn cây ăn trái trĩu quả và tiếng mái chèo khua nước êm đềm.',
      homeName: 'Nhà Chòi Lá Dừa Nước & Bến Xuồng Ba Lá',
      homeDesc: 'Nơi ở dân dã trên sàn cọc gỗ ven sông, mái lợp lá dừa nước mát rượi, có lu nước sành và xuồng ba lá đậu trước hiên.',
      styleType: 'river_stilt',
      wallColor: '#a16207',
      roofColor: '#ca8a04',
      accentColor: '#22c55e',
      keywords: [
        'sông', 'miệt vườn', 'miền tây', 'cù lao', 'kênh', 'rạch', 'xuồng', 'ghe',
        'trái cây', 'vườn cây', 'quê ngoại', 'đồng bằng', 'ao', 'hồ sen', 'dân dã'
      ],
      groundColor: '#558b2f',
      hillColor: '#33691e',
      waterColor: '#0891b2',
      workLabel: 'Chẻ củi dừa & Thu hoạch trái cây miệt vườn',
      gardenLabel: 'Chăm sóc vườn cây ăn trái & Rau đồng quê',
      fishLabel: 'Buông cần câu cá lóc, cá rô bên bờ sông'
    },
    plateau: {
      id: 'plateau',
      name: 'Thảo Nguyên Hoàng Hôn',
      badge: '🌅 Thảo Nguyên',
      emoji: '🌅',
      title: 'Đồi Cỏ Hồng & Thảo Nguyên Đầy Gió (Tà Năng / Gia Lai)',
      desc: 'Những triền đồi cỏ hồng tím trải dài bất tận dưới ánh hoàng hôn vàng rực và bầu trời sao đêm lấp lánh.',
      homeName: 'Lều Du Mục Yurt Tròn & Cờ Dây Thảo Nguyên',
      homeDesc: 'Lều tròn Glamping du mục màu kem thêu thổ cẩm vàng cam, căng dây cờ sắc màu giữa đồi cỏ hồng lộng gió.',
      styleType: 'nomad_yurt',
      wallColor: '#fffbeb',
      roofColor: '#ea580c',
      accentColor: '#f43f5e',
      keywords: [
        'hoàng hôn', 'cỏ hồng', 'cỏ lau', 'đồi cỏ', 'gia lai', 'tây nguyên', 'tà năng',
        'gió', 'tự do', 'mênh mông', 'bầu trời sao', 'cắm trại', 'du mục', 'nắng chiều'
      ],
      groundColor: '#8d6346',
      hillColor: '#5c3d28',
      waterColor: '#2563eb',
      workLabel: 'Gom gỗ lũa thảo nguyên & Dựng hàng rào chắn gió',
      gardenLabel: 'Trồng hoa dã quỳ & Khoai lang nướng',
      fishLabel: 'Câu cá hồ thảo nguyên dưới ánh chiều tà'
    }
  },

  ages: {
    youth: {
      id: 'youth',
      name: 'Đôi Mươi (18-28)',
      workBonus: 1.15,
      quizBonus: 1.0,
      sleepBonus: 1.0,
      perkText: '+15% Xu lao động',
      trait: 'Đôi mắt hơi thâm quầng vì thức khuya ở phố thị, nhưng trái tim khao khát tự do (+15% Xu lao động).'
    },
    middle: {
      id: 'middle',
      name: 'Trung Niên (29-50)',
      workBonus: 1.05,
      quizBonus: 1.25,
      sleepBonus: 1.1,
      perkText: '+25% Xu giải đố',
      trait: 'Trải qua đủ thăng trầm nơi phố thị, nay tìm về sự điềm tĩnh sâu sắc (+25% Xu giải đố tri thức).'
    },
    elder: {
      id: 'elder',
      name: 'Lão Niên (55+)',
      workBonus: 1.0,
      quizBonus: 1.15,
      sleepBonus: 1.4,
      perkText: '+40% Xu khi ngủ & thiền',
      trait: 'Thấu hiểu lẽ "Mưa Thuận Gió Hoà", chỉ cần thảnh thơi ngắm mây cũng đủ đầy (+40% Xu khi nằm ngủ & thiền).'
    }
  },

  // 6 NHÂN VẬT / PHONG CÁCH NGOẠI HÌNH ĐẸP ĐỂ NGƯỜI CHƠI LỰA CHỌN THEO SỞ THÍCH
  characterStyles: {
    default: {
      id: 'default',
      name: 'Du Khách Bụi Phố',
      shortName: '🎒 Bụi Phố',
      icon: '🎒',
      desc: 'Trang phục dã ngoại năng động, đeo ba lô hành trình.',
      shirtColor: null,
      sleeveColor: null,
      pantsColor: null,
      hatType: 'none',
      capeColor: null,
      hairColor: null
    },
    scholar: {
      id: 'scholar',
      name: 'Thư Sinh / Nàng Thơ Áo Dài',
      shortName: '🌸 Áo Dài Thơ',
      icon: '🌸',
      desc: 'Tà Áo Dài / Việt Phục ngọc bích thanh lịch, cài hoa tinh khôi.',
      shirtColor: '#10b981',
      sleeveColor: '#a7f3d0',
      pantsColor: '#f8fafc',
      hatType: 'flower_crown',
      capeColor: '#6ee7b7',
      hairColor: '#1c1917'
    },
    farmer: {
      id: 'farmer',
      name: 'Nông Dân Mũ Cói Hoa Cúc',
      shortName: '🌻 Mũ Cói',
      icon: '🌻',
      desc: 'Yếm jean đồng nội kết hợp mũ cói rộng vành đính hoa cúc vàng.',
      shirtColor: '#f59e0b',
      sleeveColor: '#fef08a',
      pantsColor: '#2563eb',
      hatType: 'straw_daisy',
      capeColor: '#fde047',
      hairColor: '#451a03'
    },
    artist: {
      id: 'artist',
      name: 'Hoạ Sĩ Mộng Mơ Đồi Thông',
      shortName: '🎨 Hoạ Sĩ',
      icon: '🎨',
      desc: 'Áo len hồng đào, mũ nồi Beret nghệ sĩ & khăn choàng lãng tử.',
      shirtColor: '#ec4899',
      sleeveColor: '#fbcfe8',
      pantsColor: '#312e81',
      hatType: 'beret',
      capeColor: '#f43f5e',
      hairColor: '#3f2314'
    },
    wanderer: {
      id: 'wanderer',
      name: 'Lữ Khách Áo Choàng Rừng Xanh',
      shortName: '🍃 Lữ Khách',
      icon: '🍃',
      desc: 'Áo choàng phong trần màu xanh lục bảo & mầm lá trên đầu.',
      shirtColor: '#059669',
      sleeveColor: '#6ee7b7',
      pantsColor: '#1e293b',
      hatType: 'sprout',
      capeColor: '#047857',
      hairColor: '#0f172a'
    },
    zen_robe: {
      id: 'zen_robe',
      name: 'Hiền Giả Trà Đạo Hoàng Kim',
      shortName: '🪷 Hiền Giả',
      icon: '🪷',
      desc: 'Áo lụa thiền trà vàng kim ấm áp, nón sen thanh tịnh.',
      shirtColor: '#d97706',
      sleeveColor: '#fef08a',
      pantsColor: '#451a03',
      hatType: 'lotus_hat',
      capeColor: '#fbbf24',
      hairColor: '#27272a'
    }
  },

  moods: {
    bored: {
      id: 'bored',
      emoji: '🥱',
      label: 'Chán Phố Thị',
      quotes: [
        '"Mới bỏ phố về đây trong túi chỉ có vỏn vẹn 15 Xu... Phải chăm chỉ chặt củi, trồng rau mới dựng được nhà đẹp!"',
        '"Ngáp một cái dài thật dài... Không ai hối deadline, mình cứ thong thả vừa làm vừa gom góp từng đồng Xu."',
        '"Đôi mắt lờ đờ của kẻ từng thức trắng chạy KPI đang dần sáng lại nhờ ánh nắng ban mai."'
      ]
    },
    funny: {
      id: 'funny',
      emoji: '🤪',
      label: 'Hài Hước Tỉnh Bơ',
      quotes: [
        '"Muốn dời cái vườn rau hay kê lại cái giường trong nhà cũng tốn Xu cả đấy, phải chịu khó cày cuốc thôi!"',
        '"Hôm nay trò chuyện với mấy chú chim trên cành, thấy tụi nó chẳng tốn đồng Xu nào cũng có tổ ấm."',
        '"Làm nông dân tự lập: Cố gắng gom Xu mua Cần Câu rồi sắm thêm cái ghế ngồi câu cá cho oách!"'
      ]
    },
    cute: {
      id: 'cute',
      emoji: '😊',
      label: 'Dễ Thương Yêu Đời',
      quotes: [
        '"Khuôn viên quanh nhà rộng rãi thoáng đãng quá, mình có thể tự tay sắp xếp vị trí từng góc nhỏ!"',
        '"Cảm ơn cơn mưa lành đêm qua đã tưới mát khu vườn nhỏ. Mưa thuận gió hoà là đây chứ đâu!"',
        '"Từng đồng Xu kiếm được từ mồ hôi và trí tuệ làm cho mỗi món đồ mua về đều đáng quý biết bao."'
      ]
    },
    zen: {
      id: 'zen',
      emoji: '😌',
      label: 'An Nhiên Thiền Định',
      quotes: [
        '"Hít vào tâm tĩnh lặng, thở ra miệng mỉm cười. Hiện tại là món quà quý giá nhất."',
        '"Nghe tiếng nước chảy và tiếng chuông ngân, mọi muộn phiền tự khắc tan biến như mây khói."',
        '"Đủ ăn, đủ mặc, tâm hồn bình an dưới mái hiên nhỏ — thế là giàu có nhất trần đời."'
      ]
    }
  },

  // MÔ TẢ CẢNH VẬT TRONG NHÀ RỘNG RÃI THEO 6 CẤP ĐỘ (INTERIOR LEVELS)
  homeInteriorStages: [
    {
      level: 1,
      title: 'Cấp 1/6: Lều Vải Đơn Sơ Nghèo Khó',
      subtitle: 'Gian lều nền đất, chiếu cói cũ, thùng gỗ làm bàn và đèn dầu leo lét. (Bấm "Sắp Xếp Vị Trí" để kê lại đồ đạc)',
      bonusCoinsOnRest: 1
    },
    {
      level: 2,
      title: 'Cấp 2/6: Nhà Gỗ Thông Mộc Mạc Rộng Rãi',
      subtitle: 'Sàn gỗ ấm áp, giường đơn có nệm, bàn trà gỗ và cửa sổ lớn đón nắng.',
      bonusCoinsOnRest: 2
    },
    {
      level: 3,
      title: 'Cấp 3/6: Nhà Gỗ Ấm Cúng & Góc Bếp Nhỏ',
      subtitle: 'Mở rộng thêm Góc Bếp nấu ăn, Thảm Dệt trung tâm và cây xanh trong nhà.',
      bonusCoinsOnRest: 3
    },
    {
      level: 4,
      title: 'Cấp 4/6: Tổ Ấm Đủ Đầy & Lò Sưởi Tủ Sách',
      subtitle: 'Thêm Lò Sưởi gạch đỏ rực lửa, kệ sách gỗ lớn và bàn trà đạo thanh lịch.',
      bonusCoinsOnRest: 4
    },
    {
      level: 5,
      title: 'Cấp 5/6: Biệt Thự Đồng Quê Thanh Lịch',
      subtitle: 'Không gian đại sảnh rộng thoáng, giường gỗ quý, nội thất tinh xảo.',
      bonusCoinsOnRest: 6
    },
    {
      level: 6,
      title: 'Cấp 6/6: Thánh Đường An Nhiên Viên Mãn',
      subtitle: 'Đầy đủ Đàn Piano gỗ quý, Góc Tĩnh Tâm Nguyện Cầu, Lò sưởi & Bếp ấm.',
      bonusCoinsOnRest: 8
    }
  ],

  // TIỆN NGHI MUA TẠI TỪNG VỊ TRÍ LÀM VIỆC (HOẶC MUA TRONG CỬA HÀNG SINH TỒN)
  stationProps: {
    fish: {
      stationTitle: '🎣 Tiện Nghi Bến Câu Cá Bên Suối',
      items: [
        {
          id: 'fish_chair',
          category: 'station_fish',
          name: 'Ghế Xếp Ngồi Câu Êm Ái',
          icon: '🪑',
          cost: 35,
          bonusCoins: 3,
          desc: 'Đặt chiếc ghế vải xếp ngay bến câu để nhân vật ngồi câu thảnh thơi, không mỏi lưng.',
          perkText: '+3 Xu mỗi lần câu cá • Hiển thị ghế ngồi tại bến câu'
        },
        {
          id: 'fish_tea_table',
          category: 'station_fish',
          name: 'Bàn Gỗ & Ấm Trà Nóng Bờ Suối',
          icon: '🍵',
          cost: 55,
          bonusCoins: 5,
          desc: 'Vừa ngồi câu cá vừa nhâm nhi tách trà nóng và đĩa bánh quê bên bờ suối.',
          perkText: '+5 Xu & +5 Tâm An mỗi lần câu • Hiển thị bàn nước tại bến câu'
        },
        {
          id: 'fish_umbrella',
          category: 'station_fish',
          name: 'Dù Lớn Che Nắng Mưa & Giỏ Đựng Cá',
          icon: '⛱️',
          cost: 80,
          bonusCoins: 7,
          desc: 'Che nắng che mưa thuận bên bờ suối cùng giỏ tre giữ cá tươi sống.',
          perkText: '+7 Xu mỗi lần câu cá • Hiển thị dù lớn tại bến câu'
        }
      ]
    },
    work: {
      stationTitle: '🪓 Tiện Nghi Trạm Chặt Củi & Chế Tác',
      items: [
        {
          id: 'work_bench',
          category: 'station_work',
          name: 'Giá Cưa Gỗ & Bàn Đóng Mộc',
          icon: '🪚',
          cost: 40,
          bonusCoins: 3,
          desc: 'Đặt bàn cưa gỗ chuyên dụng cạnh gốc cây giúp xẻ củi nhanh và chuẩn xác.',
          perkText: '+3 Xu mỗi lần chặt củi • Hiển thị bàn cưa tại trạm'
        },
        {
          id: 'work_water_jug',
          category: 'station_work',
          name: 'Bàn Đá & Bình Nước Vối Mát Lạnh',
          icon: '🏺',
          cost: 60,
          bonusCoins: 5,
          desc: 'Chặt củi xong có ngay bát nước vối mát lành giải nhiệt dưới bóng cây.',
          perkText: '+5 Xu mỗi lần chặt củi • Hiển thị bình nước vối tại trạm'
        },
        {
          id: 'work_shed',
          category: 'station_work',
          name: 'Mái Hiên Xếp Củi Khô & Xe Kéo',
          icon: '🛒',
          cost: 85,
          bonusCoins: 8,
          desc: 'Giữ củi luôn khô ráo trước những cơn mưa rừng và chở được nhiều gỗ hơn.',
          perkText: '+8 Xu mỗi lần chặt củi • Hiển thị mái che củi'
        }
      ]
    },
    garden: {
      stationTitle: '🌱 Tiện Nghi Khu Vườn Rau Hữu Cơ',
      items: [
        {
          id: 'garden_stool',
          category: 'station_garden',
          name: 'Ghế Đẩu Gỗ Ngồi Nhổ Cỏ & Bàn Ươm',
          icon: '🪑',
          cost: 35,
          bonusCoins: 3,
          desc: 'Ngồi nhổ cỏ, ươm mầm cây nhẹ nhàng không đau lưng.',
          perkText: '+3 Xu mỗi lần chăm vườn • Hiển thị ghế gỗ cạnh vườn'
        },
        {
          id: 'garden_scarecrow',
          category: 'station_garden',
          name: 'Bù Nhìn Rơm Đội Nón & Giàn Leo',
          icon: '🌾',
          cost: 55,
          bonusCoins: 5,
          desc: 'Giữ chim chóc khỏi phá rau và làm khu vườn thêm sinh động.',
          perkText: '+5 Xu mỗi lần chăm vườn • Hiển thị bù nhìn rơm'
        },
        {
          id: 'garden_sprinkler',
          category: 'station_garden',
          name: 'Hệ Thống Ống Tre Dẫn Nước Suối',
          icon: '🎋',
          cost: 90,
          bonusCoins: 8,
          desc: 'Dẫn nước suối mát lành chảy thẳng vào từng luống rau tự động.',
          perkText: '+8 Xu mỗi lần chăm vườn • Hiển thị máng nước tre'
        }
      ]
    },
    poultry: {
      stationTitle: '🐓 Tiện Nghi Chuồng Gà & Bến Vịt Quê',
      items: [
        {
          id: 'farm_feed_trough',
          category: 'pets',
          name: 'Máng Thóc Ngô & Ổ Rơm Đẻ Trứng',
          icon: '🌾',
          cost: 35,
          bonusCoins: 4,
          desc: 'Máng gỗ đựng đầy thóc ngô và ổ rơm khô ấm áp giúp đàn gà, vịt đẻ trứng đều đặn mỗi ngày.',
          perkText: '+4 Xu mỗi lần cho gà vịt ăn & nhặt trứng • Hiển thị máng thóc & ổ rơm'
        },
        {
          id: 'farm_egg_basket',
          category: 'pets',
          name: 'Giỏ Tre Thu Hoạch Trứng Hồng',
          icon: '🥚',
          cost: 50,
          bonusCoins: 6,
          desc: 'Giỏ tre đan thủ công lót rơm mềm để đựng trứng gà ta và trứng vịt chạy đồng.',
          perkText: '+6 Xu mỗi lần thu hoạch trứng • Hiển thị giỏ trứng đầy'
        }
      ]
    }
  },

  // CỬA HÀNG SINH TỒN TẬP TRUNG (DỤNG CỤ, GIA DỤNG NHÀ BẾP, THÚ CƯNG & GÀ VỊT)
  shopTools: [
    // --- 1. DỤNG CỤ SINH TỒN (tools) ---
    {
      id: 'fishing_rod',
      category: 'tools',
      name: 'Cần Câu Trúc Mộc Mạc',
      icon: '🎣',
      cost: 35,
      desc: 'Dụng cụ sinh tồn thiết yếu để ngồi câu cá bên bờ suối / cầu tàu, mang lại nguồn cá tươi và Xu.',
      perkText: 'Mở khoá hành động Đi Câu Cá & cầm cần câu trên tay!'
    },
    {
      id: 'shelter_kit',
      category: 'tools',
      name: 'Bộ Dụng Cụ Làm Nhà Tạm (Rìu & Cưa)',
      icon: '🪓',
      cost: 55,
      desc: 'Gồm rìu thép, cưa tay và dây thừng giúp chặt củi nhanh hơn và gia cố lều trại vững vàng.',
      perkText: '+25% Xu khi Chặt củi & Giảm 15% chi phí nâng cấp nhà!'
    },
    {
      id: 'watering_can',
      category: 'tools',
      name: 'Bình Tưới Đồng & Cuốc Làm Vườn',
      icon: '🚿',
      cost: 65,
      desc: 'Bộ đôi làm vườn sinh thái giúp đất tơi xốp, rau củ và hoa trái lớn nhanh sau mỗi cơn mưa.',
      perkText: '+30% Xu khi Trồng rau/Tưới cây & +4 Tâm An mỗi lần tưới!'
    },
    {
      id: 'camping_stove',
      category: 'tools',
      name: 'Bếp Lửa Sinh Tồn & Ấm Trà Đất Nung',
      icon: '🫖',
      cost: 80,
      desc: 'Đun nước pha trà nóng và nấu súp rau củ ngay bên hiên nhà, giúp giữ ấm cơ thể.',
      perkText: 'Giảm 25% tiêu hao Thể lực khi làm việc!'
    },
    {
      id: 'repair_kit',
      category: 'tools',
      name: 'Hộp Đồ Nghề Sửa Nhà & Chế Tác',
      icon: '🧰',
      cost: 110,
      desc: 'Búa đóng đinh, bào gỗ, đinh vít và sơn chống thấm giúp tự tay sửa sang, nâng cấp nhà cửa.',
      perkText: '+1 Xu tự động / 5s & Tăng 20% hiệu quả mọi công việc!'
    },
    {
      id: 'lantern_net',
      category: 'tools',
      name: 'Đèn Bão Dầu Lạc & Lưới Bắt Cá',
      icon: '🏮',
      cost: 145,
      desc: 'Đèn bão thắp sáng ấm áp suốt đêm mưa và lưới tự động đánh bắt tôm cá dưới suối.',
      perkText: '+2 Xu tự động / 5s & +25% Xu khi Câu cá!'
    },

    // --- 2. ĐỒ GIA DỤNG THÔNG DỤNG & NHÀ BẾP (appliances) ---
    {
      id: 'app_cookware_set',
      category: 'appliances',
      name: 'Bộ Dụng Cụ Nấu Ăn (Nồi Đất, Chảo, Dao Thớt)',
      icon: '🥘',
      cost: 45,
      desc: 'Đặt bàn soạn cùng bộ nồi đất kho cá, chảo chống dính, ấm đun và dao thớt gọn gàng trong nhà.',
      perkText: '+1 Xu/5s • Mở nấu ăn trong nhà (+Thể lực & +Xu) & Kê vị trí trong nhà!'
    },
    {
      id: 'app_kitchen_cabinet',
      category: 'appliances',
      name: 'Nhà Bếp Hiện Đại (Tủ Bếp, Bếp Đôi & Bồn Rửa)',
      icon: '🍳',
      cost: 75,
      desc: 'Lắp đặt ngay khu Nhà Bếp khang trang trong nhà để nấu những bữa cơm quê nóng hổi từ rau vườn và cá suối.',
      perkText: '+2 Xu/5s • Hiển thị Nhà Bếp trong nhà ngay lập tức & Nấu ăn +25% Xu!'
    },
    {
      id: 'app_fridge',
      category: 'appliances',
      name: 'Tủ Lạnh 2 Cánh Trữ Đồ Tươi Ngon',
      icon: '🧊',
      cost: 90,
      desc: 'Đặt tủ lạnh mát lạnh trong nhà giúp bảo quản trứng gà vịt, rau sạch, trái cây và cá tươi lâu ngày.',
      perkText: '+2 Xu/5s • Giảm 20% hao Thể lực & Hiển thị Tủ Lạnh trong nhà!'
    },
    {
      id: 'app_tv',
      category: 'appliances',
      name: 'Tivi Màn Hình Phẳng & Kệ Giải Trí',
      icon: '📺',
      cost: 110,
      desc: 'Đặt chiếc Tivi màn hình sáng trong nhà để xem chương trình thiên nhiên, ca nhạc quê hương mỗi tối.',
      perkText: '+3 Xu/5s • +12 Tâm An khi Xem Tivi & Hiển thị Tivi trong nhà!'
    },

    // --- 3. THÚ CƯNG ĐỒNG HÀNH & CHĂN NUÔI GÀ VỊT (pets) ---
    {
      id: 'pet_dog',
      category: 'pets',
      name: 'Chú Chó Cỏ Trung Thành (Cậu Vàng)',
      icon: '🐕',
      cost: 45,
      desc: 'Chú chó nhỏ vẫy đuôi lon ton chạy theo bước chân chủ nhân khắp sân vườn và trong nhà (có thể bật/tắt đi cùng).',
      perkText: '+2 Xu/5s • Đi cùng chủ nhân & Vuốt ve nhận +8 Tâm An!'
    },
    {
      id: 'pet_cat',
      category: 'pets',
      name: 'Mèo Mướp Dễ Thương (Hoàng Thượng)',
      icon: '🐈',
      cost: 45,
      desc: 'Chú mèo mướp đáng yêu bước đi uyển chuyển theo chủ nhân hoặc nằm phơi nắng kêu "Meo meo" chữa lành.',
      perkText: '+2 Xu/5s • Đi cùng chủ nhân & Vuốt ve nhận +8 Tâm An!'
    },
    {
      id: 'pet_bird_cage',
      category: 'pets',
      name: 'Chim Họa Mi Trong Lồng Tre',
      icon: '🦜',
      cost: 40,
      desc: 'Lồng chim tre truyền thống treo trước hiên nhà và trong phòng khách, chim nhảy nhót hót líu lo vui cửa vui nhà.',
      perkText: '+2 Xu/5s • Hiển thị Lồng Chim hót líu lo ngoài hiên & trong nhà!'
    },
    {
      id: 'farm_chickens',
      category: 'pets',
      name: 'Đàn Gà Quê Đẻ Trứng (Gà Trống & Gà Mái)',
      icon: '🐓',
      cost: 50,
      desc: 'Thả đàn gà trống, gà mái chạy lon ton mổ thóc quanh khu Chuồng Gà ngoài sân, đẻ trứng hồng mỗi ngày.',
      perkText: '+2 Xu/5s • Mở hành động Cho Gà Ăn & Nhặt Trứng kiếm Xu!'
    },
    {
      id: 'farm_ducks',
      category: 'pets',
      name: 'Đàn Vịt Bơi Lội Dưới Suối & Bờ Cỏ',
      icon: '🦆',
      cost: 55,
      desc: 'Đàn vịt quê bơi lội tung tăng dưới dòng suối mát và vẫy cánh trên bờ cỏ, kêu "Cạp cạp" rộn ràng.',
      perkText: '+2 Xu/5s • Tăng mạnh số Xu thu hoạch trứng tại Chuồng Gà Vịt!'
    },

    // --- 4. CÁC MẪU HÀNG RÀO TRANG TRÍ KHUÔN VIÊN NHÀ (fences) ---
    {
      id: 'fence_bamboo',
      category: 'fences',
      isFence: true,
      name: 'Hàng Rào Tre Trúc Làng Quê Việt & Cổng Lá',
      icon: '🎋',
      cost: 85,
      passiveCoins: 2,
      peaceBonus: 8,
      desc: 'Hàng rào nan tre đan mộc mạc bao quanh khuôn viên nhà cùng cổng vòm tre lợp lá cọ và khóm trúc xanh bình yên.',
      perkText: '+2 Xu/5s & +8 Tâm An • Bao quanh khuôn viên nhà bằng Hàng Rào Tre Trúc!'
    },
    {
      id: 'fence_white_picket',
      category: 'fences',
      isFence: true,
      name: 'Hàng Rào Gỗ Trắng Đồng Nội Châu Âu & Cúc Họa Mi',
      icon: '🏡',
      cost: 115,
      passiveCoins: 2,
      peaceBonus: 10,
      desc: 'Hàng rào thanh gỗ sơn trắng tinh khôi kiểu đồng quê Bắc Âu, điểm xuyết những khóm cúc họa mi nở trắng chân rào.',
      perkText: '+2 Xu/5s & +10 Tâm An • Trang trí khuôn viên nhà bằng Hàng Rào Gỗ Trắng!'
    },
    {
      id: 'fence_stone_moss',
      category: 'fences',
      isFence: true,
      name: 'Hàng Rào Đá Cuội Rêu Phong & Trụ Đèn Đá Cổ',
      icon: '🪨',
      cost: 140,
      passiveCoins: 3,
      peaceBonus: 12,
      desc: 'Tường rào đá suối xếp thủ công phủ lớp rêu xanh mát, hai bên cổng đặt trụ đèn đá tỏa sáng ấm áp khi đêm về.',
      perkText: '+3 Xu/5s & +12 Tâm An • Trang trí khuôn viên nhà bằng Hàng Rào Đá Cuội!'
    },
    {
      id: 'fence_pine_log',
      category: 'fences',
      isFence: true,
      name: 'Hàng Rào Gỗ Thông Bắc Âu & Dây Đèn Đom Đóm',
      icon: '🌲',
      cost: 165,
      passiveCoins: 3,
      peaceBonus: 14,
      desc: 'Hàng rào cọc gỗ thông nguyên khối thơm mùi nhựa thông, giăng dây đèn vàng đom đóm lung linh suốt bốn phía sân nhà.',
      perkText: '+3 Xu/5s & +14 Tâm An • Trang trí khuôn viên nhà bằng Hàng Rào Gỗ Thông!'
    },
    {
      id: 'fence_rose_vine',
      category: 'fences',
      isFence: true,
      name: 'Hàng Rào Mắt Cáo Hoa Hồng Leo Cổ Tích',
      icon: '🌹',
      cost: 190,
      passiveCoins: 4,
      peaceBonus: 16,
      desc: 'Hàng rào gỗ đan mắt cáo phủ đầy dây thường xuân và hàng trăm đóa hồng nhung, hồng phấn nở rộ quanh khuôn viên.',
      perkText: '+4 Xu/5s & +16 Tâm An • Trang trí khuôn viên nhà bằng Hàng Rào Hoa Hồng Leo!'
    },
    {
      id: 'fence_zen_torii',
      category: 'fences',
      isFence: true,
      name: 'Hàng Rào Thiền Viện Á Đông & Cổng Đèn Lồng Đỏ',
      icon: '⛩️',
      cost: 220,
      passiveCoins: 5,
      peaceBonus: 20,
      desc: 'Hàng rào gỗ tuyết tùng chạm khắc tinh tế kết hợp cổng vòm đỏ son và dãy đèn lồng giấy mang lại vượng khí bình an.',
      perkText: '+5 Xu/5s & +20 Tâm An • Trang trí khuôn viên nhà bằng Hàng Rào Thiền Viện!'
    }
  ],

  // --- 5. HỆ THỐNG MUA THÊM ĐẤT ĐỂ CANH TÁC & MỞ RỘNG BẢN ĐỒ THEO CẤP ĐỘ ---
  // Mở khóa khi người chơi nâng cấp lên Nhà Cấp 6 (đủ 5 nâng cấp nhà) và có số dư từ 50.000 Xu
  landExpansions: [
    {
      id: 'land_plot_1',
      level: 1,
      category: 'land_expansion',
      isLandExpansion: true,
      plotType: 'garden',
      name: 'Mở Rộng Đất Cấp 1 — Khu Trồng Rau Hữu Cơ Đông Nam',
      shortTitle: 'Đất Mở Rộng Cấp 1 (Khu Trồng Rau)',
      icon: '🗺️',
      cost: 50000,
      requiredHomeLevel: 6,
      requiredPrevId: null,
      unlockNotice: 'Bạn sẽ được mở rộng đất khi nhà nâng cấp 6 và số dư 50.000 Xu...',
      passiveCoins: 25,
      harvestBaseCoins: 48,
      peaceBonus: 18,
      coords: { x: 22.0, z: 14.5, rx: 5.6, rz: 4.4, bridgeX: 17.5, bridgeZ: 11.5 },
      desc: 'Mở thêm một khoảnh đất màu mỡ phía Đông Nam bản đồ, vừa vặn làm Khu Trồng Rau Hữu Cơ mới với giàn tưới nước và những luống rau xanh mướt.',
      perkText: '+25 Xu/5s • Canh tác thu hoạch rau trên đất mới +48~65 Xu/lần & +18 Tâm An!'
    },
    {
      id: 'land_plot_2',
      level: 2,
      category: 'land_expansion',
      isLandExpansion: true,
      plotType: 'poultry',
      name: 'Mở Rộng Đất Cấp 2 — Khu Chăn Nuôi Gà Vịt Đông Bắc',
      shortTitle: 'Đất Mở Rộng Cấp 2 (Khu Gà Vịt)',
      icon: '🐓',
      cost: 75000,
      requiredHomeLevel: 6,
      requiredPrevId: 'land_plot_1',
      unlockNotice: 'Bạn sẽ được mở rộng đất khi nhà nâng cấp 6, đã mở Đất Cấp 1 và số dư 75.000 Xu...',
      passiveCoins: 40,
      harvestBaseCoins: 68,
      peaceBonus: 22,
      coords: { x: 22.5, z: -13.5, rx: 5.8, rz: 4.5, bridgeX: 18.0, bridgeZ: -10.5 },
      desc: 'Mở thêm khoảnh đất ven đồi phía Đông Bắc bản đồ, đủ rộng để lập Khu Chăn Nuôi Gà Đẻ Trứng & Vịt Bơi Suối thứ hai đầy sinh động.',
      perkText: '+40 Xu/5s • Cho gà vịt ăn & nhặt trứng trên đất mới +68~90 Xu/lần & +22 Tâm An!'
    },
    {
      id: 'land_plot_3',
      level: 3,
      category: 'land_expansion',
      isLandExpansion: true,
      plotType: 'garden',
      name: 'Mở Rộng Đất Cấp 3 — Đồi Rau Quả & Thảo Dược Tây Nam',
      shortTitle: 'Đất Mở Rộng Cấp 3 (Đồi Thảo Dược)',
      icon: '🌿',
      cost: 110000,
      requiredHomeLevel: 6,
      requiredPrevId: 'land_plot_2',
      unlockNotice: 'Bạn sẽ được mở rộng đất khi nhà nâng cấp 6, đã mở Đất Cấp 2 và số dư 110.000 Xu...',
      passiveCoins: 60,
      harvestBaseCoins: 95,
      peaceBonus: 26,
      coords: { x: -21.5, z: 15.0, rx: 6.0, rz: 4.6, bridgeX: -17.2, bridgeZ: 12.0 },
      desc: 'Mở thêm khoảnh đất bên kia bờ suối phía Tây Nam, chuyên canh tác thảo dược quý, dâu tây và rau củ hữu cơ năng suất cao.',
      perkText: '+60 Xu/5s • Thu hoạch thảo dược & rau quả trên đất mới +95~125 Xu/lần & +26 Tâm An!'
    },
    {
      id: 'land_plot_4',
      level: 4,
      category: 'land_expansion',
      isLandExpansion: true,
      plotType: 'poultry',
      name: 'Mở Rộng Đất Cấp 4 — Trang Trại Gà Vịt & Lúa Mạch Bắc Đảo',
      shortTitle: 'Đất Mở Rộng Cấp 4 (Trang Trại Bắc Đảo)',
      icon: '🌾',
      cost: 160000,
      requiredHomeLevel: 6,
      requiredPrevId: 'land_plot_3',
      unlockNotice: 'Bạn sẽ được mở rộng đất khi nhà nâng cấp 6, đã mở Đất Cấp 3 và số dư 160.000 Xu...',
      passiveCoins: 90,
      harvestBaseCoins: 135,
      peaceBonus: 35,
      coords: { x: 0.0, z: -25.5, rx: 6.5, rz: 4.8, bridgeX: 0.0, bridgeZ: -20.8 },
      desc: 'Mở rộng bán đảo trù phú phía Bắc bản đồ, kết hợp khu chăn nuôi gà vịt sinh thái và cánh đồng lúa mạch vàng óng.',
      perkText: '+90 Xu/5s • Thu hoạch đại trang trại Bắc Đảo +135~175 Xu/lần & +35 Tâm An!'
    }
  ],

  // THÔNG SỐ MÀU SẮC & KIỂU DÁNG 3D CỦA CÁC MẪU HÀNG RÀO KHUÔN VIÊN NHÀ
  fenceStyles: {
    fence_bamboo: {
      id: 'fence_bamboo',
      name: 'Hàng Rào Tre Trúc Làng Quê Việt',
      icon: '🎋',
      postColor: '#65a30d',
      railColor: '#a3e635',
      accentColor: '#eab308',
      gateColor: '#84cc16',
      hasLanterns: false,
      hasFlowers: false,
      styleType: 'bamboo'
    },
    fence_white_picket: {
      id: 'fence_white_picket',
      name: 'Hàng Rào Gỗ Trắng Đồng Nội',
      icon: '🏡',
      postColor: '#f8fafc',
      railColor: '#e2e8f0',
      accentColor: '#facc15',
      gateColor: '#38bdf8',
      hasLanterns: false,
      hasFlowers: true,
      flowerColor: '#fef08a',
      styleType: 'picket'
    },
    fence_stone_moss: {
      id: 'fence_stone_moss',
      name: 'Hàng Rào Đá Cuội Rêu Phong',
      icon: '🪨',
      postColor: '#64748b',
      railColor: '#94a3b8',
      accentColor: '#22c55e',
      gateColor: '#475569',
      hasLanterns: true,
      hasFlowers: false,
      styleType: 'stone'
    },
    fence_pine_log: {
      id: 'fence_pine_log',
      name: 'Hàng Rào Gỗ Thông & Đèn Đom Đóm',
      icon: '🌲',
      postColor: '#78350f',
      railColor: '#b45309',
      accentColor: '#fde047',
      gateColor: '#92400e',
      hasLanterns: true,
      hasFlowers: false,
      styleType: 'pine_log'
    },
    fence_rose_vine: {
      id: 'fence_rose_vine',
      name: 'Hàng Rào Hoa Hồng Leo Cổ Tích',
      icon: '🌹',
      postColor: '#92400e',
      railColor: '#15803d',
      accentColor: '#f43f5e',
      gateColor: '#be123c',
      hasLanterns: false,
      hasFlowers: true,
      flowerColor: '#fb7185',
      styleType: 'rose_vine'
    },
    fence_zen_torii: {
      id: 'fence_zen_torii',
      name: 'Hàng Rào Thiền Viện & Đèn Lồng Đỏ',
      icon: '⛩️',
      postColor: '#b91c1c',
      railColor: '#78350f',
      accentColor: '#ef4444',
      gateColor: '#dc2626',
      hasLanterns: true,
      hasFlowers: false,
      styleType: 'zen_torii'
    }
  },

  // BỘ SƯU TẬP TRANG PHỤC TRUYỀN THỐNG CÁC QUỐC GIA TRÊN THẾ GIỚI (WORLD TRADITIONAL COSTUMES)
  // Giá bán cao (850 - 1550 Xu) tương ứng khoảng ~15 phút vừa chơi, làm việc, giải đố & tích lũy
  worldCostumes: [
    {
      id: 'costume_vietnam',
      country: 'Việt Nam',
      regionGroup: 'asia',
      flag: '🇻🇳',
      name: 'Áo Dài Ngũ Thân Hoàng Kim & Khăn Đóng',
      shortName: '🇻🇳 Áo Dài Việt Nam',
      cost: 850,
      coinMultiplierBonus: 0.25,
      passiveBonus: 3,
      top: '#eab308',
      collar: '#b91c1c',
      pants: '#fefce8',
      accent: '#fde047',
      hatType: 'vn_khandong',
      hatColor: '#b91c1c',
      pattern: 'vn_lotus',
      desc: 'Quốc phục Áo Dài truyền thống Việt Nam bằng lụa gấm hoàng kim thêu hoa sen thanh cao, kết hợp Khăn Đóng uy nghiêm.',
      perkText: '+25% Xu mọi hoạt động & +3 Xu tự động / 5s'
    },
    {
      id: 'costume_japan',
      country: 'Nhật Bản',
      regionGroup: 'asia',
      flag: '🇯🇵',
      name: 'Kimono Lụa Anh Đào & Đai Obi Thêu Hạc',
      shortName: '🇯🇵 Kimono Nhật Bản',
      cost: 920,
      coinMultiplierBonus: 0.26,
      passiveBonus: 3,
      top: '#f43f5e',
      collar: '#fda4af',
      pants: '#881337',
      accent: '#fde047',
      hatType: 'jp_kanzashi',
      hatColor: '#fb7185',
      pattern: 'jp_obi',
      desc: 'Trang phục Kimono truyền thống xứ Phù Tang với vạt áo giao lĩnh, thắt đai lưng Obi gấm vàng và trâm cài hoa anh đào.',
      perkText: '+26% Xu mọi hoạt động & +3 Xu tự động / 5s'
    },
    {
      id: 'costume_korea',
      country: 'Hàn Quốc',
      regionGroup: 'asia',
      flag: '🇰🇷',
      name: 'Hanbok Hoàng Gia Lụa Ngũ Sắc & Mũ Gat',
      shortName: '🇰🇷 Hanbok Hàn Quốc',
      cost: 920,
      coinMultiplierBonus: 0.26,
      passiveBonus: 3,
      top: '#38bdf8',
      collar: '#f43f5e',
      pants: '#ec4899',
      accent: '#fef08a',
      hatType: 'kr_gat',
      hatColor: '#1e293b',
      pattern: 'kr_hanbok',
      desc: 'Bộ Hanbok truyền thống xứ Kim Chi với áo khoác ngắn Jeogori xanh ngọc, nơ lụa Goreum đỏ thắm và phần tùng váy/quần bồng bềnh.',
      perkText: '+26% Xu mọi hoạt động & +3 Xu tự động / 5s'
    },
    {
      id: 'costume_china',
      country: 'Trung Hoa',
      regionGroup: 'asia',
      flag: '🇨🇳',
      name: 'Hán Phục Giao Lĩnh Bích Ngọc & Trâm Phượng',
      shortName: '🇨🇳 Hán Phục Cổ Phong',
      cost: 950,
      coinMultiplierBonus: 0.28,
      passiveBonus: 3,
      top: '#10b981',
      collar: '#fef08a',
      pants: '#065f46',
      accent: '#a7f3d0',
      hatType: 'cn_hairpin',
      hatColor: '#facc15',
      pattern: 'cn_hanfu',
      desc: 'Hán phục tay rộng thướt tha màu ngọc bích pha kim tuyến, đai lưng ngọc bội và mão trâm vàng cổ phong.',
      perkText: '+28% Xu mọi hoạt động & +3 Xu tự động / 5s'
    },
    {
      id: 'costume_india',
      country: 'Ấn Độ',
      regionGroup: 'asia',
      flag: '🇮🇳',
      name: 'Sari Hoàng Gia Lụa Đỏ Thêu Vàng & Bindi',
      shortName: '🇮🇳 Sari Ấn Độ',
      cost: 980,
      coinMultiplierBonus: 0.28,
      passiveBonus: 3,
      top: '#dc2626',
      collar: '#facc15',
      pants: '#991b1b',
      accent: '#fde047',
      hatType: 'in_tikka',
      hatColor: '#f59e0b',
      pattern: 'in_sari',
      desc: 'Trang phục Sari & Sherwani lộng lẫy của vùng đất sông Hằng với dải lụa vắt chéo viền vàng kim tinh xảo và ngọc Maang Tikka.',
      perkText: '+28% Xu mọi hoạt động & +3 Xu tự động / 5s'
    },
    {
      id: 'costume_thailand',
      country: 'Thái Lan',
      regionGroup: 'asia',
      flag: '🇹🇭',
      name: 'Chut Thai Chakri Ánh Hoàng Kim & Mũ Chada',
      shortName: '🇹🇭 Chut Thai Thái Lan',
      cost: 980,
      coinMultiplierBonus: 0.28,
      passiveBonus: 3,
      top: '#f59e0b',
      collar: '#fef08a',
      pants: '#78350f',
      accent: '#fde047',
      hatType: 'th_chada',
      hatColor: '#facc15',
      pattern: 'th_sabai',
      desc: 'Lễ phục truyền thống xứ Chùa Vàng với dải lụa Sabai ánh kim choàng qua vai và vương miện tháp nhọn Chada.',
      perkText: '+28% Xu mọi hoạt động & +3 Xu tự động / 5s'
    },
    {
      id: 'costume_scotland',
      country: 'Scotland',
      regionGroup: 'europe',
      flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      name: 'Kilt Tartan Kẻ Sọc Đỏ, Túi Sporran & Mũ Nồi',
      shortName: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Kilt Scotland',
      cost: 1050,
      coinMultiplierBonus: 0.30,
      passiveBonus: 4,
      top: '#1e293b',
      collar: '#dc2626',
      pants: '#b91c1c',
      accent: '#22c55e',
      hatType: 'sc_tam',
      hatColor: '#b91c1c',
      pattern: 'sc_tartan',
      desc: 'Trang phục truyền thống vùng cao nguyên Scotland với họa tiết kẻ caro Tartan đỏ-xanh, dải khăn choàng vai và mũ Tam o\' Shanter.',
      perkText: '+30% Xu mọi hoạt động & +4 Xu tự động / 5s'
    },
    {
      id: 'costume_germany',
      country: 'Đức (Bavaria)',
      regionGroup: 'europe',
      flag: '🇩🇪',
      name: 'Dirndl & Lederhosen Lễ Hội Bavaria & Mũ Lông Vũ',
      shortName: '🇩🇪 Lễ Phục Đức',
      cost: 1050,
      coinMultiplierBonus: 0.30,
      passiveBonus: 4,
      top: '#ffffff',
      collar: '#15803d',
      pants: '#78350f',
      accent: '#ef4444',
      hatType: 'de_alpine',
      hatColor: '#166534',
      pattern: 'de_bavaria',
      desc: 'Trang phục lễ hội vùng núi Alps nước Đức với dây đeo da thêu hoa Edelweiss và chiếc mũ nỉ xanh gắn lông vũ.',
      perkText: '+30% Xu mọi hoạt động & +4 Xu tự động / 5s'
    },
    {
      id: 'costume_spain',
      country: 'Tây Ban Nha',
      regionGroup: 'europe',
      flag: '🇪🇸',
      name: 'Đầm Vũ Điệu Flamenco Đỏ Đen & Hoa Hồng',
      shortName: '🇪🇸 Flamenco Tây Ban Nha',
      cost: 1120,
      coinMultiplierBonus: 0.32,
      passiveBonus: 4,
      top: '#e11d48',
      collar: '#18181b',
      pants: '#9f1239',
      accent: '#facc15',
      hatType: 'es_rose_comb',
      hatColor: '#e11d48',
      pattern: 'es_flamenco',
      desc: 'Trang phục vũ điệu Flamenco nồng nhiệt của vùng Andalusia với tầng bèo nhún đỏ rực, viền ren đen và đóa hồng đỏ cài tóc.',
      perkText: '+32% Xu mọi hoạt động & +4 Xu tự động / 5s'
    },
    {
      id: 'costume_netherlands',
      country: 'Hà Lan',
      regionGroup: 'europe',
      flag: '🇳🇱',
      name: 'Trang Phục Cối Xay Gió Volendam & Mũ Ren Trắng',
      shortName: '🇳🇱 Lễ Phục Hà Lan',
      cost: 1150,
      coinMultiplierBonus: 0.32,
      passiveBonus: 4,
      top: '#2563eb',
      collar: '#f8fafc',
      pants: '#1e3a8a',
      accent: '#f97316',
      hatType: 'nl_bonnet',
      hatColor: '#ffffff',
      pattern: 'nl_apron',
      desc: 'Trang phục truyền thống xứ sở Hoa Tulip với tạp dề sọc trắng xanh, mũ ren cánh bướm Hul và đôi guốc gỗ vàng Klompen.',
      perkText: '+32% Xu mọi hoạt động & +4 Xu tự động / 5s'
    },
    {
      id: 'costume_russia',
      country: 'Nga',
      regionGroup: 'europe',
      flag: '🇷🇺',
      name: 'Sarafan Hoàng Gia Thêu Vàng & Vương Miện Kokoshnik',
      shortName: '🇷🇺 Sarafan & Kokoshnik Nga',
      cost: 1180,
      coinMultiplierBonus: 0.34,
      passiveBonus: 4,
      top: '#b91c1c',
      collar: '#fde047',
      pants: '#7f1d1d',
      accent: '#fef08a',
      hatType: 'ru_kokoshnik',
      hatColor: '#dc2626',
      pattern: 'ru_sarafan',
      desc: 'Lễ phục truyền thống xứ Bạch Dương với áo Sarafan đỏ thêu chỉ vàng lộng lẫy và mũ vương miện vòm cao Kokoshnik đính ngọc trai.',
      perkText: '+34% Xu mọi hoạt động & +4 Xu tự động / 5s'
    },
    {
      id: 'costume_mexico',
      country: 'Mexico',
      regionGroup: 'americas',
      flag: '🇲🇽',
      name: 'Lễ Phục Mariachi / China Poblana & Mũ Sombrero',
      shortName: '🇲🇽 Sombrero Mexico',
      cost: 1250,
      coinMultiplierBonus: 0.35,
      passiveBonus: 4,
      top: '#18181b',
      collar: '#ef4444',
      pants: '#27272a',
      accent: '#facc15',
      hatType: 'mx_sombrero',
      hatColor: '#eab308',
      pattern: 'mx_serape',
      desc: 'Trang phục lễ hội âm nhạc Mexico rực rỡ sắc màu với khăn choàng thổ cẩm Serape, viền bạc và mũ rộng vành Sombrero thêu vàng.',
      perkText: '+35% Xu mọi hoạt động & +4 Xu tự động / 5s'
    },
    {
      id: 'costume_egypt',
      country: 'Ai Cập',
      regionGroup: 'world',
      flag: '🇪🇬',
      name: 'Lễ Phục Pharaoh Lụa Trắng, Cổ Áo Vàng & Mũ Nemes',
      shortName: '🇪🇬 Pharaoh Ai Cập',
      cost: 1320,
      coinMultiplierBonus: 0.38,
      passiveBonus: 5,
      top: '#f8fafc',
      collar: '#eab308',
      pants: '#fef3c7',
      accent: '#0284c7',
      hatType: 'eg_nemes',
      hatColor: '#eab308',
      pattern: 'eg_usekh',
      desc: 'Trang phục huyền thoại sông Nile với áo lụa trắng tinh khiết, vòng cổ vàng ngọc lam Usekh và mũ sọc xanh-vàng Nemes.',
      perkText: '+38% Xu mọi hoạt động & +5 Xu tự động / 5s'
    },
    {
      id: 'costume_native_america',
      country: 'Bản Địa Bắc Mỹ',
      regionGroup: 'americas',
      flag: '🪶',
      name: 'Lễ Phục Da Thuộc Thảo Nguyên & Mũ Lông Vũ Đại Bàng',
      shortName: '🪶 Mũ Lông Vũ Bắc Mỹ',
      cost: 1380,
      coinMultiplierBonus: 0.40,
      passiveBonus: 5,
      top: '#b45309',
      collar: '#06b6d4',
      pants: '#78350f',
      accent: '#fde047',
      hatType: 'na_feathers',
      hatColor: '#f8fafc',
      pattern: 'na_fringe',
      desc: 'Trang phục truyền thống của những bộ tộc thảo nguyên Bắc Mỹ gắn tua rua da thuộc, hạt cườm ngọc lam và mũ lông vũ đại bàng.',
      perkText: '+40% Xu mọi hoạt động & +5 Xu tự động / 5s'
    },
    {
      id: 'costume_greece',
      country: 'Hy Lạp Cổ Đại',
      regionGroup: 'europe',
      flag: '🇬🇷',
      name: 'Áo Chiton Thần Thoại Olympus & Vòng Nguyệt Quế Vàng',
      shortName: '🇬🇷 Chiton & Nguyệt Quế Hy Lạp',
      cost: 1450,
      coinMultiplierBonus: 0.42,
      passiveBonus: 5,
      top: '#ffffff',
      collar: '#0284c7',
      pants: '#e0f2fe',
      accent: '#eab308',
      hatType: 'gr_laurel',
      hatColor: '#facc15',
      pattern: 'gr_meander',
      desc: 'Áo choàng Chiton lụa trắng viền họa tiết kỷ hà xanh biển Aegean và vòng nguyệt quế bằng lá vàng chiến thắng.',
      perkText: '+42% Xu mọi hoạt động & +5 Xu tự động / 5s'
    },
    {
      id: 'costume_africa',
      country: 'Châu Phi (Ghana / Maasai)',
      regionGroup: 'world',
      flag: '🌍',
      name: 'Lễ Phục Thổ Cẩm Hoàng Gia Kente & Mũ Kufi Vàng',
      shortName: '🌍 Thổ Cẩm Kente Châu Phi',
      cost: 1550,
      coinMultiplierBonus: 0.45,
      passiveBonus: 6,
      top: '#f59e0b',
      collar: '#16a34a',
      pants: '#dc2626',
      accent: '#fde047',
      hatType: 'af_kufi',
      hatColor: '#eab308',
      pattern: 'af_kente',
      desc: 'Tấm vải thổ cẩm Kente dệt tay truyền thống của hoàng gia Tây Phi rực rỡ sắc vàng-đỏ-xanh lá biểu trưng cho sự trù phú và tự do.',
      perkText: '+45% Xu mọi hoạt động & +6 Xu tự động / 5s'
    }
  ],

  // NÂNG CẤP NHÀ Ở (GIÁ CÂN BẰNG ĐỂ NGƯỜI CHƠI CHĂM CHỈ KHÁM PHÁ & LÀM VIỆC)
  upgrades: [
    {
      id: 'wooden_cabin',
      stageOrder: 2,
      name: 'Cấp 2: Nhà Gỗ Thông Ấm Áp',
      icon: '🏡',
      cost: 95,
      passiveCoins: 1,
      peaceBonus: 10,
      desc: 'Thay thế chiếc lều vải nghèo khó bằng căn nhà gỗ vững chãi, bên trong có sàn gỗ, giường nệm và bàn trà.',
      perkText: '+1 Xu tự động / 5s • Mở rộng nội thất trong nhà lên Cấp 2!'
    },
    {
      id: 'veg_garden',
      stageOrder: 3,
      name: 'Cấp 3: Vườn Hoa & Gian Bếp Gỗ Trong Nhà',
      icon: '🌻',
      cost: 160,
      passiveCoins: 2,
      peaceBonus: 10,
      desc: 'Mở rộng giàn hoa hướng dương bên ngoài và lắp đặt thêm Góc Bếp nấu ăn, Thảm Dệt bên trong nhà.',
      perkText: '+2 Xu tự động / 5s • Nội thất Cấp 3 (Có Bếp & Thảm để sắp xếp)'
    },
    {
      id: 'tea_veranda',
      stageOrder: 4,
      name: 'Cấp 4: Hiên Trà, Võng Mắc & Lò Sưởi Tủ Sách',
      icon: '🍵',
      cost: 240,
      passiveCoins: 3,
      peaceBonus: 15,
      desc: 'Mắc võng ngoài hiên, đồng thời xây Lò Sưởi gạch đỏ, kệ sách gỗ và bàn trà đạo bên trong nhà.',
      perkText: '+3 Xu tự động / 5s • Nội thất Cấp 4 (Có Lò Sưởi & Tủ Sách)'
    },
    {
      id: 'koi_windmill',
      stageOrder: 5,
      name: 'Cấp 5: Hồ Cá Koi, Cối Xay Gió & Đại Sảnh Gỗ Quý',
      icon: '🎏',
      cost: 350,
      passiveCoins: 4,
      peaceBonus: 15,
      desc: 'Đào hồ cá Koi, dựng cối xay gió ngoài sân (có thể di chuyển vị trí) và nâng cấp nội thất Cấp 5.',
      perkText: '+4 Xu tự động / 5s • Mở công trình Cối Xay Gió & Nội thất Cấp 5!'
    },
    {
      id: 'sanctuary_bell',
      stageOrder: 6,
      name: 'Cấp 6: Tháp Chuông Nguyện Cầu & Đàn Piano Trong Nhà',
      icon: '🔔',
      cost: 480,
      passiveCoins: 6,
      peaceBonus: 25,
      desc: 'Dựng Tháp Chuông bình an ngoài sân và đặt Đàn Piano gỗ, góc thiền định/cầu nguyện trong nhà.',
      perkText: '+6 Xu tự động / 5s • Hoàn thiện Tổ Ấm Cấp 6 Viên Mãn!'
    }
  ],

  quests: [
    { id: 'q_walk_click', text: 'Click chuột lên mặt đất để nhân vật tự đi bộ khám phá', reward: 10, done: false },
    { id: 'q_work', text: 'Thực hiện công việc Chặt củi hoặc Trồng rau kiếm Xu', reward: 12, done: false },
    { id: 'q_enter_house', text: 'Bước vào thăm không gian rộng rãi Bên Trong Ngôi Nhà', reward: 12, done: false },
    { id: 'q_buy_tool', text: 'Mua 1 món đồ, gia dụng hoặc thú cưng tại Cửa Hàng Sinh Tồn', reward: 18, done: false },
    { id: 'q_pets_poultry', text: 'Chăm sóc Thú cưng hoặc Cho đàn Gà Vịt ăn & nhặt trứng', reward: 20, done: false },
    { id: 'q_move_layout', text: 'Dùng "Sắp Xếp Vị Trí" di chuyển 1 công trình hoặc đồ vật', reward: 20, done: false },
    { id: 'q_quiz', text: 'Trả lời đúng 1 câu hỏi Đố Vui Thông Thái', reward: 15, done: false },
    { id: 'q_upgrade1', text: 'Tích góp Xu nâng cấp Lều Vải Cấp 1 lên Nhà Gỗ Cấp 2', reward: 30, done: false }
  ],

  questions: [
    {
      cat: 'nature',
      q: 'Thành ngữ "Mưa thuận gió hoà" trong văn hoá Việt Nam thường gửi gắm ước vọng gì lớn nhất?',
      options: [
        'Thời tiết ôn hoà, mùa màng bội thu, cuộc sống bình yên ấm no',
        'Ngày nào cũng có mưa to để khỏi phải tưới cây',
        'Gió thổi thật mạnh để chạy thuyền buồm ra khơi',
        'Trời luôn lạnh giá như mùa đông châu Âu'
      ],
      ans: 0,
      explain: 'Chính xác! "Mưa thuận gió hoà" là lời chúc cho thiên nhiên hiền hoà, con người an cư lạc nghiệp và tâm hồn bình an.'
    },
    {
      cat: 'nature',
      q: 'Khi dựng lều hoặc làm nhà gỗ ở vùng núi cao nhiều sương mù, hướng nhà nào ở Việt Nam thường được ưa chuộng để đón gió mát mùa hè và tránh gió lạnh mùa đông?',
      options: [
        'Hướng Nam hoặc Đông Nam',
        'Hướng chính Bắc',
        'Hướng Tây nắng gắt buổi chiều',
        'Quay mặt vào vách đá kín bưng'
      ],
      ans: 0,
      explain: 'Tuyệt vời! Ông bà ta có câu "Lấy vợ hiền hoà, làm nhà hướng Nam" vì đón được gió mát lành và ánh sáng chan hoà.'
    },
    {
      cat: 'nature',
      q: 'Loại nước tự nhiên nào sau đây vừa giàu khoáng chất vừa giúp cây rau trong vườn phát triển xanh tốt vượt bậc sau mỗi cơn dông?',
      options: [
        'Nước mưa tự nhiên đầu mùa',
        'Nước muối mặn ngoài khơi',
        'Nước ngọt có gas đóng chai',
        'Nước đá lạnh vừa tan'
      ],
      ans: 0,
      explain: 'Chuẩn xác! Trong cơn mưa dông, tia chớp giúp tổng hợp một lượng đạm tự nhiên hoà vào nước mưa khiến cây cối bật mầm xanh mướt.'
    },
    {
      cat: 'nature',
      q: 'Ở vùng gần biển, loài cây nào thường được trồng thành rặng dài để chắn cát bay, giữ đất và tạo bóng mát thanh bình?',
      options: [
        'Cây phi lao (dương liễu) và cây dừa',
        'Cây xương rồng nhỏ trong chậu',
        'Cây hoa hồng leo',
        'Cây rêu đá'
      ],
      ans: 0,
      explain: 'Đúng rồi! Rặng dừa và hàng phi lao rì rào trong gió là biểu tượng bất hủ của vùng biển yên bình.'
    },
    {
      cat: 'nature',
      q: 'Mẹo dân gian nhìn mây đoán thời tiết: "Chuồn chuồn bay thấp thì mưa, bay cao thì nắng, bay vừa thì..." gì?',
      options: [
        'Thì râm',
        'Thì bão',
        'Thì tuyết rơi',
        'Thì hạn hán'
      ],
      ans: 0,
      explain: 'Chính xác! Khi độ ẩm không khí cao trước cơn mưa, cánh chuồn chuồn nặng hơi nước nên chúng thường bay thấp.'
    },
    {
      cat: 'healing',
      q: 'Trong lối sống "Chữa lành & Chánh niệm", khi tâm trí đang căng thẳng vì nhịp sống vội vã, hành động đơn giản nào giúp hệ thần kinh dịu lại nhanh nhất?',
      options: [
        'Hít sâu chậm rãi bằng bụng và lắng nghe âm thanh tự nhiên quanh mình',
        'Lướt mạng xã hội liên tục đến 3 giờ sáng',
        'Uống liền 4 ly cà phê đặc lúc nửa đêm',
        'Vừa ăn cơm vừa lo lắng chuyện năm sau'
      ],
      ans: 0,
      explain: 'Chính xác! Chỉ cần 3 hơi thở sâu có ý thức kết hợp tiếng nước chảy hoặc nhạc nhẹ sẽ kích hoạt hệ thần kinh đối giao cảm giúp tâm an.'
    },
    {
      cat: 'healing',
      q: 'Triết lý "Biết Đủ" (Tri túc) dạy chúng ta điều gì khi rời bỏ phố thị ồn ào về sống gần thiên nhiên?',
      options: [
        'Người biết đủ thì dù nằm trên cỏ ngắm mây cũng thấy tâm hồn giàu có, tự tại',
        'Phải tích trữ thật nhiều đồ đạc không dùng tới',
        'Không bao giờ làm việc hay chăm sóc nơi ở nữa',
        'Luôn so sánh lều của mình với biệt thự của người khác'
      ],
      ans: 0,
      explain: 'Rất sâu sắc! "Tri túc tiện túc, đãi túc hà thời túc" — Biết đủ là đủ, đợi cho đủ thì biết bao giờ mới đủ.'
    },
    {
      cat: 'healing',
      q: 'Vì sao trong game "Mưa Thuận Gió Hoà", ngay cả khi nhân vật nằm ngủ nướng vẫn được cộng thêm Xu An Nhiên (dù chậm hơn đi làm)?',
      options: [
        'Bởi nghỉ ngơi đúng lúc cũng là cách tái tạo năng lượng và chữa lành tâm hồn',
        'Vì lỗi của hệ thống ngân hàng phố thị',
        'Vì ngủ càng nhiều thì cây tự biến thành vàng',
        'Vì không cần làm gì cả đời'
      ],
      ans: 0,
      explain: 'Đúng vậy! Khi ta cho phép bản thân nghỉ ngơi hợp lý, cơ thể hồi phục thể lực để tiếp tục lao động dựng xây tổ ấm.'
    },
    {
      cat: 'spiritual',
      q: 'Trong truyền thống Nhạc Thánh Ca Công Giáo, nhạc cụ nào thường vang lên trong thánh đường với âm sắc trang nghiêm, nâng tâm hồn lên cùng sự bình an?',
      options: [
        'Đàn Đại Quản Cầm (Pipe Organ) và Hợp xướng (Choir)',
        'Trống điện tử EDM công suất lớn',
        'Kèn cổ vũ bóng đá',
        'Đàn guitar điện'
      ],
      ans: 0,
      explain: 'Tuyệt vời! Tiếng đàn Organ ngân vang hoà cùng tiếng chuông chiều tạo nên không gian cầu nguyện vô cùng thánh thiện và lắng đọng.'
    },
    {
      cat: 'spiritual',
      q: 'Lời cầu nguyện nổi tiếng của Thánh Phanxicô Assisi — vị thánh yêu thiên nhiên và muôn loài — mở đầu bằng câu ước nguyện nào?',
      options: [
        '"Lạy Chúa, xin hãy dùng con như khí cụ bình an của Chúa"',
        '"Xin cho con trúng số độc đắc ngay chiều nay"',
        '"Xin cho con không bao giờ phải làm việc"',
        '"Xin cho mọi người đều sợ hãi con"'
      ],
      ans: 0,
      explain: 'Chính xác! Kinh Hoà Bình của Thánh Phanxicô Assisi là một trong những bài cầu nguyện đẹp nhất về tình yêu thương, sự tha thứ và bình an.'
    },
    {
      cat: 'spiritual',
      q: 'Trong nghệ thuật Thiền định phương Đông, âm thanh của "Chuông xoay Tây Tạng" (Singing Bowl) có tác dụng gì?',
      options: [
        'Tạo độ rung ngân dài giúp thu nhiếp tâm ý, đưa tâm trí trở về giây phút hiện tại',
        'Dùng để nấu súp trên bếp lửa',
        'Dùng để gọi gia súc chạy nhanh',
        'Làm người nghe giật mình tỉnh ngủ'
      ],
      ans: 0,
      explain: 'Đúng rồi! Mỗi tiếng chuông ngân như một lời nhắc nhở nhẹ nhàng để buông bỏ tạp niệm.'
    },
    // ================= BỘ CÂU HỎI HÓC BÚA: SỰ THẬT HÀI HƯỚC & BẤT NGỜ TỪ CUỘC SỐNG =================
    {
      cat: 'brainteaser',
      q: '[Đố Hóc Búa] Theo phân loại thực vật học chính xác, quả Dâu Tây và quả Chuối thì quả nào mới thực sự là "quả mọng" (Berry)?',
      options: [
        'Quả Chuối mới là quả mọng, còn Dâu Tây thì KHÔNG phải!',
        'Dâu Tây chắc chắn là quả mọng vì có chữ Berry trong tiếng Anh',
        'Cả hai đều là củ dưới đất',
        'Không quả nào có thật cả'
      ],
      ans: 0,
      explain: 'Sự thật bất ngờ! Chuối (và cả dưa hấu, cà chua, bí ngô) mới là quả mọng (Berry) chính hiệu, còn Dâu Tây thực chất là phần đế hoa phình to!'
    },
    {
      cat: 'brainteaser',
      q: '[Đố Hóc Búa] Nếu bạn đi ngủ lúc 8 giờ tối và vặn đồng hồ báo thức loại kim cơ học cổ điển kêu lúc 9 giờ sáng hôm sau, bạn sẽ ngủ được mấy tiếng trước khi chuông reo?',
      options: [
        'Chỉ ngủ được đúng 1 tiếng đồng hồ!',
        'Ngủ sướng tận 13 tiếng đồng hồ',
        'Ngủ được 12 tiếng đồng hồ',
        'Đồng hồ tự tắt để bạn ngủ nướng'
      ],
      ans: 0,
      explain: 'Haha bị lừa rồi nhé! Đồng hồ kim cơ học cổ điển chỉ có 12 số (không phân biệt ngày/đêm), nên đúng 9 giờ tối (tức 1 tiếng sau) nó đã reo inh ỏi rồi!'
    },
    {
      cat: 'brainteaser',
      q: '[Sự Thật Bất Ngờ] Loài động vật nào trên Trái Đất có hình dạng phân... vuông vức như những viên xúc xắc (hình lập phương) để đánh dấu lãnh thổ mà không bị lăn đi?',
      options: [
        'Thú có túi Wombat ở Úc',
        'Gấu trúc Panda',
        'Vịt cỏ miền Tây',
        'Chó Shiba Inu'
      ],
      ans: 0,
      explain: 'Sự thật 100% khoa học! Cấu trúc ruột đặc biệt của loài Wombat tạo ra những "viên gạch" vuông vức để xếp lên mỏm đá mà không sợ lăn xuống dốc!'
    },
    {
      cat: 'brainteaser',
      q: '[Đố Hóc Búa] Một bác nông dân có 17 con cừu trên đồi. Trận mưa dông ập tới làm tất cả đều chạy tán loạn, ngoại trừ 9 con vẫn đứng yên. Hỏi bác nông dân còn lại mấy con ở đó?',
      options: [
        'Còn đúng 9 con!',
        'Còn 8 con (17 trừ 9)',
        'Còn 26 con',
        'Không còn con nào'
      ],
      ans: 0,
      explain: 'Đọc kỹ nha: "Ngoại trừ 9 con vẫn đứng yên", vậy tại chỗ đó hiển nhiên còn đúng 9 con chứ đừng lấy 17 trừ 9 nhé!'
    },
    {
      cat: 'brainteaser',
      q: '[Sự Thật Hài Hước] Loài vật biển quen thuộc nào có trái tim... nằm ngay trên đầu của chúng?',
      options: [
        'Con Tôm',
        'Con Cá Voi Xanh',
        'Con Cua Đồng',
        'Con Sao Biển'
      ],
      ans: 0,
      explain: 'Thật bất ngờ! Về mặt giải phẫu, phần đầu và ngực của con tôm hợp nhất dưới một lớp vỏ giáp, nên tim của tôm nằm ngay trên đầu!'
    },
    {
      cat: 'brainteaser',
      q: '[Đố Hóc Búa] Cái gì bạn càng lấy đi nhiều bao nhiêu thì bản thân nó lại càng... TO ra bấy nhiêu?',
      options: [
        'Cái hố đất ngoài vườn',
        'Túi tiền Xu An Nhiên',
        'Nồi cơm quê mới nấu',
        'Cục nước đá trong tủ lạnh'
      ],
      ans: 0,
      explain: 'Chính xác! Cái hố đất mà bạn càng xúc đất lấy đi nhiều bao nhiêu thì cái hố lại càng rộng và sâu ra bấy nhiêu!'
    },
    {
      cat: 'brainteaser',
      q: '[Sự Thật Bất Ngờ] Mật ong nguyên chất nếu được đậy kín trong hũ sành khô ráo thì sau bao lâu sẽ bị hết hạn sử dụng?',
      options: [
        'Gần như KHÔNG BAO GIỜ hỏng (hàng ngàn năm vẫn ăn được)!',
        'Hỏng sau đúng 7 ngày',
        'Hết hạn sau 1 mùa mưa',
        'Biến thành nước lã sau 2 năm'
      ],
      ans: 0,
      explain: 'Kỳ diệu chưa! Các nhà khảo cổ từng tìm thấy những hũ mật ong 3.000 năm tuổi trong lăng mộ Ai Cập cổ đại mà vẫn hoàn toàn ăn được!'
    },
    {
      cat: 'brainteaser',
      q: '[Đố Mẹo Cuộc Sống] Tháng nào trong năm mà con người trên khắp thế giới đều... nói ít nhất?',
      options: [
        'Tháng Hai (vì chỉ có 28 hoặc 29 ngày)',
        'Tháng Mười Hai vì trời lạnh cóng môi',
        'Tháng Bảy vì mưa ngâu',
        'Tháng Giêng vì bận ăn Tết'
      ],
      ans: 0,
      explain: 'Hài hước mà chuẩn không cần chỉnh! Tháng 2 có ít ngày nhất trong năm nên tổng số lời nói đương nhiên ít hơn các tháng 30-31 ngày!'
    },
    {
      cat: 'brainteaser',
      q: '[Sự Thật Hài Hước] Khi loài Rái Cá biển đi ngủ trôi nổi trên mặt nước, chúng thường làm hành động cực kỳ đáng yêu nào để không bị sóng cuốn trôi xa nhau?',
      options: [
        'Nắm chặt tay nhau (hoặc quấn vào rong biển) thành một bè nổi!',
        'Mỗi con ôm một cái mỏ neo sắt',
        'Bơi vào bờ thuê lều ngủ',
        'Đội nón lá che mặt'
      ],
      ans: 0,
      explain: 'Đáng yêu xỉu! Rái cá biển thật sự nắm tay nhau khi ngủ trên mặt nước để cả gia đình không bị dòng hải lưu tách rời.'
    },
    {
      cat: 'brainteaser',
      q: '[Đố Hóc Búa] Bạn bước vào căn nhà gỗ trong đêm tối chỉ có duy nhất 1 que diêm. Trong nhà có 1 cây đèn dầu, 1 đống củi khô và 1 bếp lò sưởi. Bạn phải đốt cái gì TRƯỚC TIÊN?',
      options: [
        'Đốt que diêm trước tiên!',
        'Đốt cây đèn dầu trước cho sáng',
        'Đốt bếp lò sưởi trước cho ấm',
        'Đốt đống củi khô'
      ],
      ans: 0,
      explain: 'Quá tỉnh táo! Không quẹt cháy que diêm trước tiên thì làm sao châm lửa cho đèn dầu hay bếp củi được!'
    },
    {
      cat: 'brainteaser',
      q: '[Sự Thật Bất Ngờ] Giữa "Cây Tre / Trúc" và "Cây Sồi cổ thụ", thực chất cây Tre thuộc họ thực vật nào?',
      options: [
        'Tre và Trúc thực chất là một loài... CỎ khổng lồ (họ Hoà thảo)!',
        'Họ cây gỗ lim nghìn năm',
        'Họ cây xương rồng sa mạc',
        'Họ rong rêu dưới nước'
      ],
      ans: 0,
      explain: 'Bất ngờ chưa! Dù cao vút và cứng cáp để dựng nhà, tre và trúc thực chất thuộc phân họ Cỏ (Poaceae) và có thể mọc cao thêm tới gần 1 mét mỗi ngày!'
    },
    {
      cat: 'brainteaser',
      q: '[Đố Hóc Búa] Bố của Mary có 5 người con gái tên là: Nana, Nene, Nini, Nono. Hỏi người con gái thứ 5 tên là gì?',
      options: [
        'Tên là Mary!',
        'Tên là Nunu',
        'Tên là Nyny',
        'Chưa kịp đặt tên'
      ],
      ans: 0,
      explain: 'Haha! Ngay đầu câu hỏi đã nói rõ "Bố của Mary có 5 người con gái" rồi mà, nhiều người cứ quen miệng đoán là Nunu đấy!'
    },
    {
      cat: 'brainteaser',
      q: '[Sự Thật Hài Hước] Con Bò Sữa ngoài đời thực có một đặc điểm tâm lý rất giống con người: Khi nào thì bò cho nhiều sữa và sữa ngon hơn hẳn?',
      options: [
        'Khi nó có một "người bạn thân" đứng cạnh và được nghe nhạc nhẹ thư giãn!',
        'Khi nó vừa chạy bộ marathon 42km',
        'Khi nó thức trắng đêm xem bóng đá',
        'Khi bị bắt giải toán cao cấp'
      ],
      ans: 0,
      explain: 'Khoa học chứng minh 100%! Các nghiên cứu đại học ở Anh cho thấy bò sữa có bạn thân (Best friend); khi được ở cạnh bạn thân và nghe nhạc êm dịu, mức cortisol giảm xuống và sản lượng sữa tăng rõ rệt!'
    },
    {
      cat: 'brainteaser',
      q: '[Đố Hóc Búa] Có một con gà trống đứng ngay trên đỉnh chóp mái nhà gỗ hình chữ A. Gió thổi từ hướng Đông sang hướng Tây. Hỏi khi nó đẻ trứng, quả trứng sẽ lăn về hướng nào?',
      options: [
        'Gà trống thì làm sao mà đẻ trứng được!',
        'Lăn về hướng Tây theo chiều gió',
        'Lăn về hướng Đông ngược chiều gió',
        'Đứng yên trên nóc nhà'
      ],
      ans: 0,
      explain: 'Suýt nữa thì tính tốc độ gió rồi! Gà trống chỉ biết gáy "Ò ó o" gọi bình minh thôi chứ không đẻ trứng đâu nhé!'
    }
  ]
};

window.matchRegionFromDescription = function(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const text = rawText.toLowerCase().trim();
  if (!text) return null;

  let bestRegionId = 'mountain';
  let bestScore = 0;
  let matchedWords = [];

  const regions = window.GAME_DATA.regions;
  for (const regKey in regions) {
    if (!Object.prototype.hasOwnProperty.call(regions, regKey)) continue;
    const reg = regions[regKey];
    let score = 0;
    const currentMatches = [];
    for (let i = 0; i < reg.keywords.length; i++) {
      const kw = reg.keywords[i];
      if (text.indexOf(kw) !== -1) {
        score += kw.indexOf(' ') !== -1 ? 3 : 2;
        currentMatches.push(kw);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestRegionId = reg.id;
      matchedWords = currentMatches;
    }
  }

  if (bestScore === 0) {
    if (text.indexOf('nước') !== -1 || text.indexOf('cá') !== -1 || text.indexOf('mát') !== -1) {
      bestRegionId = 'river';
      matchedWords = ['sông nước mát lành'];
    } else if (text.indexOf('buồn') !== -1 || text.indexOf('một mình') !== -1 || text.indexOf('tĩnh') !== -1) {
      bestRegionId = 'bamboo';
      matchedWords = ['không gian tĩnh lặng'];
    } else if (text.indexOf('nắng') !== -1 || text.indexOf('ấm') !== -1) {
      bestRegionId = 'sea';
      matchedWords = ['vùng nắng ấm'];
    } else {
      bestRegionId = 'valley';
      matchedWords = ['thung lũng bình yên'];
    }
  }

  return {
    regionId: bestRegionId,
    region: regions[bestRegionId],
    matchedWords: matchedWords
  };
};
