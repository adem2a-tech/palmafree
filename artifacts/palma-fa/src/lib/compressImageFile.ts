/**
 * Lit une image locale, redimensionne et renvoie une data URL JPEG (pour stockage en base).
 */
export async function compressImageFileToDataUrl(
  file: File,
  options: { maxEdge?: number; quality?: number; maxSourceBytes?: number } = {},
): Promise<string> {
  const maxEdge = options.maxEdge ?? 1400;
  const quality = options.quality ?? 0.82;
  const maxSourceBytes = options.maxSourceBytes ?? 15 * 1024 * 1024;

  const isImageMime = file.type.startsWith("image/");
  const isHeicName = /\.(heic|heif)$/i.test(file.name);
  if (!isImageMime && !isHeicName) {
    throw new Error("Choisissez un fichier image (JPEG, PNG, WebP, etc.).");
  }
  if (file.size > maxSourceBytes) {
    throw new Error("Fichier trop volumineux (15 Mo max). Choisissez une image plus légère.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "Impossible de lire cette image. Essayez JPEG ou PNG, ou convertissez les fichiers HEIC en JPEG.",
    );
  }

  try {
    let { width, height } = bitmap;
    if (width < 1 || height < 1) {
      throw new Error("Image invalide.");
    }
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Votre navigateur ne permet pas de traiter l’image.");
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    bitmap.close();
  }
}
