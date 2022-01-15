import React from "react";
import PropTypes from "prop-types";
import Button from "material-ui/Button";
import SaveIcon from "material-ui-icons/Save";
import TextField from "material-ui/TextField";
import Typography from "material-ui/Typography";
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from "material-ui/Dialog";

import { withStyles } from "material-ui/styles";

const styles = (theme) => ({
  button: {
    margin: theme.spacing.unit,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
});

const HSaveWithNewPasswordButton = (props) => {
  const { classes } = props;

  return (
    <span>
      <Button
        variant="raised"
        onClick={props.handleClickUpdatePasswordButton}
        className={classes.button}
        disabled={props.items.length === 0 || !props.fileExists}
      >
        <SaveIcon className={classes.leftIcon} />
        Save with new master password
      </Button>
      <Dialog
        open={props.isUpdatePasswordDialogOpen}
        onClose={props.handleCloseUpdatePasswordDialog}
        aria-labelledby="save-dialog"
      >
        <DialogTitle id="save-dialog">
          Update password for ~/.halberdier/halberdier.dat.
          <Typography color="primary">File will be overwritten.</Typography>
        </DialogTitle>
        <form onSubmit={props.saveChanges}>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              type="password"
              label="Master password"
              onChange={props.onSavePasswordInputChange}
              value={props.savePassword}
              error={props.isSaveError}
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm master password"
              onChange={props.onSavePasswordInputChange2}
              value={props.savePassword2}
              error={props.isSaveError}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={props.handleCloseUpdatePasswordDialog}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              disabled={
                !props.savePassword ||
                props.savePassword !== props.savePassword2
              }
              type="submit"
              color="primary"
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </span>
  );
};

HSaveWithNewPasswordButton.propTypes = {
  classes: PropTypes.object,
  handleClickUpdatePasswordButton: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  fileExists: PropTypes.bool.isRequired,
  isUpdatePasswordDialogOpen: PropTypes.bool.isRequired,
  handleCloseUpdatePasswordDialog: PropTypes.func.isRequired,
  saveChanges: PropTypes.func.isRequired,
  onSavePasswordInputChange: PropTypes.func.isRequired,
  onSavePasswordInputChange2: PropTypes.func.isRequired,
  savePassword: PropTypes.func.isRequired,
  savePassword2: PropTypes.func.isRequired,
  isSaveError: PropTypes.bool.isRequired,
};

export default withStyles(styles)(HSaveWithNewPasswordButton);
