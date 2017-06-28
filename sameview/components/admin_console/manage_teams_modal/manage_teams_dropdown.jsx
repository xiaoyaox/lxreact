// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {Dropdown, MenuItem} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {updateTeamMemberRoles, removeUserFromTeam} from 'actions/team_actions.jsx';

import * as Utils from 'utils/utils.jsx';

export default class ManageTeamsDropdown extends React.Component {
    static propTypes = {
        user: React.PropTypes.object.isRequired,
        teamMember: React.PropTypes.object.isRequired,
        onError: React.PropTypes.func.isRequired,
        onMemberChange: React.PropTypes.func.isRequired,
        onMemberRemove: React.PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.toggleDropdown = this.toggleDropdown.bind(this);

        this.makeTeamAdmin = this.makeTeamAdmin.bind(this);
        this.makeMember = this.makeMember.bind(this);
        this.removeFromTeam = this.removeFromTeam.bind(this);

        this.handleMemberChange = this.handleMemberChange.bind(this);
        this.handleMemberRemove = this.handleMemberRemove.bind(this);

        this.state = {
            show: false
        };
    }

    toggleDropdown() {
        this.setState({
            show: !this.state.show
        });
    }

    makeTeamAdmin() {
        updateTeamMemberRoles(
            this.props.teamMember.team_id,
            this.props.user.id,
            'team_user team_admin',
            this.handleMemberChange,
            this.props.onError
        );
    }

    makeMember() {
        updateTeamMemberRoles(
            this.props.teamMember.team_id,
            this.props.user.id,
            'team_user',
            this.handleMemberChange,
            this.props.onError
        );
    }

    removeFromTeam() {
        removeUserFromTeam(
            this.props.teamMember.team_id,
            this.props.user.id,
            this.handleMemberRemove,
            this.props.onError
        );
    }

    handleMemberChange() {
        this.props.onMemberChange(this.props.teamMember.team_id);
    }

    handleMemberRemove() {
        this.props.onMemberRemove(this.props.teamMember.team_id);
    }

    render() {
        const isTeamAdmin = Utils.isAdmin(this.props.teamMember.roles);

        let title;
        if (isTeamAdmin) {
            title = Utils.localizeMessage('admin.user_item.teamAdmin', '团队管理员');
        } else {
            title = Utils.localizeMessage('admin.user_item.teamMember', '成员');
        }

        let makeTeamAdmin = null;
        if (!isTeamAdmin) {
            makeTeamAdmin = (
                <MenuItem onSelect={this.makeTeamAdmin}>
                    <FormattedMessage
                        id='admin.user_item.makeTeamAdmin'
                        defaultMessage='Make Team Admin'
                    />
                </MenuItem>
            );
        }

        let makeMember = null;
        if (isTeamAdmin) {
            makeMember = (
                <MenuItem onSelect={this.makeMember}>
                    <FormattedMessage
                        id='admin.user_item.makeMember'
                        defaultMessage='Make Member'
                    />
                </MenuItem>
            );
        }

        return (
            <Dropdown
                id={`manage-teams-${this.props.user.id}-${this.props.teamMember.team_id}`}
                open={this.state.show}
                onToggle={this.toggleDropdown}
            >
                <Dropdown.Toggle useAnchor={true}>
                    {title}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {makeTeamAdmin}
                    {makeMember}
                    <MenuItem onSelect={this.removeFromTeam}>
                        <FormattedMessage
                            id='team_members_dropdown.leave_team'
                            defaultMessage='Remove from Team'
                        />
                    </MenuItem>
                </Dropdown.Menu>
            </Dropdown>
        );
    }
}
