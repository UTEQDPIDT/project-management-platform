import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import PDFDocument from 'pdfkit';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import { RecognitionType, Status } from '@repo/types';

export type RecognitionContent = {
  recognitionType: RecognitionType;
  issuedAt: Date;
  folio: string;
  year: number;
  userName: string;
  userTitle: string;
  userTeamMembership: string; // e.g., "Líder de Grupo de Investigación", "Miembro de Grupo de Investigación", or "Líder de Proyecto"
  projectName: string;
  objective: string;
  projectStatus: string;
  progress: number;
  organization: string;
  program: string;
  trlRating: number;
  impactLevel: string;
  startDate?: Date;
  endDate?: Date;
  impacts: string[];
  sustainability: string[];
  priorities: string[];
  lines: string[];
  subcategories: string[];
  activeTeamMembers: { name: string; type: string }[]; // name and tipo (maestro/estudiante)
  team?: string; // Team name or null
  activities: { name: string; status: Status; dueDate?: Date }[];
  customHours?: number;
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
  
  if (content.recognitionType === RecognitionType.RECOMENDACION) {
    renderRecomendacion(doc, content);
  } else {
    renderConstancia(doc, content);
  }
  
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

function renderActivityWithIndentation(doc: PDFKit.PDFDocument, activity: { name: string; dueDate?: Date }) {
  const left = doc.page.margins.left;
  const width = doc.page.width - left - doc.page.margins.right;
  const bulletIndent = 12;
  const bulletWidth = doc.widthOfString('• ');
  const textIndent = bulletIndent + bulletWidth;
  
  const text = `${activity.name} (Fecha de vencimiento: ${date(activity.dueDate)})`;
  const availableWidth = width - textIndent;
  
  // Split text manually to handle indentation
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of text.split(/\s+/)) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (doc.widthOfString(testLine) <= availableWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  for (let i = 0; i < lines.length; i++) {
    if (i === 0) {
      doc.text(`• ${lines[i]}`, { indent: bulletIndent });
    } else {
      doc.text(lines[i], { indent: textIndent });
    }
  }
}

function renderConstancia(doc: PDFKit.PDFDocument, content: RecognitionContent) {
  const subject = 'Asunto';
  const subjectSuffix = ': Constancia de investigación';
  const width = doc.page.width;
  const height = doc.page.height;
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
    { text: 'constar', bold: true },
    { text: ' que el/la ', bold: false },
    { text: `${content.userTitle} ${content.userName}`, bold: true },
    { text: ' se encuentra registrado(a) como ', bold: false },
    { text: content.userTeamMembership, bold: true },
    { text: ' en la Plataforma de Registro de Eventos y Proyectos (PREP) de la Universidad Tecnológica de Querétaro, desarrollando el proyecto titulado: ', bold: false },
  ]);
  
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text(content.projectName, { align: 'center' });
  doc.moveDown(0.5);
  
  justifiedText(doc.font('Helvetica'), [
    { text: 'A continuación, se detallan las características generales del proyecto registrado en la Plataforma: ', bold: false },
  ]);
  
  doc.moveDown(0.5);
  renderProjectTable(doc, content, width, height);
  
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(10).text('Objetivo del proyecto:');
  doc.font('Helvetica').fontSize(10);
  justifiedText(doc, [{ text: content.objective, bold: false }]);
  
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text('Cronograma de actividades registradas:');
  
  const completedActivities = content.activities.filter(a => a.status === Status.COMPLETED);
  const inProgressActivities = content.activities.filter(a => a.status === Status.PROGRESS);
  const pendingActivities = content.activities.filter(a => a.status === Status.PENDING);
  
  if (completedActivities.length > 0) {
    doc.font('Helvetica-Bold').fontSize(9).text('Completadas:', { indent: 0 });
    doc.font('Helvetica').fontSize(9);
    completedActivities.forEach(activity => {
      renderActivityWithIndentation(doc, activity);
    });
  }
  
  if (inProgressActivities.length > 0) {
    doc.font('Helvetica-Bold').fontSize(9).text('En Progreso:', { indent: 0 });
    doc.font('Helvetica').fontSize(9);
    inProgressActivities.forEach(activity => {
      renderActivityWithIndentation(doc, activity);
    });
  }
  
  if (pendingActivities.length > 0) {
    doc.font('Helvetica-Bold').fontSize(9).text('Pendientes:', { indent: 0 });
    doc.font('Helvetica').fontSize(9);
    pendingActivities.forEach(activity => {
      renderActivityWithIndentation(doc, activity);
    });
  }
  
  doc.moveDown(1.5);
  doc.fontSize(10);
  justifiedText(doc, [
    { text: 'Se extiende la presente constancia a petición del/la interesado(a) y para los fines académicos o administrativos a los que haya lugar. ', bold: false },
  ]);
  
  doc.moveDown(2);
  doc.font('Helvetica-Bold').text('ATENTAMENTE', { align: 'center' });
  doc.moveDown(3);
  doc.font('Helvetica-Bold').text('Dr. Juan Manuel Peña Aguilar', { align: 'center' });
  doc.font('Helvetica').text('Director de Posgrado, Investigación y Desarrollo Tecnológico', { align: 'center' });
}

function renderRecomendacion(doc: PDFKit.PDFDocument, content: RecognitionContent) {
  const subject = 'Asunto';
  const subjectSuffix = ': Recomendación de horas';
  const width = doc.page.width;
  const height = doc.page.height;
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
    { text: 'constar', bold: true },
    { text: ' que el/la ', bold: false },
    { text: `${content.userTitle} ${content.userName}`, bold: true },
    { text: ' se encuentra registrado(a) como ', bold: false },
    { text: content.userTeamMembership, bold: true },
    { text: ' en la Plataforma de Registro de Eventos y Proyectos (PREP) de la Universidad Tecnológica de Querétaro, desarrollando el proyecto titulado: ', bold: false },
  ]);
  
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text(content.projectName, { align: 'center' });
  doc.moveDown(0.5);
  
  justifiedText(doc.font('Helvetica'), [
    { text: 'A continuación, se detallan las características generales del proyecto registrado en la Plataforma: ', bold: false },
  ]);
  
  doc.moveDown(0.5);
  renderProjectTable(doc, content, width, height);
  
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(10).text('Objetivo del proyecto:');
  doc.font('Helvetica').fontSize(10);
  justifiedText(doc, [{ text: content.objective, bold: false }]);
  
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text('Cronograma de actividades registradas:');
  
  const completedActivities = content.activities.filter(a => a.status === Status.COMPLETED);
  const inProgressActivities = content.activities.filter(a => a.status === Status.PROGRESS);
  const pendingActivities = content.activities.filter(a => a.status === Status.PENDING);
  
  if (completedActivities.length > 0) {
    doc.font('Helvetica-Bold').fontSize(9).text('Completadas:', { indent: 0 });
    doc.font('Helvetica').fontSize(9);
    completedActivities.forEach(activity => {
      renderActivityWithIndentation(doc, activity);
    });
  }
  
  if (inProgressActivities.length > 0) {
    doc.font('Helvetica-Bold').fontSize(9).text('En Progreso:', { indent: 0 });
    doc.font('Helvetica').fontSize(9);
    inProgressActivities.forEach(activity => {
      renderActivityWithIndentation(doc, activity);
    });
  }
  
  if (pendingActivities.length > 0) {
    doc.font('Helvetica-Bold').fontSize(9).text('Pendientes:', { indent: 0 });
    doc.font('Helvetica').fontSize(9);
    pendingActivities.forEach(activity => {
      renderActivityWithIndentation(doc, activity);
    });
  }
  
  doc.moveDown(1.5);
  doc.fontSize(10);
  justifiedText(doc, [
    { text: 'Con base en lo anterior, la recomendación de la Dirección de Posgrado, Investigación y Desarrollo Tecnológico para la División Académica de adscripción del/la maestro(a), es otorgar un total de ', bold: false },
    { text: `${content.customHours || 0}`, bold: true },
    { text: ' horas a la semana para el desarrollo del proyecto. ', bold: false },
  ]);
  
  doc.moveDown(0.5);
  justifiedText(doc, [
    { text: 'Se extiende la presente constancia a petición del/la interesado(a) y para los fines académicos o administrativos a los que haya lugar. ', bold: false },
  ]);
  
  doc.moveDown(2);
  doc.font('Helvetica-Bold').text('ATENTAMENTE', { align: 'center' });
  doc.moveDown(3);
  doc.font('Helvetica-Bold').text('Dr. Juan Manuel Peña Aguilar', { align: 'center' });
  doc.font('Helvetica').text('Director de Posgrado, Investigación y Desarrollo Tecnológico', { align: 'center' });
}

function renderProjectTable(doc: PDFKit.PDFDocument, content: RecognitionContent, width: number, height: number) {
  const rows: [string, string][] = [
    ['Campo', 'Especificación'],
    ['Organización', content.organization],
    ['Programa', content.program],
    ['Periodo de Ejecución', `${date(content.startDate)} - ${date(content.endDate)}`],
    ['Estatus y Avance', `${content.projectStatus} (Avance registrado del ${content.progress}%)`],
    ['Nivel de TRL', `Nivel ${content.trlRating}`],
    ['Nivel de Impacto', content.impactLevel],
    ['Área del Conocimiento', content.lines.join(', ') || 'No especificadas'],
    ['LIIADTs Asociadas', content.subcategories.join(', ') || 'No especificadas'],
    ['Grupo de investigación', content.team || '-'],
    ['Miembros del Grupo de Investigación que participan en el proyecto', 
      content.activeTeamMembers.length > 0 
        ? content.activeTeamMembers.map(m => `• ${m.name} (${m.type})`).join('\n')
        : '-'],
  ];

  const left = doc.page.margins.left;
  const tableWidth = width - left - doc.page.margins.right;
  const labelWidth = tableWidth * 0.34;
  const lineHeight = 12;

  const wrap = (text: string, available: number) => {
    const result: string[] = [];
    // First split by explicit newlines to handle multi-line content
    const lines = text.split('\n');
    
    for (const line of lines) {
      let currentLine = '';
      for (const word of line.split(/\s+/)) {
        let remaining = word;
        while (remaining) {
          const candidate = currentLine ? `${currentLine} ${remaining}` : remaining;
          if (doc.widthOfString(candidate) <= available) {
            currentLine = candidate;
            break;
          }
          if (currentLine) {
            result.push(currentLine);
            currentLine = '';
            continue;
          }
          let length = remaining.length;
          while (length > 1 && doc.widthOfString(remaining.slice(0, length)) > available) length--;
          result.push(remaining.slice(0, length));
          remaining = remaining.slice(length);
        }
      }
      if (currentLine) result.push(currentLine);
    }
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
}
