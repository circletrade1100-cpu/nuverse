import type { Range } from 'xlsx';
import * as XLSX from 'xlsx';

export interface TUDailyCashTransaction {
  id: number;
  tanggal: string;
  kategori: string;
  deskripsi?: string;
  pemasukan: number;
  pengeluaran: number;
  unit?: string;
  unit_sekolah_id?: number | null;
  status?: string;
  dibayar_oleh?: string;
  payment_method?: string | null;
  payment_method_label?: string | null;
}

interface SignatureBlock {
  mengetahui: string;
  diperiksa: string;
  bendahara: string;
  location: string;
  dateLabel: string;
}

interface ExportTuDailyCashReportOptions {
  kategoriOrder: string[];
  periodLabel: string;
  reportDateLabel: string;
  unitName: string;
  filename: string;
  transactions: TUDailyCashTransaction[];
  signature?: SignatureBlock;
}

const padRow = (row: Array<string | number | null>): Array<string | number | null> => {
  const padded = [...row];
  while (padded.length < 5) {
    padded.push(null);
  }
  return padded;
};

const getPaymentMethodLabel = (transaction: TUDailyCashTransaction) => {
  const rawMethod =
    transaction.payment_method_label ||
    transaction.payment_method ||
    transaction.dibayar_oleh ||
    transaction.unit ||
    'Metode Lainnya';

  return (rawMethod || 'Metode Lainnya').toString().trim() || 'Metode Lainnya';
};

const defaultSignature: SignatureBlock = {
  mengetahui: 'Nova Rabi\'ah N, SE',
  diperiksa: 'Windiarti, SE',
  bendahara: 'Dzul Fadli Athaillah, SE',
  location: 'Bekasi',
  dateLabel: ''
};

export const exportTuDailyCashReport = ({
  kategoriOrder,
  periodLabel,
  reportDateLabel,
  unitName,
  filename,
  transactions,
  signature
}: ExportTuDailyCashReportOptions) => {
  if (!transactions.length) {
    throw new Error('Tidak ada data transaksi untuk diekspor.');
  }

  const signatureInfo = {
    ...defaultSignature,
    ...(signature || {})
  };

  const groupedTransactions: Record<
    string,
    Record<string, { pemasukan: number; pengeluaran: number }>
  > = {};
  const paymentMethodOrder: string[] = [];
  const categoryOrder = [...kategoriOrder];

  transactions.forEach((transaction) => {
    if (!categoryOrder.includes(transaction.kategori)) {
      categoryOrder.push(transaction.kategori);
    }

    const methodLabel = getPaymentMethodLabel(transaction);

    if (!groupedTransactions[methodLabel]) {
      groupedTransactions[methodLabel] = {};
      paymentMethodOrder.push(methodLabel);
    }

    const categoryLabel =
      (transaction.kategori || 'Kategori Lainnya').trim() || 'Kategori Lainnya';

    if (!groupedTransactions[methodLabel][categoryLabel]) {
      groupedTransactions[methodLabel][categoryLabel] = {
        pemasukan: 0,
        pengeluaran: 0
      };
    }

    groupedTransactions[methodLabel][categoryLabel].pemasukan +=
      Number(transaction.pemasukan) || 0;
    groupedTransactions[methodLabel][categoryLabel].pengeluaran +=
      Number(transaction.pengeluaran) || 0;
  });

  const sheetData: Array<Array<string | number | null>> = [];

  sheetData.push(padRow(['LAPORAN KAS HARIAN (DAILY REPORT)']));
  sheetData.push(padRow([]));
  sheetData.push(padRow([`Hari / Tanggal : ${reportDateLabel}`]));
  sheetData.push(padRow([`Periode : ${periodLabel}`]));
  sheetData.push(padRow([`Unit : ${unitName}`]));
  sheetData.push(padRow([]));

  sheetData.push(
    padRow(['No', 'Penerimaan (Debet / transfer)', 'Terima', 'Keluar', 'Saldo'])
  );

  let totalPemasukan = 0;
  let totalPengeluaran = 0;
  let runningSaldo = 0;

  paymentMethodOrder.forEach((methodLabel, index) => {
    sheetData.push(padRow([index + 1, methodLabel, null, null, null]));

    categoryOrder.forEach((categoryName) => {
      const categoryTotals =
        groupedTransactions[methodLabel][categoryName] || {
          pemasukan: 0,
          pengeluaran: 0
        };
      const pemasukan = categoryTotals.pemasukan;
      const pengeluaran = categoryTotals.pengeluaran;
      const hasAmount = pemasukan !== 0 || pengeluaran !== 0;

      if (hasAmount) {
        totalPemasukan += pemasukan;
        totalPengeluaran += pengeluaran;
        runningSaldo += pemasukan - pengeluaran;
      }

      sheetData.push(
        padRow([
          '',
          categoryName,
          hasAmount && pemasukan > 0 ? pemasukan : '-',
          hasAmount && pengeluaran > 0 ? pengeluaran : '-',
          hasAmount ? runningSaldo : '-'
        ])
      );
    });

    if (index < paymentMethodOrder.length - 1) {
      sheetData.push(padRow([]));
    }
  });

  sheetData.push(padRow([]));

  sheetData.push(
    padRow([
      null,
      'Total Penerimaan (Debet/transfer)',
      totalPemasukan,
      totalPengeluaran > 0 ? totalPengeluaran : '-',
      totalPemasukan - totalPengeluaran
    ])
  );

  sheetData.push(padRow([]));

  const signatureRowLabel = `${signatureInfo.location}, ${signatureInfo.dateLabel}`.trim();
  sheetData.push(
    padRow([
      'Mengetahui,',
      '',
      'Diperiksa oleh,',
      '',
      signatureRowLabel || signatureInfo.location
    ])
  );
  sheetData.push(padRow([]));
  sheetData.push(
    padRow([
      signatureInfo.mengetahui,
      '',
      signatureInfo.diperiksa,
      '',
      signatureInfo.bendahara
    ])
  );

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  const mergeIfFound = (
    predicate: (row: Array<string | number | null>) => boolean
  ): Range | null => {
    const rowIndex = sheetData.findIndex(predicate);
    if (rowIndex >= 0) {
      return { s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 4 } };
    }
    return null;
  };

  const mengetahuiRowIdx = sheetData.findIndex(
    (row) => typeof row[0] === 'string' && row[0] === 'Mengetahui,'
  );

  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    mergeIfFound((row) => typeof row[0] === 'string' && row[0].startsWith('Hari / Tanggal')),
    mergeIfFound((row) => typeof row[0] === 'string' && row[0].startsWith('Periode')),
    mergeIfFound((row) => typeof row[0] === 'string' && row[0].startsWith('Unit')),
    mengetahuiRowIdx >= 0 ? { s: { r: mengetahuiRowIdx, c: 0 }, e: { r: mengetahuiRowIdx, c: 1 } } : null,
    mengetahuiRowIdx >= 0 ? { s: { r: mengetahuiRowIdx, c: 2 }, e: { r: mengetahuiRowIdx, c: 3 } } : null
  ].filter((merge): merge is Range => merge !== null);

  worksheet['!merges'] = merges;

  const applyCellStyle = (
    rowIdx: number,
    colIdx: number,
    style: Partial<XLSX.CellObject['s']>
  ) => {
    const cellAddress = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx });
    const cell = worksheet[cellAddress];
    if (!cell) return;

    cell.s = cell.s || {};

    if (style.font) {
      cell.s.font = { ...(cell.s.font || {}), ...style.font };
    }
    if (style.alignment) {
      cell.s.alignment = { ...(cell.s.alignment || {}), ...style.alignment };
    }
    if (style.fill) {
      cell.s.fill = { ...(cell.s.fill || {}), ...style.fill };
    }
    if (style.border) {
      cell.s.border = { ...(cell.s.border || {}), ...style.border };
    }
  };

  applyCellStyle(0, 0, {
    font: { bold: true, sz: 16 },
    alignment: { horizontal: 'center' }
  });

  sheetData.forEach((row, rowIdx) => {
    row.forEach((value, colIdx) => {
      if (rowIdx === 6) {
        applyCellStyle(rowIdx, colIdx, {
          font: { bold: true },
          alignment: { horizontal: colIdx === 1 ? 'left' : 'center' }
        });
      } else if (typeof value === 'number') {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx });
        const cell = worksheet[cellAddress];
        if (cell) {
          cell.t = 'n';
          cell.z = '#,##0';
          applyCellStyle(rowIdx, colIdx, {
            alignment: { horizontal: 'right' }
          });
        }
      } else if (value === '-') {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx });
        const cell = worksheet[cellAddress];
        if (cell) {
          cell.t = 's';
          cell.v = '-';
          applyCellStyle(rowIdx, colIdx, {
            alignment: { horizontal: colIdx === 1 ? 'left' : 'center' }
          });
        }
      }
    });
  });

  const totalRowIdx = sheetData.findIndex(
    (row) =>
      typeof row[1] === 'string' && row[1] === 'Total Penerimaan (Debet/transfer)'
  );
  if (totalRowIdx >= 0) {
    for (let colIdx = 0; colIdx <= 4; colIdx++) {
      applyCellStyle(totalRowIdx, colIdx, {
        font: { bold: true }
      });
    }
  }

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 35 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 }
  ];

  const workbook = XLSX.utils.book_new();
  const sheetName = unitName.replace(/[\\\/\?\*\[\]:]/g, '').substring(0, 31) || 'Laporan TU';
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, filename);
};

export default exportTuDailyCashReport;

