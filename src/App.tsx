import React from 'react';
import { glueIsWebGLAvailable } from 'fxglue';

import './App.scss';

import { Layers } from './components/panels/Layers';
import { LayerSettings } from './components/panels/LayerSettings';
import { Tabs } from './components/panels/Tabs';
import { Menu } from './components/panels/Menu';

import { Welcome } from './components/modals/Welcome';
import { FilterGallery } from './components/modals/FilterGallery';
import { About } from './components/modals/About';
import { Export } from './components/modals/Export';
import { Webcam } from './components/modals/Webcam';

import { Preview } from './components/preview/Preview';

import { Loading } from './components/overlays/Loading';
import { Drop } from './components/overlays/Drop';

const webglAvailable = glueIsWebGLAvailable();

export const App: React.FC = () => {
  if (!webglAvailable) {
    return (
      <div className="ui v-stack">
        <ul className="panel menu">
          <li className="logo">Instaglitch</li>
        </ul>
        <div className="webgl-error">
          Instaglitch requires WebGL to work.{' '}
          <a
            href="https://get.webgl.org/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Please click this link for more info.
          </a>
        </div>
      </div>
    );
  }
  return (
    <>
      <Welcome />
      <Webcam />
      <FilterGallery />
      <About />
      <Export />
      <Drop />
      <Loading />
      <div className="ui v-stack">
        <Menu />
        <div className="workspace flex h-stack">
          <div className="v-stack flex">
            <Tabs />
            <div className="canvas-area flex">
              <Preview />
            </div>
          </div>
          <div className="panel side">
            <Layers />
            <LayerSettings />
          </div>
        </div>
      </div>
    </>
  );
};
