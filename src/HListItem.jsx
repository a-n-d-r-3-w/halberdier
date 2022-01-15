import React from "react";
import PropTypes from "prop-types";
import { ListItem } from "material-ui/List";
import Tooltip from "material-ui/Tooltip";
import Input, { InputLabel, InputAdornment } from "material-ui/Input";
import { FormControl } from "material-ui/Form";
import IconButton from "material-ui/IconButton";
import DeleteIcon from "material-ui-icons/Delete";
import CopyIcon from "material-ui-icons/ContentCopy";
import { withStyles } from "material-ui/styles";

const styles = (theme) => ({
  formControl: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  iconButton: {
    height: theme.typography.fontSize * 2,
  },
  icon: {
    fontSize: theme.typography.fontSize * 1.5,
  },
});

const HListItem = (props) => {
  const { classes, item } = props;

  return (
    <ListItem key={item.id} dense>
      <Tooltip title="Delete row">
        <IconButton onClick={props.deleteItem(item.id)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <FormControl className={classes.formControl}>
        <InputLabel>Name</InputLabel>
        <Input
          value={item.service}
          onChange={props.onChange(item.id, "service")}
        />
      </FormControl>
      <FormControl className={classes.formControl}>
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
                    className={classes.iconButton}
                    color="primary"
                    disabled={
                      !props.items.find((password) => password.id === item.id)
                        .username
                    }
                  >
                    <CopyIcon className={classes.icon} />
                  </IconButton>
                </div>
              </Tooltip>
            </InputAdornment>
          }
          value={item.username}
          onChange={props.onChange(item.id, "username")}
        />
      </FormControl>
      <FormControl className={classes.formControl}>
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
                    className={classes.iconButton}
                    color="primary"
                    disabled={
                      !props.items.find((password) => password.id === item.id)
                        .password
                    }
                  >
                    <CopyIcon className={classes.icon} />
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
  showPassword: PropTypes.bool.isRequired,
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

export default withStyles(styles)(HListItem);
