import { display } from '@mui/system';
import React, { useState } from 'react';
import { Button } from '../../../views/partials/Button';
import Loader from '../../../views/partials/Loader';
import { colorPalettes } from '../OverviewPage';

export interface ILockScreenProps {
    unLockApp: any;
    display: any;
    noScroll: any;
    lockStatus: boolean;
}
const KEY = 'uzhTaskProject';

const LockScreen: React.FunctionComponent<ILockScreenProps> = (props) => {
    const [showError, setError] = useState(false);
    const [keyInput, setKeyInput] = useState('');
    const [unlocked, setIsUnlocked] = useState(false);

    function handleCancle() {
        props.display();
        // props.noScroll(false);
    }
    function handleKeyDown(event: any) {
        if (event.key === 'Escape') {
            handleCancle();
        }
    }

    async function handleKeyInput() {
        if (keyInput === KEY) {
            setIsUnlocked(true);
            await setTimeout(() => {
                props.unLockApp(true);
                // props.noScroll(false);
                props.display(false);
            }, 3000);
        } else setError(true);
    }
    return (
        <div onKeyDown={handleKeyDown} className=" small-popup  flex flex-col p-5 h-96">
            {props.lockStatus ? (
                <>
                    <div className="h-3/5 flex justify-center items-center">
                        <div className="flex flex-col justify-center items-center">
                            <p className="font-bold">The main program is currently locked. You'll receive a key to unlock after 2 weeks of data collection</p>
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
                                {showError ? <div className="text-red-500 h-4">wrong key provided</div> : <div className="h-4"></div>}
                            </div>
                        </div>
                    </div>
                    <div className="h-1/5 flex justify-center"> {unlocked ? <Loader className={''} /> : <div className=""></div>}</div>{' '}
                </>
            ) : (
                <div className="h-full flex justify-center items-center">
                    <img style={{ width: 40, height: 40 }} className="w-4 h-4" src={process.env.PUBLIC_URL + '/someIcons/checkmark.png'} />
                    <p>You already unlocked missing features. In case you think something went wrong, feel free to contact me</p>
                </div>
            )}

            <div className="mt-auto flex justify-end w-full">
                <Button disabled={false} onClick={handleCancle} className={''}>
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default LockScreen;

/*<div onKeyDown={handleKeyDown} className="popup p-5 ">
            <div className="flex flex-col justify-center items-center">
                <p className="font-bold text-center">The detailed behavior pattern and additional features are currently locked. You'll receive a key to unlock after 2 weeks of data collection</p>
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

            <div className="">
                <Button disabled={false} onClick={handleCancle} className={''}>
                    Cancel
                </Button>
            </div>
        </div> */
