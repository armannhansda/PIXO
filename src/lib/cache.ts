import {Redis} from '@upstash/redis';

export const redis = Redis.fromEnv();


export async function getCache(key: string){
  return await redis.get(key);
}

export async function setCache(key: string, value: unknown, ttl = 60){
  return await redis.set(key, value, { ex: ttl });
}
