import * as React from "react";
import { Route } from "react-router";
import Layout from "./components/Layout";
import Bugs from "./components/Bugs/BugsView";
import BugDetailView from "./components/Bugs/BugDetailView";
import NewBugView from "./components/Bugs/NewBugView";
import BugEditView from "./components/Bugs/BugEditView";
import UserLoginView from "./components/User/UserLoginView";
import UsersView from "./components/User/UsersView";
import UserProfileView from "./components/User/UserProfile";
import UserRegisterView from "./components/User/UserRegisterView";
import GameAssetView from "./components/GameAssetsView";
import AplView from "./components/AplView";
import AboutView from "./components/AboutView";
import TermsView from "./components/TermsView";
import HelpView from "./components/HelpView";
import ControlPanelView from './components/Mods/ControlPanelView';
import Dashboard from './components/Dashboard';


import "react-redux-toastr/lib/css/react-redux-toastr.min.css";
import "./assets/sass/bugwalker-freya.scss?v=0.0.4";
import "./custom.css";

export default () => (
    <Layout>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/bugs" component={Bugs} />
        <Route exact path="/bugs/:bugId" component={BugDetailView} />
        <Route exact path="/bugs/edit/:bugId" component={BugEditView} />
        <Route exact path="/submit-bug" component={NewBugView} />
        <Route exact path="/assets" component={GameAssetView} />
        <Route exact path="/apl" component={AplView} />
        <Route exact path="/purps/cp" component={ControlPanelView} />
        <Route exact path="/users/login" component={UserLoginView} />
        <Route exact path="/users" component={UsersView} />
        <Route exact path="/user/:userId" component={UserProfileView} />
        <Route exact path="/users/register" component={UserRegisterView} />
        <Route exact path="/about" component={AboutView} />
        <Route exact path="/terms" component={TermsView} />
        <Route exact path="/help" component={HelpView} />
    </Layout>
);
