import React, {useState, useEffect, Fragment} from 'react';
import './extensionContainer.css';
import ShellApi from './ShellApi';
import getEditor from './EditorMap';

/**
 * ExtensionContainer is a IFrame container to host any extension as React component
 * ExtensionContainer provides a React absraction to it's inner extention, on top of the 
 * underlying messaging api between ExtensionContainer and Shell
 * 
 * An extension won't have to know this ExtensionContainer exists, it just use the props
 * passed into it to communite with Shell. Those props is actually implement in Container layer.
 * 
 * The data and controls flows look like this
 *  Shell <---(messaging)---> Container <---(react props)---> Extension
 *
 */

function ExtensionContainer() {

    const [value, setValue] = useState(``);
    const [type, setType] = useState('');

    const shellApi = new ShellApi();
    let RealEditor = "";

    useEffect(() => {
        window.addEventListener("message", receiveMessage, false);
        shellApi.loadSuccess();
        return function removeListener() {
            window.removeEventListener("message", receiveMessage, false);
        }
    }, [])

    function receiveMessage(event) {
        if(event.source === window.parent) {
            const data = event.data;
            setType(data.editorType);
            setValue(data.data);
        }
    } 

    if(type !== "") {
        RealEditor = getEditor(type)
    }

    return (
        <Fragment>
            {RealEditor === ''?''
            :<RealEditor data={value} onChange={shellApi.saveValue} shellApi={shellApi}/>}
        </Fragment>
    )
}

export default ExtensionContainer