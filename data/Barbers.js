const barbers = [
  {
  id: '1',
  name: 'Mike',
  specialty: 'Fade Master',
  description: '10+ years of experience in modern fades and classic styles.',
  prices: {
    haircut: '15€',
    haircutBeard: '20€',
  },
  image: require('../assets/user_placeholder.png'), 
  portfolio: [
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
    ],
    appointments: [
      // status optional, but handy
      { id: '1', date: '2025-08-14', time: '09:00', customerId: 'user1', status: 'scheduled', barberId: '1' },
      { id: '2', date: '2025-08-14', time: '10:00', customerId: 'user2', status: 'scheduled', barberId: '1' },
      { id: '3', date: '2025-08-15', time: '13:00', customerId: 'user3', status: 'scheduled', barberId: '1' },
    ],
  },
  {
    id: '2',
    name: 'Jay',
    specialty: 'Beard Sculptor',
    description: '10+ years of experience in modern fades and classic styles.',
  prices: {
    haircut: '15€',
    haircutBeard: '20€',
  },
  image: require('../assets/user_placeholder.png'), // or use URL if hosted
  portfolio: [
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
    ],
    appointments: [
      // status optional, but handy
      { id: '1', date: '2025-08-14', time: '09:00', customerId: 'user1', status: 'scheduled' },
      { id: '2', date: '2025-08-14', time: '10:00', customerId: 'user2', status: 'scheduled' },
      { id: '3', date: '2025-08-15', time: '13:00', customerId: 'user3', status: 'scheduled' },
    ],
  },
  {
    id: '3',
    name: 'Luis',
    specialty: 'Classic Cuts',
    description: '10+ years of experience in modern fades and classic styles.',
  prices: {
    haircut: '15€',
    haircutBeard: '20€',
  },
  image: require('../assets/user_placeholder.png'), // or use URL if hosted
  portfolio: [
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
    ],
    appointments: [
      // status optional, but handy
      { id: '1', date: '2025-08-14', time: '09:00', customerId: 'user1', status: 'scheduled' },
      { id: '2', date: '2025-08-14', time: '10:00', customerId: 'user2', status: 'scheduled' },
      { id: '3', date: '2025-08-15', time: '13:00', customerId: 'user3', status: 'scheduled' },
    ],
  },
  {
    id: '4',
    name: 'Tariq',
    specialty: 'Design Expert',
    description: '10+ years of experience in modern fades and classic styles.',
  prices: {
    haircut: '15€',
    haircutBeard: '20€',
  },
  image: require('../assets/user_placeholder.png'), // or use URL if hosted
  portfolio: [
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
    ],
    appointments: [
      // status optional, but handy
      { id: '1', date: '2025-08-14', time: '09:00', customerId: 'user1', status: 'scheduled' },
      { id: '2', date: '2025-08-14', time: '10:00', customerId: 'user2', status: 'scheduled' },
      { id: '3', date: '2025-08-15', time: '13:00', customerId: 'user3', status: 'scheduled' },
    ],
  },
  {
  id: '5',
  name: 'Andre',
  specialty: 'Precision Fades',
  description: '10+ years of experience in modern fades and classic styles.',
  prices: {
    haircut: '15€',
    haircutBeard: '20€',
  },
  image: require('../assets/user_placeholder.png'), // or use URL if hosted
  portfolio: [
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
    ],
    appointments: [
      // status optional, but handy
      { id: '1', date: '2025-08-14', time: '09:00', customerId: 'user1', status: 'scheduled' },
      { id: '2', date: '2025-08-14', time: '10:00', customerId: 'user2', status: 'scheduled' },
      { id: '3', date: '2025-08-15', time: '13:00', customerId: 'user3', status: 'scheduled' },
    ],
  },
  {
  id: '6',
  name: 'Carlos',
  specialty: 'Beard Sculpting',
  description: '10+ years of experience in modern fades and classic styles.',
  prices: {
    haircut: '15€',
    haircutBeard: '20€',
  },
  image: require('../assets/user_placeholder.png'), // or use URL if hosted
  portfolio: [
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
    ],
    appointments: [
      // status optional, but handy
      { id: '1', date: '2025-08-14', time: '09:00', customerId: 'user1', status: 'scheduled' },
      { id: '2', date: '2025-08-14', time: '10:00', customerId: 'user2', status: 'scheduled' },
      { id: '3', date: '2025-08-15', time: '13:00', customerId: 'user3', status: 'scheduled' },
    ],
  },
  {
  id: '7',
  name: 'Musa',
  specialty: 'Lineup Specialist',
  description: '10+ years of experience in modern fades and classic styles.',
  prices: {
    haircut: '15€',
    haircutBeard: '20€',
  },
  image: require('../assets/user_placeholder.png'), // or use URL if hosted
  portfolio: [
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
    ],
    appointments: [
      // status optional, but handy
      { id: '1', date: '2025-08-14', time: '09:00', customerId: 'user1', status: 'scheduled' },
      { id: '2', date: '2025-08-14', time: '10:00', customerId: 'user2', status: 'scheduled' },
      { id: '3', date: '2025-08-15', time: '13:00', customerId: 'user3', status: 'scheduled' },
    ],
  },
  {
  id: '8',
  name: 'Leo',
  specialty: 'Modern Cuts',
  description: '10+ years of experience in modern fades and classic styles.',
  prices: {
    haircut: '15€',
    haircutBeard: '20€',
  },
  image: require('../assets/user_placeholder.png'), // or use URL if hosted
  portfolio: [
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
      require('../assets/user_placeholder.png'),
    ],
    appointments: [
      // status optional, but handy
      { id: '1', date: '2025-08-14', time: '09:00', customerId: 'user1', status: 'scheduled' },
      { id: '2', date: '2025-08-14', time: '10:00', customerId: 'user2', status: 'scheduled' },
      { id: '3', date: '2025-08-15', time: '13:00', customerId: 'user3', status: 'scheduled' },
    ],
  }
];

export default barbers;