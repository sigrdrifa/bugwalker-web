import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import {
    Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
    Form, FormGroup, Input, InputGroup, InputGroupAddon, InputGroupText
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle, faFilter, faCircle } from '@fortawesome/free-solid-svg-icons'

import { ApplicationState } from '../../store';
import * as BugsStore from '../../store/Bugs';
import './BugsViewControlPanel.css';

interface BugViewControlPanelFunctionProps {
    setFilter: (col: string, filter: string) => void;
}

type BugsViewControlPanelProps =
    BugsStore.BugsState
    & typeof BugsStore.actionCreators
    & RouteComponentProps<{}>;

interface BugViewControlPanelState {
    statusDropdownOpen: boolean;
    specDropdownOpen: boolean;
    sevDropdownOpen: boolean;
    selectedSpec: string;
    selectedStatus: string;
    selectedSev: string;
    localTitle: string;
}


class BugsViewControlPanel extends React.PureComponent<BugsViewControlPanelProps, BugViewControlPanelState> {

    state = {
        statusDropdownOpen: false,
        specDropdownOpen: false,
        sevDropdownOpen: false,
        selectedSpec: "Monk",
        selectedStatus: "Open",
        localTitle: "",
        selectedSev: "All"
    }

    public render() {
        return (
            <React.Fragment>
                {this.renderControlPanel()}
            </React.Fragment>
        );
    }

    private toggleStatusDrop() {
        this.setState({ statusDropdownOpen: !this.state.statusDropdownOpen });
    }

    private toggleSpecDrop() {
        this.setState({ specDropdownOpen: !this.state.specDropdownOpen });
    }

    private toggleSevDrop() {
        this.setState({ sevDropdownOpen: !this.state.sevDropdownOpen });
    }

    private fetchBugs() {
        this.props.requestBugs(0);
    }

    private getSpecIndicator(spec: string) {
        if (spec === "Monk") {
            return <img className="img-circle" src="/assets/img/spec/monk.jpg" alt="Monk" />;
        }
        let s = spec.toLowerCase();
        return <img className="img-circle" src={"/assets/img/spec/" + s + ".jpg"} alt={spec} />;
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
                return "#1b6d85";
        }
    }

    private specChanged(e: any) {
        e.preventDefault();
        console.log(e.target.value);

        if (e.target.value !== this.props.bugFilterState.bugSpecFilter) {
            // Trigger filter update
            this.props.setBugFilter({
                ...this.props.bugFilterState,
                bugSpecFilter: e.target.value
            });
        }

        this.setState({ selectedSpec: e.target.value });
    }

    private sevChanged(e: any) {
        e.preventDefault();
        console.log(e.target.value);

        if (e.target.value !== this.props.bugFilterState.bugSevFilter) {
            // Trigger filter update
            this.props.setBugFilter({
                ...this.props.bugFilterState,
                bugSevFilter: e.target.value
            });
        }

        this.setState({ selectedSev: e.target.value });
    }
    private statusChanged(e: any) {

        if (e.target.value !== this.props.bugFilterState.bugStatusFilter)
            this.props.setBugFilter({
                ...this.props.bugFilterState,
                bugStatusFilter: e.target.value
            });

        this.setState({ selectedStatus: e.target.value })
    }

    private handleTitleChanged(e: any) {
        e.preventDefault();
        if (e.target.value !== this.props.bugFilterState.bugTitleFilter)
            this.props.setBugFilter({
                ...this.props.bugFilterState,
                bugTitleFilter: e.target.value.toLowerCase()
            });
        this.setState({ localTitle: e.target.value });
    }

    private renderControlPanel() {

        const specInd = this.getSpecIndicator(this.state.selectedSpec);
        const sevInd = 
            <FontAwesomeIcon 
                icon={faCircle} 
                style={{ color: this.getSeverityIndicatorColour(this.state.selectedSev) }} 
            />;

        return (
            <Row className="bugs-view-controlpanel controlpanel">
                <Col md={10}>
                    <div className="bugs-view-control">
                        <Form inline>
                            <InputGroup className="bug-cp-input d-none d-sm-flex">
                                <InputGroupAddon addonType="prepend">
                                    <InputGroupText><FontAwesomeIcon icon={faFilter}></FontAwesomeIcon></InputGroupText>
                                </InputGroupAddon>
                                <Input value={this.state.localTitle} style={{ minWidth: '20rem' }} onChange={this.handleTitleChanged.bind(this)}
                                    type="text" name="email" id="bugTitleFilter" placeholder="" />
                            </InputGroup>
                            <Input value={this.state.localTitle} className="d-block d-sm-none" style={{ marginBottom: '0.5rem'}} onChange={this.handleTitleChanged.bind(this)}
                                    type="text" name="email" id="bugTitleFilterMobile" placeholder="Filter bugs" />
                            <FormGroup>
                                <Dropdown isOpen={this.state.statusDropdownOpen} toggle={this.toggleStatusDrop.bind(this)}>
                                    <DropdownToggle className="bug-cp-dropdown-btn" caret>
                                        {this.state.selectedStatus}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem header>Status</DropdownItem>
                                        <DropdownItem value="All" onClick={this.statusChanged.bind(this)}>All</DropdownItem>
                                        <DropdownItem value="Open" onClick={this.statusChanged.bind(this)}>Open</DropdownItem>
                                        <DropdownItem value="Closed" onClick={this.statusChanged.bind(this)}>Closed</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </FormGroup>
                            <FormGroup>
                                <Dropdown isOpen={this.state.specDropdownOpen} toggle={this.toggleSpecDrop.bind(this)}>
                                    <DropdownToggle className="bug-cp-dropdown-btn" caret>
                                        {specInd} {this.state.selectedSpec}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem header>Specialisation</DropdownItem>
                                        <DropdownItem value="Monk" onClick={this.specChanged.bind(this)}><img className="img-circle" src="/assets/img/spec/monk.jpg" alt="Monk" /> Monk</DropdownItem>
                                        <DropdownItem value="Brewmaster" onClick={this.specChanged.bind(this)}><img className="img-circle" src={"/assets/img/spec/brewmaster.jpg"} alt={"Brewmaster"} /> Brewmaster</DropdownItem>
                                        <DropdownItem value="Mistweaver" onClick={this.specChanged.bind(this)}><img className="img-circle" src={"/assets/img/spec/mistweaver.jpg"} alt={"Mistweaver"} /> Mistweaver</DropdownItem>
                                        <DropdownItem value="Windwalker" onClick={this.specChanged.bind(this)}><img className="img-circle" src={"/assets/img/spec/windwalker.jpg"} alt={"Windwalker"} /> Windwalker</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </FormGroup>
                            <FormGroup>
                                <Dropdown isOpen={this.state.sevDropdownOpen} toggle={this.toggleSevDrop.bind(this)}>
                                    <DropdownToggle className="bug-cp-dropdown-btn" caret>
                                        {sevInd} {this.state.selectedSev}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem header>Severity</DropdownItem>
                                        <DropdownItem value="All" onClick={this.sevChanged.bind(this)}><FontAwesomeIcon icon={faCircle}  style={{ color: "#1b6d85"}} /> All</DropdownItem>
                                        <DropdownItem value="Low" onClick={this.sevChanged.bind(this)}><FontAwesomeIcon icon={faCircle} style={{ color: "#05b10585"}} /> Low</DropdownItem>
                                        <DropdownItem value="Medium" onClick={this.sevChanged.bind(this)}><FontAwesomeIcon icon={faCircle} style={{ color: "#f3f397"}} /> Medium</DropdownItem>
                                        <DropdownItem value="Critical" onClick={this.sevChanged.bind(this)}><FontAwesomeIcon icon={faCircle} style={{ color: "rgb(236, 90, 90)"}} /> Critical</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </FormGroup>
                        </Form>
                    </div>
                </Col>
                <Col md={2}>
                    <div className="bugs-view-controls bug-controls-right d-none d-sm-block">
                        <Link className="btn btn-submit-new bug-cp-dropdown-btn" to="/submit-bug"
                        style={{ float: 'right', marginRight: 0 }}>
                            <FontAwesomeIcon className="svg-icon" icon={faPlusCircle} 
                            style={{ color: '#3cd779'}} /> Submit a New Bug
                        </Link>
                    </div>
                </Col>
            </Row>
        );
    }
}

export default connect(
    (state: ApplicationState) => state.bugs,
    BugsStore.actionCreators
)(BugsViewControlPanel as any);
