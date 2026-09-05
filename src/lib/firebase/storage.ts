// ============================================================
// AgriOS — Firebase Cloud Storage Service
// Handles photo uploads for crop disease diagnosis and farm assets
// Bucket: agrios-7c269.firebasestorage.app
// ============================================================
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './client';

/**
 * Upload a crop leaf photo to Firebase Cloud Storage.
 * Stores file under: farms/{farmId}/disease/{timestamp}.jpg
 * Returns the public download URL or null if storage is unavailable.
 */
export async function uploadDiseaseImage(farmId: string, file: File | Blob): Promise<string | null> {
  if (!storage) {
    console.warn('[Firebase Storage] Cloud Storage is not configured or offline.');
    return null;
  }

  try {
    const timestamp = Date.now();
    const filename = `${timestamp}.jpg`;
    const imageRef = ref(storage, `farms/${farmId}/disease/${filename}`);
    
    const metadata = {
      contentType: (file as File).type || 'image/jpeg',
      customMetadata: {
        farmId,
        uploadedAt: new Date().toISOString(),
        source: 'AgriOS Crop Disease Investigator',
      },
    };

    const snapshot = await uploadBytes(imageRef, file, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('[Firebase Storage] Upload failed (check bucket rules / network):', error);
    return null;
  }
}
