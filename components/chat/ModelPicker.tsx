"use client";

import Icon from "@/components/Icon";
import { Sheet } from "@/components/ui";
import { useLanguage } from "@/context/LanguageContext";
import type { ChatModel } from "@/lib/api";
import t from "@/lib/translations";

export default function ModelPicker({
  open,
  onClose,
  models,
  modelId,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  models: ChatModel[];
  modelId: string;
  onSelect: (id: string) => void;
}) {
  const { lang } = useLanguage();
  const tx = t[lang].chat;
  const bn = lang === "bn" ? "font-bn" : "";

  return (
    <Sheet open={open} onClose={onClose} labelledBy="model-picker-title">
      <div className="p-5">
        <div className="mb-1 flex items-center justify-between">
          <h2 id="model-picker-title" className={`font-display text-lg font-semibold ${bn}`}>
            {tx.chooseModel}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-text" aria-label={tx.cancel}>
            <Icon name="x" size={20} />
          </button>
        </div>
        <p className={`mb-4 text-xs leading-relaxed text-muted ${bn}`}>{tx.modelNote}</p>

        <div role="radiogroup" aria-labelledby="model-picker-title" className="space-y-2">
          {models.map((model) => {
            const selected = model.id === modelId;
            return (
              <button
                key={model.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  onSelect(model.id);
                  onClose();
                }}
                className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  selected ? "border-gold/60 bg-card-hi" : "border-border bg-card hover:border-gold/40"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-text">{model.label}</span>
                  <span className={`mt-0.5 block text-xs leading-relaxed text-text-soft ${bn}`}>
                    {lang === "bn" ? model.descriptionBn : model.description}
                  </span>
                </span>
                {/* Selection is marked with an icon, not colour alone. */}
                <span className={`mt-0.5 shrink-0 ${selected ? "text-gold" : "text-transparent"}`}>
                  <Icon name="check" size={17} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}
