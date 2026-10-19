import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { ubahProduk } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/server";

export default async function HalamanUbahProduk({ params, searchParams }) {
  const { id } = await params;
  const { error } = (await searchParams) || {};

  const supabase = createClient();
  const { data: produk, error: fetchError } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      {error && (
        <div className="max-w-xl rounded-xl border border-garis bg-permukaan p-4 text-sm text-bahaya">
          {error}
        </div>
      )}
      <FormProduk
        produk={produk}
        action={ubahProduk}
        labelTombol="Simpan perubahan"
      />
    </div>
  );
}
