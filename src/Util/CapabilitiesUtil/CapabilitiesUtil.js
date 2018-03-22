import OlWMSCapabilities from 'ol/format/wmscapabilities';
import OlFormatWMTSCapabilities from 'ol/format/wmtscapabilities';
import OlSourceImageWMS from 'ol/source/imagewms';
import OlSourceWMTS from 'ol/source/wmts';
import OlLayerTile from 'ol/layer/tile';
import OlLayerImage from 'ol/layer/image';

import { get } from 'lodash';

/**
 * Helper Class to parse capabilities of WMS and WMTS layers
 *
 * @class CapabilitiesUtil
 */
class CapabilitiesUtil {

  /**
   * @static parseWmsCapabilities - function
   *
   * @param {String} capabilitiesUrl Url to WMS capabilities document
   *
   * @return {Object} An object representing the WMS capabilities.
   */
  static parseWmsCapabilities(capabilitiesUrl) {
    return fetch(capabilitiesUrl)
      .then((response) => response.text())
      .then((data) => {
        const wmsCapabilitiesParser = new OlWMSCapabilities();
        return wmsCapabilitiesParser.read(data);
      });
  }

  /**
   * 
   */
  static parseWmtsCapabilities(capabilitiesUrl) {
    return fetch(capabilitiesUrl)
      .then(response => response.text())
      .then(response => {
        const parser = new OlFormatWMTSCapabilities();
        return parser.read(response);
      });
  }

  /**
   * @static getLayersFromCapabilties - parse {OlLayerTile} from capabilities object
   *
   * @param {Object} capabilities A capabilities object.
   * @param {String} nameField Configure the field which should be set as the
   *                           'name' property in the openlayers layer.
   * @return {OlLayerTile[]} Array of OlLayerTile
   */
  static getLayersFromWmsCapabilties(capabilities, nameField = 'Name') {
    const wmsVersion = get(capabilities,'version');
    const wmsAttribution = get(capabilities,'Service.AccessConstraints');
    const layersInCapabilities = get(capabilities,'Capability.Layer.Layer');
    const wmsGetMapConfig = get(capabilities, 'Capability.Request.GetMap');
    const wmsGetFeatureInfoConfig = get(capabilities, 'Capability.Request.GetFeatureInfo');
    const getMapUrl = get(wmsGetMapConfig,'DCPType[0].HTTP.Get.OnlineResource');
    const getFeatureInfoUrl = get(wmsGetFeatureInfoConfig,'DCPType[0].HTTP.Get.OnlineResource');

    return layersInCapabilities.map((layerObj) => new OlLayerImage({
      opacity: 1,
      title: get(layerObj, 'Title'),
      name: get(layerObj, nameField),
      abstract: get(layerObj, 'Abstract'),
      getFeatureInfoUrl: getFeatureInfoUrl,
      getFeatureInfoFormats: get(wmsGetFeatureInfoConfig, 'Format'),
      queryable: get(layerObj, 'queryable'),
      source: new OlSourceImageWMS({
        url: getMapUrl,
        attributions: wmsAttribution,
        params: {
          'LAYERS': get(layerObj, 'Name'),
          'VERSION': wmsVersion
        }
      })
    }));
  }

  /**
   * 
   */
  static getLayerFromWmtsCapabilties({
    layerName = 'WMTS Layer',
    capabilities,
    layerConfig = {
      layer: 'web',
      matrixSet: 'EPSG:3857'
    }
  }) {
    if (!layerConfig) {
      return;
    }

    const wmtsOptions = OlSourceWMTS.optionsFromCapabilities(capabilities, layerConfig);
    const wmtsSource = new OlSourceWMTS(wmtsOptions);
    const wmtsLayer = new OlLayerTile({
      name: layerName,
      source: wmtsSource
    });

    return wmtsLayer;
  }
}

export default CapabilitiesUtil;
