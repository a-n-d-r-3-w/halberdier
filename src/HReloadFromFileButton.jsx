import React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import RestoreIcon from "@mui/icons-material/Restore";
import TextField from "@mui/material/TextField";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

const HReloadFromFileButton = (props) => {
  return (
    <span>
      <Button
        autoFocus
        variant="contained"
        onClick={props.handleClickReloadButton}
        disabled={!props.fileExists || !props.isDirty}
      >
        <RestoreIcon />
        Reload from file
      </Button>
      <Dialog
        open={props.isLoadDialogOpen}
        onClose={props.handleCloseLoadDialog}
        aria-labelledby="load-dialog"
      >
        <DialogTitle id="load-dialog">
          Load items from ~/.halberdier/halberdier.dat
        </DialogTitle>
        <form onSubmit={props.loadFromFile}>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              type="password"
              label="Master password"
              onChange={props.onLoadPasswordInputChange}
              value={props.loadPassword}
              error={props.isLoadError}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={props.handleCloseLoadDialog} color="primary">
              Cancel
            </Button>
            <Button
              disabled={!props.loadPassword}
              type="submit"
              color="primary"
            >
              Load
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </span>
  );
};

HReloadFromFileButton.propTypes = {
  handleClickReloadButton: PropTypes.func.isRequired,
  fileExists: PropTypes.bool.isRequired,
  isDirty: PropTypes.bool.isRequired,
  isLoadDialogOpen: PropTypes.bool.isRequired,
  handleCloseLoadDialog: PropTypes.func.isRequired,
  loadFromFile: PropTypes.func.isRequired,
  onLoadPasswordInputChange: PropTypes.func.isRequired,
  loadPassword: PropTypes.string.isRequired,
  isLoadError: PropTypes.bool.isRequired,
};

export default HReloadFromFileButton;
