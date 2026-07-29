'use client';

import { useCallback, useEffect, useState } from 'react';

const AWALAN = 'lekas:';

export function baca<T>(kunci: string, bawaan: T): T {
  if (typeof window === 'undefined') return bawaan;
  try {
    const mentah = window.localStorage.getItem(AWALAN + kunci);
    return mentah === null ? bawaan : (JSON.parse(mentah) as T);
  } catch {
    // Mode penyamaran dan penyimpanan penuh sama sama melempar di sini.
    // Demo tidak boleh mati hanya karena preferensi tampilan gagal dibaca.
    return bawaan;
  }
}

export function tulis<T>(kunci: string, nilai: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AWALAN + kunci, JSON.stringify(nilai));
  } catch {
    /* diabaikan dengan sengaja, lihat catatan di baca() */
  }
}

/**
 * Keadaan yang bertahan antar kunjungan.
 *
 * Nilai awalnya SELALU `bawaan`, tidak pernah langsung dari localStorage, dan
 * pembacaan aslinya baru terjadi di dalam efek. Ini disengaja: HTML static
 * export dibuat di waktu build tanpa akses localStorage, jadi render pertama di
 * browser wajib menghasilkan pohon yang sama persis dengan yang di berkas,
 * kalau tidak React membuang seluruh hasil server dan melapor ketidakcocokan
 * hidrasi. Satu render tambahan jauh lebih murah daripada itu.
 */
export function usePreferensi<T>(kunci: string, bawaan: T): [T, (n: T) => void, boolean] {
  const [nilai, setNilai] = useState<T>(bawaan);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setNilai(baca(kunci, bawaan));
    setSiap(true);
    // `bawaan` sengaja tidak diikutkan: nilai bawaan yang ditulis inline
    // (objek atau array literal) identitasnya baru setiap render dan akan
    // membuat efek ini berjalan tanpa henti.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kunci]);

  const simpan = useCallback(
    (n: T) => {
      setNilai(n);
      tulis(kunci, n);
    },
    [kunci],
  );

  return [nilai, simpan, siap];
}
