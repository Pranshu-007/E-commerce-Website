import { getUseFakeStoreCatalog, setUseFakeStoreCatalog } from '../services/catalogSettings.js'
import { fail, ok } from '../utils/http.js'

export const getCatalogMode = async (_req, res) => {
  try {
    const useFakeStoreCatalog = await getUseFakeStoreCatalog()
    return ok(res, {
      useFakeStoreCatalog,
      catalogSource: useFakeStoreCatalog ? 'fakestore' : 'local',
    })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}

export const updateCatalogMode = async (req, res) => {
  try {
    const { useFakeStoreCatalog } = req.body
    if (typeof useFakeStoreCatalog !== 'boolean') {
      return fail(res, 400, 'useFakeStoreCatalog must be a boolean')
    }

    const enabled = await setUseFakeStoreCatalog(useFakeStoreCatalog)

    return ok(res, {
      message: enabled
        ? 'Storefront is now using Fake Store API products'
        : 'Storefront is now using your catalog products',
      useFakeStoreCatalog: enabled,
      catalogSource: enabled ? 'fakestore' : 'local',
    })
  } catch (error) {
    return fail(res, 500, error.message)
  }
}
