import * as React from 'react';
import { NeutralColors } from '@uifabric/fluent-theme';
import { TooltipHost, Icon } from 'office-ui-fabric-react';

const configureResourcesIconStyle = {
  root: {
    color: NeutralColors.gray160,
    userSelect: 'none',
  },
};

export const RegistryConfigAction = ({ registryType: controlledRegistry, onChoiceChanged }) => {
  const [registry, setRegistry] = React.useState(controlledRegistry || 'local');

  React.useEffect(() => {
    setRegistry(controlledRegistry || 'create');
  }, [controlledRegistry]);

  React.useEffect(() => {
    onChoiceChanged(registry);
  }, [registry]);

  const renderPropertyInfoIcon = (tooltip: string) => {
    return (
      <TooltipHost content={tooltip}>
        <Icon iconName="Unknown" styles={configureResourcesIconStyle} />
      </TooltipHost>
    );
  };

  return <renderForm />;
};
