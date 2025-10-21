// dev/seedAppointments.js
import Barbers from "../data/Barbers";
import users from "../data/Users";

export const STATUS = {
  BOOKED: "scheduled",
  COMPLETED: "completed",
  CANCELED: "canceled",
  NO_SHOW: "no_show",
};

// -- helpers --------------------------------------------------------------
const pad = (n) => String(n).padStart(2, "0");
export function toTodayString(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function idFrom(barberId, date, time) {
  // Deterministic per slot—safe across reloads
  return `b${barberId}-${date}-${time}`; // e.g. b5-2025-10-16-09:00
}
function isCustomerBusyAt(customerId, date, time) {
  const u = users.find((x) => String(x.id) === String(customerId));
  if (!u || !Array.isArray(u.appointments)) return false;
  return u.appointments.some(
    (a) => a.date === date && a.time === time && a.status === STATUS.BOOKED
  );
}

// -- main seeder ----------------------------------------------------------
/**
 * Ensure a barber has a set of "today" appointments (dev-only helper).
 * Idempotent: re-running won't duplicate the same date+time slots.
 */
export function ensureDevAppointmentsForDay({
  barberId,
  date = toTodayString(),
  start = "09:00",
  intervalMins = 60,
  slots = 8,
  customerPool,                  // optional override
  mirrorToCustomer = true,
} = {}) {
  const barber = Barbers.find((b) => String(b.id) === String(barberId));
  if (!barber) return;

  // Build the full pool: every user who is NOT a barber
  const pool =
    customerPool ??
    users.filter((u) => u.role !== "barber").map((u) => String(u.id));

  if (!pool.length) return;

  barber.appointments ||= [];

  // Track which times already exist for this date to avoid dupes
  const existingTimes = new Set(
    barber.appointments.filter((a) => a.date === date).map((a) => a.time)
  );

  // time math
  const [sh, sm] = start.split(":").map(Number);
  let minutes = sh * 60 + sm;

  // round-robin over the pool, skipping users already busy at that exact date/time
  let rrIndex = 0;

  for (let i = 0; i < slots; i++) {
    const hh = pad(Math.floor(minutes / 60));
    const mm = pad(minutes % 60);
    const time = `${hh}:${mm}`;
    minutes += intervalMins;

    if (existingTimes.has(time)) continue; // already have this time -> skip

    // pick first available customer who isn't double-booked at this time
    let pick = null;
    for (let t = 0; t < pool.length; t++) {
      const candidate = pool[(rrIndex + t) % pool.length];
      if (!isCustomerBusyAt(candidate, date, time)) {
        pick = candidate;
        rrIndex = (rrIndex + t + 1) % pool.length; // advance RR from chosen index
        break;
      }
    }
    // if *everyone* is busy, just take round-robin (it's test data)
    if (!pick) pick = pool[rrIndex++ % pool.length];

    const apptId = idFrom(barberId, date, time);
    const appt = {
      id: apptId,
      date,
      time,
      customerId: pick,
      status: STATUS.BOOKED,
      barberId: String(barberId),
    };

    // upsert on barber
    barber.appointments.push(appt);
    existingTimes.add(time);

    // mirror to customer (optional)
    if (mirrorToCustomer) {
      const u = users.find((uu) => String(uu.id) === String(pick));
      if (u) {
        u.appointments ||= [];
        const exists = u.appointments.some((a) => a.id === apptId);
        if (!exists) u.appointments.push({ ...appt });
      }
    }
  }
}
