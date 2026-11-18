import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import PDFDocument from 'pdfkit';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { Status } from '@repo/types';

export type RecognitionContent = {
  issuedAt: Date;
  folio: string;
  year: number;
  userName: string;
  projectName: string;
  objective: string;
  projectStatus: string;
  progress: number;
  startDate?: Date;
  endDate?: Date;
  impacts: string[];
  sustainability: string[];
  priorities: string[];
  lines: string[];
  subcategories: string[];
  activities: { name: string; status: Status; dueDate?: Date }[];
};

const date = (value?: Date) =>
  value
    ? new Intl.DateTimeFormat('es-MX', {
        day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Mexico_City',
      }).format(new Date(value))
    : 'No especificada';

type TextRun = { text: string; bold: boolean };

function justifiedText(doc: PDFKit.PDFDocument, runs: TextRun[]) {
  const left = doc.page.margins.left;
  const width = doc.page.width - left - doc.page.margins.right;
  const font = (bold: boolean) => doc.font(bold ? 'Helvetica-Bold' : 'Helvetica');
  const measure = (run: TextRun) => font(run.bold).widthOfString(run.text);
  const words: TextRun[][] = [];
  let word: TextRun[] = [];
  for (const run of runs) {
    for (const part of run.text.match(/\s+|\S+/gu) || []) {
      if (/^\s/u.test(part)) {
        if (word.length) words.push(word);
        word = [];
      } else {
        word.push({ text: part, bold: run.bold });
      }
    }
  }
  if (word.length) words.push(word);

  const spaceWidth = measure({ text: ' ', bold: false });
  const lines: { words: TextRun[][]; width: number }[] = [];
  let line: TextRun[][] = [];
  let lineWidth = 0;
  const finishLine = () => {
    if (line.length) lines.push({ words: line, width: lineWidth });
    line = [];
    lineWidth = 0;
  };
  for (const originalWord of words) {
    let remaining = originalWord;
    let wordWidth = remaining.reduce((sum, run) => sum + measure(run), 0);
    if (line.length && lineWidth + spaceWidth + wordWidth > width) finishLine();

    while (wordWidth > width) {
      const piece: TextRun[] = [];
      let pieceWidth = 0;
      const rest: TextRun[] = [];
      for (const [index, run] of remaining.entries()) {
        const chars = Array.from(run.text);
        let low = 0;
        let high = chars.length;
        while (low < high) {
          const middle = Math.ceil((low + high) / 2);
          if (pieceWidth + measure({ text: chars.slice(0, middle).join(''), bold: run.bold }) <= width) {
            low = middle;
          } else {
            high = middle - 1;
          }
        }
        if (low) {
          const prefix = { text: chars.slice(0, low).join(''), bold: run.bold };
          piece.push(prefix);
          pieceWidth += measure(prefix);
        }
        if (low < chars.length) {
          rest.push({ text: chars.slice(low).join(''), bold: run.bold });
        }
        if (rest.length) {
          rest.push(...remaining.slice(index + 1));
          break;
        }
      }
      if (!piece.length) throw new Error('El ancho de página es insuficiente para el texto de la constancia.');
      lines.push({ words: [piece], width: pieceWidth });
      remaining = rest;
      wordWidth = remaining.reduce((sum, run) => sum + measure(run), 0);
    }
    if (remaining.length) {
      lineWidth += (line.length ? spaceWidth : 0) + wordWidth;
      line.push(remaining);
    }
  }
  finishLine();

  const lineHeight = font(false).currentLineHeight(true);
  lines.forEach((current, index) => {
    if (doc.y + lineHeight > doc.page.height - doc.page.margins.bottom) doc.addPage();
    const y = doc.y;
    const gap = current.words.length > 1 && index < lines.length - 1
      ? spaceWidth + (width - current.width) / (current.words.length - 1)
      : spaceWidth;
    let x = left;
    for (const currentWord of current.words) {
      for (const run of currentWord) {
        font(run.bold).text(run.text, x, y, { lineBreak: false });
        x += measure(run);
      }
      x += gap;
    }
    doc.x = left;
    doc.y = y + lineHeight;
  });
  font(false);
}

export async function renderRecognition(content: RecognitionContent): Promise<Buffer> {
  const templatePath = process.env.LETTERHEAD_PATH ||
    resolve(__dirname, '../../../web/app/letterhead.pdf');
  const template = await PDFLibDocument.load(await readFile(templatePath));
  if (template.getPageCount() !== 1) {
    throw new Error('El membrete debe ser un PDF de una sola página.');
  }
  const { width, height } = template.getPage(0).getSize();
  const doc = new PDFDocument({
    size: [width, height],
    margins: { top: 85, bottom: 80, left: 65, right: 65 },
    autoFirstPage: true,
  });
  const chunks: Buffer[] = [];
  const rendered = new Promise<Buffer>((resolveBuffer, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolveBuffer(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
  doc.font('Helvetica').fontSize(10);
  doc.text(`Querétaro, Qro., ${date(content.issuedAt)}`, { align: 'right' });
  doc.text(`UTEQ/DPIDT/INV/${content.folio}/${content.year}`, { align: 'right' });
  const subject = 'Asunto';
  const subjectSuffix = ': Constancia de investigación';
  const subjectBoldWidth = doc.font('Helvetica-Bold').widthOfString(subject);
  const subjectWidth = subjectBoldWidth + doc.font('Helvetica').widthOfString(subjectSuffix);
  const subjectX = width - doc.page.margins.right - subjectWidth;
  const subjectY = doc.y;
  doc.font('Helvetica-Bold').text(subject, subjectX, subjectY, { lineBreak: false });
  doc.font('Helvetica').text(subjectSuffix, subjectX + subjectBoldWidth, subjectY, { lineBreak: false });
  doc.x = doc.page.margins.left;
  doc.y = subjectY + doc.currentLineHeight(true);
  doc.moveDown(1.5);
  doc.font('Helvetica-Bold').text('A QUIEN CORRESPONDA');
  doc.moveDown();
  justifiedText(doc.font('Helvetica'), [
    { text: 'La Dirección de Posgrado, Investigación y Desarrollo Tecnológico, por medio de la presente, hace ', bold: false },
    { text: 'CONSTAR', bold: true },
    { text: ' que ', bold: false },
    { text: content.userName, bold: true },
    { text: ' se encuentra desarrollando el siguiente proyecto registrado en el sistema PREP, el cual presenta un estado actual de ', bold: false },
    { text: content.projectStatus, bold: true },
    { text: ' con un avance general del ', bold: false },
    { text: `${content.progress}%`, bold: true },
    { text: '.', bold: false },
  ]);
  doc.moveDown();
  doc.font('Helvetica-Bold').text('Características del Proyecto');
  doc.moveDown(0.5);

  const rows: [string, string][] = [
    ['Campo', 'Detalle / Especificación'],
    ['Título del Proyecto', content.projectName],
    ['Objetivo General', content.objective],
    ['Periodo de Ejecución', `${date(content.startDate)} - ${date(content.endDate)}`],
    ['Impactos Transversales', content.impacts.join(', ') || 'No especificados'],
    ['Objetivos Sustentables', content.sustainability.join(', ') || 'No especificados'],
    ['Prioridades PND', content.priorities.join(', ') || 'No especificadas'],
    ['Áreas del conocimiento', content.lines.join(', ') || 'No especificadas'],
    ['LIIADTs Asociadas', content.subcategories.join(', ') || 'No especificadas'],
  ];
  const left = doc.page.margins.left;
  const tableWidth = width - left - doc.page.margins.right;
  const labelWidth = tableWidth * 0.34;
  const lineHeight = 12;

  const wrap = (text: string, available: number) => {
    const result: string[] = [];
    let line = '';
    for (const word of text.split(/\s+/)) {
      let remaining = word;
      while (remaining) {
        const candidate = line ? `${line} ${remaining}` : remaining;
        if (doc.widthOfString(candidate) <= available) {
          line = candidate;
          break;
        }
        if (line) {
          result.push(line);
          line = '';
          continue;
        }
        let length = remaining.length;
        while (length > 1 && doc.widthOfString(remaining.slice(0, length)) > available) length--;
        result.push(remaining.slice(0, length));
        remaining = remaining.slice(length);
      }
    }
    if (line) result.push(line);
    return result.length ? result : [''];
  };
  rows.forEach(([label, value], rowIndex) => {
    doc.font(rowIndex === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
    const labels = wrap(label, labelWidth - 10);
    const values = wrap(value, tableWidth - labelWidth - 10);
    let offset = 0;
    const lines = Math.max(labels.length, values.length);
    while (offset < lines) {
      let capacity = Math.floor((height - doc.page.margins.bottom - doc.y - 8) / lineHeight);
      if (capacity < 1) {
        doc.addPage();
        capacity = Math.floor((height - doc.page.margins.bottom - doc.y - 8) / lineHeight);
      }
      const count = Math.min(capacity, lines - offset);
      const y = doc.y;
      const rowHeight = count * lineHeight + 8;
      doc.rect(left, y, labelWidth, rowHeight).stroke();
      doc.rect(left + labelWidth, y, tableWidth - labelWidth, rowHeight).stroke();
      for (let i = 0; i < count; i++) {
        if (labels[offset + i]) doc.text(labels[offset + i], left + 5, y + 4 + i * lineHeight, { lineBreak: false });
        if (values[offset + i]) doc.text(values[offset + i], left + labelWidth + 5, y + 4 + i * lineHeight, { lineBreak: false });
      }
      doc.x = left;
      doc.y = y + rowHeight;
      offset += count;
    }
  });
  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(10).text('Estado Actual de las Actividades');
  doc.font('Helvetica');
  for (const [label, status] of [
    ['Completadas', Status.COMPLETED],
    ['En Progreso', Status.PROGRESS],
    ['Pendientes', Status.PENDING],
  ] as const) {
    const activities = content.activities.filter((activity) => activity.status === status);
    doc.moveDown(0.4).font('Helvetica-Bold').text(`${label}:`);
    doc.font('Helvetica');
    if (!activities.length) doc.text('Ninguna', { indent: 12 });
    for (const activity of activities) {
      doc.text(`• ${activity.name} (Fecha de vencimiento: ${date(activity.dueDate)})`, { indent: 12 });
    }
  }
  doc.moveDown(2);
  doc.font('Helvetica-Bold').text('ATENTAMENTE', { align: 'center' });
  doc.moveDown(3);
  doc.text('Dr. Juan Manuel Peña Aguilar', { align: 'center' });
  doc.font('Helvetica').text('Director de Posgrado, Investigación y Desarrollo Tecnológico', { align: 'center' });
  doc.end();

  const textPdf = await PDFLibDocument.load(await rendered);
  const result = await PDFLibDocument.create();
  const [background] = await result.embedPdf(await template.save(), [0]);
  const textPages = await result.embedPdf(
    await textPdf.save(),
    textPdf.getPageIndices(),
  );
  for (const textPage of textPages) {
    const page = result.addPage([width, height]);
    page.drawPage(background);
    page.drawPage(textPage);
  }
  return Buffer.from(await result.save());
}
