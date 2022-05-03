import React, { useState } from 'react';
import { Button } from '../../../views/partials/Button';
import Loader from '../../../views/partials/Loader';
import { colorPalettes } from '../OverviewPage';

export interface ILockScreenProps {
    isLocked: boolean;
    unLockApp: any;
}
const KEY = 'uzhTaskProject';

const LockScreen: React.FunctionComponent<ILockScreenProps> = (props) => {
    const [showError, setError] = useState(false);
    const [keyInput, setKeyInput] = useState('');
    const [unlocked, setIsUnlocked] = useState(false);

    async function handleKeyInput() {
        if (keyInput === KEY) {
            setIsUnlocked(true);
            await setTimeout(() => {
                props.unLockApp();
            }, 3000);
        } else setError(true);
    }
    return (
        <div className="flex justify-center items-center h-96">
            {props.isLocked ? (
                <div className="w-1/2 h-1/2  border-blue-100 border-2 rounded-lg drop-shadow-2xl">
                    <div className="flex flex-col justify-center items-center">
                        <p>The main program is currently locked. You'll receive a key to unlock after 2 weeks of data collection</p>
                        <div className="flex flex-col">
                            <div className="flex gap-x-2 mt-2">
                                <input
                                    className={'block'}
                                    placeholder={'key'}
                                    disabled={unlocked}
                                    type={'text'}
                                    onFocus={() => {
                                        setError(false);
                                    }}
                                    onChange={(e) => {
                                        setKeyInput(e.target.value);
                                    }}
                                ></input>
                                <Button backgroundColor={colorPalettes.greenButton} disabled={keyInput === '' || unlocked} onClick={handleKeyInput} className={'mt-1'}>
                                    Submit Key
                                </Button>
                            </div>
                            {showError ? <div className="text-red-500">wrong key provided</div> : ''}
                        </div>
                        {unlocked ? <Loader className={'mt-5'} /> : ''}
                    </div>
                </div>
            ) : (
                ''
            )}
        </div>
    );
};

export default LockScreen;
