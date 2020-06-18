import YAD from 'node-red-contrib-component-dashboard/src/lib.js';
import { LitElement, html, css } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map.js';

import 'node-red-contrib-component-dashboard/coreWidgets/yad-toggle-switch/yad-toggle.js';
import 'node-red-contrib-component-dashboard/coreWidgets/yad-ripple/yad-ripple.js';
import 'node-red-contrib-component-dashboard/coreWidgets/yad-slider/yad-slider.js';
import 'yad-icons-iconify/components/mdi/yad-icon-mdi-play.js';
import 'yad-icons-iconify/components/mdi/yad-icon-mdi-pause.js';
import 'yad-icons-iconify/components/mdi/yad-icon-mdi-dots-vertical.js';
import 'yad-icons-iconify/components/mdi/yad-icon-mdi-skip-previous.js';
import 'yad-icons-iconify/components/mdi/yad-icon-mdi-skip-next.js';
import 'yad-icons-iconify/components/mdi/yad-icon-mdi-arrow-left.js';
import 'yad-icons-iconify/components/mdi/yad-icon-mdi-playlist-play.js';
import 'yad-icons-iconify/components/mdi/yad-icon-mdi-database.js';
import 'yad-icons-iconify/components/mdi/yad-icon-mdi-delete.js';
import 'yad-icons-iconify/components/mdi/yad-icon-mdi-plus.js';
import 'yad-icons-iconify/components/mdi/yad-icon-mdi-shuffle-variant.js';
import 'yad-icons-iconify/components/mdi/yad-icon-mdi-play-box-multiple.js';
import 'yad-icons-iconify/components/mdi/yad-icon-mdi-home.js';

const hostStyle = css`
  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }
  .tab {
    flex-grow: 1;
    overflow-y: auto;
  }

  .item {
    position: relative;
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 48px;
    border-bottom: solid;
    border-bottom-color: #eee;
    border-bottom-width: 1px;
    border-left: solid;
    border-left-color: #eee;
    border-left-width: 1px;
  }
  .item:hover {
    background-color: rgb(238,238,245);
  }
  .item yad-ripple {
    --yad-ripple-color: rgb(200, 200, 255);
  }
  .itemAlbumIcon {
    width: 80px;
    height: 80px;
  }
  .itemText {
    flex-grow: 1;
    margin-left: 10px;
  }
  .itemArtistText {
    color: rgb(110,110,110);
    font-size: 14px;
    margin-top: 5px;
  }
  .itemControls {
    display: flex;
    align-items: center;
    margin-right: 4px;
  }
  .itemControls > * {
    margin: 0 4px;
  }

  @media (max-width: 70em) { 
    .item {
      font-size: 14px;
    }
    .itemAlbumIcon {
      width: 80px;
      height: 80px;
    }
    .itemArtistText {
      color: rgb(80,80,80);
      font-size: 12px;
    }
  }

  .browserMetadata {
    display: flex;
    background-color: var(--yad-secondary-color);
    color: white;
    color: white;
    min-height: 34px;
    align-items: center;
  }
  .browserMetadataName {
    margin-left: 10px;
    flex-grow: 1;
    font-weight: bold;
  }
  .browserMetadataControls {
    width: auto;
    margin-right: 8px;
  }

  #scrollObserverAnchor {
    position: relative;
    top: -480px;
    height:0;
    width:0;
    z-index:-1;
  }
  #scrollObserverEnd {
    display: none;
    margin: 20px auto;
    width: 30px;
    height: 30px;
  }
  #scrollObserverEnd:after {
    content: " ";
    display: block;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 3px solid #fff;
    border-color: var(--yad-primary-color) transparent var(--yad-secondary-color) transparent;
    animation: scrollObserverEnd 1.2s linear infinite;
  }
  @keyframes scrollObserverEnd {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .playlistContainer {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .playlistItemsContainer {
    overflow-y: auto;
  }

  .currentPlaying {
    display: flex;
    background-color: var(--yad-secondary-color);
    align-items: stretch;
    min-height: 60px;
    flex-shrink: 0;
  }
  .currentPlayingTextContainer {
    flex-grow: 1;
    margin: 10px 0;
    margin-right: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .currentPlayingMetaContainer {

  }
  .currentPlayingTimeContainer {
    display: flex;
    align-items: center;
  }
  .currentPlayingTimeText {
    flex-shrink: 0;
  }
  .currentPlayingTimeSlider {
    margin: 0 10px;
    --yad-primary-color: white;
  }

  .currentPlayingItemClass {
    background-color: var(--yad-secondary-color-light);
  }

`;

const footerStyle = css`
  #footer {
    flex-shrink: 0;
    width: 100%;
    background-color: var(--yad-primary-color);
    color: white;
    display: flex;
    height: 40px;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
  }
  .playControls {
    display: flex;
    height: 100%;
    color:white;
    /*background-color: yellow;*/
    justify-content: space-between;
    align-items: center; 
  }
  .playControls yad-toggle {
    margin: 0 10px;
  }
  .tabControls {
    display: flex;
    height: 100%;
    color: white;
    /*background-color: green;*/
    justify-content: space-between;
    align-items: center; 
  }
  .tabControls yad-toggle {
    width: auto;
    margin: 0 10px;
  }

  .right {
    display: flex;
    height: 100%;
    color: white;
    justify-content: space-between;
    align-items: center; 
  }
  .right yad-toggle {
    width: auto;
    margin: 0 10px;
    color: white;
  }

`;

class Component extends LitElement {

  browserMetadataTemplate() {
    return html`
      <div class="browserMetadata">
        <div class="browserMetadataName">
          ${this.browserMetadata ? this.browserMetadata.name : ''}
        </div>
        <yad-toggle class="browserMetadataControls" @element-event="${this.backButton}" no-msg>
          <yad-icon-mdi-arrow-left></yad-icon-arrow-left>
        </yad-toggle>
        <yad-toggle class="browserMetadataControls" @element-event="${this.browserHomeButton}" no-msg>
          <yad-icon-mdi-home></yad-icon-home>
        </yad-toggle>
        ${this.browserMetadata && (this.browserMetadata.type === 'album' || this.browserMetadata.type === 'container') ? html`
          <yad-toggle class="browserMetadataControls" @click="${function(e) {this.itemControlsClick(e, this.browserMetadata, 'bPlus');}}" no-msg>
            <yad-icon-mdi-plus></yad-icon-mdi-plus>  
          </yad-toggle>` : ''
        }
      </div>
    `;
  }

  browserItemControlsTemplate(item) {
    return html`
      ${item.type === 'item' ? html`
        <yad-toggle @click="${function(e) {this.itemControlsClick(e, item, 'bPlay');}}" no-msg>
          <yad-icon-mdi-play></yad-icon-mdi-play>  
        </yad-toggle>` : ''
      }
      ${item.type === 'album' || item.type === 'container' ? html`
        <yad-toggle @click="${function(e) {this.itemControlsClick(e, item, 'bPlus');}}" no-msg>
          <yad-icon-mdi-plus></yad-icon-mdi-plus>  
        </yad-toggle>` : ''
      }
      <yad-toggle @click="${function(e) {this.itemControlsClick(e, item, 'bMenu');}}" no-msg>
        <yad-icon-mdi-dots-vertical></yad-icon-mdi-dots-vertical>  
      </yad-toggle>
    `;
  }

  playlistItemControlsTemplate(item) {
    return html`
      <yad-toggle @click="${function(e) {this.itemControlsClick(e, item, 'pPlayNext');}}" no-msg>
        <yad-icon-mdi-play-box-multiple></yad-icon-mdi-play-box-multiple>  
      </yad-toggle>
      <yad-toggle @click="${function(e) {this.itemControlsClick(e, item, 'pDelete');}}" no-msg>
        <yad-icon-mdi-delete style="--yad-icon-size: 22px;"></yad-icon-mdi-delete>  
      </yad-toggle>
      <yad-toggle @click="${function(e) {this.itemControlsClick(e, item, 'pMenu');}}" no-msg>
        <yad-icon-mdi-dots-vertical></yad-icon-mdi-dots-vertical>  
      </yad-toggle>
    `;
  }

  itemsTemplate(list, type) {
    var itemTemplates = [];
    for(const item of list) {
      let classes = {item: true};
      if(type === 'playlist') classes['currentPlayingItemClass'] = (item.index === this.currentPlaylistIndex);
      itemTemplates.push(html`
        <div class="${classMap(classes)}" @click="${function(e) {this.itemClick(e, item, type);}}">
          <yad-ripple></yad-ripple>
          ${item.albumArtURI ? html`<img src="${item.albumArtURI}" class="itemAlbumIcon">`  : ''}
          <div class="itemText">
            <div>${item.name}</div>
            ${item.artist ? html`<div class="itemArtistText">${item.artist}</div>` : ''}
            ${item.album ? html`<div class="itemArtistText">${item.album}</div>` : ''}
          </div>
          <div class="itemControls">
            ${type === 'browser' ? this.browserItemControlsTemplate(item) : ''}
            ${type === 'playlist' ? this.playlistItemControlsTemplate(item) : ''}
          </div>
        </div>
      `);
    }
    return html`${itemTemplates}`;
  }

  currentPlayingTemplate() {
    return html`
      <div class="currentPlaying">
        ${this.currentPlayingItem.albumArtURI ? html`
          <img width="120" style="margin: 10px;" src=${this.currentPlayingItem.albumArtURI}>` : ''
        }
        <div class="currentPlayingTextContainer">
          <div class="currentPlayingMetaContainer">
            <div>${this.currentPlayingItem.name}</div>
            <div>${this.currentPlayingItem.artist}</div>
            <div>${this.currentPlayingItem.album}</div>
          </div>
          ${this.currentPlayingItem.relTime && this.currentPlayingItem.duration ? html`
            <div class="currentPlayingTimeContainer">
              <div class="currentPlayingTimeText">
                ${this.currentPlayingItem.relTime}
              </div>
              <yad-slider value="${this.currentPlayingItem.relTime}"
                          min="0"
                          max="${this.currentPlayingItem.duration}"
                          step="1"
                          no-msg
                          no-cont
                          @element-event="${this.seek}"
                          class="currentPlayingTimeSlider"></yad-slider>
              <div class="currentPlayingTimeText">
                ${this.currentPlayingItem.duration}
              </div>
            </div>` : ''
          }
        </div>
      </div>
    `;
  }

  get footerTemplate() {
    return html`
      <div class="playControls">
        <yad-toggle @element-event="${function(e){this.footerControlsClick(e, 'previous');}}" no-msg>
          <yad-icon-mdi-skip-previous></yad-icon-mdi-skip-previous>
        </yad-toggle>
        <yad-toggle @element-event="${function(e){this.footerControlsClick(e, 'play');}}" ?checked="${this.statusPlay}" no-msg>
          <yad-icon-mdi-pause></yad-icon-mdi-pause>  
          <yad-icon-mdi-play slot="on" style="color: orange;"></yad-icon-mdi-play>
        </yad-toggle>
        <yad-toggle @element-event="${function(e){this.footerControlsClick(e, 'next');}}" no-msg>
          <yad-icon-mdi-skip-next></yad-icon-mdi-skip-next>  
        </yad-toggle>
        <yad-toggle @element-event="${function(e){this.footerControlsClick(e, 'random');}}" ?checked="${this.statusRandom}" no-msg>
          <yad-icon-mdi-shuffle-variant></yad-icon-mdi-shuffle-variant>
          <yad-icon-mdi-shuffle-variant slot="on" style="color: orange;"></yad-icon-mdi-shuffle-variant>
        </yad-toggle>
      </div>
      <div class="tabControls">
        <yad-toggle @element-event="${function(){this.tabChange('playlist');}}" ?checked="${this.tab == 'playlist'}" no-msg>
          <yad-icon-mdi-playlist-play></yad-icon-mdi-playlist-play>
          <yad-icon-mdi-playlist-play slot="on" style="color: orange;"></yad-icon-mdi-playlist-play>
        </yad-toggle>
        <yad-toggle @element-event="${function(){this.tabChange('browser');}}" ?checked="${this.tab == 'browser'}" no-msg>
          <yad-icon-mdi-database></yad-icon-mdi-database>
          <yad-icon-mdi-database slot="on" style="color: orange;"></yad-icon-mdi-database>  
        </yad-toggle>
      </div>
      <div class="right">
        <yad-toggle @element-event="${function(e){this.footerControlsClick(e, 'clearPlaylist');}}" no-msg>
          <yad-icon-mdi-delete></yad-icon-delete>
        </yad-toggle>
        <yad-toggle @element-event="${this.backButton}" no-msg>
          <yad-icon-mdi-arrow-left></yad-icon-arrow-left>
        </yad-toggle>
      </div>
    `;
  }

  static get styles() {
    return [hostStyle, footerStyle];
  }

  render() {
    return html`
      <div id="browser" class="tab" ?hidden="${this.tab != 'browser'}">
        ${this.browserMetadataTemplate()}
        ${this.itemsTemplate(this.browserData, 'browser')}
        <div id="scrollObserverAnchor"></div>
        <div id="scrollObserverEnd"></div>
      </div>
      <div id="playlist" class="tab" ?hidden="${this.tab != 'playlist'}">
        <div class="playlistContainer">
          ${this.currentPlayingItem ? this.currentPlayingTemplate() : ''}
          <div class="playlistItemsContainer">
            ${this.itemsTemplate(this.playlistData, 'playlist')}
          </div>
        </div>
      </div>
      <div id="footer">
        ${this.footerTemplate}
      </div> 
    `;
  }

  static get properties() {
    return {
      tab: {type: String},
      statusPlay: {type: Boolean},
      statusRandom: {type: Boolean},
      browserMetadata: {type: Object},
      browserData: {type: Array},
      playlistData: {type: Array},
      currentPlayingItem: {type: Object},
      currentPlaylistIndex: {type: Number}
    };
  }

  constructor() {
    super();
    YAD.initYadElement(this);
    this.initTab = 'browser'
    this.tab = this.initTab;
    this.statusPlay = false;
    this.statusRandom = false;
    this.browserMetadata = null;
    this.browserData = [];
    this.initObjectID = '8';
    this.popStateListener = this.popStateCallback.bind(this);
    this.browserNotAllLoaded = false;
    this.playlistData = [];
    this.currentPlayingItem = null;
    this.currentPlaylistIndex = -1;
  }

  connectedCallback() {
    super.connectedCallback();
    this._connectedCallbackHelper();
    window.addEventListener('popstate', this.popStateListener);

    var scrollObserverOptions = {
      root: this.shadowRoot.getElementById('browser'),
      rootMargin: '0px',
      threshold: 0
    }
    this.scrollObserver = new IntersectionObserver(this.scrollObserverCallback.bind(this), scrollObserverOptions);
    
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('popstate', this.popStateListener);
  }

  firstUpdated() {
    this.browseContainer(this.initObjectID);
  }

  tabChange(tab) {
    this.tab = tab;
    this.addToHistory('tab', tab);
  }

  addToHistory(action, data) {
    var state = { elementID: this.elementId, data: {} };
    if(action === 'browse') {
      state.data.browseObjectID = data;
      state.data.tab = this.tab;
    } else if(action === 'tab') {
      state.data.tab = data;
    }
    window.history.pushState(state, '');
  }

  popStateCallback(e) {
    if(e.state === null) {
      this.browseContainer(this.initObjectID);
      this.tab = this.initTab;
    } else {
      if(e.state.elementID === this.elementId) {
        if(e.state.data.tab !== this.tab) {
          this.tab = e.state.data.tab;
        }
        if(e.state.data.hasOwnProperty('browseObjectID')) {
          this.browseContainer(e.state.data.browseObjectID);
        }
      }
    } 
  }

  backButton() {
    // window.history.back();
    if(this.browserMetadata.parentID !== "-1") {
      this.browseContainer(this.browserMetadata.parentID);
    }
  }

  browserHomeButton() {
    this.browseContainer(this.initObjectID);
  }

  scrollObserverCallback(entries, observer) {
    if(this.browserNotAllLoaded) {
      if(entries[0].isIntersecting) {
        observer.unobserve(entries[0].target);
        this.browseContainer(this.browserMetadata.objectID, this.browserData.length);
      }
    }
  }

  itemClick(e, item, type) {
    e.stopPropagation();
    e.currentTarget.querySelector('yad-ripple').ripple(e);
    if(type === 'browser') {
      if(item.type === 'container' || item.type === 'album') {
        this.browseContainer(item.objectID);
        this.addToHistory('browse', item.objectID);
      } else if(item.type === 'item') {
        let msg = {payload: 'browserItemClick', objectID: item.objectID};
        this._sendToNR(msg);
      }
    } else if(type === 'playlist') {
      let msg = {payload: 'playlistItemClick', itemIndex: item.index};
      console.log(msg);
      this._sendToNR(msg);
    }
  }

  itemControlsClick(e, item, type) {
    e.stopPropagation();
    if(type === 'pDelete') { 
      let msg = {payload: 'playlistItemRemove', itemIndex: item.index};
      this._sendToNR(msg);
    } else if(type === 'bPlus') {
      let msg = {payload: 'enqueContainer', objectID: item.objectID, type: item.type};
      this._sendToNR(msg);
    }
  }

  browseContainer(objectID, startIndex = 0) {
    this.shadowRoot.getElementById('scrollObserverEnd').style.display = 'block';
    var params = {action: 'browseContainer', objectID: objectID, startIndex: startIndex};
    YAD.ajaxCall(this, params, function(res) {
      if(res.payload === 'browseContainer') {
        if(startIndex === 0) {
          
          // this.browserData = [];
          // this.performUpdate();
          // this.requestUpdate();
          // console.log(res.metadata);
          this.browserMetadata = res.metadata;
          this.browserData = res.data;
        } else {
          this.browserData.push(...res.data);
          this.requestUpdate();
        }
        this.browserNotAllLoaded = this.checkIfNotAllBrowserItemsLoaded(res);
        if(this.browserNotAllLoaded) {
          this.scrollObserver.observe(this.shadowRoot.getElementById('scrollObserverAnchor'));
        } else {
          this.shadowRoot.getElementById('scrollObserverEnd').style.display = 'none';
        }
      }   
    }.bind(this));
  }

  checkIfNotAllBrowserItemsLoaded(res) {
    var totalMatches = Number(res.totalMatches);
    var numberReturned = Number(res.numberReturned);
    return ( (totalMatches > this.browserData.length) || (totalMatches === 0 && numberReturned > 0) );
  }

  footerControlsClick(e, cmd) {
    if(cmd === 'play') {
      if(e.detail.payload) {
        this._sendToNR({payload: 'play'});
      } else {
        this._sendToNR({payload: 'pause'});
      }
    } else if(cmd === 'next') {
      this._sendToNR({payload: 'next'});
    } else if(cmd === 'previous') {
      this._sendToNR({payload: 'previous'});
    } else if(cmd === 'random') {
      this._sendToNR({payload: 'random', random: e.detail.payload});    
    } else if(cmd === 'clearPlaylist') {
      this._sendToNR({payload: 'clearPlaylist'});
    }
  }

  seek(e) {
    this._sendToNR({payload: 'seek', pos: e.detail.payload});
  }

  nodeRedMsg(msg) {
    if(msg.payload === 'playlistUpdate') {
      this.playlistData = msg.playlistData;
    } else if(msg.payload === 'currentPlayingItem') {
      this.currentPlayingItem = msg.item;
      if(this.currentPlayingItem.state === 'PLAYING') {
        this.statusPlay = true;
      } else {
        this.statusPlay = false;
      }
      console.log(msg.item);
    } else if(msg.payload === 'currentPlaylistIndex') {
      this.currentPlaylistIndex = msg.index;
    } else if(msg.payload === 'random') {
      this.statusRandom = msg.random;
    }
  }

}

window.customElements.define('yad-music-browser', Component);
