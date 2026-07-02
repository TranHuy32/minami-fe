export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  price: string;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  image: string;
  specifications: string[];
}

export interface Category {
  name: string;
  subcategories: string[];
}

export interface Article {
  id: string;
  title: string;
  date: string;
  summary: string;
  content: string;
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    code: 'VBA-X3145',
    name: 'Bộ tăng áp VBA - X3145',
    category: 'Van Khí Nén',
    price: 'Liên hệ',
    stock: 45,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
    specifications: ['Áp suất làm việc tối đa: 1.0 MPa', 'Tỷ lệ tăng áp: 2 đến 4 lần', 'Lưu lượng tối đa: 1000 L/min']
  },
  {
    id: 'p2',
    code: 'ISE70-F02-L2-M',
    name: 'Cảm biến áp suất kỹ thuật số dòng ISE70/71',
    category: 'Cảm biến áp suất, lưu lượng',
    price: '1,850,000 đ',
    stock: 12,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Màn hình hiển thị LED 3 màu', 'Dải áp suất: -0.1 đến 1.0 MPa', 'Ngõ ra IO-Link']
  },
  {
    id: 'p3',
    code: 'CQ2B32-25D',
    name: 'Xy lanh compact SMC dòng CQ2B',
    category: 'Xy lanh khí',
    price: '920,000 đ',
    stock: 8,
    status: 'Low Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
    specifications: ['Đường kính piston: 32 mm', 'Hành trình xy lanh: 25 mm', 'Hai chiều kép']
  },
  {
    id: 'p4',
    code: 'E5CC-RX2ASM-800',
    name: 'Bộ điều khiển nhiệt độ Omron E5CC',
    category: 'Điều khiển nhiệt độ',
    price: '1,950,000 đ',
    stock: 0,
    status: 'Out of Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Kích thước chuẩn: 48x48 mm', 'Chu kỳ lấy mẫu: 50 ms', 'Ngõ vào Thermocouple']
  },
  {
    id: 'p5',
    code: 'SY5120-5DD-C6',
    name: 'Van điện từ SMC 5/2 Port SY5120',
    category: 'Van Khí Nén',
    price: '1,250,000 đ',
    stock: 60,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
    specifications: ['Điện áp cuộn coil: 24V DC', 'Cổng kết nối ren: 6mm', 'Dải áp suất: 0.15 đến 0.7 MPa']
  },
  {
    id: 'p6',
    code: 'AS2201F-01-06S',
    name: 'Van tiết lưu SMC AS2201F',
    category: 'Ống dây - Đầu nối - Van tiết lưu',
    price: '180,000 đ',
    stock: 120,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
    specifications: ['Cổng ren: R1/8', 'Cổng cắm ống dây: 6mm', 'Loại khuỷu tay bẻ góc']
  },
  {
    id: 'p7',
    code: 'E2E-X5ME1 2M',
    name: 'Cảm biến tiệm cận Omron E2E-X5ME1',
    category: 'Cảm biến tiệm cận',
    price: '480,000 đ',
    stock: 25,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Khoảng cách phát hiện: 5 mm', 'Đầu ra: NPN NO', 'Đường kính ren: M12']
  },
  {
    id: 'p8',
    code: 'MY4N-GS DC24',
    name: 'Rơ le trung gian Omron MY4N-GS',
    category: 'Rơ le trung gian',
    price: '95,000 đ',
    stock: 350,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Điện áp điều khiển: 24V DC', 'Số tiếp điểm: 4 cực (4PDT)', 'Có tích hợp đèn LED chỉ thị']
  },
  {
    id: 'p9',
    code: '3G3MX2-A2004',
    name: 'Biến tần Omron MX2 Series 0.4kW',
    category: 'Biến tần, DC drives',
    price: '3,250,000 đ',
    stock: 3,
    status: 'Low Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Công suất động cơ: 0.4 kW', 'Điện áp vào: 3 Pha 200V', 'Tần số ngõ ra tối đa: 400 Hz']
  },
  {
    id: 'p10',
    code: 'MV-ID3013XM-03S',
    name: 'Camera đọc mã vạch HIKRobot MV-ID3013',
    category: 'HIKRobot',
    price: '14,500,000 đ',
    stock: 5,
    status: 'Low Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Độ phân giải cảm biến: 1.3 Megapixel', 'Tốc độ quét tối đa: 60 fps', 'Đọc mã 1D/2D công nghiệp']
  },
  {
    id: 'p11',
    code: 'SY7120-5DD-C8',
    name: 'Van điện từ SMC 5/2 Port SY7120',
    category: 'Van Khí Nén',
    price: '1,450,000 đ',
    stock: 30,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
    specifications: ['Cuộn coil DC 24V', 'Đường kính cổng ren 8mm', 'Cơ cấu phản hồi nhanh']
  },
  {
    id: 'p12',
    code: 'CP1E-N30S1DT-D',
    name: 'Bộ lập trình PLC Omron CP1E-N30',
    category: 'PLC, BỘ ĐIỀU KHIỂN',
    price: '4,800,000 đ',
    stock: 7,
    status: 'Low Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Số đầu vào/ra: 18 Inputs / 12 Outputs', 'Ngõ ra kiểu transistor', 'Hỗ trợ cổng truyền thông RS232']
  },
  {
    id: 'p13',
    code: 'AW30-F03-A',
    name: 'Bộ lọc điều áp khí nén SMC AW30',
    category: 'Lọc - Điều áp khí nén',
    price: '1,650,000 đ',
    stock: 18,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
    specifications: ['Kích thước cổng ren: G3/8', 'Cấp lọc bụi: 5 micron', 'Tích hợp đồng hồ hiển thị']
  },
  {
    id: 'p14',
    code: 'E3Z-T61 2M',
    name: 'Cảm biến quang điện Omron E3Z-T61',
    category: 'Cảm biến quang',
    price: '1,150,000 đ',
    stock: 15,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Loại cảm biến: Thu phát độc lập', 'Khoảng cách phát hiện tối đa: 15 m', 'Ngõ ra: NPN cực thu hở']
  },
  {
    id: 'p15',
    code: 'ZSE30A-01-N-L',
    name: 'Cảm biến áp suất chân không SMC ZSE30A',
    category: 'Cảm biến áp suất, lưu lượng',
    price: '2,400,000 đ',
    stock: 22,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
    specifications: ['Dải áp suất định mức: 0.0 đến -101.0 kPa', 'Ngõ ra số NPN cực thu hở', 'Hiển thị điện tử trực quan']
  },
  {
    id: 'p16',
    code: 'KQ2H06-01S',
    name: 'Đầu nối thẳng khí nén SMC KQ2H',
    category: 'Ống dây - Đầu nối - Van tiết lưu',
    price: '35,000 đ',
    stock: 500,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
    specifications: ['Đường kính ống cắm dây: 6mm', 'Kích thước ren kết nối: R1/8', 'Vật liệu đồng thau mạ niken']
  },
  {
    id: 'p17',
    code: 'TU0805BU-100',
    name: 'Cuộn ống dây hơi khí nén SMC TU0805',
    category: 'Ống dây - Đầu nối - Van tiết lưu',
    price: '1,450,000 đ',
    stock: 12,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
    specifications: ['Đường kính ngoài/trong: 8mm/5mm', 'Chiều dài cuộn dây: 100m', 'Chất liệu Polyurethane đàn hồi']
  },
  {
    id: 'p18',
    code: 'H5CX-A11-N AC100-240',
    name: 'Bộ đặt thời gian kỹ thuật số Omron H5CX',
    category: 'Rơ le thời gian',
    price: '2,800,000 đ',
    stock: 9,
    status: 'Low Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Nguồn cấp: 100 đến 240V AC', 'Hiển thị 4 chữ số LED màu', 'Dải thời gian đặt: 0.001s đến 9999h']
  },
  {
    id: 'p19',
    code: 'E6B2-CWZ6C 1000P/R',
    name: 'Bộ mã hóa vòng quay trục Encoder Omron',
    category: 'Encoder',
    price: '2,600,000 đ',
    stock: 14,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Độ phân giải xung: 1000 xung/vòng', 'Đường kính cốt trục: 6mm', 'Ngõ ra xung: A, B, Z pha']
  },
  {
    id: 'p20',
    code: 'CQ2A50-50D',
    name: 'Xy lanh khí nén SMC dòng CQ2A50',
    category: 'Xy lanh khí',
    price: '1,800,000 đ',
    stock: 10,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
    specifications: ['Đường kính piston xy lanh: 50mm', 'Hành trình di chuyển: 50mm', 'Cổng kết nối ren hơi: G1/4']
  },
  {
    id: 'p21',
    code: 'WLCA2-N',
    name: 'Công tắc hành trình Omron WLCA2-N',
    category: 'Công tác hành trình',
    price: '780,000 đ',
    stock: 45,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Loại bánh xe tác động xoay góc', 'Khả năng chịu dòng tải tiếp điểm: 10A', 'Tiêu chuẩn chống thấm IP67']
  },
  {
    id: 'p22',
    code: 'S8FS-C10024J',
    name: 'Bộ nguồn một chiều tổ ong Omron S8FS',
    category: 'Nguồn một chiều',
    price: '650,000 đ',
    stock: 35,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Điện áp ngõ ra: 24V DC', 'Dòng điện định mức: 4.5A', 'Công suất tối đa: 100W']
  },
  {
    id: 'p23',
    code: 'E3Z-R61 2M',
    name: 'Cảm biến quang điện gương Omron E3Z-R61',
    category: 'Cảm biến quang',
    price: '1,280,000 đ',
    stock: 20,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Loại phản xạ qua gương', 'Khoảng cách phát hiện định mức: 4 m', 'Đã bao gồm sẵn gương phản xạ kèm theo']
  },
  {
    id: 'p24',
    code: 'MGPM25-50Z',
    name: 'Xy lanh dẫn hướng SMC MGPM25',
    category: 'Xy lanh khí',
    price: '2,900,000 đ',
    stock: 5,
    status: 'Low Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
    specifications: ['Đường kính piston: 25mm', 'Hành trình dẫn hướng: 50mm', 'Tích hợp 2 trục dẫn hướng chống xoay']
  },
  {
    id: 'p25',
    code: 'IDGB-5000-24',
    name: 'Bộ nguồn sấy sưởi ổn nhiệt MINAMI IDGB',
    category: 'Nguồn một chiều',
    price: '5,800,000 đ',
    stock: 8,
    status: 'Low Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
    specifications: ['Điện áp hoạt động: 24V DC', 'Hỗ trợ kiểm soát PID thông minh', 'Độ bền công nghiệp cao']
  },
  {
    id: 'p26',
    code: 'VEX1300-04F',
    name: 'Van xả áp suất khí nhanh SMC VEX1300',
    category: 'Van Khí Nén',
    price: '3,800,000 đ',
    stock: 12,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
    specifications: ['Đường kính cổng ren xả hơi: 1/2', 'Lưu lượng xả hơi cực nhanh', 'Độ bền cơ khí lên tới 5 triệu lần đóng cắt']
  },
  {
    id: 'p27',
    code: 'E3FA-DP12 2M',
    name: 'Cảm biến quang phản xạ khuếch tán Omron',
    category: 'Cảm biến quang',
    price: '850,000 đ',
    stock: 40,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Dáng hình trụ tròn ren nhựa M18', 'Khoảng cách phát hiện vật: 300 mm', 'Ngõ ra PNP cực thu hở']
  },
  {
    id: 'p28',
    code: 'S8FS-C05024J',
    name: 'Bộ nguồn tổ ong một chiều Omron S8FS 50W',
    category: 'Nguồn một chiều',
    price: '420,000 đ',
    stock: 18,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Điện áp ngõ ra: 24V DC', 'Dòng điện tải tối đa: 2.2A', 'Kích thước lắp đặt nhỏ gọn']
  },
  {
    id: 'p29',
    code: 'E2E-X10ME1 2M',
    name: 'Cảm biến tiệm cận M18 Omron E2E-X10ME1',
    category: 'Cảm biến tiệm cận',
    price: '580,000 đ',
    stock: 30,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Khoảng cách phát hiện vật kim loại: 10 mm', 'Đầu ra: NPN NO', 'Kích thước ren vỏ kim loại: M18']
  },
  {
    id: 'p30',
    code: 'LY2N-GS AC220',
    name: 'Rơ le trung gian 8 chân dẹt Omron LY2N',
    category: 'Rơ le trung gian',
    price: '115,000 đ',
    stock: 180,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Điện áp cuộn coil kích hoạt: 220V AC', 'Số cực tiếp điểm: 2 cực (DPDT)', 'Tích hợp đèn báo LED màu đỏ']
  },
  {
    id: 'p31',
    code: 'CP1E-E20SDR-A',
    name: 'Bộ điều khiển lập trình PLC Omron CP1E-E20',
    category: 'PLC, BỘ ĐIỀU KHIỂN',
    price: '3,900,000 đ',
    stock: 5,
    status: 'Low Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Số đầu vào/ra cơ bản: 12 Inputs / 8 Outputs', 'Ngõ ra rơ le', 'Nguồn cấp AC: 100 đến 240V AC']
  },
  {
    id: 'p32',
    code: 'VH200-02',
    name: 'Van khóa khí gạt tay SMC VH200',
    category: 'Van Khí Nén',
    price: '750,000 đ',
    stock: 15,
    status: 'In Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/07/ma%CC%81y-ta%CC%86ng-a%CC%81p--300x300.png',
    specifications: ['Cổng ren hơi khí nén: G1/4', 'Kiểu tác động tay gạt xoay', 'Cấu trúc đóng mở kín khí tuyệt đối']
  },
  {
    id: 'p33',
    code: 'E5CC-QX2DSM-800',
    name: 'Bộ điều khiển nhiệt độ Omron dòng E5CC 24V',
    category: 'Điều khiển nhiệt độ',
    price: '2,250,000 đ',
    stock: 6,
    status: 'Low Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Điện áp nguồn cấp: 24V AC/DC', 'Ngõ ra SSR kích đóng rơ le bán dẫn', 'Chu kỳ quét mẫu PID: 50 ms']
  },
  {
    id: 'p34',
    code: 'MV-SC2016PM',
    name: 'Cảm biến hình ảnh kiểm tra sản phẩm HIKRobot',
    category: 'HIKRobot',
    price: '22,500,000 đ',
    stock: 2,
    status: 'Low Stock',
    image: 'https://aecom.com.vn/wp-content/uploads/2024/06/hippocms_large-300x300.jpg',
    specifications: ['Độ phân giải chụp: 1.6 MP', 'Tích hợp sẵn bộ lọc thuật toán học sâu AI', 'Kiểm tra lỗi dị vật, bao bì, nhãn sản phẩm']
  }
];

const DEFAULT_CATEGORIES: Category[] = [
  {
    name: 'SMC',
    subcategories: [
      'Van Khí Nén',
      'Xy lanh khí',
      'Xy lanh điện',
      'Lọc - Điều áp khí nén',
      'Cảm biến áp suất, lưu lượng',
      'Máy sấy khí - Chiller',
      'Hệ thống quản lý khí nén (AMS)',
      'Ống dây - Đầu nối - Van tiết lưu',
      'Van chân không'
    ]
  },
  {
    name: 'Cảm biến',
    subcategories: [
      'Cảm biến quang',
      'Cảm biến tiệm cận',
      'Encoder'
    ]
  },
  { name: 'Điều khiển nhiệt độ', subcategories: [] },
  { name: 'PLC, BỘ ĐIỀU KHIỂN', subcategories: [] },
  { name: 'Rơ le, thiết bị đóng cắt', subcategories: ['Rơ le thời gian', 'Rơ le trung gian', 'Công tác hành trình', 'Attomat, Khởi động từ', 'Nguồn một chiều'] },
  { name: 'Biến tần, DC drives', subcategories: [] },
  { name: 'Camera - Cảm biến hình ảnh', subcategories: ['HIKRobot', 'Omron Vision'] }
];

const DEFAULT_ARTICLES: Article[] = [
  {
    id: 'a1',
    title: 'MINAMI tổ chức hội thảo giải pháp quản lý khí nén tiết kiệm năng lượng',
    date: '02/07/2026',
    summary: 'Hội thảo giới thiệu hệ thống AMS mới nhất của SMC giúp tối ưu hóa lượng khí tiêu thụ trong nhà máy...',
    content: 'Tại hội thảo vừa diễn ra, các chuyên gia tự động hóa của MINAMI cùng đối tác SMC Nhật Bản đã giới thiệu chuỗi thiết bị đo và điều khiển khí nén thông minh AMS (Air Management System). Hệ thống này cho phép phát hiện rò rỉ khí nén tức thời và tự động giảm áp suất khi hệ thống ở trạng thái chờ, tiết kiệm đến 30% năng lượng tiêu thụ.'
  },
  {
    id: 'a2',
    title: 'Ứng dụng camera thông minh HIKRobot trong phát hiện lỗi đóng gói bao bì',
    date: '28/06/2026',
    summary: 'Giải pháp Machine Vision giúp loại bỏ 99.9% sản phẩm lỗi, tăng độ chính xác trong dây chuyền đóng gói...',
    content: 'MINAMI vừa chuyển giao thành công giải pháp camera thông minh của HIKRobot phục vụ kiểm tra lỗi nhãn và đát in trên dây chuyền đóng gói bao bì ngành thực phẩm. Với tốc độ chụp 60 khung hình/giây và thuật toán AI, hệ thống phát hiện chính xác các lỗi mờ chữ, lệch nhãn, rách hộp và tự động loại bỏ khỏi băng chuyền.'
  }
];

export const getStoredState = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error('Error reading localStorage key: ' + key, e);
    return defaultValue;
  }
};

export const setStoredState = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing localStorage key: ' + key, e);
  }
};

export const loadProducts = (): Product[] => getStoredState('aecom_products', DEFAULT_PRODUCTS);
export const saveProducts = (products: Product[]): void => setStoredState('aecom_products', products);

export const loadCategories = (): Category[] => getStoredState('aecom_categories', DEFAULT_CATEGORIES);
export const saveCategories = (categories: Category[]): void => setStoredState('aecom_categories', categories);

export const loadArticles = (): Article[] => getStoredState('aecom_articles', DEFAULT_ARTICLES);
export const saveArticles = (articles: Article[]): void => setStoredState('aecom_articles', articles);
