import React from 'react';
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
    ipcRenderer.send('get-passwords');
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
    const rows = this.state.passwords.map((password, index) => {
      return (
        <tr key={index}>
          <td><input value={password.service} onChange={this.onChange(index, 'service')}></input></td>
          <td><input value={password.username} onChange={this.onChange(index, 'username')}></input></td>
          <td><input value={password.password} onChange={this.onChange(index, 'password')}></input></td>
          <td><button onClick={this.deleteRow(index)}>Delete row</button></td>
        </tr>
      );
    })

    const { classes } = this.props;
    return (
      <div>
        <form onSubmit={this.reloadFromFile}>
          <input
            type="password"
            placeholder="Enter password"
            onChange={this.onMasterPasswordInputChange}
            value={this.state.masterPassword}
          />
          <button type="submit">Load from file</button>
          {this.state.isError ? <span>Error</span> : null}
        </form>
        <table><tbody>
          {rows}
        </tbody></table>
        <button onClick={this.reloadFromFile}>Reload from file</button>
        <button onClick={this.saveChanges}>Save changes</button>
        <button onClick={this.addRow}>Add row</button>
      </div>
    );
  }
}

export default AppBarebones;
