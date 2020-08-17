// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FontSizes } from '@uifabric/fluent-theme';

interface QnAIconProps {
  active: boolean;
  disabled: boolean;
}

export const QnAIcon: React.FC<QnAIconProps> = (props) => {
  const { active, disabled } = props;

  return (
    <svg
      fill={active ? '#000' : disabled ? '#999' : '#4f4f4f'}
      height="15"
      style={{
        padding: '8px 12px',
        marginLeft: active ? '1px' : '4px',
        marginRight: '12px',
        boxSizing: 'border-box',
        fontSize: `${FontSizes.size16}`,
        width: '40px',
        height: '32px',
      }}
      viewBox="0 0 16 15"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M13.9666 8.48882L12.012 7.63259C11.9419 7.63797 11.8718 7.64079 11.8003 7.64079H11.7246C11.3367 5.711 9.67954 4.24441 7.6928 4.24441H5.30699C5.3162 2.5308 6.66229 1.13184 8.3072 1.13184H11.8006C13.4508 1.13184 14.8014 2.54014 14.8014 4.26139V4.51096C14.8014 5.60461 14.2562 6.57176 13.4355 7.13174L13.9666 8.48882ZM7.69308 11.8852H4.19968C4.12818 11.8852 4.05809 11.8824 3.98799 11.877L2.03337 12.7332L2.56483 11.3762C1.74377 10.8162 1.19863 9.84902 1.19863 8.75538V8.5058C1.19863 6.78455 2.54919 5.37626 4.1994 5.37626H4.27536H5.42624H7.6928C9.05565 5.37626 10.2113 6.33719 10.574 7.64079C10.6503 7.91611 10.6938 8.20587 10.6938 8.5058V8.75538C10.6938 8.76132 10.693 8.76669 10.693 8.77263C10.6841 10.4862 9.33771 11.8852 7.69308 11.8852ZM14.7665 7.46225C15.4931 6.68043 15.9185 5.63007 15.9185 4.51096V4.26139C15.9185 1.92216 14.0753 0 11.8006 0H8.3072C6.03784 0 4.19884 1.9131 4.1899 4.24498C1.91971 4.25036 0.0815464 6.16996 0.0815464 8.5058V8.75538C0.0815464 9.87449 0.506878 10.9248 1.23354 11.7067L0 14.8571L4.20052 13.0171H7.69308C9.96048 13.0171 11.7984 11.1062 11.8098 8.77716L16 10.6127L14.7665 7.46225Z"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default QnAIcon;
