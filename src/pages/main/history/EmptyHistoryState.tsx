import { useTranslation } from 'react-i18next'
import { Zap } from 'lucide-react'
import { FACILITIES } from '../../../utils/historyData'

type EmptyHistoryStateProps = {
  onNavigate: (path: string) => void
  locale: string
}

function EmptyHistoryState({ onNavigate, locale }: EmptyHistoryStateProps) {
  const { t } = useTranslation()

  return (
    <main className="hidden flex-1 items-center bg-[#FFFEF7] md:flex">
      <div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <div className="mx-auto w-full max-w-[520px] lg:mx-0">
          <div className="flex h-[220px] w-full max-w-[380px] flex-col items-center justify-center rounded-3xl bg-[#F1F4EA] lg:h-[260px]">
            <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-2 border-[#004000]">
              <div className="flex h-[38px] w-[38px] translate-x-[4px] translate-y-[5px] items-center justify-center rounded-full bg-[#004000] font-heading text-base font-bold text-white">
                8
              </div>
            </div>
            <p className="mt-4 font-heading text-lg font-bold text-[#004000]">OBC Sport Center</p>
          </div>

          <h1 className="mt-8 font-heading text-3xl font-bold leading-tight text-[#343133] lg:text-[40px] lg:leading-[1.15]">
            {t('history.noDesktopTransactionsTitle')}
          </h1>
          <p className="mt-3 max-w-[500px] text-base leading-relaxed text-[#4B484A]">
            {t('history.noDesktopTransactionsDescription')}
          </p>
        </div>

        <section className="mx-auto w-full max-w-[480px] rounded-3xl border border-[#D9D9D9] bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] lg:mx-0 lg:ml-auto">
          <h2 className="font-heading text-xl font-bold text-[#343133]">
            {t('history.bookCourtTitle')}
          </h2>

          <div className="mt-6 space-y-3.5">
            {FACILITIES.map((facility) => (
              <div
                key={facility.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#D9D9D9] bg-white px-4 py-3.5"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-heading text-sm font-bold text-[#343133]">
                    {t(facility.nameKey)}
                  </h3>
                  <p className="mt-0.5 text-xs text-[#6F6B6E]">
                    {t('history.startingPrice', { price: facility.price.toLocaleString(locale) })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(`/booking/${facility.id}`)}
                  className="flex shrink-0 cursor-pointer items-center gap-1 font-heading text-xs font-bold text-[#004000] hover:opacity-80"
                >
                  {t('history.book')}
                  <Zap size={12} strokeWidth={1.5} className="fill-[#FFE680] text-[#F5C518]" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/fasilitas')}
            className="mt-6 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-[#CDF074] px-6 text-[13px] font-normal text-[#343133] transition-colors hover:bg-[#BFE45F] sm:w-[306px]"
          >
            {t('history.browseOtherCourts')}
          </button>
        </section>
      </div>
    </main>
  )
}

export default EmptyHistoryState