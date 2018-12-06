import {
  Col,
  Row,
  Divider,
  Icon,
  Rate,
  Avatar,
  Button,
  Input,
  Badge,
  Modal,
  Popover,
  Menu
} from 'antd';
import { FacebookShareButton, TwitterShareButton } from 'react-share';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import './Review.scss';
import axios from '../../axios_anime';
import * as endpoints from '../../constants/endpoint_constants';
import moment from 'moment';

const confirm = Modal.confirm;

class Review extends Component {
  static propTypes = {
    reviewId: PropTypes.number.isRequired,
    userData: PropTypes.object.isRequired,
    userName: PropTypes.string.isRequired,
    userId: PropTypes.number.isRequired,
    reviewTitle: PropTypes.string.isRequired,
    reviewContent: PropTypes.string.isRequired,
    reviewScore: PropTypes.number.isRequired,
    likeNo: PropTypes.number.isRequired,
    dislikeNo: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    handleEditReview: PropTypes.func.isRequired,
    handleDeleteReview: PropTypes.func.isRequired,
    votesFor: PropTypes.array.isRequired,
    tokenData: PropTypes.object.isRequired,
    isAuthenticated: PropTypes.bool.isRequired,
    animeName: PropTypes.string.isRequired,
    animeId: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      isEditFormOpen: false,
      reviewTitle: this.props.reviewTitle,
      reviewContent: this.props.reviewContent,
      reviewScore: this.props.reviewScore,
      likeNo: this.props.likeNo,
      dislikeNo: this.props.dislikeNo,
      isSaveBtnDisabled: false,
      isDeleteBtnDisabled: false,
      votesFor: this.props.votesFor.slice()
    };
  }

  handleImgError = e => {
    e.target.src = 'https://image.ibb.co/djfJJp/placeholder.png';
  };

  toText = content => {
    return <p dangerouslySetInnerHTML={{ __html: content }} />;
  };

  onTitleChange = e => {
    this.setState({
      reviewTitle: e.target.value
    });
  };

  onContentChange = e => {
    this.setState({
      reviewContent: e.target.value
    });
  };

  onStarChange = value => {
    this.setState({
      reviewScore: value
    });
  };

  handleCancelClick = () => {
    this.setState({
      isEditFormOpen: false,
      reviewTitle: this.props.reviewTitle,
      reviewContent: this.props.reviewContent,
      reviewScore: this.props.reviewScore,
      likeNo: this.state.likeNo,
      dislikeNo: this.state.dislikeNo
    });
  };

  checkUserLiked = () => {
    for (var el in this.state.votesFor) {
      if (
        this.state.votesFor[el].voter_id === this.props.userData.id &&
        this.state.votesFor[el].vote_flag === true
      ) {
        return true;
      }
    }
    return false;
  };

  checkUserDisliked = () => {
    for (var el in this.state.votesFor) {
      if (
        this.state.votesFor[el].voter_id === this.props.userData.id &&
        this.state.votesFor[el].vote_flag === false
      ) {
        return true;
      }
    }
    return false;
  };

  handleSaveClick = () => {
    if (this.state.reviewTitle === '' || this.state.reviewContent === '') {
      alert('All fields must be filled!');
    } else {
      this.setState(
        {
          isSaveBtnDisabled: true
        },
        () => {
          var review = {
            reviewId: this.props.reviewId,
            userName: this.props.userData.name,
            reviewTitle: this.state.reviewTitle,
            reviewContent: this.state.reviewContent,
            reviewScore: this.state.reviewScore,
            likeNo: this.props.likeNo,
            dislikeNo: this.props.dislikeNo
          };
          this.props.handleEditReview(review, () => {
            this.setState({
              isEditFormOpen: false,
              isSaveBtnDisabled: false
            });
          });
        }
      );
    }
  };

  handleLikeClick = e => {
    axios
      .get(endpoints.REVIEW_API + `/like?id=${this.props.reviewId}`, {
        headers: {
          'access-token': this.props.tokenData.accessToken,
          'token-type': this.props.tokenData.tokenType,
          uid: this.props.tokenData.uid,
          client: this.props.tokenData.client
        }
      })
      .then(response => {
        console.log(response);
        if (!this.checkUserLiked()) {
          console.log('liked');
          this.setState({
            votesFor: [
              ...this.state.votesFor,
              {
                voter_id: this.props.userData.id,
                vote_flag: true
              }
            ],
            likeNo: this.state.likeNo + 1
          });
          console.log(this.state.votesFor);
        } else {
          console.log('unliked');
          this.setState({
            votesFor: this.state.votesFor.filter(
              i =>
                i.voter_id !== this.props.userData.id || i.vote_flag === false
            ),
            likeNo: this.state.likeNo - 1
          });
          console.log(this.state.votesFor);
        }
      });
  };

  handleDislikeClick = e => {
    axios
      .get(endpoints.REVIEW_API + `/dislike?id=${this.props.reviewId}`, {
        headers: {
          'access-token': this.props.tokenData.accessToken,
          'token-type': this.props.tokenData.tokenType,
          uid: this.props.tokenData.uid,
          client: this.props.tokenData.client
        }
      })
      .then(response => {
        console.log(response);
        if (!this.checkUserDisliked()) {
          console.log('disliked');
          this.setState({
            votesFor: [
              ...this.state.votesFor,
              {
                voter_id: this.props.userData.id,
                vote_flag: false
              }
            ],
            dislikeNo: this.state.dislikeNo + 1
          });
          console.log(this.state.votesFor);
        } else {
          console.log('undisliked');
          this.setState({
            votesFor: this.state.votesFor.filter(
              i => i.voter_id !== this.props.userData.id || i.vote_flag === true
            ),
            dislikeNo: this.state.dislikeNo - 1
          });
          console.log(this.state.votesFor);
        }
      });
  };

  handleDeleteClick = e => {
    var review = {
      reviewId: this.props.reviewId,
      userName: this.props.userName,
      reviewTitle: this.state.reviewTitle,
      reviewContent: this.state.reviewContent,
      reviewScore: this.state.reviewScore,
      likeNo: this.state.likeNo,
      dislikeNo: this.state.dislikeNo
    };
    this.setState(
      {
        isDeleteBtnDisabled: true
      },
      () => {
        this.props.handleDeleteReview(review, () => {
          this.setState({
            isDeleteBtnDisabled: false
          });
        });
      }
    );
  };

  handleEditClick = e => {
    if (this.state.isEditFormOpen) {
      this.setState({
        isEditFormOpen: false
      });
    } else {
      this.setState({
        isEditFormOpen: true
      });
    }
  };

  showDeleteConfirm = () => {
    var context = this;
    confirm({
      title: 'Are you sure you want to delete this review?',
      content: 'Deleted reviews cannot be restored',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        context.handleDeleteClick();
      },
      onCancel() {}
    });
  };

  showEditConfirm = () => {
    var context = this;
    confirm({
      title: 'Are you sure you want to edit this review?',
      content: 'Edited changes cannot be reverted',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        context.handleSaveClick();
      },
      onCancel() {}
    });
  };

  parseDate = date => {
    var momentDate = moment(date);
    return momentDate.toDate().toDateString();
  };

  render() {
    const {
      reviewTitle,
      reviewContent,
      likeNo,
      dislikeNo,
      reviewScore
    } = this.state;
    const { userData, userName, userId, createdAt } = this.props;
    if (!this.state.isEditFormOpen) {
      return (
        <div className="Review" style={{ width: '100%' }}>
          <Row>
            <Col span={4}>
              <div style={{ width: '100%', textAlign: 'center' }}>
                <StyledAvatar
                  size={100}
                  style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}
                >
                  <span style={{ fontSize: '40px' }}>
                    {userName != null && userName.charAt(0).toUpperCase()}
                  </span>
                </StyledAvatar>
              </div>
              &nbsp;
              <div style={{ textAlign: 'center', fontSize: 'calc(1.5vw)' }}>
                {userName}
              </div>
            </Col>
            <Col span={19} offset={1}>
              <Row>
                <Col span={14}>
                  <div className="ReviewTitle">{reviewTitle}</div>
                </Col>
                <Col span={9} offset={1}>
                  <div
                    className="ReviewRating"
                    style={{
                      fontSize: 'calc(1.5vw)',
                      lineHeight: '0.5',
                      position: 'absolute',
                      right: '0',
                      display: 'inline-flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Rate
                      style={{ fontSize: 'calc(1.5vw)' }}
                      disabled
                      allowHalf
                      defaultValue={reviewScore}
                    />
                    &nbsp;
                    <span>{parseFloat(reviewScore).toFixed(1)}</span>
                  </div>
                </Col>
              </Row>
              <StyledDivider />
              <div style={{ minHeight: '100px' }} className="ReviewContent">
                {reviewContent}
              </div>
              &nbsp;
              <div style={{ marginTop: '15px' }}>
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Badge count={likeNo} style={{ backgroundColor: '#52c41a' }}>
                    <LikeButton
                      shape="circle"
                      onClick={this.handleLikeClick}
                      disabled={
                        !this.props.isAuthenticated || this.checkUserDisliked()
                      }
                    >
                      <LikeIcon type="like" theme="filled" />
                    </LikeButton>
                  </Badge>
                </div>
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: '20px'
                  }}
                >
                  <Badge count={dislikeNo}>
                    <DislikeButton
                      shape="circle"
                      onClick={this.handleDislikeClick}
                      disabled={
                        !this.props.isAuthenticated || this.checkUserLiked()
                      }
                    >
                      <DislikeIcon type="dislike" theme="filled" />
                    </DislikeButton>
                  </Badge>
                </div>
                {userId === userData.id && (
                  <span>
                    <div
                      style={{
                        position: 'relative',
                        display: 'inline-flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: '20px'
                      }}
                    >
                      <Button
                        type="primary"
                        disabled={this.state.isDeleteBtnDisabled}
                        onClick={this.handleEditClick}
                        shape="circle"
                        icon="form"
                      />
                    </div>
                    <div
                      style={{
                        position: 'relative',
                        display: 'inline-flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: '20px'
                      }}
                    >
                      <Button
                        type="danger"
                        disabled={this.state.isSaveBtnDisabled}
                        loading={this.state.isDeleteBtnDisabled}
                        onClick={this.showDeleteConfirm}
                        shape="circle"
                        icon="delete"
                      />
                    </div>
                    <div
                      style={{
                        position: 'relative',
                        display: 'inline-flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: '20px'
                      }}
                    >
                      <Popover
                        title="Share on"
                        content={
                          <div>
                            <FacebookShareButton
                              url={`${window.location.origin}/anime/${
                                this.props.animeId
                              }`}
                              quote={`Check out my review of ${
                                this.props.animeName
                              }: ${this.state.reviewTitle}`}
                              style={{ cursor: 'pointer' }}
                            >
                              <Icon type="facebook" /> Facebook
                            </FacebookShareButton>
                            <StyledDivider />
                            <TwitterShareButton
                              url={`${window.location.origin}/anime/${
                                this.props.animeId
                              }`}
                              quote={`Check out my review of ${
                                this.props.animeName
                              }: ${this.state.reviewTitle}`}
                              style={{ cursor: 'pointer' }}
                            >
                              <Icon type="twitter" /> Twitter
                            </TwitterShareButton>
                          </div>
                        }
                      >
                        <Button icon="share-alt" shape="circle" />
                      </Popover>
                    </div>
                  </span>
                )}
                <Metadata>
                  <Icon type="edit" />
                  &nbsp;
                  {this.parseDate(createdAt)}
                </Metadata>
              </div>
            </Col>
          </Row>
        </div>
      );
    } else {
      return (
        <div className="EditForm" style={{ width: '100%' }}>
          <Row>
            <Col span={4}>
              <div style={{ width: '100%', textAlign: 'center' }}>
                <StyledAvatar
                  size={100}
                  style={{ color: '#f56a00', backgroundColor: '#fde3cf' }}
                >
                  <span style={{ fontSize: '40px' }}>
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </StyledAvatar>
              </div>
              &nbsp;
              <div style={{ textAlign: 'center', fontSize: 'calc(1.5vw)' }}>
                {userName}
              </div>
            </Col>
            <Col span={19} offset={1}>
              Rating: &nbsp;
              <div
                className="ReviewFormRating"
                style={{
                  lineHeight: '0.5',
                  position: 'relative',
                  right: '0',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Rate
                  allowHalf
                  onChange={this.onStarChange}
                  value={reviewScore}
                />
                &nbsp;
                <span>{reviewScore} star(s)</span>
              </div>
              <StyledDivider />
              <span className="ReviewFormTitle">
                <Input
                  placeholder="Enter review's title"
                  value={reviewTitle}
                  onChange={this.onTitleChange}
                />
              </span>
              <StyledDivider />
              <div style={{ minHeight: '100px' }} className="ReviewFormContent">
                <Input.TextArea
                  placeholder="Enter review's content"
                  value={reviewContent}
                  onChange={this.onContentChange}
                />
              </div>
              <div>
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Button
                    type="primary"
                    loading={this.state.isSaveBtnDisabled}
                    onClick={this.showEditConfirm}
                    icon="save"
                  >
                    Save
                  </Button>
                </div>
                <div
                  style={{
                    position: 'relative',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: '20px'
                  }}
                >
                  <Button
                    disabled={this.state.isSaveBtnDisabled}
                    onClick={this.handleCancelClick}
                    icon="close"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      );
    }
  }
}

const StyledAvatar = styled(Avatar)`
  &:hover {
    cursor: pointer;
  }
`;

const StyledDivider = styled(Divider)`
  margin-top: 8px !important;
  margin-bottom: 8px !important;
`;

const Metadata = styled.span`
  color: grey;
  font-style: italic;
  font-size: 13px;
  text-align: right;
  position: absolute;
  right: 0;
`;

const LikeIcon = styled(Icon)``;

const DislikeIcon = styled(Icon)``;

const LikeButton = styled(Button)``;

const DislikeButton = styled(Button)``;

const mapStateToProps = state => {
  return {
    userData: state.auth.userData,
    tokenData: state.auth.tokenData,
    isAuthenticated: state.auth.isAuthenticated
  };
};

export default connect(
  mapStateToProps,
  null
)(Review);
