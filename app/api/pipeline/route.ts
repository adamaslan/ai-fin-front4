import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { revalidatePath } from 'next/cache';
import { validateSymbols } from '@/lib/validation/symbols';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { symbols, withAI } = await request.json();

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json(
        { error: 'symbols array required' },
        { status: 400 }
      );
    }

    const validSymbols = symbols
      .map((s: string) => s.toUpperCase().trim())
      .filter((s: string) => /^[A-Z]{1,5}$/.test(s))
      .slice(0, 10);

    if (validSymbols.length === 0) {
      return NextResponse.json({ error: 'No valid symbols' }, { status: 400 });
    }

    const pipelinePath = process.env.PYTHON_PIPELINE_PATH;
    if (!pipelinePath) {
      return NextResponse.json(
        { error: 'Pipeline path not configured' },
        { status: 500 }
      );
    }

    const aiFlag = withAI ? '--ai' : '';
    const command = `python main.py ${validSymbols.join(' ')} ${aiFlag} --export firebase`;

    const { stdout, stderr } = await execAsync(command, {
      cwd: pipelinePath,
      timeout: 180000,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
      },
    });

    for (const symbol of validSymbols) {
      revalidatePath(`/analysis/${symbol}`);
    }
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      symbols: validSymbols,
      output: stdout,
    });
  } catch (error) {
    console.error('Pipeline error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Pipeline failed',
      },
      { status: 500 }
    );
  }
}
