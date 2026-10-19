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

export async function gantiPassword(formData) {
  const passwordBaru = formData.get("password_baru");
  const konfirmasiPassword = formData.get("konfirmasi_password");

  if (!passwordBaru || !konfirmasiPassword) {
    redirect(
      "/admin/password?error=" +
        encodeURIComponent("Password baru dan konfirmasi password wajib diisi.")
    );
  }

  if (String(passwordBaru).length < 8) {
    redirect(
      "/admin/password?error=" +
        encodeURIComponent("Password baru minimal 8 karakter.")
    );
  }

  if (passwordBaru !== konfirmasiPassword) {
    redirect(
      "/admin/password?error=" +
        encodeURIComponent("Konfirmasi password tidak sama.")
    );
  }

  const supabase = await createSessionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      "/admin/login?error=" +
        encodeURIComponent("Silakan masuk terlebih dahulu.")
    );
  }

  let errorMessage = null;

  try {
    const { error } = await supabase.auth.updateUser({
      password: String(passwordBaru),
    });

    if (error) {
      errorMessage = error.message;
    }
  } catch (err) {
    errorMessage = "Terjadi kesalahan saat mengganti password. Silakan coba lagi.";
  }

  if (errorMessage) {
    redirect("/admin/password?error=" + encodeURIComponent(errorMessage));
  }

  redirect(
    "/admin/password?sukses=" +
      encodeURIComponent("Password berhasil diganti.")
  );
}
