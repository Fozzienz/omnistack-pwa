import { BullionItem, BullionMetal, BullionForm } from '@/types';

export interface CsvParseResult {
  items: Omit<BullionItem, 'id'>[];
  errors: string[];
}

const REQUIRED_HEADERS = [
  'name',
  'metal',
  'form',
  'weightOzt',
  'purity',
  'quantity',
  'purchasePrice',
  'purchaseDate',
];

export function parseBullionCsv(csvText: string): CsvParseResult {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== '');
  const errors: string[] = [];
  const items: Omit<BullionItem, 'id'>[] = [];

  if (lines.length < 2) {
    return { items: [], errors: ['CSV file is empty or missing headers.'] };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h.toLowerCase()));

  if (missingHeaders.length > 0) {
    return {
      items: [],
      errors: [`Missing required column headers: ${missingHeaders.join(', ')}`],
    };
  }

  const headerIndices = {
    name: headers.indexOf('name'),
    metal: headers.indexOf('metal'),
    form: headers.indexOf('form'),
    weightOzt: headers.indexOf('weightozt'),
    purity: headers.indexOf('purity'),
    quantity: headers.indexOf('quantity'),
    purchasePrice: headers.indexOf('purchaseprice'),
    purchaseDate: headers.indexOf('purchasedate'),
    notes: headers.indexOf('notes'),
  };

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(',').map((cell) => cell.trim());
    if (row.length === 1 && row[0] === '') continue;

    const rowNum = i + 1;
    const metalStr = row[headerIndices.metal];
    const formStr = row[headerIndices.form];
    const weight = parseFloat(row[headerIndices.weightOzt]);
    const purity = parseFloat(row[headerIndices.purity]);
    const quantity = parseInt(row[headerIndices.quantity], 10);
    const purchasePrice = parseFloat(row[headerIndices.purchasePrice]);
    const purchaseDate = row[headerIndices.purchaseDate];

    if (isNaN(weight) || weight <= 0) {
      errors.push(`Row ${rowNum}: Invalid weight '${row[headerIndices.weightOzt]}'.`);
      continue;
    }

    if (isNaN(quantity) || quantity <= 0) {
      errors.push(`Row ${rowNum}: Invalid quantity '${row[headerIndices.quantity]}'.`);
      continue;
    }

    const price = isNaN(purchasePrice) ? 0 : purchasePrice;
    const dateVal = purchaseDate || new Date().toISOString().split('T')[0];

    items.push({
      name: row[headerIndices.name] || 'Unnamed Bullion Item',
      metal: metalStr as BullionMetal,
      form: formStr as BullionForm,
      weightOzt: weight,
      purity: isNaN(purity) ? 0.999 : purity,
      quantity,
      pricePaidAud: price,
      purchasePrice: price,
      date: dateVal,
      purchaseDate: dateVal,
      notes: headerIndices.notes !== -1 ? row[headerIndices.notes] || '' : '',
    });
  }

  return { items, errors };
}

export function generateCsvTemplate(): string {
  const headers = REQUIRED_HEADERS.join(',') + ',notes';
  const exampleRow1 = '1oz Perth Mint Gold Kangaroo,Gold,Coin,1.0,0.9999,1,3850.00,2026-01-15,Proof edition in capsule';
  const exampleRow2 = '1kg ABC Silver Cast Bar,Silver,Bar,32.1507,0.999,2,1450.00,2026-03-10,Cast silver bar';
  return `${headers}\n${exampleRow1}\n${exampleRow2}`;
}

export function exportLedgerToCsv(items: BullionItem[]): string {
  const headers = REQUIRED_HEADERS.join(',') + ',notes';
  const rows = items.map((item) =>
    [
      `"${item.name.replace(/"/g, '""')}"`,
      item.metal,
      item.form,
      item.weightOzt,
      item.purity,
      item.quantity,
      item.pricePaidAud ?? item.purchasePrice ?? 0,
      item.date ?? item.purchaseDate ?? '',
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ].join(',')
  );
  return [headers, ...rows].join('\n');
}