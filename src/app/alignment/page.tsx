"use client";

import React, { useState } from "react";
import { HeartHandshake, CheckCircle2, AlertCircle, Sparkles, MessageCircle, Lock } from "lucide-react";

interface AlignmentTopic {
  id: string;
  category: "FINANCIAL" | "LIVING" | "PARENTS";
  question: string;
  groomAnswer: string;
  brideAnswer: string;
  isAgreed: boolean;
}

const initialTopics: AlignmentTopic[] = [
  {
    id: "top-1",
    category: "LIVING",
    question: "Di mana kita akan tinggal setelah akad nikah?",
    groomAnswer: "Ngontrak rumah mandiri dulu dekat kantor",
    brideAnswer: "Ngontrak rumah mandiri dulu dekat kantor",
    isAgreed: true,
  },
  {
    id: "top-2",
    category: "FINANCIAL",
    question: "Bagaimana sistem pengelolaan rekening gaji rumah tangga?",
    groomAnswer: "Rekening operasional gabung, rekening pribadi tetap ada",
    brideAnswer: "Rekening operasional gabung, rekening pribadi tetap ada",
    isAgreed: true,
  },
  {
    id: "top-3",
    category: "FINANCIAL",
    question: "Apakah ada kewajiban cicilan / utang berjalan saat ini?",
    groomAnswer: "Tidak ada utang pinjol/kartu kredit, ada cicilan motor 6 bln lagi",
    brideAnswer: "Bersih tanpa utang",
    isAgreed: true,
  },
  {
    id: "top-4",
    category: "PARENTS",
    question: "Bagaimana batas campur tangan orang tua/mertua dalam rumah tangga?",
    groomAnswer: "Keputusan rumah tangga 100% hak suami-istri, ortu memberi nasihat",
    brideAnswer: "Keputusan rumah tangga 100% hak suami-istri, privasi dijaga",
    isAgreed: true,
  },
  {
    id: "top-5",
    category: "PARENTS",
    question: "Berapa alokasi uang bulanan untuk orang tua masing-masing?",
    groomAnswer: "Maksimal 10% dari take home pay masing-masing",
    brideAnswer: "Perlu dibicarakan lebih lanjut sesuai kebutuhan berdua",
    isAgreed: false,
  },
];

export default function AlignmentPage() {
  const [topics] = useState<AlignmentTopic[]>(initialTopics);

  const agreedCount = topics.filter((t) => t.isAgreed).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pastel-100 via-sky-50 to-white rounded-3xl p-6 border border-sky-200 shadow-pastel-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-pastel-200 flex items-center justify-center text-pastel-700 shadow-xs">
            <HeartHandshake className="w-6 h-6 text-pastel-700" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Pojok Bicara: Keselarasan Pranikah
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Media komunikasi sehat calon suami & istri membahas finansial, batas mertua, dan tempat tinggal
            </p>
          </div>
        </div>

        <div className="bg-white px-4 py-3 rounded-2xl border border-sky-100 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block mb-1">Tingkat Keselarasan:</span>
          <span className="text-base font-black text-emerald-600">
            {agreedCount} dari {topics.length} Topik Sepakat ({((agreedCount / topics.length) * 100).toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* Topics Cards */}
      <div className="space-y-4">
        {topics.map((t, idx) => (
          <div
            key={t.id}
            className={`bg-white rounded-3xl p-6 border transition-all shadow-pastel-sm ${
              t.isAgreed ? "border-emerald-200" : "border-amber-200 bg-amber-50/20"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-700 bg-pastel-100 px-2 py-0.5 rounded-md">
                Pertanyaan #{idx + 1} • {t.category}
              </span>

              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  t.isAgreed
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {t.isAgreed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sudah Selaras</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Perlu Obrolan Santai</span>
                  </>
                )}
              </span>
            </div>

            <h3 className="font-extrabold text-slate-800 text-base mb-4">{t.question}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100">
                <span className="text-[11px] font-extrabold text-sky-700 uppercase tracking-wider block mb-1">
                  Jawaban Dwiki (Calon Suami):
                </span>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">{t.groomAnswer}</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
                <span className="text-[11px] font-extrabold text-rose-700 uppercase tracking-wider block mb-1">
                  Jawaban Sarah (Calon Istri):
                </span>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">{t.brideAnswer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
