"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/server";

export async function verifikasiAdmin() {
  const supabase = await createSessionClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(
      "/admin/login?error=" +
        encodeURIComponent("Silakan masuk terlebih dahulu.")
    );
  }

  return { supabase, user };
}

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

  // Wajib periksa di server bahwa admin sudah login sebelum mengubah data
  const { supabase } = await verifikasiAdmin();

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

export async function tambahProduk(formData) {
  // Wajib periksa di server bahwa admin sudah login sebelum mengubah/menambah data
  const { supabase } = await verifikasiAdmin();

  const nama = formData.get("nama")?.toString().trim();
  const hargaRaw = formData.get("harga")?.toString().trim();
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    redirect(
      "/admin/produk/baru?error=" +
        encodeURIComponent("Nama produk wajib diisi.")
    );
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    redirect(
      "/admin/produk/baru?error=" +
        encodeURIComponent("Harga harus berupa angka yang tidak negatif.")
    );
  }

  let errorMessage = null;

  try {
    const { error } = await supabase.from("produk").insert([
      {
        nama,
        harga,
        kategori,
        foto_url,
        deskripsi,
      },
    ]);

    if (error) {
      errorMessage = error.message;
    }
  } catch (err) {
    errorMessage = "Terjadi kesalahan saat menyimpan produk.";
  }

  if (errorMessage) {
    redirect(
      "/admin/produk/baru?error=" + encodeURIComponent(errorMessage)
    );
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function ubahProduk(idOrFormData, maybeFormData) {
  // Wajib periksa status login admin di server sebelum mengubah data
  const { supabase } = await verifikasiAdmin();

  let id;
  let formData;

  if (maybeFormData instanceof FormData) {
    id = idOrFormData;
    formData = maybeFormData;
  } else {
    formData = idOrFormData;
    id = formData.get("id");
  }

  if (!id) {
    redirect("/admin?error=" + encodeURIComponent("ID produk tidak ditemukan."));
  }

  const nama = formData.get("nama")?.toString().trim();
  const hargaRaw = formData.get("harga")?.toString().trim();
  const kategori = formData.get("kategori")?.toString().trim() || null;
  const foto_url = formData.get("foto_url")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;

  if (!nama) {
    redirect(
      `/admin/produk/${id}/ubah?error=` +
        encodeURIComponent("Nama produk wajib diisi.")
    );
  }

  const harga = parseInt(hargaRaw, 10);
  if (isNaN(harga) || harga < 0) {
    redirect(
      `/admin/produk/${id}/ubah?error=` +
        encodeURIComponent("Harga harus berupa angka yang tidak negatif.")
    );
  }

  let errorMessage = null;

  try {
    const { error } = await supabase
      .from("produk")
      .update({
        nama,
        harga,
        kategori,
        foto_url,
        deskripsi,
      })
      .eq("id", id);

    if (error) {
      errorMessage = error.message;
    }
  } catch (err) {
    errorMessage = "Terjadi kesalahan saat memperbarui produk.";
  }

  if (errorMessage) {
    redirect(
      `/admin/produk/${id}/ubah?error=` + encodeURIComponent(errorMessage)
    );
  }

  revalidatePath("/");
  revalidatePath(`/produk/${id}`);
  revalidatePath("/admin");
  redirect("/admin");
}
