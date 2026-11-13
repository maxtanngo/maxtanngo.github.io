export const library = [
  {
    "subject": "Toán",
    "grade": 9,
    "title": "Phương trình và hệ bậc nhất hai ẩn",
    "rule": "Có thể dùng thế hoặc cộng đại số. Khi tìm được một ẩn, thay lại để tìm ẩn còn lại và kiểm tra cả hai phương trình.",
    "example": {
      "prompt": "Cho hệ x + y = 8; x − y = 0. Tìm x.",
      "answer": "4",
      "solution": "Cộng hai phương trình được 2x = 8.",
      "hint": "Cộng hai vế để khử y."
    },
    "url": "/hoc-tap/vietmath-thcs/#bai/systems"
  },
  {
    "subject": "Toán",
    "grade": 9,
    "title": "Bất đẳng thức, bất phương trình và phương trình quy về bậc nhất",
    "rule": "Đổi chiều bất phương trình khi nhân hoặc chia hai vế cho số âm. Với phương trình chứa mẫu, kiểm tra điều kiện xác định trước khi nhận nghiệm.",
    "example": {
      "prompt": "Giải −2x > −8.",
      "answer": "x < 4",
      "solution": "Chia hai vế cho −2 nên phải đổi chiều.",
      "hint": "Chú ý hệ số âm.",
      "choices": [
        "x < 4",
        "x > 4",
        "x ≤ 4",
        "x ≥ 4"
      ]
    },
    "url": "/hoc-tap/vietmath-thcs/#bai/inequalities"
  },
  {
    "subject": "Toán",
    "grade": 9,
    "title": "Căn bậc hai, căn bậc ba và biến đổi căn thức",
    "rule": "√(a²) = |a| với mọi số thực a. Căn bậc ba của số âm là số âm; điều kiện của căn bậc hai là biểu thức dưới căn không âm.",
    "example": {
      "prompt": "Tính √((-4)²).",
      "answer": "4",
      "solution": "Căn bậc hai số học của bình phương bằng giá trị tuyệt đối.",
      "hint": "Kết quả căn bậc hai số học không âm."
    },
    "url": "/hoc-tap/vietmath-thcs/#bai/radicals"
  },
  {
    "subject": "Toán",
    "grade": 9,
    "title": "Hàm số y = ax² và đồ thị parabol",
    "rule": "Đồ thị y = ax² với a khác 0 nhận trục tung làm trục đối xứng. Khi a dương, parabol mở lên; khi a âm, parabol mở xuống.",
    "example": {
      "prompt": "Cho y = 2x². Tính y tại x = −4.",
      "answer": "32",
      "solution": "Bình phương số âm cho số dương: y = 2 × 16.",
      "hint": "Bình phương trước khi nhân 2."
    },
    "url": "/hoc-tap/vietmath-thcs/#bai/parabola"
  },
  {
    "subject": "Toán",
    "grade": 9,
    "title": "Phương trình bậc hai và hệ thức Viète",
    "rule": "Với ax² + bx + c = 0, a khác 0, xét Δ = b² − 4ac. Khi có hai nghiệm, tổng bằng −b/a và tích bằng c/a.",
    "example": {
      "prompt": "Tổng hai nghiệm của x² − 5x + 4 = 0 bằng bao nhiêu?",
      "answer": "5",
      "solution": "Theo Viète, x₁ + x₂ = −b/a = 5.",
      "hint": "Chú ý dấu của b."
    },
    "url": "/hoc-tap/vietmath-thcs/#bai/quadratic"
  },
  {
    "subject": "Toán",
    "grade": 9,
    "title": "Tỉ số lượng giác trong tam giác vuông",
    "rule": "Với một góc nhọn, sin = đối/huyền, cos = kề/huyền, tan = đối/kề. Xác định cạnh đối và cạnh kề theo góc đang xét.",
    "example": {
      "prompt": "Trong tam giác vuông, cạnh đối góc α dài 12 và cạnh huyền dài 20. Tìm sin α.",
      "answer": "3/5",
      "solution": "sin α = đối/huyền = 3/5.",
      "hint": "Xác định cạnh đối."
    },
    "url": "/hoc-tap/vietmath-thcs/#bai/trigonometry"
  },
  {
    "subject": "Toán",
    "grade": 9,
    "title": "Đường tròn, tiếp tuyến, dây và cung",
    "rule": "Tiếp tuyến vuông góc với bán kính tại tiếp điểm. Hai tiếp tuyến kẻ từ cùng một điểm ngoài đường tròn có độ dài bằng nhau.",
    "example": {
      "prompt": "PA và PB là hai tiếp tuyến từ P. PA = 4 cm. Tính PB (cm).",
      "answer": "4",
      "solution": "Hai đoạn tiếp tuyến xuất phát từ cùng điểm P bằng nhau.",
      "hint": "Áp dụng tính chất hai tiếp tuyến cắt nhau."
    },
    "url": "/hoc-tap/vietmath-thcs/#bai/circles"
  },
  {
    "subject": "Toán",
    "grade": 9,
    "title": "Góc nội tiếp và tứ giác nội tiếp",
    "rule": "Góc nội tiếp bằng nửa số đo cung bị chắn. Hai góc đối của tứ giác nội tiếp có tổng bằng 180°.",
    "example": {
      "prompt": "Góc nội tiếp chắn cung có số đo 88°. Góc đó bằng bao nhiêu độ?",
      "answer": "44",
      "solution": "Lấy nửa số đo cung bị chắn.",
      "hint": "Chia số đo cung cho 2."
    },
    "url": "/hoc-tap/vietmath-thcs/#bai/inscribed"
  },
  {
    "subject": "Toán",
    "grade": 9,
    "title": "Độ dài cung, hình quạt và đa giác đều",
    "rule": "Cung n độ có độ dài πRn/180. Diện tích quạt n độ bằng πR²n/360. Các góc ở tâm giữa hai đỉnh liên tiếp của đa giác đều bằng nhau.",
    "example": {
      "prompt": "Tính độ dài cung 90° của đường tròn bán kính 8 cm. Nhập theo π, ví dụ 2π.",
      "answer": "4π",
      "solution": "Một phần tư chu vi bằng (2π × 8)/4 = 4π.",
      "hint": "90° chiếm 1/4 vòng tròn."
    },
    "url": "/hoc-tap/vietmath-thcs/#bai/circular-measures"
  },
  {
    "subject": "Toán",
    "grade": 9,
    "title": "Hình trụ, hình nón và hình cầu",
    "rule": "V hình trụ = πr²h. V hình nón = πr²h/3. V hình cầu = 4πr³/3.",
    "example": {
      "prompt": "Hình trụ bán kính đáy 4 cm, cao 2 cm. Nhập thể tích theo π.",
      "answer": "32π",
      "solution": "V = π × 16 × 2.",
      "hint": "Tính diện tích đáy tròn trước."
    },
    "url": "/hoc-tap/vietmath-thcs/#bai/space"
  },
  {
    "subject": "Toán",
    "grade": 9,
    "title": "Bảng tần số, tần số tương đối và dữ liệu ghép nhóm",
    "rule": "Tần số là số lần xuất hiện; tần số tương đối bằng tần số chia tổng số quan sát. Khi ghép nhóm, mỗi giá trị thuộc đúng một nhóm.",
    "example": {
      "prompt": "Một nhóm có 12 kết quả trong 40 quan sát. Tần số tương đối của nhóm bằng bao nhiêu phần trăm?",
      "answer": "30",
      "solution": "Lấy 12/40 = 0,3 = 30%.",
      "hint": "Chia tần số cho tổng quan sát."
    },
    "url": "/hoc-tap/vietmath-thcs/#bai/frequency"
  },
  {
    "subject": "Toán",
    "grade": 9,
    "title": "Không gian mẫu và xác suất",
    "rule": "Không gian mẫu gồm tất cả kết quả có thể. Với các kết quả đồng khả năng, P(A) = số kết quả thuận lợi / tổng số kết quả.",
    "example": {
      "prompt": "Hộp có 4 bi đỏ và 8 bi xanh giống nhau về kích thước, lấy ngẫu nhiên một bi. Tìm xác suất lấy bi đỏ.",
      "answer": "1/3",
      "solution": "Có 4 kết quả thuận lợi trong 12 kết quả đồng khả năng.",
      "hint": "Đếm bi đỏ và tổng số bi."
    },
    "url": "/hoc-tap/vietmath-thcs/#bai/sample-space"
  },
  {
    "subject": "Toán",
    "grade": 12,
    "title": "Đạo hàm, biến thiên và cực trị",
    "rule": "Dùng dấu f′ để xét đồng biến, nghịch biến. Nếu f′ đổi dấu từ âm sang dương qua x₀ thì x₀ là điểm cực tiểu.",
    "example": {
      "prompt": "Tìm hoành độ cực tiểu của y=x²−8x+1.",
      "answer": "4",
      "solution": "f′=2x−8; đạo hàm đổi dấu từ âm sang dương tại x=4.",
      "hint": "Giải f′=0 rồi xét dấu."
    },
    "url": "/hoc-tap/vietmath-thpt/#bai/variation12"
  },
  {
    "subject": "Toán",
    "grade": 12,
    "title": "Tiệm cận và khảo sát đồ thị",
    "rule": "Nếu giới hạn khi x tiến tới ±∞ bằng b thì y=b là tiệm cận ngang. Nếu một giới hạn một phía tại a vô hạn thì x=a là tiệm cận đứng.",
    "example": {
      "prompt": "Tung độ tiệm cận ngang của y=(4x+1)/(x−2)?",
      "answer": "4",
      "solution": "Chia tử mẫu cho x, giới hạn bằng hệ số bậc nhất của tử chia hệ số bậc nhất của mẫu.",
      "hint": "So hệ số của x."
    },
    "url": "/hoc-tap/vietmath-thpt/#bai/asymptote12"
  },
  {
    "subject": "Toán",
    "grade": 12,
    "title": "Tối ưu hóa bằng đạo hàm",
    "rule": "Lập hàm mục tiêu theo một biến, xác định miền giá trị và so sánh tại điểm tới hạn cùng các đầu mút phù hợp.",
    "example": {
      "prompt": "Hình chữ nhật có chu vi 32. Tính diện tích lớn nhất.",
      "answer": "64",
      "solution": "Tổng hai cạnh là 16; tích lớn nhất khi hai cạnh bằng 8.",
      "hint": "Viết diện tích x(4n−x)."
    },
    "url": "/hoc-tap/vietmath-thpt/#bai/optimization12"
  },
  {
    "subject": "Toán",
    "grade": 12,
    "title": "Nguyên hàm, tích phân và ứng dụng",
    "rule": "Nếu F′=f thì tích phân từ a đến b của f bằng F(b)−F(a). Diện tích hình phẳng dùng tích phân của giá trị tuyệt đối hiệu hai đồ thị.",
    "example": {
      "prompt": "Tính ∫₀^4 2x dx.",
      "answer": "16",
      "solution": "Nguyên hàm 2x là x². Thay cận trên rồi trừ cận dưới.",
      "hint": "Dùng F(b)−F(a)."
    },
    "url": "/hoc-tap/vietmath-thpt/#bai/integral12"
  },
  {
    "subject": "Toán",
    "grade": 12,
    "title": "Vectơ và tọa độ trong không gian Oxyz",
    "rule": "Độ dài vectơ (x,y,z) là √(x²+y²+z²). Tích vô hướng là tổng tích ba cặp tọa độ.",
    "example": {
      "prompt": "Tính độ dài vectơ (12; 16; 0).",
      "answer": "20",
      "solution": "Áp dụng công thức căn tổng bình phương.",
      "hint": "Dùng bộ 3–4–5."
    },
    "url": "/hoc-tap/vietmath-thpt/#bai/vectors12"
  },
  {
    "subject": "Toán",
    "grade": 12,
    "title": "Mặt phẳng, đường thẳng và mặt cầu",
    "rule": "Mặt phẳng ax+by+cz+d=0 có pháp tuyến (a,b,c). Mặt cầu tâm I(a,b,c), bán kính R có tổng ba bình phương khoảng cách tọa độ bằng R².",
    "example": {
      "prompt": "Khoảng cách từ O đến mặt phẳng z−4=0?",
      "answer": "4",
      "solution": "Mặt phẳng song song Oxy, chân chiếu của O là (0;0;4).",
      "hint": "Khoảng cách là độ chênh cao độ."
    },
    "url": "/hoc-tap/vietmath-thpt/#bai/space12"
  },
  {
    "subject": "Toán",
    "grade": 12,
    "title": "Độ phân tán của mẫu số liệu ghép nhóm",
    "rule": "Phương sai xấp xỉ là trung bình có trọng số của bình phương độ lệch. Độ lệch chuẩn bằng căn bậc hai của phương sai.",
    "example": {
      "prompt": "Phương sai của một mẫu là 16. Độ lệch chuẩn?",
      "answer": "4",
      "solution": "Độ lệch chuẩn bằng căn dương của phương sai.",
      "hint": "Lấy căn bậc hai."
    },
    "url": "/hoc-tap/vietmath-thpt/#bai/grouped12"
  },
  {
    "subject": "Toán",
    "grade": 12,
    "title": "Xác suất có điều kiện và Bayes",
    "rule": "P(A|B)=P(A∩B)/P(B), với P(B)>0. Công thức xác suất toàn phần cộng các nhánh. Bayes đảo điều kiện bằng cách chia xác suất giao cho xác suất biến cố đã biết.",
    "example": {
      "prompt": "P(A∩B)=0,15; P(B)=0,5. Tính P(A|B).",
      "answer": "0.3",
      "solution": "Lấy 0,15 chia 0,5.",
      "hint": "Mẫu số là xác suất của điều kiện B."
    },
    "url": "/hoc-tap/vietmath-thpt/#bai/bayes12"
  },
  {
    "subject": "Vật Lý",
    "grade": 9,
    "title": "Công, công suất và cơ năng",
    "rule": "Khi lực cùng hướng chuyển động, A = Fs. P = A/t. Động năng bằng mv²/2, thế năng gần mặt đất bằng mgh so với mốc đã chọn.",
    "example": {
      "prompt": "Dùng lực 40 N kéo vật đi 5 m theo phương của lực. Công là bao nhiêu J?",
      "answer": "200",
      "solution": "Nhân lực với quãng đường cùng hướng.",
      "hint": "Dùng A = Fs."
    },
    "url": "/hoc-tap/vat-ly-thcs/#bai/work9"
  },
  {
    "subject": "Vật Lý",
    "grade": 9,
    "title": "Định luật Ohm và mạch điện",
    "rule": "Với điện trở không đổi, I = U/R. Điện trở nối tiếp cộng trực tiếp; với hai nhánh song song, 1/Rtđ = 1/R₁ + 1/R₂.",
    "example": {
      "prompt": "Điện trở 4 Ω đặt dưới hiệu điện thế 8 V. Dòng điện bao nhiêu A?",
      "answer": "2",
      "solution": "Lấy hiệu điện thế chia điện trở.",
      "hint": "Dùng I = U/R."
    },
    "url": "/hoc-tap/vat-ly-thcs/#bai/ohm9"
  },
  {
    "subject": "Vật Lý",
    "grade": 9,
    "title": "Công suất và điện năng",
    "rule": "P = UI. Điện năng A = Pt; dùng P theo kW và t theo giờ để tính kWh.",
    "example": {
      "prompt": "Một điện trở hoạt động ở 12 V với dòng 4 A. Công suất bao nhiêu W?",
      "answer": "48",
      "solution": "P = UI.",
      "hint": "Nhân hiệu điện thế với dòng điện."
    },
    "url": "/hoc-tap/vat-ly-thcs/#bai/electric9"
  },
  {
    "subject": "Vật Lý",
    "grade": 9,
    "title": "Khúc xạ và thấu kính",
    "rule": "Khi ánh sáng đi từ không khí vào nước với góc tới khác 0, tia khúc xạ lệch về phía pháp tuyến. Với thấu kính hội tụ, vật ngoài tiêu cự cho ảnh thật, vật trong tiêu cự cho ảnh ảo.",
    "example": {
      "prompt": "Thấu kính hội tụ có tiêu cự 4 cm. Đặt vật cách kính 8 cm. Ảnh thật cách kính bao nhiêu cm?",
      "answer": "8",
      "solution": "Vật ở 2f thì ảnh thật ở 2f phía bên kia kính.",
      "hint": "Dựng tia song song và tia qua quang tâm."
    },
    "url": "/hoc-tap/vat-ly-thcs/#bai/lens9"
  },
  {
    "subject": "Vật Lý",
    "grade": 9,
    "title": "Cảm ứng điện từ và dòng xoay chiều",
    "rule": "Dòng cảm ứng xuất hiện trong mạch kín khi từ thông qua mạch biến thiên. Khi sự biến thiên đổi chiều lặp lại, dòng có thể đổi chiều tuần hoàn.",
    "example": {
      "prompt": "Đưa nam châm lại gần cuộn dây kín đang đứng yên có thể tạo ra gì?",
      "answer": "Dòng điện cảm ứng",
      "solution": "Từ thông qua vòng dây thay đổi khi khoảng cách thay đổi.",
      "hint": "Xét từ thông qua cuộn dây.",
      "choices": [
        "Dòng điện cảm ứng",
        "Luôn không có dòng",
        "Dòng chỉ khi nam châm dừng hẳn",
        "Chỉ dòng do nguồn pin"
      ]
    },
    "url": "/hoc-tap/vat-ly-thcs/#bai/induction9"
  },
  {
    "subject": "Vật Lý",
    "grade": 12,
    "title": "Nhiệt lượng và chuyển thể",
    "rule": "Khi nhiệt độ thay đổi mà không chuyển thể, Q = mcΔT. Nóng chảy ở nhiệt độ nóng chảy cần Q = mλ.",
    "example": {
      "prompt": "Đun 4 kg nước tăng 10 °C. Biết c = 4200 J/(kg·K). Nhiệt lượng bao nhiêu kJ?",
      "answer": "168",
      "solution": "Nhân m, c và 10; chia 1000 để đổi sang kJ.",
      "hint": "Độ tăng 10 °C bằng 10 K."
    },
    "url": "/hoc-tap/vat-ly-thpt/#bai/heat12"
  },
  {
    "subject": "Vật Lý",
    "grade": 12,
    "title": "Nội năng và định luật I",
    "rule": "Theo quy ước nhiệt lượng nhận vào Q > 0 và công hệ nhận A > 0, độ biến thiên nội năng ΔU = Q + A.",
    "example": {
      "prompt": "Khí nhận 80 J nhiệt và thực hiện 20 J công. Nội năng tăng bao nhiêu J?",
      "answer": "60",
      "solution": "Công khí thực hiện tương ứng A âm theo quy ước công nhận vào.",
      "hint": "Lấy nhiệt nhận trừ công khí thực hiện."
    },
    "url": "/hoc-tap/vat-ly-thpt/#bai/first12"
  },
  {
    "subject": "Vật Lý",
    "grade": 12,
    "title": "Khí lí tưởng và các đẳng quá trình",
    "rule": "Với lượng khí không đổi, pV/T không đổi, T tính bằng kelvin. Đẳng nhiệt dùng p₁V₁ = p₂V₂.",
    "example": {
      "prompt": "Khí chiếm 8 lít ở 100 kPa. Nén đẳng nhiệt còn 4 lít. Áp suất mới bao nhiêu kPa?",
      "answer": "200",
      "solution": "Thể tích giảm một nửa thì áp suất tăng gấp đôi.",
      "hint": "Dùng p₁V₁ = p₂V₂."
    },
    "url": "/hoc-tap/vat-ly-thpt/#bai/gas12"
  },
  {
    "subject": "Vật Lý",
    "grade": 12,
    "title": "Từ trường và lực từ",
    "rule": "Dây dài L mang dòng I trong từ trường đều B chịu lực F = BIL sin α, với α là góc giữa chiều dòng và vectơ B.",
    "example": {
      "prompt": "Dây dài 4 m vuông góc với B = 0,5 T, có dòng 2 A. Lực từ bao nhiêu N?",
      "answer": "4",
      "solution": "sin 90° = 1; nhân BIL.",
      "hint": "Dây vuông góc với từ trường."
    },
    "url": "/hoc-tap/vat-ly-thpt/#bai/mag12"
  },
  {
    "subject": "Vật Lý",
    "grade": 12,
    "title": "Từ thông và cảm ứng điện từ",
    "rule": "Từ thông qua một vòng phẳng là Φ = BS cos α, với α là góc giữa B và pháp tuyến. Độ lớn suất điện động cảm ứng trung bình là N|ΔΦ/Δt|.",
    "example": {
      "prompt": "Từ thông mỗi vòng đổi 4 mWb trong 0,1 s. Cuộn có 100 vòng. Suất điện động trung bình bao nhiêu V?",
      "answer": "4",
      "solution": "Đổi mWb thành Wb rồi nhân 100, chia 0,1.",
      "hint": "Dùng độ biến thiên qua mỗi vòng."
    },
    "url": "/hoc-tap/vat-ly-thpt/#bai/em12"
  },
  {
    "subject": "Vật Lý",
    "grade": 12,
    "title": "Hạt nhân và phóng xạ",
    "rule": "Số khối bằng tổng proton và neutron. Sau k chu kì bán rã, số hạt chưa phân rã bằng N₀/2ᵏ.",
    "example": {
      "prompt": "Một mẫu có 32 triệu hạt chưa phân rã lúc đầu. Sau 3 chu kì bán rã còn bao nhiêu triệu hạt?",
      "answer": "4",
      "solution": "Chia 2 ba lần, tức chia 8.",
      "hint": "Mỗi chu kì số hạt còn lại giảm một nửa."
    },
    "url": "/hoc-tap/vat-ly-thpt/#bai/nuclear12"
  },
  {
    "subject": "Hóa Học",
    "grade": 9,
    "title": "Dãy hoạt động và tính chất kim loại",
    "rule": "Kim loại hoạt động hơn có thể đẩy kim loại yếu hơn khỏi dung dịch muối trong điều kiện phù hợp. Kim loại đứng trước hydrogen thường phản ứng với acid loãng thích hợp.",
    "example": {
      "prompt": "Cho đinh sắt sạch vào dung dịch CuSO₄. Kim loại bám lên đinh là gì?",
      "answer": "Đồng",
      "solution": "Fe + CuSO₄ → FeSO₄ + Cu.",
      "hint": "So sánh hoạt động của Fe và Cu.",
      "choices": [
        "Đồng",
        "Kẽm",
        "Nhôm",
        "Bạc"
      ]
    },
    "url": "/hoc-tap/hoa-hoc-thcs/#bai/metal9"
  },
  {
    "subject": "Hóa Học",
    "grade": 9,
    "title": "Hydrocarbon và nhiên liệu",
    "rule": "Hydrocarbon chỉ chứa C và H. Cháy hoàn toàn tạo CO₂ và H₂O. Ethylene có liên kết đôi, có thể tham gia phản ứng cộng.",
    "example": {
      "prompt": "Đốt cháy hoàn toàn 4 mol CH₄. Thu bao nhiêu mol CO₂?",
      "answer": "4",
      "solution": "Một mol CH₄ có một mol nguyên tử C nên tạo một mol CO₂.",
      "hint": "Bảo toàn carbon."
    },
    "url": "/hoc-tap/hoa-hoc-thcs/#bai/fuel9"
  },
  {
    "subject": "Hóa Học",
    "grade": 9,
    "title": "Ethanol và acetic acid",
    "rule": "Ethanol có nhóm –OH. Acetic acid có nhóm –COOH và phản ứng với base hoặc carbonate.",
    "example": {
      "prompt": "Công thức của acetic acid là gì?",
      "answer": "CH₃COOH",
      "solution": "Nhóm carboxyl gắn với nhóm CH₃.",
      "hint": "Tìm nhóm –COOH.",
      "choices": [
        "CH₃COOH",
        "C₂H₅OH",
        "CH₄",
        "HCOONa"
      ]
    },
    "url": "/hoc-tap/hoa-hoc-thcs/#bai/ethanol9"
  },
  {
    "subject": "Hóa Học",
    "grade": 9,
    "title": "Chất béo, carbohydrate và polymer",
    "rule": "Chất béo là triester của glycerol với acid béo. Tinh bột tạo màu xanh tím với iodine. Polymer gồm nhiều mắt xích nối nhau.",
    "example": {
      "prompt": "Thuốc thử nhận biết tinh bột là gì?",
      "answer": "Dung dịch iodine",
      "solution": "Tinh bột cho màu xanh tím với iodine.",
      "hint": "Tìm thuốc thử cho màu đặc trưng.",
      "choices": [
        "Dung dịch iodine",
        "Nước cất",
        "Dung dịch NaCl",
        "Giấy lọc"
      ]
    },
    "url": "/hoc-tap/hoa-hoc-thcs/#bai/materials9"
  },
  {
    "subject": "Hóa Học",
    "grade": 12,
    "title": "Ester và lipid",
    "rule": "Ester đơn chức có nhóm –COO–. Phản ứng với NaOH có thể tạo muối carboxylate và alcohol.",
    "example": {
      "prompt": "Chất nào là ester?",
      "answer": "CH₃COOCH₃",
      "solution": "CH₃COOCH₃ có nhóm –COO– nối hai phần hữu cơ.",
      "hint": "Phân biệt ester với acid và ether.",
      "choices": [
        "CH₃COOCH₃",
        "CH₃COOH",
        "CH₃CHO",
        "CH₃OCH₃"
      ]
    },
    "url": "/hoc-tap/hoa-hoc-thpt/#bai/ester12"
  },
  {
    "subject": "Hóa Học",
    "grade": 12,
    "title": "Carbohydrate",
    "rule": "Glucose là monosaccharide; sucrose là disaccharide. Thủy phân hoàn toàn tinh bột tạo glucose.",
    "example": {
      "prompt": "Sản phẩm khi thủy phân hoàn toàn tinh bột là gì?",
      "answer": "Glucose",
      "solution": "Tinh bột gồm các gốc glucose nối với nhau.",
      "hint": "Xét mắt xích của tinh bột.",
      "choices": [
        "Glucose",
        "Fructose",
        "Glycerol",
        "Ethanol"
      ]
    },
    "url": "/hoc-tap/hoa-hoc-thpt/#bai/carb12"
  },
  {
    "subject": "Hóa Học",
    "grade": 12,
    "title": "Amine, amino acid và peptide",
    "rule": "Amine có tính base. Amino acid có nhóm amino và carboxyl. Liên kết peptide có dạng –CO–NH– giữa các gốc amino acid.",
    "example": {
      "prompt": "Peptide mạch hở gồm 4 gốc amino acid. Có bao nhiêu liên kết peptide?",
      "answer": "3",
      "solution": "Mỗi cặp gốc liền kề có một liên kết peptide.",
      "hint": "Số liên kết nhỏ hơn số gốc một đơn vị."
    },
    "url": "/hoc-tap/hoa-hoc-thpt/#bai/amine12"
  },
  {
    "subject": "Hóa Học",
    "grade": 12,
    "title": "Polymer và vật liệu",
    "rule": "Trùng hợp nối monomer thành mạch. Trùng ngưng thường tạo phân tử nhỏ như nước kèm theo sản phẩm polymer.",
    "example": {
      "prompt": "Monomer tạo PVC là gì?",
      "answer": "CH₂=CHCl",
      "solution": "Vinyl chloride trùng hợp tạo PVC.",
      "hint": "Tìm monomer chứa chlorine.",
      "choices": [
        "CH₂=CHCl",
        "CH₂=CH₂",
        "CH₃COOH",
        "C₆H₆"
      ]
    },
    "url": "/hoc-tap/hoa-hoc-thpt/#bai/poly12"
  },
  {
    "subject": "Hóa Học",
    "grade": 12,
    "title": "Pin điện hóa và điện phân",
    "rule": "Tại anode xảy ra oxi hóa; tại cathode xảy ra khử. Trong pin Zn–Cu, electron đi từ Zn đến Cu qua mạch ngoài.",
    "example": {
      "prompt": "Trong pin Zn–Cu, điện cực nào xảy ra oxi hóa Zn thành Zn²⁺?",
      "answer": "Anode Zn",
      "solution": "Oxi hóa luôn xảy ra ở anode.",
      "hint": "Xét nơi nhường electron.",
      "choices": [
        "Anode Zn",
        "Cathode Cu",
        "Cầu muối",
        "Dung dịch CuSO₄"
      ]
    },
    "url": "/hoc-tap/hoa-hoc-thpt/#bai/cell12"
  },
  {
    "subject": "Hóa Học",
    "grade": 12,
    "title": "Kim loại, nước cứng và ion kim loại",
    "rule": "Nước cứng chứa nhiều ion Ca²⁺ và Mg²⁺. Nước cứng tạm thời do hydrogencarbonate có thể giảm độ cứng bằng đun sôi.",
    "example": {
      "prompt": "Hai ion chính gây độ cứng của nước là gì?",
      "answer": "Ca²⁺ và Mg²⁺",
      "solution": "Ion calcium và magnesium làm tăng độ cứng.",
      "hint": "Tìm ion kim loại kiềm thổ.",
      "choices": [
        "Ca²⁺ và Mg²⁺",
        "Na⁺ và K⁺",
        "Cl⁻ và NO₃⁻",
        "H⁺ và OH⁻"
      ]
    },
    "url": "/hoc-tap/hoa-hoc-thpt/#bai/ions12"
  }
];
