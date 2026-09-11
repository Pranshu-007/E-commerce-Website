import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

const connectDB = async () => {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required')
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn
  }

  if (!cached.promise) {
    mongoose.set('bufferCommands', false)

    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    }).then((connection) => {
      console.log('DB Connected')
      return connection
    }).catch((error) => {
      cached.promise = null
      console.error('MongoDB connection failed:', error.message)
      throw error
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default connectDB
