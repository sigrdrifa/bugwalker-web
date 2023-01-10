import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
import { getApiBaseUrl } from './Constants';
import { push } from 'connected-react-router';
import { store } from '../index';

// -----------------
// STATE 

export interface BugsState {
    isLoading: boolean;
    limit?: number;
    bugs: Bug[];
    bugDetail?: BugDetail;
    bugFilterState: BugFilterState;
    pendingBugs: Bug[];
    bugStats?: BugStats;
}

export interface Bug {
    bugId: number;
    bugDateModified: string;
    bugSeverity: string;
    bugType: string;
    bugTitle: string,
    bugStatus: string,
    bugTags: string,
    bugSpellId: number,
    bugBuildId: number,
    bugSpec: string,
    bugBlueTrackerLink: string,
    bugUserName?: string,
    bugBuildString: string,
    bugSpellName: string
}

export interface BugDetail {
    bugdtId: number;
    bugdtDateCreated: string;
    bugdtDateModified: string;
    bugdtSeverity: string;
    bugdtType: string;
    bugdtTitle: string;
    bugdtStatus: string;
    bugdtTags: string;
    bugdtSpellId: number;
    bugdtBuildId: number;
    bugdtSpec: string;
    bugdtDescription: string;
    bugdtSteps: string;
    bugdtContent: string;
    bugdtBlueTrackerLink: string;
    bugdtSubmitter: number;
}

interface BugChangedResponseMessage {
    bcMessageStatusCode: number;
    bcMessageBugId: number;
    bcMessageStatus: string;
    bcMessage: string;
}

interface BugFilterState {
    bugTitleFilter: string;
    bugSpellFilter: string;
    bugStatusFilter: string;
    bugSpecFilter: string;
    bugSevFilter: string;
}

interface BugStats {
    bsNumOpenWindwalker: number;
    bsNumOpenMistweaver: number;
    bsNumOpenBrewmaster: number;
    bsNumOpenAll: number;
    bsNumOpenTotal: number;
    bsNumOpenLow: number;
    bsNumOpenMedium: number;
    bsNumOpenCritical: number;
}

// -----------------
// ACTIONS 

interface RequestBugsAction {
    type: 'REQUEST_BUGS';
    limit: number;
}

interface RequestBugDetailAction {
    type: 'REQUEST_BUG_DETAIL';
    bugId: number;
}

interface ReceiveBugsAction {
    type: 'RECEIVE_BUGS';
    limit: number;
    bugs: Bug[];
}

interface RequestBugStats {
    type: 'REQUEST_BUGSTATS';
}

interface ReceiveBugStats {
    type: 'RECEIVE_BUGSTATS';
    bugStats: BugStats;
}

interface RequestPendingBugsAction {
    type: 'REQUEST_PENDING_BUGS';
}

interface ReceivePendingBugsAction {
    type: 'RECEIVE_PENDING_BUGS';
    bugs: Bug[];
}

interface ReceiveBugDetailAction {
    type: 'RECEIVE_BUG_DETAIL';
    bugDetail: BugDetail;
}

interface SubmitBugAction {
    type: 'SUBMIT_BUG';
    bugDetail: BugDetail;
}

interface SubmitBugResponseAction {
    type: 'SUBMIT_BUG_RESPONSE';
    bugRes: BugChangedResponseMessage;
}

interface EditBugAction {
    type: 'EDIT_BUG';
    bugId: number;
    bugDetail: BugDetail;
}

interface EditBugResponseAction {
    type: 'EDIT_BUG_RESPONSE';
    bugRes: BugChangedResponseMessage;
}

interface SetBugFilterAction {
    type: 'SET_BUG_FILTER';
    filterState: BugFilterState;
}

interface ClearBugFiltersAction {
    type: 'CLEAR_BUG_FILTERS';
}

interface DeleteBugAction {
    type: 'DELETE_BUG',
    bugId: number;
}

interface DeleteBugResponseAction {
    type: 'DELETE_BUG_RESPONSE';
    bugRes: BugChangedResponseMessage;
}


type KnownAction =
    RequestBugsAction | ReceiveBugsAction | RequestBugDetailAction | ReceiveBugDetailAction
    | SubmitBugAction | SubmitBugResponseAction | EditBugAction | EditBugResponseAction
    | SetBugFilterAction | ClearBugFiltersAction | DeleteBugAction | DeleteBugResponseAction
    | RequestPendingBugsAction | ReceivePendingBugsAction | RequestBugStats | ReceiveBugStats;

// ----------------
// ACTION CREATORS 

export const actionCreators = {
    setBugFilter: (filterState: BugFilterState): AppThunkAction<KnownAction> => (dispatch) => {

        dispatch({ type: 'SET_BUG_FILTER', filterState });

    },
    clearBugFilters: (): AppThunkAction<KnownAction> => (dispatch) => {

        dispatch({ type: 'CLEAR_BUG_FILTERS' });
    },
    requestBugs: (limit: number): AppThunkAction<KnownAction> => (dispatch, getState) => {

        dispatch({ type: 'REQUEST_BUGS', limit: limit });

        const appState = getState();
        if (appState && appState.bugs) {
            fetch(`${getApiBaseUrl()}/api/bugs`)
                .then(response => response.json() as Promise<Bug[]>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_BUGS', limit: limit, bugs: data });
                });
        }
    },
    requestBug: (bugId: number): AppThunkAction<KnownAction> => (dispatch, getState) => {

        dispatch({ type: 'REQUEST_BUG_DETAIL', bugId });

        const appState = getState();
        if (appState && appState.bugs) {
            fetch(`${getApiBaseUrl()}/api/bugs/${bugId}`)
                .then(response => response.json() as Promise<BugDetail>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_BUG_DETAIL', bugDetail: data });
                });
        }
    },
    requestBugStats: (): AppThunkAction<KnownAction> => (dispatch, getState) => {

        dispatch({ type: 'REQUEST_BUGSTATS' });

        const appState = getState();
        if (appState && appState.bugs) {
            fetch(`${getApiBaseUrl()}/api/bugs/stats`)
                .then(response => response.json() as Promise<BugStats>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_BUGSTATS', bugStats: data });
                });
        }
    },
    requestPendingBugs: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'REQUEST_PENDING_BUGS' });

        const appState = getState();
        if (appState && appState.bugs) {
            if (!appState.user || !appState.user.au) {
                console.log("Attempted to fetch pending bugs without auth, shame!");
                return;
            }
            const token = appState.user.token;

            fetch(`${getApiBaseUrl()}/api/purps/bugs/pending`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })
                .then(response => response.json() as Promise<Bug[]>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_PENDING_BUGS', bugs: data });
                })
                .catch(err => {
                    store.dispatch(
                        {
                            type: 'NEW_NOTIFICATION', severity: 3, title: `Error - Failed to fetch pending bugs`,
                            message: err
                        });
                });
        }
    },
    submitBug: (bugD: BugDetail): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'SUBMIT_BUG', bugDetail: bugD });

        const appState = getState();
        if (appState && appState.bugs) {
            if (!appState.user || !appState.user.au) {
                console.log("Attempted to submit bug without auth, shame!");
                store.dispatch(
                    {
                        type: 'NEW_NOTIFICATION', severity: 3, title: `Error - You are not logged in`,
                        message: "Attempted to submit a bug without being logged in."
                    });
                return;
            }
            const token = appState.user.token;

            fetch(`${getApiBaseUrl()}/api/bugs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Access-Control-Request-Method': 'POST'
                },
                body: JSON.stringify(bugD)
            })
                .then(response => response.json() as Promise<BugChangedResponseMessage>)
                .then(data => {
                    dispatch({ type: 'SUBMIT_BUG_RESPONSE', bugRes: data });
                    store.dispatch(
                        {
                            type: 'NEW_NOTIFICATION', severity: 1, title: `OK - Bug Submitted!`,
                            message: "Redirecting..."
                        });
                    store.dispatch(push(`/bugs/${data.bcMessageBugId}`));
                })
                .catch(err => {
                    let lrmfail: BugChangedResponseMessage =
                    {
                        bcMessageBugId: -1, bcMessageStatusCode: 500,
                        bcMessageStatus: "FAIL", bcMessage: "FAIL"
                    }
                    dispatch({ type: 'SUBMIT_BUG_RESPONSE', bugRes: lrmfail });
                    store.dispatch(
                        {
                            type: 'NEW_NOTIFICATION', severity: 3, title: `Error - Failed to submit bug`,
                            message: err
                        });
                });
        }
    },
    editBug: (bugId: number, bugD: BugDetail): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'EDIT_BUG', bugId, bugDetail: bugD });

        const appState = getState();
        if (appState && appState.bugs) {
            if (!appState.user || !appState.user.au) {
                console.log("Attempted to edit bug without auth, shame!");
                store.dispatch(
                    {
                        type: 'NEW_NOTIFICATION', severity: 3, title: `Error - You are not logged in`,
                        message: "Attempted to edit a bug without being logged in."
                    });
                return;
            }
            const token = appState.user.token;

            fetch(`${getApiBaseUrl()}/api/bugs/${bugId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Access-Control-Request-Method': 'PUT'
                },
                body: JSON.stringify(bugD)
            })
                .then(response => response.json() as Promise<BugChangedResponseMessage>)
                .then(data => {
                    dispatch({ type: 'EDIT_BUG_RESPONSE', bugRes: data });
                    store.dispatch(
                        {
                            type: 'NEW_NOTIFICATION', severity: 1, title: `OK - Bug Updated!`,
                            message: "Redirecting..."
                        });
                    store.dispatch(push(`/bugs/${data.bcMessageBugId}`));
                })
                .catch(err => {
                    let lrmfail: BugChangedResponseMessage =
                    {
                        bcMessageBugId: -1, bcMessageStatusCode: 500,
                        bcMessageStatus: "FAIL", bcMessage: "FAIL"
                    }
                    dispatch({ type: 'EDIT_BUG_RESPONSE', bugRes: lrmfail });
                    store.dispatch(
                        {
                            type: 'NEW_NOTIFICATION', severity: 3, title: `Error - Failed to edit bug`,
                            message: err
                        });
                });
        }
    },
    deleteBug: (bugId: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: 'DELETE_BUG', bugId });

        const appState = getState();
        if (appState && appState.bugs) {
            if (!appState.user || !appState.user.au) {
                store.dispatch(
                    {
                        type: 'NEW_NOTIFICATION', severity: 3, title: `Error - You are not logged in`,
                        message: "Attempted to delete a bug without being logged in."
                    });
                return;
            }
            const token = appState.user.token;

            fetch(`${getApiBaseUrl()}/api/bugs/${bugId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Access-Control-Request-Method': 'POST'
                }
            })
                .then(response => response.json() as Promise<BugChangedResponseMessage>)
                .then(data => {
                    dispatch({ type: 'DELETE_BUG_RESPONSE', bugRes: data });
                    store.dispatch(
                        {
                            type: 'NEW_NOTIFICATION', severity: 1, title: `OK - Bug Deleted!`,
                            message: "Redirecting..."
                        });
                    store.dispatch(push(`/bugs`));
                })
                .catch(err => {
                    let lrmfail: BugChangedResponseMessage =
                    {
                        bcMessageBugId: -1, bcMessageStatusCode: 500,
                        bcMessageStatus: "FAIL", bcMessage: "FAIL"
                    }
                    dispatch({ type: 'DELETE_BUG_RESPONSE', bugRes: lrmfail });
                    store.dispatch(
                        {
                            type: 'NEW_NOTIFICATION', severity: 3, title: `Error - Failed to delete bug`,
                            message: err
                        });
                });
        }
    },
};

// ----------------
// REDUCER

const unloadedState: BugsState = {
    bugs: [],
    isLoading: false,
    bugDetail: undefined,
    bugFilterState: {
        bugSpecFilter: "Monk",
        bugTitleFilter: "",
        bugSpellFilter: "",
        bugStatusFilter: "Open",
        bugSevFilter: "All"
    },
    pendingBugs: [],
    bugStats: undefined
};

export const reducer: Reducer<BugsState> =
    (state: BugsState | undefined, incomingAction: Action): BugsState => {
        if (state === undefined) {
            return unloadedState;
        }

        const action = incomingAction as KnownAction;
        switch (action.type) {
            case 'SET_BUG_FILTER':
                return {
                    ...state,
                    bugFilterState: action.filterState
                };
            case 'CLEAR_BUG_FILTERS':
                return {
                    ...state,
                    bugFilterState: {
                        bugSpecFilter: "Monk",
                        bugTitleFilter: "",
                        bugSpellFilter: "",
                        bugStatusFilter: "Open",
                        bugSevFilter: "All"
                    }
                };
            case 'REQUEST_BUGS':
                return {
                    ...state,
                    limit: action.limit,
                    bugs: state.bugs,
                    isLoading: true
                };
            case 'REQUEST_BUG_DETAIL':
                return {
                    ...state,
                    bugDetail: undefined,
                };
            case 'RECEIVE_BUGS':
                return {
                    ...state,
                    limit: action.limit,
                    bugs: action.bugs,
                    isLoading: false
                };
            case 'RECEIVE_BUGSTATS':
                return {
                    ...state,
                    bugStats: action.bugStats
                };
            case 'RECEIVE_BUG_DETAIL':
                return {
                    ...state,
                    bugDetail: action.bugDetail,
                };
            case 'SUBMIT_BUG':
                return {
                    ...state,
                    bugDetail: action.bugDetail,
                    isLoading: true
                };
            case 'DELETE_BUG':
                return {
                    ...state,
                    isLoading: true
                };
            case 'EDIT_BUG':
                return {
                    ...state,
                    bugDetail: action.bugDetail,
                    isLoading: true
                };
            case 'SUBMIT_BUG_RESPONSE':
                return {
                    ...state,
                    isLoading: false
                };
            case 'EDIT_BUG_RESPONSE':
                return {
                    ...state,
                    isLoading: false
                };
            case 'DELETE_BUG_RESPONSE':
                return {
                    ...state,
                    isLoading: false
                };
            case 'RECEIVE_PENDING_BUGS':
                return {
                    ...state,
                    pendingBugs: action.bugs
                };
            default:
                return state;
        }
    };

// ------------
// UTILS

export const getBadgeColour = (tag: string) => {
    switch (tag) {
        case "legendary":
            return "legendary";
        case "conduit":
            return "conduit";
        case "feature request":
            return "feature";
        case "covenant":
            return "covenant";
        default:
            return "primary";
    }
}
