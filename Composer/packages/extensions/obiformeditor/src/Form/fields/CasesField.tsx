import React, { useState } from 'react';
import formatMessage from 'format-message';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { PrimaryButton, TextField, DirectionalHint, IContextualMenuItem, IconButton } from 'office-ui-fabric-react';
import get from 'lodash.get';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { createStepMenu, DialogGroup } from 'shared-menus';

import Modal from '../../Modal';
import { swap } from '../utils';

import { TableField } from './TableField';

import './styles.scss';

interface CaseFormData {
  oldValue?: string;
  newValue?: string;
}

function CaseConditionActions(props) {
  const { item, index, onEdit, onRemove, onMove, canMoveUp, canMoveDown } = props;

  const menuItems: IContextualMenuItem[] = [
    {
      key: 'edit',
      text: formatMessage('Edit'),
      iconProps: { iconName: 'Edit' },
      onClick: () => onEdit(item.value),
    },
    {
      key: 'moveUp',
      text: formatMessage('Move Up'),
      iconProps: { iconName: 'CaretSolidUp' },
      disabled: !canMoveUp,
      onClick: () => {
        onMove(item.value, index - 1);
      },
    },
    {
      key: 'moveDown',
      text: formatMessage('Move Down'),
      iconProps: { iconName: 'CaretSolidDown' },
      disabled: !canMoveDown,
      onClick: () => {
        onMove(item.value, index + 1);
      },
    },
    {
      key: 'remove',
      text: formatMessage('Remove'),
      iconProps: { iconName: 'Cancel' },
      onClick: () => onRemove(item.value),
    },
  ];

  return (
    <IconButton
      menuProps={{ items: menuItems }}
      menuIconProps={{ iconName: 'MoreVertical' }}
      styles={{ menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } }}
    />
  );
}

export const CasesField: React.FC<FieldProps<CaseCondition[]>> = props => {
  const { formData, schema } = props;
  const [showModal, setShowModal] = useState(false);
  const [caseFormData, setCaseFormData] = useState<CaseFormData>({});
  const items = formData;
  const newLabel = formatMessage('Add New Case');

  const handleCaseUpdate = e => {
    e.preventDefault();
    const { oldValue, newValue } = caseFormData;

    if (newValue) {
      const existingCase = items.find(i => i.value === oldValue);

      if (existingCase) {
        props.onChange(
          items.map(i => {
            if (i.value === oldValue) {
              return {
                ...i,
                value: newValue,
              };
            }
            return i;
          })
        );
      } else {
        props.onChange([...(items || []), { value: newValue }]);
      }

      setShowModal(false);
      setCaseFormData({});
    }
  };

  const handleStepsUpdate = (caseName: string) => (caseSteps: MicrosoftIDialog[]) => {
    const updatedCases = items.map(i => {
      if (i.value === caseName) {
        return {
          ...i,
          actions: caseSteps,
        };
      }

      return i;
    });

    props.onChange(updatedCases);
  };

  const handleItemEdit = (caseName: string) => {
    setCaseFormData({ oldValue: caseName, newValue: caseName });
    setShowModal(true);
  };

  const handleRemoveItem = (caseName: string) => {
    props.onChange(items.filter(i => i.value !== caseName));
  };

  const handleMoveItem = (caseName: string, newPos: number) => {
    const caseIdx = items.findIndex(i => i.value === caseName);
    props.onChange(swap(items, caseIdx, newPos));
  };

  return (
    <div className="CasesField">
      {items.map((item: CaseCondition, itemIdx: number) => (
        <div className="CasesFieldConditions" key={item.value}>
          <TableField<MicrosoftIDialog>
            {...props}
            title={`Branch: ${item.value}`}
            formData={item.actions}
            navPrefix={`cases[${itemIdx}].actions`}
            onChange={handleStepsUpdate(item.value)}
          >
            {({ createNewItemAtIndex }) => (
              <PrimaryButton
                styles={{ root: { marginTop: '20px' } }}
                menuProps={{
                  items: createStepMenu(
                    [
                      DialogGroup.RESPONSE,
                      DialogGroup.INPUT,
                      DialogGroup.BRANCHING,
                      DialogGroup.STEP,
                      DialogGroup.MEMORY,
                      DialogGroup.CODE,
                      DialogGroup.LOG,
                    ],
                    true,
                    createNewItemAtIndex()
                  ),
                  calloutProps: { calloutMaxHeight: 500 },
                  directionalHint: DirectionalHint.bottomLeftEdge,
                }}
                type="button"
              >
                {formatMessage('Add New Action for { caseName }', { caseName: item.value })}
              </PrimaryButton>
            )}
          </TableField>
          <div className="CasesFieldConditionsMenu">
            <CaseConditionActions
              item={item}
              onEdit={handleItemEdit}
              onRemove={handleRemoveItem}
              onMove={handleMoveItem}
              onNew={() => setShowModal(true)}
              index={itemIdx}
              canMoveUp={itemIdx > 0}
              canMoveDown={itemIdx < items.length - 1}
            />
          </div>
        </div>
      ))}
      <PrimaryButton type="button" styles={{ root: { marginTop: '20px' } }} onClick={() => setShowModal(true)}>
        {newLabel}
      </PrimaryButton>
      {showModal && (
        <Modal onDismiss={() => setShowModal(false)}>
          <form onSubmit={handleCaseUpdate}>
            <TextField
              label={get(schema, 'items.properties.value.title')}
              description={get(schema, 'items.properties.value.description')}
              value={caseFormData.newValue}
              required
              onChange={(e, val) => setCaseFormData({ ...caseFormData, newValue: val })}
              componentRef={el => {
                if (el) {
                  el.focus();
                }
              }}
            />
            <PrimaryButton type="submit" styles={{ root: { width: '100%', marginTop: '20px' } }}>
              {newLabel}
            </PrimaryButton>
          </form>
        </Modal>
      )}
    </div>
  );
};

CasesField.defaultProps = {
  formData: [],
};
