import storeSettingsModel from '../models/storeSettingsModel.js'
import * as cache from './cache.js'
import { clearFakeStoreCache } from './fakeStore.js'

export async function getUseFakeStoreCatalog() {
  const settings = await storeSettingsModel.findOne().lean()
  return Boolean(settings?.useFakeStoreCatalog)
}

export async function setUseFakeStoreCatalog(enabled) {
  const settings = await storeSettingsModel.findOneAndUpdate(
    {},
    { useFakeStoreCatalog: Boolean(enabled) },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  clearFakeStoreCache()
  await cache.invalidateProductCache()

  return Boolean(settings.useFakeStoreCatalog)
}
