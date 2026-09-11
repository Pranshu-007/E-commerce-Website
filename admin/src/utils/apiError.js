export function apiErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Request failed'
}
