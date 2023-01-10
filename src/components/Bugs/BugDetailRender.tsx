import * as React from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Badge, Dropdown, DropdownToggle, DropdownMenu, 
    DropdownItem, Table, Modal, ModalBody, ModalHeader, ModalFooter, Button, Alert } from 'reactstrap';
import ReactMarkdown from "react-markdown"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faCircle, faWrench, faCogs, faTimesCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import { push } from 'connected-react-router';

import { store } from '../..';
import { BugDetail, Bug, getBadgeColour } from '../../store/Bugs';
import { Spell } from '../../store/Assets';
import BugSpellDetail from './BugSpellDetail';
import './BugDetailRender.css';
import CommentsView from '../Comments/CommentsView';

type BugDetailProps =
    {
        bugDetail: BugDetail,
        bug: Bug | undefined,
        bugSpell: Spell | undefined,
        canEdit: boolean,
        isMod: boolean,
        dispatchDelete: any
    };

interface BugDetailViewState {
    actionsDropdownOpen: boolean;
    deleteModalOpen: boolean;
}

class BugDetailRender extends React.PureComponent<BugDetailProps, BugDetailViewState> {
    state = {
        actionsDropdownOpen: false,
        deleteModalOpen: false
    }

    private toggleActionsDrop() {
        this.setState({ actionsDropdownOpen: !this.state.actionsDropdownOpen });
    }

    private actionSelected(e: any) {
        console.log(e.target.value);
        switch (e.target.value) {
            case "report":
                console.log("report action selected");
                alert("Bug Reporting is coming soon!");
                break;
            case "edit":
                if (this.props.bugDetail) {
                    // navigate to edit page for the bug
                    store.dispatch(push(`/bugs/edit/${this.props.bugDetail.bugdtId}`));
                }
                break;
            default:
                console.log("noop");
        }
    }

    private getSpecEntry(spec: string) {
        switch (spec) {
            case "All":
                return <div><img className="img-circle" src="/assets/img/spec/monk.jpg" alt="Monk" /> Monk (All)</div>;
            case "Brewmaster":
                return <div><img className="img-circle" src="/assets/img/spec/brewmaster.jpg" alt="Brewmaster" /> Brewmaster</div>;
            case "Mistweaver":
                return <div><img className="img-circle" src="/assets/img/spec/mistweaver.jpg" alt="Mistweaver" /> Mistweaver</div>;
            case "Windwalker":
                return <div><img className="img-circle" src="/assets/img/spec/windwalker.jpg" alt="Windwalker" /> Windwalker</div>;
        }
    }

    private getSeverityIndicatorColour(sev: string) {
        switch (sev) {
            case "Low":
                return "#05b10585";
            case "Medium":
                return "#f3f397";
            case "Critical":
                return "rgb(236, 90, 90)";
            default:
                return "#ccc";
        }
    }

    private getStatusIcon(status: string) {
        switch (status) {
            case "Open":
                return <FontAwesomeIcon icon={faCheckCircle} />;
            case "Archived":
                return "#f3f397";
            case "Verified":
                return <FontAwesomeIcon icon={faCheckCircle} />;
            case "Closed":
                return <FontAwesomeIcon icon={faTimesCircle} />;
            case "Pending":
                return <FontAwesomeIcon icon={faTimesCircle} />;
            default:
                return "#ccc";
        }
    }

    private toggleDeleteModal()
    {
        this.setState({ deleteModalOpen: !this.state.deleteModalOpen});
    }

    public render() {
        const bd = this.props.bugDetail;
        const s = this.props.bugSpell;
        let userLink, buildString, spellId, detailsHeader, bugTags;
        const createdDate = new Date(bd.bugdtDateCreated).toDateString();
        const sevInd = <FontAwesomeIcon icon={faCircle} style={{ color: this.getSeverityIndicatorColour(bd.bugdtSeverity) }} />;
        const stInd = this.getStatusIcon(bd.bugdtStatus);
        if (this.props.bug) {
            userLink = <Link to={"/user/" + bd.bugdtSubmitter}><FontAwesomeIcon icon={faUser} /> {this.props.bug.bugUserName}</Link>;
            buildString = this.props.bug.bugBuildString;

        }
        if (bd.bugdtTags.indexOf(",") > -1) {
            bugTags = bd.bugdtTags.split(",").map((x: string) => <Badge color={getBadgeColour(x)}>{x}</Badge>)
        }
        else {
            bugTags = <Badge color={getBadgeColour(bd.bugdtTags)}>{bd.bugdtTags}</Badge>;
        }

        if (bd.bugdtContent != null && bd.bugdtContent !== "") {
            detailsHeader = "Details";
        }

        spellId = s ? s.spellIdT : "";

        let pendingInd;
        if (bd.bugdtStatus === "Pending")
            {
                pendingInd = (<Alert color="warning">This bug is pending approval from a moderator. Only you can see this bug until it is approved.</Alert>);
            }

        return (
            <React.Fragment>
                <Modal isOpen={this.state.deleteModalOpen} toggle={this.toggleDeleteModal.bind(this)}>
                    <ModalHeader toggle={this.toggleDeleteModal.bind(this)}>Confirm Bug deletion</ModalHeader>
                    <ModalBody>
                       Are you sure you wish to permanently delete this bug? <p><b>This action cannot be undone.</b></p></ModalBody>
                    <ModalFooter>
                        <Button color="danger" onClick={() => this.props.dispatchDelete(bd.bugdtId)}>Yes, delete this bug forever</Button>{' '}
                        <Button color="secondary" onClick={this.toggleDeleteModal.bind(this)}>Cancel</Button>
                    </ModalFooter>
                </Modal>
                <Row>
                    <Col md="1" sm="0"></Col>
                    <Col md="10" sm="12" className="view-bug-col">
                        {pendingInd}
                        <h3>{bd.bugdtTitle}</h3>
                        <Row>
                            <Col md="9">
                                <Row style={{ margin: '0.5rem 0.2rem 0rem 0rem' }} className="view-bug-headers">
                                    <Col md="10">
                                        <Row style={{ paddingTop: '0.5rem' }}>
                                            <Col md="3">{stInd} {bd.bugdtStatus}</Col>
                                            <Col md="3">{sevInd} {bd.bugdtSeverity}</Col>
                                            <Col md="3">{this.getSpecEntry(bd.bugdtSpec)}</Col>
                                            <Col md="3"><FontAwesomeIcon icon={faWrench} /> {bd.bugdtType}</Col>
                                        </Row>
                                    </Col>
                                    <Col md="2">
                                        <Dropdown style={{ marginLeft: '2.5rem' }}
                                            isOpen={this.state.actionsDropdownOpen} toggle={this.toggleActionsDrop.bind(this)}>
                                            <DropdownToggle className="bug-cp-dropdown-btn" caret>
                                                <FontAwesomeIcon icon={faCogs}></FontAwesomeIcon>
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <DropdownItem header>Bug Actions</DropdownItem>
                                                <DropdownItem value="report" onClick={this.actionSelected.bind(this)}>Report Bug</DropdownItem>
                                                {this.props.canEdit &&
                                                    <DropdownItem divider />
                                                }
                                                {this.props.canEdit &&
                                                    <DropdownItem value="edit" onClick={this.actionSelected.bind(this)}>Edit Bug</DropdownItem>
                                                }
                                                {this.props.canEdit &&
                                                    <DropdownItem value="delete" onClick={this.toggleDeleteModal.bind(this)}>
                                                        <span style={{ color: 'rgb(236, 90, 90)' }}>Delete Bug</span></DropdownItem>
                                                }
                                                {this.props.isMod &&
                                                    <DropdownItem divider />
                                                }
                                                {this.props.isMod &&
                                                    <DropdownItem value="flag" onClick={this.actionSelected.bind(this)}>Flag Bug</DropdownItem>
                                                }
                                            </DropdownMenu>
                                        </Dropdown>
                                    </Col>
                                </Row>
                                <hr />
                                <b>Affecting Spell:</b>
                                <BugSpellDetail spell={s} />
                                <br />
                                <h4>Description</h4>
                                {bd.bugdtDescription}
                                <p></p>
                            </Col>
                            <Col md="3">
                                <div className="bug-metadata">
                                    <Table bordered size="sm" hover dark striped>
                                        <tbody>
                                            <tr>
                                                <td>Status: </td>
                                                <td><b>{bd.bugdtStatus}</b></td>
                                            </tr>
                                            <tr>
                                                <td>Severity: </td>
                                                <td>{sevInd} {bd.bugdtSeverity}</td>
                                            </tr>
                                            <tr>
                                                <td>Type: </td>
                                                <td>{bd.bugdtType}</td>
                                            </tr>
                                            <tr>
                                                <td>User: </td>
                                                <td>{userLink}</td>
                                            </tr>
                                            <tr>
                                                <td>Date: </td>
                                                <td>{createdDate}</td>
                                            </tr>
                                            <tr>
                                                <td>Build: </td>
                                                <td>{buildString}</td>
                                            </tr>
                                            <tr>
                                                <td>Spell Id: </td>
                                                <td>{spellId}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                                <p className="view-bug-tags">{bugTags}</p>
                            </Col>
                        </Row>
                        <h4>{detailsHeader}</h4>
                        <br />
                        <ReactMarkdown source={bd.bugdtContent} />

                        <br />
                        <hr />
                        <CommentsView />
                        <br />
                        <br />
                        <Link className="btn btn-info btn-outline" to="/bugs"> &lt; Back to bugs</Link>
                    </Col>
                    <Col md="1" sm="0"></Col>
                </Row>
            </React.Fragment>
        );
    }
};

export default BugDetailRender;

