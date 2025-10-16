// data/Users.js
// NOTE: plaintext passwords only for mock/demo use. Do NOT use in real apps.
const placeholder = require('../assets/user_placeholder.png');

const users = [
  // Existing customers — now with role: 'user'
  {
    id: 'user1',
    name: 'John Doe',
    phone: '+351 912 345 678',
    image: placeholder,
    password: 'demo123',
    role: 'user',
    appointments: [
      { id: '101', barberId: '1', date: '2025-08-14', time: '09:00', status: 'completed' },
      { id: '501', barberId: '5', date: '2025-08-28', time: '13:00', status: 'completed' },
    ],
  },
  {
    id: 'user2',
    name: 'Sarah Smith',
    phone: '+351 987 654 321',
    image: placeholder,
    password: 'demo123',
    role: 'user',
    appointments: [
      { id: '102', barberId: '1', date: '2025-08-14', time: '10:00', status: 'completed' },
      { id: '702', barberId: '7', date: '2025-09-06', time: '13:00', status: 'scheduled' },
    ],
  },
  {
    id: 'user3',
    name: 'David Johnson',
    phone: '+351 923 456 789',
    image: placeholder,
    password: 'demo123',
    role: 'user',
    appointments: [
      { id: '103', barberId: '1', date: '2025-08-15', time: '13:00', status: 'completed' },
      { id: '302', barberId: '3', date: '2025-08-30', time: '15:00', status: 'scheduled' },
    ],
  },
  {
    id: 'user4',
    name: 'Emily Brown',
    phone: '+351 931 222 333',
    image: placeholder,
    password: 'demo123',
    role: 'user',
    appointments: [
      { id: '201', barberId: '2', date: '2025-08-24', time: '11:00', status: 'completed' },
      { id: '801', barberId: '8', date: '2025-09-01', time: '14:00', status: 'scheduled' },
    ],
  },
  {
    id: 'user5',
    name: 'Lucas Silva',
    phone: '+351 912 777 888',
    image: placeholder,
    password: 'demo123',
    role: 'user',
    appointments: [
      { id: '202', barberId: '2', date: '2025-08-27', time: '14:00', status: 'completed' },
      { id: '603', barberId: '6', date: '2025-09-10', time: '15:00', status: 'scheduled' },
    ],
  },

  // Barbers added as users — role: 'barber' and linked via barberId
  {
    id: 'user6',
    name: 'Michelle',
    phone: '+351 930 000 001',
    image: placeholder,
    password: 'demo123',
    role: 'barber',
    barberId: '1',
    appointments: [],
  },
  {
    id: 'user7',
    name: 'Jay',
    phone: '+351 930 000 002',
    image: placeholder,
    password: 'demo123',
    role: 'barber',
    barberId: '2',
    appointments: [],
  },
  {
    id: 'user8',
    name: 'Luisa',
    phone: '+351 930 000 003',
    image: placeholder,
    password: 'demo123',
    role: 'barber',
    barberId: '3',
    appointments: [],
  },
  {
    id: 'user9',
    name: 'Mario',
    phone: '+351 930 000 004',
    image: placeholder,
    password: 'demo123',
    role: 'barber',
    barberId: '4',
    appointments: [],
  },
  {
    id: 'user10',
    name: 'Andre',
    phone: '+351 930 000 005',
    image: placeholder,
    password: 'demo123',
    role: 'barber',
    barberId: '5',
    appointments: [],
  },
  {
    id: 'user11',
    name: 'Carly',
    phone: '+351 930 000 006',
    image: placeholder,
    password: 'demo123',
    role: 'barber',
    barberId: '6',
    appointments: [],
  },
  {
    id: 'user12',
    name: 'Musa',
    phone: '+351 930 000 007',
    image: placeholder,
    password: 'demo123',
    role: 'barber',
    barberId: '7',
    appointments: [],
  },
  {
    id: 'user13',
    name: 'Leo',
    phone: '+351 930 000 008',
    image: placeholder,
    password: 'demo123',
    role: 'barber',
    barberId: '8',
    appointments: [],
  },
];

export function findUserByPhone(phone) {
  const norm = String(phone).replace(/\s+/g, '');
  return users.find(u => u.phone && u.phone.replace(/\s+/g, '') === norm);
}

function getNextUserId() {
  // Extract numeric suffixes from ids that match /^user(\d+)$/
  const maxNum = users.reduce((max, u) => {
    const m = /^user(\d+)$/.exec(u.id);
    if (!m) return max;               // ignore non-matching ids, if any
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `user${maxNum + 1 || 1}`;     // start at user1 if empty
}

export function addUser({ name, phone, password, role = 'user', image = placeholder, barberId }) {
  const newUser = {
    id: getNextUserId(),
    name: String(name || '').trim(),
    phone: String(phone || '').trim(),
    image,
    password,            // mock only (no hashing)
    role,
    ...(barberId ? { barberId } : {}),
    appointments: [],
  };
  users.push(newUser);
  return newUser;
}

export default users;
