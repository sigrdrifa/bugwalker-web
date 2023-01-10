import * as React from 'react';
import { getBaseTitle } from '../store/Constants';

export default class TermsView extends React.PureComponent<{}, {}> {
    public componentDidMount()
    {
        document.title = " Terms and Conditions | " + getBaseTitle();
    }

    public render() {
        return (
            <React.Fragment>
                <h4>Bugwalker.io Terms and Conditions</h4>
                <hr />
                <p>Coming soon.</p>
                <br />
                <h4>Privacy Policy</h4>
                <hr />
                <ul>
                    <li><a href="/terms#privacy-policy-what-data">What data do we collect</a></li>
                        <li><a href="/terms#privacy-policy-data-store">How do we store the data</a></li>
                    <li><a href="/terms#privacy-policy-what-are-cookies">What are Cookies</a></li>
                    <li><a href="/terms#privacy-policy-how-we-use-cookies">How do we use Cookies</a></li>
                    <li><a href="/terms#privacy-policy-how-to-reach-us">How to reach us</a></li></ul>
                <div className="privacy-policy">
                    <div id="privacy-policy-what-data">
                        <h5>What data do we collect</h5>
                        <p>We only collect data that is relevant to user authentication such as the user's username and encrypted password.</p>

                    </div>
                    <div id="privacy-policy-data-store">
                        <h5>How do we store the data</h5>
                        <p>User data is stored in a secure datacentre with the user's password fully encrypted and unavailable to the site administrators.</p>
                    </div>
                    <div id="privacy-policy-what-are-cookies">
                        <h5>What are Cookies</h5>
                        <p>Cookies are text objects that are stored within the user's browser when visiting websites. We use Cookies to improve the user experience of our website. For more information on cookies see <a target="_blank" href="http://allaboutcookies.org" rel="noopener noreferrer">allaboutcookies.org</a></p>
                    </div>
                    <div id="privacy-policy-how-we-use-cookies">
                        <h5>How do we use Cookies</h5>
                        <p>We use cookies to improve the user experience of the website by allowing the user to stay signed in.</p>
                    </div>
                    <div id="privacy-policy-how-to-reach-us">
                        <h5>How to reach us</h5>
                        <p>If you have any questions, concerns or suggestions regarding our privacy policy or if you wish to exercise your data protection rights by requesting and/or deleting your data you can reach us by email at support[at]bugwalker.io</p>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
