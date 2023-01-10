import { Action, Reducer } from 'redux';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface NotificationsState {
    notifications: Notification[];
}

interface Notification {
    severity: number,
    title: string, 
    message: string,
    options: any,
    icon?: string
}

// -----------------
// ACTIONS

export interface NewNotificationAction { 
    type: 'NEW_NOTIFICATION', 
    severity: number,
    title: string, 
    message: string, 
    timeOut: number,
    icon? : string
}

export type KnownAction = NewNotificationAction;

// ----------------
// ACTION CREATORS

export const actionCreators = {
    fireNewNotification: (severity: number, title: string, message: string, timeOut: number, icon?: string) => (
        { type: 'NEW_NOTIFICATION', severity, title, message, timeOut, icon } as NewNotificationAction)
};

// ----------------
// REDUCER

export const reducer: Reducer<NotificationsState> = (state: NotificationsState | undefined, incomingAction: Action): NotificationsState => {
    if (state === undefined) {
        return { notifications: [] };
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'NEW_NOTIFICATION':
            let n = { severity: action.severity, title: action.title, message: action.message, options: { timeOut: action.timeOut } } as Notification;
            return { notifications: [...state.notifications, n ] };
        default:
            return state;
    }
};
