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
  // =========================================================
  // SUPABASE CONFIG
  // =========================================================

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY =
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  // =========================================================
  // STATE
  // =========================================================

  const [siswa, setSiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search
  const [search, setSearch] = useState("");

  // Modal POST
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState("");

  // Modal PATCH
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // =========================================================
  // FORM TAMBAH
  // =========================================================

  const emptyForm = {
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

  const [form, setForm] = useState(emptyForm);

  // =========================================================
  // FORM EDIT
  // =========================================================

  const [editForm, setEditForm] = useState(emptyForm);

  // =========================================================
  // GET - AMBIL DATA PERTAMA KALI
  //
  // Sengaja fetch langsung di dalam useEffect supaya tidak
  // terkena warning react-hooks/set-state-in-effect.
  // =========================================================

  useEffect(() => {
    let active = true;

    const getData = async () => {
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
          const errorData = await response.json().catch(() => null);

          throw new Error(
            errorData?.message ||
              `Gagal mengambil data. Status: ${response.status}`
          );
        }

        const data = await response.json();

        if (active) {
          setSiswa(data);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    getData();

    return () => {
      active = false;
    };
  }, [SUPABASE_URL, SUPABASE_ANON_KEY]);

  // =========================================================
  // GET - REFRESH DATA
  //
  // Fungsi ini dipanggil setelah POST, PATCH, DELETE.
  // Tidak dipanggil langsung dari useEffect.
  // =========================================================

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
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            `Gagal mengambil data. Status: ${response.status}`
        );
      }

      const data = await response.json();

      setSiswa(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  // =========================================================
  // UPDATE FORM TAMBAH
  // =========================================================

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =========================================================
  // UPDATE FORM EDIT
  // =========================================================

  const updateEditForm = (field, value) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =========================================================
  // RESET FORM TAMBAH
  // =========================================================

  const resetForm = () => {
    setForm(emptyForm);
    setAddError("");
  };

  // =========================================================
  // RESET FORM EDIT
  // =========================================================

  const resetEditForm = () => {
    setEditForm(emptyForm);
    setEditError("");
    setEditingId(null);
  };

  // =========================================================
  // POST - TAMBAH DATA SISWA
  // =========================================================

  const handleAdd = async (event) => {
    event.preventDefault();

    setSaving(true);
    setAddError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/siswa`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            `Gagal menambahkan data. Status: ${response.status}`
        );
      }

      // Ambil ulang data setelah POST berhasil
      await fetchSiswa();

      resetForm();
      setShowAddModal(false);

      setSuccess("Data siswa berhasil ditambahkan.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setAddError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // BUKA MODAL EDIT
  // =========================================================

  const handleOpenEdit = (item) => {
    setEditingId(item.id_siswa);

    setEditForm({
      nis: item.nis || "",
      nama: item.nama || "",
      jenis_kelamin: item.jenis_kelamin || "",
      tanggal_lahir: item.tanggal_lahir || "",
      alamat: item.alamat || "",
      kelas: item.kelas || "",
      jurusan: item.jurusan || "",
      no_hp: item.no_hp || "",
      email: item.email || "",
    });

    setEditError("");
    setShowEditModal(true);
  };

  // =========================================================
  // PATCH - UPDATE DATA SISWA
  // =========================================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingId) {
      setEditError("ID siswa tidak ditemukan.");
      return;
    }

    setUpdating(true);
    setEditError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/siswa?id_siswa=eq.${editingId}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            `Gagal mengupdate data. Status: ${response.status}`
        );
      }

      // Ambil ulang data setelah PATCH berhasil
      await fetchSiswa();

      setShowEditModal(false);
      resetEditForm();

      setSuccess("Data siswa berhasil diperbarui.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // =========================================================
  // DELETE - HAPUS DATA SISWA
  // =========================================================

  const handleDelete = async (id, nama) => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus data "${nama}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/siswa?id_siswa=eq.${id}`,
        {
          method: "DELETE",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            `Gagal menghapus data. Status: ${response.status}`
        );
      }

      // Ambil ulang data setelah DELETE berhasil
      await fetchSiswa();

      setSuccess(`Data "${nama}" berhasil dihapus.`);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredSiswa = siswa.filter((item) => {
    const keyword = search.toLowerCase().trim();

    return (
      String(item.id_siswa || "")
        .toLowerCase()
        .includes(keyword) ||
      String(item.nis || "")
        .toLowerCase()
        .includes(keyword) ||
      String(item.nama || "")
        .toLowerCase()
        .includes(keyword) ||
      String(item.kelas || "")
        .toLowerCase()
        .includes(keyword) ||
      String(item.jurusan || "")
        .toLowerCase()
        .includes(keyword) ||
      String(item.alamat || "")
        .toLowerCase()
        .includes(keyword) ||
      String(item.email || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  // =========================================================
  // STATISTIK
  // =========================================================

  const jumlahLakiLaki = siswa.filter(
    (item) =>
      String(item.jenis_kelamin || "").toUpperCase() === "L"
  ).length;

  const jumlahPerempuan = siswa.filter(
    (item) =>
      String(item.jenis_kelamin || "").toUpperCase() === "P"
  ).length;

  // =========================================================
  // FORMAT TANGGAL
  // =========================================================

  const formatTanggal = (tanggal) => {
    if (!tanggal) {
      return "-";
    }

    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div style={styles.page}>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header style={styles.header}>
        <div style={styles.headerInner}>

          <div style={styles.brand}>
            <div style={styles.logo}>
              S
            </div>

            <div>
              <div style={styles.brandTitle}>
                Sistem Data Siswa
              </div>

              <div style={styles.brandSubtitle}>
                React JS • Vite • Supabase
              </div>
            </div>
          </div>

          <div style={styles.connection}>
            <span style={styles.connectionDot}></span>
            Supabase Connected
          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main style={styles.main}>

        {/* HERO */}

        <section style={styles.hero}>

          <div>
            <div style={styles.eyebrow}>
              DASHBOARD
            </div>

            <h1 style={styles.title}>
              Data Siswa
            </h1>

            <p style={styles.description}>
              Kelola data siswa menggunakan React JS
              dan Supabase REST API.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            style={styles.addButton}
          >
            + Tambah Siswa
          </button>

        </section>

        {/* SUCCESS */}

        {success && (
          <div style={styles.success}>
            ✓ {success}
          </div>
        )}

        {/* =====================================================
            STATISTIK
        ===================================================== */}

        <div style={styles.statsGrid}>

          <StatCard
            icon="👥"
            title="Total Siswa"
            value={loading ? "..." : siswa.length}
          />

          <StatCard
            icon="👨"
            title="Laki-laki"
            value={loading ? "..." : jumlahLakiLaki}
          />

          <StatCard
            icon="👩"
            title="Perempuan"
            value={loading ? "..." : jumlahPerempuan}
          />

          <StatCard
            icon="✓"
            title="Status Database"
            value={loading ? "..." : "Aktif"}
          />

        </div>

        {/* =====================================================
            TABLE CARD
        ===================================================== */}

        <section style={styles.tableCard}>

          {/* TABLE HEADER */}

          <div style={styles.tableHeader}>

            <div>
              <h2 style={styles.tableTitle}>
                Daftar Siswa
              </h2>

              <p style={styles.tableSubtitle}>
                Data dari tabel{" "}
                <strong>siswa</strong>
              </p>
            </div>

            <div style={styles.searchBox}>

              <span style={styles.searchIcon}>
                🔍
              </span>

              <input
                type="text"
                placeholder="Cari nama, NIS, kelas..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                style={styles.searchInput}
              />

            </div>

          </div>

          {/* LOADING */}

          {loading && (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>

              <p>
                Sedang memuat data...
              </p>
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div style={styles.error}>
              <strong>
                ⚠️ Gagal mengambil data
              </strong>

              <p style={{ marginBottom: 0 }}>
                {error}
              </p>

              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  await fetchSiswa();
                  setLoading(false);
                }}
                style={styles.retryButton}
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* TABLE */}

          {!loading && !error && (
            <>
              <div style={styles.tableWrapper}>

                <table style={styles.table}>

                  <thead>
                    <tr style={styles.theadRow}>

                      <th style={styles.th}>
                        ID
                      </th>

                      <th style={styles.th}>
                        NIS
                      </th>

                      <th style={styles.th}>
                        Nama
                      </th>

                      <th style={styles.th}>
                        Jenis Kelamin
                      </th>

                      <th style={styles.th}>
                        Tanggal Lahir
                      </th>

                      <th style={styles.th}>
                        Alamat
                      </th>

                      <th style={styles.th}>
                        Kelas
                      </th>

                      <th style={styles.th}>
                        Jurusan
                      </th>

                      <th style={styles.th}>
                        No. HP
                      </th>

                      <th style={styles.th}>
                        Email
                      </th>

                      <th style={styles.th}>
                        Aksi
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredSiswa.length > 0 ? (
                      filteredSiswa.map((item, index) => (
                        <tr
                          key={item.id_siswa}
                          style={{
                            ...styles.tr,
                            backgroundColor:
                              index % 2 === 0
                                ? "#ffffff"
                                : "#fafbff",
                          }}
                        >

                          <td style={styles.td}>
                            <span style={styles.idBadge}>
                              {item.id_siswa}
                            </span>
                          </td>

                          <td style={styles.td}>
                            <strong>
                              {item.nis || "-"}
                            </strong>
                          </td>

                          <td style={styles.td}>
                            <div style={styles.nameCell}>

                              <div style={styles.avatar}>
                                {item.nama
                                  ? item.nama
                                      .charAt(0)
                                      .toUpperCase()
                                  : "?"}
                              </div>

                              <strong>
                                {item.nama || "-"}
                              </strong>

                            </div>
                          </td>

                          <td style={styles.td}>

                            {item.jenis_kelamin === "L" ? (
                              <span style={styles.maleBadge}>
                                Laki-laki
                              </span>
                            ) : item.jenis_kelamin === "P" ? (
                              <span style={styles.femaleBadge}>
                                Perempuan
                              </span>
                            ) : (
                              item.jenis_kelamin || "-"
                            )}

                          </td>

                          <td style={styles.td}>
                            {formatTanggal(
                              item.tanggal_lahir
                            )}
                          </td>

                          <td
                            style={{
                              ...styles.td,
                              maxWidth: "200px",
                              whiteSpace: "normal",
                            }}
                          >
                            {item.alamat || "-"}
                          </td>

                          <td style={styles.td}>
                            <span style={styles.classBadge}>
                              {item.kelas || "-"}
                            </span>
                          </td>

                          <td style={styles.td}>
                            <strong
                              style={{
                                color: "#4f46e5",
                              }}
                            >
                              {item.jurusan || "-"}
                            </strong>
                          </td>

                          <td style={styles.td}>
                            {item.no_hp || "-"}
                          </td>

                          <td style={styles.td}>
                            <span
                              style={{
                                color: "#2563eb",
                              }}
                            >
                              {item.email || "-"}
                            </span>
                          </td>

                          {/* AKSI */}

                          <td style={styles.td}>

                            <div style={styles.actionGroup}>

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenEdit(item)
                                }
                                style={styles.editButton}
                              >
                                ✏️ Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    item.id_siswa,
                                    item.nama
                                  )
                                }
                                style={styles.deleteButton}
                              >
                                🗑️ Hapus
                              </button>

                            </div>

                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr key="empty-data">
                        <td
                          colSpan="11"
                          style={styles.empty}
                        >
                          <div
                            style={{
                              fontSize: "40px",
                              marginBottom: "10px",
                            }}
                          >
                            🔍
                          </div>

                          <strong>
                            Data tidak ditemukan
                          </strong>

                          <p>
                            Coba gunakan kata pencarian
                            lainnya.
                          </p>
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>

              </div>

              <div style={styles.footer}>
                Menampilkan{" "}
                <strong>
                  {filteredSiswa.length}
                </strong>{" "}
                dari{" "}
                <strong>{siswa.length}</strong>{" "}
                siswa
              </div>
            </>
          )}

        </section>

      </main>

      {/* =====================================================
          MODAL POST
      ===================================================== */}

      {showAddModal && (
        <div style={styles.overlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>
                <h2 style={styles.modalTitle}>
                  Tambah Data Siswa
                </h2>

                <p style={styles.modalSubtitle}>
                  Masukkan data siswa baru.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                style={styles.closeButton}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleAdd}>

              <div style={styles.formGrid}>

                <FormInput
                  label="NIS"
                  value={form.nis}
                  placeholder="Contoh: 2026001"
                  onChange={(event) =>
                    updateForm(
                      "nis",
                      event.target.value
                    )
                  }
                />

                <FormInput
                  label="Nama"
                  value={form.nama}
                  placeholder="Nama lengkap"
                  onChange={(event) =>
                    updateForm(
                      "nama",
                      event.target.value
                    )
                  }
                />

                <FormSelect
                  label="Jenis Kelamin"
                  value={form.jenis_kelamin}
                  onChange={(event) =>
                    updateForm(
                      "jenis_kelamin",
                      event.target.value
                    )
                  }
                  options={[
                    {
                      value: "",
                      label: "Pilih jenis kelamin",
                    },
                    {
                      value: "L",
                      label: "Laki-laki",
                    },
                    {
                      value: "P",
                      label: "Perempuan",
                    },
                  ]}
                />

                <FormInput
                  label="Tanggal Lahir"
                  type="date"
                  value={form.tanggal_lahir}
                  onChange={(event) =>
                    updateForm(
                      "tanggal_lahir",
                      event.target.value
                    )
                  }
                />

                <div
                  style={{
                    gridColumn: "1 / -1",
                  }}
                >
                  <label style={styles.label}>
                    Alamat
                  </label>

                  <textarea
                    required
                    rows="3"
                    value={form.alamat}
                    placeholder="Alamat lengkap"
                    onChange={(event) =>
                      updateForm(
                        "alamat",
                        event.target.value
                      )
                    }
                    style={{
                      ...styles.input,
                      resize: "vertical",
                    }}
                  />
                </div>

                <FormInput
                  label="Kelas"
                  value={form.kelas}
                  placeholder="Contoh: XII PPLG 1"
                  onChange={(event) =>
                    updateForm(
                      "kelas",
                      event.target.value
                    )
                  }
                />

                <FormInput
                  label="Jurusan"
                  value={form.jurusan}
                  placeholder="Contoh: PPLG"
                  onChange={(event) =>
                    updateForm(
                      "jurusan",
                      event.target.value
                    )
                  }
                />

                <FormInput
                  label="No. HP"
                  value={form.no_hp}
                  placeholder="081234567890"
                  onChange={(event) =>
                    updateForm(
                      "no_hp",
                      event.target.value
                    )
                  }
                />

                <FormInput
                  label="Email"
                  type="email"
                  value={form.email}
                  placeholder="email@gmail.com"
                  onChange={(event) =>
                    updateForm(
                      "email",
                      event.target.value
                    )
                  }
                />

                {addError && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      ...styles.formError,
                    }}
                  >
                    ⚠️ {addError}
                  </div>
                )}

              </div>

              <div style={styles.modalFooter}>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  style={styles.cancelButton}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={styles.primaryButton}
                >
                  {saving
                    ? "Menyimpan..."
                    : "Simpan Data"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          MODAL PATCH / EDIT
      ===================================================== */}

      {showEditModal && (
        <div style={styles.overlay}>

          <div style={styles.modal}>

            <div style={styles.modalHeader}>

              <div>
                <h2 style={styles.modalTitle}>
                  Edit Data Siswa
                </h2>

                <p style={styles.modalSubtitle}>
                  Mengubah data siswa ID{" "}
                  <strong>{editingId}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  resetEditForm();
                }}
                style={styles.closeButton}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleUpdate}>

              <div style={styles.formGrid}>

                <FormInput
                  label="NIS"
                  value={editForm.nis}
                  onChange={(event) =>
                    updateEditForm(
                      "nis",
                      event.target.value
                    )
                  }
                />

                <FormInput
                  label="Nama"
                  value={editForm.nama}
                  onChange={(event) =>
                    updateEditForm(
                      "nama",
                      event.target.value
                    )
                  }
                />

                <FormSelect
                  label="Jenis Kelamin"
                  value={editForm.jenis_kelamin}
                  onChange={(event) =>
                    updateEditForm(
                      "jenis_kelamin",
                      event.target.value
                    )
                  }
                  options={[
                    {
                      value: "",
                      label: "Pilih jenis kelamin",
                    },
                    {
                      value: "L",
                      label: "Laki-laki",
                    },
                    {
                      value: "P",
                      label: "Perempuan",
                    },
                  ]}
                />

                <FormInput
                  label="Tanggal Lahir"
                  type="date"
                  value={editForm.tanggal_lahir}
                  onChange={(event) =>
                    updateEditForm(
                      "tanggal_lahir",
                      event.target.value
                    )
                  }
                />

                <div
                  style={{
                    gridColumn: "1 / -1",
                  }}
                >
                  <label style={styles.label}>
                    Alamat
                  </label>

                  <textarea
                    required
                    rows="3"
                    value={editForm.alamat}
                    onChange={(event) =>
                      updateEditForm(
                        "alamat",
                        event.target.value
                      )
                    }
                    style={{
                      ...styles.input,
                      resize: "vertical",
                    }}
                  />
                </div>

                <FormInput
                  label="Kelas"
                  value={editForm.kelas}
                  onChange={(event) =>
                    updateEditForm(
                      "kelas",
                      event.target.value
                    )
                  }
                />

                <FormInput
                  label="Jurusan"
                  value={editForm.jurusan}
                  onChange={(event) =>
                    updateEditForm(
                      "jurusan",
                      event.target.value
                    )
                  }
                />

                <FormInput
                  label="No. HP"
                  value={editForm.no_hp}
                  onChange={(event) =>
                    updateEditForm(
                      "no_hp",
                      event.target.value
                    )
                  }
                />

                <FormInput
                  label="Email"
                  type="email"
                  value={editForm.email}
                  onChange={(event) =>
                    updateEditForm(
                      "email",
                      event.target.value
                    )
                  }
                />

                {editError && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      ...styles.formError,
                    }}
                  >
                    ⚠️ {editError}
                  </div>
                )}

              </div>

              <div style={styles.modalFooter}>

                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditForm();
                  }}
                  style={styles.cancelButton}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  style={styles.primaryButton}
                >
                  {updating
                    ? "Memperbarui..."
                    : "Simpan Perubahan"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          CSS ANIMATION
      ===================================================== */}

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

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }

          button {
            font-family: inherit;
          }

          button:hover {
            filter: brightness(0.96);
          }

          input:focus,
          textarea:focus,
          select:focus {
            border-color: #2563eb !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.10);
          }

          @media (max-width: 700px) {
            .responsive-form {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

    </div>
  );
}

// =========================================================
// COMPONENT STAT CARD
// =========================================================

function StatCard({ icon, title, value }) {
  return (
    <div style={styles.statCard}>

      <div style={styles.statIcon}>
        {icon}
      </div>

      <div>
        <p style={styles.statLabel}>
          {title}
        </p>

        <h2 style={styles.statValue}>
          {value}
        </h2>
      </div>

    </div>
  );
}

// =========================================================
// COMPONENT INPUT
// =========================================================

function FormInput({
  label,
  type = "text",
  value,
  placeholder = "",
  onChange,
}) {
  return (
    <div>
      <label style={styles.label}>
        {label}
      </label>

      <input
        required
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        style={styles.input}
      />
    </div>
  );
}

// =========================================================
// COMPONENT SELECT
// =========================================================

function FormSelect({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <div>
      <label style={styles.label}>
        {label}
      </label>

      <select
        required
        value={value}
        onChange={onChange}
        style={styles.input}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #eef4ff 0%, #f8fafc 50%, #eef2ff 100%)",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#172033",
  },

  header: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 10,
    backdropFilter: "blur(12px)",
  },

  headerInner: {
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "17px 30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  logo: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "21px",
    fontWeight: "800",
    boxShadow:
      "0 7px 18px rgba(37,99,235,.25)",
  },

  brandTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#111827",
  },

  brandSubtitle: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "2px",
  },

  connection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 13px",
    borderRadius: "999px",
    backgroundColor: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#15803d",
    fontSize: "12px",
    fontWeight: "700",
  },

  connectionDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
  },

  main: {
    maxWidth: "1500px",
    margin: "0 auto",
    padding: "35px 30px 50px",
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "28px",
  },

  eyebrow: {
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1px",
    marginBottom: "7px",
  },

  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "800",
    color: "#111827",
  },

  description: {
    margin: "9px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  addButton: {
    border: "none",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    boxShadow:
      "0 7px 18px rgba(37,99,235,.25)",
  },

  success: {
    marginBottom: "20px",
    padding: "14px 18px",
    borderRadius: "10px",
    backgroundColor: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#15803d",
    fontSize: "13px",
    fontWeight: "700",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(210px,1fr))",
    gap: "18px",
    marginBottom: "28px",
  },

  statCard: {
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "15px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow:
      "0 6px 20px rgba(15,23,42,.05)",
  },

  statIcon: {
    width: "47px",
    height: "47px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  statLabel: {
    margin: "0 0 4px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "600",
  },

  statValue: {
    margin: 0,
    color: "#111827",
    fontSize: "24px",
    fontWeight: "800",
  },

  tableCard: {
    backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "17px",
    overflow: "hidden",
    boxShadow:
      "0 10px 30px rgba(15,23,42,.06)",
  },

  tableHeader: {
    padding: "22px 24px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },

  tableTitle: {
    margin: "0 0 5px",
    fontSize: "19px",
    color: "#111827",
  },

  tableSubtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
  },

  searchBox: {
    position: "relative",
    width: "320px",
    maxWidth: "100%",
  },

  searchIcon: {
    position: "absolute",
    left: "13px",
    top: "50%",
    transform: "translateY(-50%)",
  },

  searchInput: {
    width: "100%",
    padding: "11px 13px 11px 39px",
    border: "1px solid #dbe1ea",
    borderRadius: "9px",
    outline: "none",
    fontSize: "13px",
    backgroundColor: "#f8fafc",
  },

  loading: {
    padding: "70px 20px",
    textAlign: "center",
    color: "#2563eb",
    fontWeight: "700",
  },

  spinner: {
    width: "38px",
    height: "38px",
    margin: "0 auto 17px",
    border: "4px solid #dbeafe",
    borderTop: "4px solid #2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  error: {
    margin: "24px",
    padding: "20px",
    borderRadius: "11px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: "13px",
  },

  retryButton: {
    marginTop: "13px",
    padding: "9px 13px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#dc2626",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    minWidth: "1450px",
    borderCollapse: "collapse",
  },

  theadRow: {
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },

  th: {
    padding: "15px 16px",
    textAlign: "left",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom: "1px solid #f1f5f9",
  },

  td: {
    padding: "14px 16px",
    fontSize: "13px",
    color: "#475569",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  },

  idBadge: {
    display: "inline-flex",
    minWidth: "32px",
    height: "28px",
    padding: "0 8px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "7px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontWeight: "800",
  },

  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg,#dbeafe,#e0e7ff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#3730a3",
    fontWeight: "800",
  },

  maleBadge: {
    padding: "6px 10px",
    borderRadius: "7px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: "700",
  },

  femaleBadge: {
    padding: "6px 10px",
    borderRadius: "7px",
    backgroundColor: "#fdf2f8",
    color: "#db2777",
    fontSize: "11px",
    fontWeight: "700",
  },

  classBadge: {
    padding: "5px 9px",
    borderRadius: "6px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "700",
  },

  actionGroup: {
    display: "flex",
    gap: "7px",
  },

  editButton: {
    border: "1px solid #bfdbfe",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    padding: "8px 11px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
  },

  deleteButton: {
    border: "1px solid #fecaca",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: "8px 11px",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700",
  },

  empty: {
    padding: "60px 20px",
    textAlign: "center",
    color: "#64748b",
  },

  footer: {
    padding: "17px 24px",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#fafbfc",
    color: "#64748b",
    fontSize: "13px",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15,23,42,.55)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 100,
  },

  modal: {
    width: "100%",
    maxWidth: "700px",
    maxHeight: "90vh",
    overflowY: "auto",
    backgroundColor: "#fff",
    borderRadius: "17px",
    boxShadow:
      "0 25px 60px rgba(15,23,42,.25)",
  },

  modalHeader: {
    padding: "22px 25px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#111827",
  },

  modalSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "12px",
  },

  closeButton: {
    width: "35px",
    height: "35px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    fontSize: "20px",
    cursor: "pointer",
  },

  formGrid: {
    padding: "25px",
    display: "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap: "18px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    padding: "11px 13px",
    border: "1px solid #dbe1ea",
    borderRadius: "9px",
    outline: "none",
    fontSize: "13px",
    color: "#1e293b",
    backgroundColor: "#fff",
    fontFamily: "inherit",
  },

  formError: {
    padding: "13px 15px",
    borderRadius: "9px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: "13px",
  },

  modalFooter: {
    padding: "18px 25px",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#fafbfc",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },

  cancelButton: {
    border: "1px solid #dbe1ea",
    backgroundColor: "#fff",
    color: "#475569",
    padding: "11px 18px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
  },

  primaryButton: {
    border: "none",
    background:
      "linear-gradient(135deg,#2563eb,#4f46e5)",
    color: "#fff",
    padding: "11px 18px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
  },
};

export default App;