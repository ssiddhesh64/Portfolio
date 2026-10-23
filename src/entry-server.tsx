import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';

export const renderHome = () =>
  renderToString(
    React.createElement(
      StaticRouter,
      { location: '/' },
      React.createElement(App),
    ),
  );
