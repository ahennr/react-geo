import React from 'react';
import { render } from 'react-dom';
import { CoordinateTransformPanel } from '../../index.js';

import OlMap from 'ol/map';
import OlView from 'ol/view';
import OlLayerTile from 'ol/layer/tile';
import OlSourceOsm from 'ol/source/osm';
import OlProjection from 'ol/proj';

//
// ***************************** SETUP *****************************************
//
const defaultView = new OlView({
  center: OlProjection.fromLonLat([7.40570, 53.81566]),
  zoom: 4
});
const map = new OlMap({
  layers: [
    new OlLayerTile({
      name: 'OSM',
      source: new OlSourceOsm()
    })
  ],
  view: defaultView
});

//
// ***************************** SETUP END *************************************
//

/**
 * wrapper function for render
 */
const doRender = wmsLayers => {
  render(
    <div>
      <div id="map" />
      <CoordinateTransformPanel
        key="1"
        map={map}
        wmsLayers={wmsLayers}
        draggable={true}
        t={t => t}
        width={500}
        height={400}
        x={0}
        y={100}
      />
    </div>,

    // Target element
    document.getElementById('exampleContainer'),

    // Callback
    () => {
      map.setTarget('map');
    }
  );
};

doRender([]);
