import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';
import { getApiBaseUrl } from './Constants';
import { store } from '../index';
import { AuthenticatedUser } from './User';
import { push } from 'connected-react-router';

// -----------------
// STATE 

export interface CommentsState {
    lastFetch?: string,
    bugId: number,
    isFetching: boolean,
    isSubmitting: boolean,
    comments: Comment[]
}

export interface Comment {
    cId: number;
    cCreatedTime: string;
    cModifiedTime: string;
    cUserId: number;
    cUserName: string;
    cUserRole: number;
    cUserAvatar: number;
    cBugId: number;
    cStatus: number;
    cBody: string
}


interface ResponseMessage {
    resMessageStatusCode: number;
    resMessageStatus: string;
    resMessage: string;
}


// -----------------
// ACTIONS 

interface RequestCommentsAction {
    type: 'REQUEST_COMMENTS';
    bugId: number;
}

interface ReceiveCommentsAction {
    type: 'RECEIVE_COMMENTS';
    comments: Comment[];
    bugId: number;
    lastFetch: string;
}

interface SubmitComment {
    type: 'SUBMIT_COMMENT';
    comment: Comment;
    au: AuthenticatedUser;
}

interface SubitCommentResponse {
    type: 'SUBMIT_COMMENT_RESPONSE';
    rm: ResponseMessage;
}

type KnownAction = RequestCommentsAction | ReceiveCommentsAction | SubmitComment | SubitCommentResponse;

// -----------------
// ACTION CREATORS 

export const actionCreators = {
    requestComments: (bugId: number): AppThunkAction<KnownAction> => (dispatch, getState) => {

        dispatch({ type: 'REQUEST_COMMENTS', bugId });

        const appState = getState();
        if (appState && appState.assets) {
            fetch(`${getApiBaseUrl()}/api/comments/${bugId}`)
                .then(response => response.json() as Promise<Comment[]>)
                .then(data => {
                    dispatch({ 
                        type: 'RECEIVE_COMMENTS', 
                        comments: data, 
                        bugId,
                        lastFetch: new Date().toString() })
                })
                .catch(err => {
                    store.dispatch(
                        {
                            type: 'NEW_NOTIFICATION', severity: 2,
                            title: "Error while fetching comments", message: err
                        });
                });
        }
    },
    submitComment: (c: Comment): AppThunkAction<KnownAction> => (dispatch, getState) => {

        const appState = getState();
        if (appState && appState.comments) {
            if (!appState.user || !appState.user.au) {
                console.log("Attempted to submit comment without auth, shame!");
                store.dispatch(
                    {
                        type: 'NEW_NOTIFICATION', severity: 3, title: `Error - You are not logged in`,
                        message: "Attempted to submit a comment without being logged in."
                    });
                return;
            }
            const token = appState.user.token;

            dispatch({ type: 'SUBMIT_COMMENT', comment: c, au: appState.user.au});

            fetch(`${getApiBaseUrl()}/api/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Access-Control-Request-Method': 'POST'
                },
                body: JSON.stringify(c)
            })
                .then(response => response.json() as Promise<ResponseMessage>)
                .then(data => {
                    dispatch({ type: 'SUBMIT_COMMENT_RESPONSE', rm: data });
                    store.dispatch(
                        {
                            type: 'NEW_NOTIFICATION', severity: 1, title: `OK - Comment Posted`,
                            message: "All good."
                        });
                   store.dispatch(push(`/bugs/${c.cBugId}#latest-comment`));
                })
                .catch(err => {
                    let lrmfail: ResponseMessage =
                    {
                        resMessage: "Failed", resMessageStatus: "Failed", resMessageStatusCode: 500
                    }
                    dispatch({ type: 'SUBMIT_COMMENT_RESPONSE', rm: lrmfail });
                    store.dispatch(
                        {
                            type: 'NEW_NOTIFICATION', severity: 3, title: `Error - Failed to post comment`,
                            message: err
                        });
                });
        }
    }
};

// ----------------
// REDUCER

const unloadedState: CommentsState = { bugId: -1, comments: [], isFetching: false, isSubmitting: false };

export const reducer: Reducer<CommentsState> =
    (state: CommentsState | undefined, incomingAction: Action): CommentsState => {
        if (state === undefined) {
            return unloadedState;
        }

        const action = incomingAction as KnownAction;
        switch (action.type) {
            case 'SUBMIT_COMMENT':
                return {
                    ...state,
                    isSubmitting: true
                }
            case 'SUBMIT_COMMENT_RESPONSE':
                return {
                    ...state,
                    isSubmitting: false
                }
            case 'REQUEST_COMMENTS':
                return {
                    ...state,
                    isFetching: true
                };
            case 'RECEIVE_COMMENTS':
                return {
                    lastFetch: action.lastFetch,
                    isFetching: false,
                    isSubmitting: false,
                    comments: action.comments,
                    bugId: action.bugId
                }
            default:
                return state;
        }
    };
