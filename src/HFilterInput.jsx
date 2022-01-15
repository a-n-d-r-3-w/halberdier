import React from "react";
import PropTypes from "prop-types";
import SearchIcon from "material-ui-icons/Search";
import Input, { InputAdornment } from "material-ui/Input";
import { withStyles } from "material-ui/styles";

const styles = (theme) => ({
  iconButton: {
    height: theme.typography.fontSize * 2,
  },
});

const HFilterInput = (props) => {
  const { classes } = props;

  return (
    <Input
      placeholder="Filter"
      type="search"
      startAdornment={
        <InputAdornment position="start">
          <SearchIcon className={classes.iconButton} />
        </InputAdornment>
      }
      value={props.filterText}
      onChange={props.onFilterTextChange}
    />
  );
};

HFilterInput.propTypes = {
  filterText: PropTypes.string.isRequired,
  onFilterTextChange: PropTypes.func.isRequired,
};

export default withStyles(styles)(HFilterInput);
