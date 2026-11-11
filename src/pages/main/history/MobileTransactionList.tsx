import { useTranslation } from 'react-i18next'
import DeferredSection from '../../../components/layout/DeferredSection'
import { MOBILE_STATUS_BADGE, type MobileTransaction, type Transaction } from '../../../utils/historyData'

type MobileTransactionListProps = {
  transactions: MobileTransaction[]
  hasNoTransactions: boolean
  onDetail: (transaction: Pick<Transaction, 'id' | 'kind' | 'status' | 'paymentMethod'>) => void
}

function MobileTransactionList({ transactions, hasNoTransactions, onDetail }: MobileTransactionListProps) {
  const { t } = useTranslation()

  return (
    <div className="md:hidden">
      <DeferredSection placeholderClassName="mt-4 min-h-[420px]">
        {transactions.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {transactions.map((transaction) => {
              const badge = MOBILE_STATUS_BADGE[transaction.status]
              return (
                <li
                  key={transaction.id}
                  className="rounded-xl border border-[#E5E5E5] bg-white px-3.5 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.05)]"
                >
                  <div className="flex items-center justify-between">
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-heading font-bold ${badge.className}`}>
                      {t(`history.status.${badge.label}`)}
                    </span>
                    <span className="text-xs text-[#6F6B6E]">{transaction.date}</span>
                  </div>

                  <h2 className="mt-3 font-heading text-base font-bold text-[#121212]">
                    {transaction.title}
                  </h2>
                  <p className="mt-1 text-sm text-[#6F6B6E]">
                    {transaction.kind === 'membership'
                      ? t('history.remainingSessions', {
                          remaining: transaction.remainingSessions,
                          total: transaction.totalSessions,
                        })
                      : t('history.time', {
                          time: t('history.bookingSchedule', {
                            start: transaction.time.split(' - ')[0],
                            end: transaction.time.split(' - ')[1],
                            hours: transaction.durationHours,
                          }),
                        })}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-[#6F6B6E]">{t('history.totalPayment')}</span>
                    <span className="font-heading text-base font-bold text-[#404F14]">
                      {transaction.total}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDetail(transaction)}
                    className="mt-3 w-full rounded-lg border border-[#404F14] py-2 font-heading text-xs font-bold text-[#404F14]"
                  >
                    {t('history.detail')}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <h2 className="font-heading text-xl font-bold text-[#404F14]">
              {hasNoTransactions ? t('history.noMobileTransactions') : t('history.noSearchResults')}
            </h2>
            <p className="mt-3 max-w-[300px] text-sm leading-relaxed text-[#6F6B6E]">
              {hasNoTransactions ? t('history.noMobileTransactionsDescription') : t('history.noFilterResults')}
            </p>
            {hasNoTransactions && (
              <a
                href="/"
                className="mt-5 inline-flex h-12 items-center justify-center rounded-xl bg-[#404F14] px-8 text-sm font-heading font-bold text-white"
              >
                {t('history.browseCourts')}
              </a>
            )}
          </div>
        )}
      </DeferredSection>
    </div>
  )
}

export default MobileTransactionList