// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import request from 'superagent';

const HEADER_X_VERSION_ID = 'x-version-id';
const HEADER_X_CLUSTER_ID = 'x-cluster-id';
const HEADER_TOKEN = 'token';
const HEADER_BEARER = 'BEARER';
const HEADER_AUTH = 'Authorization';
const localStoreTokenName = 'S_F_E_T_TOKEN'; //记录是否已经登录的token的名字。

class MyWebClient {
    constructor() {
        this.serverVersion = '';
        this.clusterId = '';
        this.logToConsole = false;
        this.useToken = false;
        this.token = '';
        this.tokenName = localStoreTokenName;
        // this.url = 'http://192.168.9.39:10080'; //192.168.9.81:10080 , 220.168.30.10:10080
        this.url = window.serverUrl;
        // this.url ='http://192.168.9.39:10080';
        //this.url ='http://matt.siteview.com';
          //this.url = 'http://www.sameview.com'; //192.168.9.81:10080 , 220.168.30.10:10080
          //this.url = 'http://123.207.93.70:8068'; //192.168.9.81:10080 , 220.168.30.10:10080
        // this.urlVersion = '';
        this.urlVersion = '/api/v3';
        this.defaultHeaders = {
            'X-Requested-With': 'XMLHttpRequest'
            // 'Access-Control-Allow-Origin':'*'
        };

        this.translations = {
            connectionError: 'There appears to be a problem with your internet connection.',
            unknownError: 'We received an unexpected status code from the server.'
        };
    }

    setUrl(url) {
        this.url = url;
    }

    getToken() {
      return localStorage.getItem(this.tokenName);
    }

    removeToken(){
      localStorage.removeItem(this.tokenName);
    }

    setAcceptLanguage(locale) {
        this.defaultHeaders['Accept-Language'] = locale;
    }

    getServerVersion() {
        return this.serverVersion;
    }

    getBaseRoute() {
        return `${this.url}${this.urlVersion}`;
    }

    getAdminRoute() {
        return `${this.url}${this.urlVersion}/admin`;
    }
    //
    getUsersRoute() {
        return `${this.url}${this.urlVersion}/users`;
    }
    getUserRoute() {
        return `${this.url}${this.urlVersion}/users`;
    }
    getContactsImportUrl(){
      return `${this.url}${this.urlVersion}/import/contacts`;
    }

    getfileInformationUrl(){
      return `${this.url}/fileInformation`;
    }

    getfileInfoImportUrl(){
      return `${this.url}${this.urlVersion}/import/fileInformation`;
    }

    setTranslations(messages) {
        this.translations = messages;
    }

    enableLogErrorsToConsole(enabled) {
        this.logToConsole = enabled;
    }

    useHeaderToken() {
        this.useToken = true;
        if (this.token !== '') {
            this.defaultHeaders[HEADER_AUTH] = `${HEADER_BEARER} ${this.token}`;
        }
    }

    trackEvent(category, event, properties) { // eslint-disable-line no-unused-vars
        // NO-OP for inherited classes to override
    }

    handleError(err, res) { // eslint-disable-line no-unused-vars
        // NO-OP for inherited classes to override
    }

    handleSuccess(res) { // eslint-disable-line no-unused-vars
        // NO-OP for inherited classes to override
    }

    handleResponse(methodName, successCallback, errorCallback, err, res) {
        if (res && res.header) {
            if (res.header[HEADER_X_VERSION_ID]) {
                this.serverVersion = res.header[HEADER_X_VERSION_ID];
            }

            if (res.header[HEADER_X_CLUSTER_ID]) {
                this.clusterId = res.header[HEADER_X_CLUSTER_ID];
            }
        }

        if (err) {
            // test to make sure it looks like a server JSON error response
            var e = null;
            if (res && res.body && res.body.id) {
                e = res.body;
            }
            if (res && res.text) {
              if (res.text == 'token time out') {
                e = {
                  msg: 'token time out'
                }
              } else {
                var text='';
                try{
                   text = JSON.parse(res.text);
                }catch(e){
                  text = res.text;
                }
                if (typeof text=="object" && text.id) {
                  e = text;
                }
              }
            }

            var msg = '';

            if (e) {
                msg = 'method=' + methodName + ' msg=' + e.message + ' detail=' + e.detailed_error + ' rid=' + e.request_id;
            } else {
                msg = 'method=' + methodName + ' status=' + err.status + ' statusCode=' + err.statusCode + ' err=' + err;

                if (err.status === 0 || !err.status) {
                    e = {message: this.translations.connectionError};
                } else {
                    e = {message: this.translations.unknownError + ' (' + err.status + ')'};
                }
            }

            if (this.logToConsole) {
                console.error(msg); // eslint-disable-line no-console
                console.error(e); // eslint-disable-line no-console
            }

            if (res && res.text == 'token time out') { // eslint-disable-line no-undefined
                this.removeToken();
                window.location.href = '/';
            }

            this.handleError(err, res);

            if (errorCallback) {
                errorCallback(e, err, res);
            }
            return;
        }

        if (successCallback) {
            if (res && res.body !== undefined && res.body !== null) { // eslint-disable-line no-undefined
                successCallback(res.body, res);
            }
            else if (res && res.text !== undefined) { // eslint-disable-line no-undefined
                successCallback(res.text ? JSON.parse(res.text) : null, res);
            }
            else {
                console.error('Missing response body for ' + methodName); // eslint-disable-line no-console
                successCallback('', res);
            }
            this.handleSuccess(res);
        }
    }

    // General Routes Section

    // getClientConfig(success, error) {
    //     return request.
    //         get(`${this.getGeneralRoute()}/client_props`).
    //         set(this.defaultHeaders).
    //         type('application/json').
    //         accept('application/json').
    //         end(this.handleResponse.bind(this, 'getClientConfig', success, error));
    // }
    //
    // getTranslations(url, success, error) {
    //     return request.
    //         get(url).
    //         set(this.defaultHeaders).
    //         type('application/json').
    //         accept('application/json').
    //         end(this.handleResponse.bind(this, 'getTranslations', success, error));
    // }
    //
    // getInitialLoad(success, error) {
    //     request.
    //         get(`${this.getUsersRoute()}/initial_load`).
    //         set(this.defaultHeaders).
    //         type('application/json').
    //         accept('application/json').
    //         end(this.handleResponse.bind(this, 'getInitialLoad', success, error));
    // }

    // login(loginId, password, mfaToken, success, error) {
    //     this.doLogin({login_id: loginId, password, token: mfaToken}, success, error);
    //
    //     this.trackEvent('api', 'api_users_login');
    // }
    //
    // loginById(id, password, mfaToken, success, error) {
    //     this.doLogin({id, password, token: mfaToken}, success, error);
    //
    //     this.trackEvent('api', 'api_users_login');
    // }
    //
    // loginByLdap(loginId, password, mfaToken, success, error) {
    //     this.doLogin({login_id: loginId, password, token: mfaToken, ldap_only: 'true'}, success, error);
    //
    //     this.trackEvent('api', 'api_users_login');
    //     this.trackEvent('api', 'api_users_login_ldap');
    // }
    //
    // doLogin(outgoingData, success, error) {
    //     let _this = this;  // eslint-disable-line consistent-this
    //
    //     request.
    //         post(`${this.getUsersRoute()}/login`).
    //         set(this.defaultHeaders).
    //         type('application/json').
    //         accept('application/json').
    //         send(outgoingData).
    //         end(this.handleResponse.bind(
    //             this,
    //             'login',
    //             (data, res) => {
    //                 if (res && res.header) {
    //                     _this.token = res.header[HEADER_TOKEN];
    //                     localStorage.setItem(_this.tokenName,_this.token+""); //把登录成功的token记在localStorage里，在就不用再重新登录了。
    //                     if (_this.useToken) {
    //                         _this.defaultHeaders[HEADER_AUTH] = `${HEADER_BEARER} ${_this.token}`;
    //                     }
    //                 }
    //                 if (success) {
    //                     success(data, res);
    //                 }
    //             },
    //             error
    //         ));
    // }
    //
    // logout(success, error) {
    //   let _this = this;
    //     request.
    //         post(`${this.getUsersRoute()}/logout`).
    //         set(this.defaultHeaders).
    //         type('application/json').
    //         accept('application/json').
    //         end(this.handleResponse.bind(this, 'logout', (data,res)=>{
    //           localStorage.removeItem(_this.tokenName);
    //           success && success(data,res);
    //         }, error));
    //
    //         this.trackEvent('api', 'api_users_logout');
    // }

    getServerAddressBook(param, success, error) {
      let _this = this;
      this.defaultHeaders[HEADER_TOKEN] = localStorage.getItem(this.tokenName);
      request.
          post(`${this.getUsersRoute()}/contacts`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(param).
          end(this.handleResponse.bind(this, 'contacts', (data,res)=>{
            success && success(data,res);
          }, error));
    }
    addOrEditContacts(actionName,param, success, error) {
      this.defaultHeaders[HEADER_TOKEN] = localStorage.getItem(this.tokenName);
      request.
          post(`${this.getUsersRoute()}/contacts/${actionName}`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(param).
          end(this.handleResponse.bind(this, 'contacts_'+actionName, (data,res)=>{
            success && success(data,res);
          }, error));
    }
    deleteContacts(contactsIds,success,error){ //删除联系人。contactsIds为逗号隔开的字符串。
      this.defaultHeaders[HEADER_TOKEN] = localStorage.getItem(this.tokenName);
      request.
          post(`${this.getUsersRoute()}/contacts/batchdelete`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(contactsIds).
          end(this.handleResponse.bind(this, 'contactsIds_batchdelete', (data,res)=>{
            success && success(data,res);
          }, error));
    }

    getOrganizationsData(success,error){
      this.defaultHeaders[HEADER_TOKEN] = localStorage.getItem(this.tokenName);
      request.
          post(`${this.getUsersRoute()}/organizations`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          end(this.handleResponse.bind(this, 'organizations', (data,res)=>{
            success && success(data,res);
          }, error));
    }

    getUsersData(params,success,error){
      this.defaultHeaders[HEADER_TOKEN] = localStorage.getItem(this.tokenName);
      request.
          post(`${this.getUsersRoute()}/getAllUser`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          // send(params).
          end(this.handleResponse.bind(this, 'getAllUser', (data,res)=>{
            success && success(data,res);
          }, error));
    }
    getSearchUsersData(params,success,error){
      this.defaultHeaders[HEADER_TOKEN] = localStorage.getItem(this.tokenName);
      request.
          post(`${this.getUsersRoute()}/getSearch`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(params).
          end(this.handleResponse.bind(this, 'getSearch', (data,res)=>{
            success && success(data,res);
          }, error));
    }

    addOrEditUser(actionName,params,success,error){ //新增或者编辑用户信息。第一个参数可为（'create','update'）
      this.defaultHeaders[HEADER_TOKEN] = localStorage.getItem(this.tokenName);
      request.
          post(`${this.getUsersRoute()}/${actionName}`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(params).
          end(this.handleResponse.bind(this, 'users'+actionName, (data,res)=>{
            success && success(data,res);
          }, error));
    }

    deleteUsers(userIds,success,error){ //删除用户信息。userIds为逗号隔开的字符串。
      this.defaultHeaders[HEADER_TOKEN] = localStorage.getItem(this.tokenName);
      request.
          post(`${this.getUsersRoute()}/batchdelete`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(userIds).
          end(this.handleResponse.bind(this, 'batchdelete', (data,res)=>{
            success && success(data,res);
          }, error));
    }

    addOrEditOrganization(actionName,params,success,error){ //新增或者编辑组织机构。第一个参数可为（'add','update'）
      this.defaultHeaders[HEADER_TOKEN] = localStorage.getItem(this.tokenName);
      request.
          post(`${this.getUsersRoute()}/organizations/${actionName}`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(params).
          end(this.handleResponse.bind(this, 'organizations '+actionName, (data,res)=>{
            success && success(data,res);
          }, error));
    }

    deleteOrganization(organizationId,success,error){ //删除组织结构
      this.defaultHeaders[HEADER_TOKEN] = localStorage.getItem(this.tokenName);
      request.
          post(`${this.getUsersRoute()}/organizations/${organizationId}/delete`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          end(this.handleResponse.bind(this, 'organizations_delete', (data,res)=>{
            success && success(data,res);
          }, error));
    }

    getUserLoginRecordData(params,success,error){ //获取用户自己的登录签到记录
      this.defaultHeaders[HEADER_TOKEN] = localStorage.getItem(this.tokenName);
      request.
          post(`${this.getUsersRoute()}/punchcard`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(params).
          end(this.handleResponse.bind(this, 'user_punchcard', (data,res)=>{
            success && success(data,res);
          }, error));
    }

    getPermissionsData(success,error){ //获取所有权限数据
      this.defaultHeaders[HEADER_TOKEN] = localStorage.getItem(this.tokenName);
      request.
          post(`${this.getBaseRoute()}/permission`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          end(this.handleResponse.bind(this, 'permission_data', (data,res)=>{
            success && success(data,res);
          }, error));
    }
    getPermissionsDataByOrgaId(organizationId,success,error){ //获取某个组织拥有的权限数据
      this.defaultHeaders[HEADER_TOKEN] = localStorage.getItem(this.tokenName);
      request.
          post(`${this.getBaseRoute()}/permission/${organizationId}`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          end(this.handleResponse.bind(this, 'permission_by_orga', (data,res)=>{
            success && success(data,res);
          }, error));
    }
    updatePermissionsDataByOrgaId(organizationId,params,success,error){
      this.defaultHeaders[HEADER_TOKEN] = localStorage.getItem(this.tokenName);
      request.
          post(`${this.getBaseRoute()}/permission/${organizationId}`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(params).
          end(this.handleResponse.bind(this, 'update_permission_by_orga', (data,res)=>{
            success && success(data,res);
          }, error));
    }

    // FileInformation

    // search file info
    getSearchFileInfo(params, success, error) {
      this.defaultHeaders[HEADER_TOKEN] = this.getToken();
      request.
          post(`${this.getfileInformationUrl()}/searchfileinfo`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(params).
          end(this.handleResponse.bind(this, 'getSearchFileInfo', success, error));
    }

    // create file info
    createFileInfo(id, success, error) {
      this.defaultHeaders[HEADER_TOKEN] = this.getToken();
      request.
          post(`${this.getfileInformationUrl()}/createfileinfo`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(id).
          end(this.handleResponse.bind(this, 'createFileInfo', success, error));
    }

    // update file info
    updateFileInfo(id, success, error) {
      this.defaultHeaders[HEADER_TOKEN] = this.getToken();
      request.
          post(`${this.getfileInformationUrl()}/updatefileinfo`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(id).
          end(this.handleResponse.bind(this, 'updateFileInfo', success, error));
    }

    // delete selectd file info by id
    deleteFileInfo(id, success, error) {
      this.defaultHeaders[HEADER_TOKEN] = this.getToken();
      request.
          post(`${this.getfileInformationUrl()}/deletefileinfo`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(id).
          end(this.handleResponse.bind(this, 'deleteFileInfo', success, error));
    }

    // search file info family member
    getSearchFileFamilyMember(params, success, error) {
      this.defaultHeaders[HEADER_TOKEN] = this.getToken();
      request.
          post(`${this.getfileInformationUrl()}/searchfamilymember`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(params).
          end(this.handleResponse.bind(this, 'getSearchFileFamilyMember', success, error));
    }

    // create file info family member
    createFileFamilyMember(id, success, error) {
      this.defaultHeaders[HEADER_TOKEN] = this.getToken();
      request.
          post(`${this.getfileInformationUrl()}/createfamilymember`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(id).
          end(this.handleResponse.bind(this, 'createFileFamilyMember', success, error));
    }

    // update file info family member
    updateFileFamilyMember(id, success, error) {
      this.defaultHeaders[HEADER_TOKEN] = this.getToken();
      request.
          post(`${this.getfileInformationUrl()}/updatefamilymember`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(id).
          end(this.handleResponse.bind(this, 'updateFileFamilyMember', success, error));
    }

    //delete file info  family member by id
    deleteFileFamilyMember(id, success, error) {
      this.defaultHeaders[HEADER_TOKEN] = this.getToken();
      request.
          post(`${this.getfileInformationUrl()}/deletefamilymember`).
          set(this.defaultHeaders).
          type('application/json').
          accept('application/json').
          send(id).
          end(this.handleResponse.bind(this, 'deleteFileFamilyMember', success, error));
    }


}

var myWebClient = new MyWebClient();
export default myWebClient;
