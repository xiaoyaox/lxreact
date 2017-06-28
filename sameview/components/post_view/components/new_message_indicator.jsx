// Copyright (c) 2016-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class NewMessageIndicator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            rendered: false
        };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.newMessages > 0) {
            this.setState({rendered: true}, () => {
                this.setState({visible: true});
            });
        } else {
            this.setState({visible: false});
        }
    }
    render() {
        let className = 'new-messages__button';
        if (this.state.visible > 0) {
            className += ' visible';
        }
        if (!this.state.rendered) {
            className += ' disabled';
        }
        return (
            <div
                className={className}
                onTransitionEnd={this.setRendered.bind(this)}
                ref='indicator'
            >
                <div onClick={this.props.onClick}>
                    <i
                        className='fa fa-angle-down'
                    />
                    <FormattedMessage
                        id='posts_view.newMsgBelow'
                        defaultMessage='New {count, plural, one {message} other {messages}} below'
                        values={{count: this.props.newMessages}}
                    />
                </div>
            </div>
        );
    }

    // Sync 'rendered' state with visibility param, only after transitions
    // have ended
    setRendered() {
        this.setState({rendered: this.state.visible});
    }
}
NewMessageIndicator.defaultProps = {
    newMessages: 0
};

NewMessageIndicator.propTypes = {
    onClick: React.PropTypes.func.isRequired,
    newMessages: React.PropTypes.number
};
