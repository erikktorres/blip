/** @jsx React.DOM */
/* 
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 * 
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */
var _ = require('lodash');
var bows = require('bows');
var React = require('react');

// tideline dependencies & plugins
var tidelineBlip = require('tideline/plugins/blip');
var chartSettingsFactory = tidelineBlip.settings;

var Header = require('./header');
var Footer = require('./footer');

var tideline = {
  log: bows('Settings')
};

var Settings = React.createClass({
  chartType: 'settings',
  log: bows('Settings View'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    chartPrefs: React.PropTypes.object.isRequired,
    patientData: React.PropTypes.object.isRequired,
    onClickRefresh: React.PropTypes.func.isRequired,
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToWeekly: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    uploadUrl: React.PropTypes.string.isRequired
  },
  getInitialState: function() {
    return {
      atMostRecent: true,
      inTransition: false,
      title: ''
    };
  },
  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineMain">
        <Header
          chartType={this.chartType}
          atMostRecent={true}
          inTransition={this.state.inTransition}
          title={this.state.title}
          onClickMostRecent={this.handleClickMostRecent}
          onClickOneDay={this.handleClickOneDay}
          onClickModal={this.handleClickModal}
          onClickRefresh={this.props.onClickRefresh}
          onClickSettings={this.handleClickSettings}
          onClickTwoWeeks={this.handleClickTwoWeeks}
        ref="header" />
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              {this.isMissingSettings() ? this.renderMissingSettingsMessage() : this.renderChart()}
            </div>
          </div>
        </div>
        <Footer
         chartType={this.chartType}
         onClickSettings={this.props.onSwitchToSettings}
        ref="footer" />
      </div>
      );
    /* jshint ignore:end */
  },
  renderChart: function() {
    /* jshint ignore:start */
    return (
      <SettingsChart
        bgUnits={this.props.bgPrefs.bgUnits}
        patientData={this.props.patientData}
        ref="chart" />
    );
    /* jshint ignore:end */
  },
  renderMissingSettingsMessage: function() {
    var self = this;
    var handleClickUpload = function() {
      self.props.trackMetric('Clicked Partial Data Upload, No Settings');
    };
    /* jshint ignore:start */
    return (
      <div className="patient-data-message patient-data-message-loading">
        <p>{'It looks like you don\'t have any insulin pump data yet!'}</p>
        <p>{'To see all your data together, please '}
          <a
            href={this.props.uploadUrl}
            target="_blank"
            onClick={handleClickUpload}>upload</a>
          {' your insulin pump data and CGM data at the same time.'}</p>
        <p>{'Or if you already have, try '}
          <a href="" onClick={this.props.onClickRefresh}>refreshing</a>
          {'.'}
        </p>
      </div>
    );
    /* jshint ignore:end */
  },
  isMissingSettings: function() {
    var data = this.props.patientData;
    if (_.isEmpty(data.grouped.settings)) {
      return true;
    }
    return false;
  },
  // handlers
  handleClickModal: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToModal();
  },
  handleClickMostRecent: function(e) {
    if (e) {
      e.preventDefault();
    }
    return;
  },
  handleClickOneDay: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToDaily();
  },
  handleClickSettings: function(e) {
    if (e) {
      e.preventDefault();
    }
    return;
  },
  handleClickTwoWeeks: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToWeekly();
  }
});

var SettingsChart = React.createClass({
  chartOpts: ['bgUnits'],
  log: bows('Settings Chart'),
  propTypes: {
    bgUnits: React.PropTypes.string.isRequired,
    initialDatetimeLocation: React.PropTypes.string,
    patientData: React.PropTypes.object.isRequired,
  },
  componentDidMount: function() {
    this.mountChart(this.getDOMNode());
    this.initializeChart(this.props.patientData);
  },
  componentWillUnmount: function() {
    this.unmountChart();
  },
  mountChart: function(node, chartOpts) {
    this.log('Mounting...');
    this.chart = chartSettingsFactory(node, _.pick(this.props, this.chartOpts));
  },
  unmountChart: function() {
    this.log('Unmounting...');
    this.chart.destroy();
  },
  initializeChart: function(data) {
    this.log('Initializing...');
    if (_.isEmpty(data)) {
      throw new Error('Cannot create new chart with no data');
    }

    this.chart.load(data);
  },
  render: function() {
    /* jshint ignore:start */
    return (
      <div id="tidelineContainer" className="patient-data-chart"></div>
      );
    /* jshint ignore:end */
  }
});

module.exports = Settings;
