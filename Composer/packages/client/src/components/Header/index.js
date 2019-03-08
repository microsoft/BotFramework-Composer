/** @jsx jsx */
import { jsx } from "@emotion/core";

import {
  ActionButton,
  PrimaryButton,
  IButtonProps
} from "office-ui-fabric-react/lib/Button";
import {
  header,
  aside,
  bot,
  botButton,
  botMessage,
  actionButton,
  fileInput
} from "./styles";

export const Header = props => (
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
      >
        <input css={fileInput} type="file" accept=".bot, .botproj" onChange={(e)=>props.onFileOpen(e.target.files)}/>
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
  </header>
);
