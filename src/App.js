import React from 'react';
import Reboot from 'material-ui/Reboot';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui-icons/Delete';
import SaveIcon from 'material-ui-icons/Save';
import AddIcon from 'material-ui-icons/Add';
import FolderOpenIcon from 'material-ui-icons/FolderOpen';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import Input, {InputAdornment} from 'material-ui/Input';
import CopyIcon from 'material-ui-icons/ContentCopy';
import List, {ListItem} from 'material-ui/List';
import Typography from 'material-ui/Typography';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import Tooltip from 'material-ui/Tooltip';

import halberd from './halberd.png';

import {clipboard} from 'electron'

import {withStyles} from 'material-ui/styles';

const APP_NAME = 'Halberdier';

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
            savePassword2: '',
            isLoadError: false,
            isSaveError: false,
            passwords: [],
            isLoadDialogOpen: false,
            isSaveDialogOpen: false,
            isDirty: false,
        };
        this.onChange = this.onChange.bind(this);
        this.reloadFromFile = this.reloadFromFile.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.addRow = this.addRow.bind(this);
        this.deleteRow = this.deleteRow.bind(this);
        this.onLoadPasswordInputChange = this.onLoadPasswordInputChange.bind(this);
        this.onSavePasswordInputChange = this.onSavePasswordInputChange.bind(this);
        this.onSavePasswordInputChange2 = this.onSavePasswordInputChange2.bind(this);
        this.handleClickOpenLoadDialog = this.handleClickOpenLoadDialog.bind(this);
        this.handleClickOpenSaveDialog = this.handleClickOpenSaveDialog.bind(this);
        this.handleCloseLoadDialog = this.handleCloseLoadDialog.bind(this);
        this.handleCloseSaveDialog = this.handleCloseSaveDialog.bind(this);
    }

    handleClickOpenLoadDialog() {
        this.setState({ isLoadDialogOpen: true });
    };

    handleCloseLoadDialog() {
        this.setState({ isLoadDialogOpen: false });
    };

    handleClickOpenSaveDialog() {
        this.setState({ isSaveDialogOpen: true });
    };

    handleCloseSaveDialog() {
        this.setState({ isSaveDialogOpen: false });
    };

    componentWillMount() {
        ipcRenderer.on('load-success', (event, state) => {
            this.setState({
                passwords: state.passwords,
                isLoadDialogOpen: false,
                isLoadError: false,
                isDirty: false,
            }, () => {
                new Notification(APP_NAME, {body: `Passwords loaded.`});
            });
        });
        ipcRenderer.on('load-error', () => {
            this.setState({
                isLoadError: true,
            });
        });

        ipcRenderer.on('save-success', () => {
            this.setState({
                isSaveDialogOpen: false,
                isSaveError: false,
                isDirty: false,
            }, () => {
                new Notification(APP_NAME, {body: `Passwords saved.`});
            });
        });
        ipcRenderer.on('save-error', () => {
            this.setState({
                isSaveError: true,
            });
        })
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

    onSavePasswordInputChange2(event) {
        this.setState({
            savePassword2: event.target.value
        });
    }

    onChange(index, fieldName) {
        return (event) => {
            const value = event.target.value;
            this.setState((prevState) => {
                const nextPasswords = prevState.passwords;
                nextPasswords[index][fieldName] = value;
                return {
                    passwords: nextPasswords,
                    isDirty: true,
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

    saveChanges(event) {
        if (event) {
            event.preventDefault();
        }
        const toSave = {
            passwords: this.state.passwords
        };
        ipcRenderer.send('save-changes', toSave, this.state.savePassword);
        this.setState({
            savePassword: '',
            savePassword2: '',
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
                isDirty: true,
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
                    isDirty: true,
                };
            })
        }
    }

    copyField(index, fieldName) {
        return () => {
            clipboard.writeText(this.state.passwords[index][fieldName]);
            new Notification(APP_NAME, {body: `Copied ${fieldName}. Clipboard will be cleared in 20 seconds.`});
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
                    <Tooltip title="Delete row">
                        <IconButton onClick={this.deleteRow(index)}><DeleteIcon/></IconButton>
                    </Tooltip>
                    <Input
                        className={classes.textField}
                        value={entry.service}
                        onChange={this.onChange(index, 'service')}/>
                    <Input
                        endAdornment={
                            <InputAdornment position="end" onClick={this.copyField(index, 'username')}>
                                <Tooltip title="Copy username">
                                    <div><IconButton
                                        className={classes.iconButton}
                                        color="primary"
                                        disabled={!this.state.passwords[index].username}>
                                        <CopyIcon className={classes.icon}/>
                                    </IconButton></div>
                                </Tooltip>
                            </InputAdornment>
                        }
                        className={classes.textField}
                        value={entry.username}
                        onChange={this.onChange(index, 'username')}/>
                    <Input
                        endAdornment={
                            <InputAdornment position="end" onClick={this.copyField(index, 'password')}>
                                <Tooltip title="Copy password">
                                    <div><IconButton
                                        className={classes.iconButton}
                                        color="primary"
                                        disabled={!this.state.passwords[index].password}
                                    >
                                        <CopyIcon className={classes.icon}/>
                                    </IconButton></div>
                                </Tooltip>
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
                            <Typography variant="display2" align="center">
                                <img src={halberd} style={{ marginRight: "4px" }} />
                                Halberdier
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="raised"
                                onClick={this.handleClickOpenLoadDialog}
                                className={classes.button}
                            >
                                <FolderOpenIcon className={classes.leftIcon}/>
                                Open
                            </Button>
                            <Dialog
                                open={this.state.isLoadDialogOpen}
                                onClose={this.handleCloseLoadDialog}
                                aria-labelledby="load-dialog"
                            >
                                <DialogTitle id="load-dialog">Load passwords from ~/passwords.json</DialogTitle>
                                <form onSubmit={this.reloadFromFile}>
                                    <DialogContent>
                                            <TextField
                                                autoFocus
                                                fullWidth
                                                type="password"
                                                label="Master password"
                                                onChange={this.onLoadPasswordInputChange}
                                                value={this.state.loadPassword}
                                                error={this.state.isLoadError}
                                            />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button
                                            onClick={this.handleCloseLoadDialog}
                                            color="primary">
                                            Cancel
                                        </Button>
                                        <Button
                                            disabled={!this.state.loadPassword}
                                            type="submit"
                                            color="primary">
                                            Load
                                        </Button>
                                    </DialogActions>
                                </form>
                            </Dialog>
                            <Button
                                variant="raised"
                                onClick={this.handleClickOpenSaveDialog}
                                className={classes.button}
                                disabled={this.state.passwords.length === 0 || !this.state.isDirty}
                            >
                                <SaveIcon className={classes.leftIcon}/>
                                Save
                            </Button>
                            <Dialog
                                open={this.state.isSaveDialogOpen}
                                onClose={this.handleCloseSaveDialog}
                                aria-labelledby="load-dialog"
                            >
                                <DialogTitle id="load-dialog">Save passwords to ~/passwords.json</DialogTitle>
                                <form onSubmit={this.saveChanges}>
                                    <DialogContent>
                                        <TextField
                                            autoFocus
                                            fullWidth
                                            type="password"
                                            label="Master password"
                                            onChange={this.onSavePasswordInputChange}
                                            value={this.state.savePassword}
                                            error={this.state.isSaveError}
                                        />
                                        <TextField
                                            fullWidth
                                            type="password"
                                            label="Confirm master password"
                                            onChange={this.onSavePasswordInputChange2}
                                            value={this.state.savePassword2}
                                            error={this.state.isSaveError}
                                        />
                                    </DialogContent>
                                    <DialogActions>
                                        <Button
                                            onClick={this.handleCloseSaveDialog}
                                            color="primary">
                                            Cancel
                                        </Button>
                                        <Button
                                            disabled={!this.state.savePassword || (this.state.savePassword !== this.state.savePassword2)}
                                            type="submit"
                                            color="primary">
                                            Load
                                        </Button>
                                    </DialogActions>
                                </form>
                            </Dialog>
                        </Grid>
                        <Grid item>
                            <List>
                                {listItems}
                            </List>
                        </Grid>
                        <Grid item>
                            <Button variant="raised" onClick={this.addRow} className={classes.button}><AddIcon
                                className={classes.leftIcon}/>Add row</Button>
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        );
    }
}

export default withStyles(styles)(App);
