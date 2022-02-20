import React, { useState, useEffect} from 'react';

import { Modal, TextField, Button, Checkbox, FormControlLabel } from '@material-ui/core';
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
                                    locations, selectedLocs, onApplySettings }: any) => {
    const classes: any = useStyles();
    const [modalStyle] = React.useState(getModalStyle);
    const [filter, setFilters] = useState('');
    const [_selectedLocs, setSelectedLocs] = useState([]);
    const label = filter === 'India' ? 'States' : 'Countries';
    useEffect(() => {
        setFilters(mode);
        setSelectedLocs(selectedLocs);
    }, [mode, selectedLocs, isModalOpen])
    const onApply = () => {
        onApplySettings({mode: filter, selectedLocs: _selectedLocs})
    }
    const onCountriesSelection = (event: any, countries: any) => {
        setSelectedLocs(countries);
    }
    const onFilterChange = (event: any) => {
        setFilters(event.target.value);
        onModeChange(event.target.value);
    }
    // const onSelectAll = () => {
    //     setSelectedLocs(locations);
    // }
    return <Modal
        open={isModalOpen}
        onClose={onModalClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
    >
        <div style={modalStyle} className={classes.paper}>
            <FormControlLabel
            value="india"
            control={<Checkbox />}
            label="India"
            labelPlacement="end"
            />
            <FormControlLabel
            value="international"
            control={<Checkbox />}
            label="International"
            labelPlacement="end"
            />
            <br />
            <br />
            <div className={classes.root}>
                <Autocomplete
                    multiple
                    id="tags-standard"
                    limitTags={5}
                    options={locations}
                    getOptionLabel={(option: any): any => option}
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