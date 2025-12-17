/**
 * React Hooks Index
 * Export all custom hooks for the marketplace
 */

export {
  useMarketplace,
  useListing,
  type Listing,
  type Publisher,
  type ListingType,
  type PricingModel,
  type VerificationLevel,
  type MarketplaceFilters,
  type UseMarketplaceResult,
  type UseListingResult,
} from './useMarketplace'

export {
  usePublisher,
  useTransactions,
  type Publisher as PublisherProfile,
  type PublisherListing,
  type PublisherPayout,
  type Transaction,
  type CreatePublisherData,
  type UsePublisherResult,
  type UseTransactionsResult,
} from './usePublisher'

export {
  useAuth,
  type User,
  type UseAuthResult,
} from './useAuth'

export {
  useX402Payment,
  type PaymentStatus,
  type PaymentDetails,
  type UseX402PaymentResult,
} from './useX402Payment'

export {
  usePayouts,
  type PayoutMethod,
  type PayoutStatus,
  type Payout,
  type PayoutStats,
  type PayoutSettings,
  type UsePayoutsResult,
} from './usePayouts'

export {
  trackEvent,
  useListingView,
  useListingAnalytics,
  usePublisherAnalytics,
  usePlatformAnalytics,
  type ListingAnalytics,
  type PublisherAnalytics,
  type DailyDataPoint,
} from './useAnalytics'

export { useGhostFlow } from './useGhostFlow'
