// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const statusElmId = 'status-txt';

export const getSplashScreenContent = ({
  logo = '',
  productName = 'Product',
  productFamily = 'Product Family',
  text = 'Loading ...',
  website = 'www.website.com',
  color = '#666',
}) => `
<!DOCTYPE html>
<meta charset="utf-8">
<html>
<head>
  <style>
    html,
    body
    {
      margin: 0;
      overflow: hidden;
    }
    #box {
      position: absolute;
      user-select: none;
      width: 100%;
      height: 100%;
      overflow: hidden;
      margin: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column
    }
    #logo {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      top: 0;
      left: 0;
    }
    #logo img {
      height: 60px
    }
    #box .text {
      color: white;
      font-weight: 400;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    }
    #box h1 {
      color: white;
      font-size: 36px;
    }
    #box h2 {
      color: white;
      font-size: 18px;
    }
    #box h4 {
      font-size: 12px;
      font-weight: 400;
      opacity: 50%;
    }
    #${statusElmId} {
      position: absolute;
      left: 20px;
      bottom: 16px;
    }
    #website-url {
      position: absolute;
      right: 20px;
      bottom: 16px;
    }
  </style>
</head>
<body style="background-color:${color}">
  <div id="box" style="background-color:${color}">
    <span id="logo">
      <img id="logo-img" src="${logo}" />
    </span>
    <h1 id="product" class="text">${productName}</h1>
    ${productFamily ? `<h2 id="product-family" class="text">${productFamily}</h2>` : ''}
    <h4 class="text" id="${statusElmId}">${text}</h4>
    <h4 class="text" id="website-url">${website}</h4>
  </div>
</body>
</html>
`;
