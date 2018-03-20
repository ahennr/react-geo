import React from 'react';
import { render } from 'react-dom';

import {
  RemoteSelectField
} from '../../index.js';

const remoteUrl = 'https://jsonplaceholder.typicode.com/comments';

render(
  <div>
    <RemoteSelectField
      remoteUrl={remoteUrl}
    />

  </div>,

  // Target
  document.getElementById('exampleContainer')
);
