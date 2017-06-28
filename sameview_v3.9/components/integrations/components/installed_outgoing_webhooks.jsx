// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import BackstageList from 'components/backstage/components/backstage_list.jsx';
import InstalledOutgoingWebhook from './installed_outgoing_webhook.jsx';

import ChannelStore from 'stores/channel_store.jsx';
import IntegrationStore from 'stores/integration_store.jsx';
import TeamStore from 'stores/team_store.jsx';
import UserStore from 'stores/user_store.jsx';

import {loadOutgoingHooks} from 'actions/integration_actions.jsx';

import * as Utils from 'utils/utils.jsx';
import * as AsyncClient from 'utils/async_client.jsx';

import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class InstalledOutgoingWebhooks extends React.Component {
    static get propTypes() {
        return {
            team: React.PropTypes.object,
            user: React.PropTypes.object,
            isAdmin: React.PropTypes.bool
        };
    }

    constructor(props) {
        super(props);

        this.handleIntegrationChange = this.handleIntegrationChange.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.regenOutgoingWebhookToken = this.regenOutgoingWebhookToken.bind(this);
        this.deleteOutgoingWebhook = this.deleteOutgoingWebhook.bind(this);

        const teamId = TeamStore.getCurrentId();

        this.state = {
            outgoingWebhooks: IntegrationStore.getOutgoingWebhooks(teamId),
            loading: !IntegrationStore.hasReceivedOutgoingWebhooks(teamId),
            users: UserStore.getProfiles()
        };
    }

    componentDidMount() {
        IntegrationStore.addChangeListener(this.handleIntegrationChange);
        UserStore.addChangeListener(this.handleUserChange);

        if (window.mm_config.EnableOutgoingWebhooks === 'true') {
            loadOutgoingHooks();
        }
    }

    componentWillUnmount() {
        IntegrationStore.removeChangeListener(this.handleIntegrationChange);
        UserStore.removeChangeListener(this.handleUserChange);
    }

    handleIntegrationChange() {
        const teamId = TeamStore.getCurrentId();

        this.setState({
            outgoingWebhooks: IntegrationStore.getOutgoingWebhooks(teamId),
            loading: !IntegrationStore.hasReceivedOutgoingWebhooks(teamId)
        });
    }

    handleUserChange() {
        this.setState({users: UserStore.getProfiles()});
    }

    regenOutgoingWebhookToken(outgoingWebhook) {
        AsyncClient.regenOutgoingHookToken(outgoingWebhook.id);
    }

    deleteOutgoingWebhook(outgoingWebhook) {
        AsyncClient.deleteOutgoingHook(outgoingWebhook.id);
    }

    outgoingWebhookCompare(a, b) {
        let displayNameA = a.display_name;
        if (!displayNameA) {
            const channelA = ChannelStore.get(a.channel_id);
            if (channelA) {
                displayNameA = channelA.display_name;
            } else {
                displayNameA = Utils.localizeMessage('installed_outgoing_webhooks.unknown_channel', 'A Private Webhook');
            }
        }

        let displayNameB = b.display_name;
        if (!displayNameB) {
            const channelB = ChannelStore.get(b.channel_id);
            if (channelB) {
                displayNameB = channelB.display_name;
            } else {
                displayNameB = Utils.localizeMessage('installed_outgoing_webhooks.unknown_channel', 'A Private Webhook');
            }
        }

        return displayNameA.localeCompare(displayNameB);
    }

    render() {
        const outgoingWebhooks = this.state.outgoingWebhooks.sort(this.outgoingWebhookCompare).map((outgoingWebhook) => {
            const canChange = this.props.isAdmin || this.props.user.id === outgoingWebhook.creator_id;

            return (
                <InstalledOutgoingWebhook
                    key={outgoingWebhook.id}
                    outgoingWebhook={outgoingWebhook}
                    onRegenToken={this.regenOutgoingWebhookToken}
                    onDelete={this.deleteOutgoingWebhook}
                    creator={this.state.users[outgoingWebhook.creator_id] || {}}
                    canChange={canChange}
                    team={this.props.team}
                />
            );
        });

        return (
            <BackstageList
                header={
                    <FormattedMessage
                        id='installed_outgoing_webhooks.header'
                        defaultMessage='Installed Outgoing Webhooks'
                    />
                }
                addText={
                    <FormattedMessage
                        id='installed_outgoing_webhooks.add'
                        defaultMessage='Add Outgoing Webhook'
                    />
                }
                addLink={'/' + this.props.team.name + '/integrations/outgoing_webhooks/add'}
                emptyText={
                    <FormattedMessage
                        id='installed_outgoing_webhooks.empty'
                        defaultMessage='No outgoing webhooks found'
                    />
                }
                helpText={
                    <FormattedMessage
                        id='installed_outgoing_webhooks.help'
                        defaultMessage='Create outgoing webhook URLs for use in external integrations. Please see {link} to learn more.'
                        values={{
                            link: (
                                <a
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    href='http://docs.3ren.com/developer/webhooks-outgoing.html'
                                >
                                    <FormattedMessage
                                        id='installed_outgoing_webhooks.helpLink'
                                        defaultMessage='documentation'
                                    />
                                </a>
                            )
                        }}
                    />
                }
                searchPlaceholder={Utils.localizeMessage('installed_outgoing_webhooks.search', 'Search Outgoing Webhooks')}
                loading={this.state.loading}
            >
                {outgoingWebhooks}
            </BackstageList>
        );
    }
}
