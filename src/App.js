import React from 'react';
import './App.css';
import FormContainer from './containers/FormContainer';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  logo: {
    justifyContent: 'center',
    alignItems: 'center',
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '40%',
  },
}));

export default function App() {
  const classes = useStyles();

  return (
    <Container component="main" maxWidth="sm">
      <img src="dsi-logo.png" alt="logo" className={classes.logo}/>
      <CssBaseline />
        <FormContainer />
    </Container>
  );
}
