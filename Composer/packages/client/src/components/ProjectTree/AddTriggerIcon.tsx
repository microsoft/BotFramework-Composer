// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { NeutralColors } from '@uifabric/fluent-theme';
interface AddTriggerIconProps {
  active: boolean;
  className?: string;
  id: string;
  onClick?: () => {};
}

export const AddTriggerIcon: React.FC<AddTriggerIconProps> = (props) => {
  const { className = '', id } = props;

  return (
    <svg
      className={className}
      fill="none"
      height="24"
      viewBox="0 0 50 39"
      width="15"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.8584 18.7502H39.9717L8.72168 50.0002H1.6416L11.0166 31.2502H0.0546875L15.6797 0.000244141H33.2334L23.8584 18.7502ZM7.40332 46.8752L32.4033 21.8752H18.8047L28.1797 3.12524H17.6084L5.1084 28.1252H16.0703L6.69531 46.8752H7.40332Z"
        fill={NeutralColors.gray160}
      />
      <path
        d="M27.3335 39.9992V43.3358H33.9986V50.0008H37.3352V43.3358H44.0002V39.9992H37.3352V33.3341H33.9986V39.9992H27.3335Z"
        fill={NeutralColors.gray160}
      />
    </svg>
  );
};

export default AddTriggerIcon;
