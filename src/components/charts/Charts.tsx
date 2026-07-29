import type { WarnaDeret } from '@/data/types';

/**
 * Grafik dirender dari data sebagai DOM dan SVG, bukan gambar.
 *
 * Tiga akibat langsung: tajam di setiap kepadatan piksel, ikut tersapu
 * pemeriksaan kontras dan pemeriksaan `innerText`, dan tidak mungkin melenceng
 * dari angka yang ditampilkan di sebelahnya. Bitmap lolos begitu saja tanpa
 * pernah diperiksa dan bisa memuat angka yang sudah basi.
 *
 * Deret TIDAK PERNAH dibedakan hanya lewat warna. Setiap deret punya label
 * teks langsung atau legenda bertulisan, karena warna saja tidak sampai ke
 * pembaca yang tidak bisa membedakannya.
 */

export function GrafikBatang({
  data,
  label,
}: {
  data: { label: string; nilai: number; teks: string; warna?: WarnaDeret }[];
  label: string;
}) {
  const maks = Math.max(...data.map((d) => d.nilai), 1);
  return (
    <div className="grafik" role="img" aria-label={`${label}. ${data.map((d) => `${d.label} ${d.teks}`).join(', ')}`}>
      <div className="grafik-batang" aria-hidden="true">
        {data.map((d) => (
          <div key={d.label} className="grafik-kolom">
            <span className="grafik-area">
              <span
                className="grafik-isi"
                style={{
                  height: `${Math.max(2, (d.nilai / maks) * 100)}%`,
                  background: `var(--chart-${d.warna ?? 1})`,
                }}
              />
            </span>
            <span className="grafik-kaki">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BarDaftar({
  data,
  label,
}: {
  data: { label: string; ket?: string; nilai: number; teks: string; warna?: WarnaDeret }[];
  label: string;
}) {
  const maks = Math.max(...data.map((d) => d.nilai), 1);
  return (
    <div className="bar-daftar" aria-label={label}>
      {data.map((d) => (
        <div key={d.label} className="bar-item">
          <div className="tbl-kartu-baris">
            <span className="stack">
              <span className="t">{d.label}</span>
              {d.ket ? <span className="s">{d.ket}</span> : null}
            </span>
            <span className="num">{d.teks}</span>
          </div>
          <span className="bar-track" aria-hidden="true">
            <span
              className="bar-isi"
              style={{ width: `${(d.nilai / maks) * 100}%`, background: `var(--chart-${d.warna ?? 1})` }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

export function Legenda({ data }: { data: { label: string; warna: WarnaDeret }[] }) {
  return (
    <div className="legenda">
      {data.map((d) => (
        <span key={d.label} className="legenda-item">
          <span className="legenda-titik" style={{ background: `var(--chart-${d.warna})` }} aria-hidden="true" />
          <span>{d.label}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * Donat penjualan per metode bayar.
 *
 * Digambar dengan `stroke-dasharray` pada lingkaran, jadi tidak butuh pustaka
 * apa pun. Angka aslinya tetap ditulis sebagai teks di legenda, sehingga
 * gambarnya boleh sepenuhnya `aria-hidden`.
 */
export function Donat({
  data,
  label,
}: {
  data: { label: string; nilai: number; teks: string; warna: WarnaDeret }[];
  label: string;
}) {
  const total = data.reduce((a, d) => a + d.nilai, 0) || 1;
  const r = 56;
  const keliling = 2 * Math.PI * r;
  let jalan = 0;

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-4)', justifyItems: 'center' }}>
      <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`${label}. ${data.map((d) => `${d.label} ${d.teks}`).join(', ')}`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="20" />
        {data.map((d) => {
          const panjang = (d.nilai / total) * keliling;
          const offset = jalan;
          jalan += panjang;
          return (
            <circle
              key={d.label}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={`var(--chart-${d.warna})`}
              strokeWidth="20"
              strokeDasharray={`${panjang} ${keliling - panjang}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
            />
          );
        })}
      </svg>
      <div className="grafik" style={{ width: '100%' }}>
        {data.map((d) => (
          <div key={d.label} className="tbl-kartu-baris">
            <span className="legenda-item">
              <span className="legenda-titik" style={{ background: `var(--chart-${d.warna})` }} aria-hidden="true" />
              <span>{d.label}</span>
            </span>
            <span className="num">{d.teks}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
