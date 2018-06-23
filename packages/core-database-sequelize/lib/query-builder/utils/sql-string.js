/*
Copyright (c) 2012 Felix Geisendörfer (felix@debuggable.com) and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/* eslint-disable */
/* Based on https://github.com/mysqljs/sqlstring @ 485caf63c8f292f91c07670d9a0ddc624b338901 */

var SqlString  = exports;

var ID_GLOBAL_REGEXP    = /`/g;
var QUAL_GLOBAL_REGEXP  = /\./g;
var CHARS_GLOBAL_REGEXP = /[\0\b\t\n\r\x1a\"\'\\]/g; // eslint-disable-line no-control-regex
var CHARS_ESCAPE_MAP    = {
  '\0'   : '\\0',
  '\b'   : '\\b',
  '\t'   : '\\t',
  '\n'   : '\\n',
  '\r'   : '\\r',
  '\x1a' : '\\Z',
  '"'    : '\\"',
  '\''   : '\\\'',
  '\\'   : '\\\\'
};

SqlString.escapeId = function escapeId(val, forbidQualified) {
  if (Array.isArray(val)) {
    var sql = '';

    for (var i = 0; i < val.length; i++) {
      sql += (i === 0 ? '' : ', ') + SqlString.escapeId(val[i], forbidQualified);
    }

    return sql;
  } else if (forbidQualified) {
    return '`' + String(val).replace(ID_GLOBAL_REGEXP, '``') + '`';
  } else {
    return '`' + String(val).replace(ID_GLOBAL_REGEXP, '``').replace(QUAL_GLOBAL_REGEXP, '`.`') + '`';
  }
};

SqlString.escape = function escape(val, doubleQuotes, stringifyObjects, timeZone) {
  if (val === undefined || val === null) {
    return 'NULL';
  }

  switch (typeof val) {
    case 'boolean': return (val) ? 'true' : 'false';
    case 'number': return val + '';
    case 'object':
      if (val instanceof Date) {
        return SqlString.dateToString(val, doubleQuotes, timeZone || 'local');
      } else if (Array.isArray(val)) {
        return SqlString.arrayToList(val, doubleQuotes, timeZone);
      } else if (Buffer.isBuffer(val)) {
        return SqlString.bufferToString(val, doubleQuotes);
      } else if (typeof val.toSqlString === 'function') {
        return String(val.toSqlString());
      } else if (stringifyObjects) {
        return escapeString(val.toString(), doubleQuotes);
      } else {
        return SqlString.objectToValues(val, doubleQuotes, timeZone);
      }
    default: return escapeString(val, doubleQuotes);
  }
};

SqlString.arrayToList = function arrayToList(array, doubleQuotes, timeZone) {
  var sql = '';

  for (var i = 0; i < array.length; i++) {
    var val = array[i];

    if (Array.isArray(val)) {
      sql += (i === 0 ? '' : ', ') + '(' + SqlString.arrayToList(val, doubleQuotes, timeZone) + ')';
    } else {
      sql += (i === 0 ? '' : ', ') + SqlString.escape(val, doubleQuotes, true, timeZone);
    }
  }

  return sql;
};

SqlString.format = function format(sql, values, doubleQuotes, stringifyObjects, timeZone) {
  if (values == null) {
    return sql;
  }

  if (!(values instanceof Array || Array.isArray(values))) {
    values = [values];
  }

  var chunkIndex        = 0;
  var placeholdersRegex = /\?+/g;
  var result            = '';
  var valuesIndex       = 0;
  var match;

  while (valuesIndex < values.length && (match = placeholdersRegex.exec(sql))) {
    var len = match[0].length;

    if (len > 2) {
      continue;
    }

    var value = len === 2
      ? SqlString.escapeId(values[valuesIndex])
      : SqlString.escape(values[valuesIndex], doubleQuotes, stringifyObjects, timeZone);

    result += sql.slice(chunkIndex, match.index) + value;
    chunkIndex = placeholdersRegex.lastIndex;
    valuesIndex++;
  }

  if (chunkIndex === 0) {
    // Nothing was replaced
    return sql;
  }

  if (chunkIndex < sql.length) {
    return result + sql.slice(chunkIndex);
  }

  return result;
};

SqlString.dateToString = function dateToString(date, doubleQuotes, timeZone) {
  var dt = new Date(date);

  if (isNaN(dt.getTime())) {
    return 'NULL';
  }

  var year;
  var month;
  var day;
  var hour;
  var minute;
  var second;
  var millisecond;

  if (timeZone === 'local') {
    year        = dt.getFullYear();
    month       = dt.getMonth() + 1;
    day         = dt.getDate();
    hour        = dt.getHours();
    minute      = dt.getMinutes();
    second      = dt.getSeconds();
    millisecond = dt.getMilliseconds();
  } else {
    var tz = convertTimezone(timeZone);

    if (tz !== false && tz !== 0) {
      dt.setTime(dt.getTime() + (tz * 60000));
    }

    year       = dt.getUTCFullYear();
    month       = dt.getUTCMonth() + 1;
    day         = dt.getUTCDate();
    hour        = dt.getUTCHours();
    minute      = dt.getUTCMinutes();
    second      = dt.getUTCSeconds();
    millisecond = dt.getUTCMilliseconds();
  }

  // YYYY-MM-DD HH:mm:ss.mmm
  var str = zeroPad(year, 4) + '-' + zeroPad(month, 2) + '-' + zeroPad(day, 2) + ' ' +
    zeroPad(hour, 2) + ':' + zeroPad(minute, 2) + ':' + zeroPad(second, 2) + '.' +
    zeroPad(millisecond, 3);

  return escapeString(str, doubleQuotes);
};

SqlString.bufferToString = function bufferToString(buffer, doubleQuotes) {
  return 'X' + escapeString(buffer.toString('hex'), doubleQuotes);
};

SqlString.objectToValues = function objectToValues(object, doubleQuotes, timeZone) {
  var sql = '';

  for (var key in object) {
    var val = object[key];

    if (typeof val === 'function') {
      continue;
    }

    sql += (sql.length === 0 ? '' : ', ') + SqlString.escapeId(key) + ' = ' + SqlString.escape(val, doubleQuotes, true, timeZone);
  }

  return sql;
};

SqlString.raw = function raw(sql) {
  if (typeof sql !== 'string') {
    throw new TypeError('argument sql must be a string');
  }

  return {
    toSqlString: function toSqlString() { return sql; }
  };
};

function escapeString(val, doubleQuotes) {
  var chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex = 0;
  var escapedVal = '';
  var match;

  while ((match = CHARS_GLOBAL_REGEXP.exec(val))) {
    escapedVal += val.slice(chunkIndex, match.index) + CHARS_ESCAPE_MAP[match[0]];
    chunkIndex = CHARS_GLOBAL_REGEXP.lastIndex;
  }

  if (chunkIndex === 0) {
    // Nothing was escaped
    return quote(val, doubleQuotes)
  }

  if (chunkIndex < val.length) {
    return quote(escapedVal + val.slice(chunkIndex), doubleQuotes)
  }

  return quote(escapedVal, doubleQuotes)
}

function quote(val, doubleQuotes) {
    if (doubleQuotes) {
        return "\"" + val + "\"";
    }

    return "'" + val + "'";
}

function zeroPad(number, length) {
  number = number.toString();
  while (number.length < length) {
    number = '0' + number;
  }

  return number;
}

function convertTimezone(tz) {
  if (tz === 'Z') {
    return 0;
  }

  var m = tz.match(/([\+\-\s])(\d\d):?(\d\d)?/);
  if (m) {
    return (m[1] === '-' ? -1 : 1) * (parseInt(m[2], 10) + ((m[3] ? parseInt(m[3], 10) : 0) / 60)) * 60;
  }
  return false;
}
