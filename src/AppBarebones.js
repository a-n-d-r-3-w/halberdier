import React from 'react';
const {ipcRenderer} = require('electron');

class AppBarebones extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      passwords: [
        {
          service: 'sadf',
          username: '',
          password: 'hi',
        }
      ]
    };
    this.onChange = this.onChange.bind(this);
    this.reloadFromFile = this.reloadFromFile.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
  }

  componentWillMount() {
    ipcRenderer.on('passwords', (event, state) => {
      this.setState(state);
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

  reloadFromFile() {
    ipcRenderer.send('get-passwords');
  }

  saveChanges() {
    ipcRenderer.send('save-changes', this.state);
  }

  render() {
    const rows = this.state.passwords.map((password, index) => {
      return (
        <tr key={index}>
          <td><input value={password.service} onChange={this.onChange(index, 'service')}></input></td>
          <td><input value={password.username} onChange={this.onChange(index, 'username')}></input></td>
          <td><input value={password.password} onChange={this.onChange(index, 'password')}></input></td>
        </tr>
      );
    })

    const { classes } = this.props;
    return (
      <div>
        <table><tbody>
          {rows}
        </tbody></table>
        <button onClick={this.reloadFromFile}>Reload from file</button><br />
        <button onClick={this.saveChanges}>Save changes</button>
      </div>
    );
  }
}

export default AppBarebones;
