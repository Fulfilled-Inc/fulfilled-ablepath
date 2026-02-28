import { MOCK_REPORT_DATA } from "@/components/reports/report-types";
import { ReportGenerator } from "@/components/reports/report-generator";

/**
 * /[locale]/dashboard/report/pdf
 *
 * PDF 미리보기 & 다운로드 페이지
 * 현재는 Mock Data로 렌더링, 추후 실제 데이터(daily_logs) 연동 예정
 */
export default function PdfReportPage() {
  // TODO: 실제 구현 시 Server Action으로 당월 MonthlyReportData 를 구성
  const data = MOCK_REPORT_DATA;

  return <ReportGenerator data={data} />;
}
