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
//import { getBaseTitle } from '../../store/Constants';
import * as BugsStore from '../../store/Bugs';
import BugsViewControlPanel from './BugsViewControlPanel';
import './BugsView.css';
import { GridOptions } from 'ag-grid-community';

type BugsViewProps =
    BugsStore.BugsState
    & typeof BugsStore.actionCreators
    & RouteComponentProps<{ limit?: string }>;


class Bugs extends React.PureComponent<BugsViewProps, { tableHeight: number }> {
    private gridApi: any;
    private gridColumnApi: any;

    state = {
        tableHeight: 400
    }


    constructor(props: BugsViewProps) {
        super(props);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    public componentDidUpdate(prevProps: any, prevState: any) {
        if (this.props.bugFilterState !== prevProps.bugFilterState) {
            console.log("Bug filterstate updated", this.props.bugFilterState);
        }
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
        return (
            <React.Fragment>
                <Helmet>
                    <title>Bugs | Bugwalker.io</title>
                    <meta name="description" content="Bugwalker Bugs" />
                    <meta name="image" content="test" />
                    <meta name="title" content="Bugs | Bugwalker.io" />
                    <meta property="og:title" content="Bugs | Bugwalker.io" />
                    <meta property="og:description" content="Bugwalker Bugs" />
                </Helmet>
                {this.renderBugsTable()}
                {this.renderPagination()}
            </React.Fragment>
        );
    }

    private ensureDataFetched() {
        this.props.requestBugs(200);
    }

    private onGridReady(params: any) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    private applyBugFilters(bugs: BugsStore.Bug[]) {
        const fs = this.props.bugFilterState;
        let filteredBugs = bugs;

        if (fs.bugTitleFilter !== "") {
            filteredBugs =
                filteredBugs.filter(
                    x => x.bugTitle.toLowerCase().includes(fs.bugTitleFilter)
                        || x.bugSpellName.toLowerCase().includes(fs.bugTitleFilter)
                        || x.bugTags.toLowerCase().includes(fs.bugTitleFilter));
        }

        if (fs.bugStatusFilter !== "All") {
            filteredBugs = filteredBugs.filter(x => x.bugStatus === fs.bugStatusFilter);
        }

        if (fs.bugSpecFilter !== "Monk") {
            filteredBugs = filteredBugs.filter((x) => x.bugSpec === fs.bugSpecFilter);
        }

        if (fs.bugSevFilter !== "All") {
            filteredBugs = filteredBugs.filter(x => x.bugSeverity === fs.bugSevFilter);
        }
        return filteredBugs;
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
                <BugsViewControlPanel></BugsViewControlPanel>
                <div className="bugstable-div" style={{ marginBottom: '2rem', height: this.state.tableHeight }}>
                    <AgGridReact
                        gridOptions={gridOptions}
                        rowData={this.applyBugFilters(this.props.bugs)}
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
    (state: ApplicationState) => state.bugs,
    BugsStore.actionCreators
)(Bugs as any);
