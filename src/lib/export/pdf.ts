import { storeRenderData } from './render-store';
import type { ResumeData } from '@/lib/templates/types';

const LAUNCH_ARGS = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];
const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

async function getBrowser() {
  const puppeteer = await import('puppeteer');
  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
  return puppeteer.launch({
    headless: true,
    args: LAUNCH_ARGS,
    ...(executablePath ? { executablePath } : {}),
  });
}

async function urlToPdf(url: string): Promise<Buffer> {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForNetworkIdle({ timeout: 10_000 });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export async function renderToPdf(data: ResumeData, templateId: string): Promise<Buffer> {
  const token = storeRenderData(data, templateId);
  return urlToPdf(`${BASE_URL}/export-preview/${token}`);
}

export async function renderResumeWithCoverLetterPdf(
  data: ResumeData,
  templateId: string,
  coverLetterHtml: string
): Promise<Buffer> {
  const token = storeRenderData(data, templateId, coverLetterHtml);
  return urlToPdf(`${BASE_URL}/export-preview/${token}`);
}

export async function renderCoverLetterOnlyPdf(htmlContent: string): Promise<Buffer> {
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @page { margin: 0; size: A4; }
  body { margin: 0; padding: 0.5in; font-family: Georgia, "Times New Roman", serif; font-size: 11pt; line-height: 1.6; color: #1a1a1a; }
  p { margin-bottom: 8pt; }
</style>
</head>
<body>${htmlContent}</body>
</html>`;

  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
