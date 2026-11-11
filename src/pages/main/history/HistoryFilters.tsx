import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { FILTERS, MOBILE_FILTERS, type FilterType } from '../../../utils/historyData'

type HistoryFiltersProps = {
  activeFilter: FilterType
  searchQuery: string
  onFilterChange: (filter: FilterType) => void
  onSearchChange: (query: string) => void
}

function HistoryFilters({ activeFilter, searchQuery, onFilterChange, onSearchChange }: HistoryFiltersProps) {
  const { t } = useTranslation()

  const renderSearch = (placeholder: string) => (
    <label className="mt-3 flex h-10 items-center gap-2 rounded-lg border border-[#D4D4D4] bg-white px-3 focus-within:border-[#404F14] md:mt-0 md:min-w-[280px]">
      <Search size={16} className="shrink-0 text-[#6F6B6E]" aria-hidden="true" />
      <input
        type="search"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t(placeholder)}
        aria-label={t('history.searchLabel')}
        className="min-w-0 flex-1 bg-transparent text-sm text-[#343133] outline-none placeholder:text-[#9A9698]"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => onSearchChange('')}
          aria-label={t('history.clearSearch')}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[#6F6B6E] hover:bg-[#F1F2EE]"
        >
          <X size={15} aria-hidden="true" />
        </button>
      )}
    </label>
  )

  return (
    <>
      <div className="md:hidden">
        <p className="text-sm text-[#6F6B6E]">{t('history.mobileDescription')}</p>
        {renderSearch('history.searchMobile')}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {MOBILE_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onFilterChange(filter.id)}
                className={`shrink-0 rounded-full border px-5 py-2 text-xs font-heading font-bold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#404F14] border-[#404F14] text-white'
                    : 'bg-white border-[#D4D4D4] text-[#6F6B6E]'
                }`}
              >
                {t(filter.label)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="hidden gap-4 md:flex md:flex-col lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#343133] lg:text-3xl">
            {t('history.title')}
          </h1>
          <p className="mt-1 text-sm text-[#343133]">{t('history.description')}</p>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-3 lg:items-end">
          {renderSearch('history.searchDesktop')}
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onFilterChange(filter.id)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-heading font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#404F14] border-[#404F14] text-white'
                      : 'bg-white border-[#404F14] text-[#404F14] hover:bg-[#F5FAF3]'
                  }`}
                >
                  {t(filter.label)}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default HistoryFilters