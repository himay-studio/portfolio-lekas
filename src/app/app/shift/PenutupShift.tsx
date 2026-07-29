'use client';

import { useMemo, useState } from 'react';
import { rupiah } from '@/lib/format';
import { useShiftStore } from '@/lib/shiftStore';
import { Overlay } from '@/components/ui/Overlay';

/** Pecahan uang kertas dan logam yang lazim ada di laci kasir Indonesia. */
const PECAHAN = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500] as const;

/**
 * Penghitung pecahan uang saat tutup shift.
 *
 * Kas fisik yang dicatat WAJIB datang dari jumlah lembar dan koin yang
 * benar benar dihitung kasir, bukan satu angka yang diketik langsung.
 * Mengetik total langsung membiarkan kasir menuliskan angka yang "pas"
 * tanpa benar benar menghitung laci, dan selisih yang sesungguhnya baru
 * ketahuan belakangan, saat sudah tidak ada yang ingat kejadiannya.
 */
export function PenutupShift({ shiftId, onTutup }: { shiftId: string | null; onTutup: () => void }) {
  const { shift, tutupShift } = useShiftStore();
  const [jumlah, setJumlah] = useState<Record<number, string>>({});
  const [catatan, setCatatan] = useState('');

  const s = shiftId ? shift.find((x) => x.id === shiftId) ?? null : null;

  const total = useMemo(
    () => PECAHAN.reduce((a, p) => a + p * (Number(jumlah[p]) || 0), 0),
    [jumlah],
  );
  const selisih = s ? total - s.kasSistem : 0;

  function tutup() {
    setJumlah({});
    setCatatan('');
    onTutup();
  }

  function submit() {
    if (!s) return;
    tutupShift(s.id, { kasFisik: total, catatan: catatan.trim() || undefined });
    tutup();
  }

  return (
    <Overlay
      buka={Boolean(s)}
      onTutup={tutup}
      judul="Tutup shift"
      ket={s ? `${s.id} · kas sistem ${rupiah(s.kasSistem)}` : ''}
      lebar
      kaki={(
        <>
          <button type="button" className="btn" onClick={submit}>Tutup shift dan simpan selisih</button>
          <button type="button" className="btn btn-sekunder" onClick={tutup}>Batal</button>
        </>
      )}
    >
      {s ? (
        <div className="kolom-2">
          <div className="seksi">
            <h3>Hitung pecahan uang di laci</h3>
            <div className="form-grid">
              {PECAHAN.map((p) => (
                <div key={p} className="form-grid form-grid-2" style={{ alignItems: 'center' }}>
                  <span className="t">{rupiah(p)}</span>
                  <input
                    className="input input-num"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={jumlah[p] ?? ''}
                    onChange={(e) => setJumlah((j) => ({ ...j, [p]: e.target.value }))}
                    placeholder="0 lembar/koin"
                    aria-label={`Jumlah lembar atau koin ${rupiah(p)}`}
                  />
                </div>
              ))}
            </div>
            <div className="bidang" style={{ marginTop: 'var(--sp-3)' }}>
              <label htmlFor="tutup-catatan">Catatan (opsional)</label>
              <textarea id="tutup-catatan" className="textarea" value={catatan} onChange={(e) => setCatatan(e.target.value)} />
            </div>
          </div>

          <div className="kolom-sisi">
            <section className="kartu">
              <div className="kartu-judul">
                <h3>Ringkasan</h3>
              </div>
              <dl className="def">
                <div className="def-baris"><dt>Kas awal</dt><dd className="num">{rupiah(s.kasAwal)}</dd></div>
                <div className="def-baris"><dt>Kas menurut sistem</dt><dd className="num">{rupiah(s.kasSistem)}</dd></div>
                <div className="def-baris"><dt>Kas fisik dihitung</dt><dd className="num">{rupiah(total)}</dd></div>
                <div className="def-baris">
                  <dt>Selisih</dt>
                  <dd className={`num-besar ${selisih < 0 ? 'negatif' : ''}`} style={{ fontSize: 22, lineHeight: '28px' }}>
                    {selisih === 0 ? 'Pas' : rupiah(selisih)}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      ) : null}
    </Overlay>
  );
}
