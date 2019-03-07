/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Folder }from './folder'
import { useState } from 'react';
import { openul, closeul, node } from "./styles";

export const Node = props => {

    const [opened, setOpened] = useState(false)

    function handleRightClick (e) {
        e.preventDefault()
        console.log('Handle Right-click.')
    }

    return (
      <li css={node}>
        <Folder 
            folder={props.node} 
            opened={opened} 
            onFolderClick={(node)=>{setOpened(!opened); props.onSelect(node)}} 
            onFolderRightClick={handleRightClick}/>
        <ul css={opened? openul:closeul}>
          {props.node.children.map((child, key) => {
            return <Node key={key} node={child} activeNode={props.activeNode} onSelect={props.onSelect}/>
          })}
        </ul>
      </li>
    )
}