// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import {combineReducers} from 'redux';
import {AdminTypes} from '../../action_types';

import {handleRequest, initialRequestState} from './helpers';

function getLogs(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.GET_LOGS_REQUEST,
        AdminTypes.GET_LOGS_SUCCESS,
        AdminTypes.GET_LOGS_FAILURE,
        state,
        action
    );
}

function getAudits(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.GET_AUDITS_REQUEST,
        AdminTypes.GET_AUDITS_SUCCESS,
        AdminTypes.GET_AUDITS_FAILURE,
        state,
        action
    );
}

function getConfig(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.GET_CONFIG_REQUEST,
        AdminTypes.GET_CONFIG_SUCCESS,
        AdminTypes.GET_CONFIG_FAILURE,
        state,
        action
    );
}

function updateConfig(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.UPDATE_CONFIG_REQUEST,
        AdminTypes.UPDATE_CONFIG_SUCCESS,
        AdminTypes.UPDATE_CONFIG_FAILURE,
        state,
        action
    );
}

function reloadConfig(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.RELOAD_CONFIG_REQUEST,
        AdminTypes.RELOAD_CONFIG_SUCCESS,
        AdminTypes.RELOAD_CONFIG_FAILURE,
        state,
        action
    );
}

function testEmail(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.TEST_EMAIL_REQUEST,
        AdminTypes.TEST_EMAIL_SUCCESS,
        AdminTypes.TEST_EMAIL_FAILURE,
        state,
        action
    );
}

function invalidateCaches(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.INVALIDATE_CACHES_REQUEST,
        AdminTypes.INVALIDATE_CACHES_SUCCESS,
        AdminTypes.INVALIDATE_CACHES_FAILURE,
        state,
        action
    );
}

function recycleDatabase(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.RECYCLE_DATABASE_REQUEST,
        AdminTypes.RECYCLE_DATABASE_SUCCESS,
        AdminTypes.RECYCLE_DATABASE_FAILURE,
        state,
        action
    );
}

function createCompliance(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.CREATE_COMPLIANCE_REQUEST,
        AdminTypes.CREATE_COMPLIANCE_SUCCESS,
        AdminTypes.CREATE_COMPLIANCE_FAILURE,
        state,
        action
    );
}

function getCompliance(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.GET_COMPLIANCE_REQUEST,
        AdminTypes.GET_COMPLIANCE_SUCCESS,
        AdminTypes.GET_COMPLIANCE_FAILURE,
        state,
        action
    );
}

function uploadBrandImage(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.UPLOAD_BRAND_IMAGE_REQUEST,
        AdminTypes.UPLOAD_BRAND_IMAGE_SUCCESS,
        AdminTypes.UPLOAD_BRAND_IMAGE_FAILURE,
        state,
        action
    );
}

function getClusterStatus(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.GET_CLUSTER_STATUS_REQUEST,
        AdminTypes.GET_CLUSTER_STATUS_SUCCESS,
        AdminTypes.GET_CLUSTER_STATUS_FAILURE,
        state,
        action
    );
}

function testLdap(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.TEST_LDAP_REQUEST,
        AdminTypes.TEST_LDAP_SUCCESS,
        AdminTypes.TEST_LDAP_FAILURE,
        state,
        action
    );
}

function syncLdap(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.SYNC_LDAP_REQUEST,
        AdminTypes.SYNC_LDAP_SUCCESS,
        AdminTypes.SYNC_LDAP_FAILURE,
        state,
        action
    );
}

function getSamlCertificateStatus(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.SAML_CERT_STATUS_REQUEST,
        AdminTypes.SAML_CERT_STATUS_SUCCESS,
        AdminTypes.SAML_CERT_STATUS_FAILURE,
        state,
        action
    );
}

function uploadPublicSamlCertificate(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.UPLOAD_SAML_PUBLIC_REQUEST,
        AdminTypes.UPLOAD_SAML_PUBLIC_SUCCESS,
        AdminTypes.UPLOAD_SAML_PUBLIC_FAILURE,
        state,
        action
    );
}

function uploadPrivateSamlCertificate(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.UPLOAD_SAML_PRIVATE_REQUEST,
        AdminTypes.UPLOAD_SAML_PRIVATE_SUCCESS,
        AdminTypes.UPLOAD_SAML_PRIVATE_FAILURE,
        state,
        action
    );
}

function uploadIdpSamlCertificate(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.UPLOAD_SAML_IDP_REQUEST,
        AdminTypes.UPLOAD_SAML_IDP_SUCCESS,
        AdminTypes.UPLOAD_SAML_IDP_FAILURE,
        state,
        action
    );
}

function removePublicSamlCertificate(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.DELETE_SAML_PUBLIC_REQUEST,
        AdminTypes.DELETE_SAML_PUBLIC_SUCCESS,
        AdminTypes.DELETE_SAML_PUBLIC_FAILURE,
        state,
        action
    );
}

function removePrivateSamlCertificate(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.DELETE_SAML_PRIVATE_REQUEST,
        AdminTypes.DELETE_SAML_PRIVATE_SUCCESS,
        AdminTypes.DELETE_SAML_PRIVATE_FAILURE,
        state,
        action
    );
}

function removeIdpSamlCertificate(state = initialRequestState(), action) {
    return handleRequest(
        AdminTypes.DELETE_SAML_IDP_REQUEST,
        AdminTypes.DELETE_SAML_IDP_SUCCESS,
        AdminTypes.DELETE_SAML_IDP_FAILURE,
        state,
        action
    );
}

export default combineReducers({
    getLogs,
    getAudits,
    getConfig,
    updateConfig,
    reloadConfig,
    testEmail,
    invalidateCaches,
    recycleDatabase,
    createCompliance,
    getCompliance,
    uploadBrandImage,
    getClusterStatus,
    testLdap,
    syncLdap,
    getSamlCertificateStatus,
    uploadPublicSamlCertificate,
    uploadPrivateSamlCertificate,
    uploadIdpSamlCertificate,
    removePublicSamlCertificate,
    removePrivateSamlCertificate,
    removeIdpSamlCertificate
});
