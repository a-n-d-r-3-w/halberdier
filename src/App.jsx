import React from 'react';
import Reboot from 'material-ui/Reboot';
import Paper from 'material-ui/Paper';
import Button from 'material-ui/Button';
import SaveIcon from 'material-ui-icons/Save';
import AddIcon from 'material-ui-icons/Add';
import SearchIcon from 'material-ui-icons/Search';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import Input, {InputAdornment} from 'material-ui/Input';
import List from 'material-ui/List';
import Typography from 'material-ui/Typography';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import VisibilityOnIcon from 'material-ui-icons/Visibility';
import VisibilityOffIcon from 'material-ui-icons/VisibilityOff';
import HListItem from './HListItem';
import HReloadFromFileButton from './HReloadFromFileButton';
import HSaveChangesButton from './HSaveChangesButton';
import HSaveWithNewPasswordButton from './HSaveWithNewPasswordButton';

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
        this.copyField = this.copyField.bind(this);
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
            return <HListItem
                items={this.state.items}
                showPassword={this.state.showPassword}
                item={item}
                deleteItem={this.deleteItem}
                onChange={this.onChange}
                copyField={this.copyField}
            />
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
                            <HReloadFromFileButton
                                handleClickReloadButton={this.handleClickReloadButton}
                                fileExists={this.state.fileExists}
                                isDirty={this.state.isDirty}
                                isLoadDialogOpen={this.state.isLoadDialogOpen}
                                handleCloseLoadDialog={this.handleCloseLoadDialog}
                                loadFromFile={this.loadFromFile}
                                onLoadPasswordInputChange={this.onLoadPasswordInputChange}
                                loadPassword={this.state.loadPassword}
                                isLoadError={this.state.isLoadError}
                            />
                            <HSaveChangesButton
                                handleClickSaveButton={this.handleClickSaveButton}
                                items={this.state.items}
                                isDirty={this.state.isDirty}
                                isSaveDialogOpen={this.state.isSaveDialogOpen}
                                handleCloseSaveDialog={this.handleCloseSaveDialog}
                                saveChanges={this.saveChanges}
                                onSavePasswordInputChange={this.onSavePasswordInputChange}
                                onSavePasswordInputChange2={this.onSavePasswordInputChange2}
                                savePassword={this.state.savePassword}
                                savePassword2={this.state.savePassword2}
                                isSaveError={this.state.isSaveError}
                            />
                            <HSaveWithNewPasswordButton
                                handleClickUpdatePasswordButton={this.handleClickUpdatePasswordButton}
                                items={this.state.items}
                                fileExists={this.state.fileExists}
                                isUpdatePasswordDialogOpen={this.state.isUpdatePasswordDialogOpen}
                                handleCloseUpdatePasswordDialog={this.handleCloseUpdatePasswordDialog}
                                saveChanges={this.saveChanges}
                                onSavePasswordInputChange={this.onSavePasswordInputChange}
                                onSavePasswordInputChange2={this.onSavePasswordInputChange2}
                                savePassword={this.state.savePassword}
                                savePassword2={this.state.savePassword2}
                                isSaveError={this.state.isSaveError}
                            />
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
