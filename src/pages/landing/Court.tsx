import { useEffect, useState } from "react";
import { ArrowRight, MapPin, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fallbackCourtImage,
  getCourtImages,
  getPublicCourts,
  formatCourtPrice,
  type PublicCourt,
} from "./publicCourt";

function CourtImage({ court }: { court: PublicCourt }) {
  const image = getCourtImages(court)[0];

  return (
    <img
      src={image || fallbackCourtImage}
      alt={court.name}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      onError={(event) => {
        event.currentTarget.src = fallbackCourtImage;
      }}
      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
    />
  );
}

export default function Court() {
  const { t } = useTranslation();
  const [courts, setCourts] = useState<PublicCourt[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const loadCourts = () => {
    setStatus("loading");
    getPublicCourts()
      .then((resources) => {
        setCourts(resources);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => {
    let active = true;
    getPublicCourts()
      .then((resources) => {
        if (!active) return;
        setCourts(resources);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      className="relative overflow-hidden border-y border-[#DDE5D5] bg-[#F3F6EE] px-3 py-10 sm:px-6 sm:py-18 lg:py-22"
    >
      <div
        className="pointer-events-none absolute -right-24 top-8 h-64 w-64 rounded-full border-[28px] border-[#DCECC1]/70"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1200px]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-5">
          <div className="max-w-2xl">
            <p className="font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-[#62751E]">
              {t("landing.courtEyebrow")}
            </p>
            <h2 className="mt-2 max-w-[300px] font-heading text-2xl font-bold leading-[1.18] text-[#243523] sm:max-w-none sm:text-3xl lg:text-4xl">
              {t("landing.courtTitle")}
            </h2>
            <p className="mt-3 max-w-xl text-[13px] leading-6 text-[#59635A] sm:text-base sm:leading-7">
              {t("landing.courtDescription")}
            </p>
          </div>
        </div>

        {status === "loading" && (
          <div
            role="status"
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div className="h-80 animate-pulse rounded-2xl bg-white/70" />
            <div className="hidden h-80 animate-pulse rounded-2xl bg-white/70 sm:block" />
            <div className="hidden h-80 animate-pulse rounded-2xl bg-white/70 lg:block" />
          </div>
        )}
        {status === "error" && (
          <div className="mt-8 rounded-2xl border border-[#D8E1D2] bg-white px-6 py-10 text-center">
            <p className="text-sm text-[#59635A]">{t("landing.courtError")}</p>
            <button
              type="button"
              onClick={loadCourts}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#CDF178] px-5 py-2.5 text-xs font-bold text-[#34410D] transition-colors hover:bg-[#B5DC52]"
            >
              <RefreshCw size={14} />
              {t("landing.courtRetry")}
            </button>
          </div>
        )}
        {status === "ready" && courts.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[#D8E1D2] bg-white px-6 py-10 text-center text-sm text-[#59635A]">
            {t("landing.courtEmpty")}
          </div>
        )}
        {status === "ready" && courts.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-2.5 max-[359px]:grid-cols-1 sm:mt-8 sm:gap-5 lg:grid-cols-3">
            {courts.map((court) => (
              <article
                key={court.id}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#DCE5D8] bg-white shadow-[0_8px_24px_rgba(47,76,39,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(47,76,39,0.14)] sm:rounded-2xl"
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-[#E8EDE3] sm:aspect-[16/10]">
                  <CourtImage court={court} />
                  <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-white/92 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-[#405315] sm:left-4 sm:top-4 sm:max-w-none sm:px-3 sm:py-1.5 sm:text-[10px]">
                    {t("landing.courtAvailable")}
                  </span>
                </div>
                <div className="flex min-h-0 flex-1 flex-col p-2.5 sm:min-h-[218px] sm:p-5">
                  <h3 className="line-clamp-1 font-heading text-[12px] font-bold leading-5 text-[#263626] sm:line-clamp-2 sm:min-h-0 sm:text-lg">
                    {court.name}
                  </h3>
                  <div className="mt-1 flex h-4 items-center gap-1 overflow-hidden text-[8px] leading-4 text-[#687269] sm:h-auto sm:mt-2 sm:gap-1.5 sm:text-xs sm:leading-5">
                    <MapPin size={11} className="mt-px shrink-0 text-[#617B28] sm:size-[14px]" />
                    <span className="truncate">
                      {court.location
                        ? `${court.location.name}, ${court.location.city}`
                        : t("landing.courtLocationUnavailable")}
                    </span>
                  </div>
                  <div className="mt-1.5 hidden sm:flex sm:h-auto sm:mt-4 sm:flex-wrap sm:gap-1.5">
                    {court.sportTypes.slice(0, 3).map((sport) => (
                      <span
                        key={sport}
                        className="max-w-full truncate rounded-md bg-[#F0F5E9] px-1.5 py-0.5 text-[8px] font-semibold capitalize text-[#52681A] sm:px-2.5 sm:py-1 sm:text-[10px]"
                      >
                        {sport.replaceAll("_", " ")}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-col items-stretch gap-1 pt-1.5 sm:flex-row sm:items-end sm:justify-between sm:gap-3 sm:pt-5">
                    <div>
                      <p className="text-[8px] uppercase leading-3 tracking-wide text-[#899187] sm:text-[10px] sm:leading-normal">
                        {t("landing.courtStartingPrice")}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[9px] font-bold leading-4 text-[#263626] sm:mt-1 sm:line-clamp-2 sm:text-sm sm:leading-normal">
                        {formatCourtPrice(
                          court.fromPrice,
                          court.fromPriceFormatted,
                          t("landing.courtPriceOnBooking"),
                        )}
                      </p>
                    </div>
                    <Link
                      to={`/lapangan/${encodeURIComponent(court.slug)}`}
                      className="inline-flex h-8 w-full shrink-0 items-center justify-center gap-1 rounded-full bg-[#004000] px-2 text-[9px] font-bold text-white transition-colors hover:bg-[#1A5B28] sm:h-auto sm:w-auto sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-xs"
                    >
                      {t("landing.courtDetails")}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
