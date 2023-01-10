import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { GridOptions } from 'ag-grid-community';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ApplicationState } from '../../store';
import { getBaseTitle } from '../../store/Constants';
import * as UserStore from '../../store/User';

type UsersViewProps =
    UserStore.UserState
    & typeof UserStore.actionCreators;


class UsersView extends React.PureComponent<UsersViewProps, { tableHeight: number }> {
    private gridApi: any;
    private gridColumnApi: any;

    state = { tableHeight: 400 }

    constructor(props : UsersViewProps)
    {
        super(props);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    public componentDidMount() {
        document.title = "Users | " + getBaseTitle()
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.ensureDataFetched();
    }

    public render() {
        return (
            <React.Fragment>
                <h4><FontAwesomeIcon icon={faUsers}></FontAwesomeIcon> Users</h4>
                <br />
                {this.renderUsersTable()}
                {this.renderPagination()}
            </React.Fragment>
        );
    }

    public componentWillUnmount() {
        this.props.clearUsers();
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    private ensureDataFetched() {
        this.props.requestUsers();
    }

    private onGridReady(params: any) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }
  
    private updateWindowDimensions() {
        const newHeight = window.innerHeight - (window.innerHeight * 0.25);
        this.setState({ tableHeight: newHeight });
    }

    private renderUsersTable() {
        const columnDefs = [

            { headerName: "Id", field: "userLId", hide: true },
            {
                headerName: "", field: "userLAvatar", maxWidth: 75,
                cellRenderer: (p: any) => {
                    return '<img class="wow-bug-spell-icon wow-bug-icon img-circle" src="/assets/img/avatars/avatar' +
                        p.value + '.jpg" />';
                }
            },
            {
                headerName: "Username", field: "userLName", sortable: true, resizable: true,
                wrapText: true, filter: true,
                cellRendererFramework: function (p: any) {
                    return <Link
                        className={"bugs-table-title-link user-role-" +
                            UserStore.getUserRoleTag(p.data.userLRole).toLowerCase()}
                        to={"/user/" + p.data.userLId}>{p.value}</Link>;
                }
            },
            {
                headerName: "Role", field: "userLRole", sortable: true, filter: true,
                cellRenderer: function (p: any) {
                    return UserStore.getUserRoleTag(p.value);
                }
            },
            { headerName: "Member Since", field: "userLCreatedTime", sortable: true, filter: true, }];

        const gridOptions: GridOptions =
        {
            columnDefs: columnDefs,
            pagination: true,
            animateRows: true,
            defaultColDef: {
                flex: 1,
                resizable: true,
            },
        };
        return (
            <div className="ag-theme-alpine">
                <div className="userstable-div" style={{ height: this.state.tableHeight }}>
                    <AgGridReact
                        gridOptions={gridOptions}
                        rowData={this.props.users}
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

            </div>
        );
    }
}

export default connect(
    (state: ApplicationState) => state.user,
    UserStore.actionCreators
)(UsersView as any);
