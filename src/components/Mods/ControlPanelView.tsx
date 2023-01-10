import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { isMobile } from "react-device-detect";
import { Helmet } from "react-helmet";

import { ApplicationState } from '../../store';
import * as BugsStore from '../../store/Bugs';
import * as UserStore from "../../store/User";
import '../Bugs/BugsView.css';
import { GridOptions } from 'ag-grid-community';

type ControlPanelViewProps =
    BugsStore.BugsState
    & typeof BugsStore.actionCreators
    & UserStore.UserState
    & RouteComponentProps<{ limit?: string }>;


class ControlPanelView extends React.PureComponent<ControlPanelViewProps, { tableHeight: number }> {
    private gridApi: any;
    private gridColumnApi: any;

    state = {
        tableHeight: 400
    }


    constructor(props: ControlPanelViewProps) {
        super(props);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    public componentDidMount() {
        //document.title = " Bugs | " + getBaseTitle();
        this.ensureDataFetched();
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    private updateWindowDimensions() {
        const newHeight = window.innerHeight - (window.innerHeight * 0.25);
        this.setState({ tableHeight: newHeight });
    }

    public render() {
        let isAuth = this.props.au && UserStore.isUserRoleMod(this.props.au.auRole);
        return (
            <React.Fragment>
                <Helmet>
                    <title>Bugs | Bugwalker.io</title>
                    <meta name="description" content="Bugwalker Bugs" />
                </Helmet>
                <h4>Mod Control Panel</h4>
                {isAuth &&
                    <div>
                        <hr />
                        <h5>Bugs Pending Approval</h5>
                        <p>To approve a bug, click its title in the table below and review the bug details. If appropriate, click 
                            "Edit Bug" bug in the usual way and change the Bug Status from "Pending" to "Open" and then click "Update Bug".
                        </p>
                        {this.renderBugsTable()}
                        {this.renderPagination()}
                    </div>
                }
                {!isAuth &&
                    <div>
                        <p>You are not authorised to view this page.</p>
                    </div>
                }
            </React.Fragment>
        );
    }

    private ensureDataFetched() {
        this.props.requestPendingBugs();
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
            pagination: true,
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
                <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"></link>
                <div className="bugstable-div" style={{ marginBottom: '2rem', height: this.state.tableHeight }}>
                    <AgGridReact
                        gridOptions={gridOptions}
                        rowData={this.props.pendingBugs}
                        onGridReady={this.onGridReady}
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
)(ControlPanelView as any);
