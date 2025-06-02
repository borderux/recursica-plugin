import { useRepository } from '@/hooks/useRepository';
import { Typography } from '@/ui-kit/components/Typography/Typography';
import { Flex } from '@/ui-kit/components/Flex/Flex';
import { Checkbox, Select } from '@mantine/core';
import { Button } from '@/ui-kit/components/Button/Button';
import { useNavigate } from 'react-router';
import { useState } from 'react';

export function SelectBranch() {
  const { projectBranches, selectedBranch, updateSelectedBranch } = useRepository();
  const navigate = useNavigate();
  const [useDefaultBranch, setUseDefaultBranch] = useState(false);

  const navigateToPublishFiles = () => {
    navigate('/recursica/publish-files');
  };

  const defaultBranch = projectBranches.find((branch) => branch === 'main');

  const handleDefaultBranchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      console.log(projectBranches);
      updateSelectedBranch(defaultBranch || '');
      setUseDefaultBranch(true);
    } else {
      updateSelectedBranch(selectedBranch);
      setUseDefaultBranch(false);
    }
  };

  return (
    <Flex direction='column' gap={16} justify='center'>
      <Typography>Select Branch</Typography>
      <Select
        data={projectBranches}
        value={selectedBranch}
        disabled={useDefaultBranch}
        onChange={(value) => {
          if (value) {
            updateSelectedBranch(value);
          }
        }}
      />
      <Checkbox
        label='Use default branch'
        checked={useDefaultBranch}
        onChange={handleDefaultBranchChange}
      />
      {selectedBranch && <Button label='Publish Files' onClick={navigateToPublishFiles} />}
    </Flex>
  );
}
