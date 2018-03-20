import React from 'react';
import PropTypes from 'prop-types';

import {
  Select,
  Spin
} from 'antd';
const Option = Select.Option;

import './RemoteSelectField.less';

/**
 * TODO
 *
 * @class The RemoteSelectField
 * @extends React.Component
 */
class RemoteSelectField extends React.Component {

  /**
   * The className added to this component.
   * @type {String}
   * @private
   */
  className = 'react-geo-remote-select-field'

  static propTypes = {
    /**
     * The className which should be added.
     * @type {String}
     */
    className: PropTypes.string,


    remoteUrl: PropTypes.string.isRequired,
    fetchOptions: PropTypes.object
  }

  /**
   * The default props
   */
  static defaultProps = {
    // TODO
    fetchOptions: {
      
    }
  }

  /**
   * .
   * @constructs Map
   */
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      value: [],
      fetching: false
    };
  }

  /**
   * 
   */
  componentWillMount() {
    this.fetchData();
  }

  // /**
  //  * 
  //  * @param {*} nextProps 
  //  */
  // componentWillReceiveProps(nextProps) {
  //   if (!isEqual(this.props.remoteUrl, nextProps.remoteUrl)) {
  //     this.fetchData(nextProps.remoteUrl);
  //   }
  // }

  handleChange = value => {
    this.setState({
      value,
      data: [],
      fetching: false,
    });
  }

  fetchData = () => {
    const {
      remoteUrl,
      fetchOptions
    } = this.props;

    this.setState({ data: [], fetching: true });
    fetch(remoteUrl, fetchOptions)
      .then(response => response.json())
      .then(data => this.setState({ data, fetching: false }));
  }
    
  renderTemplate = (d, idx) => {
    const { id } = d;
    return <Option key={id || idx}>{d.email}</Option>;
  }

  /**
   * The render function.
   */
  render() {
    const {
      className
    } = this.props;

    const {
      value,
      fetching,
      data
    } = this.state;

    const finalClassName = className
      ? `${className} ${this.className}`
      : this.className;

    return (
      <Select
        mode="multiple"
        className={finalClassName}
        value={value}
        placeholder="Select users" // TODO
        notFoundContent={fetching ? <Spin size="small" /> : null}
        onSearch={this.fetchData}
        onChange={this.handleChange}
        allowClear
      >
        {data.map(d => this.renderTemplate(d))}
      </Select>
    );
  }
}

export default RemoteSelectField;
