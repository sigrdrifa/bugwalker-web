import * as React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, CardBody, Button } from 'reactstrap';
import ReactMarkdown from "react-markdown"
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faEdit, faFlag } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';

import { ApplicationState } from '../../store';
import * as BugsStore from '../../store/Bugs';
import * as CommentsStore from '../../store/Comments';
import * as UserStore from '../../store/User';
import './CommentsView.css';

type CommentsViewProps =
    BugsStore.BugsState
    & CommentsStore.CommentsState
    & UserStore.UserState
    & typeof CommentsStore.actionCreators;

type CommentsViewState = {
    numberOfCommentsToShow: number;
    localCommentText: string;
    localCommentTabSelected?: "write" | "preview" | undefined;
    shouldShowNewComment: boolean;
    submitPrepareErr: string;
}

class CommentsView extends React.PureComponent<CommentsViewProps, CommentsViewState> {
    state = {
        numberOfCommentsToShow: 10,
        localCommentText: "",
        localCommentTabSelected: undefined,
        shouldShowNewComment: true,
        submitPrepareErr: ""
    }

    public componentDidUpdate(prevProps: CommentsViewProps) {
        if (this.props.bugDetail && prevProps.bugDetail
            && this.props.bugDetail.bugdtId !== prevProps.bugDetail.bugdtId) {
            this.props.requestComments(this.props.bugDetail.bugdtId);
        }

        if (prevProps.isSubmitting === true && this.props.isSubmitting === false) {
            if (this.props.bugDetail) {
                this.props.requestComments(this.props.bugDetail.bugdtId);
            }
        }
    }

    public componentDidMount() {
        if (this.props.bugDetail) {
            this.props.requestComments(this.props.bugDetail.bugdtId);
        }
    }

    private ShowMoreComments() {
        this.setState({
            numberOfCommentsToShow: this.state.numberOfCommentsToShow + 10
        });
    }

    private handleEditorChange(so: string) {
        this.setState({ localCommentText: so });
    }

    private onEditorTabChange(t: any) {
        console.log("oneditortabchange");
        this.setState({ localCommentTabSelected: t });
    }

    private validateCommentText() {
        const t = this.state.localCommentText;

        if (t === undefined || t === "") {
            return "Please enter some comment text.";
        }
        else {
            if (t.length > 1000) {
                return "Comments must be less than 1000 character(s)."
            }
        }
        return "";
    }

    private submitComment() {
        if (!this.props.bugDetail) {
            this.setState({
                submitPrepareErr: "No bug selected"
            });
            return;
        }
        if (!this.props.au || !UserStore.isUserRoleValid(this.props.au.auRole)) {
            this.setState({
                submitPrepareErr: "Not logged in"
            });
            return;
        }
        const c: CommentsStore.Comment = {
            cId: -1,
            cBugId: this.props.bugDetail ? this.props.bugDetail.bugdtId : -1,
            cCreatedTime: "now",
            cModifiedTime: "now",
            cStatus: 1,
            cUserId: this.props.au ? this.props.au.auId : -1,
            cUserAvatar: -1,
            cUserName: "",
            cBody: this.state.localCommentText,
            cUserRole: -1
        };

        this.props.submitComment(c);
        this.setState({
            shouldShowNewComment: true,
            submitPrepareErr: "",
            localCommentText: "",
            localCommentTabSelected: "write"
        });
    }

    private addNewCommentClicked() {
        this.setState({ shouldShowNewComment: !this.state.shouldShowNewComment });
    }

    private GenerateComment(c: CommentsStore.Comment) {
        let canEditComment = false;
        if (this.props.au) {
            canEditComment = UserStore.isUserRoleMod(this.props.au.auRole);
            canEditComment = canEditComment || this.props.au.auId === c.cUserId;
        }
        return (<Card className="comment-card">
            <CardBody>
                <Row>
                    <Col md="1" sm="3" xs="4" className="comment-user-col" style={{ minWidth: '80px'}}>
                        <img
                            className="user-comment-avatar img-circle"
                            src={`/assets/img/avatars/avatar${c.cUserAvatar}.jpg`}
                            alt="Avatar" />
                        <p><Link className={"comment-user-name user-role-" +
                            UserStore.getUserRoleTag(c.cUserRole).toLowerCase()}
                            to={"/user/" + c.cUserId}>{c.cUserName}</Link></p>
                       
                    </Col>
                    <Col md="11" sm="9" xs="8">
                        <div className="comment-cp-panel">
                            <ul><li>{c.cModifiedTime}</li>
                                <li><Button alt="Report this comment" className="btn-sm" onClick={() => alert("Comment reporting is coming soon!")}><FontAwesomeIcon icon={faFlag}></FontAwesomeIcon></Button></li>
                                {canEditComment &&
                                    <li><Button className="btn-sm" onClick={() => alert("Comment editing is coming soon!")}><FontAwesomeIcon icon={faEdit}></FontAwesomeIcon></Button></li>
                                }
                                {canEditComment &&
                                    <li><Button className="btn-sm delete-btn" onClick={() => alert("Comment deleting is coming soon!")}><FontAwesomeIcon icon={faTrash}></FontAwesomeIcon></Button></li>
                                }
                            </ul>
                        </div>
                        <div className="comment-body">
                            <ReactMarkdown source={c.cBody} />
                        </div>
                    </Col>
                </Row>
            </CardBody>
        </Card>)
    }

    public render() {
        let comments;
        if (this.props.comments.length > 0 && !this.props.isFetching
            && this.props.bugDetail && this.props.bugDetail.bugdtId === this.props.bugId) {
                const sliceIdx = (this.props.comments.length - this.state.numberOfCommentsToShow) > 0 ? this.props.comments.length - this.state.numberOfCommentsToShow : 0;
                comments =
                    this.props.comments
                        .slice(sliceIdx, this.props.comments.length)
                        .map((x: CommentsStore.Comment) => this.GenerateComment(x));
        }
        const showMoreCommentsBtn = this.props.comments.length > this.state.numberOfCommentsToShow;
        const showNewCommentBtn = this.state.shouldShowNewComment && this.props.au && UserStore.isUserRoleInit(this.props.au.auRole);
        const showPostNewComment = !this.state.shouldShowNewComment && this.props.au && UserStore.isUserRoleInit(this.props.au.auRole);
        const validationMsg = this.validateCommentText();
        const fetching = this.props.isFetching;
        const commentSubmitEnabled = showPostNewComment && validationMsg === "";

        return (
            <React.Fragment>
                {fetching &&
                    <p>Loading comments...</p>
                }
                {!fetching &&
                    <div className="comments-view">
                        {showMoreCommentsBtn &&
                            <Button outline color="primary" style={{ marginBottom: '1rem' }} className="btn-block" onClick={this.ShowMoreComments.bind(this)}>Load older comments</Button>
                        }
                        {comments}
                    </div>
                }
                {
                    showNewCommentBtn &&
                    <Button id="latest-comment" outline color="primary" className="btn-block" onClick={this.addNewCommentClicked.bind(this)}>Add new Comment</Button>
                }
                {
                    showPostNewComment &&
                    <div className="post-new-comment">
                        <h4>Post Comment</h4>
                        <ReactMde
                            minEditorHeight={250}
                            value={this.state.localCommentText}
                            onChange={this.handleEditorChange.bind(this)}
                            onTabChange={this.onEditorTabChange.bind(this)}
                            selectedTab={this.state.localCommentTabSelected}
                            generateMarkdownPreview={(markdown) =>
                                Promise.resolve(<ReactMarkdown source={markdown} />)}
                        />
                        <br />
                        <Button disabled={!commentSubmitEnabled} onClick={this.submitComment.bind(this)} primary style={{ backgroundColor: 'rgb(27, 109, 133)' }}>Post Comment</Button>
                        {this.state.submitPrepareErr}
                        {validationMsg.length > 0 &&
                            <div className="submit-invalid-feedback">{validationMsg}</div>
                        }
                    </div>
                }
            </React.Fragment >
        );
    }
};

export default connect(
    (state: ApplicationState) => { return { ...state.comments, ...state.bugs, ...state.user } },
    CommentsStore.actionCreators
)(CommentsView as any);

