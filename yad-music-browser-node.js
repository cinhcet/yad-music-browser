module.exports = function(RED) {
  "use strict";

  var UPnPLib = require('node-red-contrib-upnp');

  var excludeContainerList = ['All Songs', 'All - full name'];

  function yadNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    node.config = config;
    node.yad = RED.nodes.getNode(node.config.yad);
    node.yad.initElementNode(node);

    node.upnpConfiguration = RED.nodes.getNode(config.upnpConfiguration);

    node.mediaBrowser = new UPnPLib.MediaBrowser(node.upnpConfiguration);

    node.playlistData = [];
    node.currentPlayingItem = {};
    node.currentPlaylistIndex = -1;
    node.transportState = 'stop';
    node.oldDuration = Number.MAX_SAFE_INTEGER;
    node.oldTime = 0;
    node.timeBased = false;
    node.allowNext = false;

    node.random = false;
    node.randomPermutationPlaylistList = [];

    node.on('input', function(m) {
      if(m.payload === 'currentPlayingItem') {
        if(m.item) {
          node.currentPlayingItem = m.item;
          if(node.currentPlayingItem.file && node.currentPlaylistIndex !== -1) {
            let currentPlayingItemFromPlaylist = node.playlistData[node.currentPlaylistIndex];
            if(node.currentPlayingItem.file === currentPlayingItemFromPlaylist.file) {
              if(currentPlayingItemFromPlaylist['albumArtURI']) node.currentPlayingItem['albumArtURI'] = currentPlayingItemFromPlaylist['albumArtURI'];
            }
          }
          node.yad.sendMessage(node, {payload: 'currentPlayingItem', item: node.currentPlayingItem}, 'currentPlayingItem');
          node.yad.sendMessage(node, {payload: 'currentPlaylistIndex', index: node.currentPlaylistIndex}, 'currentPlaylistIndex');
          node.handlePlayingItem(node.currentPlayingItem);
        } else {
          node.warn('no current playing item in message found!');
        }
      }
      //node.yad.sendMessage(node, m);
    });

    node.on('close', function() {
      node.yad.closeElementNode(node);
    });
  }

  yadNode.prototype.handlePlayingItem = function(item) {
    // TODO rewrite everything to use events!
    var node = this;

    if(item.state === 'STOPPED') {
      if(node.allowNext && node.transportState === 'play') {
        node.allowNext = false;
        if((node.timeBased && (node.oldTime >= node.oldDuration - 3 && node.oldTime <= node.oldDuration)) || !node.timeBased) {
          if(node.playlistData.length) {
            if(node.random) {
              node.currentPlaylistIndex = node.getNextRandomPlaylistIndex();
              node.playCurrentIndex();
            } else {
              node.currentPlaylistIndex++;
              if(node.currentPlaylistIndex >= node.playlistData.length) {
                node.transportState = 'stop';
                node.currentPlaylistIndex = 0;
              } else {
                node.playCurrentIndex();
              }
            }
          } else {
            node.transportState = 'stop';
          }
        }
      }
    } else if(item.state === 'PLAYING') {
      // TODO
      node.allowNext = true;
      if(item.hasOwnProperty('duration')) {
        node.oldDuration = item.duration;
        node.timeBased = true;
      } else {
        node.timeBased = false;
      }
      if(item.hasOwnProperty('absTime')) {
        if(item.absTime != 0) {
          node.oldTime = item.absTime;
        }
        node.timeBased = true;
      } else {
        node.timeBased = false;
        node.oldTime = 0;
      }
    } else if(item.state === 'PAUSED_PLAYBACK') {
      // TODO
    }
  }

  yadNode.prototype.recMessage = function(m) {
    var node = this;
    if(m.payload === 'browserItemClick') {
      node.appendToPlaylist(m.objectID);
    } else if(m.payload === 'playlistItemClick') {
      console.log(m);
      if(0 <= m.itemIndex && m.itemIndex < node.playlistData.length) {
        console.log(m);
        node.currentPlaylistIndex = m.itemIndex;
        node.playCurrentIndex();
      }
    } else if(m.payload === 'enqueContainer') {
      node.enqueContainer(m.objectID, m.type, false, false);
    } else if(m.payload === 'enqueContainerCurrent') {
      node.enqueContainer(m.objectID, m.type, true, false);
    } else if(m.payload === 'enqueContainerCurrentPlay') {
      node.enqueContainer(m.objectID, m.type, true, true);
    } else if(m.payload === 'playItem') {
      node.appendToPlaylist(m.objectID, true, false, function() {
        node.currentPlaylistIndex++;
        node.playCurrentIndex();
      });
    } else if(m.payload === 'enqueItemCurrent') {
      node.appendToPlaylist(m.objectID, true);
    } else if(m.payload === 'play') {
      if(node.playlistData.length) {
        if(node.currentPlaylistIndex === -1) {
          node.currentPlaylistIndex = 0;
          node.transportState = 'stop';
          node.playCurrentIndex();
        } else {
          if(node.transportState === 'pause') {
            node.play();
          } else if(node.transportState === 'stop') {
            node.playCurrentIndex();
          } else if(node.transportState === 'play') {
            // TODO what if transportState === play? handle that!!
            // Solution: then ask for the current real state and handle accordingly
            // simpler, just send a play!
            node.play();
          }
        }
        //node.transportState = 'play'; // TODO sync transportState with real transportState, or check regularily if it is not consistent, maybe that is the best way.
      }
    } else if(m.payload === 'pause') {
      node.transportState = 'pause';
      node.send({payload: 'pause'});
    } else if(m.payload === 'next') {
      if(node.random) {
        var pInd = node.getNextRandomPlaylistIndex();
        if(pInd !== -1) {
          node.currentPlaylistIndex = pInd;
          node.playCurrentIndex();
        }
      } else if(node.playlistData.length) {
        node.currentPlaylistIndex++;
        if(node.currentPlaylistIndex >= node.playlistData.length) {
          node.currentPlaylistIndex = 0;
        }
        node.playCurrentIndex();
      }
    } else if(m.payload === 'previous') {
      if(node.playlistData.length) {
        node.currentPlaylistIndex--;
        if(node.currentPlaylistIndex < 0) {
          node.currentPlaylistIndex = 0;
        }
        node.playCurrentIndex();
      }
    } else if(m.payload === 'clearPlaylist') {
      node.playlistData.length = 0;
      node.currentPlaylistIndex = -1;
      node.updatePlaylist();
    } else if(m.payload === 'random') {
      node.random = m.random;
      if(node.random) {
        node.randomPermutationPlaylistList.length = 0;
        for(var i = 0; i < node.playlistData.length; i++) {
          node.randomPermutationPlaylistList.push(i);
        }
        shuffle(node.randomPermutationPlaylistList);
      }
      node.yad.sendMessage(node, {payload: 'random', random: node.random}, 'random');
    } else if(m.payload === 'playlistItemRemove') {
      node.removePlaylistItem(m.itemIndex);
    } else if(m.payload === 'playlistItemDown') {
      node.movePlaylistItem(m.itemIndex + 1, m.itemIndex);
    } else if(m.payload === 'playlistItemUp') {
      node.movePlaylistItem(m.itemIndex - 1, m.itemIndex);
    } else {
      node.send(m);
    }
  }

  yadNode.prototype.enqueContainer = function(objectID, type, afterCurrent, play) {
    var node = this;
    node.mediaBrowser.browseAllChildren(objectID, true, excludeContainerList, function(err, result) {
      if(err) {
        node.warn(err);
      } else {
        var isAlbum = false;
        if(type === 'album') {
          isAlbum = true;
        }
        node.appendToPlaylist(result, afterCurrent, isAlbum, function() {
          if(play) {
            node.currentPlaylistIndex++;
            node.playCurrentIndex();
          }
        });
      }
    });
  }

  yadNode.prototype.removePlaylistItem = function(index) {
    var node = this;
    node.playlistData.splice(index, 1);
    if(node.currentPlaylistIndex === index) {
      node.currentPlaylistIndex = -1;
    } else if(node.currentPlaylistIndex > index) {
      node.currentPlaylistIndex--;
    }
    node.updatePlaylist();
  }

  yadNode.prototype.movePlaylistItem = function(newIndex, currentIndex) {
    var node = this;
    if(newIndex >= 0 && newIndex < node.playlistData.length) {
      var temp = node.playlistData[newIndex];
      node.playlistData[newIndex] = node.playlistData[currentIndex];
      node.playlistData[currentIndex] = temp;
      // the item that should be moved is the current index, move it along
      if(node.currentPlaylistIndex === currentIndex) {
        node.currentPlaylistIndex = newIndex;
      } else if(node.currentPlaylistIndex === newIndex) { // the target index is the current index, change
        node.currentPlaylistIndex = currentIndex;
      }
      node.updatePlaylist();
    }
  }

  // < >

  yadNode.prototype.getNextRandomPlaylistIndex = function() {
    if(this.randomPermutationPlaylistList.length === 0) {
      return -1;
    } else {
      return this.randomPermutationPlaylistList.pop();
    }
  }

  yadNode.prototype.play = function() {
    var node = this;
    node.transportState = 'play';
    node.send({payload: 'play'});
  }

  yadNode.prototype.playCurrentIndex = function() {
    if(this.currentPlaylistIndex === -1) return;
    var node = this;
    // TODO add checks?!?
    node.transportState = 'play';
    var playItem = node.playlistData[node.currentPlaylistIndex];
    node.send({payload: 'play', uri: playItem.file, rawDIDL: playItem.rawXML});
    // node.yad.sendMessage(node, {payload: 'currentPlaylistIndex', index: node.currentPlaylistIndex}, 'currentPlaylistIndex');
  }

  yadNode.prototype.appendToPlaylist = function(objectID, afterCurrent, isAlbum, callback) {
    var node = this;

    function browseHelper(id) {
      return new Promise(function(resolve, reject) {
        node.mediaBrowser.browseContent(id, 'metadata', true, null, function(err, result) {
          if(err) {
            node.warn(err);
            reject(err);
          } else {
            let itemList = [];
            if(result.obj && result.obj.item && result.obj.item.length) {
              var item = result.obj.item[0];
              var temp = UPnPLib.convertInnerDIDL(item);
              temp.rawXML = result.rawXML;
              itemList.push(temp);
            } else {
              node.warn('Error with add to playlist object ID ' + id);
            }
            resolve(itemList);
          }
        });
      });
    }

    if(node.upnpConfiguration.deviceFound) {
      if(!Array.isArray(objectID)) {
        objectID = [objectID];
      }

      Promise.all(objectID.map(function(id) {
        return browseHelper(id);
      }))
      .then(function(allLists) {
        let itemList = [];
        allLists.forEach(function(t) {
          itemList.push(...t);
        });
        if(isAlbum) {
          itemList.sort(function(a, b) {
            return a.trackNumber - b.trackNumber;
          });
        }
        if(node.random) {
          for(var i = node.playlistData.length; i < node.playlistData.length + itemList.length; i++) {
            node.randomPermutationPlaylistList.push(i);
          }
          shuffle(node.randomPermutationPlaylistList);
        }
        if(afterCurrent) {
          var index = 0;
          if(node.currentPlaylistIndex >= 0) {
            index = node.currentPlaylistIndex + 1;
          }
          node.playlistData.splice(index, 0, ...itemList);
        } else {
          node.playlistData = node.playlistData.concat(itemList);
        }
        node.updatePlaylist();
        if(callback) {
          callback();
        }
      });
    }
  }

  yadNode.prototype.updatePlaylist = function() {
    var node = this;
    node.playlistData.map(function(item, index) {
      item.index = index;
    });
    node.yad.sendMessage(node, {payload: 'playlistUpdate', playlistData: node.playlistData}, 'playlistUpdate');
    node.yad.sendMessage(node, {payload: 'currentPlaylistIndex', index: node.currentPlaylistIndex}, 'currentPlaylistIndex');
  }

  yadNode.prototype.recAjax = function(params, mId) {
    var node = this;
    if(node.upnpConfiguration.deviceFound) {
      if(params.action === 'browseContainer') {
        var objectID = params.objectID;
        var startIndex = params.hasOwnProperty('startIndex') ? params.startIndex : 0;
        var requestedCount = 20;
        node.mediaBrowser.browseObjectID(objectID, startIndex, requestedCount, function(err, result) {
          if(err) {
            node.warn(err);
            node.yad.ajaxResponse(mId, node, {payload: 'upnpError'});
          } else {
            var sendObj = {};
            sendObj.payload = 'browseContainer';
            
            // TODO remove redundant code with didl helper functions!
            var metadata = result.metadata;
            if(metadata.container) {
              metadata = metadata.container[0];
              var id = metadata['$']['id'];
              var parentID = metadata['$']['parentID'];
              var name = metadata['dc:title'][0];
              var childCount = metadata['$']['childCount'];
              sendObj.metadata = {objectID: id, parentID: parentID, name: name, childCount: childCount};

              sendObj.metadata.type = 'container';

              if(metadata['upnp:class']) {
                if(metadata['upnp:class'][0].includes('object.container.album')) {
                  sendObj.metadata.type = 'album';
                  if(metadata['upnp:artist']) {
                    sendObj.metadata.artist = metadata['dc:artist'][0];
                  } else if(metadata['dc:creator']) {
                    sendObj.metadata.artist = metadata['dc:creator'][0];
                  }
                  if(metadata['upnp:albumArtURI']) {
                    var albumTmp =  metadata['upnp:albumArtURI'][0];
                    if(albumTmp['_']) {
                      sendObj.metadata.albumArtURI = albumTmp['_'];
                    } else {
                      sendObj.metadata.albumArtURI = albumTmp;
                    }
                    // sendObj.metadata.albumArtURI = metadata['upnp:albumArtURI'][0]['_'];
                  }
                }
              }
            }

            if(result.children) {
              sendObj.totalMatches = result.children.totalMatches;
              sendObj.numberReturned = result.children.numberReturned;
              sendObj.data = [];
              if(result.children.container) {
                var containers = result.children.container;
                containers.forEach(function(container) {
                  var temp = {};
                  temp.objectID = container['$']['id'];
                  temp.parentID = container['$']['parentID'];
                  temp.name = container['dc:title'][0];
                  temp.childCount = container['$']['childCount'];
                  temp.type = 'container';

                  if(container['upnp:class']) {
                    var mClass = container['upnp:class'][0];
                    if(mClass.includes('object.container.album')) {
                      temp.type = 'album';
                      if(container['upnp:artist']) {
                        temp.artist = container['upnp:artist'][0];
                      } else if(container['dc:creator']) {
                        temp.artist = container['dc:creator'][0];
                      }
                      if(container['upnp:albumArtURI']) {
                        var albumTmp =  container['upnp:albumArtURI'][0];
                        if(albumTmp['_']) {
                          temp.albumArtURI = albumTmp['_'];
                        } else {
                          temp.albumArtURI = albumTmp;
                        }
                        // temp.albumArtURI = container['upnp:albumArtURI'][0]['_'];
                      }
                    }
                  }

                  sendObj.data.push(temp);
                });
              }
              if(result.children.item) {
                var items = result.children.item;
                items.forEach(function(item) {
                  var temp = UPnPLib.convertInnerDIDL(item);
                  temp.type = 'item';
                  // temp.objectID = item['$']['id'];
                  // temp.parentID = item['$']['parentID'];
                  // temp.name = item['dc:title'][0];
                  sendObj.data.push(temp);
                });
              }
            }
            node.yad.ajaxResponse(mId, node, sendObj);
          }
        });
      }
    } else {
      node.yad.ajaxResponse(mId, node, {payload: 'upnpOffline'});
    }
  }

  RED.nodes.registerType("yad-music-browser", yadNode);
}


function shuffle(a) {
  var j, x, i;
  for(i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
}