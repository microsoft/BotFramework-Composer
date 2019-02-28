/** @jsx jsx **/
import { jsx } from "@emotion/core";
import { container, top } from "./styles";

export const Conversation = (props) => (
  <div css={container}>
    <div css={top} />
    {props.children}
  </div>
);
