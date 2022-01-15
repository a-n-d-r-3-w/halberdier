import React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

const HSaveChangeButton = (props) => {
  return (
    <span>
      <Button
        variant="contained"
        onClick={props.handleClickSaveButton}
        disabled={props.items.length === 0 || !props.isDirty}
      >
        <SaveIcon />
        Save changes
      </Button>
      <Dialog
        open={props.isSaveDialogOpen}
        onClose={props.handleCloseSaveDialog}
        aria-labelledby="save-dialog"
      >
        <DialogTitle id="save-dialog">
          Save items to ~/.halberdier/halberdier.dat.
          <Typography color="primary">
            File will be overwritten if it exists.
          </Typography>
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
            <Button onClick={props.handleCloseSaveDialog} color="primary">
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

HSaveChangeButton.propTypes = {
  handleClickSaveButton: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  isDirty: PropTypes.bool.isRequired,
  isSaveDialogOpen: PropTypes.bool.isRequired,
  handleCloseSaveDialog: PropTypes.func.isRequired,
  saveChanges: PropTypes.func.isRequired,
  onSavePasswordInputChange: PropTypes.func.isRequired,
  onSavePasswordInputChange2: PropTypes.func.isRequired,
  savePassword: PropTypes.string.isRequired,
  savePassword2: PropTypes.string.isRequired,
  isSaveError: PropTypes.bool.isRequired,
};

export default HSaveChangeButton;
