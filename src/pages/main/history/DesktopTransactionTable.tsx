import { useTranslation } from 'react-i18next'
import DeferredSection from '../../../components/layout/DeferredSection'
import { STATUS_BADGE, type Transaction } from '../../../utils/historyData'

type DesktopTransactionTableProps = {
  transactions: Transaction[]
  hasFilteredTransactions: boolean
  onDetail: (transaction: Pick<Transaction, 'id' | 'kind' | 'status' | 'paymentMethod'>) => void
}

function DesktopTransactionTable({ transactions, hasFilteredTransactions, onDetail }: DesktopTransactionTableProps) {
  const { t } = useTranslation()

  return (
    <DeferredSection placeholderClassName="hidden min-h-[320px] md:block">
      <section className="mt-6 hidden min-h-0 overflow-auto rounded-2xl border border-[#D4D4D4] bg-white px-4 pb-6 md:block lg:px-6">
        <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <th className="w-[160px] sticky top-0 z-10 border-b border-[#D4D4D4] bg-white pt-6 pb-4 text-xs font-heading font-bold text-[#343133]">
                {t('history.table.bookingCode')}
              </th>
              <th className="w-[160px] sticky top-0 z-10 border-b border-[#D4D4D4] bg-white pt-6 pb-4 text-xs font-heading font-bold text-[#343133]">
                {t('history.table.date')}
              </th>
              <th className="sticky top-0 z-10 border-b border-[#D4D4D4] bg-white pt-6 pb-4 text-xs font-heading font-bold text-[#343133]">
                {t('history.table.facility')}
              </th>
              <th className="w-[150px] sticky top-0 z-10 border-b border-[#D4D4D4] bg-white pt-6 pb-4 text-xs font-heading font-bold text-[#343133]">
                {t('history.table.total')}
              </th>
              <th className="w-[130px] sticky top-0 z-10 border-b border-[#D4D4D4] bg-white pt-6 pb-4 text-xs font-heading font-bold text-[#343133]">
                {t('history.table.status')}
              </th>
              <th className="w-[90px] sticky top-0 z-10 border-b border-[#D4D4D4] bg-white pt-6 pb-4 text-center text-xs font-heading font-bold text-[#343133]">
                {t('history.table.action')}
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => {
              const badge = STATUS_BADGE[transaction.status]
              return (
                <tr key={transaction.id}>
                  <td className="pt-6 text-sm font-heading font-bold text-[#404F14]">{transaction.code}</td>
                  <td className="pt-6 text-sm text-[#6F6B6E]">{transaction.date}</td>
                  <td className="pt-6 text-sm font-heading font-bold text-[#343133]">{transaction.facility}</td>
                  <td className="pt-6 text-sm font-heading font-bold text-[#343133]">{transaction.total}</td>
                  <td className="pt-6">
                    <span className={`inline-block rounded px-2 py-1 text-[10px] font-heading font-bold leading-none ${badge.className}`}>
                      {t(`history.status.${badge.label}`)}
                    </span>
                  </td>
                  <td className="pt-6 text-center">
                    <button
                      type="button"
                      onClick={() => onDetail(transaction)}
                      className="cursor-pointer text-xs font-heading font-bold text-[#404F14] underline underline-offset-2 hover:text-[#004000]"
                    >
                      {t('history.detail')}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {!hasFilteredTransactions && (
          <p className="pt-6 text-sm text-[#6F6B6E]">{t('history.noFilterResults')}</p>
        )}
      </section>
    </DeferredSection>
  )
}

export default DesktopTransactionTable