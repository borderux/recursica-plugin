import { Typography, Flex, Button } from '@/ui-kit';
import { useRepository } from '@/hooks/useRepository';

export function PublishFiles() {
  const { prLink, runAdapter, adapterResponse } = useRepository();
  return (
    <Flex direction='column' gap={16}>
      <Typography>Publish Files</Typography>
      {prLink ? (
        <Typography>
          <a href={prLink} target='_blank' rel='noopener noreferrer'>
            {prLink}
          </a>
        </Typography>
      ) : (
        <Typography> Loading...</Typography>
      )}
      {adapterResponse && <Typography>{adapterResponse}</Typography>}
      {prLink && <Button label='Run Adapter' onClick={runAdapter} />}
    </Flex>
  );
}
