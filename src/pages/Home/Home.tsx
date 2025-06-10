import { useFigma } from '@/hooks/useFigma';
import { Flex, Typography, Button } from '@/ui-kit';
import { NavLink } from 'react-router';

export function Home() {
  const { saveEffectsIdToVariables } = useFigma();
  return (
    <Flex direction={'column'} justify={'center'} align={'center'} gap={20}>
      <Typography>Home</Typography>
      <Button component={NavLink} to='/figma/select-sources' label='Get Started' />
      <Button label='Save effects id to variables' onClick={saveEffectsIdToVariables} />
    </Flex>
  );
}
