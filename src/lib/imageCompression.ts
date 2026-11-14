// Downscale + re-encode images before upload. Phone photos are typically
// 2–5 MB; at feed scale the stored size is paid again on every download
// (Supabase egress), so shrinking the file once at upload saves bandwidth
// on every view forever. Returns null when compression doesn't help (small
// files, GIFs, or any failure) — callers then upload the original file.
export async function compressImageForUpload(
  file: File,
  maxDim = 1280,
  quality = 0.82
): Promise<Blob | null> {
  try {
    if (!file.type.startsWith("image/") || file.type === "image/gif") return null;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    if (scale >= 1 && file.size < 400_000) {
      bitmap.close();
      return null;
    }
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return null;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", quality)
    );
    return blob && blob.size < file.size ? blob : null;
  } catch {
    return null;
  }
}
