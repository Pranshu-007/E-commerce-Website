import mongoose from 'mongoose'

const storeSettingsSchema = new mongoose.Schema({
  useFakeStoreCatalog: { type: Boolean, default: false },
}, { timestamps: true })

const storeSettingsModel = mongoose.models.storeSettings
  || mongoose.model('storeSettings', storeSettingsSchema)

export default storeSettingsModel
