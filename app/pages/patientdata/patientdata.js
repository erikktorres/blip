/** @jsx React.DOM */
/**
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
 */

var React = require('react');
var _ = require('lodash');
var moment = require('moment');
var bows = require('bows');

var config = require('../../config');

var utils = require('../../core/utils');
var personUtils = require('../../core/personutils');
var queryString = require('../../core/querystring');
var Header = require('../../components/chart').header;
var Daily = require('../../components/chart').daily;
var Weekly = require('../../components/chart').weekly;
var Settings = require('../../components/chart').settings;

var nurseShark = require('tideline/plugins/nurseshark/');

var Messages = require('../../components/messages');

var AuthenticatedRoute = require('../../core/AuthenticatedRoute');

var AuthStore = require('../../stores/AuthStore');
var GroupActions = require('../../actions/GroupActions');
var GroupStore = require('../../stores/GroupStore');
var TidelineDataStore = require('../../stores/TidelineDataStore');
var HealthDataActions = require('../../actions/HealthDataActions');
var LogActions = require('../../actions/LogActions');

var api = require('../../core/api');

var PatientData = React.createClass({
  mixins: [AuthenticatedRoute],

  getInitialState: function() {
    var params = this.getQueryParams();
    var state = {
      fetchingPatient: true,
      fetchingPatientData: true,
      chartPrefs: {
        hiddenPools: {
          // pass null here to *completely* disable the tabular display of basal settings
          basalSettings: null
        }
      },
      chartType: 'daily',
      showingThreadWithId: null,
      createMessageDatetime: null,
      datetimeLocation: null,
      initialDatetimeLocation: null,
      messages: null
    };

    return _.assign(this.getStateFromStores(), state);
  },

  getQueryParams: function() {
    return queryString.parseTypes(window.location.search);
  },

  getStateFromStores: function(props) {
    props = props || this.props;
    var patientData = TidelineDataStore.getForGroup(props.params.patientId);
    return {
      user: AuthStore.getLoggedInUser(),
      patient: GroupStore.get(props.params.patientId),
      fetchingPatient: GroupStore.isFetching(props.params.patientId),
      patientData: patientData,
      fetchingPatientData: TidelineDataStore.isFetchingForGroup(props.params.patientId),
      bgPrefs: {
        bgClasses: patientData ? patientData.bgClasses : null,
        bgUnits: patientData ? patientData.bgUnits : null
      }
    };
  },

  componentWillMount: function() {
    var params = this.getQueryParams();
    if (!_.isEmpty(params)) {
      this.setState({
        chartPrefs: {
          hiddenPools: {
            basalSettings: params.showbasalsettings ?  true : null
          },
          bolusRatio: params.dynamicCarbs ? 0.5 : 0.35,
          dynamicCarbs: params.dynamicCarbs
        }
      });
    }

    this.fetchData();
    LogActions.trackMetric('Viewed Data');
  },

  fetchData: function(props) {
    props = props || this.props;
    GroupActions.fetch(props.params.patientId);
    HealthDataActions.fetchForGroup(props.params.patientId);
  },

  componentDidMount: function() {
    AuthStore.addChangeListener(this.handleStoreChange);
    GroupStore.addChangeListener(this.handleStoreChange);
    TidelineDataStore.addChangeListener(this.handleStoreChange);
  },

  componentWillUnmount: function() {
    AuthStore.removeChangeListener(this.handleStoreChange);
    GroupStore.removeChangeListener(this.handleStoreChange);
    TidelineDataStore.removeChangeListener(this.handleStoreChange);
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState(this.getStateFromStores(nextProps));
    if (nextProps.params.patientId !== this.props.params.patientId) {
      this.fetchData(nextProps);
    }
  },

  handleStoreChange: function() {
    if (!this.isMounted()) {
      return;
    }
    this.setState(this.getStateFromStores());
  },

  log: bows('PatientData'),

  render: function() {
    var patientData = this.renderPatientData();
    var messages = this.renderMessagesContainer();

    /* jshint ignore:start */
    return (
      <div className="patient-data js-patient-data-page">
        {messages}
        {patientData}
      </div>
    );
    /* jshint ignore:end */
  },

  renderPatientData: function() {
    if (this.isLoadingOrRefreshing()) {
      return this.renderLoading();
    }

    if (this.isEmptyPatientData() || this.isInsufficientPatientData()) {
      return this.renderNoData();
    }

    return this.renderChart();
  },

  isLoadingOrRefreshing: function() {
    return this.state.fetchingPatient || this.state.fetchingPatientData;
  },

  renderEmptyHeader: function() {
    /* jshint ignore:start */
    return (
      <Header
        chartType={'no-data'}
        inTransition={false}
        atMostRecent={false}
        title={'Data'}
        ref="header" />
      );
    /* jshint ignore:end */
  },

  renderLoading: function() {
    var header = this.renderEmptyHeader();
    /* jshint ignore:start */
    return (
      <div>
        {header}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <div className="patient-data-message patient-data-message-loading">
                Loading data...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderNoData: function() {
    var content = 'This patient doesn\'t have any data yet.';
    var header = this.renderEmptyHeader();

    var self = this;
    var handleClickUpload = function() {
      LogActions.trackMetric('Clicked No Data Upload');
    };

    if (this.isRootOrAdmin()) {
      /* jshint ignore:start */
      content = (
        <div className="patient-data-message-no-data">
          <p>{'There is no data in here yet!'}</p>
          <a
            href={api.getUploadUrl()}
            target="_blank"
            onClick={handleClickUpload}>Upload data</a>
          <p>
            {'Or try '}<a href="" onClick={this.handleClickRefresh}>refreshing</a>{' the page.'}
          </p>
        </div>
      );
      /* jshint ignore:end */
    }

    /* jshint ignore:start */
    return (
      <div>
        {header}
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              <div className="patient-data-message">
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  isEmptyPatientData: function() {
    var patientDataLength =
      utils.getIn(this.state.patientData, ['data', 'length'], 0);
    return !Boolean(patientDataLength);
  },

  isInsufficientPatientData: function() {
    // add additional checks against data and return false iff:
    // only one datapoint
    var data = this.state.patientData.data;
    if (data.length === 1) {
      this.log('Sorry, you need more than one datapoint.');
      return true;
    }

    // only two datapoints, less than 24 hours apart
    var start = moment(data[0].normalTime);
    var end = moment(data[data.length - 1].normalTime);
    if (end.diff(start, 'days') < 1) {
      this.log('Sorry, your data needs to span at least a day.');
      return true;
    }

    // only messages data
    if (_.reject(data, function(d) { return d.type === 'message'; }).length === 0) {
      this.log('Sorry, tideline is kind of pointless with only messages.');
      return true;
    }
    return false;
  },

  isRootOrAdmin: function() {
    return personUtils.hasPermissions('root', this.state.patient) ||
           personUtils.hasPermissions('admin', this.state.patient);
  },

  renderChart: function() {
    switch (this.state.chartType) {
      case 'daily':
        /* jshint ignore:start */
        return (
          <Daily
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            imagesBaseUrl={config.IMAGES_ENDPOINT + '/tideline'}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            patientData={this.state.patientData}
            onClickRefresh={this.handleClickRefresh}
            onCreateMessage={this.handleShowMessageCreation}
            onShowMessageThread={this.handleShowMessageThread}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            updateChartPrefs={this.updateChartPrefs}
            updateDatetimeLocation={this.updateDatetimeLocation}
            ref="tideline" />
          );
        /* jshint ignore:end */
      case 'weekly':
        /* jshint ignore:start */
        return (
          <Weekly
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            imagesBaseUrl={config.IMAGES_ENDPOINT + '/tideline'}
            initialDatetimeLocation={this.state.initialDatetimeLocation}
            patientData={this.state.patientData}
            onClickRefresh={this.handleClickRefresh}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            updateChartPrefs={this.updateChartPrefs}
            updateDatetimeLocation={this.updateDatetimeLocation}
            uploadUrl={api.getUploadUrl()}
            ref="tideline" />
          );
        /* jshint ignore:end */
      case 'settings':
        /* jshint ignore:start */
        return (
          <Settings
            bgPrefs={this.state.bgPrefs}
            chartPrefs={this.state.chartPrefs}
            patientData={this.state.patientData}
            onClickRefresh={this.handleClickRefresh}
            onSwitchToDaily={this.handleSwitchToDaily}
            onSwitchToSettings={this.handleSwitchToSettings}
            onSwitchToWeekly={this.handleSwitchToWeekly}
            uploadUrl={api.getUploadUrl()}
            ref="tideline" />
          );
        /* jshint ignore:end */
    }
  },

  renderMessagesContainer: function() {
    /* jshint ignore:start */
    if (this.state.createMessageDatetime) {
      return (
        <Messages
          createDatetime={this.state.createMessageDatetime}
          patientId={this.props.params.patientId}
          onClose={this.closeMessageCreation}
          onCreateThread={this.handleMessageCreation}
          onEditMessage={this.handleEditMessage} />
      );
    } else if(this.state.showingThreadWithId) {
      return (
        <Messages
          threadId={this.state.showingThreadWithId}
          patientId={this.props.params.patientId}
          onClose={this.closeMessageThread}
          onAddComment={this.handleReplyToMessage}
          onEditMessage={this.handleEditMessage} />
      );
    }
    /* jshint ignore:end */
  },

  closeMessageThread: function(){
    this.setState({ showingThreadWithId: null });
    this.refs.tideline.closeMessageThread();
    LogActions.trackMetric('Closed Message Thread Modal');
  },

  closeMessageCreation: function(){
    this.setState({ createMessageDatetime: null });
    this.refs.tideline.closeMessageThread();
    LogActions.trackMetric('Closed New Message Modal');
  },

  handleMessageCreation: function(message){
    // Note: this also mutates the TidelineData contained in the TidelineDataStore
    // so no need to do anything to update it
    // Not super elegant, but works for now
    this.refs.tideline.createMessageThread(nurseShark.reshapeMessage(message));
    LogActions.trackMetric('Created New Message');
  },

  handleReplyToMessage: function(comment) {
    LogActions.trackMetric('Replied To Message');
  },

  handleEditMessage: function(message) {
    this.refs.tideline.editMessageThread(nurseShark.reshapeMessage(message));
    LogActions.trackMetric('Edit To Message');
  },

  handleShowMessageThread: function(threadId) {
    this.setState({showingThreadWithId: threadId});

    LogActions.trackMetric('Clicked Message Icon');
  },

  handleShowMessageCreation: function(datetime) {
    this.setState({ createMessageDatetime : datetime });
    LogActions.trackMetric('Clicked Message Pool Background');
  },

  handleSwitchToDaily: function(datetime) {
    this.setState({
      chartType: 'daily',
      initialDatetimeLocation: datetime || this.state.datetimeLocation
    });
    LogActions.trackMetric('Clicked Switch To One Day', {
      fromChart: this.state.chartType
    });
  },

  handleSwitchToWeekly: function(datetime) {
    this.setState({
      chartType: 'weekly',
      initialDatetimeLocation: datetime || this.state.datetimeLocation
    });
    LogActions.trackMetric('Clicked Switch To Two Week', {
      fromChart: this.state.chartType
    });
  },

  handleSwitchToSettings: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.setState({
      chartType: 'settings'
    });
    LogActions.trackMetric('Clicked Switch To Settings', {
      fromChart: this.state.chartType
    });
  },

  handleClickRefresh: function(e) {
    this.handleRefresh(e);
    LogActions.trackMetric('Clicked No Data Refresh');
  },

  handleRefresh: function(e) {
    if (e) {
      e.preventDefault();
    }

    this.setState({title: this.DEFAULT_TITLE});
    HealthDataActions.fetchForGroup(this.props.params.patientId);
  },

  updateChartPrefs: function(newChartPrefs) {
    var currentPrefs = _.clone(this.state.chartPrefs);
    _.assign(currentPrefs, newChartPrefs);
    this.setState({
      chartPrefs: currentPrefs
    }, function() {
      // this.log('Global example state changed:', JSON.stringify(this.state));
    });
  },

  updateDatetimeLocation: function(datetime) {
    this.setState({
      datetimeLocation: datetime
    }, function() {
      // this.log('Global example state changed:', JSON.stringify(this.state));
    });
  }
});

module.exports = PatientData;
