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
import Input, {InputAdornment} from 'material-ui/Input';
import CopyIcon from 'material-ui-icons/ContentCopy';
import List, {ListItem} from 'material-ui/List';
import Typography from 'material-ui/Typography';

import {clipboard} from 'electron'

import {withStyles} from 'material-ui/styles';

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
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit
    },
    iconButton: {
        height: theme.typography.fontSize * 2
    },
    icon: {
        fontSize: theme.typography.fontSize * 1.5
    }
});

const {ipcRenderer} = require('electron');

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loadPassword: '',
            savePassword: '',
            isLoadError: false,
            isSaveError: false,
            passwords: []
        };
        this.onChange = this.onChange.bind(this);
        this.reloadFromFile = this.reloadFromFile.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.addRow = this.addRow.bind(this);
        this.deleteRow = this.deleteRow.bind(this);
        this.onLoadPasswordInputChange = this.onLoadPasswordInputChange.bind(this);
        this.onSavePasswordInputChange = this.onSavePasswordInputChange.bind(this);
    }

    componentWillMount() {
        ipcRenderer.on('passwords', (event, state) => {
            this.setState(state);
        });
        // this.reloadFromFile();
    }

    onLoadPasswordInputChange(event) {
        this.setState({
            loadPassword: event.target.value
        });
    }

    onSavePasswordInputChange(event) {
        this.setState({
            savePassword: event.target.value
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
        if (event) {
            event.preventDefault();
        }
        ipcRenderer.send('get-passwords', this.state.loadPassword);
        this.setState({
            loadPassword: '',
        });
    }

    saveChanges() {
        const toSave = {
            passwords: this.state.passwords
        };
        ipcRenderer.send('save-changes', toSave, this.state.savePassword);
        this.setState({
          savePassword: '',
        });
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
                temp.splice(index, 1);
                return {
                    passwords: temp,
                };
            })
        }
    }

    copyField(index, fieldName) {
        return () => {
            clipboard.writeText(this.state.passwords[index][fieldName]);
            new Notification('Passwords', {body: `Copied ${fieldName}. Clipboard will be cleared in 20 seconds.`});
            setTimeout(() => {
                clipboard.clear();
            }, 20000);
        }
    }

    render() {
        const {classes} = this.props;

        const listItems = this.state.passwords.map((entry, index) => {
            return (
                <ListItem key={index} dense>
                    <IconButton onClick={this.deleteRow(index)}><DeleteIcon/></IconButton>
                    <Input
                        className={classes.textField}
                        value={entry.service}
                        onChange={this.onChange(index, 'service')}/>
                    <Input
                        endAdornment={
                            <InputAdornment position="end" onClick={this.copyField(index, 'username')}>
                                <IconButton className={classes.iconButton}><CopyIcon
                                    className={classes.icon}/></IconButton>
                            </InputAdornment>
                        }
                        className={classes.textField}
                        value={entry.username}
                        onChange={this.onChange(index, 'username')}/>
                    <Input
                        endAdornment={
                            <InputAdornment position="end" onClick={this.copyField(index, 'password')}>
                                <IconButton className={classes.iconButton}><CopyIcon
                                    className={classes.icon}/></IconButton>
                            </InputAdornment>
                        }
                        className={classes.textField}
                        value={entry.password}
                        onChange={this.onChange(index, 'password')}/>
                </ListItem>
            );
        });

        return (
            <div>
                <Reboot/>
                <Paper className={classes.root}>
                    <Grid direction="column" container alignItems="center" spacing={40}>
                        <Grid item>
                            <Typography type="display2" align="center">Passwords</Typography>
                        </Grid>
                        <Grid item>
                            <form onSubmit={this.reloadFromFile}>
                                <TextField
                                    className={classes.textField}
                                    type="password"
                                    placeholder="Enter password"
                                    onChange={this.onLoadPasswordInputChange}
                                    value={this.state.loadPassword}
                                    error={this.state.isLoadError}
                                />
                                <Button
                                  disabled={!this.state.loadPassword} 
                                  raised type="submit" className={classes.button}><InputIcon
                                    className={classes.leftIcon}/>Load from file</Button>
                            </form>
                            <form onSubmit={this.reloadFromFile}>
                                <TextField
                                    className={classes.textField}
                                    type="password"
                                    placeholder="Enter password"
                                    onChange={this.onSavePasswordInputChange}
                                    value={this.state.savePassword}
                                    error={this.state.isSaveError}
                                />
                                <Button
                                    raised onClick={this.saveChanges}
                                    disabled={!this.state.savePassword}
                                    className={classes.button}>
                                    <SaveIcon className={classes.leftIcon}/>Save changes
                                  </Button>
                                </form>
                        </Grid>
                        <Grid item>
                            <List>
                                {listItems}
                            </List>
                        </Grid>
                        <Grid item>
                            <Button raised onClick={this.addRow} className={classes.button}><AddIcon
                                className={classes.leftIcon}/>Add row</Button>
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        );
    }
}

export default withStyles(styles)(App);
