"use client";

/**
 * AblePath — PDF 미리보기 & 다운로드 클라이언트 컴포넌트
 *
 * @react-pdf/renderer 의 PDFDownloadLink + dynamic import PDFViewer 사용
 * SSR 불가 → 반드시 "use client" + dynamic(ssr:false) 조합
 */

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Download, Eye, ArrowLeft, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import type { PdfReportData } from "./report-data";

// @react-pdf/renderer 컴포넌트는 SSR에서 동작하지 않으므로 dynamic import
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

// PDF Document도 SSR 제외
const AblePathReportDocument = dynamic(
  () =>
    import("./pdf-report-document").then((mod) => {
      const Comp = mod.AblePathReportDocument;
      return { default: Comp };
    }),
  { ssr: false }
);

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────

export function PdfPreviewClient({ data }: { data: PdfReportData }) {
  const t = useTranslations("pdfReport");
  const [showPreview, setShowPreview] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Back link + Header */}
      <div>
        <Link
          href="../report"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToReport")}
        </Link>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
            <Sparkles className="h-3 w-3" />
            {t("premiumBadge")}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Mock Notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          ⚠️ {t("mockNotice")}
        </p>
      </div>

      {/* Child Info + Period Card */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("childInfo")}
          </p>
          <p className="mt-2 text-lg font-bold text-foreground">
            {data.child.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.child.ageLabel} · {data.child.disabilityType}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("period")}
          </p>
          <p className="mt-2 text-lg font-bold text-foreground">
            {data.monthLabel}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.totalMissions} missions · {data.totalDays} days
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Download Button */}
        {mounted ? (
          <PDFDownloadLink
            document={<AblePathReportDocument data={data} />}
            fileName={`AblePath_Report_${data.monthLabel.replace(/\s/g, "_")}.pdf`}
          >
            {({ loading }) => (
              <button
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {loading ? t("downloading") : t("download")}
              </button>
            )}
          </PDFDownloadLink>
        ) : (
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md opacity-50"
          >
            <Download className="h-4 w-4" />
            {t("downloading")}
          </button>
        )}

        {/* Preview Toggle */}
        <button
          onClick={() => setShowPreview((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-accent"
        >
          {showPreview ? (
            <>
              <FileText className="h-4 w-4" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              {t("preview")}
            </>
          )}
        </button>
      </div>

      {/* PDF Viewer (inline preview) */}
      {showPreview && mounted && (
        <div className="overflow-hidden rounded-2xl border border-border shadow-lg">
          <div className="bg-muted/30 px-4 py-2 border-b border-border">
            <p className="text-xs text-muted-foreground">{t("preview")}</p>
          </div>
          <PDFViewer
            style={{
              width: "100%",
              height: "80vh",
              border: "none",
            }}
          >
            <AblePathReportDocument data={data} />
          </PDFViewer>
        </div>
      )}
    </div>
  );
}
