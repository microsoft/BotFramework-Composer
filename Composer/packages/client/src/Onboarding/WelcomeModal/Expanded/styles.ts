import { css } from '@emotion/core';

export const content = css`
  padding: 15px;

  .footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
    min-height: 40px;
  }

  .header {
    font-weight: bold;
    padding-bottom: 10px;
    text-align: center;

    img {
      height: 200px;
      padding: 10px;
    }

    .buttons {
      position: absolute;
      right: 0px;
      top: 0px;
    }

    .subtitle {
      font-size: 16px;
    }

    .title {
      font-size: 24px;
    }

    .top {
      position: relative;
    }
  }
`;

export const status = css`
  padding: 5px 0;

  i {
    color: #0078d4;
    padding-right: 10px;
  }

  i.completed {
    color: #107c10;
  }

  span {
    color: #767676;
  }
`;
