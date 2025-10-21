const barbers = [
  {
    id: '1',
    name: 'Michelle',
    specialty: 'Fade Master',
    description: 'Precision skin fades and seamless tapers with ultra-smooth transitions. Finishes every cut with a personalized product routine for your hair type.',
    prices: {
      haircut: '15€',
      haircutBeard: '20€',
    },
    image: require('../assets/Barber1.png'),
    portfolio: [
      require('../assets/customer1.png'),
      require('../assets/customer13.png'),
      require('../assets/customer14.png')
    ],
    appointments: [
      { id: '101', date: '2025-08-14', time: '09:00', customerId: 'user1', status: 'scheduled', barberId: '1' },
      { id: '102', date: '2025-08-14', time: '10:00', customerId: 'user2', status: 'scheduled', barberId: '1' },
      { id: '103', date: '2025-08-15', time: '13:00', customerId: 'user3', status: 'scheduled', barberId: '1' },
    ],
  },
  {
    id: '2',
    name: 'Jay',
    specialty: 'Beard Sculptor',
    description: 'Razor-sharp beard shaping with perfect cheek and neckline symmetry. Known for hot-towel shaves and finishes that keep beards soft and defined.',
    prices: {
      haircut: '15€',
      haircutBeard: '20€',
    },
    image: require('../assets/Barber2.png'),
    portfolio: [
      require('../assets/customer2.png'),
      require('../assets/customer15.png')
    ],
    appointments: [
      { id: '201', date: '2025-08-24', time: '11:00', customerId: 'user4', status: 'scheduled', barberId: '2' },
      { id: '202', date: '2025-08-27', time: '14:00', customerId: 'user5', status: 'scheduled', barberId: '2' },
      { id: '203', date: '2025-09-02', time: '09:00', customerId: 'user6', status: 'scheduled', barberId: '2' },
    ],
  },
  {
    id: '3',
    name: 'Luisa',
    specialty: 'Classic Cuts',
    description: 'Timeless scissor work—pompadours, side parts, and crew cuts with clean tapers. Focused on natural movement and easy day-to-day styling.',
    prices: {
      haircut: '15€',
      haircutBeard: '20€',
    },
    image: require('../assets/Barber3.png'),
    portfolio: [
      require('../assets/customer3.png'),
      require('../assets/customer4.png'),
      require('../assets/customer16.png')
    ],
    appointments: [
      { id: '301', date: '2025-08-25', time: '10:00', customerId: 'user7', status: 'scheduled', barberId: '3' },
      { id: '302', date: '2025-08-30', time: '15:00', customerId: 'user8', status: 'scheduled', barberId: '3' },
      { id: '303', date: '2025-09-05', time: '13:00', customerId: 'user9', status: 'scheduled', barberId: '3' },
    ],
  },
  {
    id: '4',
    name: 'Mario',
    specialty: 'Design Expert',
    description: 'Creative hair designs and freestyle patterns with crisp lineups. Delivers bold looks that stay sharp and wearable between visits.',
    prices: {
      haircut: '15€',
      haircutBeard: '20€',
    },
    image: require('../assets/Barber4.png'),
    portfolio: [
      require('../assets/customer5.png'),
      require('../assets/customer17.png')
    ],
    appointments: [
      { id: '401', date: '2025-08-26', time: '09:00', customerId: 'user10', status: 'scheduled', barberId: '4' },
      { id: '402', date: '2025-09-01', time: '11:00', customerId: 'user11', status: 'scheduled', barberId: '4' },
      { id: '403', date: '2025-09-07', time: '16:00', customerId: 'user12', status: 'scheduled', barberId: '4' },
    ],
  },
  {
    id: '5',
    name: 'Andre',
    specialty: 'Precision Fades',
    description: 'Ultra-clean low and mid fades with textured tops and tight detailing. Known for meticulous work around the ears and nape.',
    prices: {
      haircut: '15€',
      haircutBeard: '20€',
    },
    image: require('../assets/Barber5.png'),
    portfolio: [
      require('../assets/customer6.png'),
      require('../assets/customer7.png'),
      require('../assets/customer18.png')
    ],
    appointments: [
      { id: '501', date: '2025-08-28', time: '13:00', customerId: 'user13', status: 'scheduled', barberId: '5' },
      { id: '502', date: '2025-09-03', time: '10:00', customerId: 'user14', status: 'scheduled', barberId: '5' },
      { id: '503', date: '2025-10-10', time: '10:00', customerId: 'user3', status: 'scheduled', barberId: '5' },
      { id: '504', date: '2025-12-24', time: '10:00', customerId: 'user1', status: 'scheduled', barberId: '5' },
    ],
  },
  {
    id: '6',
    name: 'Carly',
    specialty: 'Beard Sculpting',
    description: 'Beard restoration and shaping tailored to growth patterns. Hot-lather straight-razor finishes and conditioning to keep beards healthy.',
    prices: {
      haircut: '15€',
      haircutBeard: '20€',
    },
    image: require('../assets/Barber6.png'),
    portfolio: [
      require('../assets/customer8.png'),
      require('../assets/customer19.png')
    ],
    appointments: [
      { id: '601', date: '2025-08-29', time: '11:00', customerId: 'user16', status: 'scheduled', barberId: '6' },
      { id: '602', date: '2025-09-04', time: '09:00', customerId: 'user17', status: 'scheduled', barberId: '6' },
      { id: '603', date: '2025-09-10', time: '15:00', customerId: 'user18', status: 'scheduled', barberId: '6' },
    ],
  },
  {
    id: '7',
    name: 'Musa',
    specialty: 'Lineup Specialist',
    description: 'Surgical edge-ups and defined outlines that last. Ideal for maintenance visits between full cuts with quick, consistent results.',
    prices: {
      haircut: '15€',
      haircutBeard: '20€',
    },
    image: require('../assets/Barber7.png'),
    portfolio: [
      require('../assets/customer9.png')
    ],
    appointments: [
      { id: '701', date: '2025-08-31', time: '10:00', customerId: 'user19', status: 'scheduled', barberId: '7' },
      { id: '702', date: '2025-09-06', time: '13:00', customerId: 'user20', status: 'scheduled', barberId: '7' },
      { id: '703', date: '2025-09-12', time: '16:00', customerId: 'user21', status: 'scheduled', barberId: '7' },
    ],
  },
  {
    id: '8',
    name: 'Leo',
    specialty: 'Modern Cuts',
    description: 'Trend-forward crops, textured quiffs, and flow cuts styled for low maintenance. Product coaching so the look stays sharp all week.',
    prices: {
      haircut: '15€',
      haircutBeard: '20€',
    },
    image: require('../assets/Barber8.png'),
    portfolio: [
      require('../assets/customer10.png'),
      require('../assets/customer11.png'),
      require('../assets/customer12.png')
    ],
    appointments: [
      { id: '801', date: '2025-09-01', time: '14:00', customerId: 'user22', status: 'scheduled', barberId: '8' },
      { id: '802', date: '2025-09-08', time: '11:00', customerId: 'user23', status: 'scheduled', barberId: '8' },
      { id: '803', date: '2025-09-14', time: '09:00', customerId: 'user24', status: 'scheduled', barberId: '8' },
    ],
  },
];

export default barbers;
