"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Child } from "@/types";

type Props = {
  children: Child[];
  parentId: string;
};

const disabilityTypes = [
  { value: "autism", label: "Autism Spectrum" },
  { value: "speech_delay", label: "Speech Delay" },
  { value: "intellectual", label: "Intellectual Disability" },
  { value: "sensory", label: "Sensory Processing" },
  { value: "adhd", label: "ADHD" },
  { value: "other", label: "Other" },
];

export function ChildrenManager({ children: initialChildren, parentId }: Props) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>(initialChildren);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 새 아이 폼 상태
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [disabilityType, setDisabilityType] = useState("");
  const [disabilityDetail, setDisabilityDetail] = useState("");

  async function handleAdd() {
    if (!name.trim() || loading) return;
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("children")
      .insert({
        parent_id: parentId,
        name: name.trim(),
        birth_date: birthDate || null,
        disability_type: disabilityType || null,
        disability_detail: disabilityDetail || null,
      })
      .select()
      .single();

    if (!error && data) {
      setChildren([...children, data as Child]);
      resetForm();
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete(childId: string) {
    if (deletingId) return;
    setDeletingId(childId);

    const supabase = createClient();
    const { error } = await supabase
      .from("children")
      .delete()
      .eq("id", childId);

    if (!error) {
      setChildren(children.filter((c) => c.id !== childId));
      router.refresh();
    }
    setDeletingId(null);
  }

  function resetForm() {
    setName("");
    setBirthDate("");
    setDisabilityType("");
    setDisabilityDetail("");
    setShowForm(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("children")}</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t("addChild")}
          </button>
        )}
      </div>

      {/* 등록된 아이 목록 */}
      {children.length === 0 && !showForm ? (
        <div className="rounded-xl bg-muted p-6 text-center">
          <p className="text-3xl mb-2">👶</p>
          <p className="text-sm text-muted-foreground">
            No children added yet. Click &quot;{t("addChild")}&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {children.map((child) => (
            <div
              key={child.id}
              className="flex items-center justify-between rounded-xl border border-border bg-background p-4"
            >
              <div>
                <p className="font-medium text-foreground">{child.name}</p>
                <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                  {child.birth_date && (
                    <span>
                      Born:{" "}
                      {new Date(child.birth_date).toLocaleDateString("en", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  {child.disability_type && (
                    <span className="rounded-full bg-muted px-2 py-0.5">
                      {
                        disabilityTypes.find(
                          (d) => d.value === child.disability_type
                        )?.label ?? child.disability_type
                      }
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(child.id)}
                disabled={deletingId === child.id}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-destructive disabled:opacity-50"
              >
                {deletingId === child.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 추가 폼 */}
      {showForm && (
        <div className="mt-4 space-y-4 rounded-xl border border-primary/20 bg-secondary p-5">
          <h3 className="font-medium text-foreground">{t("addChild")}</h3>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("childName")} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Child's name"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("birthDate")}
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {t("disabilityType")}
            </label>
            <select
              value={disabilityType}
              onChange={(e) => setDisabilityType(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select...</option>
              {disabilityTypes.map((dt) => (
                <option key={dt.value} value={dt.value}>
                  {dt.label}
                </option>
              ))}
            </select>
          </div>

          {disabilityType && (
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Additional Details
              </label>
              <textarea
                value={disabilityDetail}
                onChange={(e) => setDisabilityDetail(e.target.value)}
                rows={2}
                placeholder="Any specific details..."
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              disabled={!name.trim() || loading}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {tCommon("save")}
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              {tCommon("cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
