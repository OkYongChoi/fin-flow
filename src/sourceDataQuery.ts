import { queryOptions } from '@tanstack/react-query'
import { fetchDataBundle } from './data'

// Public snapshots share one request/cache across explorer, registry and briefs.
// Match /data/*'s five-minute HTTP cache instead of retaining a snapshot forever.
export const SOURCE_DATA_STALE_TIME_MS = 5 * 60 * 1000
export const sourceDataQueryOptions = queryOptions({
  queryKey: ['source-data'],
  queryFn: fetchDataBundle,
  staleTime: SOURCE_DATA_STALE_TIME_MS,
  retry: 1,
})
