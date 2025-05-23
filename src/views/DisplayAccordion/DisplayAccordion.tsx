import { useFigma } from '@/hooks/useFigma';
import { Flex, Text, Title, Accordion } from '@/ui-kit';
import classnames from './DisplayAccordion.styles.module.scss';
import { ExportedVariableValue } from '@/plugin/types';

function decodeVariable(variable: ExportedVariableValue): JSX.Element {
  if (typeof variable === 'object') {
    if ('collection' in variable) {
      return <Text>{`${variable.collection} [${variable.name}]`}</Text>;
    }
    if ('fontFamily' in variable) {
      const { fontFamily, fontSize, fontWeightAlias } = variable;
      return <Text>{`${fontFamily} ${fontSize}px ${fontWeightAlias}`}</Text>;
    } else
      return (
        <Flex direction={'column'}>
          {variable.effects.map(
            ({ offset: { x, y }, spread, color: { r, g, b, a }, radius }, i) => (
              <Text
                key={i}
              >{`${x}px ${y}px ${radius}px ${spread}px rgba(${r}, ${g}, ${b}, ${a})`}</Text>
            )
          )}
        </Flex>
      );
  }
  return <Text>{variable.toString()}</Text>;
}

export function DisplayAccordion(): JSX.Element {
  const {
    tokens: { accordionTokens },
  } = useFigma();

  return (
    <Flex flex={1} direction={'column'} gap={'md'} p={'sm'} overFlowY={'auto'}>
      <Title align={'center'} order={2}>
        Local variables
      </Title>
      <Flex direction={'column'} gap={'md'} overFlowY={'auto'}>
        <Accordion classNames={classnames}>
          {accordionTokens &&
            Object.keys(accordionTokens).map((category) => (
              <Accordion.Item key={category} value={category}>
                <Accordion.Control>
                  <Flex align={'center'} justify={'space-between'}>
                    <Title order={3}>{category === 'FLOAT' ? 'SIZES' : category}</Title>
                    <Text>{accordionTokens[category].length} items</Text>
                  </Flex>
                </Accordion.Control>
                <Accordion.Panel>
                  <Flex direction={'column'} gap={'sm'}>
                    {accordionTokens[category].map((item) => (
                      <Flex key={item.name} gap={'sm'} c={'var(--figma-color-text-secondary)'}>
                        <Text miw={70} maw={90}>
                          {item.collection}
                        </Text>
                        <Text flex={1}>{item.name}</Text>
                        {decodeVariable(item.value)}
                      </Flex>
                    ))}
                  </Flex>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
        </Accordion>
      </Flex>
    </Flex>
  );
}
