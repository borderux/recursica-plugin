import { Flex, Title, Button } from '@/ui-kit';
import { useState } from 'react';
import { Input } from '@mantine/core';

export function AuthorizeRepo(): JSX.Element {
  const [authorizeData, setAuthorizeData] = useState<{
    url: string;
    code: string;
  } | null>(null);
  const [isAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthorizeGitlab = async () => {
    try {
      setError(null);

      const response = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: 'Iv23liE8t3aiV1PL9iKg',
          scope: 'read:user%20user:email%20repo',
        }),
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      setAuthorizeData({
        url: data.verification_uri,
        code: data.user_code,
      });
    } catch (err) {
      setError('Failed to start GitLab authorization process');
      console.error('GitLab initialization error:', err);
    }
  };

  return (
    <Flex flex={1} direction={'column'} gap={'md'} p={'sm'}>
      <Title align={'center'} order={2}>
        Authorize repo
      </Title>
      <Button label='Authorize Gitlab' onClick={handleAuthorizeGitlab} disabled={isAuthorized} />
      {/* <Button label='Authorize Github' onClick={handleAuthorizeGithub} disabled={isAuthorized} /> */}
      {authorizeData && (
        <Flex direction='column' gap='sm'>
          <Title order={4}>Please visit this URL and enter the code:</Title>
          <Input type='text' value={authorizeData.url} readOnly />
          <Input type='text' value={authorizeData.code} readOnly />
        </Flex>
      )}
      {error && (
        <Title order={4} c='red'>
          {error}
        </Title>
      )}
    </Flex>
  );
}
