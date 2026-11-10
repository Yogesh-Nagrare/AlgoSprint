// const { createClient } = require('redis');

// const redisClient = createClient({
//     username: 'default',
//     password: process.env.REDIS_PASS,
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: 17567
//     }
// });

// module.exports = redisClient;

// src/config/redis.js  (in-memory replacement for Redis)
const store = new Map(); // key -> { val, exp (ms epoch | null) }

const alive = (key) => {
  const e = store.get(key);
  if (!e) return null;
  if (e.exp && e.exp <= Date.now()) { store.delete(key); return null; }
  return e;
};

const redisClient = {
  isOpen: true,
  async connect() {},
  on() { return this; },

  async get(key) { const e = alive(key); return e ? e.val : null; },
  async set(key, val, opts) {
    store.set(key, { val: String(val), exp: opts?.EX ? Date.now() + opts.EX * 1000 : null });
    return 'OK';
  },
  async exists(key) { return alive(key) ? 1 : 0; },
  async del(key) { return store.delete(key) ? 1 : 0; },
  async incr(key) {
    const e = alive(key);
    const n = (e ? parseInt(e.val, 10) || 0 : 0) + 1;
    store.set(key, { val: String(n), exp: e ? e.exp : null });
    return n;
  },
  async decr(key) {
    const e = alive(key);
    const n = (e ? parseInt(e.val, 10) || 0 : 0) - 1;
    store.set(key, { val: String(n), exp: e ? e.exp : null });
    return n;
  },
  async expire(key, seconds) {
    const e = alive(key);
    if (!e) return 0;
    e.exp = Date.now() + seconds * 1000;
    return 1;
  },
  async expireAt(key, unixSeconds) {
    const e = alive(key);
    if (!e) return 0;
    e.exp = unixSeconds * 1000;
    return 1;
  },
};

// purge expired keys every 10 min so memory doesn't grow
setInterval(() => { for (const k of store.keys()) alive(k); }, 600000).unref();

module.exports = redisClient;