import { useMemo } from 'react';

import { Anchor, Button, Flex } from '@/ui-kit';
import { useFigma } from '@/hooks/useFigma';

export function Footer() {
  const {
    tokens: { codeTokens },
    metadata: { filename },
  } = useFigma();

  const variablesData = useMemo(() => {
    return (
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(codeTokens, null, 2))
    );
  }, [codeTokens]);
  return (
    <Flex direction={'column'} p={'sm'}>
      <Button disabled={!codeTokens} flex={1}>
        {codeTokens ? (
          <Anchor
            href={variablesData}
            download={`${filename || 'recursica'}.json`}
            underline='never'
            c={'white'}
          >
            Download
          </Anchor>
        ) : (
          'Download'
        )}
      </Button>
    </Flex>
  );
}
