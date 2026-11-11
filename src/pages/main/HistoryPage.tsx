import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import NavbarDashboard from '../../components/layout/Navbar'
import MobileHeader from '../../components/layout/MobileHeader'
import DeferredFooter from '../../components/layout/DeferredFooter'
import { getBookings } from '../../services/bookingService'
import { getApiErrorMessage } from '../../services/apiService'
import { getMyMemberships } from '../../services/membershipService'
import { useAuth } from '../../hooks/useAuth'
import { queryKeys } from '../../utils/queryKeys'
import HistoryFilters from './history/HistoryFilters'
import MobileTransactionList from './history/MobileTransactionList'
import DesktopTransactionTable from './history/DesktopTransactionTable'
import EmptyHistoryState from './history/EmptyHistoryState'
import {
  PAGE_SIZE,
  mapBooking,
  mapMembership,
  type FilterType,
  type Transaction,
  type TransactionStatus,
  type MobileTransaction,
} from '../../utils/historyData'

function HistoryPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const customerKey = user?.id ?? user?.email ?? 'anonymous'
  const locale = i18n.resolvedLanguage?.startsWith('en') ? 'en-US' : 'id-ID'
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const historyQuery = useQuery({
    queryKey: queryKeys.customerHistory(customerKey),
    queryFn: () => Promise.allSettled([
      getBookings({ page: 1, limit: 100 }),
      getMyMemberships(),
    ]),
    enabled: isLoggedIn,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
  const [bookingResult, membershipResult] = historyQuery.data ?? []
  const bookingTransactions = bookingResult?.status === 'fulfilled'
    ? bookingResult.value.bookings.map((booking) => mapBooking(booking, locale))
    : []
  const membershipTransactions = membershipResult?.status === 'fulfilled'
    ? membershipResult.value.map((membership) => mapMembership(membership, locale))
    : []
  const transactions: Transaction[] = [
    ...bookingTransactions.map((item) => item.desktop),
    ...membershipTransactions.map((item) => item.desktop),
  ]
  const mobileTransactions: MobileTransaction[] = [
    ...bookingTransactions.map((item) => item.mobile),
    ...membershipTransactions.map((item) => item.mobile),
  ]
  const isLoading = historyQuery.isPending
  const errorNotified = useRef(false)

  useEffect(() => {
    if (!historyQuery.data || errorNotified.current) return
    const failedResult = bookingResult?.status === 'rejected'
      ? bookingResult
      : membershipResult?.status === 'rejected'
        ? membershipResult
        : null
    if (!failedResult || failedResult.status !== 'rejected') return
    errorNotified.current = true
    toast.error(getApiErrorMessage(failedResult.reason, t('history.loadPartialError')))
  }, [bookingResult, historyQuery.data, membershipResult, t])

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim())
      setCurrentPage(1)
    }, 300)

    return () => window.clearTimeout(debounceTimer)
  }, [searchQuery])

  // Filter sesuai tombol (desktop: Semua / Berhasil / Menunggu)
  const normalizedSearch = debouncedSearchQuery.toLocaleLowerCase(locale)
  const filteredTransactions = transactions.filter((trx) => {
    const matchesStatus = activeFilter === 'all' || trx.status === activeFilter
    const matchesSearch = !normalizedSearch || [
      trx.id,
      trx.code,
      trx.date,
      trx.facility,
      trx.paymentMethod,
      trx.total,
    ].some((value) => value?.toLocaleLowerCase(locale).includes(normalizedSearch))
    return matchesStatus && matchesSearch
  })

  // Filter untuk kartu mobile (Semua / Aktif / Selesai / Gagal)
  const filteredMobile = mobileTransactions.filter((trx) => {
    const matchesStatus = activeFilter === 'all' || trx.status === activeFilter
    const matchesSearch = !normalizedSearch || [
      trx.id,
      trx.date,
      trx.title,
      trx.time,
      trx.paymentMethod,
      trx.total,
    ].some((value) => value?.toLocaleLowerCase(locale).includes(normalizedSearch))
    return matchesStatus && matchesSearch
  })
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE))
  const mobileTotalPages = Math.max(1, Math.ceil(filteredMobile.length / PAGE_SIZE))
  const displayedPage = Math.min(currentPage, totalPages)
  const displayedMobilePage = Math.min(currentPage, mobileTotalPages)
  const pageStart = (displayedPage - 1) * PAGE_SIZE
  const mobilePageStart = (displayedMobilePage - 1) * PAGE_SIZE
  const currentTransactions = filteredTransactions.slice(pageStart, pageStart + PAGE_SIZE)
  const currentMobileTransactions = filteredMobile.slice(mobilePageStart, mobilePageStart + PAGE_SIZE)

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  // True jika user memang belum punya transaksi sama sekali (bukan karena filter)
  const hasNoTransactions = transactions.length === 0 && !isLoading
  const hasNoMobileTransactions = mobileTransactions.length === 0 && !isLoading

  const handleDetail = (transaction: Pick<Transaction, 'id' | 'kind' | 'status' | 'paymentMethod'>) => {
    const pathByStatus: Record<TransactionStatus, string> = {
      pending: '/finalisasi-order',
      success: '/success-order',
      failed: '/failed-order',
    }

    const detailParam = transaction.kind === 'membership' ? 'membershipId' : 'bookingId'
    navigate(`${pathByStatus[transaction.status]}?${detailParam}=${encodeURIComponent(transaction.id)}`, {
      state: { [detailParam]: transaction.id },
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-white font-body text-[#343133]">
      <div className="hidden shrink-0 md:block">
        <NavbarDashboard />
      </div>

      <div className="md:hidden">
        <MobileHeader variant="title" title={t('common.transactionHistory')} />
      </div>

      {isLoading && <p role="status" className="mx-auto mt-6 text-sm text-[#6F6B6E]">{t('history.loading')}</p>}
      {hasNoTransactions && <EmptyHistoryState locale={locale} onNavigate={navigate} />}

      <main
        className={`mx-auto min-h-0 w-full max-w-[1248px] flex-1 px-5 pt-1 pb-32 md:px-6 md:pt-8 md:pb-8 ${
          hasNoTransactions ? 'md:hidden' : 'md:flex md:flex-col'
        }`}
      >
        <HistoryFilters
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          onFilterChange={handleFilterChange}
          onSearchChange={setSearchQuery}
        />

        <MobileTransactionList
          transactions={currentMobileTransactions}
          hasNoTransactions={hasNoMobileTransactions}
          onDetail={handleDetail}
        />
        <DesktopTransactionTable
          transactions={currentTransactions}
          hasFilteredTransactions={filteredTransactions.length > 0}
          onDetail={handleDetail}
        />

        {filteredMobile.length > 0 && mobileTotalPages > 1 && (
          <nav
            aria-label={t('history.paginationLabel')}
            className="mt-5 flex items-center justify-center gap-4 pb-4 md:hidden"
          >
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, displayedMobilePage - 1))}
              disabled={displayedMobilePage === 1}
              aria-label={t('history.previousPage')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4D4D4] text-[#404F14] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span aria-live="polite" className="font-heading text-sm text-[#343133]">
              {t('history.pageOf', { page: displayedMobilePage, total: mobileTotalPages })}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(mobileTotalPages, displayedMobilePage + 1))}
              disabled={displayedMobilePage === mobileTotalPages}
              aria-label={t('history.nextPage')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4D4D4] text-[#404F14] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </nav>
        )}

        {filteredTransactions.length > 0 && totalPages > 1 && (
          <nav
            aria-label={t('history.paginationLabel')}
            className="mt-5 hidden items-center justify-center gap-4 pb-4 md:flex"
          >
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, displayedPage - 1))}
              disabled={displayedPage === 1}
              aria-label={t('history.previousPage')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4D4D4] text-[#404F14] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span aria-live="polite" className="font-heading text-sm text-[#343133]">
              {t('history.pageOf', { page: displayedPage, total: totalPages })}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, displayedPage + 1))}
              disabled={displayedPage === totalPages}
              aria-label={t('history.nextPage')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D4D4D4] text-[#404F14] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </nav>
        )}
      </main>

      {/* Footer selalu menempel di dasar halaman */}
      <div className="mt-auto w-full">
        <DeferredFooter />
      </div>
        
    </div>
  )
}

export default HistoryPage