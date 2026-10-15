"use client";

import React, { useState } from "react";
import { Star, Quote, Heart, MapPin, Calendar, CheckCircle2, Sparkles } from "lucide-react";
import { CuteAvatarBadge } from "@/components/profile/cute-card-badge";

interface Testimonial {
  id: string;
  coupleNames: string;
  groomName: string;
  brideName: string;
  groomAvatar: string;
  brideAvatar: string;
  city: string;
  weddingDate: string;
  weddingVenue: string;
  keyFeature: string;
  featureBadgeColor: string;
  storyTitle: string;
  challenge: string;
  solution: string;
  quote: string;
  stats: string;
}

const testimonialsData: Testimonial[] = [
  {
    id: "testi-1",
    coupleNames: "Rian & Nadia",
    groomName: "Rian",
    brideName: "Nadia",
    groomAvatar: "cat-prince",
    brideAvatar: "cat-princess",
    city: "Bandung, Jawa Barat",
    weddingDate: "Juni 2025",
    weddingVenue: "Grand Ballroom Al-Jabbar",
    keyFeature: "Kalkulator Kuota 4 Pihak",
    featureBadgeColor: "bg-pastel-50 text-pastel-700 border-pastel-200",
    storyTitle: "Solusi Paling Adil Menengahi Kuota Keluarga Besar",
    challenge:
      "Awalnya kedua orang tua kami sempat bersitegang soal jatah undangan. Papa mau undang 600 orang teman kantor, sementara pihak wanita punya daftar keluarga besar yang juga panjang.",
    solution:
      "Dengan kalkulator Kuota 4 Pihak di HajatKita, kami tampilkan kapasitas gedung dan simulasi biaya per pax langsung di depan kedua keluarga. Begitu angka terlihat transparan, semua pihak langsung legawa dan sepakat tanpa ada rasa cemburu.",
    quote:
      "“Bukan cuma aplikasi planner biasa, HajatKita adalah penengah diplomatik keluarga kami. Suasana musyawarah nikah jadi adem dan saling menghargai.”",
    stats: "500 Undangan Sesuai Kuota • 0 Drama Keluarga",
  },
  {
    id: "testi-2",
    coupleNames: "Dimas & Annisa",
    groomName: "Dimas",
    brideName: "Annisa",
    groomAvatar: "penguin-groom",
    brideAvatar: "duck-bride",
    city: "Jakarta Selatan, DKI Jakarta",
    weddingDate: "Oktober 2025",
    weddingVenue: "Balai Kartini",
    keyFeature: "Financial Guard 70/30",
    featureBadgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    storyTitle: "Menyelamatkan Tabungan dari Gengsi Resepsi 3 Jam",
    challenge:
      "Nikah di Jakarta godaan gengsinya luar biasa. Kami sempat hampir nekat ambil paket vendor dekorasi Rp 30 juta lebih mahal karena terbuai foto medsos.",
    solution:
      "Indikator Financial Guard 70/30 langsung menyala merah memperingatkan bahwa jatah sewa kontrakan tahun pertama kami akan tergerus. Kami segera putar arah dan pilih opsi bijak. Hari-H tetap megah dan elegan, tapi dana pasca-nikah kami aman terkunci.",
    quote:
      "“Hari resepsi cuma 3 jam, tapi hidup berdua seumur hidup. Prinsip 70/30 HajatKita bikin kami bisa tidur nyenyak di rumah kontrakan baru tanpa beban utang kartu kredit.”",
    stats: "Rp 42 Juta Dana Pasca-Nikah Aman Terkunci",
  },
  {
    id: "testi-3",
    coupleNames: "Fikri & Zahra",
    groomName: "Fikri",
    brideName: "Zahra",
    groomAvatar: "bear-hero",
    brideAvatar: "rabbit-sweet",
    city: "Yogyakarta (LDR Jakarta - Jogja)",
    weddingDate: "Agustus 2025",
    weddingVenue: "Pendopo Ageng Kotagede",
    keyFeature: "Duo Sync & Live Audit Trail",
    featureBadgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    storyTitle: "Persiapan Nikah Jarak Jauh Tetap Terasa Dekat & Rapi",
    challenge:
      "Saya berdinas di Jakarta sedangkan Zahra di Jogja. Nyiapin nikah LDR itu rawan curiga dan lupa: 'Kamu udah bayar DP MUA belum?', 'Berkas puskesmas udah diurus?'",
    solution:
      "Sistem Duo Workspace HajatKita bikin kami serasa nyiapin bareng tiap hari. Begitu saya transfer termin vendor atau Zahra checklist berkas KUA, notifikasi dan jejak live audit langsung terupdate detik itu juga.",
    quote:
      "“Jejak aktivitasnya transparan banget. Siapa yang nambah tamu, bayar vendor, sampai isi pojok bicara pranikah semuanya tercatat rapi. Ga ada lagi salah paham.”",
    stats: "100% Termin Vendor Tercatat Akurat",
  },
  {
    id: "testi-4",
    coupleNames: "Bagas & Triana",
    groomName: "Bagas",
    brideName: "Triana",
    groomAvatar: "fox-clever",
    brideAvatar: "deer-gentle",
    city: "Surabaya, Jawa Timur",
    weddingDate: "Januari 2026",
    weddingVenue: "Gedung Juang 45",
    keyFeature: "Ceklis KUA & Katalog Seserahan",
    featureBadgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    storyTitle: "Birokrasi KUA Lancar Tanpa Bolak-Balik Kelurahan",
    challenge:
      "Kami berdua sama-sama sibuk kerja shift di RS. Takut banget salah urus syarat KUA dan kelupaan printilan seserahan adat Jawa.",
    solution:
      "Checklist administrasi KUA HajatKita sangat runut dari RT/RW, N1, N2, N4, imunisasi TT puskesmas, hingga Simkah online. Kotak seserahan juga bisa diatur per box sehingga belanja hantaran bisa dicicil bertahap tanpa dobel beli.",
    quote:
      "“Petugas KUA sampai kaget berkas kami langsung lengkap dalam satu map tanpa kekurangan selembar pun. Sangat menghemat cuti kerja kami berdua.”",
    stats: "H-60 Seluruh Berkas KUA Siap Sempurna",
  },
];

function TestimonialCard({ item }: { item: Testimonial }) {
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -8;
    const tiltY = ((x - centerX) / centerX) * 8;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-3xl bg-white border border-slate-200/90 p-5 sm:p-7 shadow-subtle-sm transition-all duration-200 ease-out flex flex-col justify-between"
      style={{
        perspective: "1000px",
        transform: isHovered
          ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px) translateZ(8px)`
          : "rotateX(0deg) rotateY(0deg) translateY(0) translateZ(0)",
        boxShadow: isHovered
          ? "0 20px 35px -8px rgba(29, 80, 162, 0.12), 0 8px 16px -6px rgba(15, 23, 42, 0.05)"
          : undefined,
      }}
    >
      <div>
        {/* Top Header: Couple Info & Key Feature Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 shrink-0">
              <CuteAvatarBadge cardId={item.groomAvatar} size="xs" />
              <CuteAvatarBadge cardId={item.brideAvatar} size="xs" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900 font-serif leading-tight">
                {item.coupleNames}
              </h4>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                {item.city}
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shadow-2xs shrink-0 ${item.featureBadgeColor}`}
          >
            {item.keyFeature}
          </span>
        </div>

        {/* Rating Stars & Venue */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
            ))}
            <span className="text-[11px] font-bold text-slate-700 ml-1">5.0</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            {item.weddingVenue} • {item.weddingDate}
          </span>
        </div>

        {/* Story Title */}
        <h5 className="text-sm sm:text-base font-black text-slate-900 font-serif mb-2 leading-snug">
          {item.storyTitle}
        </h5>

        {/* Quote & Story */}
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed mb-4">
          <p className="italic text-slate-800 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60 font-serif text-[12px]">
            {item.quote}
          </p>
          <div className="space-y-1.5 pt-1">
            <p>
              <strong className="text-slate-900 font-semibold">Tantangan: </strong>
              {item.challenge}
            </p>
            <p>
              <strong className="text-emerald-700 font-semibold">Hasil: </strong>
              {item.solution}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Key Stat */}
      <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <span className="font-bold text-pastel-700 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {item.stats}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">Pengantin Terverifikasi</span>
      </div>
    </div>
  );
}

export function InteractiveTestimonials() {
  return (
    <section className="py-10 sm:py-14 space-y-8">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shadow-2xs">
          <Heart className="w-3.5 h-3.5 fill-rose-500" />
          <span>Kisah Nyata Pasangan HajatKita</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 font-serif tracking-tight">
          Bukan Sekadar Testimoni Klise, Ini Perjuangan Nyata Menuju Hari Bahagia
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Dari drama kuota keluarga besar hingga godaan gengsi resepsi di kota besar. Dengarkan
          bagaimana pasangan di Indonesia berhasil menyelenggarakan pernikahan yang berkesan tanpa
          merusak modal hidup berdua.
        </p>
      </div>

      {/* Testimonials 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {testimonialsData.map((item) => (
          <TestimonialCard key={item.id} item={item} />
        ))}
      </div>

      {/* Bottom Trust Metrics Bar */}
      <div className="rounded-3xl bg-gradient-to-r from-pastel-900 via-slate-900 to-pastel-950 text-white p-6 sm:p-8 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        <div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-pastel-300">1.250+</div>
          <div className="text-xs text-slate-300 mt-1 font-medium">Pasangan Terhubung</div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">98.7%</div>
          <div className="text-xs text-slate-300 mt-1 font-medium">Bebas Overbudget Katering</div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-gold-300">100%</div>
          <div className="text-xs text-slate-300 mt-1 font-medium">Berkas KUA Siap Lengkap</div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-rose-300">Rp 4.5 M+</div>
          <div className="text-xs text-slate-300 mt-1 font-medium">Dana Pasca-Nikah Terlindungi</div>
        </div>
      </div>
    </section>
  );
}
