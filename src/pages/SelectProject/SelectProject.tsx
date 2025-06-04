import { useRepository } from '@/hooks/useRepository';
import { Typography, Flex, Select, Button } from '@/ui-kit';
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
