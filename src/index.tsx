import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { configure } from 'mobx';
import { App } from './App';
import reportWebVitals from './reportWebVitals';

configure({
  enforceActions: 'never',
});

const root = ReactDOMClient.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
