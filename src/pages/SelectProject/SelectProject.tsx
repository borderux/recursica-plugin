import { useRepository } from '@/hooks/useRepository';
import { Typography, Flex, Select, Button } from '@/ui-kit';
import { useNavigate } from 'react-router';

export function SelectProject() {
  const { userProjects, selectedProjectId, updateSelectedProjectId } = useRepository();
  const navigate = useNavigate();

  const navigateToBranches = () => {
    navigate('/recursica/select-branch');
  };

  return (
    <Flex direction='column' gap={16} justify='center'>
      <Typography>Select Project</Typography>
      <Select
        data={userProjects.map((project) => ({
          label: project.name,
          value: project.id,
        }))}
        value={selectedProjectId}
        onChange={(value) => {
          if (value) {
            updateSelectedProjectId(value);
          }
        }}
      />
      {selectedProjectId && <Button label='Select Branch' onClick={navigateToBranches} />}
    </Flex>
  );
}
