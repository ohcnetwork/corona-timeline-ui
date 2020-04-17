import React from 'react';

import { Modal, TextField, Radio } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: 600,
        height: 400,
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
        maxWidth: 300,
    },
    noLabel: {
        marginTop: theme.spacing(3),
    },
    root: {
        width: 500,
        '& > * + *': {
            marginTop: theme.spacing(3),
        },
    },
}));

// getModalStyle is not a pure function, we roll the style only on the first render
function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

export const ChartSettingsModal = ({ mode, onModeSelection, isModalOpen, onModalClose, placeStatMap, selectedCountries, onCountriesSelection }) => {
    const classes = useStyles();
    const label = mode === 'India' ? 'States' : 'Countries';
    const [modalStyle] = React.useState(getModalStyle);
    return <Modal
        open={isModalOpen}
        onClose={onModalClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
    >
        <div style={modalStyle} className={classes.paper}>
            <Radio
                checked={mode === 'India'}
                onChange={onModeSelection}
                value="India"
                name="radio-button-demo"
                inputProps={{ 'aria-label': 'India' }}
            />India
            <Radio
                checked={mode === 'International'}
                onChange={onModeSelection}
                value="International"
                name="radio-button-demo"
                inputProps={{ 'aria-label': 'International' }}
            />International
            <br />
            <br />
            <div className={classes.root}>
                <Autocomplete
                    multiple
                    id="tags-standard"
                    options={Object.keys(placeStatMap)}
                    getOptionLabel={(option) => option}
                    defaultValue={selectedCountries}
                    onChange={onCountriesSelection}
                    autoHighlight={true}
                    openOnFocus={true}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="standard"
                            label={`Select ${label}`}
                            placeholder="Countries"
                        />
                    )}
                />
            </div>
        </div>
    </Modal>
}