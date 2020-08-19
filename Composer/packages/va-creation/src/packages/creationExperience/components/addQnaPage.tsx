import { mergeStyles } from '@uifabric/merge-styles';
import { CommandButton, DefaultButton } from 'office-ui-fabric-react';
import { Image } from 'office-ui-fabric-react/lib/Image';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch } from 'redux';
import { IAppState } from '../../../models/reduxState';
import { RouterPaths } from '../../shared/constants';
import { ModalShell } from './modalShell';
const cloudFileImage = require('../../shared/assets/cloudFileImg.jpg');

interface StateProps {}

interface DispatchProps {}

interface Props {}

type PropsType = StateProps & DispatchProps & Props;

export class AddQnaPage extends React.Component<PropsType> {
  constructor(props: PropsType) {
    super(props);
  }

  render() {
    const browseButtonClassName = mergeStyles({
      marginLeft: '20px',
    });

    const addQnaPairButton = mergeStyles({
      display: 'block',
      marginTop: '10px',
    });

    const imageClassName = mergeStyles({
      display: 'block',
      paddingTop: '40px',
    });

    return (
      <ModalShell
        title="Upload your content"
        subTitle="Add content to your Virtual Assistant by uploading a link of your company’s website’s FAQ page , PDFs or word document. 
            You can always add/edit this later in Q&A"
        nextPath={RouterPaths.creationSummary}
        previousPath={RouterPaths.addSkills}
      >
        <div className="ms-Grid" dir="ltr">
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm8 ms-md8 ms-lg8">
              <TextField
                styles={() => {
                  return { root: { display: 'inline-block', width: '400px' } };
                }}
                label="Add qna file"
                placeholder="i.e. faq.qna"
              />
              <DefaultButton className={browseButtonClassName} text="Browse" />
              <CommandButton className={addQnaPairButton} iconProps={{ iconName: 'Add' }} text="Add QNA Pair" />
            </div>
            <div className="ms-Grid-col ms-sm4 ms-md4 ms-lg4">
              <Image
                className={imageClassName}
                src={cloudFileImage}
                alt="Example with no image fit value and no height or width is specified."
              />
            </div>
          </div>
        </div>
      </ModalShell>
    );
  }
}

const mapStateToProps = (state: IAppState, ownProps: Props): StateProps => ({});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>): DispatchProps => ({});

export default connect(mapStateToProps, mapDispatchToProps)(AddQnaPage);
