import { useFigma } from '@/hooks/useFigma';
import { Flex, Tabs } from '@/ui-kit';
import { DisplayVariables, DisplayIcons } from '@/views';
import { useEffect, useState } from 'react';

export function Home() {
  const { metadata } = useFigma();
  const [tabState, setTabState] = useState<string | null>('variables');

  useEffect(() => {
    setTabState(metadata?.projectType === 'icons' ? 'icons' : 'variables');
  }, [metadata]);
  return (
    <Flex direction={'column'} h='100vh' overFlow='hidden'>
      <Tabs value={tabState} onChange={setTabState} variant='pills'>
        <Tabs.List justify='center' p='xs' pb={0}>
          <Tabs.Tab value='variables'>Variables</Tabs.Tab>
          <Tabs.Tab value='icons'>Icons</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel
          style={{
            overflow: 'auto',
          }}
          value='variables'
        >
          <DisplayVariables />
        </Tabs.Panel>

        <Tabs.Panel
          style={{
            overflow: 'auto',
          }}
          value='icons'
        >
          <DisplayIcons />
        </Tabs.Panel>
      </Tabs>
    </Flex>
  );
}
