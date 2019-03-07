/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Icon } from "office-ui-fabric-react/lib/Icon";
import { folder } from "./styles";

export const Folder = props => {

  let iconName = props.opened? 'FabricOpenFolderHorizontal':'FabricFolder';

  if(props.folder.scheme === "file") {
    iconName = 'TextDocument'
  }

  return (
    <div css={folder}>
      <Icon iconName={iconName} className="ms-IconExample" />
      <span 
        data-id={props.folder.webid} 
        onClick={()=>props.onFolderClick(props.folder)} 
        onContextMenu={props.onFolderRightClick}>
        {props.folder.name}
      </span>
    </div>
  );
}