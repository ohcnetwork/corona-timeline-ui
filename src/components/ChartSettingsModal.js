import React, { useState, useEffect} from 'react';

import { Modal, TextField, Radio, Button } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: '70vw',
        height: '70vh',
        'overflow-y': 'auto',
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    }
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

export const ChartSettingsModal = ({ mode, isModalOpen, onModalClose, onModeChange,
                                    locations, selectedLocs, onApplySettings }) => {
    const classes = useStyles();
    const [modalStyle] = React.useState(getModalStyle);
    const [_mode, setMode] = useState('');
    const [_selectedLocs, setSelectedLocs] = useState([]);
    const label = _mode === 'India' ? 'States' : 'Countries';
    useEffect(() => {
        setMode(mode);
        setSelectedLocs(selectedLocs);
    }, [mode, selectedLocs, isModalOpen])
    const onApply = () => {
        onApplySettings({mode: _mode, selectedLocs: _selectedLocs})
    }
    const onCountriesSelection = (event, countries) => {
        setSelectedLocs(countries);
    }
    const onModeSelection = (event) => {
        setSelectedLocs([]);
        setMode(event.target.value);
        onModeChange(event.target.value);
    }
    const onSelectAll = () => {
        setSelectedLocs(locations);
    }
    return <Modal
        open={isModalOpen}
        onClose={onModalClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
    >
        <div style={modalStyle} className={classes.paper}>
            <Radio
                checked={_mode === 'India'}
                onChange={onModeSelection}
                value="India"
                name="radio-button-demo"
                inputProps={{ 'aria-label': 'India' }}
            />India
            <Radio
                checked={_mode === 'International'}
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
                    limitTags={5}
                    options={locations}
                    getOptionLabel={(option) => option}
                    onChange={onCountriesSelection}
                    autoHighlight={true}
                    openOnFocus={true}
                    value={_selectedLocs}
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
            <div className="settings-btn">
                {/* TODO enable after fixing performance issue, now selecting all data point is
                    causing jangy animation
                 <Button variant="contained" onClick={onSelectAll}>SelectAll</Button> */}
                <Button variant="contained" onClick={onApply}>Apply</Button>
            </div>
        </div>
    </Modal>
}