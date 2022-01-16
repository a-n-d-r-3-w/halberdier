import React from "react";
import PropTypes from "prop-types";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import VisibilityOnIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import HListItem from "./HListItem";
import HReloadFromFileButton from "./HReloadFromFileButton";
import HSaveChangesButton from "./HSaveChangesButton";
import HSaveWithNewPasswordButton from "./HSaveWithNewPasswordButton";
import HFilterInput from "./HFilterInput";
import electron, { clipboard } from "electron";
import halberd from "./halberd.png";

const APP_NAME = "Halberdier";

const { ipcRenderer } = electron;

class App extends React.Component {
  static filter(items, filterText) {
    const filterFn = (item) =>
      item.service.toLowerCase().indexOf(filterText) !== -1;
    return items.filter(filterFn);
  }

  constructor(props) {
    super(props);
    this.state = {
      loadPassword: "",
      savePassword: "",
      savePassword2: "",
      masterPassword: "",
      isLoadError: false,
      isSaveError: false,
      items: [],
      filteredItems: [],
      fileExists: ipcRenderer.sendSync("get-file-exists"),
      isLoadDialogOpen: ipcRenderer.sendSync("get-file-exists"),
      isSaveDialogOpen: false,
      isUpdatePasswordDialogOpen: false,
      isDirty: false,
      filterText: "",
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
    this.onSavePasswordInputChange2 =
      this.onSavePasswordInputChange2.bind(this);
    this.onFilterTextChange = this.onFilterTextChange.bind(this);
    this.handleClickReloadButton = this.handleClickReloadButton.bind(this);
    this.handleClickSaveButton = this.handleClickSaveButton.bind(this);
    this.handleClickUpdatePasswordButton =
      this.handleClickUpdatePasswordButton.bind(this);
    this.handleCloseLoadDialog = this.handleCloseLoadDialog.bind(this);
    this.handleCloseSaveDialog = this.handleCloseSaveDialog.bind(this);
    this.handleCloseUpdatePasswordDialog =
      this.handleCloseUpdatePasswordDialog.bind(this);
    this.toggleShowPasswords = this.toggleShowPasswords.bind(this);
  }

  handleClickReloadButton() {
    if (this.state.masterPassword) {
      this.setState(
        (prevState) => ({
          loadPassword: prevState.masterPassword,
        }),
        this.loadFromFile
      );
      return;
    }
    this.setState({ isLoadDialogOpen: true });
  }

  handleCloseLoadDialog() {
    this.setState({ isLoadDialogOpen: false, loadPassword: "" });
  }

  handleClickSaveButton() {
    if (this.state.masterPassword) {
      this.setState(
        (prevState) => ({
          savePassword: prevState.masterPassword,
        }),
        this.saveChanges
      );
      return;
    }
    this.setState({ isSaveDialogOpen: true });
  }

  handleCloseSaveDialog() {
    this.setState({
      isSaveDialogOpen: false,
      savePassword: "",
      savePassword2: "",
    });
  }

  handleClickUpdatePasswordButton() {
    this.setState({ isUpdatePasswordDialogOpen: true });
  }

  handleCloseUpdatePasswordDialog() {
    this.setState({
      isUpdatePasswordDialogOpen: false,
      savePassword: "",
      savePassword2: "",
    });
  }

  UNSAFE_componentWillMount() {
    ipcRenderer.on("load-success", (event, loadedData) => {
      this.setState(
        (prevState) => ({
          items: loadedData.items,
          filteredItems: App.filter(loadedData.items, prevState.filterText),
          isLoadDialogOpen: false,
          isLoadError: false,
          isDirty: false,
          masterPassword: loadedData.masterPassword,
        }),
        () => {
          new Notification(APP_NAME, { body: `Items loaded.`, silent: true });
        }
      );
    });

    ipcRenderer.on("load-error", () => {
      this.setState({ isLoadError: true });
    });

    ipcRenderer.on("save-success", () => {
      this.setState(
        {
          isSaveDialogOpen: false,
          isUpdatePasswordDialogOpen: false,
          isSaveError: false,
          isDirty: false,
          fileExists: ipcRenderer.sendSync("get-file-exists"),
        },
        () => {
          new Notification(APP_NAME, { body: `Items saved.`, silent: true });
        }
      );
    });

    ipcRenderer.on("save-error", () => {
      this.setState({ isSaveError: true });
    });
  }

  onLoadPasswordInputChange(event) {
    this.setState({ loadPassword: event.target.value });
  }

  onSavePasswordInputChange(event) {
    this.setState({ savePassword: event.target.value });
  }

  onSavePasswordInputChange2(event) {
    this.setState({ savePassword2: event.target.value });
  }

  onFilterTextChange(event) {
    const filterText = event.target.value.toLowerCase();
    this.setState((prevState) => ({
      filterText,
      filteredItems: App.filter(prevState.items, filterText),
    }));
  }

  onChange(id, fieldName) {
    return (event) => {
      const value = event.target.value;
      this.setState((prevState) => {
        const nextItems = prevState.items;
        nextItems.find((item) => item.id === id)[fieldName] = value;
        return {
          items: nextItems,
          filteredItems: App.filter(nextItems, prevState.filterText),
          isDirty: true,
        };
      });
    };
  }

  loadFromFile(event) {
    if (event) {
      event.preventDefault();
    }
    ipcRenderer.send("get-items", this.state.loadPassword);
    this.setState({ loadPassword: "" });
  }

  saveChanges(event) {
    if (event) {
      event.preventDefault();
    }
    const toSave = { items: this.state.items };
    ipcRenderer.send("save-changes", toSave, this.state.savePassword);
    this.setState({ savePassword: "", savePassword2: "" });
  }

  addItem() {
    this.setState(
      {
        filterText: "",
      },
      () => {
        this.setState((prevState) => {
          const newItem = {
            id: Date.now().toString(16),
            service: "",
            username: "",
            password: "",
          };
          const newItems = [newItem, ...prevState.items];
          return {
            items: newItems,
            filteredItems: App.filter(newItems, prevState.filterText),
            isDirty: true,
          };
        });
      }
    );
  }

  deleteItem(id) {
    return () => {
      this.setState((prevState) => {
        const newItems = prevState.items.filter((item) => item.id !== id);
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
      clipboard.writeText(
        this.state.items.find((password) => password.id === id)[fieldName]
      );
      new Notification(APP_NAME, {
        body: `Copied ${fieldName}. Clipboard will be cleared in 20 seconds.`,
        silent: true,
      });
      setTimeout(() => {
        clipboard.clear();
      }, 20000);
    };
  }

  toggleShowPasswords() {
    this.setState((prevState) => ({
      showPasswords: !prevState.showPasswords,
    }));
  }

  render() {
    const listItems = this.state.filteredItems.map((item, index) => {
      return (
        <HListItem
          key={index}
          items={this.state.items}
          showPasswords={this.state.showPasswords}
          item={item}
          deleteItem={this.deleteItem}
          onChange={this.onChange}
          copyField={this.copyField}
        />
      );
    });

    return (
      <div>
        <Paper>
          <Grid direction="column" container alignItems="center" spacing={40}>
            <Grid item>
              <Typography variant="h3" align="center">
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
                handleClickUpdatePasswordButton={
                  this.handleClickUpdatePasswordButton
                }
                items={this.state.items}
                fileExists={this.state.fileExists}
                isUpdatePasswordDialogOpen={
                  this.state.isUpdatePasswordDialogOpen
                }
                handleCloseUpdatePasswordDialog={
                  this.handleCloseUpdatePasswordDialog
                }
                saveChanges={this.saveChanges}
                onSavePasswordInputChange={this.onSavePasswordInputChange}
                onSavePasswordInputChange2={this.onSavePasswordInputChange2}
                savePassword={this.state.savePassword}
                savePassword2={this.state.savePassword2}
                isSaveError={this.state.isSaveError}
              />
            </Grid>
            {this.state.items.length !== 0 && (
              <Grid item>
                <HFilterInput
                  filterText={this.state.filterText}
                  onFilterTextChange={this.onFilterTextChange}
                />
              </Grid>
            )}
            <Grid item>
              <Button variant="contained" onClick={this.addItem}>
                <AddIcon />
                Add row
              </Button>
              <Button variant="contained" onClick={this.toggleShowPasswords}>
                {this.state.showPasswords ? (
                  <VisibilityOffIcon />
                ) : (
                  <VisibilityOnIcon />
                )}
                {this.state.showPasswords ? "Hide passwords" : "Show passwords"}
              </Button>
            </Grid>
            <Grid item>
              <List>{listItems}</List>
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object,
};

export default App;
