// import { useState } from 'react' ;


// function App() {
//    // Membuat state bernama 'angka' dengan nilai awal 0
//   const [angka, setAngka] = useState(0);
//   const [teks, setTeks] = useState('');

//   // 1. State berbentuk Object
//   const [form, setForm] = useState({
//     Nama_kelas : '',
//     Jurusan : '',
//     tingkat : 'XII'
//   });

//   // 2. Fungsi Helper untuk mengupdate 1 field saja
//   const updateForm = (field, value) => {
//     setForm({ ...form, [field]: value });
//   };

//   return (
//     <div style={{ padding: '20px' }}>
//       <h1>Hello, World</h1>
//       <h2>Angka saat ini: {angka}</h2>
//       <button onClick={() => setAngka(angka + 1)}>Tambah Angka</button>
//       <br/>
//       <button onClick={() => setAngka(angka - 1)}>Kurangi Angka</button>
//       <hr/>
//       <h2>GUWE mengetik: {teks}</h2>
//       <input
//       type="text"
//       placeholder="Masukkan teks..."
//       value={teks}
//       onChange={(e) => setTeks(e.target.value)}
//       />
//       <br/>
//       <hr/>
//       <h2>Form Data Kelas</h2>
//       <input
//       placeholder="Nama Kelas"
//       value={form.Nama_kelas}
//       onChange={(e) => updateForm('Nama_kelas', e.target.value)}
//       />
//       <br/>
//       <input
//       placeholder="Jurusan"
//       value={form.Jurusan}
//       onChange={(e) => updateForm('Jurusan', e.target.value)}
//       />
//       <br/>
//       <select value={form.tingkat} onChange={(e) => updateForm('tingkat', e.target.value)}>
//         <option value="X">X</option>
//         <option value="XI">XI</option>
//         <option value="XII">XII</option>
//       </select>
//       <br/>
//       <h3>Preview Data (JSON) :</h3>
//       <pre>{JSON.stringify(form, null, 2)}</pre>
//     </div>
//   )
// }

// export default App;

// function App() {
//   return (
//     <div>
//       <h1>Halo, ini React pertamaku!</h1>
//     </div>
//   );
// }

// export default App;

// import { useState } from 'react';

// function App() {
//   // Membuat state bernama 'angka' dengan nilai awal 0
//   const [angka, setAngka] = useState(0);

//   return (
//     <div>
//       <h1>Angka saat ini: {angka}</h1>
//       <button onClick={() => setAngka(angka + 1)}>Tambah (+)</button>
//       <button onClick={() => setAngka(angka - 1)}>Kurang (-)</button>
//     </div>
//   );
// }

// export default App;

import { useEffect, useState } from "react";

function App() {
  const [siswa, setSiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // =========================
  // GET DATA SISWA
  // =========================
  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/siswa?select=*&order=id_siswa.asc`,
          {
            method: "GET",
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Gagal mengambil data siswa. Status: ${response.status}`
          );
        }

        const data = await response.json();

        setSiswa(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSiswa();
  }, [SUPABASE_URL, SUPABASE_ANON_KEY]);

  // =========================
  // SEARCH / FILTER
  // =========================
  const filteredSiswa = siswa.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      String(item.id_siswa).toLowerCase().includes(keyword) ||
      String(item.nis || "").toLowerCase().includes(keyword) ||
      String(item.nama || "").toLowerCase().includes(keyword) ||
      String(item.kelas || "").toLowerCase().includes(keyword) ||
      String(item.jurusan || "").toLowerCase().includes(keyword) ||
      String(item.alamat || "").toLowerCase().includes(keyword) ||
      String(item.email || "").toLowerCase().includes(keyword)
    );
  });

  // =========================
  // STATISTIK
  // =========================
  const jumlahSiswa = siswa.length;

  const jumlahLakiLaki = siswa.filter(
    (item) =>
      String(item.jenis_kelamin).toUpperCase() === "L" ||
      String(item.jenis_kelamin).toLowerCase() === "laki-laki"
  ).length;

  const jumlahPerempuan = siswa.filter(
    (item) =>
      String(item.jenis_kelamin).toUpperCase() === "P" ||
      String(item.jenis_kelamin).toLowerCase() === "perempuan"
  ).length;

  // =========================
  // FORMAT TANGGAL
  // =========================
  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    const date = new Date(tanggal);

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eef4ff 0%, #f8fafc 50%, #eef2ff 100%)",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#172033",
      }}
    >
      {/* =========================
          HEADER
      ========================= */}
      <header
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: "1500px",
            margin: "0 auto",
            padding: "18px 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "13px",
                background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "22px",
                fontWeight: "800",
                boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
              }}
            >
              S
            </div>

            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#111827",
                }}
              >
                Sistem Data Siswa
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "2px",
                }}
              >
                React JS • Vite • Supabase
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 13px",
              backgroundColor: "#ecfdf5",
              border: "1px solid #bbf7d0",
              borderRadius: "999px",
              color: "#15803d",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                backgroundColor: "#22c55e",
                borderRadius: "50%",
                display: "inline-block",
              }}
            />
            Supabase Connected
          </div>
        </div>
      </header>

      {/* =========================
          MAIN
      ========================= */}
      <main
        style={{
          maxWidth: "1500px",
          margin: "0 auto",
          padding: "35px 30px 50px",
        }}
      >
        {/* HERO */}
        <section
          style={{
            marginBottom: "28px",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#2563eb",
              fontSize: "13px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Dashboard
          </p>

          <h1
            style={{
              margin: "0",
              fontSize: "34px",
              lineHeight: "1.2",
              fontWeight: "800",
              color: "#111827",
            }}
          >
            Data Siswa
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Kelola dan lihat data siswa yang tersimpan pada database Supabase.
          </p>
        </section>

        {/* =========================
            STAT CARDS
        ========================= */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          {/* TOTAL */}
          <div style={statCardStyle}>
            <div
              style={{
                ...iconStyle,
                backgroundColor: "#eff6ff",
                color: "#2563eb",
              }}
            >
              👥
            </div>

            <div>
              <p style={statLabelStyle}>Total Siswa</p>

              <h2 style={statNumberStyle}>
                {loading ? "..." : jumlahSiswa}
              </h2>
            </div>
          </div>

          {/* LAKI-LAKI */}
          <div style={statCardStyle}>
            <div
              style={{
                ...iconStyle,
                backgroundColor: "#eef2ff",
                color: "#4f46e5",
              }}
            >
              👨
            </div>

            <div>
              <p style={statLabelStyle}>Laki-laki</p>

              <h2 style={statNumberStyle}>
                {loading ? "..." : jumlahLakiLaki}
              </h2>
            </div>
          </div>

          {/* PEREMPUAN */}
          <div style={statCardStyle}>
            <div
              style={{
                ...iconStyle,
                backgroundColor: "#fdf2f8",
                color: "#db2777",
              }}
            >
              👩
            </div>

            <div>
              <p style={statLabelStyle}>Perempuan</p>

              <h2 style={statNumberStyle}>
                {loading ? "..." : jumlahPerempuan}
              </h2>
            </div>
          </div>

          {/* STATUS */}
          <div style={statCardStyle}>
            <div
              style={{
                ...iconStyle,
                backgroundColor: "#ecfdf5",
                color: "#16a34a",
              }}
            >
              ✓
            </div>

            <div>
              <p style={statLabelStyle}>Status Database</p>

              <h2
                style={{
                  ...statNumberStyle,
                  fontSize: "20px",
                  color: "#16a34a",
                }}
              >
                {loading ? "Loading" : error ? "Error" : "Aktif"}
              </h2>
            </div>
          </div>
        </div>

        {/* =========================
            CONTENT CARD
        ========================= */}
        <section
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "18px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            overflow: "hidden",
          }}
        >
          {/* TABLE HEADER */}
          <div
            style={{
              padding: "22px 24px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: "0 0 5px",
                  fontSize: "19px",
                  fontWeight: "750",
                  color: "#111827",
                }}
              >
                Daftar Siswa
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                Menampilkan data dari tabel{" "}
                <strong style={{ color: "#334155" }}>siswa</strong>
              </p>
            </div>

            {/* SEARCH */}
            <div
              style={{
                position: "relative",
                width: "320px",
                maxWidth: "100%",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  fontSize: "16px",
                }}
              >
                🔍
              </span>

              <input
                type="text"
                placeholder="Cari nama, NIS, kelas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 14px 11px 42px",
                  border: "1px solid #dbe1ea",
                  borderRadius: "10px",
                  outline: "none",
                  fontSize: "13px",
                  color: "#1e293b",
                  backgroundColor: "#f8fafc",
                }}
              />
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div
              style={{
                padding: "70px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  border: "4px solid #dbeafe",
                  borderTop: "4px solid #2563eb",
                  borderRadius: "50%",
                  margin: "0 auto 18px",
                  animation: "spin 1s linear infinite",
                }}
              />

              <p
                style={{
                  margin: 0,
                  color: "#2563eb",
                  fontWeight: "700",
                  fontSize: "14px",
                }}
              >
                Sedang memuat data...
              </p>

              <p
                style={{
                  margin: "6px 0 0",
                  color: "#94a3b8",
                  fontSize: "12px",
                }}
              >
                Menghubungkan ke Supabase
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div
              style={{
                margin: "24px",
                padding: "20px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "12px",
                color: "#b91c1c",
              }}
            >
              <div
                style={{
                  fontWeight: "800",
                  marginBottom: "5px",
                }}
              >
                ⚠️ Gagal mengambil data
              </div>

              <div
                style={{
                  fontSize: "13px",
                }}
              >
                {error}
              </div>
            </div>
          )}

          {/* TABLE */}
          {!loading && !error && (
            <>
              <div
                style={{
                  overflowX: "auto",
                  width: "100%",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    minWidth: "1250px",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      <th style={thStyle}>ID</th>
                      <th style={thStyle}>NIS</th>
                      <th style={thStyle}>Nama</th>
                      <th style={thStyle}>Jenis Kelamin</th>
                      <th style={thStyle}>Tanggal Lahir</th>
                      <th style={thStyle}>Alamat</th>
                      <th style={thStyle}>Kelas</th>
                      <th style={thStyle}>Jurusan</th>
                      <th style={thStyle}>No. HP</th>
                      <th style={thStyle}>Email</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSiswa.length > 0 ? (
                      filteredSiswa.map((item, index) => (
                        <tr
                          key={item.id_siswa}
                          style={{
                            borderBottom:
                              "1px solid #f1f5f9",
                            backgroundColor:
                              index % 2 === 0
                                ? "#ffffff"
                                : "#fafbfc",
                          }}
                        >
                          <td style={tdStyle}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: "32px",
                                height: "28px",
                                padding: "0 8px",
                                borderRadius: "7px",
                                backgroundColor: "#eff6ff",
                                color: "#2563eb",
                                fontWeight: "700",
                                fontSize: "12px",
                              }}
                            >
                              {item.id_siswa}
                            </span>
                          </td>

                          <td style={tdStyle}>
                            <span
                              style={{
                                fontWeight: "600",
                                color: "#334155",
                              }}
                            >
                              {item.nis || "-"}
                            </span>
                          </td>

                          <td style={tdStyle}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "50%",
                                  background:
                                    "linear-gradient(135deg, #dbeafe, #e0e7ff)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#3730a3",
                                  fontWeight: "800",
                                  fontSize: "13px",
                                }}
                              >
                                {item.nama
                                  ? item.nama
                                      .charAt(0)
                                      .toUpperCase()
                                  : "?"}
                              </div>

                              <span
                                style={{
                                  fontWeight: "700",
                                  color: "#1e293b",
                                }}
                              >
                                {item.nama || "-"}
                              </span>
                            </div>
                          </td>

                          <td style={tdStyle}>
                            {item.jenis_kelamin === "L" ? (
                              <span style={genderMaleStyle}>
                                Laki-laki
                              </span>
                            ) : item.jenis_kelamin === "P" ? (
                              <span style={genderFemaleStyle}>
                                Perempuan
                              </span>
                            ) : (
                              item.jenis_kelamin || "-"
                            )}
                          </td>

                          <td style={tdStyle}>
                            {formatTanggal(item.tanggal_lahir)}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              maxWidth: "180px",
                              whiteSpace: "normal",
                            }}
                          >
                            {item.alamat || "-"}
                          </td>

                          <td style={tdStyle}>
                            <span
                              style={{
                                padding: "5px 9px",
                                borderRadius: "6px",
                                backgroundColor: "#f1f5f9",
                                color: "#475569",
                                fontSize: "12px",
                                fontWeight: "700",
                              }}
                            >
                              {item.kelas || "-"}
                            </span>
                          </td>

                          <td style={tdStyle}>
                            <span
                              style={{
                                color: "#4f46e5",
                                fontWeight: "700",
                              }}
                            >
                              {item.jurusan || "-"}
                            </span>
                          </td>

                          <td style={tdStyle}>
                            {item.no_hp || "-"}
                          </td>

                          <td style={tdStyle}>
                            <span
                              style={{
                                color: "#2563eb",
                              }}
                            >
                              {item.email || "-"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr key="empty-data">
                        <td
                          colSpan="10"
                          style={{
                            padding: "60px 20px",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "35px",
                              marginBottom: "12px",
                            }}
                          >
                            🔍
                          </div>

                          <div
                            style={{
                              fontWeight: "700",
                              color: "#334155",
                              marginBottom: "5px",
                            }}
                          >
                            Data tidak ditemukan
                          </div>

                          <div
                            style={{
                              fontSize: "13px",
                              color: "#94a3b8",
                            }}
                          >
                            Coba gunakan kata kunci pencarian lainnya.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* FOOTER TABLE */}
              <div
                style={{
                  padding: "17px 24px",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                  backgroundColor: "#fafbfc",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                  }}
                >
                  Menampilkan{" "}
                  <strong style={{ color: "#334155" }}>
                    {filteredSiswa.length}
                  </strong>{" "}
                  dari{" "}
                  <strong style={{ color: "#334155" }}>
                    {siswa.length}
                  </strong>{" "}
                  siswa
                </span>

                {search && (
                  <button
                    onClick={() => setSearch("")}
                    style={{
                      border: "none",
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      padding: "8px 13px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "700",
                      fontSize: "12px",
                    }}
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* =========================
          ANIMATION
      ========================= */}
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

// =========================
// STYLE
// =========================

const statCardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "20px",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
};

const iconStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
};

const statLabelStyle = {
  margin: "0 0 5px",
  fontSize: "12px",
  color: "#64748b",
  fontWeight: "600",
};

const statNumberStyle = {
  margin: 0,
  fontSize: "25px",
  fontWeight: "800",
  color: "#111827",
};

const thStyle = {
  padding: "15px 16px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: "800",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "14px 16px",
  fontSize: "13px",
  color: "#475569",
  whiteSpace: "nowrap",
  verticalAlign: "middle",
};

const genderMaleStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "7px",
  backgroundColor: "#eff6ff",
  color: "#2563eb",
  fontSize: "11px",
  fontWeight: "700",
};

const genderFemaleStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "7px",
  backgroundColor: "#fdf2f8",
  color: "#db2777",
  fontSize: "11px",
  fontWeight: "700",
};

export default App;