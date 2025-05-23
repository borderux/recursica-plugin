import { useFigma } from '@/hooks/useFigma';
import { Flex, Textarea, Title } from '@/ui-kit';

export function DisplayCode() {
  const {
    tokens: { codeTokens },
  } = useFigma();
  return (
    <Flex h={'100%'} direction={'column'} gap={'md'} p={'sm'}>
      <Textarea
        label={<Title order={3}>Code Preview</Title>}
        labelProps={{
          align: 'center',
          width: '100%',
        }}
        readOnly
        placeholder='Exported variables will render here...'
        value={codeTokens ? JSON.stringify(codeTokens, null, 2) : 'No tokens'}
      />
    </Flex>
  );
}
