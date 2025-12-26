'use server';

import { revalidatePath } from 'next/cache';
import { exec } from 'child_process';
import { promisify } from 'util';
import { validateSymbols } from '@/lib/validation/symbols';

const execAsync = promisify(exec);

interface RunAnalysisResult {
  success: boolean;
  message: string;
  symbols?: string[];
}

export async function runAnalysis(formData: FormData): Promise<RunAnalysisResult> {
  const symbolsInput = formData.get('symbols') as string;
  const withAI = formData.get('withAI') === 'true';

  if (!symbolsInput) {
    return { success: false, message: 'No symbols provided' };
  }

  const symbols = validateSymbols(symbolsInput);

  if (symbols.length === 0) {
    return { success: false, message: 'Invalid symbols' };
  }

  const pipelinePath = process.env.PYTHON_PIPELINE_PATH;
  if (!pipelinePath) {
    return { success: false, message: 'Pipeline path not configured' };
  }

  try {
    const aiFlag = withAI ? '--ai' : '';
    const command = `python main.py ${symbols.join(' ')} ${aiFlag} --export firebase`;

    await execAsync(command, {
      cwd: pipelinePath,
      timeout: 120000,
    });

    for (const symbol of symbols) {
      revalidatePath(`/analysis/${symbol}`);
    }
    revalidatePath('/');

    return {
      success: true,
      message: `Analysis complete for ${symbols.length} symbols`,
      symbols,
    };
  } catch (error) {
    console.error('Pipeline error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Pipeline failed',
    };
  }
}

export async function refreshAnalysis(symbol: string): Promise<void> {
  revalidatePath(`/analysis/${symbol}`);
  revalidatePath('/');
}
