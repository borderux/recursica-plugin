import { useRepository } from '@/hooks/useRepository';
import { Typography } from '@/ui-kit/components/Typography/Typography';
import { Flex } from '@/ui-kit/components/Flex/Flex';
import { Select } from '@mantine/core';
import { Button } from '@/ui-kit/components/Button/Button';
import { useNavigate } from 'react-router';

export function SelectProject() {
  const { userProjects, selectedProject, updateSelectedProject } = useRepository();
  const navigate = useNavigate();

  const navigateToBranches = () => {
    navigate('/recursica/select-branch');
  };

  return (
    <Flex direction='column' gap={16} justify='center'>
      <Typography>Select Project</Typography>
      <Select
        data={userProjects}
        value={selectedProject}
        onChange={(value) => {
          if (value) {
            updateSelectedProject(value);
          }
        }}
      />
      {selectedProject && <Button label='Select Branch' onClick={navigateToBranches} />}
    </Flex>
  );
}
