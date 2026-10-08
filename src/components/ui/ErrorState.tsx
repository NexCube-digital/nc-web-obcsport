import type { ReactNode } from "react";
import busyIllustration from "../../assets/errors/Busy.svg";
import emptyIllustration from "../../assets/errors/Empty.svg";
import mailIllustration from "../../assets/errors/Mail.svg";
import maintenanceIllustration from "../../assets/errors/Maintenance.svg";
import missingIllustration from "../../assets/errors/Missing.svg";
import noInternetIllustration from "../../assets/errors/NoInternet.svg";
import notFoundIllustration from "../../assets/errors/Not Found.svg";
import permissionIllustration from "../../assets/errors/Permission.svg";
import restrictIllustration from "../../assets/errors/Restrict.svg";
import systemErrorIllustration from "../../assets/errors/SystemError.svg";

/* ---------------------------------------------------------------
 * Base: StatePage (card 544x540)
 * --------------------------------------------------------------- */
export interface StatePageProps {
  title: string;
  description: string;
  buttonLabel: string;
  onAction?: () => void;
  /** Ilustrasi opsional untuk menggantikan ilustrasi bawaan. */
  illustration?: ReactNode;
}

function StateIllustration({ src }: { src: string }) {
  return <img src={src} alt="" className="h-[180px] w-[180px] object-contain" />;
}

function RestrictionIllustration() {
  return (
    <div className="flex items-center justify-center gap-2">
      <StateIllustration src={permissionIllustration} />
      <StateIllustration src={restrictIllustration} />
    </div>
  );
}

export function StatePage({
  title,
  description,
  buttonLabel,
  onAction,
  illustration,
}: StatePageProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white p-4 font-['Montserrat']">
      <section
        className="flex h-[540px] w-[544px] max-w-full flex-col items-center justify-center gap-6 rounded-[48px] bg-[var(--White,#FFFFFF)] px-8 py-12 shadow-[0px_16px_64px_0px_#0000000D]"
      >
        {/* Ilustrasi */}
        <div className="flex h-[220px] w-full items-center justify-center">
          {illustration ?? (
            <div className="flex h-full w-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-300 text-xs text-slate-400">
              Illustration
            </div>
          )}
        </div>

        {/* Judul + deskripsi */}
        <div className="flex w-full max-w-[480px] flex-col items-center gap-2">
          <h1 className="text-center text-2xl font-semibold capitalize leading-8 tracking-[-0.0075em] text-[var(--Text-Primary,#0F172A)]">
            {title}
          </h1>
          <p className="text-center text-sm font-normal leading-[22px] tracking-normal text-[var(--Text-Secondary,#7B899D)]">
            {description}
          </p>
        </div>

        {/* Button */}
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-10 w-[151px] items-center justify-center gap-2 rounded-md bg-[#004000] px-4 py-2.5 text-sm font-bold leading-5 tracking-normal text-[var(--White,#FFFFFF)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004000] focus-visible:ring-offset-2"
        >
          {buttonLabel}
        </button>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------
 * Pages
 * Semua halaman menerima: onAction?, illustration?
 * --------------------------------------------------------------- */
type PageProps = Pick<StatePageProps, "onAction" | "illustration">;

export const NoMessagePage = (p: PageProps) => (
  <StatePage
    {...p}
    illustration={p.illustration ?? <StateIllustration src={mailIllustration} />}
    title="No Messages Yet!"
    description="Looks like there’s nothing here yet. Why not start a conversation or check back later for new messages?"
    buttonLabel="Send a Message"
  />
);

export const NoInternetPage = (p: PageProps) => (
  <StatePage
    {...p}
    illustration={p.illustration ?? <StateIllustration src={noInternetIllustration} />}
    title="Oops! You're Offline"
    description="It looks like you’re not connected to the internet. Check your Wi-Fi or mobile data and try again once you’re back online."
    buttonLabel="Retry Connection"
  />
);

export const FailedToLoadPage = (p: PageProps) => (
  <StatePage
    {...p}
    illustration={p.illustration ?? <StateIllustration src={systemErrorIllustration} />}
    title="Something Went Wrong"
    description="There was a system error while loading the page. Please try again later or contact support if the issue persists."
    buttonLabel="Try Again"
  />
);

export const UnderMaintenancePage = (p: PageProps) => (
  <StatePage
    {...p}
    illustration={p.illustration ?? <StateIllustration src={maintenanceIllustration} />}
    title="We’ll Be Right Back!"
    description="We're making some updates to keep things running smoothly. Check back soon!"
    buttonLabel="Refresh"
  />
);

export const UserRestrictionPage = (p: PageProps) => (
  <StatePage
    {...p}
    illustration={p.illustration ?? <RestrictionIllustration />}
    title="Oops! You Can’t Access This"
    description="Looks like you don’t have permission to view this. Double-check your access or reach out for help."
    buttonLabel="Go Back"
  />
);

export const PageNotFoundPage = (p: PageProps) => (
  <StatePage
    {...p}
    illustration={p.illustration ?? <StateIllustration src={notFoundIllustration} />}
    title="Oops! This Page Is Missing"
    description="Looks like this page doesn’t exist or got moved. Try checking the URL or head back home."
    buttonLabel="Go Back"
  />
);

export const TooManyRequestPage = (p: PageProps) => (
  <StatePage
    {...p}
    illustration={p.illustration ?? <StateIllustration src={busyIllustration} />}
    title="Hang Tight! We're A Bit Busy"
    description="Looks like our servers are handling a lot right now. Give it a moment and try again."
    buttonLabel="Try Again"
  />
);

export const NoSearchResultPage = (p: PageProps) => (
  <StatePage
    {...p}
    illustration={p.illustration ?? <StateIllustration src={missingIllustration} />}
    title="Hmm… Nothing Here!"
    description="We couldn’t find any matches. Try a different keyword or check your spelling."
    buttonLabel="Search Again"
  />
);

export const EmptyStatePage = (p: PageProps) => (
  <StatePage
    {...p}
    illustration={p.illustration ?? <StateIllustration src={emptyIllustration} />}
    title="Nothing Here Yet!"
    description="Looks like there’s no content here right now. Check back later or try something else."
    buttonLabel="Refresh"
  />
);

/* ---------------------------------------------------------------
 * Contoh routing (react-router-dom) — opsional
 * ---------------------------------------------------------------
 *
 * import { useNavigate } from "react-router-dom";
 *
 * export function NotFoundRoute() {
 *   const navigate = useNavigate();
 *   return <PageNotFoundPage onAction={() => navigate(-1)} />;
 * }
 *
 * <Route path="*" element={<NotFoundRoute />} />
 *
 * Maintenance / Failed / Too many request:
 *   <UnderMaintenancePage onAction={() => window.location.reload()} />
 *
 * Tambah ilustrasi nanti:
 *   <NoMessagePage illustration={<img src={img} alt="" className="h-full" />} />
 */