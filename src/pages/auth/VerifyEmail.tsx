import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import logo from "../../assets/logo/unit bisnis/sport.webp";
import { getApiErrorMessage } from "../../services/apiService";
import {
  resendCustomerVerification,
  verifyCustomerEmail,
} from "../../services/authService";

function VerifyEmail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error",
  );
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    verifyCustomerEmail(token)
      .then((result) => {
        if (!active) return;
        setStatus("success");
        toast.success(result.message || t("verifyEmail.success"));
        window.setTimeout(() => navigate("/home", { replace: true }), 1200);
      })
      .catch((error) => {
        if (!active) return;
        setStatus("error");
        toast.error(getApiErrorMessage(error, t("verifyEmail.failed")));
      });
    return () => {
      active = false;
    };
  }, [navigate, t, token]);

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error(t("verifyEmail.emailRequired"));
      return;
    }
    setIsResending(true);
    try {
      const result = await resendCustomerVerification(email.trim());
      toast.success(result.message || t("verifyEmail.resent"));
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("verifyEmail.resendFailed")));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFCF7] px-6 py-10 font-body text-[#343133]">
      <div className="w-full max-w-md rounded-2xl border border-[#D4D4D4] bg-white p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <img
          src={logo}
          alt="OBC Sport Center"
          className="mx-auto h-20 w-20 rounded-full object-contain"
        />
        {status === "loading" && (
          <LoaderCircle
            className="mx-auto mt-6 animate-spin text-[#404F14]"
            size={36}
          />
        )}
        {status === "success" && (
          <CheckCircle2 className="mx-auto mt-6 text-[#56823B]" size={44} />
        )}
        {status === "error" && (
          <Mail className="mx-auto mt-6 text-[#404F14]" size={44} />
        )}
        <h1 className="mt-5 font-heading text-2xl font-bold text-[#404F14]">
          {t("verifyEmail.title")}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#6F6B6E]">
          {status === "loading"
            ? t("verifyEmail.verifying")
            : status === "success"
              ? t("verifyEmail.redirecting")
              : t("verifyEmail.description")}
        </p>
        {status !== "loading" && status !== "success" && (
          <div className="mt-6 space-y-3 text-left">
            <label
              htmlFor="verification-email"
              className="block text-sm font-bold text-[#343133]"
            >
              {t("verifyEmail.email")}
            </label>
            <div className="relative">
              <input
                id="verification-email"
                type="email"
                value={email}
                readOnly
                placeholder="nama@email.com"
                className="w-full cursor-default rounded-lg border border-[#D4D4D4] bg-[#F4F4EF] px-3 py-3 pr-10 text-sm text-[#6F6B6E] focus:outline-none"
              />
              <LockKeyhole
                aria-hidden="true"
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6B6E]"
              />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-[#6F6B6E]">
              {t("verifyEmail.emailReadOnly")}
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#CDF178] px-4 py-3 text-sm font-bold text-[#404F14] transition-colors hover:bg-[#9AAD3E] disabled:opacity-50"
            >
              <RefreshCw size={17} />
              {isResending
                ? t("verifyEmail.resending")
                : t("verifyEmail.resend")}
            </button>
          </div>
        )}
        <Link
          to="/login"
          className="mt-6 inline-block text-sm font-bold text-[#404F14] underline underline-offset-2"
        >
          {t("verifyEmail.backToLogin")}
        </Link>
      </div>
    </div>
  );
}

export default VerifyEmail;
