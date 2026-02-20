import { Redis } from "ioredis";

let redisInstance: Redis | null = null;

export function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,
    });
  }
  return redisInstance;
}

export function createRedis(): Redis {
  return new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}
