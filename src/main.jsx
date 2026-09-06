import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

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
