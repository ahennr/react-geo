import React from 'react';
import PropTypes from 'prop-types';
import OlMap from 'ol/map';
import OlLayerVector from 'ol/layer/vector';
import OlSourceVector from 'ol/source/vector';
import OlFeature from 'ol/feature';
import OlPoint from 'ol/geom/point';
import OlStyle from 'ol/style/style';
import OlStyleText from 'ol/style/text';
import OlStyleFill from 'ol/style/fill';
import { Card, InputNumber, Input, Radio, Tooltip } from 'antd';
import proj4 from 'proj4';
const RadioGroup = Radio.Group;
import {
  CoordinateReferenceSystemCombo,
  ProjectionUtil
} from '../../index';

import './CoordinateTransformPanel.less';

/**
 * The CoordinateTransformPanel container
 *
 * @class CoordinateTransformPanel
 * @extends React.Component
 */
export class CoordinateTransformPanel extends React.Component {

  _transformLayerName = 'react-geo-transform-layer';

  /**
  * The properties.
  * @type {Object}
  */
 static propTypes = {
   /**
    * The className which should be added.
    *
    * @type {String}
    */
   className: PropTypes.string,

   /**
    * Instance of OL map this component is bound to.
    *
    * @type {OlMap}
    */
   map: PropTypes.instanceOf(OlMap).isRequired
 }

  /**
   * Create a TransformPanel.
   * @constructs TransformPanel
   */
 constructor(props) {
   super(props);

   this._transformLayer = new OlLayerVector({
     name: this._transformLayerName,
     source: new OlSourceVector(),
     style: new OlStyle({
       text: new OlStyleText({
         text: '\uf05b',
         font: 'normal 24px FontAwesome',
         textBaseline: 'middle',
         fill: new OlStyleFill({
           color: 'rgba(255, 0, 0, 0.7)'
         })
       })
     })
   });

   this.state = {
     xValOrigin: props.map.getView().getCenter()[0],
     yValOrigin: props.map.getView().getCenter()[1],
     projOrigin: props.map.getView().getProjection().getCode(),
     xValTarget: undefined,
     yValTarget: undefined,
     projTarget: '',
     wgs84Format: 'decimalDegrees'
   };
 }

 /**
  * componentWillMount - function
  * registers 'click' event on map and adds transformLayer layer to map
  */
 componentWillMount() {
   const {map} = this.props;
   map.on('click', this.performCoordinateTransformation, this);
   map.addLayer(this._transformLayer);
 }

 /**
  * componentWillUnmount - function
  *
  * unregisters 'click' event on map and removes transformLayer layer from map
  */
 componentWillUnmount() {
   const {map} = this.props;
   map.un('click', this.performCoordinateTransformation, this);
   map.removeLayer(this._transformLayer);
 }


  /**
   * performCoordinateTransformation - function
   * update base coordinate in state by the one of map click event
   *
   * @param {ol.MapBrowserEvent} evt The MapBrowserEvent holding information on
   * clicked coordinate
   *
   */
 performCoordinateTransformation = (evt) => {
   const coordsToSet = evt.coordinate;

   this.setState({
     xValOrigin: coordsToSet[0],
     yValOrigin: coordsToSet[1]
   }, this.transformCoordinate);
   this.showCoordinatesOnMap(coordsToSet);
 }

 /**
  * transformCoordinates - function
  * call transform method to transform coordinates in backend
  */
 transformCoordinates = () => {
   const {
     xValOrigin,
     yValOrigin,
     projOrigin,
     proj4defTarget
   } = this.state;

   if (!proj4defTarget) {
     return false;
   }

   const transformedResult = proj4(projOrigin, proj4defTarget, [xValOrigin, yValOrigin]);
   const x = transformedResult[0];
   const y = transformedResult[1];
 
   const { xTarget, yTarget } = this.formatCoordinates(x, y);
   this.setState({
     xValTarget: x,
     yValTarget: y,
     xTarget,
     yTarget
   });
  

   //  const requestParamObj = {
   //    xVal: xValOrigin,
   //    yVal: yValOrigin,
   //    fromEpsgCode: projOrigin.split(':')[1],
   //    toEpsgCodes: [projTarget.split(':')[1]]
   //  };
   //  const params = UrlUtil.objectToRequestString(requestParamObj);

   //  const trafoUrl = '';
   //  fetch(`${trafoUrl}?${params}`, {
   //    credentials: 'same-origin'
   //  }).then(data => data.json())
   //    .then((resonseObj) => {
   //      const transformedPoints = get(resonseObj, 'data.transformedPoints');
   //      if (transformedPoints && Object.keys(transformedPoints).length > 0) {
   //        const ptKey = Object.keys(transformedPoints)[0];
   //        const { x, y } = transformedPoints[ptKey];
   //        const { xTarget, yTarget } = this.formatCoordinates(x, y);
   //        this.setState({
   //          xValTarget: x,
   //          yValTarget: y,
   //          xTarget,
   //          yTarget
   //        });
   //      }
   //    }).catch(() => {
   //      message.error('TransformPanel.couldNotTransformCoordinateMsg');
   //    });
 }

 /**
  * formatCoordinates - function
  * Format coordinate depending on selected CRS and coordinate format
  *
  * @param {Number} x value of abscissa
  * @param {Number} y value of ordinate
  *
  * @return {Object} Object containing formatted text for x and y
  *
  */
 formatCoordinates = (x, y) => {
   const { projTarget, wgs84Format } = this.state;
   const transformedPointsDefault = {
     xTarget: this.numberFormatter(x),
     yTarget: this.numberFormatter(y)
   };
   if (projTarget !== 'EPSG:4326') {
     return transformedPointsDefault;
   } else {
     switch (wgs84Format) {
       case 'decimalDegrees':
         return {
           xTarget: this.numberFormatter(x, 6),
           yTarget: this.numberFormatter(y, 6)
         };
       case 'degreesAndDecimalMinutes':
         return {
           xTarget: ProjectionUtil.dToDmm(x),
           yTarget: ProjectionUtil.dToDmm(y)
         };
       case 'degreesMinutesAndDecimalSeconds':
         return {
           xTarget: ProjectionUtil.dToDms(x),
           yTarget: ProjectionUtil.dToDms(y)
         };
       default:
         return transformedPointsDefault;
     }
   }
 }

 /**
  * Adds the clicked position to the map as feature with style defined in
  * #setupTransformLayer method.
  * Also will be called after #onTransformBtnClick method was triggered (e.g.
  * after user have changed some input values manually).
  *
  * @param {Array} coordsToSet Coordinates array in [x,y] format.
  */
  showCoordinatesOnMap = (coordsToSet) => {
    const feature = new OlFeature({
      geometry: new OlPoint(coordsToSet)
    });
    this._transformLayer.getSource().clear();
    this._transformLayer.getSource().addFeatures([feature]);
  }

  /**
   * onXValOriginChange - function
   * Update state value of xValOrigin
   *
   * @param {Number} xValOrigin value to update
   */
  onXValOriginChange = (xValOrigin) => {
    this.setState({xValOrigin});
  }

  /**
   * onYValOriginChange - function
   * Update state value of yValOrigin
   *
   * @param {Number} yValOrigin value to update
   */
  onYValOriginChange = (yValOrigin) => {
    this.setState({yValOrigin});
  }

  /**
   * onWgs84FormatChange - function
   * Update state value of wgs84Format and perform formatting afterwards
   *
   * @param {Event} evt Input event
   */
  onWgs84FormatChange = (evt) => {
    const {
      xValTarget,
      yValTarget
    } = this.state;
    this.setState({
      wgs84Format: evt.target.value
    }, () => {
      const { xTarget, yTarget } = this.formatCoordinates(xValTarget, yValTarget);
      this.setState({
        xTarget,
        yTarget
      });
    });
  }

  /**
   * crsSelect: set fileProjection in state and call epsgResolve as callback
   *
   * @param {Object} crsObj value object of CoordinateReferenceSystemCombo
   */
  crsSelect = crsObj => {
    const projString = `EPSG:${crsObj.code}`;
    const { proj4def } = crsObj;
    this.setState({
      projTarget: projString,
      proj4defTarget: proj4def
    }, this.transformCoordinates);
  }

  /**
   * numberFormatter - function
   * Format number by given number of digits
   *
   * @param {Number} val    value to format
   * @param {Number} digits number of digits
   *
   * @return {Number} formatted number
   */
  numberFormatter = (val, digits) => {
    if (!digits) {
      digits = 2;
    }
    return Math.round(val * Math.pow(10, digits)) / Math.pow(10, digits);
  }

  /**
   * The render function.
   */
  render() {
    const {
      xValOrigin,
      yValOrigin,
      xTarget,
      yTarget,
      projTarget,
      wgs84Format
    } = this.state;

    const mapProj = this.props.map.getView().getProjection();
    const projOriginObj = mapProj.getCode();

    const projOriginTitle = `${projOriginObj.value} (EPSG:${projOriginObj.code})`;

    const isWgs84 = projTarget === 'EPSG:4326';

    let targetEastingText = 'TransformPanel.eastingText';
    let targetNorthingText = 'TransformPanel.northingText';

    if (isWgs84) {
      targetNorthingText = 'TransformPanel.eastLonText';
      targetEastingText = 'TransformPanel.nordLanText';
    }

    return <div className="transform-panel">
      <Card
        title={'TransformPanel.applicationCrsCardTitle'}
        className="origin-crs-card">
        <div className="transform-form">
          <div className="row-div title-div">
            <span className="label-span">{'TransformPanel.crsDescriptionText'}:</span>
            <span className="ant-form-text"><b>{projOriginTitle}</b></span>
          </div>
          <div className="row-div">
            <span className="label-span">{'TransformPanel.eastingText'}:</span>
            <InputNumber
              size="small"
              step={0.01}
              formatter={this.numberFormatter}
              onChange={this.onXValOriginChange}
              value={xValOrigin}
            />
          </div>
          <div className="row-div">
            <span className="label-span">{'TransformPanel.northingText'}:</span>
            <InputNumber
              size="small"
              step={0.01}
              formatter={this.numberFormatter}
              onChange={this.onYValOriginChange}
              value={yValOrigin}
            />
          </div>
        </div>
      </Card>
      <Card
        title={'TransformPanel.targetCrsCardTitle'}
        className="target-crs-card">
        <div className="transform-form">
          <div className="flex-row-div">
            <span className="label-span">{'TransformPanel.crsDescriptionText'}:</span>
            <CoordinateReferenceSystemCombo
              onSelect={this.crsSelect}
              emptyTextPlaceholderText={'CoordinateReferenceSystemCombo.emptyTextPlaceholderText'}
              size="small"
              className="flex-combo"
            />
          </div>
          {
            isWgs84 ?
              <RadioGroup
                className="radio-div"
                value={wgs84Format}
                onChange={this.onWgs84FormatChange}
              >
                <Tooltip title={'TransformPanel.decimalDegreesHelpText'}>
                  <Radio value={'decimalDegrees'}>{'TransformPanel.decimalDegreesExpression'}</Radio>
                </Tooltip>
                <Tooltip title={'TransformPanel.degreesAndDecimalMinutesHelpText'}>
                  <Radio value={'degreesAndDecimalMinutes'}>{'TransformPanel.degreesAndDecimalMinutesExpression'}</Radio>
                </Tooltip>
                <Tooltip title={'TransformPanel.degreesMinutesAndDecimalSecondsHelpText'}>
                  <Radio value={'degreesMinutesAndDecimalSeconds'}>{'TransformPanel.degreesMinutesAndDecimalSecondsExpression'}</Radio>
                </Tooltip>
              </RadioGroup>
              : null
          }
          <div className="row-div">
            <span className="label-span">{targetEastingText}:</span>
            <Input
              size="small"
              value={xTarget}
              disabled={!projTarget}
            />
          </div>
          <div className="row-div">
            <span className="label-span">{targetNorthingText}:</span>
            <Input
              size="small"
              value={yTarget}
              disabled={!projTarget}
            />
          </div>
        </div>
      </Card>
    </div>;
  }
}

export default CoordinateTransformPanel;
