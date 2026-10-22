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
  Download, 
  Code2, 
  Check, 
  Copy, 
  AlertCircle,
  Receipt,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export interface Transaction {
  id: number;
  desc: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

export interface RegularBill {
  id: number;
  name: string;
  amount: number;
  paid: boolean;
}

export interface Installment {
  id: number;
  name: string;
  amount: number; // nominal per bulan
  tenor: number;  // total bulan
  paidCount: number; // cicilan ke-
}

export default function App() {
  // --- 1. STATE TRANSAKSI ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('transactions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 1, desc: 'Gaji Bulanan', amount: 6500000, type: 'income', date: 'Hari ini' },
      { id: 2, desc: 'Makan & Belanja Harian', amount: 85000, type: 'expense', date: 'Hari ini' },
      { id: 3, desc: 'Bensin Motor', amount: 35000, type: 'expense', date: 'Kemarin' }
    ];
  });

  // --- 2. STATE TAGIHAN RUTIN ---
  const [bills, setBills] = useState<RegularBill[]>(() => {
    try {
      const saved = localStorage.getItem('bills');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 1, name: 'Listrik PLN Token/Pasca', amount: 350000, paid: true },
      { id: 2, name: 'Internet WiFi IndiHome', amount: 380000, paid: false },
      { id: 3, name: 'BPJS Kesehatan Mandiri', amount: 100000, paid: false }
    ];
  });

  // --- 3. STATE TRACKER CICILAN TENOR ---
  const [installments, setInstallments] = useState<Installment[]>(() => {
    try {
      const saved = localStorage.getItem('installments');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: 1, name: 'Cicilan Smartphone Baru', amount: 750000, tenor: 6, paidCount: 2 },
      { id: 2, name: 'Kulkas 2 Pintu Inverter', amount: 420000, tenor: 12, paidCount: 5 }
    ];
  });

  // Form Inputs: Transaksi
  const [txDesc, setTxDesc] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');

  // Form Inputs: Tagihan
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');

  // Form Inputs: Cicilan
  const [instName, setInstName] = useState('');
  const [instAmount, setInstAmount] = useState('');
  const [instTenor, setInstTenor] = useState('');

  // Filter & Search
  const [txFilter, setTxFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & UI States
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync to LocalStorage (matching exact user keys)
  useEffect(() => {
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (e) { console.error(e); }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('bills', JSON.stringify(bills));
    } catch (e) { console.error(e); }
  }, [bills]);

  useEffect(() => {
    try {
      localStorage.setItem('installments', JSON.stringify(installments));
    } catch (e) { console.error(e); }
  }, [installments]);

  // Formatter Rupiah
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(angka);
  };

  // Dashboard Metrik Kalkulasi
  const totalIncome = useMemo(() => {
    return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const balance = totalIncome - totalExpense;

  const incomeTxCount = useMemo(() => transactions.filter(t => t.type === 'income').length, [transactions]);
  const expenseTxCount = useMemo(() => transactions.filter(t => t.type === 'expense').length, [transactions]);

  const paidBillsCount = useMemo(() => bills.filter(b => b.paid).length, [bills]);
  const activeInstallmentsCount = useMemo(() => installments.filter(i => i.paidCount < i.tenor).length, [installments]);

  // Filtered Transaksi
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (txFilter !== 'all' && t.type !== txFilter) return false;
      if (searchQuery.trim() !== '') {
        return t.desc.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [transactions, txFilter, searchQuery]);

  // --- Handlers Transaksi ---
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDesc = txDesc.trim();
    const cleanAmount = parseFloat(txAmount);

    if (!cleanDesc || isNaN(cleanAmount) || cleanAmount <= 0) return;

    const newTx: Transaction = {
      id: Date.now(),
      desc: cleanDesc,
      amount: cleanAmount,
      type: txType,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    setTransactions([newTx, ...transactions]);
    setTxDesc('');
    setTxAmount('');
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // --- Handlers Tagihan Rutin ---
  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const name = billName.trim();
    const amount = parseFloat(billAmount);

    if (!name || isNaN(amount) || amount <= 0) return;

    const newBill: RegularBill = {
      id: Date.now(),
      name,
      amount,
      paid: false
    };

    setBills([...bills, newBill]);
    setBillName('');
    setBillAmount('');
  };

  const handleToggleBill = (id: number) => {
    setBills(bills.map(b => {
      if (b.id === id) {
        const nextPaid = !b.paid;
        // Jika dicentang LUNAS, otomatis catat ke riwayat pengeluaran
        if (nextPaid) {
          const autoTx: Transaction = {
            id: Date.now(),
            desc: `Tagihan: ${b.name}`,
            amount: b.amount,
            type: 'expense',
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
          };
          setTransactions(prev => [autoTx, ...prev]);
        }
        return { ...b, paid: nextPaid };
      }
      return b;
    }));
  };

  const handleDeleteBill = (id: number) => {
    setBills(bills.filter(b => b.id !== id));
  };

  const handleResetBillsMonth = () => {
    if (confirm('Ubah semua status tagihan menjadi belum lunas untuk awal bulan baru?')) {
      setBills(bills.map(b => ({ ...b, paid: false })));
    }
  };

  // --- Handlers Cicilan Tenor ---
  const handleAddInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    const name = instName.trim();
    const amount = parseFloat(instAmount);
    const tenor = parseInt(instTenor, 10);

    if (!name || isNaN(amount) || amount <= 0 || isNaN(tenor) || tenor <= 0) return;

    const newInst: Installment = {
      id: Date.now(),
      name,
      amount,
      tenor,
      paidCount: 0
    };

    setInstallments([...installments, newInst]);
    setInstName('');
    setInstAmount('');
    setInstTenor('');
  };

  const handlePayInstallment = (id: number) => {
    setInstallments(installments.map(i => {
      if (i.id === id && i.paidCount < i.tenor) {
        const nextPaid = i.paidCount + 1;
        // Catat pengeluaran ke transaksi kas
        const autoTx: Transaction = {
          id: Date.now(),
          desc: `Cicilan: ${i.name} (Ke-${nextPaid}/${i.tenor})`,
          amount: i.amount,
          type: 'expense',
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        };
        setTransactions(prev => [autoTx, ...prev]);
        return { ...i, paidCount: nextPaid };
      }
      return i;
    }));
  };

  const handleDeleteInstallment = (id: number) => {
    setInstallments(installments.filter(i => i.id !== id));
  };

  // Reset Semua Data
  const handleResetAllData = () => {
    setTransactions([]);
    setBills([]);
    setInstallments([]);
    setShowResetModal(false);
  };

  // Standalone HTML template dengan judul Budgeting DYT
  const standaloneHtmlCode = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Budgeting DYT</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#4f46e5',
                    }
                }
            }
        }
    </script>
    <!-- Google Font Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen pb-12 antialiased">

    <!-- Header / Navbar -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center space-x-3">
                <div class="bg-primary text-white p-2.5 rounded-xl shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-lg font-bold text-slate-900 leading-tight">Budgeting DYT</h1>
                    <p class="text-xs text-slate-500">Buku Kas • Tagihan Rutin • Tracker Cicilan Tenor</p>
                </div>
            </div>
            <button onclick="resetAllData()" class="text-xs bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg font-medium hover:bg-rose-100 transition cursor-pointer">
                Reset Data
            </button>
        </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 mt-6 space-y-6">

        <!-- Dashboard Ringkasan (3 Kotak Metrik) -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Pemasukan -->
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pemasukan</p>
                        <h3 id="totalIncome" class="text-2xl font-bold text-emerald-600 mt-1">Rp 0</h3>
                    </div>
                    <div class="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                    </div>
                </div>
                <p id="incomeCount" class="text-xs text-slate-400 mt-3">0 transaksi masuk</p>
            </div>

            <!-- Pengeluaran -->
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pengeluaran</p>
                        <h3 id="totalExpense" class="text-2xl font-bold text-rose-600 mt-1">Rp 0</h3>
                    </div>
                    <div class="bg-rose-50 p-2 rounded-xl text-rose-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>
                    </div>
                </div>
                <p id="expenseCount" class="text-xs text-slate-400 mt-3">0 transaksi keluar</p>
            </div>

            <!-- Saldo -->
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Sisa Saldo</p>
                        <h3 id="totalBalance" class="text-2xl font-bold text-slate-900 mt-1">Rp 0</h3>
                    </div>
                    <div class="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                    </div>
                </div>
                <p id="balanceStatus" class="text-xs text-slate-400 mt-3">Kondisi Kas Aman</p>
            </div>
        </section>

        <!-- Form & Riwayat Transaksi -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Form Input Transaksi -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
                <h2 class="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span class="bg-primary/10 text-primary p-1.5 rounded-lg text-xs">➕</span> Tambah Transaksi
                </h2>
                <form id="transactionForm" class="space-y-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Keterangan / Sumber</label>
                        <input type="text" id="desc" required placeholder="Contoh: Gaji, Belanja, Bensin" class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Nominal (Rp)</label>
                        <input type="number" id="amount" required placeholder="Contoh: 500000" class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Tipe Transaksi</label>
                        <select id="type" class="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary cursor-pointer">
                            <option value="expense">Pengeluaran (Expense)</option>
                            <option value="income">Pemasukan (Income)</option>
                        </select>
                    </div>
                    <button type="submit" class="w-full bg-primary text-white font-medium py-2.5 px-4 rounded-xl text-sm hover:bg-indigo-700 transition shadow-md shadow-indigo-100 cursor-pointer">
                        Simpan Transaksi
                    </button>
                </form>
            </div>

            <!-- List Riwayat Transaksi -->
            <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span class="bg-primary/10 text-primary p-1.5 rounded-lg text-xs">📋</span> Riwayat Transaksi
                    </h2>
                    <span id="txCountBadge" class="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">0 Catatan</span>
                </div>
                <div class="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
                    <div id="transactionList" class="space-y-2.5">
                        <!-- Data dimasukkan lewat JavaScript -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Bagian Tagihan & Cicilan Tenor -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Tagihan Rutin Bulanan -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span class="bg-amber-50 text-amber-600 p-1.5 rounded-lg text-xs">💡</span> Tagihan Rutin Bulanan
                    </h2>
                    <span id="billSummary" class="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">0 Lunas</span>
                </div>
                <form id="billForm" class="flex gap-2 mb-4">
                    <input type="text" id="billName" placeholder="Nama Tagihan (Listrik, Wifi)" required class="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary">
                    <input type="number" id="billAmount" placeholder="Nominal" required class="w-28 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary">
                    <button type="submit" class="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-700 transition cursor-pointer">+</button>
                </form>
                <div id="billList" class="space-y-2 max-h-[250px] overflow-y-auto pr-1"></div>
            </div>

            <!-- Tracker Cicilan Berjangka (Tenor) -->
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span class="bg-blue-50 text-blue-600 p-1.5 rounded-lg text-xs">⏳</span> Tracker Cicilan Tenor
                    </h2>
                    <span id="installmentSummary" class="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">0 Aktif</span>
                </div>
                <form id="installmentForm" class="space-y-3 mb-4">
                    <input type="text" id="instName" placeholder="Nama Cicilan (Misal: Cicilan Motor)" required class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary">
                    <div class="grid grid-cols-2 gap-2">
                        <input type="number" id="instAmount" placeholder="Nominal / Bulan" required class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary">
                        <input type="number" id="instTenor" placeholder="Total Tenor (Bulan)" required class="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary">
                    </div>
                    <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition cursor-pointer">Tambah Cicilan</button>
                </form>
                <div id="installmentList" class="space-y-3 max-h-[220px] overflow-y-auto pr-1"></div>
            </div>
        </div>

    </main>

    <!-- JavaScript Aplikasi -->
    <script>
        let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        let bills = JSON.parse(localStorage.getItem('bills')) || [];
        let installments = JSON.parse(localStorage.getItem('installments')) || [];

        function formatRupiah(angka) {
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
        }

        // --- TRANSAKSI ---
        document.getElementById('transactionForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const desc = document.getElementById('desc').value.trim();
            const amount = parseFloat(document.getElementById('amount').value);
            const type = document.getElementById('type').value;

            if (!desc || isNaN(amount) || amount <= 0) return;

            transactions.unshift({ 
                id: Date.now(), 
                desc, 
                amount, 
                type, 
                date: new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) 
            });
            saveAndRender();
            this.reset();
        });

        function deleteTransaction(id) {
            transactions = transactions.filter(t => t.id !== id);
            saveAndRender();
        }

        // --- TAGIHAN RUTIN ---
        document.getElementById('billForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('billName').value.trim();
            const amount = parseFloat(document.getElementById('billAmount').value);

            if (!name || isNaN(amount) || amount <= 0) return;

            bills.push({ id: Date.now(), name, amount, paid: false });
            saveAndRender();
            this.reset();
        });

        function toggleBill(id) {
            bills = bills.map(b => {
                if (b.id === id) {
                    const next = !b.paid;
                    if (next) {
                        transactions.unshift({
                            id: Date.now(),
                            desc: 'Tagihan: ' + b.name,
                            amount: b.amount,
                            type: 'expense',
                            date: new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})
                        });
                    }
                    return { ...b, paid: next };
                }
                return b;
            });
            saveAndRender();
        }

        function deleteBill(id) {
            bills = bills.filter(b => b.id !== id);
            saveAndRender();
        }

        // --- CICILAN TENOR ---
        document.getElementById('installmentForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('instName').value.trim();
            const amount = parseFloat(document.getElementById('instAmount').value);
            const tenor = parseInt(document.getElementById('instTenor').value);

            if (!name || isNaN(amount) || amount <= 0 || isNaN(tenor) || tenor <= 0) return;

            installments.push({ id: Date.now(), name, amount, tenor, paidCount: 0 });
            saveAndRender();
            this.reset();
        });

        function payInstallment(id) {
            installments = installments.map(i => {
                if (i.id === id && i.paidCount < i.tenor) {
                    const next = i.paidCount + 1;
                    transactions.unshift({
                        id: Date.now(),
                        desc: \`Cicilan: \${i.name} (Ke-\${next}/\${i.tenor})\`,
                        amount: i.amount,
                        type: 'expense',
                        date: new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})
                    });
                    return { ...i, paidCount: next };
                }
                return i;
            });
            saveAndRender();
        }

        function deleteInstallment(id) {
            installments = installments.filter(i => i.id !== id);
            saveAndRender();
        }

        function resetAllData() {
            if(confirm('Yakin ingin mereset seluruh data catatan?')) {
                transactions = [];
                bills = [];
                installments = [];
                saveAndRender();
            }
        }

        function saveAndRender() {
            localStorage.setItem('transactions', JSON.stringify(transactions));
            localStorage.setItem('bills', JSON.stringify(bills));
            localStorage.setItem('installments', JSON.stringify(installments));
            render();
        }

        function render() {
            // Dashboard Calculation
            let totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            let totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            let balance = totalIncome - totalExpense;

            document.getElementById('totalIncome').innerText = formatRupiah(totalIncome);
            document.getElementById('incomeCount').innerText = \`\${transactions.filter(t => t.type === 'income').length} transaksi masuk\`;

            document.getElementById('totalExpense').innerText = formatRupiah(totalExpense);
            document.getElementById('expenseCount').innerText = \`\${transactions.filter(t => t.type === 'expense').length} transaksi keluar\`;

            const balEl = document.getElementById('totalBalance');
            balEl.innerText = formatRupiah(balance);
            balEl.className = \`text-2xl font-bold mt-1 \${balance < 0 ? 'text-rose-600' : 'text-slate-900'}\`;

            const balStatus = document.getElementById('balanceStatus');
            balStatus.innerText = balance < 0 ? 'Perhatian: Defisit Pengeluaran' : 'Kondisi Kas Sehat';

            // Render Transactions
            const txList = document.getElementById('transactionList');
            const txBadge = document.getElementById('txCountBadge');
            if (txBadge) txBadge.innerText = \`\${transactions.length} Catatan\`;

            if (transactions.length === 0) {
                txList.innerHTML = \`<p class="text-xs text-slate-400 text-center py-6">Belum ada catatan transaksi.</p>\`;
            } else {
                txList.innerHTML = transactions.map(t => \`
                    <div class="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition">
                        <div>
                            <p class="text-sm font-semibold text-slate-800">\${t.desc}</p>
                            <p class="text-[11px] text-slate-400">\${t.date}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-sm font-bold \${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}">
                                \${t.type === 'income' ? '+' : '-'} \${formatRupiah(t.amount)}
                            </span>
                            <button onclick="deleteTransaction(\${t.id})" class="text-slate-300 hover:text-rose-500 text-xs px-1.5 py-1 cursor-pointer">✕</button>
                        </div>
                    </div>
                \`).join('');
            }

            // Render Bills
            const billList = document.getElementById('billList');
            let paidBillsCount = bills.filter(b => b.paid).length;
            document.getElementById('billSummary').innerText = \`\${paidBillsCount}/\${bills.length} Lunas\`;

            if (bills.length === 0) {
                billList.innerHTML = \`<p class="text-xs text-slate-400 text-center py-4">Belum ada tagihan rutin.</p>\`;
            } else {
                billList.innerHTML = bills.map(b => \`
                    <div class="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                        <label class="flex items-center gap-2.5 cursor-pointer flex-1">
                            <input type="checkbox" \${b.paid ? 'checked' : ''} onclick="toggleBill(\${b.id})" class="w-4 h-4 accent-indigo-600 rounded cursor-pointer">
                            <span class="text-sm \${b.paid ? 'line-through text-slate-400 font-normal' : 'text-slate-700 font-medium'}">\${b.name}</span>
                        </label>
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-semibold text-slate-600">\${formatRupiah(b.amount)}</span>
                            <button onclick="deleteBill(\${b.id})" class="text-slate-300 hover:text-rose-500 text-xs cursor-pointer">✕</button>
                        </div>
                    </div>
                \`).join('');
            }

            // Render Installments
            const instList = document.getElementById('installmentList');
            document.getElementById('installmentSummary').innerText = \`\${installments.length} Aktif\`;

            if (installments.length === 0) {
                instList.innerHTML = \`<p class="text-xs text-slate-400 text-center py-4">Belum ada cicilan tenor.</p>\`;
            } else {
                instList.innerHTML = installments.map(i => {
                    let progressPercent = Math.min(100, Math.round((i.paidCount / i.tenor) * 100));
                    let isCompleted = i.paidCount >= i.tenor;
                    return \`
                        <div class="p-3 bg-slate-50 rounded-xl space-y-2">
                            <div class="flex justify-between items-center">
                                <span class="text-sm font-semibold text-slate-800">\${i.name}</span>
                                <button onclick="deleteInstallment(\${i.id})" class="text-slate-300 hover:text-rose-500 text-xs cursor-pointer">✕</button>
                            </div>
                            <div class="flex justify-between text-xs text-slate-500">
                                <span>Cicilan ke-<b>\${i.paidCount}</b> dari \${i.tenor}</span>
                                <span class="font-semibold text-indigo-600">\${formatRupiah(i.amount)}/bln</span>
                            </div>
                            <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div class="bg-indigo-600 h-full transition-all duration-300" style="width: \${progressPercent}%"></div>
                            </div>
                            <div class="flex justify-between items-center pt-1">
                                <span class="text-[11px] text-slate-400">\${isCompleted ? '🎉 Lunas' : progressPercent + '% Selesai'}</span>
                                \${!isCompleted ? \`<button onclick="payInstallment(\${i.id})" class="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-medium hover:bg-indigo-100 transition cursor-pointer">Bayar Bulan Ini</button>\` : '<span class="text-xs text-emerald-600 font-bold">Lunas Sempurna</span>'}
                            </div>
                        </div>
                    \`;
                }).join('');
            }
        }

        render();
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
    a.download = 'budgeting-dyt.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen pb-12 antialiased">
      {/* Header / Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">Budgeting DYT</h1>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full uppercase">
                  Personal
                </span>
              </div>
              <p className="text-xs text-slate-500">Buku Kas • Tagihan Rutin • Tracker Cicilan Tenor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCodeModal(true)}
              className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100 transition flex items-center gap-1.5 cursor-pointer"
              title="Salin File HTML Tunggal"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kode HTML 1 File</span>
            </button>

            <button
              onClick={() => setShowResetModal(true)}
              className="text-xs bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-lg font-medium hover:bg-rose-100 transition cursor-pointer"
            >
              Reset Data
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">

        {/* Dashboard Ringkasan (3 Kotak Metrik) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pemasukan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pemasukan</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatRupiah(totalIncome)}</h3>
              </div>
              <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">{incomeTxCount} transaksi masuk</p>
          </div>

          {/* Pengeluaran */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pengeluaran</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{formatRupiah(totalExpense)}</h3>
              </div>
              <div className="bg-rose-50 p-2 rounded-xl text-rose-600">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">{expenseTxCount} transaksi keluar</p>
          </div>

          {/* Saldo */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sisa Saldo</p>
                <h3 className={`text-2xl font-bold mt-1 ${balance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                  {formatRupiah(balance)}
                </h3>
              </div>
              <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">
              {balance < 0 ? 'Perhatian: Defisit Pengeluaran' : 'Kondisi Kas Sehat'}
            </p>
          </div>
        </section>

        {/* Form & Riwayat Transaksi (Side-by-side) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Input Transaksi */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg text-xs">➕</span> Tambah Transaksi
            </h2>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan / Sumber</label>
                <input
                  type="text"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  required
                  placeholder="Contoh: Gaji, Belanja, Bensin"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  min="1"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  required
                  placeholder="Contoh: 500000"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tipe Transaksi</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as 'income' | 'expense')}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 transition cursor-pointer"
                >
                  <option value="expense">Pengeluaran (Expense)</option>
                  <option value="income">Pemasukan (Income)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-medium py-2.5 px-4 rounded-xl text-sm hover:bg-indigo-700 transition shadow-md shadow-indigo-100 cursor-pointer"
              >
                Simpan Transaksi
              </button>
            </form>
          </div>

          {/* List Riwayat Transaksi */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg text-xs">📋</span> Riwayat Transaksi
              </h2>

              {/* Filter Buttons & Search */}
              <div className="flex items-center gap-2">
                <div className="inline-flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setTxFilter('all')}
                    className={`px-2 py-0.5 rounded-md ${txFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'}`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxFilter('income')}
                    className={`px-2 py-0.5 rounded-md ${txFilter === 'income' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-slate-500'}`}
                  >
                    Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxFilter('expense')}
                    className={`px-2 py-0.5 rounded-md ${txFilter === 'expense' ? 'bg-white text-rose-700 shadow-xs font-semibold' : 'text-slate-500'}`}
                  >
                    Keluar
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari..."
                    className="pl-6 pr-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-24 sm:w-32 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
              <div className="space-y-2.5">
                {filteredTransactions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Belum ada catatan transaksi.</p>
                ) : (
                  filteredTransactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-sm font-semibold text-slate-800 truncate">{t.desc}</p>
                        <p className="text-[11px] text-slate-400">{t.date}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`text-sm font-bold ${
                            t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {t.type === 'income' ? '+' : '-'} {formatRupiah(t.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="text-slate-300 hover:text-rose-500 text-xs px-1.5 py-1 transition cursor-pointer"
                          title="Hapus"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bagian Tagihan & Cicilan Tenor (Side-by-side) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tagihan Rutin Bulanan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-amber-50 text-amber-600 p-1.5 rounded-lg text-xs">💡</span> Tagihan Rutin Bulanan
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                  {paidBillsCount}/{bills.length} Lunas
                </span>
                {bills.length > 0 && (
                  <button
                    onClick={handleResetBillsMonth}
                    className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                    title="Ubah semua jadi belum bayar untuk awal bulan baru"
                  >
                    Reset Bulan
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleAddBill} className="flex gap-2 mb-4">
              <input
                type="text"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                placeholder="Nama Tagihan (Listrik, Wifi)"
                required
                className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
              />
              <input
                type="number"
                min="1"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
                placeholder="Nominal"
                required
                className="w-28 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
              />
              <button
                type="submit"
                className="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-700 transition cursor-pointer"
              >
                +
              </button>
            </form>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {bills.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Belum ada tagihan rutin.</p>
              ) : (
                bills.map((b) => (
                  <div key={b.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 pr-2">
                      <input
                        type="checkbox"
                        checked={b.paid}
                        onChange={() => handleToggleBill(b.id)}
                        className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                      />
                      <span
                        className={`text-sm truncate ${
                          b.paid ? 'line-through text-slate-400 font-normal' : 'text-slate-700 font-medium'
                        }`}
                      >
                        {b.name}
                      </span>
                    </label>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold text-slate-600">{formatRupiah(b.amount)}</span>
                      <button
                        onClick={() => handleDeleteBill(b.id)}
                        className="text-slate-300 hover:text-rose-500 text-xs px-1 cursor-pointer"
                        title="Hapus"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tracker Cicilan Berjangka (Tenor) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-blue-50 text-blue-600 p-1.5 rounded-lg text-xs">⏳</span> Tracker Cicilan Tenor
              </h2>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                {activeInstallmentsCount} Aktif
              </span>
            </div>

            <form onSubmit={handleAddInstallment} className="space-y-3 mb-4">
              <input
                type="text"
                value={instName}
                onChange={(e) => setInstName(e.target.value)}
                placeholder="Nama Cicilan (Misal: Cicilan Motor)"
                required
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="1"
                  value={instAmount}
                  onChange={(e) => setInstAmount(e.target.value)}
                  placeholder="Nominal / Bulan"
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={instTenor}
                  onChange={(e) => setInstTenor(e.target.value)}
                  placeholder="Total Tenor (Bulan)"
                  required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition cursor-pointer"
              >
                Tambah Cicilan
              </button>
            </form>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {installments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Belum ada cicilan tenor.</p>
              ) : (
                installments.map((i) => {
                  const progressPercent = Math.min(100, Math.round((i.paidCount / i.tenor) * 100));
                  const isCompleted = i.paidCount >= i.tenor;

                  return (
                    <div key={i.id} className="p-3 bg-slate-50 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-800 truncate">{i.name}</span>
                        <button
                          onClick={() => handleDeleteInstallment(i.id)}
                          className="text-slate-300 hover:text-rose-500 text-xs px-1 cursor-pointer"
                          title="Hapus"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Cicilan ke-<b>{i.paidCount}</b> dari {i.tenor}</span>
                        <span className="font-semibold text-indigo-600">{formatRupiah(i.amount)}/bln</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[11px] text-slate-400">
                          {isCompleted ? '🎉 Lunas' : `${progressPercent}% Selesai`}
                        </span>
                        {!isCompleted ? (
                          <button
                            onClick={() => handlePayInstallment(i.id)}
                            className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-medium hover:bg-indigo-100 transition cursor-pointer"
                          >
                            Bayar Bulan Ini
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold">Lunas Sempurna</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </main>

      {/* Modal Reset All Data */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Reset Semua Data?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Yakin ingin mereset seluruh data transaksi, tagihan rutin, dan cicilan tenor? Tindakan ini tidak dapat dibatalkan.
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

      {/* Modal Kode HTML Standalone */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-600" />
                  Satu File Kode HTML Lengkap - Budgeting DYT
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
                Fitur lengkap: Dashboard 3 Kartu, Transaksi, Tagihan Rutin & Tracker Cicilan Tenor
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
