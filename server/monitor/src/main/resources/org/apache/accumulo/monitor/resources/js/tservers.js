/*
* Licensed to the Apache Software Foundation (ASF) under one or more
* contributor license agreements.  See the NOTICE file distributed with
* this work for additional information regarding copyright ownership.
* The ASF licenses this file to You under the Apache License, Version 2.0
* (the "License"); you may not use this file except in compliance with
* the License.  You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/**
 * Creates tservers initial table
 */
$(document).ready(function() {
  refreshTServers();

  // Create tooltip for table column information
  $(document).tooltip();
});

/**
 * Makes the REST calls, generates the tables with the new information
 */
function refreshTServers() {
  $.ajaxSetup({
    async: false
  });
  getTServers();
  $.ajaxSetup({
    async: true
  });
  refreshBadTServersTable();
  refreshDeadTServersTable();
  refreshTServersTable();
}

/**
 * Used to redraw the page
 */
function refresh() {
  refreshTServers();
}

/**
 * Generates the tservers table
 */
function refreshBadTServersTable() {
  var data = sessionStorage.tservers === undefined ?
      [] : JSON.parse(sessionStorage.tservers);

  $('#badtservers tr').remove();
  $('#badtservers caption').remove();

  if (data.length === 0 || data.badServers.length === 0) {

    $('#badtservers').hide();
  } else {

    $('#badtservers').show();

    var caption = [];

    caption.push('<span class="table-caption">Non-Functioning&nbsp;' +
        'Tablet&nbsp;Servers</span><br>');
    caption.push('<span class="table-subcaption">The following tablet' +
        ' servers reported a status other than Online</span><br>');

    $('<caption/>', {
      html: caption.join('')
    }).appendTo('#badtservers');

    var items = [];

    var columns = ['Tablet&nbsp;Server&nbsp;',
        'Tablet&nbsp;Server&nbsp;Status&nbsp;'];

    for (i = 0; i < columns.length; i++) {
      var first = i == 0 ? true : false;
      items.push(createHeaderCell(first, 'sortTable(0,' + i + ')',
          '', columns[i]));
    }

    $('<tr/>', {
      html: items.join('')
    }).appendTo('#badtservers');

    $.each(data.badServers, function(key, val) {
      var items = [];
      items.push(createFirstCell(val.id, val.id));
      items.push(createRightCell(val.status, val.status));

      $('<tr/>', {
        html: items.join('')
      }).appendTo('#badtservers');
    });
  }
}

/**
 * Generates the deadtservers table
 */
function refreshDeadTServersTable() {
  var data = sessionStorage.tservers === undefined ?
      [] : JSON.parse(sessionStorage.tservers);

  $('#deadtservers tr').remove();
  $('#deadtservers caption').remove();

  if (data.length === 0 || data.deadServers.length === 0) {

    $('#deadtservers').hide();
  } else {

    $('#deadtservers').show();


    var caption = [];

    caption.push('<span class="table-caption">Dead&nbsp;' +
        'Tablet&nbsp;Servers</span><br>');
    caption.push('<span class="table-subcaption">The following' +
        ' tablet servers are no longer reachable.</span><br>');

    $('<caption/>', {
      html: caption.join('')
    }).appendTo('#deadtservers');

    var items = [];

    var columns = ['Server&nbsp;', 'Last&nbsp;Updated&nbsp;', 'Event&nbsp;',
        'Clear'];

    for (i = 0; i < columns.length; i++) {
      var first = i == 0 ? true : false;
      var sort = i == columns.length - 1 ? '' : 'sortTable(1,' + i + ')';
      items.push(createHeaderCell(first, sort, '', columns[i]));
    }

    $('<tr/>', {
      html: items.join('')
    }).appendTo('#deadtservers');

    $.each(data.deadServers, function(key, val) {
      var items = [];
      items.push(createFirstCell(val.server, val.server));

      var date = new Date(val.lastStatus);
      date = date.toLocaleString().split(' ').join('&nbsp;');
      items.push(createRightCell(val.lastStatus, date));
      items.push(createRightCell(val.status, val.status));
      items.push(createRightCell('', '<a href="javascript:clearDeadTServers(\'' +
          val.server + '\');">clear</a>'));

      $('<tr/>', {
        html: items.join('')
      }).appendTo('#deadtservers');
    });
  }
}

/**
 * Makes the REST POST call to clear dead table server
 *
 * @param {string} server Dead TServer to clear
 */
function clearDeadTServers(server) {
  clearDeadServers(server);
  refreshTServers();
  refreshNavBar();
}

/**
 * Generates the tserver table
 */
function refreshTServersTable() {
  var data = sessionStorage.tservers === undefined ?
      [] : JSON.parse(sessionStorage.tservers);

  $('#tservers tr:gt(0)').remove();

  if (data.length === 0 || data.servers.length === 0) {
    var item = createEmptyRow(13, 'Empty');

    $('<tr/>', {
      html: item
    }).appendTo('#tservers');
  } else {

    $.each(data.servers, function(key, val) {
      var items = [];
      items.push(createFirstCell(val.hostname,
          '<a href="/tservers?s=' + val.id + '">' + val.hostname + '</a>'));

      items.push(createRightCell(val.tablets,
          bigNumberForQuantity(val.tablets)));

      items.push(createRightCell(val.lastContact,
          timeDuration(val.lastContact)));

      items.push(createRightCell(val.responseTime,
          timeDuration(val.responseTime)));

      items.push(createRightCell(val.entries,
          bigNumberForQuantity(val.entries)));

      items.push(createRightCell(val.ingest,
          bigNumberForQuantity(Math.floor(val.ingest))));

      items.push(createRightCell(val.query,
          bigNumberForQuantity(Math.floor(val.query))));

      items.push(createRightCell(val.holdtime,
          timeDuration(val.holdtime)));

      items.push(createRightCell((val.compactions.scans.running +
          val.compactions.scans.queued),
          bigNumberForQuantity(val.compactions.scans.running) +
          '&nbsp;(' + bigNumberForQuantity(val.compactions.scans.queued) +
          ')'));

      items.push(createRightCell((val.compactions.minor.running +
          val.compactions.minor.queued),
          bigNumberForQuantity(val.compactions.minor.running) +
          '&nbsp;(' + bigNumberForQuantity(val.compactions.minor.queued) +
          ')'));

      items.push(createRightCell((val.compactions.major.running +
          val.compactions.major.queued),
          bigNumberForQuantity(val.compactions.major.running) +
          '&nbsp;(' + bigNumberForQuantity(val.compactions.major.queued) +
          ')'));

      items.push(createRightCell(val.indexCacheHitRate * 100,
          Math.round(val.indexCacheHitRate * 100) + '%'));

      items.push(createRightCell(val.dataCacheHitRate * 100,
          Math.round(val.dataCacheHitRate * 100) + '%'));

      items.push(createRightCell(val.osload, bigNumberForQuantity(val.osload)));

      $('<tr/>', {
        html: items.join('')
      }).appendTo('#tservers');
    });
  }
}

/**
 * Sorts the tservers table on the selected column
 *
 * @param {string} table Table ID to sort
 * @param {number} n Column number to sort by
 */
function sortTable(table, n) {
  var tableIDs = ['badtservers', 'deadtservers', 'tservers'];

  if (sessionStorage.tableColumnSort !== undefined &&
      sessionStorage.tableColumnSort == n &&
      sessionStorage.direction !== undefined) {
    direction = sessionStorage.direction === 'asc' ? 'desc' : 'asc';
  } else {
    direction = sessionStorage.direction === undefined ?
        'asc' : sessionStorage.direction;
  }
  sessionStorage.tableColumn = tableIDs[table];
  sessionStorage.tableColumnSort = n;
  sortTables(tableIDs[table], direction, n);
}
