"use client";

import React, { useState } from "react";
import { HeartHandshake, CheckCircle2, AlertCircle, Sparkles, MessageCircle, Plus, Edit2, Check } from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { AlignmentTopic } from "@/types";

export default function AlignmentPage() {
  const {
    alignmentTopics,
    updateAlignmentAnswer,
    toggleAlignmentAgreed,
    addAlignmentTopic,
    wedding,
    requireAuth,
  } = useWedding();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

  // Answering state
  const [activeAnswerRole, setActiveAnswerRole] = useState<"GROOM" | "BRIDE">("GROOM");
  const [answerInput, setAnswerInput] = useState("");

  // New topic state
  const [newQuestion, setNewQuestion] = useState("");
  const [newCategory, setNewCategory] = useState<AlignmentTopic["category"]>("FINANCIAL");

  const groomNameShort = wedding.groomName ? wedding.groomName.split(" ")[0] : "Pria";
  const brideNameShort = wedding.brideName ? wedding.brideName.split(" ")[0] : "Wanita";

  const agreedCount = alignmentTopics.filter((t) => t.isAgreed).length;
  const agreementPercent =
    alignmentTopics.length > 0 ? Math.round((agreedCount / alignmentTopics.length) * 100) : 0;

  const handleOpenAnswer = (topicId: string, role: "GROOM" | "BRIDE", currentVal: string) => {
    if (!requireAuth()) return;
    setEditingTopicId(topicId);
    setActiveAnswerRole(role);
    setAnswerInput(currentVal);
  };

  const handleToggleAgreed = (topicId: string) => {
    if (!requireAuth()) return;
    toggleAlignmentAgreed(topicId);
  };

  const handleOpenAddTopic = () => {
    if (!requireAuth()) return;
    setIsAddModalOpen(true);
  };

  const handleSaveAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!editingTopicId) return;

    updateAlignmentAnswer(editingTopicId, activeAnswerRole, answerInput);
    setEditingTopicId(null);
    setAnswerInput("");
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!newQuestion.trim()) return;

    addAlignmentTopic(newQuestion, newCategory);
    setIsAddModalOpen(false);
    setNewQuestion("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div id="tour-alignment-summary" className="bg-gradient-to-r from-amber-50/50 via-white to-rose-50/50 rounded-3xl p-6 border border-slate-200/90 shadow-subtle-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
            <HeartHandshake className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
              Pojok Bicara: Keselarasan Pranikah
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Media komunikasi calon suami &amp; istri membahas finansial, batas mertua, dan tempat tinggal
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-bold block mb-0.5">Tingkat Keselarasan:</span>
            <span className="text-sm font-black font-mono text-emerald-700">
              {agreedCount} dari {alignmentTopics.length} Topik Sepakat ({agreementPercent}%)
            </span>
          </div>

          <button
            id="tour-alignment-add"
            type="button"
            onClick={handleOpenAddTopic}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Topik</span>
          </button>
        </div>
      </div>

      {/* Answer Modal */}
      {editingTopicId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base font-serif">
              Tulis Jawaban {activeAnswerRole === "GROOM" ? `Calon Suami (${groomNameShort})` : `Calon Istri (${brideNameShort})`}
            </h3>
            <form onSubmit={handleSaveAnswer} className="space-y-3">
              <textarea
                rows={3}
                required
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Tulis pandangan atau prinsip Anda mengenai pertanyaan ini..."
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pastel-300 resize-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTopicId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-pastel-600 hover:bg-pastel-700 text-white shadow-xs"
                >
                  Simpan Jawaban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Topics Cards */}
      <div id="tour-alignment-cards" className="space-y-4">
        {alignmentTopics.map((t, idx) => (
          <div
            key={t.id}
            className={`bg-white rounded-3xl p-6 border transition-all shadow-subtle-sm space-y-4 ${
              t.isAgreed ? "border-emerald-200" : "border-slate-200/90"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  Topik #{idx + 1} • {t.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    t.isAgreed
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}
                >
                  {t.isAgreed ? "Telah Disepakati" : "Perlu Dibicarakan"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleAgreed(t.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                  t.isAgreed
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t.isAgreed ? "Ubah Jadi Belum Sepakat" : "Tandai Sepakat"}</span>
              </button>
            </div>

            <h3 className="font-extrabold text-slate-900 text-base font-serif">
              {t.question}
            </h3>

            {/* Side-by-Side Answers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Groom's Perspective */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Jawaban Calon Suami ({groomNameShort})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenAnswer(t.id, "GROOM", t.groomAnswer)}
                    className="p-1 text-slate-400 hover:text-pastel-600"
                    title="Ubah Jawaban"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {t.groomAnswer || (
                    <span className="text-slate-400 italic">Belum mengisi jawaban. Klik ikon pensil untuk mengisi.</span>
                  )}
                </p>
              </div>

              {/* Bride's Perspective */}
              <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                    Jawaban Calon Istri ({brideNameShort})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenAnswer(t.id, "BRIDE", t.brideAnswer)}
                    className="p-1 text-rose-400 hover:text-rose-700"
                    title="Ubah Jawaban"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {t.brideAnswer || (
                    <span className="text-slate-400 italic">Belum mengisi jawaban. Klik ikon pensil untuk mengisi.</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Topic Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-900 text-base font-serif">
              Tambah Topik Diskusi Pranikah
            </h3>

            <form onSubmit={handleCreateTopic} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pastel-300"
                >
                  <option value="FINANCIAL">Finansial &amp; Pengelolaan Uang</option>
                  <option value="LIVING">Tempat Tinggal &amp; Domisili</option>
                  <option value="PARENTS">Batas Orang Tua &amp; Mertua</option>
                  <option value="CAREER">Karir &amp; Peran Rumah Tangga</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pertanyaan Diskusi *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Bagaimana rencana kita jika salah satu kehilangan pekerjaan?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pastel-300 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-pastel-600 hover:bg-pastel-700 text-white shadow-xs"
                >
                  Simpan Topik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
