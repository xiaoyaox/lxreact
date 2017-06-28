// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.
import ProfilePopover from './profile_popover.jsx';
import * as Utils from 'utils/utils.jsx';
import Client from 'client/web_client.jsx';

import React from 'react';
import StatusIcon from './status_icon.jsx';
import {OverlayTrigger} from 'react-bootstrap';

export default class ProfilePicture extends React.Component {
    constructor(props) {
        super(props);

        this.hideProfilePopover = this.hideProfilePopover.bind(this);
    }
    shouldComponentUpdate(nextProps) {
        if (!Utils.areObjectsEqual(nextProps.user, this.props.user)) {
            return true;
        }

        if (nextProps.src !== this.props.src) {
            return true;
        }

        if (nextProps.status !== this.props.status) {
            return true;
        }

        if (nextProps.width !== this.props.width) {
            return true;
        }

        if (nextProps.height !== this.props.height) {
            return true;
        }

        if (nextProps.isBusy !== this.props.isBusy) {
            return true;
        }

        return false;
    }

    hideProfilePopover() {
        this.refs.overlay.hide();
    }

    render() {
        // <img
        //     className='more-modal__image'
        //     width={this.props.width}
        //     height={this.props.width}
        //     src={this.props.src}
        // />
        if (this.props.user) {
            return (
                <OverlayTrigger
                    ref='overlay'
                    trigger='click'
                    placement='right'
                    rootClose={true}
                    overlay={
                        <ProfilePopover
                            user={this.props.user}
                            src={this.props.src}
                            status={this.props.status}
                            isBusy={this.props.isBusy}
                            hide={this.hideProfilePopover}
                        />
                }
                >
                    <span className='status-wrapper'>
                            <img
                                className='more-modal__image'
                                width={this.props.width}
                                height={this.props.width}
                                src={Client.getUsersRoute() + '/' + this.props.user.id + '/image?time=' + this.props.user.last_picture_update}
                            />
                        <StatusIcon status={this.props.status}/>
                    </span>
                </OverlayTrigger>
            );
        }
        return (
            <span className='status-wrapper'>
                <img
                    className='more-modal__image'
                    width={this.props.width}
                    height={this.props.width}
                    src={this.props.src}
                />
                <StatusIcon status={this.props.status}/>
            </span>
        );
    }
}

ProfilePicture.defaultProps = {
    width: '36',
    height: '36'
};
ProfilePicture.propTypes = {
    src: React.PropTypes.string.isRequired,
    status: React.PropTypes.string,
    width: React.PropTypes.string,
    height: React.PropTypes.string,
    user: React.PropTypes.object,
    isBusy: React.PropTypes.bool
};
