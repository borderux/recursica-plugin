import { Flex, Tabs, Divider } from '@/ui-kit';
import styles from './Home.styles.module.scss';
import { DisplayAccordion, DisplayCode, Footer } from '@/views';

export function Home() {
  return (
    <Flex direction={'column'} h='100vh' overFlow='hidden'>
      <Tabs
        defaultValue='accordion'
        variant='pills'
        classNames={{
          root: styles.tabs,
        }}
      >
        <Tabs.List justify='center' p='xs' pb={0}>
          <Tabs.Tab value='accordion'>Local variables</Tabs.Tab>
          <Tabs.Tab value='code'>Code</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel
          style={{
            overflow: 'auto',
          }}
          flex={1}
          value='accordion'
        >
          <DisplayAccordion />
        </Tabs.Panel>

        <Tabs.Panel
          style={{
            overflow: 'auto',
          }}
          flex={1}
          value='code'
        >
          <DisplayCode />
        </Tabs.Panel>
      </Tabs>

      <Divider />
      <Footer />
    </Flex>
  );
}
