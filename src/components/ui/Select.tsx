'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sisiPanel, useDisclosure } from './useDisclosure';

export interface OpsiSelect {
  nilai: string;
  label: string;
  /** Label sekunder. Dirender sebagai blok terpisah, tidak pernah menempel (R50). */
  ket?: string;
}

/**
 * Dropdown custom (R12). `<select>` bawaan browser DILARANG di seluruh produk.
 *
 * Tiga hal yang membuat komponen ini berbeda dari dropdown seadanya:
 *
 * 1. Panel TIDAK dirender saat tertutup, bukan sekadar `opacity: 0` (R57).
 *    Panel yang cuma diredupkan tetap menempati tata letak dan bisa membuat
 *    `scrollWidth` dokumen melebihi `innerWidth` dalam keadaan yang tidak
 *    muncul di tangkapan layar mana pun, karena panelnya memang tak terlihat.
 * 2. `aria-expanded` dibaca dari keadaan React yang sama dengan yang
 *    memutuskan panel dirender (R60), jadi keduanya tidak mungkin berselisih.
 * 3. Panel menempel ke sisi terjauh dari tepi viewport dan dijepit
 *    `max-width: calc(100vw - 2rem)` (R16.1).
 */
export function Select({
  nilai,
  opsi,
  onUbah,
  label,
  name,
  placeholder = 'Pilih',
  lebarPenuh = false,
  id,
}: {
  nilai: string;
  opsi: OpsiSelect[];
  onUbah: (n: string) => void;
  /** Label yang dibacakan pembaca layar kalau tidak ada <label> terlihat. */
  label: string;
  name?: string;
  placeholder?: string;
  lebarPenuh?: boolean;
  id?: string;
}) {
  const { buka, setBuka, toggle, tutup, idPanel, refPemicu, refPanel } = useDisclosure();
  const [sorot, setSorot] = useState(0);
  const [sisi, setSisi] = useState<'kiri' | 'kanan'>('kiri');
  const ketikRef = useRef({ teks: '', waktu: 0 });

  const terpilih = useMemo(() => opsi.find((o) => o.nilai === nilai), [opsi, nilai]);
  const indexTerpilih = Math.max(0, opsi.findIndex((o) => o.nilai === nilai));

  useEffect(() => {
    if (!buka) return;
    setSorot(indexTerpilih);
    setSisi(sisiPanel(refPemicu.current));
  }, [buka, indexTerpilih, refPemicu]);

  function pilih(i: number) {
    const o = opsi[i];
    if (!o) return;
    onUbah(o.nilai);
    tutup();
  }

  function padaTombol(e: React.KeyboardEvent) {
    if (!buka) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setBuka(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSorot((s) => (s + 1) % opsi.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSorot((s) => (s - 1 + opsi.length) % opsi.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSorot(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSorot(opsi.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pilih(sorot);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      // Mengetik huruf melompat ke opsi yang cocok. Ketikan beruntun dalam
      // 700ms diperlakukan sebagai satu kata, jadi "ka" menemukan "Kartu"
      // dan bukan berhenti di opsi pertama berhuruf a.
      const now = Date.now();
      const t = now - ketikRef.current.waktu < 700 ? ketikRef.current.teks + e.key : e.key;
      ketikRef.current = { teks: t, waktu: now };
      const i = opsi.findIndex((o) => o.label.toLowerCase().startsWith(t.toLowerCase()));
      if (i >= 0) setSorot(i);
    }
  }

  return (
    <div className="sel" style={lebarPenuh ? { width: '100%' } : undefined}>
      <button
        ref={refPemicu}
        type="button"
        id={id}
        className="sel-pemicu"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={buka}
        aria-controls={idPanel}
        aria-label={label}
        onClick={toggle}
        onKeyDown={padaTombol}
      >
        <span className="sel-nilai">{terpilih ? terpilih.label : placeholder}</span>
        <ChevronDown className="sel-chev lucide" size={16} aria-hidden="true" />
      </button>

      {name ? <input type="hidden" name={name} value={nilai} /> : null}

      {buka ? (
        <div
          ref={refPanel}
          id={idPanel}
          className="sel-panel"
          data-sisi={sisi}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
        >
          {opsi.map((o, i) => (
            <div
              key={o.nilai}
              role="option"
              aria-selected={o.nilai === nilai}
              data-sorot={i === sorot ? 'ya' : 'tidak'}
              className="sel-opsi"
              onMouseEnter={() => setSorot(i)}
              onClick={() => pilih(i)}
            >
              <span className="sel-cek" aria-hidden="true">
                {o.nilai === nilai ? <Check className="lucide" size={16} /> : null}
              </span>
              {o.ket ? (
                <span className="stack">
                  <span className="t">{o.label}</span>
                  <span className="s">{o.ket}</span>
                </span>
              ) : (
                <span>{o.label}</span>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
