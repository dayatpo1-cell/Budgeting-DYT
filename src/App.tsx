import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  Trash2, 
  RotateCcw, 
  Search, 
  Calendar, 
  Tag, 
  FileText, 
  Download, 
  Code2, 
  Check, 
  Copy, 
  AlertCircle,
  CreditCard,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Receipt
} from 'lucide-react';

// Tipe Data Transaksi
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  createdAt: number;
}

// Tipe Data Tagihan Rutin Bulanan
export interface RegularBill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // e.g., "Tiap tgl 10"
  isPaid: boolean;
  category: string;
}

// Tipe Data Cicilan Berjangka
export interface Installment {
  id: string;
  name: string;
  monthlyAmount: number;
  totalTenor: number; // e.g. 6 bulan
  paidTenor: number;  // e.g. 2 bulan
  startDate?: string;
  notes?: string;
}

const DEFAULT_CATEGORIES = {
  income: ['Gaji', 'Bonus', 'Freelance', 'Investasi', 'Bisnis', 'Hadiah', 'Lainnya'],
  expense: ['Makan & Minum', 'Transportasi', 'Belanja', 'Tagihan & Utilitas', 'Cicilan', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya']
};

export default function App() {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'transaksi' | 'tagihan' | 'cicilan'>('transaksi');

  // 1. STATE TRANSAKSI
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('dompetku_transaksi_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'sample-1',
        description: 'Gaji Bulanan',
        amount: 7500000,
        type: 'income',
        category: 'Gaji',
        date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        createdAt: Date.now() - 86400000 * 2
      },
      {
        id: 'sample-2',
        description: 'Belanja Bulanan Supermarket',
        amount: 650000,
        type: 'expense',
        category: 'Belanja',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        createdAt: Date.now() - 86400000
      },
      {
        id: 'sample-3',
        description: 'Bensin & Transportasi',
        amount: 80000,
        type: 'expense',
        category: 'Transportasi',
        date: new Date().toISOString().split('T')[0],
        createdAt: Date.now()
      }
    ];
  });

  // 2. STATE TAGIHAN RUTIN BULANAN
  const [regularBills, setRegularBills] = useState<RegularBill[]>(() => {
    try {
      const saved = localStorage.getItem('dompetku_tagihan_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 'bill-1', name: 'Listrik PLN Pasca/Token', amount: 350000, dueDate: 'Tgl 10', isPaid: true, category: 'Utilitas' },
      { id: 'bill-2', name: 'Internet WiFi Rumah', amount: 380000, dueDate: 'Tgl 15', isPaid: false, category: 'Internet' },
      { id: 'bill-3', name: 'BPJS Kesehatan', amount: 100000, dueDate: 'Tgl 20', isPaid: false, category: 'Kesehatan' }
    ];
  });

  // 3. STATE TRACKER CICILAN BERJANGKA
  const [installments, setInstallments] = useState<Installment[]>(() => {
    try {
      const saved = localStorage.getItem('dompetku_cicilan_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 'inst-1', name: 'Cicilan Smartphone Baru', monthlyAmount: 750000, totalTenor: 6, paidTenor: 2, notes: 'Tenor 6 bulan' },
      { id: 'inst-2', name: 'Kulkas 2 Pintu Inverter', monthlyAmount: 420000, totalTenor: 12, paidTenor: 5, notes: 'Bebas bunga' }
    ];
  });

  // Form State: Transaksi
  const [txDesc, setTxDesc] = useState('');
  const [txAmountRaw, setTxAmountRaw] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [txCategory, setTxCategory] = useState('Makan & Minum');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [txError, setTxError] = useState('');

  // Form State: Tagihan Rutin
  const [billName, setBillName] = useState('');
  const [billAmountRaw, setBillAmountRaw] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billError, setBillError] = useState('');

  // Form State: Cicilan Berjangka
  const [instName, setInstName] = useState('');
  const [instAmountRaw, setInstAmountRaw] = useState('');
  const [instTotalTenor, setInstTotalTenor] = useState('6');
  const [instPaidTenor, setInstPaidTenor] = useState('0');
  const [instError, setInstError] = useState('');

  // Filter & Search Transaksi
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTx, setSearchTx] = useState('');

  // Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Sync LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('dompetku_transaksi_v2', JSON.stringify(transactions));
    } catch (e) { console.error(e); }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('dompetku_tagihan_v2', JSON.stringify(regularBills));
    } catch (e) { console.error(e); }
  }, [regularBills]);

  useEffect(() => {
    try {
      localStorage.setItem('dompetku_cicilan_v2', JSON.stringify(installments));
    } catch (e) { console.error(e); }
  }, [installments]);

  // Format Rupiah
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  // Kalkulasi Keuangan Utama
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const balance = totalIncome - totalExpense;

  // Ringkasan Tagihan & Cicilan
  const unpaidBillsTotal = useMemo(() => {
    return regularBills
      .filter(b => !b.isPaid)
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [regularBills]);

  const activeInstallmentsTotal = useMemo(() => {
    return installments
      .filter(i => i.paidTenor < i.totalTenor)
      .reduce((acc, curr) => acc + curr.monthlyAmount, 0);
  }, [installments]);

  // Filtered Transaksi
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((item) => {
        if (filterType !== 'all' && item.type !== filterType) return false;
        if (searchTx.trim() !== '') {
          const q = searchTx.toLowerCase();
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchCat = item.category?.toLowerCase().includes(q);
          if (!matchDesc && !matchCat) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
  }, [transactions, filterType, searchTx]);

  // Handler: Tambah Transaksi Kas
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setTxError('');

    const desc = txDesc.trim();
    const amount = parseInt(txAmountRaw.replace(/[^0-9]/g, ''), 10);

    if (!desc) {
      setTxError('Harap isi keterangan transaksi.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setTxError('Harap masukkan nominal yang valid.');
      return;
    }

    const newTx: Transaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      description: desc,
      amount: amount,
      type: txType,
      category: txCategory,
      date: txDate || new Date().toISOString().split('T')[0],
      createdAt: Date.now()
    };

    setTransactions([newTx, ...transactions]);
    setTxDesc('');
    setTxAmountRaw('');
  };

  // Handler: Tambah Tagihan Rutin
  const handleAddRegularBill = (e: React.FormEvent) => {
    e.preventDefault();
    setBillError('');

    const name = billName.trim();
    const amount = parseInt(billAmountRaw.replace(/[^0-9]/g, ''), 10);

    if (!name) {
      setBillError('Harap isi nama tagihan rutin.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setBillError('Harap masukkan nominal tagihan.');
      return;
    }

    const newBill: RegularBill = {
      id: 'bill-' + Date.now(),
      name: name,
      amount: amount,
      dueDate: billDueDate.trim() || 'Tiap akhir bulan',
      isPaid: false,
      category: 'Tagihan Rutin'
    };

    setRegularBills([...regularBills, newBill]);
    setBillName('');
    setBillAmountRaw('');
    setBillDueDate('');
  };

  // Toggle Status Bayar Tagihan Rutin (Otomatis Catat ke Pengeluaran jika ditandai Lunas)
  const handleToggleBillStatus = (id: string) => {
    setRegularBills(prev => prev.map(bill => {
      if (bill.id === id) {
        const nextPaid = !bill.isPaid;
        // Jika berubah menjadi LUNAS, otomatis catat ke riwayat transaksi pengeluaran
        if (nextPaid) {
          const autoTx: Transaction = {
            id: 'tx-bill-' + Date.now(),
            description: `Bayar Tagihan: ${bill.name}`,
            amount: bill.amount,
            type: 'expense',
            category: 'Tagihan & Utilitas',
            date: new Date().toISOString().split('T')[0],
            createdAt: Date.now()
          };
          setTransactions(txs => [autoTx, ...txs]);
        }
        return { ...bill, isPaid: nextPaid };
      }
      return bill;
    }));
  };

  // Reset status tagihan rutin untuk awal bulan baru
  const handleResetMonthlyBills = () => {
    if (confirm('Ubah semua status tagihan menjadi "Belum Bayar" untuk pembukuan bulan baru?')) {
      setRegularBills(prev => prev.map(b => ({ ...b, isPaid: false })));
    }
  };

  // Handler: Tambah Cicilan Berjangka
  const handleAddInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    setInstError('');

    const name = instName.trim();
    const amount = parseInt(instAmountRaw.replace(/[^0-9]/g, ''), 10);
    const totalTenor = parseInt(instTotalTenor, 10);
    const paidTenor = parseInt(instPaidTenor, 10) || 0;

    if (!name) {
      setInstError('Harap isi nama cicilan.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setInstError('Harap masukkan nominal cicilan per bulan.');
      return;
    }
    if (isNaN(totalTenor) || totalTenor <= 0) {
      setInstError('Harap masukkan total tenor bulan (minimal 1).');
      return;
    }
    if (paidTenor > totalTenor) {
      setInstError('Cicilan terbayar tidak boleh melebihi total tenor.');
      return;
    }

    const newInst: Installment = {
      id: 'inst-' + Date.now(),
      name: name,
      monthlyAmount: amount,
      totalTenor: totalTenor,
      paidTenor: paidTenor,
      startDate: new Date().toISOString().split('T')[0]
    };

    setInstallments([...installments, newInst]);
    setInstName('');
    setInstAmountRaw('');
    setInstTotalTenor('6');
    setInstPaidTenor('0');
  };

  // Handler: Bayar Cicilan Bulan Ini (Tombol Progress Tracker)
  const handlePayInstallmentMonth = (id: string) => {
    setInstallments(prev => prev.map(inst => {
      if (inst.id === id) {
        if (inst.paidTenor >= inst.totalTenor) {
          alert('Cicilan ini sudah lunas sepenuhnya!');
          return inst;
        }

        const nextPaid = inst.paidTenor + 1;
        // Catat otomatis ke pengeluaran
        const autoTx: Transaction = {
          id: 'tx-inst-' + Date.now(),
          description: `Bayar Cicilan: ${inst.name} (${nextPaid}/${inst.totalTenor})`,
          amount: inst.monthlyAmount,
          type: 'expense',
          category: 'Cicilan',
          date: new Date().toISOString().split('T')[0],
          createdAt: Date.now()
        };
        setTransactions(txs => [autoTx, ...txs]);

        return { ...inst, paidTenor: nextPaid };
      }
      return inst;
    }));
  };

  // Hapus Data Individu
  const handleDeleteTx = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    setDeleteConfirmId(null);
  };

  const handleDeleteBill = (id: string) => {
    setRegularBills(regularBills.filter(b => b.id !== id));
  };

  const handleDeleteInstallment = (id: string) => {
    setInstallments(installments.filter(i => i.id !== id));
  };

  // Reset Semua Data
  const handleResetAllData = () => {
    setTransactions([]);
    setRegularBills([]);
    setInstallments([]);
    setShowResetModal(false);
  };

  // Standalone Single File HTML Generator (100% lengkap siap pakai)
  const standaloneHtmlCode = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Budgeting DYT</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Font Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-slate-50 min-h-screen text-slate-800 antialiased p-4 md:p-8">

  <div class="max-w-4xl mx-auto space-y-6">

    <!-- Header Aplikasi -->
    <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Budgeting DYT</span>
        </h1>
        <p class="text-xs md:text-sm text-slate-500 mt-1">Pencatatan kas harian, tagihan rutin bulanan, dan tracker tenor cicilan</p>
      </div>
      <div>
        <button id="btnResetAll" class="px-3.5 py-2 text-xs md:text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Reset Semua Data
        </button>
      </div>
    </header>

    <!-- 1. DASHBOARD / 3 KARTU RINGKASAN -->
    <section class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Total Pemasukan -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pemasukan</span>
          <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
          </div>
        </div>
        <div id="totalIncomeDisplay" class="text-xl md:text-2xl font-bold text-emerald-600 mt-2">Rp 0</div>
        <p class="text-[11px] text-slate-400 mt-1">Total uang masuk tercatat</p>
      </div>

      <!-- Total Pengeluaran -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pengeluaran</span>
          <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/></svg>
          </div>
        </div>
        <div id="totalExpenseDisplay" class="text-xl md:text-2xl font-bold text-rose-600 mt-2">Rp 0</div>
        <p class="text-[11px] text-slate-400 mt-1">Total uang keluar tercatat</p>
      </div>

      <!-- Sisa Saldo -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Sisa Saldo</span>
          <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
          </div>
        </div>
        <div id="balanceDisplay" class="text-xl md:text-2xl font-bold text-emerald-600 mt-2">Rp 0</div>
        <p class="text-[11px] text-slate-400 mt-1">Saldo kas saat ini</p>
      </div>
    </section>

    <!-- Navigasi Tab Menu -->
    <div class="flex p-1 bg-slate-200/70 rounded-xl">
      <button onclick="switchTab('tx')" id="tabBtnTx" class="flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition bg-white text-slate-900 shadow-sm">
        💵 Transaksi Keuangan
      </button>
      <button onclick="switchTab('bill')" id="tabBtnBill" class="flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition text-slate-600 hover:text-slate-900">
        📋 Tagihan Rutin
      </button>
      <button onclick="switchTab('inst')" id="tabBtnInst" class="flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition text-slate-600 hover:text-slate-900">
        ⏳ Tracker Cicilan
      </button>
    </div>

    <!-- TAB 1: TRANSAKSI KEUANGAN -->
    <div id="tabContentTx" class="space-y-6">
      <!-- Form Input Transaksi -->
      <section class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>Catat Transaksi Baru</span>
        </h2>
        <form id="txForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Keterangan / Sumber</label>
              <input type="text" id="txDescInput" placeholder="Contoh: Gaji, Makan Siang, Bensin" required class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Nominal (Rp)</label>
              <input type="number" id="txAmountInput" min="1" placeholder="50000" required class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600">
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Tipe Transaksi</label>
              <select id="txTypeSelect" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600 cursor-pointer">
                <option value="expense">Pengeluaran (Expense)</option>
                <option value="income">Pemasukan (Income)</option>
              </select>
            </div>
            <div class="flex items-end">
              <button type="submit" class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition duration-150 cursor-pointer">
                + Tambah Transaksi
              </button>
            </div>
          </div>
        </form>
      </section>

      <!-- Riwayat Transaksi -->
      <section class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h2 class="text-base sm:text-lg font-bold text-slate-900">Riwayat Transaksi</h2>
          <span id="txCountBadge" class="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">0 Transaksi</span>
        </div>
        <div id="txList" class="divide-y divide-slate-100 space-y-1"></div>
        <div id="txEmpty" class="hidden text-center py-10 text-slate-400 text-sm">Belum ada catatan transaksi.</div>
      </section>
    </div>

    <!-- TAB 2: TAGIHAN RUTIN BULANAN -->
    <div id="tabContentBill" class="hidden space-y-6">
      <section class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-4">Tambah Tagihan Rutin</h2>
        <form id="billForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Tagihan</label>
            <input type="text" id="billNameInput" placeholder="Misal: Listrik PLN, WiFi, Kost" required class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Nominal (Rp)</label>
            <input type="number" id="billAmountInput" min="1" placeholder="350000" required class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600">
          </div>
          <div class="flex items-end">
            <button type="submit" class="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition duration-150 cursor-pointer">
              + Simpan Tagihan
            </button>
          </div>
        </form>
      </section>

      <section class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h2 class="text-base sm:text-lg font-bold text-slate-900">Checklist Tagihan Rutin</h2>
            <p class="text-xs text-slate-400">Centang kotak untuk menandai lunas & otomatis mencatat pengeluaran</p>
          </div>
          <button onclick="resetBillStatus()" class="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer">
            Reset Status Bulan Baru
          </button>
        </div>
        <div id="billList" class="divide-y divide-slate-100 space-y-2"></div>
        <div id="billEmpty" class="hidden text-center py-10 text-slate-400 text-sm">Belum ada daftar tagihan rutin.</div>
      </section>
    </div>

    <!-- TAB 3: TRACKER CICILAN BERJANGKA -->
    <div id="tabContentInst" class="hidden space-y-6">
      <section class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h2 class="text-base sm:text-lg font-bold text-slate-900 mb-4">Tambah Cicilan Berjangka Baru</h2>
        <form id="instForm" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Nama Barang / Cicilan</label>
            <input type="text" id="instNameInput" placeholder="Contoh: Smartphone, Laptop, Motor" required class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Nominal per Bulan (Rp)</label>
            <input type="number" id="instAmountInput" min="1" placeholder="500000" required class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 uppercase mb-1">Total Tenor (Bulan)</label>
            <input type="number" id="instTenorInput" min="1" max="120" placeholder="6" required class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600">
          </div>
          <div class="sm:col-span-2 md:col-span-4 flex justify-end">
            <button type="submit" class="w-full sm:w-auto py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition duration-150 cursor-pointer">
              + Tambah Tracker Cicilan
            </button>
          </div>
        </form>
      </section>

      <section class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="mb-4 pb-2 border-b border-slate-100">
          <h2 class="text-base sm:text-lg font-bold text-slate-900">Daftar Tracker Cicilan Berjangka</h2>
          <p class="text-xs text-slate-400">Klik "Bayar Cicilan Bulan Ini" untuk mengupdate progres otomatis</p>
        </div>
        <div id="instList" class="space-y-4"></div>
        <div id="instEmpty" class="hidden text-center py-10 text-slate-400 text-sm">Belum ada cicilan berjangka yang dicatat.</div>
      </section>
    </div>

  </div>

  <!-- JavaScript Logika Lengkap -->
  <script>
    const STORAGE_TX = 'app_tx_v2';
    const STORAGE_BILLS = 'app_bills_v2';
    const STORAGE_INST = 'app_inst_v2';

    let transactions = JSON.parse(localStorage.getItem(STORAGE_TX) || '[]');
    let bills = JSON.parse(localStorage.getItem(STORAGE_BILLS) || '[]');
    let installments = JSON.parse(localStorage.getItem(STORAGE_INST) || '[]');

    // Inisialisasi Data Demo jika kosong
    if (transactions.length === 0 && bills.length === 0 && installments.length === 0) {
      transactions = [
        { id: '1', desc: 'Gaji Bulanan', amount: 6500000, type: 'income', date: 'Hari ini' },
        { id: '2', desc: 'Makan & Belanja Harian', amount: 85000, type: 'expense', date: 'Hari ini' }
      ];
      bills = [
        { id: '1', name: 'Listrik PLN Pasca/Token', amount: 350000, isPaid: true },
        { id: '2', name: 'Internet WiFi IndiHome', amount: 380000, isPaid: false }
      ];
      installments = [
        { id: '1', name: 'Cicilan Smartphone Baru', monthlyAmount: 750000, totalTenor: 6, paidTenor: 2 }
      ];
      saveAll();
    }

    function saveAll() {
      localStorage.setItem(STORAGE_TX, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_BILLS, JSON.stringify(bills));
      localStorage.setItem(STORAGE_INST, JSON.stringify(installments));
    }

    function formatRupiah(num) {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    }

    // Tab Navigation
    function switchTab(tab) {
      document.getElementById('tabContentTx').classList.toggle('hidden', tab !== 'tx');
      document.getElementById('tabContentBill').classList.toggle('hidden', tab !== 'bill');
      document.getElementById('tabContentInst').classList.toggle('hidden', tab !== 'inst');

      const activeClass = 'flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition bg-white text-slate-900 shadow-sm';
      const inactiveClass = 'flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition text-slate-600 hover:text-slate-900';

      document.getElementById('tabBtnTx').className = tab === 'tx' ? activeClass : inactiveClass;
      document.getElementById('tabBtnBill').className = tab === 'bill' ? activeClass : inactiveClass;
      document.getElementById('tabBtnInst').className = tab === 'inst' ? activeClass : inactiveClass;
    }

    // Update Dashboard (3 Kartu Metrik)
    function updateDashboard() {
      let income = 0;
      let expense = 0;
      transactions.forEach(t => {
        if (t.type === 'income') income += Number(t.amount);
        else if (t.type === 'expense') expense += Number(t.amount);
      });
      const balance = income - expense;

      document.getElementById('totalIncomeDisplay').textContent = formatRupiah(income);
      document.getElementById('totalExpenseDisplay').textContent = formatRupiah(expense);
      const balEl = document.getElementById('balanceDisplay');
      balEl.textContent = formatRupiah(balance);
      balEl.className = 'text-xl md:text-2xl font-bold mt-2 ' + (balance >= 0 ? 'text-emerald-600' : 'text-rose-600');
    }

    // Render Transaksi
    function renderTx() {
      const listEl = document.getElementById('txList');
      const emptyEl = document.getElementById('txEmpty');
      listEl.innerHTML = '';

      if (transactions.length === 0) {
        emptyEl.classList.remove('hidden');
      } else {
        emptyEl.classList.add('hidden');
        transactions.forEach(t => {
          const isIncome = t.type === 'income';
          const div = document.createElement('div');
          div.className = 'py-3 px-2 hover:bg-slate-50 rounded-xl flex items-center justify-between gap-3';
          div.innerHTML = \`
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs \${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}">
                \${isIncome ? '↓' : '↑'}
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-800">\${t.desc}</p>
                <p class="text-[11px] text-slate-400">\${t.date}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold \${isIncome ? 'text-emerald-600' : 'text-rose-600'}">
                \${isIncome ? '+' : '-'} \${formatRupiah(t.amount)}
              </span>
              <button onclick="deleteTx('\${t.id}')" class="p-1 text-slate-300 hover:text-rose-600 transition" title="Hapus">✕</button>
            </div>
          \`;
          listEl.appendChild(div);
        });
      }
      document.getElementById('txCountBadge').textContent = transactions.length + ' Transaksi';
      updateDashboard();
    }

    // Render Tagihan Rutin
    function renderBills() {
      const listEl = document.getElementById('billList');
      const emptyEl = document.getElementById('billEmpty');
      listEl.innerHTML = '';

      if (bills.length === 0) {
        emptyEl.classList.remove('hidden');
      } else {
        emptyEl.classList.add('hidden');
        bills.forEach(b => {
          const div = document.createElement('div');
          div.className = 'py-3 px-3 rounded-xl border border-slate-100 hover:border-slate-200 transition flex items-center justify-between gap-3 ' + (b.isPaid ? 'bg-emerald-50/30' : 'bg-white');
          div.innerHTML = \`
            <div class="flex items-center gap-3">
              <input type="checkbox" onchange="toggleBill('\${b.id}')" \${b.isPaid ? 'checked' : ''} class="w-5 h-5 rounded text-indigo-600 cursor-pointer">
              <div>
                <p class="text-sm font-semibold \${b.isPaid ? 'line-through text-slate-400' : 'text-slate-800'}">\${b.name}</p>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full \${b.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                  \${b.isPaid ? 'Lunas' : 'Belum Bayar'}
                </span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold text-slate-800">\${formatRupiah(b.amount)}</span>
              <button onclick="deleteBill('\${b.id}')" class="p-1 text-slate-300 hover:text-rose-600" title="Hapus">✕</button>
            </div>
          \`;
          listEl.appendChild(div);
        });
      }
    }

    // Render Cicilan Berjangka
    function renderInstallments() {
      const listEl = document.getElementById('instList');
      const emptyEl = document.getElementById('instEmpty');
      listEl.innerHTML = '';

      if (installments.length === 0) {
        emptyEl.classList.remove('hidden');
      } else {
        emptyEl.classList.add('hidden');
        installments.forEach(inst => {
          const percent = Math.min(100, Math.round((inst.paidTenor / inst.totalTenor) * 100));
          const isFinished = inst.paidTenor >= inst.totalTenor;

          const div = document.createElement('div');
          div.className = 'p-4 rounded-xl border border-slate-200/90 bg-white shadow-xs space-y-3';
          div.innerHTML = \`
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="text-sm font-bold text-slate-900">\${inst.name}</h4>
                <p class="text-xs text-slate-500 font-medium mt-0.5">\${formatRupiah(inst.monthlyAmount)} / bulan</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full \${isFinished ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}">
                  \${isFinished ? '🎉 Lunas' : \`Cicilan ke-\${inst.paidTenor} dari \${inst.totalTenor}\`}
                </span>
                <button onclick="deleteInstallment('\${inst.id}')" class="text-slate-300 hover:text-rose-600 p-1" title="Hapus">✕</button>
              </div>
            </div>

            <!-- Progress Bar -->
            <div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300 \${isFinished ? 'bg-emerald-500' : 'bg-indigo-600'}" style="width: \${percent}%"></div>
              </div>
              <div class="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>Progress: \${percent}%</span>
                <span>Sisa: \${Math.max(0, inst.totalTenor - inst.paidTenor)} bulan</span>
              </div>
            </div>

            <!-- Tombol Aksi Bayar -->
            <div class="pt-1 flex justify-end">
              <button 
                onclick="payInstallmentMonth('\${inst.id}')" 
                \${isFinished ? 'disabled' : ''}
                class="px-4 py-2 text-xs font-semibold rounded-lg transition duration-150 flex items-center gap-1.5 cursor-pointer \${
                  isFinished 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                }"
              >
                \${isFinished ? '✓ Sudah Lunas' : '✓ Bayar Cicilan Bulan Ini'}
              </button>
            </div>
          \`;
          listEl.appendChild(div);
        });
      }
    }

    // Handlers Transaksi
    document.getElementById('txForm').addEventListener('submit', e => {
      e.preventDefault();
      const desc = document.getElementById('txDescInput').value.trim();
      const amount = Number(document.getElementById('txAmountInput').value);
      const type = document.getElementById('txTypeSelect').value;

      if (!desc || amount <= 0) return;

      const newTx = {
        id: Date.now().toString(),
        desc,
        amount,
        type,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      };
      transactions.unshift(newTx);
      saveAll();
      renderTx();

      document.getElementById('txDescInput').value = '';
      document.getElementById('txAmountInput').value = '';
    });

    window.deleteTx = function(id) {
      transactions = transactions.filter(t => t.id !== id);
      saveAll();
      renderTx();
    };

    // Handlers Tagihan
    document.getElementById('billForm').addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('billNameInput').value.trim();
      const amount = Number(document.getElementById('billAmountInput').value);

      if (!name || amount <= 0) return;

      bills.push({ id: Date.now().toString(), name, amount, isPaid: false });
      saveAll();
      renderBills();

      document.getElementById('billNameInput').value = '';
      document.getElementById('billAmountInput').value = '';
    });

    window.toggleBill = function(id) {
      bills = bills.map(b => {
        if (b.id === id) {
          const next = !b.isPaid;
          if (next) {
            // Otomatis catat ke pengeluaran
            transactions.unshift({
              id: Date.now().toString(),
              desc: 'Tagihan: ' + b.name,
              amount: b.amount,
              type: 'expense',
              date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
            });
            renderTx();
          }
          return { ...b, isPaid: next };
        }
        return b;
      });
      saveAll();
      renderBills();
    };

    window.deleteBill = function(id) {
      bills = bills.filter(b => b.id !== id);
      saveAll();
      renderBills();
    };

    window.resetBillStatus = function() {
      if (confirm('Reset semua tagihan menjadi belum bayar untuk awal bulan baru?')) {
        bills = bills.map(b => ({ ...b, isPaid: false }));
        saveAll();
        renderBills();
      }
    };

    // Handlers Cicilan
    document.getElementById('instForm').addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('instNameInput').value.trim();
      const monthlyAmount = Number(document.getElementById('instAmountInput').value);
      const totalTenor = Number(document.getElementById('instTenorInput').value);

      if (!name || monthlyAmount <= 0 || totalTenor <= 0) return;

      installments.push({
        id: Date.now().toString(),
        name,
        monthlyAmount,
        totalTenor,
        paidTenor: 0
      });
      saveAll();
      renderInstallments();

      document.getElementById('instNameInput').value = '';
      document.getElementById('instAmountInput').value = '';
      document.getElementById('instTenorInput').value = '';
    });

    window.payInstallmentMonth = function(id) {
      installments = installments.map(inst => {
        if (inst.id === id) {
          if (inst.paidTenor >= inst.totalTenor) return inst;
          const next = inst.paidTenor + 1;
          // Otomatis catat ke pengeluaran
          transactions.unshift({
            id: Date.now().toString(),
            desc: \`Cicilan: \${inst.name} (\${next}/\${inst.totalTenor})\`,
            amount: inst.monthlyAmount,
            type: 'expense',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
          });
          renderTx();
          return { ...inst, paidTenor: next };
        }
        return inst;
      });
      saveAll();
      renderInstallments();
    };

    window.deleteInstallment = function(id) {
      installments = installments.filter(i => i.id !== id);
      saveAll();
      renderInstallments();
    };

    // Reset Semua
    document.getElementById('btnResetAll').addEventListener('click', () => {
      if (confirm('Hapus seluruh data transaksi, tagihan, dan cicilan? Tindakan ini tidak dapat dibatalkan.')) {
        transactions = [];
        bills = [];
        installments = [];
        saveAll();
        renderTx();
        renderBills();
        renderInstallments();
      }
    });

    // Inisialisasi awal
    renderTx();
    renderBills();
    renderInstallments();
  </script>
</body>
</html>`;
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(standaloneHtmlCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadStandaloneHtml = () => {
    const blob = new Blob([standaloneHtmlCode], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'buku-kas-tagihan-cicilan.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased pb-16">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">Budgeting DYT</span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full uppercase">
                  Personal
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Buku Kas • Tagihan Rutin • Tracker Cicilan Tenor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCodeModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition cursor-pointer"
              title="Lihat Kode HTML 1 File Standalone"
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">Kode HTML 1 File</span>
            </button>

            <button
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer"
              title="Reset Semua Data"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* 1. DASHBOARD / 3 KARTU RINGKASAN */}
        <section aria-label="Ringkasan Saldo" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Pemasukan */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pemasukan</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-emerald-600 tracking-tight">
                {formatRupiah(totalIncome)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {transactions.filter(t => t.type === 'income').length} transaksi masuk
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Total Pengeluaran */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pengeluaran</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-rose-600 tracking-tight">
                {formatRupiah(totalExpense)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {transactions.filter(t => t.type === 'expense').length} transaksi keluar
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 opacity-20 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Sisa Saldo */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sisa Saldo</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className={`text-2xl font-bold tracking-tight ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatRupiah(balance)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {balance >= 0 ? 'Kondisi Kas Sehat' : 'Defisit Pengeluaran'}
              </p>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 ${balance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'} opacity-20 group-hover:opacity-100 transition-opacity`} />
          </div>
        </section>

        {/* Ringkasan Beban Rutin & Cicilan Bulan Ini */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Tanggungan Rutin Bulan Ini</span>
            </div>
            <p className="text-xs text-slate-300">
              Tagihan belum dibayar: <strong className="text-amber-300">{formatRupiah(unpaidBillsTotal)}</strong> • Cicilan aktif: <strong className="text-indigo-300">{formatRupiah(activeInstallmentsTotal)}/bln</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('tagihan')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Lihat Tagihan
            </button>
            <button
              onClick={() => setActiveTab('cicilan')}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Lihat Cicilan
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION SELECTOR */}
        <div className="flex p-1 bg-slate-200/80 rounded-2xl shadow-inner">
          <button
            onClick={() => setActiveTab('transaksi')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'transaksi'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4 text-indigo-600" />
            <span>Transaksi Kas</span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
              {transactions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tagihan')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'tagihan'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>Tagihan Rutin</span>
            {regularBills.filter(b => !b.isPaid).length > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                {regularBills.filter(b => !b.isPaid).length} Belum
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cicilan')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'cicilan'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Tracker Cicilan</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
              {installments.length}
            </span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: TRANSAKSI KEUANGAN                                */}
        {/* ======================================================== */}
        {activeTab === 'transaksi' && (
          <div className="space-y-6">
            {/* Form Input Transaksi */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <PlusCircle className="w-5 h-5 text-indigo-600" />
                    Catat Transaksi Baru
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Input pemasukan atau pengeluaran harian Anda</p>
                </div>

                <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTxType('expense')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      txType === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('income')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      txType === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Pemasukan
                  </button>
                </div>
              </div>

              {txError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{txError}</span>
                </div>
              )}

              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Keterangan / Sumber
                    </label>
                    <input
                      type="text"
                      value={txDesc}
                      onChange={(e) => setTxDesc(e.target.value)}
                      placeholder={txType === 'income' ? 'Contoh: Gaji, Bonus, Freelance' : 'Contoh: Makan Siang, Bensin, Belanja'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                      required
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Nominal (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="1"
                        value={txAmountRaw}
                        onChange={(e) => setTxAmountRaw(e.target.value)}
                        placeholder="50000"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-6 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Tanggal:</span>
                    <input
                      type="date"
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <button
                      type="submit"
                      className={`w-full py-2.5 px-4 font-semibold text-white rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                        txType === 'expense' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Simpan Transaksi {txType === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </section>

            {/* Riwayat Transaksi */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Riwayat Transaksi</h2>
                  <p className="text-xs text-slate-400">Urut dari transaksi paling baru</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-2.5 py-1 rounded-lg ${filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                    >
                      Semua
                    </button>
                    <button
                      onClick={() => setFilterType('income')}
                      className={`px-2.5 py-1 rounded-lg ${filterType === 'income' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'}`}
                    >
                      Pemasukan
                    </button>
                    <button
                      onClick={() => setFilterType('expense')}
                      className={`px-2.5 py-1 rounded-lg ${filterType === 'expense' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'}`}
                    >
                      Pengeluaran
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTx}
                      onChange={(e) => setSearchTx(e.target.value)}
                      placeholder="Cari..."
                      className="pl-7 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs w-28 sm:w-36 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Belum ada catatan transaksi</h3>
                  <p className="text-xs text-slate-400 mt-1">Masukkan transaksi baru melalui form di atas.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-2">
                  {filteredTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    const isConfirming = deleteConfirmId === tx.id;

                    return (
                      <div key={tx.id} className="py-3 px-2 hover:bg-slate-50 rounded-xl transition flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{tx.description}</p>
                            <p className="text-[11px] text-slate-400">{tx.date}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`text-sm sm:text-base font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                          </span>

                          {isConfirming ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteTx(tx.id)}
                                className="px-2 py-0.5 text-xs bg-rose-600 text-white rounded font-medium cursor-pointer"
                              >
                                Ya
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-0.5 text-xs bg-slate-200 text-slate-700 rounded cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(tx.id)}
                              className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg cursor-pointer transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CHECKLIST TAGIHAN RUTIN                           */}
        {/* ======================================================== */}
        {activeTab === 'tagihan' && (
          <div className="space-y-6">
            {/* Form Tambah Tagihan Rutin */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                Tambah Tagihan Rutin Bulanan
              </h2>

              {billError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{billError}</span>
                </div>
              )}

              <form onSubmit={handleAddRegularBill} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Nama Tagihan
                  </label>
                  <input
                    type="text"
                    value={billName}
                    onChange={(e) => setBillName(e.target.value)}
                    placeholder="Misal: Listrik PLN, WiFi, Kost, Asuransi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Nominal Tagihan (Rp)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={billAmountRaw}
                    onChange={(e) => setBillAmountRaw(e.target.value)}
                    placeholder="350000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Tambah ke Daftar</span>
                  </button>
                </div>
              </form>
            </section>

            {/* Checklist Tagihan */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Checklist Tagihan Bulan Ini</h2>
                  <p className="text-xs text-slate-400">
                    Centang kotak untuk menandai Lunas (otomatis dicatat ke riwayat pengeluaran kas)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetMonthlyBills}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Reset Status ke Belum Bayar
                </button>
              </div>

              {regularBills.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-xs text-slate-400">Belum ada tagihan rutin yang dimasukkan.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-2 space-y-1">
                  {regularBills.map((b) => (
                    <div
                      key={b.id}
                      className={`py-3.5 px-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                        b.isPaid ? 'bg-emerald-50/40 border-emerald-100' : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={b.isPaid}
                          onChange={() => handleToggleBillStatus(b.id)}
                          className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div>
                          <p className={`text-sm font-bold ${b.isPaid ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {b.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              b.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {b.isPaid ? '✓ Sudah Lunas' : 'Belum Dibayar'}
                            </span>
                            <span className="text-[11px] text-slate-400">{b.dueDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-800">{formatRupiah(b.amount)}</span>
                        <button
                          onClick={() => handleDeleteBill(b.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg cursor-pointer transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: TRACKER CICILAN BERJANGKA (INSTALLMENT TRACKER)    */}
        {/* ======================================================== */}
        {activeTab === 'cicilan' && (
          <div className="space-y-6">
            {/* Form Tambah Cicilan Berjangka */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Tambah Cicilan Berjangka (Tenor)
              </h2>

              {instError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{instError}</span>
                </div>
              )}

              <form onSubmit={handleAddInstallment} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Nama Barang / Tagihan
                  </label>
                  <input
                    type="text"
                    value={instName}
                    onChange={(e) => setInstName(e.target.value)}
                    placeholder="Contoh: Smartphone, Laptop, Kulkas"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Nominal per Bulan (Rp)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={instAmountRaw}
                    onChange={(e) => setInstAmountRaw(e.target.value)}
                    placeholder="500000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Total Tenor (Bulan)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={instTotalTenor}
                    onChange={(e) => setInstTotalTenor(e.target.value)}
                    placeholder="6"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>

                <div className="sm:col-span-2 md:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Simpan Tracker Cicilan</span>
                  </button>
                </div>
              </form>
            </section>

            {/* List Tracker Cicilan Berjangka */}
            <section className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <div className="mb-4 pb-2 border-b border-slate-100">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Daftar Tracker Cicilan</h2>
                <p className="text-xs text-slate-400">
                  Pantau progres tenor dan klik tombol "Bayar Cicilan Bulan Ini" untuk mengupdate progres secara otomatis
                </p>
              </div>

              {installments.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-xs text-slate-400">Belum ada cicilan bertenor yang tercatat.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {installments.map((inst) => {
                    const percent = Math.min(100, Math.round((inst.paidTenor / inst.totalTenor) * 100));
                    const isFinished = inst.paidTenor >= inst.totalTenor;
                    const remainingMonths = Math.max(0, inst.totalTenor - inst.paidTenor);
                    const remainingAmount = remainingMonths * inst.monthlyAmount;

                    return (
                      <div
                        key={inst.id}
                        className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4 hover:border-indigo-200 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900">{inst.name}</h3>
                              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                isFinished ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              }`}>
                                {isFinished ? '🎉 Lunas' : `Cicilan ke-${inst.paidTenor} dari ${inst.totalTenor}`}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Nominal: <strong className="text-slate-800">{formatRupiah(inst.monthlyAmount)}</strong> / bulan • Sisa tagihan: <strong className="text-rose-600">{formatRupiah(remainingAmount)}</strong>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                              onClick={() => handleDeleteInstallment(inst.id)}
                              className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar Visual */}
                        <div className="space-y-1.5">
                          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFinished ? 'bg-emerald-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Progres Terbayar: {percent}%</span>
                            <span>{remainingMonths === 0 ? 'Semua bulan telah lunas!' : `Sisa: ${remainingMonths} bulan lagi`}</span>
                          </div>
                        </div>

                        {/* Action Bayar Cicilan Bulan Ini */}
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                          <span className="text-xs text-slate-400">
                            {isFinished ? 'Cicilan ini telah selesai dibayar.' : 'Klik saat Anda telah membayar cicilan periode bulan ini.'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handlePayInstallmentMonth(inst.id)}
                            disabled={isFinished}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                              isFinished
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isFinished ? 'Sudah Lunas' : 'Bayar Cicilan Bulan Ini'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

      </main>

      {/* MODAL RESET SEMUA DATA */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Reset Semua Data?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Tindakan ini akan menghapus semua riwayat transaksi, tagihan rutin, dan data cicilan di browser ini.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetAllData}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
              >
                Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KODE STANDALONE HTML SINGLE-FILE */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-600" />
                  Satu File Kode HTML Lengkap (Buku Kas, Tagihan & Cicilan)
                </h3>
                <p className="text-xs text-slate-500">
                  File standalone mandiri dengan Tailwind CSS CDN & LocalStorage. Tinggal simpan sebagai <code className="text-indigo-600 font-mono">index.html</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-600">
                Fitur lengkap: Dashboard 3 Kartu, Transaksi, Checklist Tagihan Rutin, Tracker Cicilan Tenor
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Semua Kode'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadStandaloneHtml}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .html</span>
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-slate-900 text-slate-200 font-mono text-xs rounded-b-2xl">
              <pre className="whitespace-pre overflow-x-auto leading-relaxed">
                {standaloneHtmlCode}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
