import { Button, Tooltip } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import { AbstractTooltipProps, TooltipPlacement } from 'antd/lib/tooltip';
import * as React from 'react';

import { CSS_PREFIX } from '../../constants';

export type OwnProps = {
  /**
   * Additional [antd tooltip](https://ant.design/components/tooltip/)
   * properties to pass to the tooltip component. Note: The props `title`
   * and `placement` will override the props `tooltip` and `tooltipPlacement`
   * of this component!
   */
  tooltipProps?: AbstractTooltipProps;
  /**
   * The tooltip to be shown on hover.
   */
  tooltip?: string;
  /**
   * The position of the tooltip.
   */
  tooltipPlacement?: TooltipPlacement;
};

export type SimpleButtonProps = OwnProps & ButtonProps;

const defaultClassName = `${CSS_PREFIX}simplebutton`;

const SimpleButton: React.FC<SimpleButtonProps> = ({
  className,
  type = 'primary',
  tooltip,
  tooltipPlacement,
  tooltipProps = {
    mouseEnterDelay: 1.5
  },
  ...passThroughProps
}) => {

  const finalClassName = className
    ? `${className} ${defaultClassName}`
    : `${defaultClassName}`;

  return (
    <Tooltip
      title={tooltip}
      placement={tooltipPlacement}
      {...tooltipProps}
    >
      <Button
        className={finalClassName}
        {...passThroughProps}
      >
        {passThroughProps.children}
      </Button>
    </Tooltip>
  );
};

export default SimpleButton;
