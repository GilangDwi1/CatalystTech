import { Injectable } from '@nestjs/common';

@Injectable()
export class FaceRecognitionCacheService {
  // Cache untuk menyimpan hasil pengenalan wajah
  // Key: hash dari data gambar, Value: hasil pengenalan {karyawanId, timestamp}
  private recognitionCache = new Map<string, { karyawanId: number, timestamp: number }>();
  
  // Durasi cache dalam milidetik (5 menit)
  private readonly CACHE_DURATION = 5 * 60 * 1000;
  
  // Ukuran maksimum cache
  private readonly MAX_CACHE_SIZE = 100;
  
  // Metode untuk mendapatkan hasil dari cache
  getFromCache(imageHash: string): number | null {
    const cachedResult = this.recognitionCache.get(imageHash);
    
    // Jika tidak ada di cache atau sudah expired
    if (!cachedResult || Date.now() - cachedResult.timestamp > this.CACHE_DURATION) {
      if (cachedResult) {
        // Hapus entry yang sudah expired
        this.recognitionCache.delete(imageHash);
      }
      return null;
    }
    
    return cachedResult.karyawanId;
  }
  
  // Metode untuk menyimpan hasil ke cache
  saveToCache(imageHash: string, karyawanId: number): void {
    // Jika cache sudah penuh, hapus entry tertua
    if (this.recognitionCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.recognitionCache.keys().next().value;
      this.recognitionCache.delete(oldestKey);
    }
    
    // Simpan hasil baru ke cache
    this.recognitionCache.set(imageHash, {
      karyawanId,
      timestamp: Date.now()
    });
  }
  
  // Metode untuk membuat hash sederhana dari data gambar
  // Dalam implementasi nyata, gunakan algoritma hash yang lebih baik
  generateImageHash(imageData: string): string {
    // Implementasi sederhana untuk demo
    // Dalam produksi, gunakan algoritma hash yang lebih baik
    return Buffer.from(imageData.substring(0, 100)).toString('base64');
  }
  
  // Metode untuk membersihkan cache yang expired
  cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.recognitionCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.recognitionCache.delete(key);
      }
    }
  }
}