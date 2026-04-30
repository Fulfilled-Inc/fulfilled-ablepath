"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { User, Calendar, FileText, Lock, Paperclip, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NewTherapyLogPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChildId = searchParams.get("childId") || "";

  const [loading, setLoading] = useState(false);

  // 폼 상태 관리
  const [formData, setFormData] = useState({
    childId: initialChildId,
    sessionDate: new Date().toISOString().split("T")[0],
    title: "",
    observation: "",
    therapistNote: "",
  });

  // MOCK 데이터: 연결된 아이들 목록 (실제로는 Supabase 연동)
  const connectedChildren = [
    { id: "1", name: "김하윤 (만 4세)" },
    { id: "2", name: "박지우 (만 5세)" },
    { id: "3", name: "최우진 (만 3세)" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Supabase TherapySessionLog 테이블에 INSERT 로직 추가
    console.log("Submitting therapy log:", formData);

    // 가상의 지연 시간 후 대시보드로 이동
    setTimeout(() => {
      setLoading(false);
      alert("일지가 성공적으로 등록되었습니다. (부모님께 알림이 발송됩니다.)");
      router.push("/ko/therapist");
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 상단 네비게이션 및 헤더 */}
      <div className="flex items-center gap-4">
        <Link 
          href="/ko/therapist"
          className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            치료 일지 작성 (안심 리포트)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            작성하신 관찰 기록은 부모님께 투명하게 공유되어 큰 안심을 줍니다.
          </p>
        </div>
      </div>

      {/* 폼 영역 */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm">
        
        {/* 아동 선택 & 날짜 */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="childId" className="flex items-center gap-2 text-sm font-medium text-card-foreground">
              <User className="w-4 h-4 text-primary" />
              대상 아동
            </label>
            <select
              id="childId"
              name="childId"
              required
              value={formData.childId}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="" disabled>아동을 선택해주세요</option>
              {connectedChildren.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="sessionDate" className="flex items-center gap-2 text-sm font-medium text-card-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              세션 날짜
            </label>
            <input
              id="sessionDate"
              name="sessionDate"
              type="date"
              required
              value={formData.sessionDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            />
          </div>
        </div>

        {/* 세션 제목 */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-card-foreground">
            세션 요약 제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="예: 발음 교정 및 언어 촉진 치료 3회차"
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* 관찰 기록 (부모 공개) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="observation" className="flex items-center gap-2 text-sm font-medium text-card-foreground">
              <FileText className="w-4 h-4 text-primary" />
              관찰 기록 <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold">부모님 공개</span>
            </label>
          </div>
          <textarea
            id="observation"
            name="observation"
            required
            rows={5}
            placeholder="오늘 세션에서 진행한 내용과 아이의 반응, 칭찬할 점 등을 보호자가 안심할 수 있도록 자세히 적어주세요."
            value={formData.observation}
            onChange={handleChange}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"
          />
        </div>

        {/* 첨부 파일 (사진/영상) */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-card-foreground">
            <Paperclip className="w-4 h-4 text-muted-foreground" />
            사진/영상 첨부 (선택)
          </label>
          <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-background/50 hover:bg-background transition-colors cursor-pointer">
            <Paperclip className="w-6 h-6 text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-foreground">클릭하여 파일 선택 또는 드래그 앤 드롭</p>
            <p className="text-xs text-muted-foreground mt-1">오늘 활동한 아이의 모습을 1~2장 공유해주시면 부모님께 큰 힘이 됩니다. (PDF, JPG, MP4 등)</p>
          </div>
        </div>

        {/* 전문가 개인 메모 (비공개) */}
        <div className="space-y-2 pt-4 border-t border-border">
          <label htmlFor="therapistNote" className="flex items-center gap-2 text-sm font-medium text-card-foreground">
            <Lock className="w-4 h-4 text-muted-foreground" />
            전문가 메모 <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full font-semibold">나만 보기 (비공개)</span>
          </label>
          <textarea
            id="therapistNote"
            name="therapistNote"
            rows={3}
            placeholder="부모님께 공유되지 않습니다. 다음 세션을 위한 치료사 개인적인 참고 사항이나 주의점을 메모하세요."
            value={formData.therapistNote}
            onChange={handleChange}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y placeholder:text-muted-foreground/70"
          />
        </div>

        {/* 제출 버튼 */}
        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "px-5 py-2.5 rounded-xl bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 transition-all",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            {loading ? "저장 중..." : "일지 등록 및 부모님께 전송"}
          </button>
        </div>
      </form>
    </div>
  );
}