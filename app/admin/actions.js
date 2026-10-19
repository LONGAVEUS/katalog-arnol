"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/lib/supabase/server";

export async function login(formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    redirect("/admin/login?error=" + encodeURIComponent("Email dan password wajib diisi."));
  }

  let errorMessage = null;

  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(password),
    });

    if (error) {
      errorMessage =
        error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : error.message;
    }
  } catch (err) {
    errorMessage = "Terjadi kesalahan saat masuk. Silakan coba lagi.";
  }

  if (errorMessage) {
    redirect("/admin/login?error=" + encodeURIComponent(errorMessage));
  }

  redirect("/admin");
}

export async function keluar() {
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch (err) {
    // Tetap arahkan ke halaman login jika terjadi error saat keluar
  }

  redirect("/admin/login");
}

export const logout = keluar;

