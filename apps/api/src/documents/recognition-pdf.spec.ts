import PDFKit from 'pdfkit';
import { decodePDFRawStream, PDFDict, PDFDocument, PDFName, PDFRawStream } from 'pdf-lib';
import { Status } from '@repo/types';
import { renderRecognition, RecognitionContent } from './recognition-pdf';

describe('recognition PDF', () => {
  const content: RecognitionContent = {
    issuedAt: new Date('2026-11-18T18:00:00Z'),
    folio: '123', year: 2026, userName: 'María Peña',
    projectName: 'Proyecto de investigación', objective: 'Investigar',
    projectStatus: 'En progreso', progress: 33,
    impacts: ['Educación'], sustainability: [], priorities: [],
    lines: [], subcategories: [],
    activities: [
      { name: 'Actividad completada', status: Status.COMPLETED },
      { name: 'Actividad en progreso', status: Status.PROGRESS },
      { name: 'Actividad pendiente', status: Status.PENDING },
    ],
  };

  async function textRuns(pdf: Buffer) {
    const document = await PDFDocument.load(pdf);
    const runs: { text: string; font: string; x: number; y: number; page: number }[] = [];
    for (const [, object] of document.context.enumerateIndirectObjects()) {
      if (!(object instanceof PDFRawStream) || object.dict.get(PDFName.of('Subtype')) !== PDFName.of('Form')) continue;
      const resources = object.dict.lookup(PDFName.of('Resources'), PDFDict);
      const fonts = resources.lookup(PDFName.of('Font'), PDFDict);
      if (!fonts.has(PDFName.of('F1')) || !fonts.has(PDFName.of('F2'))) continue;
      const fontNames = ['F1', 'F2'].map((name) =>
        fonts.lookup(PDFName.of(name), PDFDict).lookup(PDFName.of('BaseFont'), PDFName).decodeText(),
      );
      if (fontNames.join(',') !== 'Helvetica,Helvetica-Bold') continue;
      const page = runs.length ? Math.max(...runs.map((run) => run.page)) + 1 : 0;
      const stream = Buffer.from(decodePDFRawStream(object).decode()).toString('latin1');
      const pattern = /BT\s+1 0 0 1 ([\d.-]+) ([\d.-]+) Tm\s+\/(F[12]) \d+ Tf\s+\[([^\]]+)\] TJ\s+ET/g;
      for (const match of stream.matchAll(pattern)) {
        const text = Array.from(match[4].matchAll(/<([0-9a-f]+)>/g), (part) =>
          Buffer.from(part[1], 'hex').toString('latin1'),
        ).join('');
        runs.push({ text, font: fontNames[match[3] === 'F1' ? 0 : 1], x: Number(match[1]), y: Number(match[2]), page });
      }
    }
    return runs;
  }

  it('bolds the requested text while preserving subject alignment and paragraph justification', async () => {
    const runs = await textRuns(await renderRecognition({
      ...content,
      userName: 'María Fernanda Pérez Aguilar de la Vega',
    }));
    const subject = runs.find((run) => run.text === 'Asunto');
    const suffix = runs.find((run) => run.text === ': Constancia de investigación');
    expect(subject?.font).toBe('Helvetica-Bold');
    expect(suffix?.font).toBe('Helvetica');
    expect(subject?.y).toBe(suffix?.y);

    const metrics = new PDFKit({ autoFirstPage: false }).fontSize(10);
    expect(suffix!.x + metrics.font('Helvetica').widthOfString(suffix!.text)).toBeCloseTo(547, 1);
    expect(runs.find((run) => run.text === 'CONSTAR')?.font).toBe('Helvetica-Bold');
    for (const word of ['María', 'Fernanda', 'Pérez', 'Aguilar', 'Vega', 'En', 'progreso', '33%']) {
      expect(runs.find((run) => run.text === word)?.font).toBe('Helvetica-Bold');
    }
    expect(runs.find((run) => run.text === 'que')?.font).toBe('Helvetica');
    expect(runs.find((run) => run.text === '.')?.font).toBe('Helvetica');

    const first = runs.find((run) => run.text === 'La')!;
    const last = runs.find((run) => run.text === 'hace')!;
    expect(first.x).toBe(65);
    expect(last.y).toBe(first.y);
    expect(last.x + metrics.font('Helvetica').widthOfString(last.text)).toBeCloseTo(547, 1);
    metrics.end();
  });

  it('keeps long wrapped and unbroken names and statuses inside page margins', async () => {
    const userName = `María ${'W'.repeat(2500)} Peña`;
    const projectStatus = `Estado ${'M'.repeat(180)} final`;
    const pdf = await renderRecognition({ ...content, userName, projectStatus });
    const runs = await textRuns(pdf);
    const start = runs.findIndex((run) => run.text === 'CONSTAR');
    const end = runs.findIndex((run, index) => index > start && run.text === 'Características del Proyecto');
    const paragraph = runs.slice(start, end);
    const boldText = paragraph.filter((run) => run.font === 'Helvetica-Bold').map((run) => run.text).join('');
    expect(boldText).toBe(`CONSTAR${userName.replace(/\s+/g, '')}${projectStatus.replace(/\s+/g, '')}33%`);
    expect((await PDFDocument.load(pdf)).getPageCount()).toBeGreaterThan(1);

    const metrics = new PDFKit({ autoFirstPage: false }).fontSize(10);
    for (const run of paragraph) {
      expect(run.x).toBeGreaterThanOrEqual(65);
      expect(run.x + metrics.font(run.font).widthOfString(run.text)).toBeLessThanOrEqual(547.01);
      expect(run.y).toBeGreaterThanOrEqual(80);
      expect(run.y).toBeLessThanOrEqual(707);
    }
    metrics.end();
  });

  it('renders every page when the activities and project details span multiple pages', async () => {
    const pdf = await renderRecognition({
      ...content,
      objective: 'Un objetivo extenso '.repeat(100),
      activities: Array.from({ length: 60 }, (_, i) => ({
        name: `Actividad ${i + 1}`,
        status: Status.PENDING,
      })),
    });
    const document = await PDFDocument.load(pdf);
    expect(document.getPageCount()).toBeGreaterThan(1);
    for (const page of document.getPages()) {
      expect(page.getWidth()).toBe(612);
      expect(page.getHeight()).toBe(792);
    }
  });

  it('fails explicitly when the letterhead is unavailable', async () => {
    const previous = process.env.LETTERHEAD_PATH;
    process.env.LETTERHEAD_PATH = 'nonexistent-letterhead.pdf';
    try {
      await expect(renderRecognition(content)).rejects.toThrow();
    } finally {
      if (previous === undefined) delete process.env.LETTERHEAD_PATH;
      else process.env.LETTERHEAD_PATH = previous;
    }
  });
});
