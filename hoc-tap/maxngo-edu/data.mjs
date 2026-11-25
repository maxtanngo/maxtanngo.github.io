export const practice = {
  id: 'toan-ngan-v1', title: 'Toán · Khởi động', subject: 'Toán', duration: 480,
  questions: [
    {type:'choice', prompt:'Một thư viện có 160 chỗ ngồi. Buổi sáng có 40% số chỗ đã được sử dụng. Còn bao nhiêu chỗ trống?', options:['64','80','96','120'], key:2, max:3, topic:'Tỉ lệ phần trăm', hint:'Tính tỉ lệ chỗ còn trống trước khi tính số chỗ.', explanation:'Còn 60% số chỗ. Lấy 160 × 0,6 = 96.'},
    {type:'boolean', prompt:'Cho hàm số f(x) = 2x − 4. Xác định đúng hoặc sai cho từng mệnh đề.', options:['f(0) = −4','f(2) = 0','f giảm trên ℝ','Đồ thị cắt trục tung tại (0, 4)'], key:[true,true,false,false], scale:[0,0.25,0.5,1,4], max:4, topic:'Hàm số bậc nhất', hint:'Thay x vào biểu thức. Dấu của hệ số đứng trước x cho biết chiều biến thiên.', explanation:'f(0) = −4 và f(2) = 0. Hệ số góc 2 dương nên hàm tăng. Tung độ giao điểm với trục tung là −4.'},
    {type:'number', prompt:'Một túi có 3 bi xanh và 5 bi đỏ. Rút ngẫu nhiên một bi. Viết xác suất rút được bi xanh dưới dạng số thập phân.', key:0.375, max:3, topic:'Xác suất', hint:'Chia số kết quả thuận lợi cho tổng số kết quả đồng khả năng.', explanation:'Có 3 kết quả thuận lợi trong 8 kết quả đồng khả năng. Xác suất là 3/8 = 0,375.'},
    {type:'essay', prompt:'Giải thích vì sao hàm số f(x) = 2x − 4 tăng trên ℝ.', topic:'Lập luận toán học', hint:'So sánh f(b) và f(a) khi b > a.', explanation:'Khi b > a, ta có f(b) − f(a) = 2(b − a) > 0. Vậy f(b) > f(a).'},
  ]
};

export const functionsPractice = {
  id:'toan-ham-so-v1', title:'Toán · Hàm số và tối ưu', subject:'Toán', duration:720,
  questions:[
    {type:'choice', prompt:'Đồ thị hàm số y = 3 − 2/(x + 1) có tiệm cận ngang nào?', options:['y = 2','y = 3','x = −1','y = −2'], key:1, max:1, topic:'Tiệm cận', hint:'Xét giới hạn của phân thức khi x tiến ra vô cực.', explanation:'2/(x + 1) tiến về 0, nên tiệm cận ngang là y = 3.'},
    {type:'choice', prompt:'Hàm số f(x) = x³ − 12x đồng biến trên khoảng nào dưới đây?', options:['(−2; 2)','(−1; 1)','(2; +∞)','(0; 2)'], key:2, max:1, topic:'Đồng biến', hint:'Tìm nơi đạo hàm 3x² − 12 dương.', explanation:'f′(x) = 3(x² − 4) dương khi x < −2 hoặc x > 2. Trong các lựa chọn, (2; +∞) đúng.'},
    {type:'boolean', prompt:'Cho f(x) = x² − 4x + 5. Xác định đúng hoặc sai.', options:['f′(2) = 0','Giá trị nhỏ nhất của f bằng 1','f đồng biến trên (−∞; 2)','Phương trình f(x) = 5 có hai nghiệm thực phân biệt'], key:[true,true,false,true], scale:[0,0.25,0.5,1,2], max:2, topic:'Đạo hàm và cực trị', hint:'Hoàn thành bình phương và xét dấu đạo hàm ở hai phía của 2.', explanation:'f′(x) = 2x − 4, nên f giảm khi x < 2. Ta có f(x) = (x − 2)² + 1. Phương trình f(x) = 5 có hai nghiệm 0 và 4.'},
    {type:'number', prompt:'Tìm giá trị nhỏ nhất của g(x) = x² − 6x + 14 trên đoạn [0; 5].', key:5, max:2, topic:'Giá trị nhỏ nhất', hint:'Kiểm tra điểm dừng nằm trong đoạn, cùng với hai đầu mút.', explanation:'g(x) = (x − 3)² + 5. Bình phương đạt 0 tại x = 3 thuộc đoạn, nên giá trị nhỏ nhất bằng 5.'},
    {type:'number', prompt:'Một hình chữ nhật có chu vi 28 m. Diện tích lớn nhất của hình chữ nhật, tính bằng mét vuông, bằng bao nhiêu?', key:49, max:2, topic:'Tối ưu diện tích', hint:'Gọi một cạnh là x, cạnh còn lại là 14 − x. Viết tích dưới dạng bình phương.', explanation:'Diện tích x(14 − x) = 49 − (x − 7)². Giá trị lớn nhất là 49 m² khi hai cạnh cùng bằng 7 m.'},
    {type:'number', prompt:'Chi phí của một nhóm, tính theo nghìn đồng, được mô hình hóa bởi C(x) = x² − 10x + 32 với 2 ≤ x ≤ 8. Tại giá trị x nào chi phí nhỏ nhất?', key:5, max:2, topic:'Tối ưu chi phí', hint:'Tìm nghiệm của C′(x) = 0 trong khoảng cho trước.', explanation:'C(x) = (x − 5)² + 7. Bình phương đạt 0 tại x = 5, nên chi phí nhỏ nhất đạt tại x = 5.'},
  ],
};

export const practices = [practice, functionsPractice];
export function findPractice(id) {
  return id == null ? practice : practices.find(item => item.id === id);
}
