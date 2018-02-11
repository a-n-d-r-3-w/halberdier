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

    static filter(items, filterText) {
        const filterFn = item => item.service.toLowerCase().indexOf(filterText) !== -1;
        return items.filter(filterFn);
    }

    constructor(props) {
        // noinspection JSCheckFunctionSignatures
        super(props);
        this.state = {
            loadPassword: '',
            savePassword: '',
            savePassword2: '',
            isLoadError: false,
            isSaveError: false,
            items: [],
            filteredItems: [],
            isLoadDialogOpen: ipcRenderer.sendSync('get-file-exists'),
            isSaveDialogOpen: false,
            isDirty: false,
            filterText: '',
        };
        this.onChange = this.onChange.bind(this);
        this.openFile = this.openFile.bind(this);
        this.saveChanges = this.saveChanges.bind(this);
        this.addItem = this.addItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.onLoadPasswordInputChange = this.onLoadPasswordInputChange.bind(this);
        this.onSavePasswordInputChange = this.onSavePasswordInputChange.bind(this);
        this.onSavePasswordInputChange2 = this.onSavePasswordInputChange2.bind(this);
        this.onFilterTextChange = this.onFilterTextChange.bind(this);
        this.handleClickOpenLoadDialog = this.handleClickOpenLoadDialog.bind(this);
        this.handleClickOpenSaveDialog = this.handleClickOpenSaveDialog.bind(this);
        this.handleCloseLoadDialog = this.handleCloseLoadDialog.bind(this);
        this.handleCloseSaveDialog = this.handleCloseSaveDialog.bind(this);
    }

    handleClickOpenLoadDialog() {
        this.setState({ isLoadDialogOpen: true });
    };

    handleCloseLoadDialog() {
        this.setState({ isLoadDialogOpen: false, loadPassword: '' });
    };

    handleClickOpenSaveDialog() {
        this.setState({ isSaveDialogOpen: true });
    };

    handleCloseSaveDialog() {
        this.setState({ isSaveDialogOpen: false, savePassword: '', savePassword2: '' });
    };

    componentWillMount() {
        ipcRenderer.on('load-success', (event, loadedData) => {
            this.setState(prevState => ({
                items: loadedData.items,
                filteredItems: App.filter(loadedData.items, prevState.filterText),
                isLoadDialogOpen: false,
                isLoadError: false,
                isDirty: false,
            }), () => {
                new Notification(APP_NAME, {body: `Items loaded.`});
            });
        });

        ipcRenderer.on('load-error', () => { this.setState({ isLoadError: true }); });

        ipcRenderer.on('save-success', () => {
            this.setState({
                isSaveDialogOpen: false,
                isSaveError: false,
                isDirty: false,
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

    openFile(event) {
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

    render() {
        const {classes} = this.props;

        const listItems = this.state.filteredItems.map(item => {
            return (
                <ListItem key={item.id} dense>
                    <Tooltip title="Delete row">
                        <IconButton onClick={this.deleteItem(item.id)}><DeleteIcon/></IconButton>
                    </Tooltip>
                    <Input
                        className={classes.textField}
                        value={item.service}
                        onChange={this.onChange(item.id, 'service')}/>
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
                        className={classes.textField}
                        value={item.username}
                        onChange={this.onChange(item.id, 'username')}/>
                    <Input
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
                        className={classes.textField}
                        value={item.password}
                        onChange={this.onChange(item.id, 'password')}/>
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
                                onClick={this.handleClickOpenLoadDialog}
                                className={classes.button}
                            >
                                <RestoreIcon className={classes.leftIcon}/>
                                Reload from file
                            </Button>
                            <Dialog
                                open={this.state.isLoadDialogOpen}
                                onClose={this.handleCloseLoadDialog}
                                aria-labelledby="load-dialog"
                            >
                                <DialogTitle id="load-dialog">Load items from ~/halberdier.aes</DialogTitle>
                                <form onSubmit={this.openFile}>
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
                                disabled={this.state.items.length === 0 || !this.state.isDirty}
                            >
                                <SaveIcon className={classes.leftIcon}/>
                                Save
                            </Button>
                            <Dialog
                                open={this.state.isSaveDialogOpen}
                                onClose={this.handleCloseSaveDialog}
                                aria-labelledby="save-dialog"
                            >
                                <DialogTitle id="save-dialog">
                                    Save items to ~/halberdier.aes.
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
                                    className={classes.textField}
                                    value={this.state.filterText}
                                    onChange={this.onFilterTextChange}/>
                            </Grid>
                        }
                        <Grid item>
                            <Button variant="raised" onClick={this.addItem} className={classes.button}>
                                <AddIcon className={classes.leftIcon}/>
                                Add row
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
