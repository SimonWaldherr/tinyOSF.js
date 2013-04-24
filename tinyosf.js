/*
 * tinyOSF.js
 *
 * Copyright 2013, Simon Waldherr - http://simon.waldherr.eu/
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github:  https://github.com/shownotes/tinyOSF.js/
 * Version: 0.0.9
 */

/*jslint browser: true, white: true, indent: 2 */
/*exported osfParser, osfExport */

function osfExtractTags(tagString, urlString) {
  "use strict";
  var tagArray = [], tagTempArray = [], i, urlTemp, tagTemp;
  tagTempArray = tagString.split(' ');
  for (i = 0; i < tagTempArray.length; i += 1) {
    tagTemp = tagTempArray[i].replace('#', '').trim();
    if (tagTemp.length === 1) {
      if (tagTemp === 'c') {
        tagTemp = 'chapter';
      } else if (tagTemp === 't') {
        tagTemp = 'topic';
      } else if (tagTemp === 'g') {
        tagTemp = 'glossary';
      } else if (tagTemp === 'l') {
        tagTemp = 'link';
      } else if (tagTemp === 's') {
        tagTemp = 'section';
      } else if (tagTemp === 'v') {
        tagTemp = 'video';
      } else if (tagTemp === 'a') {
        tagTemp = 'audio';
      } else if (tagTemp === 'i') {
        tagTemp = 'image';
      } else if (tagTemp === 'q') {
        tagTemp = 'quote';
      }
    }
    if (tagTemp.length > 3) {
      tagArray[i] = tagTemp;
    }
  }
  if (urlString !== false) {
    urlTemp = urlString.split('/')[2];
    if (Array.isArray(urlTemp)) {
      urlTemp = urlTemp.split('.');
      tagArray[i + 1] = urlTemp[urlTemp.length - 2] + urlTemp[urlTemp.length - 1];
    }
  }
  return tagArray;
}

function osfBuildTags(tagArray, withClass) {
  "use strict";
  var i, output = '';
  for (i = 0; i < tagArray.length; i += 1) {
    if (typeof tagArray[i] === 'string') {
      if (tagArray[i].trim().length > 3) {
        output += ' osf_' + tagArray[i];
      }
    }
  }
  if (withClass === true) {
    return ' class="' + output + '"';
  }
  return output;
}

function osfTimestampsToHMS(now, starttimestamp) {
  "use strict";
  var time = parseInt(now, 10) - parseInt(starttimestamp, 10), hours, minutes, seconds, returntime = '';
  hours = Math.floor(time / 3600);
  minutes = Math.floor((time - (hours * 3600)) / 60);
  seconds = time - (hours * 3600) - (minutes * 60);
  returntime += (hours < 10) ? '0' + hours + ':' : hours + ':';
  returntime += (minutes < 10) ? '0' + minutes + ':' : minutes + ':';
  returntime += (seconds < 10) ? '0' + seconds : seconds;
  return returntime;
}

function osfHMSToTimestamp(hms) {
  "use strict";
  var time = 0, timeArray, regex = /((\d+\u003A)?(\d+\u003A)?(\d+)(\u002E\d+)?)/;
  if (hms === undefined) {
    return;
  }
  timeArray = regex.exec(hms.trim());
  if (timeArray !== null) {
    time += parseInt(timeArray[2], 10) * 3600;
    time += parseInt(timeArray[3], 10) * 60;
    time += parseInt(timeArray[4], 10);
  } else {
    return undefined;
  }
  return time;
}

function osfParser(string) {
  "use strict";
  var osfArray, i = 0, splitAt = false, output = [], 
  osfRegex = /(^([(\d{9,})(\u002D+)(\d+\u003A\d+\u003A\d+(\u002E\d*)?) ]*)?([\u0020-\u0022\u0024-\u003B\u003D\u003F-\u007D\u00C0-\u00FF„“@€!"§$%&\(\)=\?`´\+]+) *(\u003C[\S]*\u003E)?((\s*\u0023[\S]* ?)*)\n*)/gmi;
  //about this Regex:
  //^([(\d{9,})(\u002D+)(\d+\u003A\d+\u003A\d+(\u002E\d*)?) ]*)?                          => 1234567890 or - or 00:01:02[.000] or nothing at the beginning of the line
  //([\u0020-\u0022\u0024-\u003B\u003D\u003F-\u007D\u00C0-\u00FF„“@€!"§$%&\(\)=\?`´\+]+)  => a wide range of chars (excluding #,<,> and a few more) maybe this will change to ([^#<>]+) anytime
  //(\u003C[\S]*\u003E)?                                                                  => a string beginning with < and ending with > containing no whitespace or nothing
  //((\s*\u0023[\S]* ?)*)                                                                 => a string beginning with a whitespace, then a # and then some not whitespace chars or nothing
  if(string.indexOf('/HEADER') !== -1) {
    splitAt = '/HEADER';
  } else if(string.indexOf('/HEAD') !== -1) {
    splitAt = '/HEAD';
  }
  
  if(typeof splitAt === 'string') {
    string = string.split(splitAt,2)[1];
  } else {
    splitAt = string.split(/([(\d{9,})(\d+\u003A\d+\u003A\d+(\u002E\d*)?)]+\s\S)/i,2)[0];
    string = string.split(splitAt)[1];
  }
  
  while ((osfArray = osfRegex.exec(string)) !== null) {
    output[i] = osfArray;
    i += 1;
  }
  return output;
}

function osfExport_HTML(osfItem) {
  var line, parsed;
  if (typeof osfItem.timeSec === 'number') {
    if (osfItem.url !== false) {
      line = '<a data-tooltip="' + osfItem.timeSec + '" ' + osfBuildTags(osfItem.tags, true) + ' href="' + osfItem.url + '">' + osfItem.osfline[3].trim() + '</a>';
    } else {
      line = '<span data-tooltip="' + osfItem.timeSec + '" ' + osfBuildTags(osfItem.tags, true) + '>' + osfItem.osfline[3].trim() + '</span>';
    }
  } else {
    if (osfItem.url !== false) {
      line = '<a' + osfBuildTags(osfItem.tags, true) + ' href="' + osfItem.url + '">' + osfItem.osfline[3].trim() + '</a>';
    } else {
      line = '<span' + osfBuildTags(osfItem.tags, true) + '>' + osfItem.osfline[3].trim() + '</span>';
    }
  }
  if (osfItem.tags.indexOf('chapter') !== -1) {
    line = '<h2>' + line + ' <small>(' + osfItem.timeHMS + ')</small></h2>';
    parsed = line;
  } else {
    parsed = line + '; ';
  }
  return parsed;
}

function osfExport_HTMLlist(osfItem) {
  var line, parsed;
  if (typeof osfItem.timeSec === 'number') {
    if (osfItem.url !== false) {
      line = '<a data-tooltip="' + osfItem.timeSec + '" ' + osfBuildTags(osfItem.tags, true) + ' href="' + osfItem.url + '">' + osfItem.osfline[3].trim() + '</a>';
    } else {
      line = '<span data-tooltip="' + osfItem.timeSec + '" ' + osfBuildTags(osfItem.tags, true) + '>' + osfItem.osfline[3].trim() + '</span>';
    }
  } else {
    if (osfItem.url !== false) {
      line = '<a' + osfBuildTags(osfItem.tags, true) + ' href="' + osfItem.url + '">' + osfItem.osfline[3].trim() + '</a>';
    } else {
      line = '<span' + osfBuildTags(osfItem.tags, true) + '>' + osfItem.osfline[3].trim() + '</span>';
    }
  }
  if (osfItem.tags.indexOf('chapter') !== -1) {
    line = '<h2>' + line + ' <small>(' + osfItem.timeHMS + ')</small></h2>';
    parsed = line;
  } else {
    parsed = line + '; ';
  }
  return parsed;
}

function osfExport_Markdown(osfItem) {
  var line, parsed;
  if (osfItem.url !== false) {
    line = '[' + osfItem.osfline[3].trim() + '](' + osfItem.url + ')';
  } else {
    line = osfItem.osfline[3].trim();
  }
  if (osfItem.tags.indexOf('chapter') !== -1) {
    line = '\n#' + line + ' ^' + osfItem.timeHMS + '  \n';
    parsed = line;
  } else {
    parsed = line + '; ';
  }
  return parsed;
}

function osfExport_Chapter(osfItem) {
  if (osfItem.tags.indexOf('chapter') !== -1) {
    return osfItem.timeHMS + ' ' + osfItem.osfline[3].trim() + '\n';
  }
  return '';
}

function osfExport(osf, modefunction) {
  "use strict";
  var i, osfline, line, tags, url, osfFirstTS, osfFirstHMS, osfTime, timeSec, timeHMS, parsed = '';
  for (i = 0; i < osf.length; i += 1) {
    osfline = osf[i];
    osfTime = osfline[2];
    if (/(\d{9,})/.test(osfTime) !== false) {
      osfTime = parseInt(osfTime, 10);
      if (osfFirstTS === undefined) {
        osfFirstTS = osfTime;
      }
      timeHMS = osfTimestampsToHMS(osfTime, osfFirstTS);
      timeSec = osfTime - osfFirstTS;
    } else if (/(\d+:\d+:\d+(\.\d*)?)/.test(osfTime) !== null) {
      if (osfFirstHMS === undefined) {
        osfFirstHMS = osfTime;
      }
      timeHMS = osfTime;
      timeSec = osfHMSToTimestamp(osfTime);
    }
    if (typeof osfline[4] === 'string') {
      url = osfline[4].replace(/\u003C/, '').replace(/\u003E/, '');
    } else {
      url = false;
    }
    tags = osfExtractTags(osfline[5], url);
    if ((osfline !== undefined)&&(modefunction !== undefined)) {
      parsed += modefunction({"timeSec":timeSec,"timeHMS":timeHMS,"osfline":osfline,"url":url,"tags":tags});
    }
  }
  return parsed;
}
