import React, {useState, useEffect, Fragment} from 'react';
import './extensionContainer.css';
import ShellApi from './ShellApi';
import getEditor from './EditorMap';
import messenger from './Messenger';

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

    const [data, setData] = useState(null);

    const shellApi = new ShellApi();

    useEffect(() => {
        window.addEventListener("message", messenger.receiveMessage, false);
        shellApi.getData().then(function(result) {
            setData(result);
        })
        return function removeListener() {
            window.removeEventListener("message", messenger.receiveMessage, false);
        }
    }, [])

    let RealEditor = getEditor(data);

    return (
        <Fragment>
            {RealEditor === ''?''
            :<RealEditor data={data} onChange={shellApi.saveValue} shellApi={shellApi}/>}
        </Fragment>
    )
}

export default ExtensionContainer