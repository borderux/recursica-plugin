import { useFigma } from '@/hooks/useFigma';
import { Anchor, Flex, Title, Button } from '@/ui-kit';
import { useMemo } from 'react';

export function IconsPanel() {
  const { svgIcons } = useFigma();
  const iconsData = useMemo(() => {
    return 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(svgIcons, null, 2));
  }, [svgIcons]);
  const iconsCount = useMemo(() => {
    if (svgIcons) return Object.keys(svgIcons).length;
    return undefined;
  }, [svgIcons]);
  return (
    <Flex direction={'column'} gap={'md'} p={'sm'} align={'center'}>
      <Title order={2}>Export icons</Title>
      <Button
        variant='outline'
        label={`Download ${iconsCount} icons`}
        component={Anchor}
        href={iconsData}
        download={`recursica-icons.json`}
        underline='never'
        loading={!iconsData}
        disabled={!iconsData}
      ></Button>
    </Flex>
  );
}
