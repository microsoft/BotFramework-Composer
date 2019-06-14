import React, { useState } from 'react';
import formatMessage from 'format-message';
import { FieldProps } from '@bfdesigner/react-jsonschema-form';
import { PrimaryButton, TextField, DirectionalHint, DefaultButton, IContextualMenuItem } from 'office-ui-fabric-react';
import get from 'lodash.get';

import Modal from '../../Modal';
import { buildDialogOptions, swap } from '../utils';
import { DialogGroup } from '../../schema/appschema';

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

  return <DefaultButton menuProps={{ items: menuItems }} />;
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
          steps: caseSteps,
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
            title={item.value}
            formData={item.steps}
            navPrefix={`cases[${itemIdx}].steps`}
            onChange={handleStepsUpdate(item.value)}
          >
            {({ createNewItemAtIndex }) => (
              <PrimaryButton
                styles={{ root: { marginTop: '20px' } }}
                menuProps={{
                  items: buildDialogOptions({
                    exclude: [DialogGroup.RULE, DialogGroup.OTHER],
                    onClick: createNewItemAtIndex(),
                  }),
                  calloutProps: { calloutMaxHeight: 500 },
                  directionalHint: DirectionalHint.bottomLeftEdge,
                }}
                type="button"
              >
                {formatMessage('Add New Step for { caseName }', { caseName: item.value })}
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
