import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
import { getApiBaseUrl } from './Constants';
import { store } from '../index';

// -----------------
// STATE 

export interface AssetState {
    lastFetch?: string,
    isFetched: boolean,
    isFetching: boolean,
    spells: Spell[],
    builds: Build[]
}

export interface Spell {
    spellIdT: number;
    spellNameT: string;
    spellDescT: string;
    spellBuildT: string;
}

export interface Build {
    buildIdT: number;
    buildStringT: string;
    buildDateT: string;
}


// -----------------
// ACTIONS 

interface RequestAssetsAction {
    type: 'REQUEST_ASSETS';
}

interface ReceiveAssetsResponseAction {
    type: 'RECEIVE_ASSETS';
    spells: Spell[],
    builds: Build[]
}

type KnownAction = RequestAssetsAction | ReceiveAssetsResponseAction;

// -----------------
// ACTION CREATORS 

export const actionCreators = {
    requestAssets: (): AppThunkAction<KnownAction> => (dispatch, getState) => {

        dispatch({ type: 'REQUEST_ASSETS'});

        const appState = getState();
        if (appState && appState.assets) {
            fetch(`${getApiBaseUrl()}/api/builds`)
                .then(response => response.json() as Promise<Build[]>)
                .then(builds => {

                    fetch(`${getApiBaseUrl()}/api/spells`)
                        .then(res => res.json() as Promise<Spell[]>)
                        .then(spells => {
                            dispatch({ type: 'RECEIVE_ASSETS', spells, builds });
                        })
                })
                .catch(err => {
                    store.dispatch(
                        { type: 'NEW_NOTIFICATION', severity: 2, 
                        title: "Error while fetching", message: err  });
                });
        }
    }
};

// ----------------
// REDUCER

const unloadedState: AssetState = { isFetched: false, isFetching: false, spells: [], builds: [] };

export const reducer: Reducer<AssetState> =
    (state: AssetState | undefined, incomingAction: Action): AssetState => {
        if (state === undefined) {
            return unloadedState;
        }

        const action = incomingAction as KnownAction;
        switch (action.type) {
            case 'REQUEST_ASSETS':
                return {
                    ...state,
                    isFetching: true
                };
            case 'RECEIVE_ASSETS':
                return {
                    lastFetch: new Date().toString(),
                    isFetching: false,
                    isFetched: true,
                    spells: action.spells,
                    builds: action.builds
                }
            default:
                return state;
        }
    };
