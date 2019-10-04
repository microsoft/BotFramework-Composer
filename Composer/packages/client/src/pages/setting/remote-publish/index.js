import React, { useContext, useEffect } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react';

import { StoreContext } from './../../../store';

const styles = {
  published: {
    backgroundColor: '#F2F2F2',
    padding: '1rem',
  },
  integration: {
    padding: '1rem',
    backgroundColor: 'rgba(0, 120, 212, 0.1)',
  },
  rollback: {
    padding: '1rem',
  },
};

export const RemotePublish = props => {
  props;
  const { state, actions } = useContext(StoreContext);
  const { publishVersions } = state;

  useEffect(() => {
    actions.getPublishHistory();
  }, []);

  const publish = async () => {
    await actions.publish();
    actions.getPublishHistory();
  };

  const rollback = async () => {
    await actions.publishVersion(publishVersions.previousProduction.label);
    actions.getPublishHistory();
  };

  return (
    <div>
      {publishVersions && publishVersions.integration && (
        <div style={styles.integration}>
          <h1>In Testing</h1>
          Current version published {publishVersions.integration.publishTimestamp}
          <PrimaryButton text="Publish" onClick={publish} />
        </div>
      )}
      {publishVersions && publishVersions.production && (
        <div style={styles.published}>
          <h1>Published</h1>
          Current version published {publishVersions.production.publishTimestamp}
          <PrimaryButton text="Open in Emulator" />
          <DefaultButton text="Open in Web Chat" />
        </div>
      )}
      {publishVersions && publishVersions.previousProduction && (
        <div style={styles.rollback}>
          <a onClick={rollback}>Rollback</a> to last published {publishVersions.previousProduction.publishTimestamp}
        </div>
      )}
      {!publishVersions && <div>{formatMessage('Loading')}</div>}
    </div>
  );
};
