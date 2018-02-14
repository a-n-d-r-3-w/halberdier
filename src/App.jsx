import React from 'react';
import Reboot from 'material-ui/Reboot';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui-icons/Delete';
import SaveIcon from 'material-ui-icons/Save';
import AddIcon from 'material-ui-icons/Add';
import RestoreIcon from 'material-ui-icons/Restore';
import SearchIcon from 'material-ui-icons/Search';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import Input, {InputLabel, InputAdornment} from 'material-ui/Input';
import CopyIcon from 'material-ui-icons/ContentCopy';
import List, {ListItem} from 'material-ui/List';
import Typography from 'material-ui/Typography';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import Tooltip from 'material-ui/Tooltip';
import {FormControl} from 'material-ui/Form';
import VisibilityOnIcon from 'material-ui-icons/Visibility';
import VisibilityOffIcon from 'material-ui-icons/VisibilityOff';

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
    formControl: {
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

    static filter(items, filterText) {
        const filterFn = item => item.service.toLowerCase().indexOf(filterText) !== -1;
        return items.filter(filterFn);
    }

    constructor(props) {
        super(props);
        this.state = {
            loadPassword: '',
            savePassword: '',
            savePassword2: '',
            masterPassword: '',
            isLoadError: false,
            isSaveError: false,
            items: [],
            filteredItems: [],
            fileExists: ipcRenderer.sendSync('get-file-exists'),
            isLoadDialogOpen: ipcRenderer.sendSync('get-file-exists'),
            isSaveDialogOpen: false,
            isUpdatePasswordDialogOpen: false,
            isDirty: false,
            filterText: '',
            showPasswords: false,
        };
        this.onChange = this.onChange.bind(this);
        this.loadFromFile = this.loadFromFile.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.addItem = this.addItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.onLoadPasswordInputChange = this.onLoadPasswordInputChange.bind(this);
        this.onSavePasswordInputChange = this.onSavePasswordInputChange.bind(this);
        this.onSavePasswordInputChange2 = this.onSavePasswordInputChange2.bind(this);
        this.onFilterTextChange = this.onFilterTextChange.bind(this);
        this.handleClickReloadButton = this.handleClickReloadButton.bind(this);
        this.handleClickSaveButton = this.handleClickSaveButton.bind(this);
        this.handleClickUpdatePasswordButton = this.handleClickUpdatePasswordButton.bind(this);
        this.handleCloseLoadDialog = this.handleCloseLoadDialog.bind(this);
        this.handleCloseSaveDialog = this.handleCloseSaveDialog.bind(this);
        this.handleCloseUpdatePasswordDialog = this.handleCloseUpdatePasswordDialog.bind(this);
        this.toggleShowPasswords = this.toggleShowPasswords.bind(this);
    }

    handleClickReloadButton() {
        if (this.state.masterPassword) {
            this.setState(prevState => ({
                loadPassword: prevState.masterPassword
            }), this.loadFromFile);
            return;
        }
        this.setState({ isLoadDialogOpen: true });
    };

    handleCloseLoadDialog() {
        this.setState({ isLoadDialogOpen: false, loadPassword: '' });
    };

    handleClickSaveButton() {
        if (this.state.masterPassword) {
            this.setState(prevState => ({
                savePassword: prevState.masterPassword
            }), this.saveChanges);
            return;
        }
        this.setState({ isSaveDialogOpen: true });
    };

    handleCloseSaveDialog() {
        this.setState({ isSaveDialogOpen: false, savePassword: '', savePassword2: '' });
    };

    handleClickUpdatePasswordButton() {
        this.setState({ isUpdatePasswordDialogOpen: true });
    }

    handleCloseUpdatePasswordDialog() {
        this.setState({ isUpdatePasswordDialogOpen: false, savePassword: '', savePassword2: '' });
    };

    componentWillMount() {
        ipcRenderer.on('load-success', (event, loadedData) => {
            this.setState(prevState => ({
                items: loadedData.items,
                filteredItems: App.filter(loadedData.items, prevState.filterText),
                isLoadDialogOpen: false,
                isLoadError: false,
                isDirty: false,
                masterPassword: loadedData.masterPassword,
            }), () => {
                new Notification(APP_NAME, {body: `Items loaded.`});
            });
        });

        ipcRenderer.on('load-error', () => { this.setState({ isLoadError: true }); });

        ipcRenderer.on('save-success', () => {
            this.setState({
                isSaveDialogOpen: false,
                isUpdatePasswordDialogOpen: false,
                isSaveError: false,
                isDirty: false,
                fileExists: ipcRenderer.sendSync('get-file-exists')
            }, () => {
                new Notification(APP_NAME, { body: `Items saved.` });
            });
        });

        ipcRenderer.on('save-error', () => { this.setState({ isSaveError: true }); });
    }

    onLoadPasswordInputChange(event) { this.setState({ loadPassword: event.target.value }); }

    onSavePasswordInputChange(event) { this.setState({ savePassword: event.target.value }); }

    onSavePasswordInputChange2(event) { this.setState({ savePassword2: event.target.value }); }

    onFilterTextChange(event) {
        const filterText = event.target.value.toLowerCase();
        this.setState(prevState => ({
            filterText,
            filteredItems: App.filter(prevState.items, filterText)
        }));
    }

    onChange(id, fieldName) {
        return (event) => {
            const value = event.target.value;
            this.setState((prevState) => {
                const nextItems = prevState.items;
                nextItems.find(item => item.id === id)[fieldName] = value;
                return {
                    items: nextItems,
                    filteredItems: App.filter(nextItems, prevState.filterText),
                    isDirty: true
                };
            });
        }
    }

    loadFromFile(event) {
        if (event) { event.preventDefault(); }
        ipcRenderer.send('get-items', this.state.loadPassword);
        this.setState({ loadPassword: '' });
    }

    saveChanges(event) {
        if (event) { event.preventDefault(); }
        const toSave = { items: this.state.items };
        ipcRenderer.send('save-changes', toSave, this.state.savePassword);
        this.setState({ savePassword: '', savePassword2: '' });
    }

    addItem() {
        this.setState({
            filterText: ''
        }, () => {
            this.setState((prevState) => {
                const newItem = {
                    id: Date.now().toString(16),
                    service: '',
                    username: '',
                    password: ''
                };
                const newItems = [newItem, ...prevState.items];
                return {
                    items: newItems,
                    filteredItems: App.filter(newItems, prevState.filterText),
                    isDirty: true,
                };
            });
        });
    }

    deleteItem(id) {
        return () => {
            this.setState((prevState) => {
                const newItems = prevState.items.filter(item => item.id !== id);
                return {
                    items: newItems,
                    filteredItems: App.filter(newItems, prevState.filterText),
                    isDirty: true,
                };
            });
        };
    }

    copyField(id, fieldName) {
        return () => {
            clipboard.writeText(this.state.items.find(password => password.id === id)[fieldName]);
            new Notification(APP_NAME, {body: `Copied ${fieldName}. Clipboard will be cleared in 20 seconds.`});
            setTimeout(() => { clipboard.clear(); }, 20000);
        }
    }

    toggleShowPasswords() {
        this.setState(prevState => ({
            showPasswords: !prevState.showPasswords
        }));
    }

    render() {
        const {classes} = this.props;

        const listItems = this.state.filteredItems.map(item => {
            return (
                <ListItem key={item.id} dense>
                    <Tooltip title="Delete row">
                        <IconButton onClick={this.deleteItem(item.id)}><DeleteIcon/></IconButton>
                    </Tooltip>
                    <FormControl className={classes.formControl}>
                        <InputLabel>Name</InputLabel>
                        <Input
                            value={item.service}
                            onChange={this.onChange(item.id, 'service')}/>
                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <InputLabel>Username</InputLabel>
                        <Input
                            endAdornment={
                                <InputAdornment position="end" onClick={this.copyField(item.id, 'username')}>
                                    <Tooltip title="Copy username">
                                        <div><IconButton
                                            className={classes.iconButton}
                                            color="primary"
                                            disabled={!this.state.items.find(password => password.id === item.id).username}>
                                            <CopyIcon className={classes.icon}/>
                                        </IconButton></div>
                                    </Tooltip>
                                </InputAdornment>
                            }
                            value={item.username}
                            onChange={this.onChange(item.id, 'username')}/>
                    </FormControl>
                    <FormControl className={classes.formControl}>
                        <InputLabel>Password</InputLabel>
                        <Input
                            type={this.state.showPasswords ? "text" : "password"}
                            endAdornment={
                                <InputAdornment position="end" onClick={this.copyField(item.id, 'password')}>
                                    <Tooltip title="Copy password">
                                        <div><IconButton
                                            className={classes.iconButton}
                                            color="primary"
                                            disabled={!this.state.items.find(password => password.id === item.id).password}
                                        >
                                            <CopyIcon className={classes.icon}/>
                                        </IconButton></div>
                                    </Tooltip>
                                </InputAdornment>
                            }
                            value={item.password}
                            onChange={this.onChange(item.id, 'password')}/>
                    </FormControl>
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
                                autoFocus
                                variant="raised"
                                onClick={this.handleClickReloadButton}
                                className={classes.button}
                                disabled={!this.state.fileExists || !this.state.isDirty}
                            >
                                <RestoreIcon className={classes.leftIcon}/>
                                Reload from file
                            </Button>
                            <Dialog
                                open={this.state.isLoadDialogOpen}
                                onClose={this.handleCloseLoadDialog}
                                aria-labelledby="load-dialog"
                            >
                                <DialogTitle id="load-dialog">Load items from ~/Dropbox/halberdier.dat</DialogTitle>
                                <form onSubmit={this.loadFromFile}>
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
                                onClick={this.handleClickSaveButton}
                                className={classes.button}
                                disabled={this.state.items.length === 0 || !this.state.isDirty}
                            >
                                <SaveIcon className={classes.leftIcon}/>
                                Save changes
                            </Button>
                            <Dialog
                                open={this.state.isSaveDialogOpen}
                                onClose={this.handleCloseSaveDialog}
                                aria-labelledby="save-dialog"
                            >
                                <DialogTitle id="save-dialog">
                                    Save items to ~/Dropbox/halberdier.dat.
                                    <Typography color="primary">File will be overwritten if it exists.</Typography>
                                </DialogTitle>
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
                                            Save
                                        </Button>
                                    </DialogActions>
                                </form>
                            </Dialog>
                            
                            <Button
                                variant="raised"
                                onClick={this.handleClickUpdatePasswordButton}
                                className={classes.button}
                                disabled={this.state.items.length === 0 || !this.state.fileExists}
                            >
                                <SaveIcon className={classes.leftIcon}/>
                                Save with new master password
                            </Button>
                            <Dialog
                                open={this.state.isUpdatePasswordDialogOpen}
                                onClose={this.handleCloseUpdatePasswordDialog}
                                aria-labelledby="save-dialog"
                            >
                                <DialogTitle id="save-dialog">
                                    Update password for ~/Dropbox/halberdier.dat.
                                    <Typography color="primary">File will be overwritten.</Typography>
                                </DialogTitle>
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
                                            onClick={this.handleCloseUpdatePasswordDialog}
                                            color="primary">
                                            Cancel
                                        </Button>
                                        <Button
                                            disabled={!this.state.savePassword || (this.state.savePassword !== this.state.savePassword2)}
                                            type="submit"
                                            color="primary">
                                            Save
                                        </Button>
                                    </DialogActions>
                                </form>
                            </Dialog>
                        </Grid>
                        {
                            (this.state.items.length !== 0) && <Grid item >
                                <Input
                                    placeholder="Filter"
                                    type="search"
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <SearchIcon className={classes.iconButton} />
                                        </InputAdornment>
                                    }
                                    value={this.state.filterText}
                                    onChange={this.onFilterTextChange}/>
                            </Grid>
                        }
                        <Grid item>
                            <Button variant="raised" onClick={this.addItem} className={classes.button}>
                                <AddIcon className={classes.leftIcon}/>
                                Add row
                            </Button>
                            <Button variant="raised" onClick={this.toggleShowPasswords} className={classes.button}>
                                {
                                    this.state.showPasswords ?
                                    <VisibilityOffIcon className={classes.leftIcon}/> :
                                    <VisibilityOnIcon className={classes.leftIcon}/>
                                }
                                {
                                    this.state.showPasswords ? "Hide passwords" : "Show passwords"
                                }
                            </Button>
                        </Grid>
                        <Grid item>
                            <List>
                                {listItems}
                            </List>
                        </Grid>
                    </Grid>
                </Paper>
            </div>
        );
    }
}

export default withStyles(styles)(App);
