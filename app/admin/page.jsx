import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createClient } from "@/lib/supabase/server";

export default async function HalamanAdmin({ searchParams }) {
  const { error: queryError } = (await searchParams) || {};
  let daftarProduk = [];
  let pesanError = queryError || null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      pesanError = error.message || "Gagal memuat daftar produk dari database.";
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = err.message || "Terjadi kesalahan saat menghubungkan ke database.";
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>
      {pesanError ? (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-sm text-bahaya">
          Gagal memuat produk: {pesanError}
        </div>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
