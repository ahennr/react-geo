/*eslint-env jest*/
import TestUtils from '../../../spec/TestUtils';

import CoordinateTransformPanel from './CoordinateTransformPanel.jsx';

describe('<CoordinateTransformPanel />', () => {
  let map;
  let wrapper;

  it('is defined', () => {
    expect(CoordinateTransformPanel).not.toBe(undefined);
  });

  beforeEach(() => {
    map = TestUtils.createMap();
    wrapper = TestUtils.mountComponent(CoordinateTransformPanel, {
      t: () => {},
      map: map
    });
  });

  afterEach(() => {
    wrapper.unmount();
    TestUtils.unmountMapDiv();
  });

  it('can be rendered', () => {
    expect(wrapper).not.toBe(undefined);
  });

  describe('#performCoordinateTransformation', () => {
    it('is defined', () => {
      expect(wrapper.instance().performCoordinateTransformation).toBeDefined();
    });

    it('updates base coordinate in state by the one of map click event', () => {
      const elCords = [19.09, 1909.09];
      const transformCoordinatesMock = jest.fn();
      wrapper.instance().transformCoordinates = transformCoordinatesMock;
      wrapper.instance().showCoordinatesOnMap = jest.fn();
      wrapper.instance().performCoordinateTransformation({
        coordinate: elCords
      });
      const stateAfter = wrapper.state();
      expect(stateAfter.xValOrigin).toBe(elCords[0]);
      expect(stateAfter.yValOrigin).toBe(elCords[1]);
      expect(transformCoordinatesMock.mock.calls).toHaveLength(1);
    });
  });

  describe('#transformCoordinates', () => {
    it('is defined', () => {
      expect(wrapper.instance().transformCoordinates).toBeDefined();
    });

    it('does nothing if target ref ssystem is not defined', () => {
      const stateToSet = {
        xValOrigin: 19.09,
        yValOrigin: 19.09,
        projOrigin: 'EPSG:25832',
        projTarget: false
      };
      wrapper.setState(stateToSet, () => {
        const result = wrapper.instance().transformCoordinates();
        expect(result).toBe(false);
      });
    });

    it('calls transform method to transform coordinates in backend', () => {
      const stateToSet = {
        xValOrigin: 19.09,
        yValOrigin: 19.09,
        projOrigin: 'EPSG:25832',
        projTarget: 'EPSG:31466',
      };

      const xTarget = 47.11;
      const yTarget = 1.15;

      wrapper.setState(stateToSet, () => {
        fetch.mockResponse(JSON.stringify({
          data: {
            transformedPoints: {
              Pkt1: {
                srid: 31466,
                x: xTarget,
                y: yTarget
              }
            }
          },
          success: true,
          total: 1
        }));

        wrapper.instance().transformCoordinates();
        window.setTimeout(() => {
          const stateAfter = wrapper.state();
          expect(stateAfter.xValTarget).toBe(xTarget);
          expect(stateAfter.yValTarget).toBe(yTarget);
        }, 50);
      });
    });
  });

  describe('#formatCoordinates', () => {
    it('is defined', () => {
      expect(wrapper.instance().formatCoordinates).toBeDefined();
    });

    const x = 100.123456789;
    const y = 200.456789101;

    it ('returns formatted metric coordinates if target src is not WGS84', () => {

      const transformedPointsDefault = {
        xTarget: wrapper.instance().numberFormatter(x),
        yTarget: wrapper.instance().numberFormatter(y)
      };
      const formatted = wrapper.instance().formatCoordinates(x, y);
      expect(formatted).toEqual(transformedPointsDefault);
    });

    it ('returns formatted geographical coordinates if target src is WGS84 and the decimalDegrees format is chosen', () => {

      wrapper.setState({
        projTarget: 'EPSG:4326',
        wgs84Format: 'decimalDegrees'
      });
      const formatted = wrapper.instance().formatCoordinates(x, y);
      const expectedCoords = {
        xTarget: 100.123457,
        yTarget: 200.456789
      };
      expect(formatted).toEqual(expectedCoords);
    });

    it ('returns formatted geographical coordinates if target src is WGS84 and the degreesAndDecimalMinutes format is chosen', () => {

      wrapper.setState({
        projTarget: 'EPSG:4326',
        wgs84Format: 'degreesAndDecimalMinutes'
      });

      const formatted = wrapper.instance().formatCoordinates(x, y);
      const expectedCoords = {
        xTarget: '100° 7.4074\'',
        yTarget: '200° 27.4073\''
      };
      expect(formatted).toEqual(expectedCoords);
    });

    it ('returns formatted geographical coordinates if target src is WGS84 and the degreesMinutesAndDecimalSeconds format is chosen', () => {

      wrapper.setState({
        projTarget: 'EPSG:4326',
        wgs84Format: 'degreesMinutesAndDecimalSeconds'
      });

      const formatted = wrapper.instance().formatCoordinates(x, y);
      const expectedCoords = {
        xTarget: '100° 7\' 24.44\'\'',
        yTarget: '200° 27\' 24.44\'\''
      };
      expect(formatted).toEqual(expectedCoords);
    });
  });

  describe('#onXValOriginChange', () => {

    it ('updates value for xValOrigin', () => {
      const newValue = 100;
      wrapper.instance().onXValOriginChange(newValue);
      expect(wrapper.state().xValOrigin).toBe(newValue);

    });
  });

  describe('#onYValOriginChange', () => {

    it ('updates value for yValOrigin', () => {
      const newValue = 200;
      wrapper.instance().onYValOriginChange(newValue);
      expect(wrapper.state().yValOrigin).toBe(newValue);

    });
  });

});
