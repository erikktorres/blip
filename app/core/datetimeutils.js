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

var _ = require('lodash');
var moment = require('moment');

var datetimeUtils = {};

datetimeUtils._momentToday = function() {
  return moment();
};

datetimeUtils.isValidDate = function(date) {
  var m = moment(date);
  // Be careful, if `value` is empty, `m` can be null
  return m && m.isValid();
};

datetimeUtils.yearsAgo = function(date) {
  return datetimeUtils._momentToday().diff(date, 'years');
};

datetimeUtils.yearsAgoText = function(date) {
  var result = datetimeUtils.yearsAgo(date);

  if (result === 0) {
    return 'This year';
  }

  if (result === 1) {
    return result + ' year ago';
  }

  if (result > 1) {
    return result + ' years ago';
  }
};

datetimeUtils.yearsOldText = function(date) {
  var result = datetimeUtils.yearsAgo(date);

  if (result === 1) {
    return result + ' year old';
  }

  if (result > 1) {
    return result + ' years old';
  }
};

module.exports = datetimeUtils;
