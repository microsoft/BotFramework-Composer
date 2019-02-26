import React, {Fragment} from 'react';
import getEditor from './EditorMap';

function Editor(props) {

    const {editorType, data, shellApi} = props
    const Editor = getEditor(editorType)

    function handleValueChange(data) {
        shellApi.saveValue(data)
    }

    return (
        <Fragment>
            <Editor data={data} onChange={handleValueChange} shellApi={shellApi}/>
        </Fragment>
    )
}

export default Editor