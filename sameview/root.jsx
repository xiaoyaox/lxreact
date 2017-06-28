


import $ from 'jquery';
require('perfect-scrollbar/jquery')($);
import React from 'react';
import ReactDOM from 'react-dom';
import {Router, browserHistory} from 'react-router/es6';
import PDFJS from 'pdfjs-dist';
import * as GlobalActions from 'actions/global_actions.jsx';
// import * as Websockets from 'actions/websocket_actions.jsx';
import * as VertxActions from 'actions/vertx_actions.jsx';
import BrowserStore from 'stores/browser_store.jsx';
import ChannelStore from 'stores/channel_store.jsx';
import UserStore from 'stores/user_store.jsx';
import * as I18n from 'i18n/i18n.jsx';
import * as AsyncClient from 'utils/async_client.jsx';
import Client from 'client/web_client.jsx';

// Import our styles
import 'static/bootstrap-colorpicker/css/bootstrap-colorpicker.css';
import 'google-fonts/google-fonts.css';
import 'sass/styles.scss';
import 'katex/dist/katex.min.css';

// Import the root of our routing tree
import rRoot from 'routes/route_root.jsx';

PDFJS.disableWorker = true;

// This is for anything that needs to be done for ALL react components.
// This runs before we start to render anything.
function preRenderSetup(callwhendone) {
    window.onerror = (msg, url, line, column, stack) => {
        var l = {};
        l.level = 'ERROR';
        l.message = 'msg: ' + msg + ' row: ' + line + ' col: ' + column + ' stack: ' + stack + ' url: ' + url;

        // $.ajax({
        //     url: '/api/v3/general/log_client',
        //     dataType: 'json',
        //     contentType: 'application/json',
        //     type: 'POST',
        //     data: JSON.stringify(l)
        // });

        if (window.mm_config && window.mm_config.EnableDeveloper === 'true') {
            window.ErrorStore.storeLastError({type: 'developer', message: 'DEVELOPER MODE: A JavaScript error has occurred.  Please use the JavaScript console to capture and report the error (row: ' + line + ' col: ' + column + ').'});
            window.ErrorStore.emitChange();
        }
    };

    var d1 = $.Deferred(); //eslint-disable-line new-cap

    GlobalActions.emitInitialLoad(
        () => {
            d1.resolve();
        }
    );

    // Make sure the websockets close and reset version
    //beforeunload事件在当页面卸载（关闭）或刷新时出发。这里用来关闭 Websockets 连接。
    $(window).on('beforeunload',
         () => {
             // Turn off to prevent getting stuck in a loop
             $(window).off('beforeunload');
             BrowserStore.setLastServerVersion('');
             if (UserStore.getCurrentUser()) {
                 AsyncClient.viewChannel('', ChannelStore.getCurrentId() || '');
             }
             VertxActions.close();
         }
    );

    function afterIntl() {
        $.when(d1).done(() => {
            I18n.doAddLocaleData(); //加载react-intl组件自带的各种语言的配置文件。
            callwhendone();
        });
    }

    if (global.Intl) {
        afterIntl();
    } else {
        I18n.safariFix(afterIntl);
    }
}

function loadIntl() {
  function afterIntl() {
      // $.when(d1).done(() => {
      //     I18n.doAddLocaleData(); //加载react-intl组件自带的各种语言的配置文件。
      //     callwhendone();
      // });
      I18n.doAddLocaleData();
  }

  if (global.Intl) {
      afterIntl();
  } else {
      I18n.safariFix(afterIntl);
  }
}

function renderRootComponent() {
    ReactDOM.render((
        <Router
            history={browserHistory}
            routes={rRoot}
        />
    ),
    document.getElementById('root'));
}

window.setup_root = () => {
    // Do the pre-render setup and call renderRootComponent when done
    // if (Client.getToken()) {
      preRenderSetup(renderRootComponent);
    // } else {
    //   loadIntl();
    //   // no login get in.
    //   window.mm_config ={
    //     SiteName:'Sameview',
    //     DefaultClientLocale: 'zh-CN',
    //     EnableSignInWithEmail: "true"
    //   };
    //   window.mm_license={};
    //   renderRootComponent();
    // }

};
