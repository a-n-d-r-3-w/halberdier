import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import RestoreIcon from 'material-ui-icons/Restore';
import TextField from 'material-ui/TextField';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';

import {withStyles} from 'material-ui/styles';

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    leftIcon: {
        marginRight: theme.spacing.unit,
    }
});

const HReloadFromFileButton = (props) => {
    const {classes} = props;

    return (
        <span>
            <Button
                autoFocus
                variant="raised"
                onClick={props.handleClickReloadButton}
                className={classes.button}
                disabled={!props.fileExists || !props.isDirty}
            >
                <RestoreIcon className={classes.leftIcon}/>
                Reload from file
            </Button>
            <Dialog
                open={props.isLoadDialogOpen}
                onClose={props.handleCloseLoadDialog}
                aria-labelledby="load-dialog"
            >
                <DialogTitle id="load-dialog">Load items from ~/Dropbox/halberdier.dat</DialogTitle>
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
                        <Button
                            onClick={props.handleCloseLoadDialog}
                            color="primary">
                            Cancel
                        </Button>
                        <Button
                            disabled={!props.loadPassword}
                            type="submit"
                            color="primary">
                            Load
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </span>
    )
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
    isLoadError: PropTypes.bool.isRequired
};

export default withStyles(styles)(HReloadFromFileButton);