import React from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
export interface IContextMenuProps {
    setDisplayUnlock: any;
}

const ContextMenu: React.FunctionComponent<IContextMenuProps> = (props) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <React.Fragment>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <Tooltip title="More Options" placement="bottom">
                    <div onClick={handleClick} className="rounded-full shadow-xl hover:ring-2 ring-my-bright-blue/50 cursor-pointer">
                        <img style={{ width: 40, height: 40 }} className="w-4 h-4" src={process.env.PUBLIC_URL + '/someIcons/settings.png'} />
                    </div>
                </Tooltip>
            </Box>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 175,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0
                        }
                    }
                }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            >
                <MenuItem
                    onClick={() => {
                        props.setDisplayUnlock(true);
                    }}
                >
                    <ListItemIcon>
                        <div style={{ backgroundColor: '#86d3ff', borderRadius: 5 }}>
                            <img style={{ width: 25, height: 25 }} className="w-4 h-4" src={process.env.PUBLIC_URL + '/someIcons/unlock.png'} />
                        </div>
                    </ListItemIcon>
                    Unlock Assistance
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        window.api.exportToCSV();
                    }}
                >
                    <ListItemIcon>
                        <div style={{ backgroundColor: '#86d3ff', borderRadius: 5 }}>
                            <img style={{ width: 25, height: 25 }} className="w-4 h-4" src={process.env.PUBLIC_URL + '/someIcons/store.png'} />
                        </div>
                    </ListItemIcon>
                    Export Data
                </MenuItem>
            </Menu>
        </React.Fragment>
    );
};

export default ContextMenu;
