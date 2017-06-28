// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';

import OpenGraphStore from 'stores/opengraph_store.jsx';
import * as Utils from 'utils/utils.jsx';
import * as CommonUtils from 'utils/commons.jsx';
import {requestOpenGraphMetadata} from 'actions/global_actions.jsx';

export default class PostAttachmentOpenGraph extends React.Component {
    constructor(props) {
        super(props);
        this.largeImageMinWidth = 150;
        this.imageDimentions = {  // Image dimentions in pixels.
            height: 80,
            width: 80
        };
        this.textMaxLenght = 300;
        this.textEllipsis = '...';
        this.largeImageMinRatio = 16 / 9;
        this.smallImageContainerLeftPadding = 15;

        this.imageRatio = null;

        this.smallImageContainer = null;
        this.smallImageElement = null;

        this.fetchData = this.fetchData.bind(this);
        this.onOpenGraphMetadataChange = this.onOpenGraphMetadataChange.bind(this);
        this.toggleImageVisibility = this.toggleImageVisibility.bind(this);
        this.onImageLoad = this.onImageLoad.bind(this);
        this.onImageError = this.onImageError.bind(this);
        this.truncateText = this.truncateText.bind(this);
    }

    IMAGE_LOADED = {
        LOADING: 'loading',
        YES: 'yes',
        ERROR: 'error'
    }

    componentWillMount() {
        this.setState({
            data: {},
            imageLoaded: this.IMAGE_LOADED.LOADING,
            imageVisible: this.props.previewCollapsed.startsWith('false'),
            hasLargeImage: false
        });
        this.fetchData(this.props.link);
    }

    componentWillReceiveProps(nextProps) {
        if (!Utils.areObjectsEqual(nextProps.link, this.props.link)) {
            this.fetchData(nextProps.link);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.imageVisible !== this.state.imageVisible) {
            return true;
        }
        if (nextState.hasLargeImage !== this.state.hasLargeImage) {
            return true;
        }
        if (nextState.imageLoaded !== this.state.imageLoaded) {
            return true;
        }
        if (!Utils.areObjectsEqual(nextState.data, this.state.data)) {
            return true;
        }
        return false;
    }

    componentDidMount() {
        OpenGraphStore.addUrlDataChangeListener(this.onOpenGraphMetadataChange);
    }

    componentDidUpdate() {
        if (this.props.childComponentDidUpdateFunction) {
            this.props.childComponentDidUpdateFunction();
        }
    }

    componentWillUnmount() {
        OpenGraphStore.removeUrlDataChangeListener(this.onOpenGraphMetadataChange);
    }

    onOpenGraphMetadataChange(url) {
        if (url === this.props.link) {
            this.fetchData(url);
        }
    }

    fetchData(url) {
        const data = OpenGraphStore.getOgInfo(url);
        this.setState({data, imageLoaded: this.IMAGE_LOADED.LOADING});
        if (Utils.isEmptyObject(data)) {
            requestOpenGraphMetadata(url);
        }
    }

    getBestImageUrl() {
        if (Utils.isEmptyObject(this.state.data.images)) {
            return null;
        }

        const bestImage = CommonUtils.getNearestPoint(this.imageDimentions, this.state.data.images, 'width', 'height');
        return bestImage.secure_url || bestImage.url;
    }

    toggleImageVisibility() {
        this.setState({imageVisible: !this.state.imageVisible});
    }

    onImageLoad(image) {
        this.imageRatio = image.target.naturalWidth / image.target.naturalHeight;
        if (
            image.target.naturalWidth >= this.largeImageMinWidth &&
            this.imageRatio >= this.largeImageMinRatio &&
            !this.state.hasLargeImage
        ) {
            this.setState({
                hasLargeImage: true
            });
        }
        this.setState({
            imageLoaded: this.IMAGE_LOADED.YES
        });
    }

    onImageError() {
        this.setState({imageLoaded: this.IMAGE_LOADED.ERROR});
    }

    loadImage(src) {
        const img = new Image();
        img.onload = this.onImageLoad;
        img.onerror = this.onImageError;
        img.src = src;
    }

    imageToggleAnchoreTag(imageUrl) {
        if (imageUrl && this.state.hasLargeImage) {
            return (
                <a
                    className={'post__embed-visibility'}
                    data-expanded={this.state.imageVisible}
                    aria-label='Toggle Embed Visibility'
                    onClick={this.toggleImageVisibility}
                />
            );
        }
        return null;
    }

    wrapInSmallImageContainer(imageElement) {
        return (
            <div
                className='attachment__image__container--openraph'
                ref={(div) => {
                    this.smallImageContainer = div;
                }}
            >
                {imageElement}
            </div>
        );
    }

    imageTag(imageUrl, renderingForLargeImage = false) {
        var element = null;
        if (
            imageUrl && renderingForLargeImage === this.state.hasLargeImage &&
            (!renderingForLargeImage || (renderingForLargeImage && this.state.imageVisible))
        ) {
            if (this.state.imageLoaded === this.IMAGE_LOADED.LOADING) {
                if (renderingForLargeImage) {
                    element = <img className={'attachment__image attachment__image--openraph loading large_image'}/>;
                } else {
                    element = this.wrapInSmallImageContainer(
                        <img className={'attachment__image attachment__image--openraph loading '}/>
                    );
                }
            } else if (this.state.imageLoaded === this.IMAGE_LOADED.YES) {
                if (renderingForLargeImage) {
                    element = (
                        <img
                            className={'attachment__image attachment__image--openraph large_image'}
                            src={imageUrl}
                        />
                    );
                } else {
                    element = this.wrapInSmallImageContainer(
                        <img
                            className={'attachment__image attachment__image--openraph'}
                            src={imageUrl}
                            ref={(img) => {
                                this.smallImageElement = img;
                            }}
                        />
                    );
                }
            } else if (this.state.imageLoaded === this.IMAGE_LOADED.ERROR) {
                return null;
            }
        }
        return element;
    }

    truncateText(text, maxLength = this.textMaxLenght, ellipsis = this.textEllipsis) {
        if (text.length > maxLength) {
            return text.substring(0, maxLength - ellipsis.length) + ellipsis;
        }
        return text;
    }

    render() {
        if (Utils.isEmptyObject(this.state.data) || Utils.isEmptyObject(this.state.data.description)) {
            return null;
        }

        const data = this.state.data;
        const imageUrl = this.getBestImageUrl();

        if (imageUrl) {
            this.loadImage(imageUrl);
        }

        return (
            <div
                className='attachment attachment--opengraph'
                ref='attachment'
            >
                <div className='attachment__content'>
                    <div
                        className={'clearfix attachment__container attachment__container--opengraph'}
                    >
                        <div
                            className={'attachment__body__wrap attachment__body__wrap--opengraph'}
                        >
                            <span className='sitename'>{this.truncateText(data.site_name)}</span>
                            <h1
                                className={'attachment__title attachment__title--opengraph' + (data.title ? '' : ' is-url')}
                            >
                                <a
                                    className='attachment__title-link attachment__title-link--opengraph'
                                    href={data.url || this.props.link}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    title={data.title || data.url || this.props.link}
                                >
                                    {this.truncateText(data.title || data.url || this.props.link)}
                                </a>
                            </h1>
                            <div >
                                <div
                                    className={'attachment__body attachment__body--opengraph'}
                                >
                                    <div>
                                        <div>
                                            {this.truncateText(data.description)} &nbsp;
                                            {this.imageToggleAnchoreTag(imageUrl)}
                                        </div>
                                        {this.imageTag(imageUrl, true)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {this.imageTag(imageUrl, false)}
                    </div>
                </div>
            </div>
        );
    }
}

PostAttachmentOpenGraph.defaultProps = {
    previewCollapsed: 'false'
};

PostAttachmentOpenGraph.propTypes = {
    link: React.PropTypes.string.isRequired,
    childComponentDidUpdateFunction: React.PropTypes.func,
    previewCollapsed: React.PropTypes.string
};
