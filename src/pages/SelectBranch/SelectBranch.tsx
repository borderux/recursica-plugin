import { useRepository } from '@/hooks/useRepository';
import { Typography, Flex, Checkbox, Select, Button } from '@/ui-kit';
import { NavLink } from 'react-router';
import { useEffect, useState } from 'react';

export function SelectBranch() {
  const { projectBranches, publishFiles, defaultBranch } = useRepository();

  const [isNewRelease, setIsNewRelease] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState('');

  useEffect(() => {
    if (isNewRelease) {
      setSelectedBranch(defaultBranch || '');
    }
  }, [isNewRelease]);

  const handlePublishFiles = () => {
    publishFiles(selectedBranch, isNewRelease);
  };

  const handleDefaultBranchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsNewRelease(event.target.checked);
  };

  return (
    <Flex direction='column' gap={16} justify='center'>
      <Typography>Select Branch</Typography>
      <Select
        data={projectBranches}
        value={selectedBranch}
        disabled={isNewRelease}
        onChange={(value) => {
          if (value) {
            setSelectedBranch(value);
          }
        }}
      />
      <Checkbox label='New release' checked={isNewRelease} onChange={handleDefaultBranchChange} />
      {selectedBranch && (
        <Button
          component={NavLink}
          to='/recursica/publish-files'
          label='Publish Files'
          onClick={handlePublishFiles}
        />
      )}
    </Flex>
  );
}
