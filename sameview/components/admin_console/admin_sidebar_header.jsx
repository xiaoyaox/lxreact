// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import $ from 'jquery';
import AdminNavbarDropdown from './admin_navbar_dropdown.jsx';
import UserStore from 'stores/user_store.jsx';
import Client from 'client/web_client.jsx';

import {FormattedMessage} from 'react-intl';

import React from 'react';

export default class SidebarHeader extends React.Component {
    constructor(props) {
        super(props);

        this.toggleDropdown = this.toggleDropdown.bind(this);

        this.state = {};
    }

    toggleDropdown(e) {
        e.preventDefault();

        if (this.refs.dropdown.blockToggle) {
            this.refs.dropdown.blockToggle = false;
            return;
        }

        $('.team__header').find('.dropdown-toggle').dropdown('toggle');
    }

    render() {
        var me = UserStore.getCurrentUser();
        var profilePicture = null;

        if (!me) {
            return null;
        }
        //src = Client.getUsersRoute() + '/' + me.id + '/image?time=' + me.last_picture_update
        if (me.last_picture_update) {
            profilePicture = (
                <img
                    className='user__picture'
                    src={Client.getUsersRoute() + '/' + me.id + '/image?time=' + me.last_picture_update}
                />
            );
            // if (me.last_picture_update) {
            //     profilePicture = (
            //         <img
            //             className='user__picture'
            //             src={Client.getPublicPictureUrl()}
            //         />
            //     );
        }else if(me.last_picture_update==0){
          profilePicture = (
              <img
                  className='user__picture'
                  src={Client.getUsersRoute() + '/' + me.id + '/image?time=' + me.last_picture_update}
              />
          );
        }

        return (
            <div className='team__header theme'>
                <a
                    href='#'
                    onClick={this.toggleDropdown}
                >
                    {profilePicture}
                    <div className='header__info'>
                        <div className='user__name'>{'@' + me.username}</div>
                        <div className='team__name'>
                            <FormattedMessage
                                id='admin.sidebarHeader.systemConsole'
                                defaultMessage='System Console'
                            />
                        </div>
                    </div>
                </a>
                <AdminNavbarDropdown ref='dropdown'/>
            </div>
        );
    }
}
