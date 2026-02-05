import { NextResponse } from "next/server";
import { analyzeStatement } from '@/ai/flows/analyze-statement-flow';
// Use the legacy build for Node.js environments
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

// In a Node.js environment, you need to provide a worker.
// The `pdf.worker.mjs` file is included in the `pdfjs-dist` package.
import path from 'path';
pdfjs.GlobalWorkerOptions.workerSrc = path.resolve(
  process.cwd(),
  'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'
);

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const password = formData.get("password") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const data = new Uint8Array(await file.arrayBuffer());

    const loadingTask = pdfjs.getDocument({
      data,
      password: password ?? undefined,
    });

    const pdf = await loadingTask.promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      fullText +=
        content.items.map((item: any) => item.str).join(" ") + "\n";
    }

    const result = await analyzeStatement(fullText);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
