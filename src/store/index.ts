import * as Bugs from './Bugs';
import * as User from './User';
import * as Notifications from './Notifications';
import * as Assets from './Assets';
import * as Comments from './Comments';
import { reducer as toastrReducer } from 'react-redux-toastr';

// The top-level state object
export interface ApplicationState {
    bugs: Bugs.BugsState | undefined;
    user: User.UserState | undefined;
    assets: Assets.AssetState | undefined;
    notifications: Notifications.NotificationsState | undefined;
    comments: Comments.CommentsState | undefined;
}

export const reducers = {
    bugs: Bugs.reducer,
    user: User.reducer,
    notifications: Notifications.reducer,
    assets: Assets.reducer,
    comments: Comments.reducer,
    toastr: toastrReducer 
};

export interface AppThunkAction<TAction> {
    (dispatch: (action: TAction) => void, getState: () => ApplicationState): void;
}
