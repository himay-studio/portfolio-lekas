'use client';

import { MEJA, petaMeja } from '@/data/operasional';
import type { StatusMeja, Tone } from '@/data/types';
import { jam, rupiah } from '@/lib/format';
import { hitung, type Tahanan } from '@/lib/kasir';
import { Badge, Kosong } from '@/components/ui/Primitives';
import { Overlay } from '@/components/ui/Overlay';

/**
 * Daftar transaksi tertahan.
 *
 * Ini KOLEKSI, bukan satu slot, dan itu ditetapkan sejak Stage 3 karena
 * mengubahnya belakangan berarti mengubah bentuk data dan seluruh layar yang
 * membacanya. Kedai ramai menahan tiga sampai lima pesanan sekaligus: satu tamu
 * izin ambil dompet, satu meja belum lengkap, satu pesanan antar belum
 * dijemput. Model satu slot memaksa kasir menyelesaikan atau membuang tahanan
 * lama sebelum boleh menahan yang baru, dan itu bukan kekurangan fitur, itu
 * kehilangan pesanan.
 */
export function PanelTahanan({
  buka,
  onTutup,
  tahanan,
  onLanjut,
  onHapus,
  pajakPersen,
  servicePersen,
  pembulatan,
}: {
  buka: boolean;
  onTutup: () => void;
  tahanan: Tahanan[];
  onLanjut: (t: Tahanan) => void;
  onHapus: (id: string) => void;
  pajakPersen: number;
  servicePersen: number;
  pembulatan: number;
}) {
  return (
    <Overlay
      buka={buka}
      onTutup={onTutup}
      judul="Transaksi tertahan"
      ket={`${tahanan.length} pesanan menunggu dilanjutkan`}
      lebar
    >
      {tahanan.length === 0 ? (
        <Kosong
          judul="Belum ada transaksi tertahan"
          ket="Tombol Tahan di keranjang menyimpan pesanan yang belum selesai, dan pesanan itu muncul di daftar ini."
        />
      ) : (
        <div className="form-grid">
          {tahanan.map((t) => {
            const r = hitung(t.baris, {
              diskonTransaksi: t.diskonTransaksi,
              servicePersen,
              pajakPersen,
              pembulatan,
            });
            const meja = t.mejaId ? petaMeja.get(t.mejaId) : null;
            return (
              <div key={t.id} className="kartu" style={{ display: 'grid', gap: 'var(--sp-3)' }}>
                <div className="item-kartu-atas">
                  <span className="stack">
                    <span className="t">{t.label}</span>
                    <span className="s">
                      Ditahan {jam(t.waktu)} · {r.jumlahItem} item{meja ? ` · Meja ${meja.nama}` : ''}
                    </span>
                  </span>
                  <span className="num">{rupiah(r.total)}</span>
                </div>
                {t.catatan ? <p className="bantuan">{t.catatan}</p> : null}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                  <button type="button" className="btn" onClick={() => { onLanjut(t); onTutup(); }}>
                    Lanjutkan
                  </button>
                  <button type="button" className="btn btn-sekunder" onClick={() => onHapus(t.id)}>
                    Buang tahanan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Overlay>
  );
}

const TONE_MEJA: Record<StatusMeja, Tone> = {
  kosong: 'success',
  terisi: 'warning',
  dipesan: 'info',
};

const LABEL_MEJA: Record<StatusMeja, string> = {
  kosong: 'Kosong',
  terisi: 'Terisi',
  dipesan: 'Dipesan',
};

/** Pemilih meja untuk mode F&B. Dikelompokkan per area, bukan satu daftar rata. */
export function PanelMeja({
  buka,
  onTutup,
  terpilih,
  onPilih,
}: {
  buka: boolean;
  onTutup: () => void;
  terpilih: string | null;
  onPilih: (id: string | null) => void;
}) {
  const area = [...new Set(MEJA.map((m) => m.area))];

  return (
    <Overlay
      buka={buka}
      onTutup={onTutup}
      judul="Pilih meja"
      ket="Nomor meja ikut tercetak di struk dan tampil di layar dapur"
      lebar
      kaki={(
        <button type="button" className="btn btn-sekunder" onClick={() => { onPilih(null); onTutup(); }}>
          Tanpa meja, bawa pulang
        </button>
      )}
    >
      <div className="form-grid">
        {area.map((a) => (
          <section key={a} className="seksi">
            <h3>{a}</h3>
            <div className="kartu-grid">
              {MEJA.filter((m) => m.area === a).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`btn ${terpilih === m.id ? '' : 'btn-sekunder'}`}
                  style={{ height: 'auto', padding: 'var(--sp-3)', justifyContent: 'space-between' }}
                  aria-pressed={terpilih === m.id}
                  onClick={() => { onPilih(m.id); onTutup(); }}
                >
                  <span className="stack" style={{ alignItems: 'flex-start' }}>
                    <span className="t" style={{ color: 'inherit' }}>Meja {m.nama}</span>
                    <span className="s" style={{ color: 'inherit' }}>{m.kursi} kursi</span>
                  </span>
                  <Badge tone={TONE_MEJA[m.status]}>{LABEL_MEJA[m.status]}</Badge>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Overlay>
  );
}
