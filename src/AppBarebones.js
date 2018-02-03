import React from 'react';
import Reboot from 'material-ui/Reboot';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui-icons/Delete';
import SaveIcon from 'material-ui-icons/Save';
import AddIcon from 'material-ui-icons/Add';
import InputIcon from 'material-ui-icons/Input';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import CopyIcon from 'material-ui-icons/ContentCopy';

import { withStyles } from 'material-ui/styles';

const styles = theme => ({
  root: theme.mixins.gutters({
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit * 6,
    paddingBottom: theme.spacing.unit * 6,
  }),
  button: {
    margin: theme.spacing.unit,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  table: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3
  }
});

const {ipcRenderer} = require('electron');

class AppBarebones extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      masterPassword: '',
      isError: false,
      passwords: []
    };
    this.onChange = this.onChange.bind(this);
    this.reloadFromFile = this.reloadFromFile.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.addRow = this.addRow.bind(this);
    this.deleteRow = this.deleteRow.bind(this);
    this.onMasterPasswordInputChange = this.onMasterPasswordInputChange.bind(this);
  }

  componentWillMount() {
    ipcRenderer.on('passwords', (event, state) => {
      this.setState(state);
    });
  }

  onMasterPasswordInputChange(event) {
    this.setState({
      masterPassword: event.target.value
    });
  }

  onChange(index, fieldName) {
    return (event) => {
      const value = event.target.value;
      this.setState((prevState) => {
        const nextPasswords = prevState.passwords;
        nextPasswords[index][fieldName] = value;
        return {
          passwords: nextPasswords
        };
      })
    }
  }

  reloadFromFile(event) {
    event.preventDefault();
    ipcRenderer.send('get-passwords', this.state.masterPassword);
    this.setState({
      masterPassword: '',
    });
  }

  saveChanges() {
    const toSave = {
      passwords: this.state.passwords
    };
    ipcRenderer.send('save-changes', toSave);
  }

  addRow() {
    this.setState((prevState) => {
      return {
        passwords: [...prevState.passwords, {
          service: '',
          username: '',
          password: '',
        }],
      };
    })
  }

  deleteRow(index) {
    return () => {
      this.setState((prevState) => {
        const temp = prevState.passwords;
        temp.splice(index, 1)
        return {
          passwords: temp,
        };
      })
    }
  }

  render() {
    const { classes } = this.props;

    const rows = this.state.passwords.map((password, index) => {
      return (
        <tr key={index}>
          <td><TextField className={classes.textField} value={password.service} onChange={this.onChange(index, 'service')} /></td>
          <td><Input
            endAdornment={<InputAdornment position="end"><CopyIcon /></InputAdornment>}
            className={classes.textField}
            value={password.username}
            onChange={this.onChange(index, 'username')} /></td>
          <td><Input
            endAdornment={<InputAdornment position="end"><CopyIcon /></InputAdornment>}
            className={classes.textField}
            value={password.password}
            onChange={this.onChange(index, 'password')} /></td>
          <td><IconButton onClick={this.deleteRow(index)}><DeleteIcon /></IconButton></td>
        </tr>
      );
    })

    return (
      <div>
        <Reboot />
        <Paper className={classes.root}>
          <Grid direction="column" container alignItems="center">
            <form onSubmit={this.reloadFromFile}>
              <TextField
                className={classes.textField}
                type="password"
                placeholder="Enter password"
                onChange={this.onMasterPasswordInputChange}
                value={this.state.masterPassword}
                error={this.state.isError}
              />
              <Button raised type="submit" className={classes.button}><InputIcon className={classes.leftIcon} />Load from file</Button>
            </form>
            <table className={classes.table}><tbody>
              {rows}
            </tbody></table>
            <div>
              <Button raised onClick={this.saveChanges} className={classes.button}><SaveIcon className={classes.leftIcon} />Save changes</Button>
              <Button raised onClick={this.addRow} className={classes.button}><AddIcon className={classes.leftIcon} />Add row</Button>
            </div>
          </Grid>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(AppBarebones);
