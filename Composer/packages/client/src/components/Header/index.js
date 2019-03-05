/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useState } from 'react';

import {
  ActionButton,
  PrimaryButton,
} from "office-ui-fabric-react/lib/Button";

import { Modal } from 'office-ui-fabric-react/lib/Modal';

import {
  header,
  aside,
  bot,
  botButton,
  botMessage,
  actionButton,
  dialogContainer,
  dialogHeader,
  dialogFileList,
  fileItem
} from "./styles";

const FileList = props => {
  return (
    <div css={dialogContainer}>
      <div css={dialogHeader}>
        Select
      </div>
      <ul css={dialogFileList}>
        {props.files.map((item, index)=>{
          return <li key={index} css={fileItem} onClick={()=>props.onFileClick(item)}>{item.name}</li>
        })}
      </ul>
    </div>
  )
}

export const Header = props => {
  const [showModal, setShowModal] = useState(false)

  return (
  <header css={header}>
    <div css={aside}>Composer</div>
    <div css={actionButton}>
      <ActionButton
        css={actionButton}
        iconProps={{ iconName: "CirclePlus", iconColor: "#ffffff" }}
      >
        New
      </ActionButton>
      <ActionButton
        css={actionButton}
        iconProps={{ iconName: "OpenFolderHorizontal", iconColor: "#ffffff" }}
        onClick={()=>{
          setShowModal(!showModal)
          props.client.getFloderDir(props.setFolderTree)
        }}
      >
        Open
      </ActionButton>
    </div>
    <div css={bot}>
      <span css={botMessage}>
        {props.botStatus === "running"
          ? "Bot is running at http://localhost:3979"
          : ""}
      </span>
      <PrimaryButton
        css={botButton}
        text={props.botStatus === "running" ? "Stop" : "Start"}
        onClick={() =>
          props.client.toggleBot(props.botStatus, status => {
            props.setBotStatus(status);
          })
        }
      />
    </div>
    <Modal
      isOpen={showModal}>
      <FileList files={props.botFileList} onFileClick={(file)=>{props.onFileClick(file); setShowModal(!showModal); }}/>
    </Modal>
  </header>
)};
