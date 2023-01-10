import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { GridOptions } from 'ag-grid-community';
import { RouteComponentProps } from 'react-router';
import { Row, Col, Button } from 'reactstrap';

import { ApplicationState } from '../../store';
import * as UserStore from '../../store/User';
import { getBaseTitle } from '../../store/Constants';
import './UserProfile.css';

type UserProfileViewProps =
    UserStore.UserState
    & typeof UserStore.actionCreators
    & RouteComponentProps<{ userId?: string }>;


class UserProfileView extends React.PureComponent<UserProfileViewProps> {
    private gridApi: any;
    private gridColumnApi: any;


    public componentDidMount() {
        if (this.props.match.params.userId) {
            console.log("fetching userprofile for ", this.props.match.params.userId);
            this.props.requestUserProfile(parseInt(this.props.match.params.userId));
        }
    }

    public componentDidUpdate(prevProps: UserProfileViewProps) {
        if (this.props.match.params.userId !== prevProps.match.params.userId) {
            if (this.props.match.params.userId) {
                this.props.requestUserProfile(parseInt(this.props.match.params.userId));
            }
        }
    }

    private requestChangeRole(role: number) {
        if (this.props.userProfile) {
            this.props.requestUserChangeRole(
                this.props.userProfile,
                {
                    ucrId: this.props.userProfile.userPId,
                    ucrRole: role
                });
        }
    }

    public render() {
        const up = this.props.userProfile;
        let hasBugs = false;
        const upAndMod =
            this.props.userProfile &&
            this.props.au &&
            UserStore.isUserRoleMod(this.props.au.auRole);

        if (up) {
            document.title = up.userPName + "'s Profile | " + getBaseTitle()
            hasBugs = up.userPBugs.length > 0;
        }

        return (
            <React.Fragment>
                <Row className="user-profile">
                    <Col md="2"></Col>
                    <Col md="8">
                        <br />
                        {!up &&
                            <p>No user profile was loaded.</p>
                        }
                        {up &&
                            <div>
                                <Row>
                                    <Col md="6" sm="6" lg="2" xl="2" style={{ minWidth: 180 }}>
                                        <img
                                            className="user-profile-avatar img-circle"
                                            src={`/assets/img/avatars/avatar${up.userPAvatar}.jpg`}
                                            alt="Avatar" />
                                    </Col>
                                    <Col md="6" sm="6" lg="7" xl="6" style={{ paddingTop: '0.8rem' }}>
                                        <h3 className={"user-profile-name user-role-" +
                                            UserStore.getUserRoleTag(up.userPRole).toLowerCase()}>{up.userPName}</h3>
                                        <h4>{UserStore.getUserRoleTag(up.userPRole)}</h4>
                                        <p>member since {up.userPCreatedTime}.</p>
                                    </Col>
                                    <Col md="6" lg="3" xl="3" sm="6">
                                        {upAndMod &&
                                            <div className="user-profile-modpanel">
                                                <p><b>Mod Controls</b></p>
                                                <ul>
                                                    <li>
                                                        <Button hidden={up.userPRole > 1} color="info" className="btn-sm btn-block"
                                                            onClick={() => this.requestChangeRole(2)}>Make {UserStore.getUserRoleTag(2)}
                                                        </Button>
                                                    </li>
                                                    <li>
                                                        <Button hidden={up.userPRole === 1} color="info" className="btn-sm btn-block"
                                                            onClick={() => this.requestChangeRole(1)}>Make {UserStore.getUserRoleTag(1)}
                                                        </Button>
                                                    </li>
                                                    <li>
                                                        <Button hidden={UserStore.isUserRoleMod(up.userPRole)} color="success" className="btn-sm btn-block"
                                                            onClick={() => this.requestChangeRole(4)}>Make {UserStore.getUserRoleTag(4)}
                                                        </Button>
                                                    </li>
                                                    <li>
                                                        <Button hidden={up.userPRole === 0} color="danger" className="btn-sm btn-block"
                                                            onClick={() => this.requestChangeRole(0)}>Ban User
                                                        </Button>
                                                    </li>
                                                </ul>
                                            </div>
                                        }
                                    </Col>
                                </Row>
                                <hr />
                            </div>
                        }
                        <br />

                        {up &&
                            <h4>Bugs submitted by {up.userPName}</h4>
                        }
                        <br />
                        {hasBugs &&
                            this.renderBugsTable()
                        }
                        {!hasBugs &&
                            <p>This user hasn't submitted any bugs yet.</p>
                        }
                        <br />
                        <br />
                        <Link className="btn btn-primary btn-outline" to="/users"> &lt; Back to users</Link>
                        <br />
                        <br />
                    </Col>
                    <Col md="2"></Col>
                </Row>
            </React.Fragment>
        );
    }

    private onGridReady(params: any) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    private renderBugsTable() {
        const columnDefs = [

            { headerName: "Id", field: "bugId", hide: true },
            {
                headerName: "", field: "bugSpellName", sortable: true, maxWidth: 64,
                cellRenderer: (p: any) => {
                    return '<img class="wow-bug-spell-icon wow-bug-icon img-circle" src="/assets/img/spells/' +
                        p.data.bugSpellId + '.jpg" />';
                },
            },
            {
                headerName: "Title", field: "bugTitle", sortable: true, flex: 2, resizable: true,
                wrapText: true,
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
            }];

        const gridOptions: GridOptions =
        {
            columnDefs: columnDefs,
            animateRows: true,
            pagination: true,
            defaultColDef: {
                filter: true,
                flex: 1,
                resizable: true,
            },
        };
        return (
            <div className="ag-theme-alpine">
                <div className="userstable-div" style={{ height: '20rem' }}>
                    <AgGridReact
                        gridOptions={gridOptions}
                        rowData={this.props.userProfile ? this.props.userProfile.userPBugs : []}
                        onGridReady={this.onGridReady}
                    >
                    </AgGridReact>
                </div>
            </div>
        );
    }
}

export default connect(
    (state: ApplicationState) => state.user,
    UserStore.actionCreators
)(UserProfileView as any);
