"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { Sheet, Spinner } from "@/components/ui";
import { useLanguage } from "@/context/LanguageContext";
import { type Conversation, deleteConversation, listConversations, renameConversation } from "@/lib/api";
import t from "@/lib/translations";

export default function HistoryDrawer({
  open,
  onClose,
  currentId,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  currentId: string | null;
  onDeleted: (id: string) => void;
}) {
  const { lang } = useLanguage();
  const tx = t[lang].chat;
  const bn = lang === "bn" ? "font-bn" : "";

  const [rows, setRows] = useState<Conversation[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setRows(null);
    listConversations()
      .then((page) => !cancelled && setRows(page.conversations))
      .catch(() => !cancelled && setRows([]));
    return () => {
      cancelled = true;
    };
  }, [open]);

  const save = async (id: string) => {
    const title = draft.trim();
    setEditingId(null);
    if (!title) return;
    setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, title } : r)) ?? prev);
    try {
      await renameConversation(id, title);
    } catch {
      /* keep the optimistic title; the next open re-reads the server */
    }
  };

  const remove = async (id: string) => {
    setConfirmId(null);
    setRows((prev) => prev?.filter((r) => r.id !== id) ?? prev);
    try {
      await deleteConversation(id);
      onDeleted(id);
    } catch {
      /* the list refetches on next open */
    }
  };

  return (
    <Sheet open={open} onClose={onClose} labelledBy="chat-history-title">
      <div className="flex max-h-[70vh] flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="chat-history-title" className={`font-display text-lg font-semibold ${bn}`}>
            {tx.history}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-text" aria-label={tx.cancel}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <Link
          href="/chat"
          onClick={onClose}
          className={`mb-3 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-text transition hover:border-gold/50 ${bn}`}
        >
          <Icon name="plus" size={16} />
          {tx.newChat}
        </Link>

        <div className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1">
          {rows === null && (
            <div className="flex justify-center py-8 text-muted">
              <Spinner />
            </div>
          )}

          {rows?.length === 0 && (
            <div className={`py-8 text-center ${bn}`}>
              <p className="text-sm text-text-soft">{tx.noHistory}</p>
              <p className="mt-1 text-xs text-muted">{tx.noHistoryHint}</p>
            </div>
          )}

          <ul className="space-y-1.5">
            {rows?.map((row) => (
              <li key={row.id}>
                {editingId === row.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void save(row.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      aria-label={tx.renamePlaceholder}
                      placeholder={tx.renamePlaceholder}
                      maxLength={200}
                      className={`w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-text outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20 ${bn}`}
                    />
                    <button
                      onClick={() => void save(row.id)}
                      aria-label={tx.save}
                      className="shrink-0 rounded-lg p-1.5 text-gold"
                    >
                      <Icon name="check" size={17} />
                    </button>
                  </div>
                ) : confirmId === row.id ? (
                  <div className={`rounded-xl border border-gold/40 bg-card px-3 py-2.5 ${bn}`}>
                    <p className="text-sm text-text">{tx.deleteTitle}</p>
                    <p className="mt-0.5 text-xs text-muted">{tx.deleteHint}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        autoFocus
                        onClick={() => setConfirmId(null)}
                        className="rounded-lg border border-border px-2.5 py-1 text-xs text-text"
                      >
                        {tx.cancel}
                      </button>
                      <button
                        onClick={() => void remove(row.id)}
                        className="rounded-lg bg-gold px-2.5 py-1 text-xs font-medium text-on-gold"
                      >
                        {tx.delete}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`group flex items-center gap-1 rounded-xl px-1 transition ${
                      row.id === currentId ? "bg-card-hi" : "hover:bg-card"
                    }`}
                  >
                    <Link
                      href={`/chat/${row.id}`}
                      onClick={onClose}
                      className={`min-w-0 flex-1 truncate py-2.5 pl-2 text-sm text-text ${bn}`}
                    >
                      {row.title || tx.untitled}
                    </Link>
                    <button
                      onClick={() => {
                        setDraft(row.title);
                        setEditingId(row.id);
                      }}
                      aria-label={tx.rename}
                      className="shrink-0 rounded-lg p-1.5 text-muted opacity-0 transition hover:text-text focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100"
                    >
                      <Icon name="pencil" size={15} />
                    </button>
                    <button
                      onClick={() => setConfirmId(row.id)}
                      aria-label={tx.delete}
                      className="shrink-0 rounded-lg p-1.5 text-muted opacity-0 transition hover:text-text focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100"
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Sheet>
  );
}
