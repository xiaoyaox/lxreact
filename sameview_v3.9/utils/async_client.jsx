// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import UserStore from 'stores/user_store.jsx';
import TeamStore from 'stores/team_store.jsx';

import * as GlobalActions from 'actions/global_actions.jsx';

import AppDispatcher from 'dispatcher/app_dispatcher.jsx';
import Client from 'client/web_client.jsx';
import * as utils from 'utils/utils.jsx';
import * as UserAgent from 'utils/user_agent.jsx';

import Constants from 'utils/constants.jsx';
const ActionTypes = Constants.ActionTypes;
const StatTypes = Constants.StatTypes;

// Used to track in progress async calls
const callTracker = {};

const ASYNC_CLIENT_TIMEOUT = 5000;

// Redux actions
import store from 'stores/redux_store.jsx';
const dispatch = store.dispatch;
const getState = store.getState;
import {setServerVersion} from 'mattermost-redux/actions/general';

export function dispatchError(err, method) {
    AppDispatcher.handleServerAction({
        type: ActionTypes.RECEIVED_ERROR,
        err,
        method
    });
}

function isCallInProgress(callName) {
    if (!(callName in callTracker)) {
        return false;
    }

    if (callTracker[callName] === 0) {
        return false;
    }

    if (utils.getTimestamp() - callTracker[callName] > ASYNC_CLIENT_TIMEOUT) {
        //console.log('AsyncClient call ' + callName + ' expired after more than 5 seconds');
        return false;
    }

    return true;
}

export function checkVersion() {
    setServerVersion(Client.getServerVersion())(dispatch, getState);
}

export function getUser(userId, success, error) {
    const callName = `getUser${userId}`;

    if (isCallInProgress(callName)) {
        return;
    }

    callTracker[callName] = utils.getTimestamp();
    Client.getUser(
        userId,
        (data) => {
            callTracker[callName] = 0;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_PROFILE,
                profile: data
            });

            if (success) {
                success(data);
            }
        },
        (err) => {
            if (error) {
                error(err);
            } else {
                callTracker[callName] = 0;
                dispatchError(err, 'getUser');
            }
        }
    );
}

export function getLogs() {
    if (isCallInProgress('getLogs')) {
        return;
    }

    callTracker.getLogs = utils.getTimestamp();
    Client.getLogs(
        (data) => {
            callTracker.getLogs = 0;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_LOGS,
                logs: data
            });
        },
        (err) => {
            callTracker.getLogs = 0;
            dispatchError(err, 'getLogs');
        }
    );
}

export function getServerAudits() {
    if (isCallInProgress('getServerAudits')) {
        return;
    }

    callTracker.getServerAudits = utils.getTimestamp();
    Client.getServerAudits(
        (data) => {
            callTracker.getServerAudits = 0;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_SERVER_AUDITS,
                audits: data
            });
        },
        (err) => {
            callTracker.getServerAudits = 0;
            dispatchError(err, 'getServerAudits');
        }
    );
}

export function getComplianceReports() {
    if (isCallInProgress('getComplianceReports')) {
        return;
    }

    callTracker.getComplianceReports = utils.getTimestamp();
    Client.getComplianceReports(
        (data) => {
            callTracker.getComplianceReports = 0;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_SERVER_COMPLIANCE_REPORTS,
                complianceReports: data
            });
        },
        (err) => {
            callTracker.getComplianceReports = 0;
            dispatchError(err, 'getComplianceReports');
        }
    );
}

export function getConfig(success, error) {
    if (isCallInProgress('getConfig')) {
        return;
    }

    callTracker.getConfig = utils.getTimestamp();
    Client.getConfig(
        (data) => {
            callTracker.getConfig = 0;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_CONFIG,
                config: data,
                clusterId: Client.clusterId
            });

            if (success) {
                success(data);
            }
        },
        (err) => {
            callTracker.getConfig = 0;

            if (!error) {
                dispatchError(err, 'getConfig');
            }
        }
    );
}

export function search(terms, isOrSearch) {
    if (isCallInProgress('search_' + String(terms))) {
        return;
    }

    callTracker['search_' + String(terms)] = utils.getTimestamp();
    Client.search(
        terms,
        isOrSearch,
        (data) => {
            callTracker['search_' + String(terms)] = 0;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_SEARCH,
                results: data
            });
        },
        (err) => {
            callTracker['search_' + String(terms)] = 0;
            dispatchError(err, 'search');
        }
    );
}

export function getFileInfosForPost(channelId, postId) {
    const callName = 'getFileInfosForPost' + postId;

    if (isCallInProgress(callName)) {
        return;
    }

    callTracker[callName] = utils.getTimestamp();
    Client.getFileInfosForPost(
        channelId,
        postId,
        (data) => {
            callTracker[callName] = 0;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_FILE_INFOS,
                postId,
                infos: data
            });
        },
        (err) => {
            callTracker[callName] = 0;
            dispatchError(err, 'getPostFile');
        }
    );
}

export function getMe() {
    if (isCallInProgress('getMe')) {
        return null;
    }

    callTracker.getMe = utils.getTimestamp();
    return Client.getMe(
        (data) => {
            callTracker.getMe = 0;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_ME,
                me: data
            });

            GlobalActions.newLocalizationSelected(data.locale);
        },
        (err) => {
            callTracker.getMe = 0;
            dispatchError(err, 'getMe');
        }
    );
}

export function getStatuses() {
    if (isCallInProgress('getStatuses')) {
        return;
    }

    callTracker.getStatuses = utils.getTimestamp();
    Client.getStatuses(
        (data) => {
            callTracker.getStatuses = 0;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_STATUSES,
                statuses: data
            });
        },
        (err) => {
            callTracker.getStatuses = 0;
            dispatchError(err, 'getStatuses');
        }
    );
}

export function getMyTeamsUnread(teamId) {
    const members = TeamStore.getMyTeamMembers();
    if (members.length > 1) {
        const callName = 'getMyTeamsUnread';
        if (isCallInProgress(callName)) {
            return;
        }

        callTracker[callName] = utils.getTimestamp();
        Client.getMyTeamsUnread(
            teamId,
            (data) => {
                callTracker[callName] = 0;

                AppDispatcher.handleServerAction({
                    type: ActionTypes.RECEIVED_MY_TEAMS_UNREAD,
                    team_members: data
                });
            },
            (err) => {
                callTracker[callName] = 0;
                dispatchError(err, 'getMyTeamsUnread');
            }
        );
    }
}

export function getAllPreferences() {
    if (isCallInProgress('getAllPreferences')) {
        return;
    }

    callTracker.getAllPreferences = utils.getTimestamp();
    Client.getAllPreferences(
        (data) => {
            callTracker.getAllPreferences = 0;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_PREFERENCES,
                preferences: data
            });
        },
        (err) => {
            callTracker.getAllPreferences = 0;
            dispatchError(err, 'getAllPreferences');
        }
    );
}

export function savePreference(category, name, value, success, error) {
    const preference = {
        user_id: UserStore.getCurrentId(),
        category,
        name,
        value
    };

    savePreferences([preference], success, error);
}

export function savePreferences(preferences, success, error) {
    Client.savePreferences(
        preferences,
        (data) => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_PREFERENCES,
                preferences
            });

            if (success) {
                success(data);
            }
        },
        (err) => {
            dispatchError(err, 'savePreferences');

            if (error) {
                error();
            }
        }
    );
}

export function deletePreferences(preferences, success, error) {
    Client.deletePreferences(
        preferences,
        (data) => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.DELETED_PREFERENCES,
                preferences
            });

            if (success) {
                success(data);
            }
        },
        (err) => {
            dispatchError(err, 'deletePreferences');

            if (error) {
                error();
            }
        }
    );
}

export function getSuggestedCommands(command, suggestionId, component) {
    Client.listCommands(
        (data) => {
            var matches = [];
            data.forEach((cmd) => {
                if (cmd.trigger !== 'shortcuts' || !UserAgent.isMobile()) {
                    if (('/' + cmd.trigger).indexOf(command) === 0) {
                        const s = '/' + cmd.trigger;
                        let hint = '';
                        if (cmd.auto_complete_hint && cmd.auto_complete_hint.length !== 0) {
                            hint = cmd.auto_complete_hint;
                        }
                        matches.push({
                            suggestion: s,
                            hint,
                            description: cmd.auto_complete_desc
                        });
                    }
                }
            });

            matches = matches.sort((a, b) => a.suggestion.localeCompare(b.suggestion));

            // pull out the suggested commands from the returned data
            const terms = matches.map((suggestion) => suggestion.suggestion);

            if (terms.length > 0) {
                AppDispatcher.handleServerAction({
                    type: ActionTypes.SUGGESTION_RECEIVED_SUGGESTIONS,
                    id: suggestionId,
                    matchedPretext: command,
                    terms,
                    items: matches,
                    component
                });
            }
        },
        (err) => {
            dispatchError(err, 'getSuggestedCommands');
        }
    );
}

export function getStandardAnalytics(teamId) {
    const callName = 'getStandardAnaytics' + teamId;

    if (isCallInProgress(callName)) {
        return;
    }

    callTracker[callName] = utils.getTimestamp();

    Client.getAnalytics(
        'standard',
        teamId,
        (data) => {
            callTracker[callName] = 0;

            const stats = {};

            for (const index in data) {
                if (data[index].name === 'channel_open_count') {
                    stats[StatTypes.TOTAL_PUBLIC_CHANNELS] = data[index].value;
                }

                if (data[index].name === 'channel_private_count') {
                    stats[StatTypes.TOTAL_PRIVATE_GROUPS] = data[index].value;
                }

                if (data[index].name === 'post_count') {
                    stats[StatTypes.TOTAL_POSTS] = data[index].value;
                }

                if (data[index].name === 'unique_user_count') {
                    stats[StatTypes.TOTAL_USERS] = data[index].value;
                }

                if (data[index].name === 'team_count' && teamId == null) {
                    stats[StatTypes.TOTAL_TEAMS] = data[index].value;
                }

                if (data[index].name === 'total_websocket_connections') {
                    stats[StatTypes.TOTAL_WEBSOCKET_CONNECTIONS] = data[index].value;
                }

                if (data[index].name === 'total_master_db_connections') {
                    stats[StatTypes.TOTAL_MASTER_DB_CONNECTIONS] = data[index].value;
                }

                if (data[index].name === 'total_read_db_connections') {
                    stats[StatTypes.TOTAL_READ_DB_CONNECTIONS] = data[index].value;
                }

                if (data[index].name === 'daily_active_users') {
                    stats[StatTypes.DAILY_ACTIVE_USERS] = data[index].value;
                }

                if (data[index].name === 'monthly_active_users') {
                    stats[StatTypes.MONTHLY_ACTIVE_USERS] = data[index].value;
                }
            }

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_ANALYTICS,
                teamId,
                stats
            });
        },
        (err) => {
            callTracker[callName] = 0;

            dispatchError(err, 'getStandardAnalytics');
        }
    );
}

export function getAdvancedAnalytics(teamId) {
    const callName = 'getAdvancedAnalytics' + teamId;

    if (isCallInProgress(callName)) {
        return;
    }

    callTracker[callName] = utils.getTimestamp();

    Client.getAnalytics(
        'extra_counts',
        teamId,
        (data) => {
            callTracker[callName] = 0;

            const stats = {};

            for (const index in data) {
                if (data[index].name === 'file_post_count') {
                    stats[StatTypes.TOTAL_FILE_POSTS] = data[index].value;
                }

                if (data[index].name === 'hashtag_post_count') {
                    stats[StatTypes.TOTAL_HASHTAG_POSTS] = data[index].value;
                }

                if (data[index].name === 'incoming_webhook_count') {
                    stats[StatTypes.TOTAL_IHOOKS] = data[index].value;
                }

                if (data[index].name === 'outgoing_webhook_count') {
                    stats[StatTypes.TOTAL_OHOOKS] = data[index].value;
                }

                if (data[index].name === 'command_count') {
                    stats[StatTypes.TOTAL_COMMANDS] = data[index].value;
                }

                if (data[index].name === 'session_count') {
                    stats[StatTypes.TOTAL_SESSIONS] = data[index].value;
                }
            }

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_ANALYTICS,
                teamId,
                stats
            });
        },
        (err) => {
            callTracker[callName] = 0;

            dispatchError(err, 'getAdvancedAnalytics');
        }
    );
}

export function getPostsPerDayAnalytics(teamId) {
    const callName = 'getPostsPerDayAnalytics' + teamId;

    if (isCallInProgress(callName)) {
        return;
    }

    callTracker[callName] = utils.getTimestamp();

    Client.getAnalytics(
        'post_counts_day',
        teamId,
        (data) => {
            callTracker[callName] = 0;

            data.reverse();

            const stats = {};
            stats[StatTypes.POST_PER_DAY] = data;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_ANALYTICS,
                teamId,
                stats
            });
        },
        (err) => {
            callTracker[callName] = 0;

            dispatchError(err, 'getPostsPerDayAnalytics');
        }
    );
}

export function getUsersPerDayAnalytics(teamId) {
    const callName = 'getUsersPerDayAnalytics' + teamId;

    if (isCallInProgress(callName)) {
        return;
    }

    callTracker[callName] = utils.getTimestamp();

    Client.getAnalytics(
        'user_counts_with_posts_day',
        teamId,
        (data) => {
            callTracker[callName] = 0;

            data.reverse();

            const stats = {};
            stats[StatTypes.USERS_WITH_POSTS_PER_DAY] = data;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_ANALYTICS,
                teamId,
                stats
            });
        },
        (err) => {
            callTracker[callName] = 0;

            dispatchError(err, 'getUsersPerDayAnalytics');
        }
    );
}

export function getRecentAndNewUsersAnalytics(teamId) {
    const callName = 'getRecentAndNewUsersAnalytics' + teamId;

    if (isCallInProgress(callName)) {
        return;
    }

    callTracker[callName] = utils.getTimestamp();

    Client.getRecentlyActiveUsers(
        teamId,
        (users) => {
            const stats = {};

            const usersList = [];
            for (const id in users) {
                if (users.hasOwnProperty(id)) {
                    usersList.push(users[id]);
                }
            }

            usersList.sort((a, b) => {
                if (a.last_activity_at < b.last_activity_at) {
                    return 1;
                }

                if (a.last_activity_at > b.last_activity_at) {
                    return -1;
                }

                return 0;
            });

            const recentActive = [];
            for (let i = 0; i < usersList.length; i++) {
                if (usersList[i].last_activity_at == null) {
                    continue;
                }

                recentActive.push(usersList[i]);
                if (i >= Constants.STAT_MAX_ACTIVE_USERS) {
                    break;
                }
            }

            stats[StatTypes.RECENTLY_ACTIVE_USERS] = recentActive;

            usersList.sort((a, b) => {
                if (a.create_at < b.create_at) {
                    return 1;
                }

                if (a.create_at > b.create_at) {
                    return -1;
                }

                return 0;
            });

            var newlyCreated = [];
            for (let i = 0; i < usersList.length; i++) {
                newlyCreated.push(usersList[i]);
                if (i >= Constants.STAT_MAX_NEW_USERS) {
                    break;
                }
            }

            stats[StatTypes.NEWLY_CREATED_USERS] = newlyCreated;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_ANALYTICS,
                teamId,
                stats
            });
            callTracker[callName] = 0;
        },
        (err) => {
            callTracker[callName] = 0;

            dispatchError(err, 'getRecentAndNewUsersAnalytics');
        }
    );
}

export function addIncomingHook(hook, success, error) {
    Client.addIncomingHook(
        hook,
        (data) => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_INCOMING_WEBHOOK,
                incomingWebhook: data
            });

            if (success) {
                success(data);
            }
        },
        (err) => {
            if (error) {
                error(err);
            } else {
                dispatchError(err, 'addIncomingHook');
            }
        }
    );
}

export function updateIncomingHook(hook, success, error) {
    Client.updateIncomingHook(
        hook,
        (data) => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.UPDATED_INCOMING_WEBHOOK,
                incomingWebhook: data
            });

            if (success) {
                success(data);
            }
        },
        (err) => {
            if (error) {
                error(err);
            } else {
                dispatchError(err, 'updateIncomingHook');
            }
        }
    );
}

export function addOutgoingHook(hook, success, error) {
    Client.addOutgoingHook(
        hook,
        (data) => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_OUTGOING_WEBHOOK,
                outgoingWebhook: data
            });

            if (success) {
                success(data);
            }
        },
        (err) => {
            if (error) {
                error(err);
            } else {
                dispatchError(err, 'addOutgoingHook');
            }
        }
    );
}

export function updateOutgoingHook(hook, success, error) {
    Client.updateOutgoingHook(
        hook,
        (data) => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.UPDATED_OUTGOING_WEBHOOK,
                outgoingWebhook: data
            });

            if (success) {
                success(data);
            }
        },
        (err) => {
            if (error) {
                error(err);
            } else {
                dispatchError(err, 'updateOutgoingHook');
            }
        }
    );
}

export function deleteIncomingHook(id) {
    Client.deleteIncomingHook(
        id,
        () => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.REMOVED_INCOMING_WEBHOOK,
                teamId: Client.teamId,
                id
            });
        },
        (err) => {
            dispatchError(err, 'deleteIncomingHook');
        }
    );
}

export function deleteOutgoingHook(id) {
    Client.deleteOutgoingHook(
        id,
        () => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.REMOVED_OUTGOING_WEBHOOK,
                teamId: Client.teamId,
                id
            });
        },
        (err) => {
            dispatchError(err, 'deleteOutgoingHook');
        }
    );
}

export function regenOutgoingHookToken(id) {
    Client.regenOutgoingHookToken(
        id,
        (data) => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.UPDATED_OUTGOING_WEBHOOK,
                outgoingWebhook: data
            });
        },
        (err) => {
            dispatchError(err, 'regenOutgoingHookToken');
        }
    );
}

export function addCommand(command, success, error) {
    Client.addCommand(
        command,
        (data) => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_COMMAND,
                command: data
            });

            if (success) {
                success(data);
            }
        },
        (err) => {
            if (error) {
                error(err);
            } else {
                dispatchError(err, 'addCommand');
            }
        }
    );
}

export function editCommand(command, success, error) {
    Client.editCommand(
        command,
        (data) => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.UPDATED_COMMAND,
                command: data
            });

            if (success) {
                success(data);
            }
        },
        (err) => {
            if (error) {
                error(err);
            } else {
                dispatchError(err, 'editCommand');
            }
        }
    );
}

export function deleteCommand(id) {
    Client.deleteCommand(
        id,
        () => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.REMOVED_COMMAND,
                teamId: Client.teamId,
                id
            });
        },
        (err) => {
            dispatchError(err, 'deleteCommand');
        }
    );
}

export function regenCommandToken(id) {
    Client.regenCommandToken(
        id,
        (data) => {
            AppDispatcher.handleServerAction({
                type: ActionTypes.UPDATED_COMMAND,
                command: data
            });
        },
        (err) => {
            dispatchError(err, 'regenCommandToken');
        }
    );
}

export function getPublicLink(fileId, success, error) {
    const callName = 'getPublicLink' + fileId;

    if (isCallInProgress(callName)) {
        return;
    }

    callTracker[callName] = utils.getTimestamp();

    Client.getPublicLink(
        fileId,
        (link) => {
            callTracker[callName] = 0;

            success(link);
        },
        (err) => {
            callTracker[callName] = 0;

            if (error) {
                error(err);
            } else {
                dispatchError(err, 'getPublicLink');
            }
        }
    );
}

export function addEmoji(emoji, image, success, error) {
    const callName = 'addEmoji' + emoji.name;

    if (isCallInProgress(callName)) {
        return;
    }

    callTracker[callName] = utils.getTimestamp();

    Client.addEmoji(
        emoji,
        image,
        (data) => {
            callTracker[callName] = 0;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_CUSTOM_EMOJI,
                emoji: data
            });

            if (success) {
                success();
            }
        },
        (err) => {
            callTracker[callName] = 0;

            if (error) {
                error(err);
            } else {
                dispatchError(err, 'addEmoji');
            }
        }
    );
}

export function deleteEmoji(id) {
    const callName = 'deleteEmoji' + id;

    if (isCallInProgress(callName)) {
        return;
    }

    callTracker[callName] = utils.getTimestamp();

    Client.deleteEmoji(
        id,
        () => {
            callTracker[callName] = 0;

            AppDispatcher.handleServerAction({
                type: ActionTypes.REMOVED_CUSTOM_EMOJI,
                id
            });
        },
        (err) => {
            callTracker[callName] = 0;
            dispatchError(err, 'deleteEmoji');
        }
    );
}

export function pinPost(channelId, reaction) {
    Client.pinPost(
        channelId,
        reaction,
        () => {
            // the "post_edited" websocket event take cares of updating the posts
            // the action below is mostly dispatched for the RHS to update
            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_POST_PINNED,
                reaction
            });
        },
        (err) => {
            dispatchError(err, 'pinPost');
        }
    );
}

export function unpinPost(channelId, reaction) {
    Client.unpinPost(
        channelId,
        reaction,
        () => {
            // the "post_edited" websocket event take cares of updating the posts
            // the action below is mostly dispatched for the RHS to update
            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_POST_UNPINNED,
                reaction
            });
        },
        (err) => {
            dispatchError(err, 'unpinPost');
        }
    );
}

export function saveReaction(channelId, reaction) {
    Client.saveReaction(
        channelId,
        reaction,
        null, // the added reaction will be sent over the websocket
        (err) => {
            dispatchError(err, 'saveReaction');
        }
    );
}

export function deleteReaction(channelId, reaction) {
    Client.deleteReaction(
        channelId,
        reaction,
        null, // the removed reaction will be sent over the websocket
        (err) => {
            dispatchError(err, 'deleteReaction');
        }
    );
}

export function listReactions(channelId, postId) {
    const callName = 'deleteEmoji' + postId;

    if (isCallInProgress(callName)) {
        return;
    }

    callTracker[callName] = utils.getTimestamp();

    Client.listReactions(
        channelId,
        postId,
        (data) => {
            callTracker[callName] = 0;

            AppDispatcher.handleServerAction({
                type: ActionTypes.RECEIVED_REACTIONS,
                postId,
                reactions: data
            });
        },
        (err) => {
            callTracker[callName] = 0;
            dispatchError(err, 'listReactions');
        }
    );
}
