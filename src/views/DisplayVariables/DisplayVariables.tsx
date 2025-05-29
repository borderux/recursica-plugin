import { useFigma } from '@/hooks/useFigma';
import { Flex, Title, Button, Anchor } from '@/ui-kit';
import { useMemo } from 'react';

export function DisplayVariables(): JSX.Element {
  const { variables, metadata } = useFigma();
  const variablesData = useMemo(() => {
    return 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(variables, null, 2));
  }, [variables]);
  const variablesCount = useMemo(() => {
    if (variables) {
      return Object.keys(variables.variables).length;
    }
    return undefined;
  }, [variables]);

  const filename = useMemo(() => {
    if (metadata?.projectType === 'themes') {
      return `recursica-${metadata?.theme}-theme.json`;
    }
    return `recursica-${metadata?.projectType}.json`;
  }, [metadata]);

  return (
    <Flex flex={1} direction={'column'} gap={'md'} p={'sm'}>
      <Title align={'center'} order={2}>
        Project variables
      </Title>
      <Button
        label={`Publish ${variablesCount} variables`}
        component={Anchor}
        href={variablesData}
        download={filename}
        underline='never'
        loading={!variables}
      />
    </Flex>
  );
}
