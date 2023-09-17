import { RATE_LIMIT_SECRET } from '$env/static/private';
import { RateLimiter } from 'sveltekit-rate-limiter/server';

export const signUpLimiter = new RateLimiter({
  rates: {
    IP: [10, 'h'], // IP address limiter
    IPUA: [8, 'm'], // IP + User Agent limiter
    cookie: {
      name: 'cici_panel_su_rl',
      secret: RATE_LIMIT_SECRET,
      rate: [5, 'm'],
      preflight: true,
    },
  },
});

export const signInLimiter = new RateLimiter({
  rates: {
    IP: [8, 'h'], // IP address limiter
    IPUA: [5, 'm'], // IP + User Agent limiter
    cookie: {
      name: 'cici_panel_si_rl',
      secret: RATE_LIMIT_SECRET,
      rate: [3, 'm'],
      preflight: true,
    },
  },
});

export const passwordResetLimiter = new RateLimiter({
  rates: {
    IP: [5, 'h'], // IP address limiter
    IPUA: [3, 'm'], // IP + User Agent limiter
    cookie: {
      name: 'cici_panel_pr_rl',
      secret: RATE_LIMIT_SECRET,
      rate: [2, 'm'],
      preflight: true,
    },
  },
});

export const emailVerificationLimiter = new RateLimiter({
  rates: {
    IP: [1, 'h'], // IP address limiter
    IPUA: [3, 'h'], // IP + User Agent limiter
    cookie: {
      name: 'cici_panel_ev_rl',
      secret: RATE_LIMIT_SECRET,
      rate: [10, 'h'],
      preflight: true,
    },
  },
});

export const profileUpdateLimiter = new RateLimiter({
  rates: {
    IP: [3, 'h'], // IP address limiter
    IPUA: [4, 'm'], // IP + User Agent limiter
    cookie: {
      name: 'cici_panel_pu_rl',
      secret: RATE_LIMIT_SECRET,
      rate: [5, 'm'],
      preflight: true,
    },
  },
});

export const userUpdateLimiter = new RateLimiter({
  rates: {
    IP: [3, 'h'], // IP address limiter
    IPUA: [4, 'm'], // IP + User Agent limiter
    cookie: {
      name: 'cici_panel_pu_rl',
      secret: RATE_LIMIT_SECRET,
      rate: [10, 'm'],
      preflight: true,
    },
  },
});

export const userCreateLimiter = new RateLimiter({
  rates: {
    IP: [2, 'h'], // IP address limiter
    IPUA: [3, 'm'], // IP + User Agent limiter
    cookie: {
      name: 'cici_panel_pu_rl',
      secret: RATE_LIMIT_SECRET,
      rate: [6, 'm'],
      preflight: true,
    },
  },
});

export const groupUpdateLimiter = new RateLimiter({
  rates: {
    IP: [3, 'h'], // IP address limiter
    IPUA: [4, 'm'], // IP + User Agent limiter
    cookie: {
      name: 'cici_panel_pu_rl',
      secret: RATE_LIMIT_SECRET,
      rate: [10, 'm'],
      preflight: true,
    },
  },
});

export const groupCreateLimiter = new RateLimiter({
  rates: {
    IP: [2, 'h'], // IP address limiter
    IPUA: [3, 'm'], // IP + User Agent limiter
    cookie: {
      name: 'cici_panel_pu_rl',
      secret: RATE_LIMIT_SECRET,
      rate: [6, 'm'],
      preflight: true,
    },
  },
});

export const roleUpdateLimiter = new RateLimiter({
  rates: {
    IP: [3, 'h'], // IP address limiter
    IPUA: [4, 'm'], // IP + User Agent limiter
    cookie: {
      name: 'cici_panel_pu_rl',
      secret: RATE_LIMIT_SECRET,
      rate: [10, 'm'],
      preflight: true,
    },
  },
});

export const roleCreateLimiter = new RateLimiter({
  rates: {
    IP: [2, 'h'], // IP address limiter
    IPUA: [3, 'm'], // IP + User Agent limiter
    cookie: {
      name: 'cici_panel_pu_rl',
      secret: RATE_LIMIT_SECRET,
      rate: [6, 'm'],
      preflight: true,
    },
  },
});
