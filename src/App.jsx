import { useEffect, useMemo, useState } from "react";
import fotoDavid from "./assets/1.jpg";
import fotoRizal from "./assets/2.jpg";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

const initialSiswaForm = {
  nis: "",
  nama: "",
  jenis_kelamin: "",
  tanggal_lahir: "",
  alamat: "",
  kelas: "",
  jurusan: "",
  no_hp: "",
  email: "",
};

const initialPrestasiForm = {
  id_siswa: "",
  nama_prestasi: "",
  tingkat: "",
  tanggal: "",
  deskripsi: "",
};

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [siswa, setSiswa] = useState([]);
  const [prestasi, setPrestasi] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchSiswa, setSearchSiswa] = useState("");
  const [searchPrestasi, setSearchPrestasi] = useState("");

  const [showSiswaModal, setShowSiswaModal] = useState(false);
  const [editSiswaId, setEditSiswaId] = useState(null);
  const [siswaForm, setSiswaForm] = useState(initialSiswaForm);
  const [savingSiswa, setSavingSiswa] = useState(false);

  const [showPrestasiModal, setShowPrestasiModal] = useState(false);
  const [editPrestasiId, setEditPrestasiId] = useState(null);
  const [prestasiForm, setPrestasiForm] = useState(initialPrestasiForm);
  const [savingPrestasi, setSavingPrestasi] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [detailType, setDetailType] = useState(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);

  const developerList = [
    {
      id: 1,
      nama: "Maulana David Hidayat",
      kelas: "XII PPLG 01",
      foto: fotoDavid,
    },
    {
      id: 2,
      nama: "Moh. Rizal Anwar",
      kelas: "XII PPLG 01",
      foto: fotoRizal,
    },
  ];

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  const fetchSiswa = async () => {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/siswa?select=*&order=id_siswa.asc`,
      { method: "GET", headers },
    );
    if (!response.ok) throw new Error("Gagal mengambil data siswa");
    setSiswa(await response.json());
  };

  const fetchPrestasi = async () => {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/prestasi?select=*&order=id_prestasi.desc`,
      { method: "GET", headers },
    );
    if (!response.ok) throw new Error("Gagal mengambil data prestasi");
    setPrestasi(await response.json());
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        await Promise.all([fetchSiswa(), fetchPrestasi()]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchSiswa(), fetchPrestasi()]);
      showToast("Data berhasil diperbarui.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getNamaSiswa = (idSiswa) => {
    const found = siswa.find(
      (item) => Number(item.id_siswa) === Number(idSiswa),
    );
    return found ? found.nama : "Siswa tidak ditemukan";
  };

  const filteredSiswa = useMemo(() => {
    const keyword = searchSiswa.toLowerCase().trim();
    if (!keyword) return siswa;
    return siswa.filter((item) =>
      [item.nis, item.nama, item.kelas, item.jurusan].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword),
      ),
    );
  }, [siswa, searchSiswa]);

  const filteredPrestasi = useMemo(() => {
    const keyword = searchPrestasi.toLowerCase().trim();
    if (!keyword) return prestasi;
    return prestasi.filter((item) => {
      const foundSiswa = siswa.find(
        (s) => Number(s.id_siswa) === Number(item.id_siswa),
      );
      const namaSiswa = foundSiswa ? foundSiswa.nama : "";
      return [item.nama_prestasi, item.tingkat, namaSiswa].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword),
      );
    });
  }, [prestasi, searchPrestasi, siswa]);

  const updateSiswaForm = (field, value) => {
    setSiswaForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveSiswa = async () => {
    if (!siswaForm.nis || !siswaForm.nama || !siswaForm.kelas) {
      showToast("NIS, Nama, dan Kelas wajib diisi.", "error");
      return;
    }
    try {
      setSavingSiswa(true);
      const isEdit = Boolean(editSiswaId);
      const url = isEdit
        ? `${SUPABASE_URL}/rest/v1/siswa?id_siswa=eq.${editSiswaId}`
        : `${SUPABASE_URL}/rest/v1/siswa`;

      const payload = {
        nis: siswaForm.nis,
        nama: siswaForm.nama,
        kelas: siswaForm.kelas,
        jurusan: siswaForm.jurusan || null,
        jenis_kelamin: siswaForm.jenis_kelamin || null,
        tanggal_lahir: siswaForm.tanggal_lahir ? siswaForm.tanggal_lahir : null,
        alamat: siswaForm.alamat || null,
        no_hp: siswaForm.no_hp || null,
        email: siswaForm.email || null,
      };

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errDetail = await res.text();
        console.error("Supabase Error:", errDetail);
        throw new Error("Gagal menyimpan siswa ke database");
      }

      const savedData = await res.json();
      if (isEdit) {
        setSiswa(
          siswa.map((s) =>
            Number(s.id_siswa) === Number(editSiswaId)
              ? savedData[0] || { ...s, ...payload }
              : s,
          ),
        );
      } else {
        if (savedData && savedData[0]) {
          setSiswa([...siswa, savedData[0]]);
        } else {
          await fetchSiswa();
        }
      }

      setShowSiswaModal(false);
      setSiswaForm(initialSiswaForm);
      showToast("Data siswa berhasil disimpan.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingSiswa(false);
    }
  };

  const deleteSiswa = async (item) => {
    if (!window.confirm(`Hapus siswa "${item.nama}"?`)) return;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/siswa?id_siswa=eq.${item.id_siswa}`,
        { method: "DELETE", headers },
      );
      if (!res.ok) throw new Error("Gagal menghapus siswa");

      setSiswa(
        siswa.filter((s) => Number(s.id_siswa) !== Number(item.id_siswa)),
      );
      setPrestasi(
        prestasi.filter((p) => Number(p.id_siswa) !== Number(item.id_siswa)),
      );
      showToast("Siswa berhasil dihapus.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const updatePrestasiForm = (field, value) => {
    setPrestasiForm((prev) => ({ ...prev, [field]: value }));
  };

  const savePrestasi = async () => {
    if (!prestasiForm.id_siswa || !prestasiForm.nama_prestasi) {
      showToast("Siswa dan Nama Prestasi wajib diisi.", "error");
      return;
    }
    try {
      setSavingPrestasi(true);
      const isEdit = Boolean(editPrestasiId);
      const url = isEdit
        ? `${SUPABASE_URL}/rest/v1/prestasi?id_prestasi=eq.${editPrestasiId}`
        : `${SUPABASE_URL}/rest/v1/prestasi`;

      const payload = {
        id_siswa: Number(prestasiForm.id_siswa),
        nama_prestasi: prestasiForm.nama_prestasi,
        tingkat: prestasiForm.tingkat || null,
        tanggal: prestasiForm.tanggal ? prestasiForm.tanggal : null,
        deskripsi: prestasiForm.deskripsi || null,
      };

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal menyimpan prestasi");

      const savedData = await res.json();
      if (isEdit) {
        setPrestasi(
          prestasi.map((p) =>
            Number(p.id_prestasi) === Number(editPrestasiId)
              ? savedData[0] || { ...p, ...payload }
              : p,
          ),
        );
      } else {
        if (savedData && savedData[0]) {
          setPrestasi([savedData[0], ...prestasi]);
        } else {
          await fetchPrestasi();
        }
      }

      setShowPrestasiModal(false);
      setPrestasiForm(initialPrestasiForm);
      showToast("Prestasi berhasil disimpan.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSavingPrestasi(false);
    }
  };

  const deletePrestasi = async (item) => {
    if (!window.confirm(`Hapus prestasi "${item.nama_prestasi}"?`)) return;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/prestasi?id_prestasi=eq.${item.id_prestasi}`,
        { method: "DELETE", headers },
      );
      if (!res.ok) throw new Error("Gagal menghapus prestasi");

      setPrestasi(
        prestasi.filter(
          (p) => Number(p.id_prestasi) !== Number(item.id_prestasi),
        ),
      );
      showToast("Prestasi berhasil dihapus.");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const tingkatPrestasi = [
    "Sekolah",
    "Kecamatan",
    "Kabupaten",
    "Provinsi",
    "Nasional",
    "Internasional",
  ];

  // Helper ikon orang untuk menu/dashboard
  const renderSiswaIcon = (customStyle = {}) => (
    <div
      style={{
        ...styles.avatar,
        background: "#EEF2FF",
        color: "#4338ca",
        ...customStyle,
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </div>
  );

  // Helper ikon medali untuk menu/dashboard
  const renderPrestasiIcon = (customStyle = {}) => (
    <div
      style={{
        ...styles.avatar,
        background: "#FFFBEB",
        color: "#D97706",
        ...customStyle,
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    </div>
  );

  return (
    <div style={styles.desktopWrapper}>
      <style>
        {`
          * { box-sizing: border-box; }
          body { margin: 0; background: #f8fafc; font-family: 'Inter', sans-serif; color: #1e293b; }
          button, input, select, textarea { font-family: inherit; }
          button { cursor: pointer; transition: all 0.2s ease; }
          button:hover { filter: brightness(1.05); transform: translateY(-1px); }
          input[type="date"]::-webkit-calendar-picker-indicator {
            cursor: pointer;
            filter: invert(0.8);
          }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        `}
      </style>

      {/* SIDEBAR PUTIH BERSIH */}
      <div style={styles.sidebar}>
        <div
          style={{ padding: "0 8px 24px", borderBottom: "1px solid #e2e8f0" }}
        >
          <div style={styles.badgeContainer}>
            <span style={styles.badgeText}>SISTEM KATALOG PRESTASI</span>
          </div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: "900",
              color: "#0f172a",
              margin: "8px 0 0",
            }}
          >
            Admin Dashboard
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "20px 0",
            flex: 1,
          }}
        >
          <div
            style={{
              ...styles.sidebarItem,
              background: activeTab === "dashboard" ? "#EEF2FF" : "transparent",
              color: activeTab === "dashboard" ? "#4338ca" : "#64748b",
            }}
            onClick={() => setActiveTab("dashboard")}
          >
            <span style={{ fontSize: 16 }}>▦</span> Dashboard Utama
          </div>
          <div
            style={{
              ...styles.sidebarItem,
              background: activeTab === "siswa" ? "#EEF2FF" : "transparent",
              color: activeTab === "siswa" ? "#4338ca" : "#64748b",
            }}
            onClick={() => setActiveTab("siswa")}
          >
            <span style={{ fontSize: 16 }}>👥</span> Data Siswa
          </div>
          <div
            style={{
              ...styles.sidebarItem,
              background: activeTab === "prestasi" ? "#EEF2FF" : "transparent",
              color: activeTab === "prestasi" ? "#4338ca" : "#64748b",
            }}
            onClick={() => setActiveTab("prestasi")}
          >
            <span style={{ fontSize: 16 }}>🏆</span> Data Prestasi
          </div>
          <div
            style={{
              ...styles.sidebarItem,
              background: activeTab === "about" ? "#EEF2FF" : "transparent",
              color: activeTab === "about" ? "#4338ca" : "#64748b",
            }}
            onClick={() => setActiveTab("about")}
          >
            <span style={{ fontSize: 16 }}>👤</span> Tentang
          </div>
        </div>

        <div
          style={{
            padding: "16px 14px",
            background: "#f1f5f9",
            borderRadius: 14,
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: "900",
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            STATUS SISTEM
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 6,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 8px #22c55e",
              }}
            ></div>
            <span style={{ fontSize: 12, fontWeight: "800", color: "#0f172a" }}>
              Supabase Connected
            </span>
          </div>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <div style={styles.mainContent}>
        <div style={styles.topBar}>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: "900",
                color: "#0f172a",
                margin: 0,
              }}
            >
              {activeTab === "dashboard" && "Katalog Prestasi Siswa"}
              {activeTab === "siswa" && "Manajemen Data Siswa"}
              {activeTab === "prestasi" && "Manajemen Data Prestasi"}
              {activeTab === "about" && "Tentang"}
            </h1>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
              Kelola informasi akademik dan pencapaian dengan cepat dan efisien.
            </p>
          </div>
          <button onClick={handleRefresh} style={styles.refreshBtn}>
            ↻ Segarkan Data
          </button>
        </div>

        <div style={styles.pageBody}>
          {loading ? (
            <div style={styles.center}>
              <div style={styles.spinner}>⟳</div>
              <p
                style={{
                  color: "#64748b",
                  fontWeight: "700",
                  fontSize: 13,
                  marginTop: 12,
                }}
              >
                Memuat data dari server...
              </p>
            </div>
          ) : error ? (
            <div style={styles.center}>
              <p style={{ color: "#ef4444", fontWeight: "700" }}>{error}</p>
              <button onClick={handleRefresh} style={styles.retryBtn}>
                Coba Lagi
              </button>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <div>
                  <div style={styles.heroCard}>
                    <div>
                      <h2
                        style={{
                          fontSize: 24,
                          fontWeight: "900",
                          margin: "0 0 8px",
                        }}
                      >
                        Selamat Datang!
                      </h2>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#e0e7ff",
                          margin: 0,
                          maxWidth: 650,
                          lineHeight: 1.5,
                        }}
                      >
                        Pantau dan kelola pencapaian siswa SMKN 1 Kraksaan
                        dengan aplikasi Katalog Prestasi Siswa.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 24,
                      marginBottom: 32,
                    }}
                  >
                    <div
                      style={styles.statCard}
                      onClick={() => setActiveTab("siswa")}
                    >
                      {renderSiswaIcon(styles.statIconWrap)}
                      <div>
                        <div style={styles.statValue}>{siswa.length}</div>
                        <div style={styles.statLabel}>Total Data Siswa</div>
                      </div>
                    </div>
                    <div
                      style={styles.statCard}
                      onClick={() => setActiveTab("prestasi")}
                    >
                      {renderPrestasiIcon(styles.statIconWrap)}
                      <div>
                        <div style={styles.statValue}>{prestasi.length}</div>
                        <div style={styles.statLabel}>Total Prestasi</div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: "900",
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Aktivitas Prestasi Terbaru
                    </h3>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: "800",
                        color: "#4338ca",
                        cursor: "pointer",
                      }}
                      onClick={() => setActiveTab("prestasi")}
                    >
                      Lihat Semua →
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(350px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {prestasi.slice(0, 6).map((p) => (
                      <div key={p.id_prestasi} style={styles.tableCard}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            {renderPrestasiIcon()}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 14,
                                  fontWeight: "900",
                                  color: "#1e293b",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {p.nama_prestasi}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#64748b",
                                  marginTop: 2,
                                }}
                              >
                                {getNamaSiswa(p.id_siswa)} • {p.tingkat}
                              </div>
                            </div>
                          </div>
                          <button
                            style={styles.tableBtnDetail}
                            onClick={() => {
                              setSelectedItem(p);
                              setDetailType("prestasi");
                            }}
                          >
                            👁 Detail
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "siswa" && (
                <div>
                  <div style={styles.toolbar}>
                    <input
                      style={styles.searchBox}
                      placeholder="Cari nama siswa atau NIS..."
                      value={searchSiswa}
                      onChange={(e) => setSearchSiswa(e.target.value)}
                    />
                    <button
                      style={styles.addButton}
                      onClick={() => {
                        setSiswaForm(initialSiswaForm);
                        setEditSiswaId(null);
                        setShowSiswaModal(true);
                      }}
                    >
                      + Tambah Data Siswa
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: 18,
                    }}
                  >
                    {filteredSiswa.map((item) => (
                      <div key={item.id_siswa} style={styles.tableCard}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                          }}
                        >
                          <div style={styles.avatar}>
                            <span>{item.nama?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 15,
                                fontWeight: "900",
                                color: "#0f172a",
                              }}
                            >
                              {item.nama}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#475569",
                                fontWeight: "700",
                                marginTop: 3,
                              }}
                            >
                              NIS: {item.nis} | Kelas: {item.kelas}
                            </div>
                          </div>
                        </div>
                        <div style={styles.cardActions}>
                          <span
                            style={styles.btnDetail}
                            onClick={() => {
                              setSelectedItem(item);
                              setDetailType("siswa");
                            }}
                          >
                            👁 Detail
                          </span>
                          <span
                            style={styles.btnEdit}
                            onClick={() => {
                              setEditSiswaId(item.id_siswa);
                              setSiswaForm({
                                ...item,
                                tanggal_lahir: formatDateForInput(
                                  item.tanggal_lahir,
                                ),
                              });
                              setShowSiswaModal(true);
                            }}
                          >
                            ✏ Edit
                          </span>
                          <span
                            style={styles.btnDelete}
                            onClick={() => deleteSiswa(item)}
                          >
                            🗑 Hapus
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "prestasi" && (
                <div>
                  <div style={styles.toolbar}>
                    <input
                      style={styles.searchBox}
                      placeholder="Cari prestasi atau nama siswa..."
                      value={searchPrestasi}
                      onChange={(e) => setSearchPrestasi(e.target.value)}
                    />
                    <button
                      style={styles.addButton}
                      onClick={() => {
                        setPrestasiForm(initialPrestasiForm);
                        setEditPrestasiId(null);
                        setShowPrestasiModal(true);
                      }}
                    >
                      + Catat Prestasi Baru
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: 18,
                    }}
                  >
                    {filteredPrestasi.map((item) => (
                      <div key={item.id_prestasi} style={styles.tableCard}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                          }}
                        >
                          {renderPrestasiIcon()}
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 15,
                                fontWeight: "900",
                                color: "#0f172a",
                              }}
                            >
                              {item.nama_prestasi}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#4338ca",
                                fontWeight: "800",
                                marginTop: 3,
                              }}
                            >
                              {getNamaSiswa(item.id_siswa)} ({item.tingkat})
                            </div>
                          </div>
                        </div>
                        <div style={styles.cardActions}>
                          <span
                            style={styles.btnDetail}
                            onClick={() => {
                              setSelectedItem(item);
                              setDetailType("prestasi");
                            }}
                          >
                            👁 Detail
                          </span>
                          <span
                            style={styles.btnEdit}
                            onClick={() => {
                              setEditPrestasiId(item.id_prestasi);
                              setPrestasiForm({
                                id_siswa: String(item.id_siswa),
                                nama_prestasi: item.nama_prestasi,
                                tingkat: item.tingkat,
                                tanggal: formatDateForInput(item.tanggal),
                                deskripsi: item.deskripsi,
                              });
                              setShowPrestasiModal(true);
                            }}
                          >
                            ✏ Edit
                          </span>
                          <span
                            style={styles.btnDelete}
                            onClick={() => deletePrestasi(item)}
                          >
                            🗑 Hapus
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "about" && (
                <div>
                  <div style={styles.heroCard}>
                    <div>
                      <h2
                        style={{
                          fontSize: 24,
                          fontWeight: "900",
                          margin: "0 0 8px",
                        }}
                      >
                        Tentang
                      </h2>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#e0e7ff",
                          margin: 0,
                          maxWidth: 650,
                        }}
                      >
                        Aplikasi Katalog Prestasi Siswa ini dikembangkan untuk
                        mencatat siswa yang berprestasi.
                      </p>
                    </div>
                  </div>

                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: "900",
                      color: "#0f172a",
                      marginBottom: 16,
                    }}
                  >
                    Daftar Anggota Tim 👤
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 20,
                    }}
                  >
                    {developerList.map((dev) => (
                      <div key={dev.id} style={styles.tableCard}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                          }}
                        >
                          <img
                            src={dev.foto}
                            alt=""
                            style={{
                              width: 68,
                              height: 68,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid #4338ca",
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: 16,
                                fontWeight: "900",
                                color: "#0f172a",
                              }}
                            >
                              {dev.nama}
                            </div>
                            <div
                              style={{
                                display: "inline-block",
                                background: "#EEF2FF",
                                color: "#4338ca",
                                padding: "3px 12px",
                                borderRadius: 8,
                                fontSize: 11,
                                fontWeight: "800",
                                marginTop: 6,
                              }}
                            >
                              {dev.kelas}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            marginTop: 16,
                            textAlign: "right",
                            borderTop: "1px solid #f1f5f9",
                            paddingTop: 12,
                          }}
                        >
                          <span
                            style={styles.btnDetail}
                            onClick={() => setSelectedDeveloper(dev)}
                          >
                            👁 Lihat Detail Profil
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT SISWA */}
      {showSiswaModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: "900",
                  color: "#0f172a",
                }}
              >
                {editSiswaId ? "Edit Data Siswa" : "Tambah Data Siswa"}
              </h3>
              <button
                style={styles.closeModalBtn}
                onClick={() => setShowSiswaModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div>
                <label style={styles.inputLabel}>NIS *</label>
                <input
                  style={styles.inputField}
                  placeholder="Contoh: 123456"
                  value={siswaForm.nis}
                  onChange={(e) => updateSiswaForm("nis", e.target.value)}
                />
              </div>
              <div>
                <label style={styles.inputLabel}>Nama Lengkap *</label>
                <input
                  style={styles.inputField}
                  placeholder="Masukkan nama"
                  value={siswaForm.nama}
                  onChange={(e) => updateSiswaForm("nama", e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.inputLabel}>Kelas *</label>
                  <input
                    style={styles.inputField}
                    placeholder="XII RPL 1"
                    value={siswaForm.kelas}
                    onChange={(e) => updateSiswaForm("kelas", e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.inputLabel}>Jurusan</label>
                  <input
                    style={styles.inputField}
                    placeholder="PPLG"
                    value={siswaForm.jurusan}
                    onChange={(e) => updateSiswaForm("jurusan", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label style={styles.inputLabel}>Jenis Kelamin</label>
                <select
                  style={styles.inputField}
                  value={siswaForm.jenis_kelamin}
                  onChange={(e) =>
                    updateSiswaForm("jenis_kelamin", e.target.value)
                  }
                >
                  <option value="">Pilih...</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label style={styles.inputLabel}>Tanggal Lahir</label>
                <input
                  type="date"
                  style={styles.inputField}
                  value={siswaForm.tanggal_lahir}
                  onChange={(e) =>
                    updateSiswaForm("tanggal_lahir", e.target.value)
                  }
                />
              </div>
              <div>
                <label style={styles.inputLabel}>Alamat</label>
                <input
                  style={styles.inputField}
                  placeholder="Alamat lengkap"
                  value={siswaForm.alamat}
                  onChange={(e) => updateSiswaForm("alamat", e.target.value)}
                />
              </div>
              <div>
                <label style={styles.inputLabel}>No HP</label>
                <input
                  style={styles.inputField}
                  placeholder="08xxxxxxxx"
                  value={siswaForm.no_hp}
                  onChange={(e) => updateSiswaForm("no_hp", e.target.value)}
                />
              </div>
              <div>
                <label style={styles.inputLabel}>Email</label>
                <input
                  style={styles.inputField}
                  placeholder="email@contoh.com"
                  value={siswaForm.email}
                  onChange={(e) => updateSiswaForm("email", e.target.value)}
                />
              </div>
            </div>

            <button
              style={styles.submitModalBtn}
              onClick={saveSiswa}
              disabled={savingSiswa}
            >
              {savingSiswa ? "Menyimpan..." : "Simpan Data Siswa"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT PRESTASI */}
      {showPrestasiModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: "900",
                  color: "#0f172a",
                }}
              >
                {editPrestasiId ? "Edit Data Prestasi" : "Catat Prestasi Baru"}
              </h3>
              <button
                style={styles.closeModalBtn}
                onClick={() => setShowPrestasiModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div>
                <label style={styles.inputLabel}>Nama Siswa *</label>
                <select
                  style={styles.inputField}
                  value={prestasiForm.id_siswa}
                  onChange={(e) =>
                    updatePrestasiForm("id_siswa", e.target.value)
                  }
                >
                  <option value="">Pilih siswa...</option>
                  {siswa.map((s) => (
                    <option key={s.id_siswa} value={s.id_siswa}>
                      {s.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={styles.inputLabel}>Nama Prestasi *</label>
                <input
                  style={styles.inputField}
                  placeholder="Juara 1 Lomba..."
                  value={prestasiForm.nama_prestasi}
                  onChange={(e) =>
                    updatePrestasiForm("nama_prestasi", e.target.value)
                  }
                />
              </div>
              <div>
                <label style={styles.inputLabel}>Tingkat</label>
                <select
                  style={styles.inputField}
                  value={prestasiForm.tingkat}
                  onChange={(e) =>
                    updatePrestasiForm("tingkat", e.target.value)
                  }
                >
                  <option value="">Pilih tingkat...</option>
                  {tingkatPrestasi.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={styles.inputLabel}>Tanggal</label>
                <input
                  type="date"
                  style={styles.inputField}
                  value={prestasiForm.tanggal}
                  onChange={(e) =>
                    updatePrestasiForm("tanggal", e.target.value)
                  }
                />
              </div>
              <div>
                <label style={styles.inputLabel}>Deskripsi Singkat</label>
                <textarea
                  style={{ ...styles.inputField, height: 80 }}
                  placeholder="Deskripsi..."
                  value={prestasiForm.deskripsi}
                  onChange={(e) =>
                    updatePrestasiForm("deskripsi", e.target.value)
                  }
                />
              </div>
            </div>

            <button
              style={styles.submitModalBtn}
              onClick={savePrestasi}
              disabled={savingPrestasi}
            >
              {savingPrestasi ? "Menyimpan..." : "Simpan Prestasi"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETAIL SISWA / PRESTASI */}
      {selectedItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: "900",
                  color: "#0f172a",
                }}
              >
                {detailType === "siswa" ? "Detail Siswa" : "Detail Prestasi"}
              </h3>
              <button
                style={styles.closeModalBtn}
                onClick={() => setSelectedItem(null)}
              >
                ✕
              </button>
            </div>

            <div style={styles.detailCardTop}>
              {detailType === "siswa" ? (
                <>
                  <div style={styles.detailBigAvatar}>
                    <span
                      style={{
                        fontSize: 26,
                        fontWeight: "900",
                        color: "#4338ca",
                      }}
                    >
                      {selectedItem.nama?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: "900",
                      color: "#0f172a",
                      marginTop: 8,
                    }}
                  >
                    {selectedItem.nama}
                  </div>
                  <div style={styles.detailBadge}>NIS {selectedItem.nis}</div>
                </>
              ) : (
                <>
                  {renderPrestasiIcon({
                    width: 60,
                    height: 60,
                    borderRadius: 18,
                  })}
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: "900",
                      color: "#0f172a",
                      marginTop: 8,
                      textAlign: "center",
                    }}
                  >
                    {selectedItem.nama_prestasi}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#4338ca",
                      fontWeight: "800",
                      marginTop: 4,
                    }}
                  >
                    {getNamaSiswa(selectedItem.id_siswa)}
                  </div>
                </>
              )}
            </div>

            {detailType === "siswa" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  maxHeight: "50vh",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{ fontSize: 12, fontWeight: "900", color: "#0f172a" }}
                >
                  Informasi Pribadi
                </div>
                <div style={styles.infoRow}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    Nama Lengkap
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: "#1e293b",
                    }}
                  >
                    {selectedItem.nama}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    NIS
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: "#1e293b",
                    }}
                  >
                    {selectedItem.nis}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    Kelas / Jurusan
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: "#1e293b",
                    }}
                  >
                    {selectedItem.kelas} - {selectedItem.jurusan || "-"}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    Jenis Kelamin
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: "#1e293b",
                    }}
                  >
                    {selectedItem.jenis_kelamin || "-"}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    Tanggal Lahir
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: "#1e293b",
                    }}
                  >
                    {selectedItem.tanggal_lahir || "-"}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    Alamat
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: "#1e293b",
                    }}
                  >
                    {selectedItem.alamat || "-"}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    Kontak (HP / Email)
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: "#1e293b",
                    }}
                  >
                    {selectedItem.no_hp || "-"} / {selectedItem.email || "-"}
                  </span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  maxHeight: "50vh",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{ fontSize: 12, fontWeight: "900", color: "#0f172a" }}
                >
                  Informasi Prestasi
                </div>
                <div style={styles.infoRow}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    Nama Prestasi
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: "#1e293b",
                    }}
                  >
                    {selectedItem.nama_prestasi}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    Peraih Prestasi
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: "#1e293b",
                    }}
                  >
                    {getNamaSiswa(selectedItem.id_siswa)}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    Tingkat
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: "#1e293b",
                    }}
                  >
                    {selectedItem.tingkat}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    Tanggal
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: "900",
                      color: "#1e293b",
                    }}
                  >
                    {selectedItem.tanggal}
                  </span>
                </div>
                <div style={styles.infoRowCol}>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      fontWeight: "700",
                      marginBottom: 4,
                    }}
                  >
                    Deskripsi
                  </span>
                  <span
                    style={{ fontSize: 12, color: "#334155", lineHeight: 1.5 }}
                  >
                    {selectedItem.deskripsi ||
                      "Tidak ada deskripsi untuk prestasi ini."}
                  </span>
                </div>
              </div>
            )}

            <button
              style={styles.submitModalBtn}
              onClick={() => setSelectedItem(null)}
            >
              ✕ Tutup Detail
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETAIL DEVELOPER */}
      {selectedDeveloper && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: "900",
                  color: "#0f172a",
                }}
              >
                Profil Pengembang
              </h3>
              <button
                style={styles.closeModalBtn}
                onClick={() => setSelectedDeveloper(null)}
              >
                ✕
              </button>
            </div>
            <div style={styles.detailCardTop}>
              <img
                src={selectedDeveloper.foto}
                alt=""
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: 8,
                  border: "2px solid #4338ca",
                }}
              />
              <div
                style={{ fontSize: 17, fontWeight: "900", color: "#0f172a" }}
              >
                {selectedDeveloper.nama}
              </div>
              <div style={styles.detailBadge}>{selectedDeveloper.kelas}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={styles.infoRow}>
                <span
                  style={{ fontSize: 11, color: "#64748b", fontWeight: "700" }}
                >
                  Nama Lengkap
                </span>
                <span
                  style={{ fontSize: 12, fontWeight: "900", color: "#1e293b" }}
                >
                  {selectedDeveloper.nama}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span
                  style={{ fontSize: 11, color: "#64748b", fontWeight: "700" }}
                >
                  Kelas
                </span>
                <span
                  style={{ fontSize: 12, fontWeight: "900", color: "#1e293b" }}
                >
                  {selectedDeveloper.kelas}
                </span>
              </div>
            </div>
            <button
              style={styles.submitModalBtn}
              onClick={() => setSelectedDeveloper(null)}
            >
              Tutup Profil
            </button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div
          style={{
            ...styles.toast,
            background: toast.type === "error" ? "#dc2626" : "#16a34a",
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

const styles = {
  desktopWrapper: {
    minHeight: "100vh",
    display: "flex",
    background: "#f8fafc",
  },
  sidebar: {
    width: 280,
    background: "#ffffff",
    borderRight: "1px solid #e2e8f0",
    padding: "28px 20px",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  badgeContainer: {
    alignSelf: "flex-start",
    background: "#EEF2FF",
    padding: "4px 8px",
    borderRadius: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#4338ca",
    letterSpacing: 1,
  },
  sidebarItem: {
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: "800",
    fontSize: 13,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 12,
    transition: "all 0.2s",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
  },
  topBar: {
    padding: "20px 32px",
    background: "#fff",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
  },
  refreshBtn: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    padding: "10px 18px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
  },
  pageBody: { flex: 1, overflowY: "auto", padding: "32px" },
  center: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: { fontSize: 26, fontWeight: "900", color: "#4338ca" },
  retryBtn: {
    border: "none",
    background: "#4338ca",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: 10,
    marginTop: 12,
    fontWeight: "800",
  },
  heroCard: {
    background: "linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)",
    borderRadius: 20,
    padding: 28,
    color: "#fff",
    marginBottom: 24,
    boxShadow: "0 10px 25px -5px rgba(67, 56, 202, 0.2)",
  },
  statCard: {
    flex: 1,
    background: "#fff",
    padding: 22,
    borderRadius: 18,
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: 18,
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
  },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statValue: { fontSize: 26, fontWeight: "900", color: "#0f172a" },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "700",
    marginTop: 2,
  },
  tableCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 18,
    border: "1px solid #e2e8f0",
    marginBottom: 14,
    boxShadow: "0 2px 4px rgba(0,0,0,0.01)",
  },
  tableBtnDetail: {
    background: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #bbf7d0",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: "800",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: "#EEF2FF",
    color: "#4338ca",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "900",
    fontSize: 18,
    flexShrink: 0,
  },
  cardActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 14,
    borderTop: "1px solid #f1f5f9",
    paddingTop: 10,
  },
  btnDetail: {
    color: "#0f766e",
    fontSize: 12,
    fontWeight: "800",
    cursor: "pointer",
  },
  btnEdit: {
    color: "#4338ca",
    fontSize: 12,
    fontWeight: "800",
    cursor: "pointer",
  },
  btnDelete: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "800",
    cursor: "pointer",
  },
  toolbar: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
    alignItems: "center",
    width: "100%",
  },
  searchBox: {
    flex: 1,
    background: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: "0 16px",
    height: 46,
    fontSize: 13,
    outline: "none",
  },
  addButton: {
    background: "#4338ca",
    color: "#fff",
    border: "none",
    padding: "0 24px",
    height: 46,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: "900",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 100,
  },
  modalContent: {
    background: "#fff",
    width: "100%",
    maxWidth: 460,
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },
  modalBody: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingRight: 4,
    margin: "12px 0",
  },
  closeModalBtn: {
    border: "none",
    background: "#f1f5f9",
    width: 32,
    height: 32,
    borderRadius: 10,
    fontWeight: "900",
    color: "#64748b",
  },
  detailCardTop: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 18,
    flexShrink: 0,
  },
  detailBigAvatar: {
    width: 60,
    height: 60,
    borderRadius: 18,
    background: "#EEF2FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  detailBadge: {
    background: "#EEF2FF",
    color: "#4338ca",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 8,
  },
  inputLabel: {
    display: "block",
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  inputField: {
    width: "100%",
    background: "#f8fafc",
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: "11px 14px",
    fontSize: 13,
    outline: "none",
    color: "#0f172a",
  },
  submitModalBtn: {
    width: "100%",
    marginTop: 12,
    background: "#4338ca",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "13px",
    fontSize: 13,
    fontWeight: "900",
    flexShrink: 0,
  },
  infoRow: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "11px 14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoRowCol: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "11px 14px",
    display: "flex",
    flexDirection: "column",
  },
  toast: {
    position: "fixed",
    bottom: 24,
    right: 24,
    color: "#fff",
    padding: "14px 22px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: "800",
    zIndex: 200,
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.2)",
  },
};

export default App;
