"use client";

import React, { useState } from "react";
import { HeartHandshake, CheckCircle2, AlertCircle, Sparkles, MessageCircle, Plus, Edit2, Check, Trash2, BookOpen } from "lucide-react";
import { useWedding } from "@/context/wedding-context";
import { AlignmentTopic } from "@/types";
import { showToastSuccess, showToastInfo, showConfirmDialog } from "@/lib/swal";

export default function AlignmentPage() {
  const {
    alignmentTopics,
    updateAlignmentAnswer,
    toggleAlignmentAgreed,
    addAlignmentTopic,
    editAlignmentTopic,
    deleteAlignmentTopic,
    loadRecommendedAlignmentTopics,
    wedding,
    requireAuth,
  } = useWedding();

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<AlignmentTopic | null>(null);
  const [answeringTopicId, setAnsweringTopicId] = useState<string | null>(null);

  // Answering state
  const [activeAnswerRole, setActiveAnswerRole] = useState<"GROOM" | "BRIDE">("GROOM");
  const [answerInput, setAnswerInput] = useState("");

  // Topic form state
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState<AlignmentTopic["category"]>("FINANCIAL");

  const groomNameShort = wedding.groomName ? wedding.groomName.split(" ")[0] : "Pria";
  const brideNameShort = wedding.brideName ? wedding.brideName.split(" ")[0] : "Wanita";

  const agreedCount = alignmentTopics.filter((t) => t.isAgreed).length;
  const agreementPercent =
    alignmentTopics.length > 0 ? Math.round((agreedCount / alignmentTopics.length) * 100) : 0;

  const handleOpenAnswer = (topicId: string, role: "GROOM" | "BRIDE", currentVal: string) => {
    if (!requireAuth()) return;
    setAnsweringTopicId(topicId);
    setActiveAnswerRole(role);
    setAnswerInput(currentVal);
  };

  const handleToggleAgreed = (topic: AlignmentTopic) => {
    if (!requireAuth()) return;
    toggleAlignmentAgreed(topic.id);
    const willBeAgreed = !topic.isAgreed;
    if (willBeAgreed) {
      showToastSuccess("Topik disepakati bersama pasangan! 🤝");
    } else {
      showToastInfo("Status kesepakatan topik dibatalkan");
    }
  };

  const handleOpenAddTopic = () => {
    if (!requireAuth()) return;
    setEditingTopic(null);
    setQuestion("");
    setCategory("FINANCIAL");
    setIsTopicModalOpen(true);
  };

  const handleOpenEditTopic = (t: AlignmentTopic) => {
    if (!requireAuth()) return;
    setEditingTopic(t);
    setQuestion(t.question);
    setCategory(t.category);
    setIsTopicModalOpen(true);
  };

  const handleDeleteTopic = async (topic: AlignmentTopic) => {
    if (!requireAuth()) return;
    const isConfirmed = await showConfirmDialog({
      title: "Hapus Topik Pranikah?",
      text: `Apakah Anda yakin ingin menghapus topik diskusi "${topic.question}"?`,
      confirmButtonText: "Ya, Hapus",
      isDestructive: true,
    });
    if (!isConfirmed) return;
    deleteAlignmentTopic(topic.id);
    showToastSuccess("Topik pranikah berhasil dihapus");
  };

  const handleLoadRecommended = async () => {
    if (!requireAuth()) return;
    const isConfirmed = await showConfirmDialog({
      title: "Muat Rekomendasi Topik?",
      text: "5 topik penting seputar tempat tinggal, sistem keuangan, batasan keluarga/mertua, dan karir akan dimuat ke pojok bicara.",
      confirmButtonText: "Ya, Muat",
      icon: "question",
      isDestructive: false,
    });
    if (!isConfirmed) return;
    loadRecommendedAlignmentTopics();
    showToastSuccess("Rekomendasi topik pranikah berhasil dimuat! 💡");
  };

  const handleSaveAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!answeringTopicId) return;

    updateAlignmentAnswer(answeringTopicId, activeAnswerRole, answerInput);
    showToastSuccess("Jawaban Anda berhasil disimpan! 💬");
    setAnsweringTopicId(null);
    setAnswerInput("");
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!question.trim()) return;

    if (editingTopic) {
      editAlignmentTopic(editingTopic.id, question, category);
      showToastSuccess("Topik diskusi berhasil diperbarui! 📝");
    } else {
      addAlignmentTopic(question, category);
      showToastSuccess("Topik diskusi baru berhasil ditambahkan! 💡");
    }
    setIsTopicModalOpen(false);
    setEditingTopic(null);
    setQuestion("");
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
      {answeringTopicId && (
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
                  onClick={() => setAnsweringTopicId(null)}
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
        {alignmentTopics.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-subtle-sm space-y-4">
            <HeartHandshake className="w-12 h-12 text-rose-300 mx-auto" />
            <div>
              <h3 className="font-bold text-slate-800 text-base">Belum Ada Topik Diskusi Pranikah</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                Mulai obrolan penting seputar finansial bersama, tempat tinggal, batasan keluarga/mertua, dan peran rumah tangga sebelum melangkah ke jenjang pernikahan.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleOpenAddTopic}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pastel-600 hover:bg-pastel-700 text-white font-bold text-xs shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Topik Pertama</span>
              </button>
              <button
                type="button"
                onClick={handleLoadRecommended}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs shadow-xs"
              >
                <BookOpen className="w-4 h-4" />
                <span>Muat Rekomendasi Topik Standar</span>
              </button>
            </div>
          </div>
        ) : (
          alignmentTopics.map((t, idx) => (
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

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleAgreed(t)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                      t.isAgreed
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.isAgreed ? "Ubah Jadi Belum Sepakat" : "Tandai Sepakat"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditTopic(t)}
                    className="p-1.5 text-slate-400 hover:text-pastel-600 rounded-lg transition-colors"
                    title="Edit Pertanyaan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTopic(t)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                    title="Hapus Topik"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
          ))
        )}
      </div>

      {/* Add / Edit Topic Modal */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base font-serif">
                {editingTopic ? "Edit Topik Diskusi Pranikah" : "Tambah Topik Diskusi Pranikah"}
              </h3>
              <button
                type="button"
                onClick={() => setIsTopicModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
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
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pastel-300 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-pastel-600 hover:bg-pastel-700 text-white shadow-xs"
                >
                  {editingTopic ? "Simpan Perubahan" : "Simpan Topik"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
