import Switch from 'react-switch';
import React, { useState } from 'react';

export interface ISwitchButtonProps {
    onChange: any;
}
type SetStateAction<Boolean> = any;

const SwitchButton: React.FunctionComponent<ISwitchButtonProps> = (props) => {
    const [checked, setChecked] = useState(false);
    const handleChange = (nextChecked: SetStateAction<Boolean>) => {
        setChecked(nextChecked);
        props.onChange();
    };
    return (
        <label className="h-full">
            <Switch
                onChange={handleChange}
                checked={checked}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={30}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            />
        </label>
    );
};

export default SwitchButton;
