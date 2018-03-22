import React from 'react';
import { render } from 'react-dom';
import { message } from 'antd';
import { AddWmsPanel, SimpleButton, CapabilitiesUtil } from '../../index.js';

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

// Please note: CORS headers must be set on server providing capabilities document. Otherwise proxy needed.
const WMS_CAPABILITIES_URL = 'http://sgx.geodatenzentrum.de/wmts_topplus_web_open/1.0.0/WMTSCapabilities.xml';

/**
 * fetch capabilities document onClick and re-render on success
 */
const onClick = () => {
  CapabilitiesUtil.parseWmtsCapabilities(WMS_CAPABILITIES_URL)
    .then(capabilities => CapabilitiesUtil.getLayerFromWmtsCapabilties({capabilities, layerName: 'Test'}))
    .then(layers => {
      doRender([layers]);
    })
    .catch(() => message.error('Could not parse capabilities document.'));
};

/**
 * wrapper function for render
 */
const doRender = (wmsLayers) => {
  render(
    <div>
      <div id="map" />
      <div className="example-block">
        <SimpleButton
          onClick={onClick}
        >
          Fetch capabilities of OWS terrestris
        </SimpleButton>
        <AddWmsPanel
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
      </div>
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
