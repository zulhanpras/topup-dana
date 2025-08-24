const topupInput = document.getElementById('TopUp');
const adminSpan = document.getElementById('admin');
const totalSpan = document.getElementById('total');
const nomorInput = document.getElementById('Nomor');
const namaInput = document.getElementById('Nama');
const pembayaranSelect = document.getElementById('Pembayaran');
const hutangSection = document.getElementById('hutangSection');
const jatuhTempoInput = document.getElementById('jatuhTempo');

// Format Rupiah
function formatRupiah(num) {
  return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Ambil angka saja
function parseNumber(value) {
  return parseInt(value.replace(/[^0-9]/g, '')) || 0;
}

// Hitung Biaya Admin
function hitungAdmin(amount) {
  if (!amount || amount <= 0) return 0;
  if (amount <= 50000) return 2000;
  if (amount <= 100000) return 3000;
  if (amount <= 200000) return 6000;
  if (amount <= 300000) return 9000;
  let extra = Math.floor((amount - 300000)/100000);
  return 9000 + extra*3000;
}

// Update Biaya Admin & Total
function updateTotal() {
  const topupAmount = parseNumber(topupInput.value);
  const admin = hitungAdmin(topupAmount);
  const total = topupAmount + admin;
  adminSpan.textContent = formatRupiah(admin);
  totalSpan.textContent = formatRupiah(total);
}

// Event TopUp input
topupInput.addEventListener('input', function() {
  const numberValue = parseNumber(this.value);
  this.value = formatRupiah(numberValue);
  updateTotal();
});

// Validasi Nomor
nomorInput.addEventListener('input', function() {
  let firstChar = this.value.charAt(0);
  let rest = this.value.slice(1);
  if(firstChar !== '+') firstChar = firstChar.replace(/[^0-9]/g,'');
  rest = rest.replace(/[^0-9]/g,'');
  this.value = firstChar + rest;
});

// Validasi Nama
namaInput.addEventListener('input', function() {
  this.value = this.value.replace(/[^A-Za-z ]/g,'');
});

updateTotal();

// Show/hide Hutang & set min/max datetime
pembayaranSelect.addEventListener('change', function() {
  if(this.value === 'Hutang') {
    hutangSection.style.display = 'block';
    
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth()+1).padStart(2,'0');
    const dd = String(now.getDate()).padStart(2,'0');
    const hh = String(now.getHours()).padStart(2,'0');
    const min = String(now.getMinutes()).padStart(2,'0');
    
    jatuhTempoInput.min = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    
    // Max 3 hari
    const maxDate = new Date(now.getTime() + 3*24*60*60*1000);
    const yyyyMax = maxDate.getFullYear();
    const mmMax = String(maxDate.getMonth()+1).padStart(2,'0');
    const ddMax = String(maxDate.getDate()).padStart(2,'0');
    const hhMax = String(maxDate.getHours()).padStart(2,'0');
    const minMax = String(maxDate.getMinutes()).padStart(2,'0');
    jatuhTempoInput.max = `${yyyyMax}-${mmMax}-${ddMax}T${hhMax}:${minMax}`;
    
    jatuhTempoInput.required = true;
  } else {
    hutangSection.style.display = 'none';
    jatuhTempoInput.required = false;
  }
});

// Submit form
document.getElementById('topupForm').addEventListener('submit', function(e) {
  e.preventDefault();

  let nomor = nomorInput.value.trim();
  if (!(nomor.startsWith('08') || nomor.startsWith('+62'))) {
    alert('Nomor harus diawali dengan 08 atau +62');
    nomorInput.focus();
    return;
  }

  const nama = namaInput.value;
  const topup = parseNumber(topupInput.value);
  const topupStr = topup.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const total = totalSpan.textContent;
  const pembayaran = pembayaranSelect.value;

  if(nomor.startsWith('+62')) nomor = '0'+nomor.slice(3);

  // Susun pesan WA
  let message = 
`TOPUP FORM

Nomor : ${nomor}
Atas Nama : ${nama}

Jumlah TopUp : Rp ${topupStr}
Biaya Admin : ${adminSpan.textContent}
Total : *${total}*

Pembayaran: ${pembayaran}`;

  if(pembayaran === 'Hutang') {
    let dt = jatuhTempoInput.value.replace('T',' ');
    message += `\nJatuh Tempo : ${dt}`;
  }

  const encodedMessage = encodeURIComponent(message);
  const waNumber = '62882001242159';
  window.open(`https://api.whatsapp.com/send/?phone=${waNumber}&text=${encodedMessage}&type=phone_number&app_absent=1`,'_blank');
});
