import './PropertyGrid.less';

import { Table } from 'antd';
import { TableProps } from 'antd/lib/table';
import _get from 'lodash/get';
import { getUid } from 'ol';
import OlFeature from 'ol/Feature';
import OlGeometry from 'ol/geom/Geometry';
import React, {
  useMemo
} from 'react';

import { CSS_PREFIX } from '../../constants';

type AttributeNames = {
  [key: string]: string;
};

interface OwnProps {
  /**
   * Title of the attribute name column
   */
  attributeNameColumnTitle?: string;
  /**
   * Value in percent representing the width of the attribute name column
   * The width of attribute value column wil be calculated depending in this
   */
  attributeNameColumnWidthInPercent?: number;
  /**
   * Title of the attribute value column
   */
  attributeValueColumnTitle?: string;
  /**
   * A CSS class which should be added.
   */
  className?: string;
  /**
   * Array of attribute names to filter
   */
  attributeFilter?: string[];
  /**
   * Object containing a mapping of attribute names in OL feature to custom ones
   */
  attributeNames?: AttributeNames;
  /**
   * Feature for which the properties should be shown
   */
  feature: OlFeature<OlGeometry>;
}

export type PropertyGridProps<T = any> = OwnProps & TableProps<T>;

const defaultClassName = `${CSS_PREFIX}propertygrid`;

/**
 * Component representing a feature grid showing the attribute values of a simple feature.
 */
const PropertyGrid: React.FC<PropertyGridProps> = ({
  attributeNameColumnTitle = 'Attribute name',
  attributeNameColumnWidthInPercent = 50,
  attributeValueColumnTitle = 'Attribute value',
  className,
  attributeFilter,
  attributeNames,
  feature,
  ...passThroughProps
}) => {

  const dataSource = useMemo(() => {
    let filter = attributeFilter;

    if (!filter) {
      filter = feature.getKeys().filter((attrName: string) => attrName !== 'geometry');
    }

    return filter.map((attr: any) => {
      const fid = getUid(feature);

      return {
        attributeName: (attributeNames && _get(attributeNames, attr)) ?
          _get(attributeNames, attr) :
          attr,
        attributeValue: feature.get(attr),
        key: `ATTR_${attr}_fid_${fid}`
      };
    });
  }, [attributeFilter, attributeNames, feature]);

  const columns = useMemo(() => {
    return [{
      title: attributeNameColumnTitle,
      dataIndex: 'attributeName',
      key: 'attributeName',
      width: `${attributeNameColumnWidthInPercent}%`
    }, {
      title: attributeValueColumnTitle,
      dataIndex: 'attributeValue',
      key: 'attributeValue',
      width: `${100 - attributeNameColumnWidthInPercent}%`
    }];
  }, [attributeNameColumnTitle, attributeNameColumnWidthInPercent, attributeValueColumnTitle]);

  const finalClassName = className
    ? `${className} ${defaultClassName}`
    : defaultClassName;

  return (
    <Table
      className={finalClassName}
      rowKey={record => record.key}
      dataSource={dataSource}
      columns={columns}
      pagination={false}
      {...passThroughProps}
    />
  );
};

export default PropertyGrid;
