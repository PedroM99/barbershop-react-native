
// NOTE: plaintext passwords only for mock/demo use. Do NOT use in real apps.
const placeholder = require('../assets/user_placeholder.png');

const users = [
  {
    id: 'user1',
    name: 'John Doe',
    phone: '+351 912 345 678',
    image: placeholder,
    password: 'demo123',
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
    appointments: [
      { id: '202', barberId: '2', date: '2025-08-27', time: '14:00', status: 'completed' },
      { id: '603', barberId: '6', date: '2025-09-10', time: '15:00', status: 'scheduled' },
    ],
  },
];


export function findUserByPhone(phone) {
  const norm = String(phone).replace(/\s+/g, '');
  return users.find(u => u.phone && u.phone.replace(/\s+/g, '') === norm);
};

function getNextUserId() {
  // Extract numeric suffixes from ids that match /^user(\d+)$/
  const maxNum = users.reduce((max, u) => {
    const m = /^user(\d+)$/.exec(u.id);
    if (!m) return max;               // ignore non-matching ids, if any
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `user${maxNum + 1 || 1}`;     // start at user1 if empty
};

export function addUser({ name, phone, password }) {
  const newUser = {
    id: getNextUserId(),
    name: String(name || '').trim(),
    phone: String(phone || '').trim(),
    image: placeholder,
    password,            // mock only (no hashing)
    appointments: [],
  };
  users.push(newUser);
  return newUser;
};

export default users;
