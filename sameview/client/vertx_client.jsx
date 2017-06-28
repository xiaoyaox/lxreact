import request from 'superagent';
import EventBus from 'vertx3-eventbus-client';

import Client from './client.jsx';

class VertxClient {
  constructor() {
    // this.connectionUrl = 'http://192.168.9.39:10080/vertx_eventbus/';
    //this.connectionUrl = 'http://matt.siteview.com:10080/vertx_eventbus/';
    //this.connectionUrl = window.serverUrl+':'+window.serverPort+'/vertx_eventbus/';
    this.connectionUrl =((window.serverUrl).indexOf(window.serverPort)!=-1)?(window.serverUrl+'/vertx_eventbus/'):
    (window.serverUrl+':'+window.serverPort+'/vertx_eventbus/');
    //  this.connectionUrl = 'http://matt.siteview.com:10080/vertx_eventbus/';
    //this.connectionUrl = 'http://www.sameview.com:8068/vertx_eventbus/';
    //this.connectionUrl = 'http://123.207.93.70:8068/vertx_eventbus/';
    //http://matt.siteview.com/vertx_eventbus , http://220.168.30.10:10080/vertx_eventbus/
    //this.connectionUrl = 'http://123.207.93.70:8068/vertx_eventbus/'; , http://220.168.30.10:10080/vertx_eventbus/
    this.eventBus = null;
    this.isConnected = false;
    this.reconnectIntervalSeconds = 1;
    this.connectFailCount = 0;
    this.teams = null;
    this.channels = null;
    this.userId = null;
    this.registerHandlers = [];
    this.eventCallback = null;
  }

  initialize(connectionUrl = this.connectionUrl, token) {
    // console.log('connecting vertx ----');
    if (this.eventBus) {
        return;
    }

    if (connectionUrl == null) {
        console.log('vertx must have connection url'); //eslint-disable-line no-console
        return;
    }

    if (this.connectFailCount === 0) {
        console.log('vertx connecting to ' + connectionUrl); //eslint-disable-line no-console
    }

    const options = {
    }
    // this.eventBus = new vertx.EventBus(this.url, options);
    this.eventBus = new EventBus(connectionUrl, options);
    const _self = this;
    this.eventBus.onopen = function() {
        console.log('Connection is open.');
        _self.isConnected = true;

        // console.log(_self.registerHandlers);
        if (_self.registerHandlers && _self.registerHandlers.length) {
            _self.registerHandlers.forEach(function(reg) {
                _self.eventBus.registerHandler(reg.address, (err, msg) => _self.messageHandler(err, msg));
            });
        }
    };

    this.eventBus.onclose = function() {
      console.log('Connection is close');
      _self.isConnected = false;
      _self.eventBus = null;
      var _reconnectIntervalSeconds = _self.reconnectIntervalSeconds;
      if (_reconnectIntervalSeconds) {
          setTimeout(_self.initialize(), (1000 * _reconnectIntervalSeconds));
      }
    };

    this.eventBus.onerror = function(err) {
      console.log('Unexpected error occurred.');
      console.log(err);
    };
  }

  setUserId(userId) {
    if (!userId || this.userId ) {
      return;
    }
    this.userId = userId;
    this.registerHandlers.push({ address: userId, type: 'user'});
  }

  setTeams(teams) {
    if (!teams || this.teams ) {
      return;
    }
    this.teams = teams;
    for (var i = 0; i < teams.length; i++) {
      this.registerHandlers.push({ address: teams[i].id, type: 'team'});
    }
  }

  setChannels(channels) {
    if (!channels || this.channels ) {
      return;
    }
    this.channels = channels;
    for (var i = 0; i < channels.length; i++) {
      this.registerHandlers.push({ address: channels[i].id, type: 'channel'});
    }
  }

  setChannelRegister(channel) {
    if (!channel || this.getChannelById(channel) || !this.eventBus) {
      return;
    }
    this.eventBus.registerHandler(channel, (err, msg) => this.messageHandler(err, msg));
  }

  getChannelById(channelId) {
    const handlers = this.registerHandlers;
    for (var i = 0; i < handlers.length; i++) {
      if (channelId === handlers[i].address) {
        return true;
      }
    }
    return false;
  }

  setEventCallback(callback) {
    this.eventCallback = callback;
  }

  close() {
    try {
        if (this.isConnected) {
            let _self = this;
            this.registerHandlers.forEach(function(regHandler) {
                _self.eventBus.unregisterHandler(regHandler.address, (err, msg) => _self.messageHandler(err, msg));
            });
            this.eventBus.close();
        }
    } catch (e) {
        console.warn(e);
        this.fire('error', e);
    }
  }

  send(address, message, replyHandler) {
    try {
        if (this.isConnected) {
            this.eventBus.send(address, message, replyHandler);
        }
    } catch (e) {
        console.warn(e);
        this.fire('error', e);
    }
  }

  publish(address, message) {
    try {
        if (this.isConnected) {
            this.eventBus.publish(address, message);
        }
    } catch (e) {
        console.warn(e);
        this.fire('error', e);
    }
  }


  messageHandler(err, res) {
    if (res) {
      const msg = JSON.parse(res.body);
      console.log(msg);
      if (this.eventCallback) {
        this.eventCallback(msg);
      }
    }
  }

}

var vertxClient = new VertxClient();

export default vertxClient;
