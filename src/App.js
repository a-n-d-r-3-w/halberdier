import React from 'react';
import Reboot from 'material-ui/Reboot';
import Paper from 'material-ui/Paper';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
const {ipcRenderer} = require('electron');
import IconButton from 'material-ui/IconButton';
// import Visibility from 'material-ui-icons/Visibility';
// import VisibilityOff from 'material-ui-icons/VisibilityOff';

const styles = theme => ({
  root: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3
  }),
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passwords: []
    };
  }

  componentDidMount() {
    ipcRenderer.on('passwords', (event, passwords) => {
      this.setState({
        passwords
      })
    });
    ipcRenderer.send('get-passwords');
  }

  render() {
    const listItems = this.state.passwords.map((password, index) => {
      return (
        <ListItem key={index}>
          <Grid container>
            <Grid item xs={4}>
              <ListItemText primary={password.service} />
            </Grid>
            <Grid item xs={4}>
              <ListItemText primary={password.username} />
            </Grid>
            <Grid item xs={4}>
              <ListItemText primary={password.password} />
            </Grid>
          </Grid>
          <Input
            id="adornment-password"
            type={this.state.showPassword ? 'text' : 'password'}
            value={this.state.password}
            endAdornment={
              <InputAdornment position="end">
                <IconButton>
                  {this.state.showPassword ? <i className="material-icons">face</i> : <i className="material-icons">face</i>}
                </IconButton>
              </InputAdornment>
            }
          />
        </ListItem>
      );
    })

    const { classes } = this.props;
    return (
      <div>
        <Reboot />
        <Paper className={classes.root}>
          <Typography type="headline">
            Add password
          </Typography>
          <form noValidate autoComplete="off">
            <Grid container spacing={16} alignItems="center">
              <Grid item>
                <TextField
                  id="username"
                  label="Username"
                />
              </Grid>
              <Grid item>
                <TextField
                  id="password"
                  label="Password"
                />
              </Grid>
              <Grid item>
                <Button>Add</Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
        <Paper className={classes.root}>
          <List component="nav">
              {listItems}
            </List>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(App);
