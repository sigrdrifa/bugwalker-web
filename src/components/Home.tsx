import * as React from 'react';
import { connect } from 'react-redux';

const Home = () => (
  <div>
    <h1>Bugwalker Web</h1>
    <p>Test</p>
  </div>
);

export default connect()(Home);