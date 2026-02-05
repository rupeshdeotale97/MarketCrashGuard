import { NextRequest, NextResponse } from 'next/server';
import { analyzeStatement } from '@/ai/flows/analyze-statement-flow';

// Add a dummy DOMMatrix class to the global scope
(global as any).DOMMatrix = class DOMMatrix {};

const pdf = require('pdf-parse');

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const password = formData.get('password') as string;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    let textContent = '';

    if (file.type === 'application/pdf') {
      const options = {
        ...(password && { password }),
      };
      const data = await pdf(Buffer.from(arrayBuffer), options);
      textContent = data.text;
    } else {
      textContent = Buffer.from(arrayBuffer).toString('utf-8');
    }

    const result = await analyzeStatement(textContent, password);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error processing file:', error);
    if (error.name === 'InvalidPDFException') {
      return NextResponse.json({ error: 'Invalid or corrupted PDF file.' }, { status: 400 });
    }
    if (error.message && error.message.includes('password')) {
      return NextResponse.json({ error: 'Incorrect password or a password is required to open the PDF.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process and analyze the file.' }, { status: 500 });
  }
}
