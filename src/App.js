import React, { Component } from 'react';
import './App.css';
import FormContainer from './containers/FormContainer';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';

class App extends Component {

  render() {
    return (
      <Container component="main" maxWidth="sm">
        <CssBaseline />
          <h3>
              Markup Calculator
          </h3>
          <FormContainer />
      </Container>
    );
  }
}

export default App;