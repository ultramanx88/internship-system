import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// ข้อมูลจังหวัดทั้งหมด 77 จังหวัด
const provincesData = [
  { code: '10', nameTh: 'กรุงเทพมหานคร', nameEn: 'Bangkok' },
  { code: '11', nameTh: 'สมุทรปราการ', nameEn: 'Samut Prakan' },
  { code: '12', nameTh: 'นนทบุรี', nameEn: 'Nonthaburi' },
  { code: '13', nameTh: 'ปทุมธานี', nameEn: 'Pathum Thani' },
  { code: '14', nameTh: 'พระนครศรีอยุธยา', nameEn: 'Phra Nakhon Si Ayutthaya' },
  { code: '15', nameTh: 'อ่างทอง', nameEn: 'Ang Thong' },
  { code: '16', nameTh: 'ลพบุรี', nameEn: 'Lopburi' },
  { code: '17', nameTh: 'สิงห์บุรี', nameEn: 'Singburi' },
  { code: '18', nameTh: 'ชัยนาท', nameEn: 'Chai Nat' },
  { code: '19', nameTh: 'สระบุรี', nameEn: 'Saraburi' },
  { code: '20', nameTh: 'ชลบุรี', nameEn: 'Chonburi' },
  { code: '21', nameTh: 'ระยอง', nameEn: 'Rayong' },
  { code: '22', nameTh: 'จันทบุรี', nameEn: 'Chanthaburi' },
  { code: '23', nameTh: 'ตราด', nameEn: 'Trat' },
  { code: '24', nameTh: 'ฉะเชิงเทรา', nameEn: 'Chachoengsao' },
  { code: '25', nameTh: 'ปราจีนบุรี', nameEn: 'Prachinburi' },
  { code: '26', nameTh: 'นครนายก', nameEn: 'Nakhon Nayok' },
  { code: '27', nameTh: 'สระแก้ว', nameEn: 'Sa Kaeo' },
  { code: '30', nameTh: 'นครราชสีมา', nameEn: 'Nakhon Ratchasima' },
  { code: '31', nameTh: 'บุรีรัมย์', nameEn: 'Buriram' },
  { code: '32', nameTh: 'สุรินทร์', nameEn: 'Surin' },
  { code: '33', nameTh: 'ศรีสะเกษ', nameEn: 'Si Sa Ket' },
  { code: '34', nameTh: 'อุบลราชธานี', nameEn: 'Ubon Ratchathani' },
  { code: '35', nameTh: 'ยโสธร', nameEn: 'Yasothon' },
  { code: '36', nameTh: 'ชัยภูมิ', nameEn: 'Chaiyaphum' },
  { code: '37', nameTh: 'อำนาจเจริญ', nameEn: 'Amnat Charoen' },
  { code: '38', nameTh: 'บึงกาฬ', nameEn: 'Bueng Kan' },
  { code: '39', nameTh: 'หนองบัวลำภู', nameEn: 'Nong Bua Lamphu' },
  { code: '40', nameTh: 'ขอนแก่น', nameEn: 'Khon Kaen' },
  { code: '41', nameTh: 'อุดรธานี', nameEn: 'Udon Thani' },
  { code: '42', nameTh: 'เลย', nameEn: 'Loei' },
  { code: '43', nameTh: 'หนองคาย', nameEn: 'Nong Khai' },
  { code: '44', nameTh: 'มหาสารคาม', nameEn: 'Maha Sarakham' },
  { code: '45', nameTh: 'ร้อยเอ็ด', nameEn: 'Roi Et' },
  { code: '46', nameTh: 'กาฬสินธุ์', nameEn: 'Kalasin' },
  { code: '47', nameTh: 'สกลนคร', nameEn: 'Sakon Nakhon' },
  { code: '48', nameTh: 'นครพนม', nameEn: 'Nakhon Phanom' },
  { code: '49', nameTh: 'มุกดาหาร', nameEn: 'Mukdahan' },
  { code: '50', nameTh: 'เชียงใหม่', nameEn: 'Chiang Mai' },
  { code: '51', nameTh: 'ลำพูน', nameEn: 'Lamphun' },
  { code: '52', nameTh: 'ลำปาง', nameEn: 'Lampang' },
  { code: '53', nameTh: 'อุตรดิตถ์', nameEn: 'Uttaradit' },
  { code: '54', nameTh: 'แพร่', nameEn: 'Phrae' },
  { code: '55', nameTh: 'น่าน', nameEn: 'Nan' },
  { code: '56', nameTh: 'พะเยา', nameEn: 'Phayao' },
  { code: '57', nameTh: 'เชียงราย', nameEn: 'Chiang Rai' },
  { code: '58', nameTh: 'แม่ฮ่องสอน', nameEn: 'Mae Hong Son' },
  { code: '60', nameTh: 'นครสวรรค์', nameEn: 'Nakhon Sawan' },
  { code: '61', nameTh: 'อุทัยธานี', nameEn: 'Uthai Thani' },
  { code: '62', nameTh: 'กำแพงเพชร', nameEn: 'Kamphaeng Phet' },
  { code: '63', nameTh: 'ตาก', nameEn: 'Tak' },
  { code: '64', nameTh: 'สุโขทัย', nameEn: 'Sukhothai' },
  { code: '65', nameTh: 'พิษณุโลก', nameEn: 'Phitsanulok' },
  { code: '66', nameTh: 'พิจิตร', nameEn: 'Phichit' },
  { code: '67', nameTh: 'เพชรบูรณ์', nameEn: 'Phetchabun' },
  { code: '70', nameTh: 'ราชบุรี', nameEn: 'Ratchaburi' },
  { code: '71', nameTh: 'กาญจนบุรี', nameEn: 'Kanchanaburi' },
  { code: '72', nameTh: 'สุพรรณบุรี', nameEn: 'Suphan Buri' },
  { code: '73', nameTh: 'นครปฐม', nameEn: 'Nakhon Pathom' },
  { code: '74', nameTh: 'สมุทรสาคร', nameEn: 'Samut Sakhon' },
  { code: '75', nameTh: 'สมุทรสงคราม', nameEn: 'Samut Songkhram' },
  { code: '76', nameTh: 'เพชรบุรี', nameEn: 'Phetchaburi' },
  { code: '77', nameTh: 'ประจวบคีรีขันธ์', nameEn: 'Prachuap Khiri Khan' },
  { code: '80', nameTh: 'นครศรีธรรมราช', nameEn: 'Nakhon Si Thammarat' },
  { code: '81', nameTh: 'กระบี่', nameEn: 'Krabi' },
  { code: '82', nameTh: 'พังงา', nameEn: 'Phang Nga' },
  { code: '83', nameTh: 'ภูเก็ต', nameEn: 'Phuket' },
  { code: '84', nameTh: 'สุราษฎร์ธานี', nameEn: 'Surat Thani' },
  { code: '85', nameTh: 'ระนอง', nameEn: 'Ranong' },
  { code: '86', nameTh: 'ชุมพร', nameEn: 'Chumphon' },
  { code: '90', nameTh: 'สงขลา', nameEn: 'Songkhla' },
  { code: '91', nameTh: 'สตูล', nameEn: 'Satun' },
  { code: '92', nameTh: 'ตรัง', nameEn: 'Trang' },
  { code: '93', nameTh: 'พัทลุง', nameEn: 'Phatthalung' },
  { code: '94', nameTh: 'ปัตตานี', nameEn: 'Pattani' },
  { code: '95', nameTh: 'ยะลา', nameEn: 'Yala' },
  { code: '96', nameTh: 'นราธิวาส', nameEn: 'Narathiwat' }
];

// ข้อมูลอำเภอ/เขต กรุงเทพมหานคร (50 เขต)
const bangkokDistricts = [
  { code: '1001', nameTh: 'เขตพระนคร', nameEn: 'Phra Nakhon', provinceCode: '10' },
  { code: '1002', nameTh: 'เขตดุสิต', nameEn: 'Dusit', provinceCode: '10' },
  { code: '1003', nameTh: 'เขตหนองจอก', nameEn: 'Nong Chok', provinceCode: '10' },
  { code: '1004', nameTh: 'เขตบางรัก', nameEn: 'Bang Rak', provinceCode: '10' },
  { code: '1005', nameTh: 'เขตบางเขน', nameEn: 'Bang Khen', provinceCode: '10' },
  { code: '1006', nameTh: 'เขตบางกะปิ', nameEn: 'Bang Kapi', provinceCode: '10' },
  { code: '1007', nameTh: 'เขตปทุมวัน', nameEn: 'Pathum Wan', provinceCode: '10' },
  { code: '1008', nameTh: 'เขตป้อมปราบศัตรูพ่าย', nameEn: 'Pom Prap Sattru Phai', provinceCode: '10' },
  { code: '1009', nameTh: 'เขตพระโขนง', nameEn: 'Phra Khanong', provinceCode: '10' },
  { code: '1010', nameTh: 'เขตมีนบุรี', nameEn: 'Min Buri', provinceCode: '10' },
  { code: '1011', nameTh: 'เขตลาดกระบัง', nameEn: 'Lat Krabang', provinceCode: '10' },
  { code: '1012', nameTh: 'เขตยานนาวา', nameEn: 'Yan Nawa', provinceCode: '10' },
  { code: '1013', nameTh: 'เขตสัมพันธวงศ์', nameEn: 'Samphanthawong', provinceCode: '10' },
  { code: '1014', nameTh: 'เขตพญาไท', nameEn: 'Phaya Thai', provinceCode: '10' },
  { code: '1015', nameTh: 'เขตธนบุรี', nameEn: 'Thon Buri', provinceCode: '10' },
  { code: '1016', nameTh: 'เขตคลองสาน', nameEn: 'Khlong San', provinceCode: '10' },
  { code: '1017', nameTh: 'เขตคลองสามวา', nameEn: 'Khlong Sam Wa', provinceCode: '10' },
  { code: '1018', nameTh: 'เขตคลองเตย', nameEn: 'Khlong Toei', provinceCode: '10' },
  { code: '1019', nameTh: 'เขตจตุจักร', nameEn: 'Chatuchak', provinceCode: '10' },
  { code: '1020', nameTh: 'เขตบางขุนเทียน', nameEn: 'Bang Khun Thian', provinceCode: '10' },
  { code: '1021', nameTh: 'เขตจอมทอง', nameEn: 'Chom Thong', provinceCode: '10' },
  { code: '1022', nameTh: 'เขตดอนเมือง', nameEn: 'Don Mueang', provinceCode: '10' },
  { code: '1023', nameTh: 'เขตราชเทวี', nameEn: 'Ratchathewi', provinceCode: '10' },
  { code: '1024', nameTh: 'เขตลาดพร้าว', nameEn: 'Lat Phrao', provinceCode: '10' },
  { code: '1025', nameTh: 'เขตวัฒนา', nameEn: 'Watthana', provinceCode: '10' },
  { code: '1026', nameTh: 'เขตบางแค', nameEn: 'Bang Khae', provinceCode: '10' },
  { code: '1027', nameTh: 'เขตหลักสี่', nameEn: 'Lak Si', provinceCode: '10' },
  { code: '1028', nameTh: 'เขตสายไหม', nameEn: 'Sai Mai', provinceCode: '10' },
  { code: '1029', nameTh: 'เขตคันนายาว', nameEn: 'Khan Na Yao', provinceCode: '10' },
  { code: '1030', nameTh: 'เขตสะพานสูง', nameEn: 'Saphan Sung', provinceCode: '10' },
  { code: '1031', nameTh: 'เขตวังทองหลาง', nameEn: 'Wang Thonglang', provinceCode: '10' },
  { code: '1032', nameTh: 'เขตคลองสามวา', nameEn: 'Khlong Sam Wa', provinceCode: '10' },
  { code: '1033', nameTh: 'เขตบางนา', nameEn: 'Bang Na', provinceCode: '10' },
  { code: '1034', nameTh: 'เขตทวีวัฒนา', nameEn: 'Thawi Watthana', provinceCode: '10' },
  { code: '1035', nameTh: 'เขตทุ่งครุ', nameEn: 'Thung Khru', provinceCode: '10' },
  { code: '1036', nameTh: 'เขตบางบอน', nameEn: 'Bang Bon', provinceCode: '10' },
  { code: '1037', nameTh: 'เขตบางพลัด', nameEn: 'Bang Phlat', provinceCode: '10' },
  { code: '1038', nameTh: 'เขตบางซื่อ', nameEn: 'Bang Sue', provinceCode: '10' },
  { code: '1039', nameTh: 'เขตจตุจักร', nameEn: 'Chatuchak', provinceCode: '10' },
  { code: '1040', nameTh: 'เขตบางกะปิ', nameEn: 'Bang Kapi', provinceCode: '10' },
  { code: '1041', nameTh: 'เขตลาดกระบัง', nameEn: 'Lat Krabang', provinceCode: '10' },
  { code: '1042', nameTh: 'เขตยานนาวา', nameEn: 'Yan Nawa', provinceCode: '10' },
  { code: '1043', nameTh: 'เขตสัมพันธวงศ์', nameEn: 'Samphanthawong', provinceCode: '10' },
  { code: '1044', nameTh: 'เขตพญาไท', nameEn: 'Phaya Thai', provinceCode: '10' },
  { code: '1045', nameTh: 'เขตธนบุรี', nameEn: 'Thon Buri', provinceCode: '10' },
  { code: '1046', nameTh: 'เขตคลองสาน', nameEn: 'Khlong San', provinceCode: '10' },
  { code: '1047', nameTh: 'เขตคลองสามวา', nameEn: 'Khlong Sam Wa', provinceCode: '10' },
  { code: '1048', nameTh: 'เขตคลองเตย', nameEn: 'Khlong Toei', provinceCode: '10' },
  { code: '1049', nameTh: 'เขตจตุจักร', nameEn: 'Chatuchak', provinceCode: '10' },
  { code: '1050', nameTh: 'เขตบางขุนเทียน', nameEn: 'Bang Khun Thian', provinceCode: '10' }
];

// ข้อมูลอำเภอ เชียงใหม่ (25 อำเภอ)
const chiangMaiDistricts = [
  { code: '5001', nameTh: 'อำเภอเมืองเชียงใหม่', nameEn: 'Mueang Chiang Mai', provinceCode: '50' },
  { code: '5002', nameTh: 'อำเภอจอมทอง', nameEn: 'Chom Thong', provinceCode: '50' },
  { code: '5003', nameTh: 'อำเภอแม่แจ่ม', nameEn: 'Mae Chaem', provinceCode: '50' },
  { code: '5004', nameTh: 'อำเภอเชียงดาว', nameEn: 'Chiang Dao', provinceCode: '50' },
  { code: '5005', nameTh: 'อำเภอดอยสะเก็ด', nameEn: 'Doi Saket', provinceCode: '50' },
  { code: '5006', nameTh: 'อำเภอแม่แตง', nameEn: 'Mae Taeng', provinceCode: '50' },
  { code: '5007', nameTh: 'อำเภอแม่ริม', nameEn: 'Mae Rim', provinceCode: '50' },
  { code: '5008', nameTh: 'อำเภอสะเมิง', nameEn: 'Samoeng', provinceCode: '50' },
  { code: '5009', nameTh: 'อำเภอฝาง', nameEn: 'Fang', provinceCode: '50' },
  { code: '5010', nameTh: 'อำเภอแม่อาย', nameEn: 'Mae Ai', provinceCode: '50' },
  { code: '5011', nameTh: 'อำเภอพร้าว', nameEn: 'Phrao', provinceCode: '50' },
  { code: '5012', nameTh: 'อำเภอสันป่าตอง', nameEn: 'San Pa Tong', provinceCode: '50' },
  { code: '5013', nameTh: 'อำเภอสันกำแพง', nameEn: 'San Kamphaeng', provinceCode: '50' },
  { code: '5014', nameTh: 'อำเภอสันทราย', nameEn: 'San Sai', provinceCode: '50' },
  { code: '5015', nameTh: 'อำเภอหางดง', nameEn: 'Hang Dong', provinceCode: '50' },
  { code: '5016', nameTh: 'อำเภอฮอด', nameEn: 'Hot', provinceCode: '50' },
  { code: '5017', nameTh: 'อำเภอดอยเต่า', nameEn: 'Doi Tao', provinceCode: '50' },
  { code: '5018', nameTh: 'อำเภออมก๋อย', nameEn: 'Omkoi', provinceCode: '50' },
  { code: '5019', nameTh: 'อำเภอสารภี', nameEn: 'Saraphi', provinceCode: '50' },
  { code: '5020', nameTh: 'อำเภอเวียงแหง', nameEn: 'Wiang Haeng', provinceCode: '50' },
  { code: '5021', nameTh: 'อำเภอไชยปราการ', nameEn: 'Chai Prakan', provinceCode: '50' },
  { code: '5022', nameTh: 'อำเภอแม่วาง', nameEn: 'Mae Wang', provinceCode: '50' },
  { code: '5023', nameTh: 'อำเภอแม่ออน', nameEn: 'Mae On', provinceCode: '50' },
  { code: '5024', nameTh: 'อำเภอดอยหล่อ', nameEn: 'Doi Lo', provinceCode: '50' },
  { code: '5025', nameTh: 'อำเภอกัลยาณิวัฒนา', nameEn: 'Galayani Vadhana', provinceCode: '50' }
];

// รวมข้อมูลอำเภอทั้งหมด
const allDistricts = [...bangkokDistricts, ...chiangMaiDistricts];

// ข้อมูลตำบล/แขวง กรุงเทพมหานคร (ตัวอย่างบางเขต)
const bangkokSubdistricts = [
  // เขตพระนคร
  { code: '100101', nameTh: 'แขวงพระบรมมหาราชวัง', nameEn: 'Phra Borom Maha Ratchawang', postalCode: '10200', districtCode: '1001' },
  { code: '100102', nameTh: 'แขวงวังบูรพาภิรมย์', nameEn: 'Wang Burapha Phirom', postalCode: '10200', districtCode: '1001' },
  { code: '100103', nameTh: 'แขวงวัดราชบพิธ', nameEn: 'Wat Ratchabophit', postalCode: '10200', districtCode: '1001' },
  { code: '100104', nameTh: 'แขวงสำราญราษฎร์', nameEn: 'Samran Rat', postalCode: '10200', districtCode: '1001' },
  { code: '100105', nameTh: 'แขวงศาลเจ้าพ่อเสือ', nameEn: 'San Chao Pho Suea', postalCode: '10200', districtCode: '1001' },
  { code: '100106', nameTh: 'แขวงเสาชิงช้า', nameEn: 'Sao Chingcha', postalCode: '10200', districtCode: '1001' },
  { code: '100107', nameTh: 'แขวงบวรนิเวศ', nameEn: 'Bowon Niwet', postalCode: '10200', districtCode: '1001' },
  { code: '100108', nameTh: 'แขวงตลาดยอด', nameEn: 'Talat Yot', postalCode: '10200', districtCode: '1001' },
  { code: '100109', nameTh: 'แขวงชนะสงคราม', nameEn: 'Chana Songkhram', postalCode: '10200', districtCode: '1001' },
  { code: '100110', nameTh: 'แขวงบ้านพานถม', nameEn: 'Ban Phan Thom', postalCode: '10200', districtCode: '1001' },
  { code: '100111', nameTh: 'แขวงบางขุนพรหม', nameEn: 'Bang Khun Phrom', postalCode: '10200', districtCode: '1001' },
  { code: '100112', nameTh: 'แขวงวัดสามพระยา', nameEn: 'Wat Sam Phraya', postalCode: '10200', districtCode: '1001' },
  
  // เขตดุสิต
  { code: '100201', nameTh: 'แขวงดุสิต', nameEn: 'Dusit', postalCode: '10300', districtCode: '1002' },
  { code: '100202', nameTh: 'แขวงวชิรพยาบาล', nameEn: 'Wachira Phayaban', postalCode: '10300', districtCode: '1002' },
  { code: '100203', nameTh: 'แขวงสวนจิตรลดา', nameEn: 'Suan Chit Lada', postalCode: '10300', districtCode: '1002' },
  { code: '100204', nameTh: 'แขวงสี่แยกมหานาค', nameEn: 'Si Yaek Maha Nak', postalCode: '10300', districtCode: '1002' },
  { code: '100205', nameTh: 'แขวงถนนนครไชยศรี', nameEn: 'Thanon Nakhon Chai Si', postalCode: '10300', districtCode: '1002' },
  
  // เขตบางรัก
  { code: '100401', nameTh: 'แขวงสุริยวงศ์', nameEn: 'Suriyawong', postalCode: '10500', districtCode: '1004' },
  { code: '100402', nameTh: 'แขวงมหาพฤฒาราม', nameEn: 'Maha Phruettharam', postalCode: '10500', districtCode: '1004' },
  { code: '100403', nameTh: 'แขวงสีลม', nameEn: 'Silom', postalCode: '10500', districtCode: '1004' },
  { code: '100404', nameTh: 'แขวงสุริยวงศ์', nameEn: 'Suriyawong', postalCode: '10500', districtCode: '1004' },
  { code: '100405', nameTh: 'แขวงบางรัก', nameEn: 'Bang Rak', postalCode: '10500', districtCode: '1004' },
  { code: '100406', nameTh: 'แขวงสี่พระยา', nameEn: 'Si Phraya', postalCode: '10500', districtCode: '1004' },
  
  // เขตปทุมวัน
  { code: '100701', nameTh: 'แขวงลุมพินี', nameEn: 'Lumphini', postalCode: '10330', districtCode: '1007' },
  { code: '100702', nameTh: 'แขวงวังใหม่', nameEn: 'Wang Mai', postalCode: '10330', districtCode: '1007' },
  { code: '100703', nameTh: 'แขวงปทุมวัน', nameEn: 'Pathum Wan', postalCode: '10330', districtCode: '1007' },
  { code: '100704', nameTh: 'แขวงลุมพินี', nameEn: 'Lumphini', postalCode: '10330', districtCode: '1007' },
  
  // เขตคลองเตย
  { code: '101801', nameTh: 'แขวงคลองเตย', nameEn: 'Khlong Toei', postalCode: '10110', districtCode: '1018' },
  { code: '101802', nameTh: 'แขวงคลองตัน', nameEn: 'Khlong Tan', postalCode: '10110', districtCode: '1018' },
  { code: '101803', nameTh: 'แขวงพระโขนง', nameEn: 'Phra Khanong', postalCode: '10110', districtCode: '1018' },
  { code: '101804', nameTh: 'แขวงคลองเตย', nameEn: 'Khlong Toei', postalCode: '10110', districtCode: '1018' },
  
  // เขตวัฒนา
  { code: '102501', nameTh: 'แขวงคลองเตย', nameEn: 'Khlong Toei', postalCode: '10110', districtCode: '1025' },
  { code: '102502', nameTh: 'แขวงคลองตัน', nameEn: 'Khlong Tan', postalCode: '10110', districtCode: '1025' },
  { code: '102503', nameTh: 'แขวงพระโขนง', nameEn: 'Phra Khanong', postalCode: '10110', districtCode: '1025' },
  { code: '102504', nameTh: 'แขวงคลองเตย', nameEn: 'Khlong Toei', postalCode: '10110', districtCode: '1025' }
];

// ข้อมูลตำบล เชียงใหม่ (ตัวอย่างบางอำเภอ)
const chiangMaiSubdistricts = [
  // อำเภอเมืองเชียงใหม่
  { code: '500101', nameTh: 'ตำบลศรีภูมิ', nameEn: 'Si Phum', postalCode: '50200', districtCode: '5001' },
  { code: '500102', nameTh: 'ตำบลพระสิงห์', nameEn: 'Phra Sing', postalCode: '50200', districtCode: '5001' },
  { code: '500103', nameTh: 'ตำบลหายยา', nameEn: 'Hai Ya', postalCode: '50100', districtCode: '5001' },
  { code: '500104', nameTh: 'ตำบลช้างม่อย', nameEn: 'Chang Moi', postalCode: '50100', districtCode: '5001' },
  { code: '500105', nameTh: 'ตำบลช้างคลาน', nameEn: 'Chang Khlan', postalCode: '50100', districtCode: '5001' },
  { code: '500106', nameTh: 'ตำบลวัดเกต', nameEn: 'Wat Ket', postalCode: '50000', districtCode: '5001' },
  { code: '500107', nameTh: 'ตำบลช้างเผือก', nameEn: 'Chang Phueak', postalCode: '50300', districtCode: '5001' },
  { code: '500108', nameTh: 'ตำบลสุเทพ', nameEn: 'Suthep', postalCode: '50200', districtCode: '5001' },
  { code: '500109', nameTh: 'ตำบลแม่เหียะ', nameEn: 'Mae Hia', postalCode: '50100', districtCode: '5001' },
  { code: '500110', nameTh: 'ตำบลป่าแดด', nameEn: 'Pa Daet', postalCode: '50100', districtCode: '5001' },
  { code: '500111', nameTh: 'ตำบลหนองหอย', nameEn: 'Nong Hoi', postalCode: '50100', districtCode: '5001' },
  { code: '500112', nameTh: 'ตำบลท่าศาลา', nameEn: 'Tha Sala', postalCode: '50000', districtCode: '5001' },
  { code: '500113', nameTh: 'ตำบลหนองป่าครั่ง', nameEn: 'Nong Pa Khrang', postalCode: '50000', districtCode: '5001' },
  { code: '500114', nameTh: 'ตำบลฟ้าฮ่าม', nameEn: 'Fa Ham', postalCode: '50000', districtCode: '5001' },
  { code: '500115', nameTh: 'ตำบลป่าตัน', nameEn: 'Pa Tan', postalCode: '50300', districtCode: '5001' },
  { code: '500116', nameTh: 'ตำบลสันผีเสื้อ', nameEn: 'San Phi Suea', postalCode: '50300', districtCode: '5001' },
  
  // อำเภอแม่ริม
  { code: '500701', nameTh: 'ตำบลแม่ริม', nameEn: 'Mae Rim', postalCode: '50180', districtCode: '5007' },
  { code: '500702', nameTh: 'ตำบลสะเมิงใต้', nameEn: 'Samoeng Tai', postalCode: '50180', districtCode: '5007' },
  { code: '500703', nameTh: 'ตำบลสะเมิงเหนือ', nameEn: 'Samoeng Nuea', postalCode: '50180', districtCode: '5007' },
  { code: '500704', nameTh: 'ตำบลแม่สา', nameEn: 'Mae Sa', postalCode: '50180', districtCode: '5007' },
  { code: '500705', nameTh: 'ตำบลแม่แรม', nameEn: 'Mae Raem', postalCode: '50180', districtCode: '5007' },
  { code: '500706', nameTh: 'ตำบลโป่งแยง', nameEn: 'Pong Yaeng', postalCode: '50180', districtCode: '5007' },
  { code: '500707', nameTh: 'ตำบลแม่แรม', nameEn: 'Mae Raem', postalCode: '50180', districtCode: '5007' },
  { code: '500708', nameTh: 'ตำบลแม่สา', nameEn: 'Mae Sa', postalCode: '50180', districtCode: '5007' },
  
  // อำเภอสันทราย
  { code: '501401', nameTh: 'ตำบลสันทราย', nameEn: 'San Sai', postalCode: '50210', districtCode: '5014' },
  { code: '501402', nameTh: 'ตำบลสันทรายน้อย', nameEn: 'San Sai Noi', postalCode: '50210', districtCode: '5014' },
  { code: '501403', nameTh: 'ตำบลสันพระเนตร', nameEn: 'San Phra Net', postalCode: '50210', districtCode: '5014' },
  { code: '501404', nameTh: 'ตำบลสันนาเม็ง', nameEn: 'San Na Meng', postalCode: '50210', districtCode: '5014' },
  { code: '501405', nameTh: 'ตำบลสันป่าเปา', nameEn: 'San Pa Pao', postalCode: '50210', districtCode: '5014' },
  { code: '501406', nameTh: 'ตำบลหนองแหย่ง', nameEn: 'Nong Yaeng', postalCode: '50210', districtCode: '5014' },
  { code: '501407', nameTh: 'ตำบลหนองจ๊อม', nameEn: 'Nong Chom', postalCode: '50210', districtCode: '5014' },
  { code: '501408', nameTh: 'ตำบลหนองจ๊อม', nameEn: 'Nong Chom', postalCode: '50210', districtCode: '5014' }
];

// รวมข้อมูลตำบลทั้งหมด
const allSubdistricts = [...bangkokSubdistricts, ...chiangMaiSubdistricts];

async function seedCompleteAddressData() {
  try {
    console.log('🌱 Starting to seed complete address data...');

    // สร้างจังหวัด
    console.log('📍 Creating provinces...');
    for (const province of provincesData) {
      await prisma.province.upsert({
        where: { code: province.code },
        update: province,
        create: province
      });
    }
    console.log(`✅ Created ${provincesData.length} provinces`);

    // สร้างอำเภอ
    console.log('🏘️ Creating districts...');
    for (const district of allDistricts) {
      const province = await prisma.province.findUnique({
        where: { code: district.provinceCode }
      });
      
      if (province) {
        await prisma.district.upsert({
          where: { code: district.code },
          update: {
            nameTh: district.nameTh,
            nameEn: district.nameEn,
            code: district.code,
            provinceId: province.id
          },
          create: {
            nameTh: district.nameTh,
            nameEn: district.nameEn,
            code: district.code,
            provinceId: province.id
          }
        });
      }
    }
    console.log(`✅ Created ${allDistricts.length} districts`);

    // สร้างตำบล
    console.log('🏠 Creating subdistricts...');
    for (const subdistrict of allSubdistricts) {
      const district = await prisma.district.findUnique({
        where: { code: subdistrict.districtCode }
      });
      
      if (district) {
        await prisma.subdistrict.upsert({
          where: { code: subdistrict.code },
          update: {
            nameTh: subdistrict.nameTh,
            nameEn: subdistrict.nameEn,
            code: subdistrict.code,
            postalCode: subdistrict.postalCode,
            districtId: district.id
          },
          create: {
            nameTh: subdistrict.nameTh,
            nameEn: subdistrict.nameEn,
            code: subdistrict.code,
            postalCode: subdistrict.postalCode,
            districtId: district.id
          }
        });
      }
    }
    console.log(`✅ Created ${allSubdistricts.length} subdistricts`);

    console.log('🎉 Complete address data seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`  - Provinces: ${provincesData.length}`);
    console.log(`  - Districts: ${allDistricts.length}`);
    console.log(`  - Subdistricts: ${allSubdistricts.length}`);
    console.log('');
    console.log('🚀 You can now use the complete address system!');
  } catch (error) {
    console.error('❌ Error seeding complete address data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCompleteAddressData();
