import * as React from 'react';
import { connect } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { faCubes } from '@fortawesome/free-solid-svg-icons';
import { GridOptions } from 'ag-grid-community';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { ApplicationState } from '../store';
import { getBaseTitle } from '../store/Constants';
import * as AssetStore from '../store/Assets';

type GameAssetsViewProps =
    AssetStore.AssetState
    & typeof AssetStore.actionCreators;


class GameAssetsView extends React.PureComponent<GameAssetsViewProps, { tableHeight: number }> {
    private gridApi: any;
    private gridColumnApi: any;

    state = {
        tableHeight: 400
    }

    constructor(props : GameAssetsViewProps)
    {
        super(props);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    }

    public componentDidMount() {
        document.title = "Game Assets | " + getBaseTitle();
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.ensureDataFetched();
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    public render() {
        return (
            <React.Fragment>
                <h4><FontAwesomeIcon icon={faCubes}></FontAwesomeIcon> Game Assets</h4>
                <br />
                {this.renderAssetsTable()}
                {this.renderPagination()}
            </React.Fragment>
        );
    }

    private updateWindowDimensions() {
        const newHeight = window.innerHeight - (window.innerHeight * 0.25);
        this.setState({ tableHeight: newHeight });
    }

    private ensureDataFetched() {
        if (!this.props.isFetched) {
            this.props.requestAssets();
        }
    }

    private onGridReady(params: any) {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    private renderAssetsTable() {
        const columnDefs = [

            { headerName: "Id", field: "spellIdT", maxWidth: 100 },
            {
                headerName: "Spell", field: "spellNameT", sortable: true, maxWidth: 250,
                cellRenderer: (p: any) => {
                    return '<img class="wow-bug-spell-icon wow-bug-icon img-circle" src="/assets/img/spells/' +
                        p.data.spellIdT + '.jpg" /> <span class="wow-bug-spell-name">' +
                        p.data.spellNameT + '</span>';
                },
            },
            {
                headerName: "Description", field: "spellDescT", flex: 2
            },
            {
                headerName: "Build", field: "spellBuildT"
            }];

        const gridOptions: GridOptions =
        {
            columnDefs: columnDefs,
            animateRows: true,
            pagination: true,
            defaultColDef: {
                flex: 1,
                resizable: true,
                sortable: true,
                filter: true
            },
        };
        return (
            <div className="ag-theme-alpine">
                <div className="assetstable-div" style={{ marginBottom: '2rem', height: this.state.tableHeight }}>
                    <AgGridReact
                        gridOptions={gridOptions}
                        rowData={this.props.spells}
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
    (state: ApplicationState) => state.assets,
    AssetStore.actionCreators
)(GameAssetsView as any);
