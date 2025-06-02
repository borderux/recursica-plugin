import { useFigma } from '@/hooks/useFigma';
import { Flex, Tabs } from '@/ui-kit';
import { VariablesPanel, IconsPanel } from '@/components';
import { useEffect, useState } from 'react';

export function Offline() {
  const { metadata } = useFigma();
  const [tabState, setTabState] = useState<string | null>('connect');

  useEffect(() => {
    setTabState(metadata?.projectType === 'icons' ? 'icons' : 'variables');
  }, [metadata]);

  return (
    <Flex direction={'column'} h='100vh' overFlow='hidden'>
      <Tabs value={tabState} onChange={setTabState}>
        <Tabs.List justify='center' p='xs' pb={0}>
          <Tabs.Tab value='variables'>Variables</Tabs.Tab>
          <Tabs.Tab value='icons'>Icons</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='variables'>
          <VariablesPanel />
        </Tabs.Panel>

        <Tabs.Panel value='icons'>
          <IconsPanel />
        </Tabs.Panel>
      </Tabs>
    </Flex>
  );
}
