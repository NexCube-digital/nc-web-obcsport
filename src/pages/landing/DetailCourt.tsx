import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LandingNavbar from "../../components/layout/LandingNavbar";
import {
  fallbackCourtImage,
  getCourtImages,
  getPublicCourts,
  formatCourtPrice,
  type PublicCourt,
} from "./publicCourt";

export default function DetailCourt() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [court, setCourt] = useState<PublicCourt | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    let active = true;
    getPublicCourts()
      .then((resources) => {
        if (!active) return;
        const found = resources.find((resource) => resource.slug === slug);
        setCourt(found ?? null);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (status === "loading")
    return (
      <PageShell>
        <div className="mx-auto max-w-[1180px] px-4 py-20 text-center text-sm text-[#687269]">
          {t("landing.courtLoading")}
        </div>
      </PageShell>
    );
  if (status === "error" || !court)
    return (
      <PageShell>
        <div className="mx-auto max-w-[1180px] px-4 py-20 text-center">
          <p className="text-lg font-semibold text-[#263626]">
            {status === "error"
              ? t("landing.courtError")
              : t("landing.courtNotFound")}
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-full bg-[#004000] px-5 py-3 text-xs font-bold text-white"
          >
            {t("landing.courtBackHome")}
          </Link>
        </div>
      </PageShell>
    );

  const image = getCourtImages(court)[0] ?? fallbackCourtImage;

  return (
    <PageShell>
      <main className="mx-auto flex max-w-[1180px] flex-col px-4 pb-8 pt-5 sm:px-6 sm:pt-7 lg:h-[calc(100svh-100px)] lg:overflow-hidden lg:pb-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#52634A] transition-colors hover:text-[#004000]"
        >
          <ArrowLeft size={17} />
          {t("landing.courtBack")}
        </button>
        <div className="mt-4 grid min-h-0 flex-1 gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <section>
            <div className="overflow-hidden rounded-3xl bg-[#E8EDE3] shadow-[0_16px_40px_rgba(47,76,39,0.12)]">
              <div className="aspect-[16/10] w-full">
                {image ? (
                  <img
                    src={image}
                    alt={court.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-sm text-[#687269]">
                    {t("home.imageUnavailable")}
                  </div>
                )}
              </div>
            </div>
          </section>
          <section className="lg:max-h-full lg:overflow-hidden">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#62751E]">
              {t("landing.courtDetailsEyebrow")}
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold leading-tight text-[#263626] sm:text-3xl">
              {court.name}
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#687269]">
              {court.description || t("landing.courtNoDescription")}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-[#52634A]">
              <MapPin size={17} className="text-[#617B28]" />
              {court.location
                ? `${court.location.name}, ${court.location.city}`
                : t("landing.courtLocationUnavailable")}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Info
                icon={<Users size={17} />}
                label={t("landing.courtCapacity")}
                value={
                  court.capacity
                    ? `${court.capacity} ${t("landing.courtPeople")}`
                    : "-"
                }
              />
              <Info
                icon={<Clock3 size={17} />}
                label={t("landing.courtSlot")}
                value={`${court.slotMinutes} menit`}
              />
              <Info
                icon={<CalendarDays size={17} />}
                label={t("landing.courtStartingPrice")}
                value={formatCourtPrice(
                  court.fromPrice,
                  court.fromPriceFormatted,
                  t("landing.courtPriceOnBooking"),
                )}
              />
            </div>
            <div className="mt-4 rounded-2xl border border-[#DCE5D8] bg-[#F6F9F1] p-4">
              <h2 className="font-heading text-base font-bold text-[#263626]">
                {t("landing.courtAmenities")}
              </h2>
              {court.amenities.length ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {court.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="flex items-center gap-2 text-xs capitalize text-[#52634A]"
                    >
                      <CheckCircle2 size={15} className="text-[#6C8A2A]" />
                      {amenity.replaceAll("_", " ")}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-[#687269]">
                  {t("landing.courtNoAmenities")}
                </p>
              )}
            </div>
            <Link
              to="/register"
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#CDF178] font-heading text-sm font-bold text-[#34410D] transition-colors hover:bg-[#B5DC52]"
            >
              {t("landing.courtBookNow")}
            </Link>
          </section>
        </div>
      </main>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
		@media (min-width: 1024px) {
			main.mx-auto.flex { max-width: 1240px !important; overflow: visible !important; }
			main.mx-auto.flex > div { gap: 2rem; }
			main.mx-auto.flex > div > section:last-child { overflow: visible !important; }
		}

		@media (min-width: 1024px) and (max-width: 1199px) {
			main.mx-auto.flex { max-width: 940px !important; }
			main.mx-auto.flex > div { grid-template-columns: minmax(0, 1fr) !important; gap: 1.5rem; }
		}

		@media (min-width: 1200px) and (max-width: 1300px) {
			main.mx-auto.flex { max-width: 1160px !important; }
			main.mx-auto.flex > div { gap: 1.5rem; }
		}

		@media (min-width: 1024px) and (max-height: 780px) {
			main.mx-auto.flex { max-width: 1160px !important; padding-top: 0.75rem; padding-bottom: 0.75rem; }
			main.mx-auto.flex > div { gap: 1.25rem; }
		}
	`}</style>
      <div className="min-h-screen bg-[#FDFCF7] font-body text-[#343133]">
        <LandingNavbar />
        {children}
      </div>
    </>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#E1E8DD] bg-white p-3">
      <span className="text-[#617B28]">{icon}</span>
      <p className="mt-2 text-[10px] uppercase tracking-wide text-[#899187]">
        {label}
      </p>
      <p className="mt-1 text-xs font-bold text-[#263626]">{value}</p>
    </div>
  );
}
