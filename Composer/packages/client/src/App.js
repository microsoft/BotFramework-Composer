import React, { useState, useEffect, Fragment, useRef, useLayoutEffect, useCallback } from 'react';
import './App.css';
import httpClient from './utils/http';
import ExtensionContainerWrapper from './ExtensionContainerWrapper';

function App() {
    const [files, setFiles] = useState([]);
    const [openFileIndex, setOpenFileIndex] = useState(-1);
    const [editorType, setEditorType] = useState("");
    const [botStatus, setBotStatus] = useState("stopped"); 
    const openFileIndexRef = useRef();
    const filesRef = useRef();

    const client = new httpClient();

    useEffect(()=> {
        client.getFiles((files) => {
            if(files.length > 0) {
                setFiles(files)
            }
        });
    }, [])

    useLayoutEffect(() => {
        openFileIndexRef.current = openFileIndex;
    })

    useLayoutEffect(() => {
        filesRef.current = files;
    })

    function handleValueChange(newValue) {
        const currentIndex = openFileIndexRef.current;
        const files = filesRef.current;

        let payload = {
            name: files[currentIndex].name,
            content: newValue
        }
      
        let newFiles = files.slice();
        newFiles[currentIndex].content = newValue;
        setFiles(newFiles)

        client.saveFile(payload)
    }

    function getSuffix(fileName) {
        return fileName.substring(fileName.lastIndexOf('.'));
    }

    function handleFileClick (file, index){
        const suffix = getSuffix(file.name)
        setEditorType(suffix);
        setOpenFileIndex(index);
    }

    return (
        <Fragment>
            <header className="App-header">
                <div className="header-aside">Composer</div>
                <div className="App-bot">
                    <button className="bot-button" onClick={()=>client.toggleBot(botStatus, (status)=>{setBotStatus(status)})}>
                        {botStatus === "running"? "Stop Bot":"Start Bot"}
                    </button>
                    <span className="bot-message">
                        {
                            botStatus === "running"? 
                            "Bot is running at http://localhost:3979":""
                        }
                    </span>
                </div>
            </header>
            <aside className="App-sidebar">
                <nav>
                    <ul>
                        {files.length > 0 && files.map((item, index)=>{
                        return <li 
                            key={item.name}
                            onClick={()=>{handleFileClick(item, index)}}>
                            {item.name}
                            </li>
                        })}
                    </ul>
                </nav>
            </aside>
            <main className="App-main">
                {openFileIndex > -1? 
                    <ExtensionContainerWrapper editorType={editorType} data={files[openFileIndex].content} onChange={handleValueChange}/> 
                    : 'Welcome'}
            </main>
        </Fragment>
    )
}

export default App;
