import type { User } from "../types/User";
import { MenuItem, Menu, IconButton } from "@mui/material";
import { Link } from "@tanstack/react-router";
import { User as UserLucide } from "lucide-react";
import { useState } from "react";
import { getCookie } from "@/utilities/cookieManagement";
import { logOut } from "@/utilities/logout";

export default function UserIconButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [hover, setHover] = useState(false);
    const user = getCookie<User>('user');

    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton
                onClick={handleClick}
                className={`mr-4 ${hover ? "bg-blue-900" : ""}`}
                size="large"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <UserLucide size={24} color="#fff" />
            </IconButton>

            {open && (
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    className="mt-2"
                >
                    {user ?
                        [
                            <Link key="log-in" to="/account" onClick={handleClose}><MenuItem key="my-account">My Account</MenuItem></Link>,
                            <MenuItem key="log-out" onClick={() => logOut()}>Log Out</MenuItem>
                        ]
                        :
                        [
                            <Link key="log-in" to="/login"><MenuItem onClick={handleClose}>Log In</MenuItem></Link>,
                            <Link key="sign-up" to="/signup"><MenuItem onClick={handleClose}>Sign Up</MenuItem></Link>
                        ]
                    }
                </Menu>
            )}
        </div>
    )
}