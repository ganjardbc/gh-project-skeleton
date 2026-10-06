const id = {
  nav: {
    fitur: 'Fitur',
    harga: 'Harga',
    testimoni: 'Testimoni',
    register: 'Register',
    tentang: 'Tentang',
    faq: 'FAQ',
    gantiBahasa: 'Switch to English',
    modeGelap: 'Ganti ke mode gelap',
    modeTerang: 'Ganti ke mode terang',
  },
  hero: {
    tagline: 'Boilerplate sederhana untuk aplikasi bisnis Anda.',
    deskripsi: 'Solusi skeleton digital all-in-one untuk UMKM Indonesia. Kelola pengguna, peran, izin, merchant, dan unggahan dalam satu platform yang mudah digunakan.',
    masuk: 'Masuk',
    daftar: 'Daftar',
    stats: {
      pengguna: 'Pengguna Aktif',
      transaksi: 'Hak Akses',
      outlet: 'Merchant',
      tahun: 'Pengalaman',
    },
    kepercayaan: 'Dipercaya oleh ribuan developer dan merchant di seluruh Indonesia',
  },
  features: {
    title: 'Fitur Unggulan',
    subtitle: 'Semua yang Anda butuhkan untuk mengelola skeleton bisnis Anda.',
    items: [
      { title: 'Manajemen Pengguna', description: 'Pantau dan kelola data pengguna secara real-time.' },
      { title: 'Manajemen Peran', description: 'Kelola peran (roles) untuk membatasi aksi dan akses.' },
      { title: 'Manajemen Hak Akses', description: 'Kelola izin/permissions secara granular dengan mudah.' },
      { title: 'Manajemen Merchant', description: 'Atur detail informasi merchant dan metadata.' },
      { title: 'Manajemen Unggahan', description: 'Unggah file secara aman dengan integrasi S3.' },
      { title: 'Sistem Notifikasi', description: 'Sistem notifikasi bawaan di dalam aplikasi.' },
    ],
  },
  pricing: {
    populer: 'Populer',
    title: 'Pilihan Harga',
    subtitle: 'Pilih paket yang sesuai dengan kebutuhan bisnis Anda.',
    plans: [
      {
        name: 'Gratis',
        price: 'Rp 0',
        period: '/bulan',
        features: ['Hingga 5 pengguna', '1 merchant', 'Fitur dasar', 'Dukungan email'],
        cta: 'Mulai Gratis',
        featured: false,
      },
      {
        name: 'Bisnis',
        price: 'Rp 99.000',
        period: '/bulan',
        features: ['Pengguna tak terbatas', 'Hingga 3 merchant', 'Fitur lengkap', 'Dukungan prioritas', 'Ekspor data'],
        cta: 'Mulai Trial',
        featured: true,
      },
      {
        name: 'Enterprise',
        price: 'Rp 299.000',
        period: '/bulan',
        features: ['Pengguna tak terbatas', 'Merchant tak terbatas', 'Solusi kustom', 'Dukungan 24/7', 'API akses', 'Dedicated account'],
        cta: 'Hubungi Kami',
        featured: false,
      },
    ],
  },
  testimonials: {
    title: 'Apa Kata Pelanggan',
    subtitle: 'Bergabung dengan ribuan bisnis yang sudah menggunakan GH Skeleton.',
    items: [
      { quote: 'GH Skeleton membantu saya membuat dashboard bisnis dengan sangat cepat. Boilerplatenya sangat rapi!', name: 'Rian Prasetyo', role: 'Software Engineer' },
      { quote: 'Dulu saya kesulitan mengatur RBAC. Sekarang semuanya sudah terkonfigurasi secara out-of-the-box!', name: 'Budi Santoso', role: 'Tech Lead' },
      { quote: 'Struktur merchant-nya sangat bersih dan mudah dimodifikasi untuk proyek SaaS kami.', name: 'Dewi Lestari', role: 'Pendiri SaaS' },
    ],
  },
  register: {
    kicker: 'Buat Akun Baru',
    title: 'Mulai GH Skeleton Sekarang',
    subtitle: 'Isi data berikut untuk membuat akun merchant baru.',
    fields: {
      name: 'Nama Lengkap',
      email: 'Email',
      password: 'Password',
      merchantName: 'Nama Merchant',
      merchantSlug: 'Slug Merchant',
    },
    actions: {
      submit: 'Daftar Sekarang',
      loading: 'Memproses...',
    },
    messages: {
      success: 'Registrasi berhasil. Silakan lanjut login di aplikasi web.',
      failed: 'Registrasi gagal. Coba lagi.',
    },
  },
  footer: {
    hakCipta: 'GH Skeleton Project. Hak cipta dilindungi.',
    tautan: {
      tentang: 'Tentang',
      faq: 'FAQ',
      syarat: 'Syarat & Ketentuan',
    },
  },
  meta: {
    situs: 'GH Skeleton',
    beranda: {
      title: 'GH Skeleton — Boilerplate untuk aplikasi bisnis',
      description: 'Skeleton SaaS multi-tenant: pengguna, peran, izin, merchant, unggahan, dan notifikasi dalam satu platform.',
    },
  },
  about: {
    title: 'Tentang GH Skeleton',
    subtitle: 'Titik awal untuk membangun aplikasi bisnis multi-tenant.',
    misi: {
      title: 'Kenapa kami membuatnya',
      paragraf: [
        'Hampir setiap aplikasi bisnis dimulai dari pekerjaan yang sama: login, pengguna, peran, izin, dan pemisahan data antar pelanggan. Pekerjaan itu penting, tetapi bukan hal yang membedakan produk Anda.',
        'GH Skeleton menyediakan fondasi tersebut dalam keadaan siap pakai, sehingga tim Anda bisa langsung mengerjakan fitur yang memang bernilai bagi pengguna.',
      ],
    },
    nilai: {
      title: 'Prinsip kami',
      items: [
        { title: 'Sederhana', description: 'Struktur yang mudah dibaca dan mudah diubah, tanpa lapisan yang tidak perlu.' },
        { title: 'Aman sejak awal', description: 'Data tiap merchant terpisah, dan setiap aksi diperiksa izinnya di server.' },
        { title: 'Siap dikembangkan', description: 'Tambahkan modul bisnis Anda sendiri dengan mengikuti pola yang sudah ada.' },
      ],
    },
  },
  faq: {
    title: 'Pertanyaan Umum',
    subtitle: 'Jawaban singkat untuk pertanyaan yang paling sering muncul.',
    items: [
      { question: 'Apa itu GH Skeleton?', answer: 'GH Skeleton adalah kerangka aplikasi SaaS multi-tenant. Di dalamnya sudah ada autentikasi, pengelolaan merchant dan pengguna, peran dan izin, unggahan berkas, notifikasi, serta pengaturan akun.' },
      { question: 'Apakah data antar merchant terpisah?', answer: 'Ya. Setiap pengguna terikat pada satu merchant, dan setiap permintaan data dibatasi pada merchant milik pengguna yang sedang login.' },
      { question: 'Bagaimana cara mengatur hak akses?', answer: 'Hak akses diatur lewat peran dan izin. Satu pengguna dapat memiliki beberapa peran, dan izin efektifnya adalah gabungan dari semua peran tersebut.' },
      { question: 'Bagaimana cara mulai menggunakan?', answer: 'Isi formulir pendaftaran di halaman utama. Akun merchant dan pengguna pemilik akan dibuat sekaligus, lalu Anda dapat masuk melalui aplikasi web.' },
      { question: 'Di mana berkas yang diunggah disimpan?', answer: 'Berkas dapat disimpan di penyimpanan lokal untuk pengembangan atau di layanan yang kompatibel dengan S3 untuk produksi.' },
    ],
  },
  terms: {
    title: 'Syarat & Ketentuan',
    subtitle: 'Ketentuan penggunaan layanan GH Skeleton.',
    draf: 'Draf',
    tidakAda: 'Dokumen ini belum tersedia.',
  },
}

export type Messages = typeof id

export default id
