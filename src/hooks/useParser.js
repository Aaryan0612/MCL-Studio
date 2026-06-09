import { useMemo } from 'react';

import { parse } from '@/parser/parser';

export function useParser(rawText) {
  return useMemo(() => {
    try {
      return parse(rawText);
    } catch {
      return {
        tokens: [],
        ast: null,
        errors: [
          {
            type: 'parser_failure',
            code: 'parser_failure',
            severity: 'error',
            message: 'Internal parser failure',
            line: 0,
            column: 0,
          },
        ],
        warnings: [],
        diagnostics: {
          tokenCount: 0,
          astDepth: 0,
          parseTime: 0,
          errorCount: 1,
        },
      };
    }
  }, [rawText]);
}
