import IORedis from 'ioredis'

let sharedConnection

export function getRedisConnection() {
  if (sharedConnection) return sharedConnection

  const url = process.env.REDIS_URL
  const options = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  }

  sharedConnection = url
    ? new IORedis(url, options)
    : new IORedis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      ...options,
    })

  sharedConnection.on('error', err => {
    console.error('Redis connection error:', err.message)
  })

  return sharedConnection
}
