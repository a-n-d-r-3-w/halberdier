import React from "react";
import PropTypes from "prop-types";
import ListItem from "@mui/material/ListItem";
import Tooltip from "@mui/material/Tooltip";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";

import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import CopyIcon from "@mui/icons-material/ContentCopy";

const HListItem = (props) => {
  const { item } = props;

  return (
    <ListItem key={item.id} dense>
      <Tooltip title="Delete row">
        <IconButton onClick={props.deleteItem(item.id)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <FormControl>
        <InputLabel>Name</InputLabel>
        <Input
          value={item.service}
          onChange={props.onChange(item.id, "service")}
        />
      </FormControl>
      <FormControl>
        <InputLabel>Username</InputLabel>
        <Input
          endAdornment={
            <InputAdornment
              position="end"
              onClick={props.copyField(item.id, "username")}
            >
              <Tooltip title="Copy username">
                <div>
                  <IconButton
                    color="primary"
                    disabled={
                      !props.items.find((password) => password.id === item.id)
                        .username
                    }
                  >
                    <CopyIcon />
                  </IconButton>
                </div>
              </Tooltip>
            </InputAdornment>
          }
          value={item.username}
          onChange={props.onChange(item.id, "username")}
        />
      </FormControl>
      <FormControl>
        <InputLabel>Password</InputLabel>
        <Input
          type={props.showPasswords ? "text" : "password"}
          endAdornment={
            <InputAdornment
              position="end"
              onClick={props.copyField(item.id, "password")}
            >
              <Tooltip title="Copy password">
                <div>
                  <IconButton
                    color="primary"
                    disabled={
                      !props.items.find((password) => password.id === item.id)
                        .password
                    }
                  >
                    <CopyIcon />
                  </IconButton>
                </div>
              </Tooltip>
            </InputAdornment>
          }
          value={item.password}
          onChange={props.onChange(item.id, "password")}
        />
      </FormControl>
    </ListItem>
  );
};

HListItem.propTypes = {
  items: PropTypes.array.isRequired,
  showPasswords: PropTypes.bool.isRequired,
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    service: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }),
  deleteItem: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  copyField: PropTypes.func.isRequired,
};

export default HListItem;
