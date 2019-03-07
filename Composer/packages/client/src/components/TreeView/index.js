/** @jsx jsx */
import { jsx } from "@emotion/core";
import { } from "./styles";
import { Node } from "./node";

export const FolderTree = props => {

    const tree = props.tree;

    function buildFolderTree () {
        return tree.map((node, key) => {
            return <Node key={key} node={node} activeNode={props.activeNode} onSelect={props.onSelect}/>
        })
    }
    
    return (
        <ul>
            { tree && tree.length ? buildFolderTree() : 'loading...'}
        </ul>
    );
}