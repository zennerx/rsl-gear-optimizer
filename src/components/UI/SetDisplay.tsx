/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import React from "react";
import styled from "styled-components";
import Sets, { SetsIconName } from "models/Sets";

const Image = styled.img<{ size?: number }>`
  ${(props) => (props.size ? `width: ${props.size}px` : "")};
`;

export default ({ set, size }: { set: Sets; size?: number }): JSX.Element => {
  try {
    const url = require(`raid-data/images/ItemSetIcons/${SetsIconName[set]}.png`);

    return <Image size={size} src={url} alt={`${set}`} />;
  } catch {
    return <></>;
  }
};