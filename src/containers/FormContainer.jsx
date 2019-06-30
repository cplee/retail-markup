import React, { useEffect } from 'react';  
import InputLabel from '@material-ui/core/InputLabel';
import NativeSelect from '@material-ui/core/NativeSelect';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import NumberFormat from 'react-number-format';
import FormControl from '@material-ui/core/FormControl';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';


const clientId =
  "763238195801-vqt0hkn4ag2foao41n5ujlss55tal838.apps.googleusercontent.com";
const apiKey = 
  "AIzaSyD52nPpXtkd_0qRGhWeQ99qWKZP1kzm3OA";
const spreadsheetId =
  process.env.REACT_APP_SHEET_ID || "1FtOAjhoz0KdBx17xEVkojwCtcmiRDTEnnFBtE8FjcrY";

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: theme.spacing(3, 2),
  },
  margin: {
    margin: theme.spacing(1),
  },
  withoutLabel: {
    marginTop: theme.spacing(3),
  },
  textField: {
    flexBasis: 200,
  },
}));

function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

function NumberFormatCustom(props) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={values => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
      thousandSeparator
      prefix="$"
    />
  );
}

NumberFormatCustom.propTypes = {
  inputRef: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};


export default function FormContainer() {
  const classes = useStyles();

  const [signedIn, setSignedIn] = React.useState(false);
  const [query, setQuery] = React.useState({
    vendor: '',
    product: '',
    cost: 0
  });
  const [vendorOptions, setVendorOptions] = React.useState([]);
  const [productOptions, setProductOptions] = React.useState([]);
  const [rates, setRates] = React.useState([]);
  const [rate, setRate] = React.useState([]);

  const signedInChanged = (s) => {
    setSignedIn(s);
    if (s) {
      loadRates();
    } else {
      window.gapi.auth2.getAuthInstance().signIn();
    }
  }

  const loadRates = () => {
    window.gapi.client.sheets.spreadsheets.values
    .batchGet({
      key: apiKey,
      spreadsheetId: spreadsheetId,
      ranges: [
        "Rules!A2:H100"
      ]
    })
    .then(response => {
      const rates = response.result.valueRanges[0].values;
      setRates(rates);
      setVendorOptions(['',...rates.map(r => r[0])].filter(onlyUnique).sort());
    });
  }

  const signIn = () => {
    window.gapi.load("client:auth2", () => {
      window.gapi.client
        .init({
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4"
          ],
          clientId: clientId,
          scope:
            "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly"
        })
        .then(() => {
          window.gapi.auth2
            .getAuthInstance()
            .isSignedIn.listen(signedInChanged);
          signedInChanged(
            window.gapi.auth2.getAuthInstance().isSignedIn.get()
          );
        });
    });
  }

  useEffect(() => {
    if(!signedIn) {
      signIn();
    }
  });

  const handleQueryChange = name => event => {
    setQuery({
      ...query,
      [name]: event.target.value
    });

    if (name === 'vendor') {
      const vendorRates = rates.filter(r => r[0] === event.target.value);
      setProductOptions(vendorRates.map(r => r[1]));
      setRate(vendorRates[0]);
    } else if (name === 'product') {
      setRate(rates.filter(r => r[0] === query.vendor && r[1] === event.target.value)[0]);
    }
  }

  const renderVendorOptions = () => {
    return vendorOptions.map((o,i) => {
      return (
        <option key={i}>{o}</option>
      )
    })
  }

  const renderProductOptions = () => {
    return productOptions.map((o,i) => {
      return (
        <option key={i}>{o}</option>
      )
    })
  }

  return(
    <div>
      <Paper className={classes.root}>
        <form className="container-fluid">
          <FormControl fullWidth={true} margin="normal">
            <InputLabel shrink htmlFor="vendor">
              Vendor
            </InputLabel>
            <NativeSelect 
              id="vendor"
              className={classes.formControl}
              value = {query.vendor}
              options = {vendorOptions}
              onChange = {handleQueryChange('vendor')}
            >
              {renderVendorOptions()}
            </NativeSelect>
          </FormControl>
          <FormControl fullWidth={true} margin="normal" style={productOptions.length > 1 ? {} : {display:'none'}}>
            <InputLabel shrink htmlFor="product">
              Product
            </InputLabel>
            <NativeSelect 
              id="product"
              className={classes.formControl}
              label="Product"
              value = {query.product}
              options = {productOptions}
              placeholder = {'Select Product'}
              onChange = {handleQueryChange('product')}
            >
              {renderProductOptions()}
            </NativeSelect>
          </FormControl>
          <FormControl fullWidth={true} margin="normal">
            <TextField
              label="Cost"
              className={classes.formControl}
              value={query.cost} 
              onChange = {handleQueryChange('cost')}
              InputProps={{
                inputComponent: NumberFormatCustom,
              }}
            />
          </FormControl>
        </form>
      </Paper>
      <Grid container className={classes.root} spacing={2} style={rate && rate.length ? {} : {display:'none'}}>
          <Grid container justify="center" spacing={5}>
              <Grid key="break-even" item>
                <Card className={classes.card}>
                  <CardContent>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                      Break Even
                    </Typography>
                    <Typography variant="h5" component="h2">
                      <NumberFormat 
                        thousandSeparator 
                        prefix="$"
                        displayType="text"
                        fixedDecimalScale={true}
                        decimalScale={2}
                        value={rate?query.cost * rate[5]:0}
                      />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid key="retail" item>
                <Card className={classes.card}>
                  <CardContent>
                    <Typography className={classes.title} color="textSecondary" gutterBottom>
                      Suggested Retail Price
                    </Typography>
                    <Typography variant="h5" component="h2">
                      <NumberFormat 
                        thousandSeparator 
                        prefix="$"
                        displayType="text"
                        fixedDecimalScale={true}
                        decimalScale={2}
                        value={rate?query.cost * rate[7]:0}
                      />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
          </Grid>
      </Grid>
    </div>
  )
}