import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { isMobile } from "react-device-detect";
import { Helmet } from "react-helmet";
import { Row, Col } from 'reactstrap';
import PieChart, {
    Legend,
    Series,
    Label,
    Connector
} from 'devextreme-react/pie-chart';

import { ApplicationState } from '../store';
import * as BugsStore from '../store/Bugs';
import * as UserStore from "../store/User";
import './Bugs/BugsView.css';
import './Dashboard.css';
import { GridOptions } from 'ag-grid-community';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

type DashboardProps =
    BugsStore.BugsState
    & typeof BugsStore.actionCreators
    & UserStore.UserState
    & RouteComponentProps<{ limit?: string }>;


class Dashboard extends React.PureComponent<DashboardProps, { tableHeight: number }> {
    private gridApi: any;
    private gridColumnApi: any;

    state = {
        tableHeight: 200
    }


    constructor(props: DashboardProps) {
        super(props);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    public componentDidMount() {
        //document.title = " Bugs | " + getBaseTitle();
        this.ensureDataFetched();
        //this.updateWindowDimensions();
        //window.addEventListener('resize', this.updateWindowDimensions);
    }

    private updateWindowDimensions() {
        const newHeight = window.innerHeight - (window.innerHeight * 0.25);
        this.setState({ tableHeight: newHeight });
    }

    public render() {
        let stats;
        if (this.props.bugStats) {
            stats = this.props.bugStats;
        }
        return (
            <React.Fragment>
                <Helmet>
                    <title>Dashboard | Bugwalker.io</title>
                    <meta name="description" content="Bugwalker Bugs" />
                </Helmet>
                {stats &&
                    <Row>
                        <Col md="4" lg="4" sm="12" xs="12">
                            <h5>Open Bug Specialisation</h5>
                            <PieChart
                                id="specPie"
                                type="doughnut"
                                sizeGroup="pieGroup"
                                palette={["#1b6d85", "#78b6d9", "#bd6a51", "#eeba69"]}
                                dataSource={
                                    [
                                        { region: 'All', val: stats.bsNumOpenAll },
                                        { region: 'Windwalker', val: stats.bsNumOpenWindwalker },
                                        { region: 'Mistweaver', val: stats.bsNumOpenMistweaver },
                                        { region: 'Brewmaster', val: stats.bsNumOpenBrewmaster },
                                    ]}
                            >
                                <Series argumentField="region">
                                    <Label visible={true} customizeText={
                                        (arg: any) => {
                                            return `${arg.argumentText} (${arg.valueText})`;
                                        }}>
                                        <Connector visible={true} />
                                    </Label>
                                </Series>
                                <Legend
                                    horizontalAlignment="right"
                                    verticalAlignment="top"
                                    visible={false}
                                />
                            </PieChart>
                        </Col>
                        <Col md="4" lg="4" sm="12" xs="12">
                            <h5>Open Bug Severity</h5>
                            <PieChart
                                id="sevPie"
                                type="doughnut"
                                sizeGroup="pieGroup"
                                palette={["#60a69f", "#eeba69", "#bd6a51"]}
                                dataSource={
                                    [
                                        { region: 'Low', val: stats.bsNumOpenLow },
                                        { region: 'Medium', val: stats.bsNumOpenMedium },
                                        { region: 'Critical', val: stats.bsNumOpenCritical },
                                    ]}
                            >
                                <Series argumentField="region">
                                    <Label visible={true} customizeText={
                                        (arg: any) => {
                                            return `${arg.argumentText} (${arg.valueText})`;
                                        }}>
                                        <Connector visible={true} />
                                    </Label>
                                </Series>
                                <Legend
                                    horizontalAlignment="right"
                                    verticalAlignment="top"
                                    visible={false}
                                />
                            </PieChart>
                        </Col>
                        <Col md="4" lg="4" sm="12" xs="12">
                            <h5>Bug Statistics</h5>
                            <br />
                            <div className="ag-theme-alpine">
                                <div className="bugstats-div" style={{ marginBottom: '2rem' }}>
                                    <AgGridReact
                                        gridOptions={
                                            {
                                                columnDefs: [
                                                    { headerName: "Type", field: "label", hide: false },
                                                    { headerName: "Number", field: "value", hide: false }
                                                ],
                                                animateRows: true,
                                                pagination: false,
                                                rowClassRules: {
                                                    'row-severity-low': 'data.bugSeverity === "Low"',
                                                    'row-severity-medium': 'data.bugSeverity === "Medium"',
                                                    'row-severity-critical': 'data.bugSeverity === "Critical"',
                                                    'row-has-tags': 'data.bugTags !== ""'
                                                },
                                                defaultColDef: {
                                                    flex: 1,
                                                    filter: false,
                                                    resizable: true,
                                                },
                                            }}
                                        rowData={[
                                            { label: "Total Open Bugs", value: stats.bsNumOpenTotal },
                                            { label: "Brewmaster Bugs", value: stats.bsNumOpenBrewmaster },
                                            { label: "Mistweaver Bugs", value: stats.bsNumOpenMistweaver },
                                            { label: "Windwalker Bugs", value: stats.bsNumOpenWindwalker },
                                            { label: "Low Sev. Bugs", value: stats.bsNumOpenLow },
                                            { label: "Medium Sev. Bugs", value: stats.bsNumOpenMedium },
                                            { label: "Critical Sev. Bugs", value: stats.bsNumOpenCritical }
                                        ]}
                                        gridAutoHeight={true}
                                    >
                                    </AgGridReact>
                                </div>
                            </div>
                        </Col>
                    </Row>
                }
                <Row style={{ marginTop: '2rem' }}>
                    <Col md="12" lg="12" sm="12" xs="12">
                        <h5>Latest submitted Bugs</h5>
                        <br />
                        {this.renderBugsTable()}
                        <div style={{ float: 'right', marginBottom:'2rem'}}><Link to="/bugs" className="btn btn-primary btn-bw-blue">View All Bugs <FontAwesomeIcon icon={faChevronRight} /></Link></div>
                    </Col>
                    
                </Row>
            </React.Fragment>
        );
    }

    private ensureDataFetched() {
        this.props.requestBugs(10);
        this.props.requestBugStats();
    }

    private onGridReady(params: any) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    private renderBugsTable() {

        let columnDefs;
        if (isMobile) {
            columnDefs = [

                { headerName: "Id", field: "bugId", hide: true },
                {
                    headerName: "", field: "bugSpellName", sortable: true, maxWidth: 64,
                    cellRenderer: (p: any) => {
                        return '<img class="wow-bug-spell-icon wow-bug-icon img-circle" src="/assets/img/spells/' +
                            p.data.bugSpellId + '.jpg" />';
                    },
                },
                {
                    headerName: "Title", minWidth: 550, field: "bugTitle", sortable: true, flex: 2, resizable: true,
                    cellRendererFramework: function (p: any) {
                        return <Link className="bugs-table-title-link" to={"/bugs/" + p.data.bugId}>{p.value}</Link>;
                    }
                },
                {
                    headerName: "Specialisation", field: "bugSpec", sortable: true, hide: true, maxWidth: 200, colId: "spec"
                },
                {
                    headerName: "Tags", field: "bugTags", hide: true
                },
                { headerName: "Severity", field: "bugSeverity", sortable: true, filter: true, hide: true },
                { headerName: "Build Reported", field: "bugBuildString", sortable: true, hide: true },
                {
                    headerName: "Submitted By", field: "bugUserName", sortable: true, hide: true,
                    cellRenderer: function (params: any) {
                        return '<a href="/users/' + params.data.bugUserId + '">' + params.value + '</a>'
                    }
                }];
        }
        else {
            columnDefs = [

                { headerName: "Id", field: "bugId", hide: true },
                {
                    headerName: "Spell", field: "bugSpellName", sortable: true, maxWidth: 250,
                    cellRenderer: (p: any) => {
                        return '<img class="wow-bug-spell-icon wow-bug-icon img-circle" src="/assets/img/spells/' +
                            p.data.bugSpellId + '.jpg" /> <span class="wow-bug-spell-name">' +
                            p.data.bugSpellName + '</span>';
                    },
                },
                {
                    headerName: "Title", minWidth: 550, field: "bugTitle", sortable: true, flex: 2, resizable: true,
                    cellRendererFramework: function (p: any) {
                        return <Link className="bugs-table-title-link" to={"/bugs/" + p.data.bugId}>{p.value}</Link>;
                    }
                },
                {
                    headerName: "Specialisation", field: "bugSpec", sortable: true, maxWidth: 200, colId: "spec",
                    cellRenderer: function (params: any) {
                        const p = params.value.toLowerCase();
                        if (p === "all")
                            return '<img class="wow-bug-icon img-circle" alt="Monk (All)" src="/assets/img/spec/monk_medium.jpg" />';
                        return '<img class="wow-bug-icon img-circle" alt="Windwalker" src="/assets/img/spec/' + p + '_medium.jpg"/>';
                    }
                },
                {
                    headerName: "Tags", field: "bugTags",
                    cellRenderer: (p: any) => {
                        if (p.value != null && p.value !== undefined && p.value !== "") {
                            if (p.value.includes(',')) {
                                const tags = p.value.split(',');
                                return tags.reduce((x: string, y: string) => x +
                                    ' <span class="badge badge-' + BugsStore.getBadgeColour(y) + '">' + y + '</span>', "");
                            }
                            else {
                                return '<span class="badge badge-' + BugsStore.getBadgeColour(p.value) + '">' + p.value + '</span>';
                            }
                        }
                        return p.value;
                    }
                },
                { headerName: "Severity", field: "bugSeverity", sortable: true, filter: true, hide: true },
                { headerName: "Build Reported", field: "bugBuildString", sortable: true, hide: true },
                {
                    headerName: "Submitted By", field: "bugUserName", sortable: true, hide: true,
                    cellRenderer: function (params: any) {
                        return '<a href="/users/' + params.data.bugUserId + '">' + params.value + '</a>'
                    }
                }];
        }

        const gridOptions: GridOptions =
        {
            columnDefs: columnDefs,
            animateRows: true,
            pagination: false,
            rowClassRules: {
                'row-severity-low': 'data.bugSeverity === "Low"',
                'row-severity-medium': 'data.bugSeverity === "Medium"',
                'row-severity-critical': 'data.bugSeverity === "Critical"',
                'row-has-tags': 'data.bugTags !== ""'
            },
            defaultColDef: {
                flex: 1,
                filter: false,
                resizable: true,
            },
        };
        return (
            <div className="ag-theme-alpine">
                <div className="bugstable-div" style={{ marginBottom: '2rem' }}>
                <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"></link>
                    <AgGridReact
                        gridOptions={gridOptions}
                        rowData={this.props.bugs.filter(x => x.bugStatus === "Open").slice(0, 10)}
                        onGridReady={this.onGridReady}
                        gridAutoHeight={true}
                    >
                    </AgGridReact>
                </div>
            </div>
        );
    }

    private renderPagination() {
        return (
            <div className="d-flex justify-content-between">
                {this.props.isLoading && <span>Loading...</span>}
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState) => {
        return { ...state.bugs, ...state.user };
    },
    BugsStore.actionCreators
)(Dashboard as any);
