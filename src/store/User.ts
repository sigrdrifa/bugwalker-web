import { Action, Reducer } from "redux";
import { AppThunkAction } from "./";
import { getApiBaseUrl } from "./Constants";
import { push } from "connected-react-router";
import { store } from "../index";
import { Bug } from "./Bugs";

// -----------------
// STATE

export interface UserState {
    username?: string;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    isVerified: boolean;
    lastAuthError?: number;
    token?: string;
    au?: AuthenticatedUser;
    users: User[];
    userProfile?: UserProfile;
    userRegistrationSuccess: boolean;
}

export interface LoginResponseMessage {
    lrmStatusCode: number;
    lrmMessage: string;
    lrmToken?: string;
}

export interface AuthenticatedUser {
    auSecret: string;
    auRole: number;
    auName: string;
    auId: number;
    auLoginTime: string;
}

export interface User {
    userLId: number;
    userLName: string;
    userLRole: number;
    userLCreatedTime: string;
    userLLastLogin: string;
    userLAvatar: number;
}

export interface UserProfile {
    userPId: number;
    userPName: string;
    userPRole: number;
    userPCreatedTime: string;
    userPLastLogin: string;
    userPAvatar: number;
    userPBugs: Bug[];
}

export interface UserChangeRoleParams {
    ucrId: number;
    ucrRole: number;
}

export interface UserChangedResponseMessage {
    ucMessageStatusCode: number;
    ucMessageUserId: number;
    ucMessageStatus: string;
    ucMessage: string;
}

export interface UserRegistration {
    userRegName: string;
    userRegEmail: string;
    userRegPass: string;
    userRegAvatar: number;
}

// -----------------
// ACTIONS

interface RequestLoginAction {
    type: "REQUEST_LOGIN";
    username: string;
    password: string;
}

interface RequestUserSecretAction {
    type: "REQUEST_USER_SECRET";
    token: string;
}

interface ReceiveLoginResponseAction {
    type: "RECEIVE_LOGIN_RESPONSE";
    lrm: LoginResponseMessage;
    userName?: string;
}

interface RequestLogoutAction {
    type: "REQUEST_LOGOUT";
}

interface ReceiveVerifyAuthResponseAction {
    type: "RECEIVE_USER_SECRET";
    au?: AuthenticatedUser;
    token?: string;
}

interface RequestUsersAction {
    type: "REQUEST_USERS";
}

interface ReceiveUsersAction {
    type: "RECEIVE_USERS";
    users: User[];
}

interface ClearUsersAction {
    type: "CLEAR_USERS";
}

interface RequestUserProfileAction {
    type: "REQUEST_USER_PROFILE";
    uId: number;
}

interface ReceiveUserProfileAction {
    type: "RECEIVE_USER_PROFILE";
    userProfile?: UserProfile;
}

interface ChangeRoleRequest {
    type: "REQUEST_CHANGE_ROLE";
    userProfile: UserProfile;
    ucrParams: UserChangeRoleParams;
}

interface UserRegistrationRequest {
    type: "REQUEST_USER_REGISTRATION";
    userRegistration: UserRegistration;
}

interface UserRegistrationResponseAction {
    type: "RECEIVE_USER_REGISTRATION";
    userRegResponse: UserChangedResponseMessage;
}

type KnownAction =
    | RequestLoginAction
    | ReceiveLoginResponseAction
    | RequestUserSecretAction
    | ReceiveVerifyAuthResponseAction
    | RequestLogoutAction
    | RequestUsersAction
    | ReceiveUsersAction
    | ClearUsersAction
    | RequestUserProfileAction
    | ReceiveUserProfileAction
    | ChangeRoleRequest
    | UserRegistrationRequest
    | UserRegistrationResponseAction;

// ----------------
// HELPERS
const saveUserStateToLocalStorage = (
    authUser: AuthenticatedUser,
    auToken: string
) => {
    if (window.localStorage) {
        console.log("persising user auth to localstorage");
        window.localStorage.setItem("bugwalkerAu", JSON.stringify(authUser));
        window.localStorage.setItem("bugwalkerAuToken", auToken);
    }
};

const loadUserStateFromLocalStorage = () => {
    if (window.localStorage) {
        const au = window.localStorage.getItem("bugwalkerAu");
        const auToken = window.localStorage.getItem("bugwalkerAuToken");

        let pAu: AuthenticatedUser;

        if (au !== null && au !== "") {
            pAu = JSON.parse(au);

            if (pAu && pAu.auId > 0 && pAu.auName.length > 0) {
                if (auToken !== null && auToken.length > 0) {
                    return {
                        isAuthenticated: true,
                        isAuthenticating: false,
                        isVerified: false,
                        users: [],
                        userProfile: undefined,
                        au: pAu,
                        token: auToken,
                        username: pAu.auName,
                        userRegistrationSuccess: false,
                    };
                }
            }
        }
    }
    return {
        isAuthenticated: false,
        isAuthenticating: false,
        isVerified: false,
        users: [],
        userProfile: undefined,
        userRegistrationSuccess: false,
    };
};

const clearUserStateFromLocalStorage = () => {
    if (window.localStorage) {
        console.log("remove user auth from localstorage");
        window.localStorage.removeItem("bugwalkerAu");
        window.localStorage.removeItem("bugwalkerAuToken");
    }
};

// -----------------
// ACTION CREATORS

export const actionCreators = {
    requestLogin: (
        username: string,
        password: string
    ): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const lwrUName = username.toLowerCase();

        dispatch({ type: "REQUEST_LOGIN", username: lwrUName, password });

        const appState = getState();
        if (appState && appState.user) {
            fetch(`${getApiBaseUrl()}/api/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ uldName: lwrUName, uldPass: password }),
            })
                .then(
                    (response) =>
                        response.json() as Promise<LoginResponseMessage>
                )
                .then((lrm) => {
                    dispatch({
                        type: "RECEIVE_LOGIN_RESPONSE",
                        lrm,
                        userName: lwrUName,
                    });
                })
                .catch((err) => {
                    let lrmfail: LoginResponseMessage = {
                        lrmStatusCode: 500,
                        lrmMessage: "Failed to authenticate",
                    };
                    dispatch({ type: "RECEIVE_LOGIN_RESPONSE", lrm: lrmfail });
                });
        }
    },
    requestVerifyAuth: (
        token: string,
        shouldRedirect: boolean
    ): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: "REQUEST_USER_SECRET", token });
        const appState = getState();
        if (appState && appState.user) {
            fetch(`${getApiBaseUrl()}/api/secret`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Access-Control-Request-Method": "GET",
                },
            })
                .then(
                    (response) => response.json() as Promise<AuthenticatedUser>
                )
                .then((au) => {
                    dispatch({ type: "RECEIVE_USER_SECRET", au, token });
                    if (shouldRedirect) {
                        store.dispatch(push("/bugs"));
                    }
                    store.dispatch({
                        type: "NEW_NOTIFICATION",
                        severity: 1,
                        title: `Welcome back, ${au.auName}!`,
                        message: "You have successfully logged in.",
                    });
                })
                .catch((err) => {
                    dispatch({ type: "RECEIVE_USER_SECRET" });
                });
        }
    },
    requestLogout: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: "REQUEST_LOGOUT" });
        store.dispatch({
            type: "NEW_NOTIFICATION",
            severity: 0,
            title: "Logged out",
            message: "You have been logged out.",
        });
    },
    requestUsers: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({ type: "REQUEST_USERS" });
        const appState = getState();
        if (appState && appState.user) {
            fetch(`${getApiBaseUrl()}/api/users`)
                .then((response) => response.json() as Promise<User[]>)
                .then((data) => {
                    dispatch({ type: "RECEIVE_USERS", users: data });
                });
        }
    },
    clearUsers: (): AppThunkAction<KnownAction> => (dispatch) => {
        dispatch({ type: "CLEAR_USERS" });
    },
    requestUserProfile: (userId: number): AppThunkAction<KnownAction> => (
        dispatch,
        getState
    ) => {
        dispatch({ type: "REQUEST_USER_PROFILE", uId: userId });
        const appState = getState();
        if (appState && appState.user) {
            fetch(`${getApiBaseUrl()}/api/user/${userId}`)
                .then((response) => response.json() as Promise<UserProfile>)
                .then((data) => {
                    dispatch({
                        type: "RECEIVE_USER_PROFILE",
                        userProfile: data,
                    });
                })
                .catch((err) => {
                    dispatch({
                        type: "RECEIVE_USER_PROFILE",
                        userProfile: undefined,
                    });
                    store.dispatch({
                        type: "NEW_NOTIFICATION",
                        severity: 3,
                        title: `Error - Failed to fetch user profile`,
                        message: err,
                    });
                });
        }
    },
    requestUserChangeRole: (
        up: UserProfile,
        ucr: UserChangeRoleParams
    ): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({
            type: "REQUEST_CHANGE_ROLE",
            userProfile: up,
            ucrParams: ucr,
        });
        const appState = getState();
        if (appState && appState.user) {
            const token = appState.user.token;

            if (!appState.user.au || !isUserRoleMod(appState.user.au.auRole)) {
                store.dispatch({
                    type: "NEW_NOTIFICATION",
                    severity: 3,
                    title: `Unauthorised`,
                    message: "Sorry, you can't do that",
                });
                return;
            }

            fetch(`${getApiBaseUrl()}/api/user/role`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "Access-Control-Request-Method": "POST",
                },
                body: JSON.stringify(ucr),
            })
                .then(
                    (response) =>
                        response.json() as Promise<UserChangedResponseMessage>
                )
                .then((data) => {
                    store.dispatch({
                        type: "NEW_NOTIFICATION",
                        severity: 1,
                        title: `OK`,
                        message: `User role changed for  ${data.ucMessageUserId}`,
                    });
                    const newUp = { ...up, userPRole: ucr.ucrRole };
                    dispatch({
                        type: "RECEIVE_USER_PROFILE",
                        userProfile: newUp,
                    });
                })
                .catch((err) => {
                    store.dispatch({
                        type: "NEW_NOTIFICATION",
                        severity: 3,
                        title: `Error - Failed to change user role`,
                        message: err,
                    });
                });
        }
    },

    requestRegisterUser: (
        userReg: UserRegistration
    ): AppThunkAction<KnownAction> => (dispatch, getState) => {
        dispatch({
            type: "REQUEST_USER_REGISTRATION",
            userRegistration: userReg,
        });
        const appState = getState();
        if (appState && appState.user) {
            fetch(`${getApiBaseUrl()}/api/users/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Request-Method": "POST",
                },
                body: JSON.stringify(userReg),
            })
                .then(
                    (response) =>
                        response.json() as Promise<UserChangedResponseMessage>
                )
                .then((ures) => {
                    dispatch({
                        type: "RECEIVE_USER_REGISTRATION",
                        userRegResponse: ures,
                    });
                })
                .catch((err) => {
                    dispatch({
                        type: "RECEIVE_USER_REGISTRATION",
                        userRegResponse: {
                            ucMessageStatusCode: 500,
                            ucMessageUserId: -1,
                            ucMessageStatus: "failed",
                            ucMessage: "failed",
                        },
                    });
                    console.log(err);
                    store.dispatch({
                        type: "NEW_NOTIFICATION",
                        severity: 3,
                        title: `Registration Failed`,
                        message: err
                    });
                });
        }
    },
};

// ----------------
// REDUCER

const unloadedState: UserState = loadUserStateFromLocalStorage();

export const reducer: Reducer<UserState> = (
    state: UserState | undefined,
    incomingAction: Action
): UserState => {
    if (state === undefined) {
        return unloadedState;
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case "REQUEST_LOGIN":
            return {
                ...state,
                username: action.username,
                isAuthenticating: true,
                isAuthenticated: false,
                lastAuthError: undefined,
            };
        case "REQUEST_LOGOUT":
            clearUserStateFromLocalStorage();
            return {
                ...state,
                username: undefined,
                isAuthenticated: false,
                isAuthenticating: false,
                lastAuthError: undefined,
                userRegistrationSuccess: false,
                token: undefined,
                au: undefined,
            };
        case "RECEIVE_LOGIN_RESPONSE":
            return {
                ...state,
                isAuthenticated: action.lrm.lrmStatusCode === 200,
                isAuthenticating: false,
                lastAuthError:
                    action.lrm.lrmStatusCode === 200 ? undefined : 500,
                username:
                    action.lrm.lrmStatusCode === 200
                        ? action.userName
                        : undefined,
                token: action.lrm.lrmToken,
            };
        case "RECEIVE_USER_SECRET":
            if (action.au && action.token) {
                // this is a persist to local storage
                saveUserStateToLocalStorage(action.au, action.token);
                return {
                    ...state,
                    token: action.token,
                    au: action.au,
                    isVerified: true,
                };
            } else {
                return {
                    ...state,
                    token: undefined,
                    au: undefined,
                    isAuthenticating: false,
                    isAuthenticated: false,
                    isVerified: false,
                };
            }
        case "RECEIVE_USERS":
            return {
                ...state,
                users: action.users.filter(x => x.userLRole > 0),
            };
        case "CLEAR_USERS":
            return {
                ...state,
                users: [],
            };
        case "RECEIVE_USER_PROFILE":
            return {
                ...state,
                userProfile: action.userProfile,
            };
        case "RECEIVE_USER_REGISTRATION":
            return {
                ...state,
                userRegistrationSuccess: action.userRegResponse.ucMessageStatusCode === 200
            }
        default:
            return state;

    }
};

// UTILS
// -------

export const getUserRoleTag = (userRole: number) => {
    switch (userRole) {
        case 0:
            return "Banned";
        case 1:
            return "Novice";
        case 2:
            return "Initiate";
        case 4:
            return "Moderator";
        default:
            return "Novice";
    }
};

export const isUserRoleValid = (userRole: number) => {
    // role zero means banned so anything greater
    // than zero is valid
    return userRole > 0;
};

export const isUserRoleMod = (userRole: number) => {
    return userRole >= 3;
};

export const isUserRoleInit = (userRole: number) => {
    return userRole >= 2;
};

export const isUserRoleAdmin = (userRole: number) => {
    return userRole >= 5;
};
