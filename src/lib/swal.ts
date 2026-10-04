import Swal, { SweetAlertOptions } from "sweetalert2";

// Base Toast Mixin with high-quality animation and wedding theme
export const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
  customClass: {
    popup: "rounded-2xl shadow-subtle-lg border border-slate-200/90 font-sans text-xs bg-white/95 backdrop-blur-md",
    title: "text-xs font-bold text-slate-800",
  },
});

/**
 * Show a quick success toast notification
 */
export function showToastSuccess(title: string, message?: string) {
  return Toast.fire({
    icon: "success",
    title,
    text: message,
    iconColor: "#10B981",
  });
}

/**
 * Show a quick info toast notification
 */
export function showToastInfo(title: string, message?: string) {
  return Toast.fire({
    icon: "info",
    title,
    text: message,
    iconColor: "#2B68C0",
  });
}

/**
 * Show a quick warning toast notification
 */
export function showToastWarning(title: string, message?: string) {
  return Toast.fire({
    icon: "warning",
    title,
    text: message,
    iconColor: "#F59E0B",
  });
}

/**
 * Show a quick error toast notification
 */
export function showToastError(title: string, message?: string) {
  return Toast.fire({
    icon: "error",
    title,
    text: message,
    iconColor: "#EF4444",
  });
}

/**
 * Show confirmation modal with SweetAlert2
 */
export async function showConfirmDialog(options: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isDestructive?: boolean;
  icon?: "warning" | "question" | "info";
}): Promise<boolean> {
  const isDestructive = options.isDestructive ?? true;
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    icon: options.icon || (isDestructive ? "warning" : "question"),
    showCancelButton: true,
    confirmButtonColor: isDestructive ? "#E11D48" : "#1D50A2",
    cancelButtonColor: "#94A3B8",
    confirmButtonText: options.confirmButtonText || (isDestructive ? "Ya, Hapus" : "Ya, Lanjutkan"),
    cancelButtonText: options.cancelButtonText || "Batal",
    reverseButtons: true,
    customClass: {
      popup: "rounded-3xl border border-slate-100 shadow-2xl p-6 font-sans",
      title: "font-serif text-slate-900 font-extrabold text-base sm:text-lg",
      htmlContainer: "text-xs sm:text-sm text-slate-600 leading-relaxed",
      confirmButton: "rounded-xl font-bold text-xs px-4 py-2.5 shadow-xs transition-transform active:scale-95",
      cancelButton: "rounded-xl font-bold text-xs px-4 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 transition-transform active:scale-95",
    },
  });

  return result.isConfirmed;
}

/**
 * Show standard success modal dialog
 */
export async function showSuccessAlert(title: string, text?: string) {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#1D50A2",
    confirmButtonText: "Selesai",
    customClass: {
      popup: "rounded-3xl border border-slate-100 shadow-2xl p-6 font-sans",
      title: "font-serif text-slate-900 font-extrabold text-base sm:text-lg",
      htmlContainer: "text-xs sm:text-sm text-slate-600 leading-relaxed",
      confirmButton: "rounded-xl font-bold text-xs px-5 py-2.5 shadow-xs text-white",
    },
  });
}

/**
 * Show error modal dialog
 */
export async function showErrorAlert(title: string, text?: string) {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#1D50A2",
    confirmButtonText: "Tutup",
    customClass: {
      popup: "rounded-3xl border border-slate-100 shadow-2xl p-6 font-sans",
      title: "font-serif text-slate-900 font-extrabold text-base sm:text-lg",
      htmlContainer: "text-xs sm:text-sm text-slate-600 leading-relaxed",
      confirmButton: "rounded-xl font-bold text-xs px-5 py-2.5 shadow-xs text-white",
    },
  });
}

/**
 * Show interactive text prompt dialog
 */
export async function showPromptDialog(options: {
  title: string;
  text?: string;
  inputPlaceholder?: string;
  inputValue?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  inputValidator?: (value: string) => string | null;
}): Promise<string | null> {
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    input: "text",
    inputValue: options.inputValue || "",
    inputPlaceholder: options.inputPlaceholder || "Ketik di sini...",
    showCancelButton: true,
    confirmButtonColor: "#1D50A2",
    cancelButtonColor: "#94A3B8",
    confirmButtonText: options.confirmButtonText || "Simpan",
    cancelButtonText: options.cancelButtonText || "Batal",
    reverseButtons: true,
    customClass: {
      popup: "rounded-3xl border border-slate-100 shadow-2xl p-6 font-sans",
      title: "font-serif text-slate-900 font-extrabold text-base sm:text-lg",
      htmlContainer: "text-xs sm:text-sm text-slate-600 leading-relaxed",
      input: "text-xs font-medium rounded-xl border border-slate-200 p-2.5 focus:ring-2 focus:ring-pastel-300",
      confirmButton: "rounded-xl font-bold text-xs px-4 py-2.5 shadow-xs text-white",
      cancelButton: "rounded-xl font-bold text-xs px-4 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200",
    },
    inputValidator: (val) => {
      if (options.inputValidator) {
        return options.inputValidator(val);
      }
      if (!val || !val.trim()) {
        return "Harap isi bidang ini!";
      }
      return null;
    },
  });

  if (result.isConfirmed && result.value) {
    return result.value as string;
  }
  return null;
}

export default Swal;
