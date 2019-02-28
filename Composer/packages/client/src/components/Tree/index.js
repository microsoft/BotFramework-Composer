/** @jsx jsx */
import { jsx } from "@emotion/core";
import { container, top } from "./styles";

export const Tree = props => (
  <div css={container(props.variant)}>
    <div css={top} />
  </div>
);
