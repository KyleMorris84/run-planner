import { IconButton, InputBase, Paper } from "@mui/material";
import { Search } from "lucide-react";
import { useState } from "react";

interface FloatingSearchProps {
    onSearch: (postCode: string) => void;
}

export default function FloatingSearch({ onSearch }: FloatingSearchProps) {
    const [value, setValue] = useState("");

    const submit = () => {
        if (value.trim()) onSearch(value.trim());
    };

    return (
        <Paper
            elevation={3}
            sx={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                minWidth: 220,
            }}
        >
            <InputBase
                placeholder="Search postcode…"
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                size="small"
                sx={{ flex: 1, fontSize: 14 }}
            />
            <IconButton size="small" onClick={submit} aria-label="Search">
                <Search size={18} />
            </IconButton>
        </Paper>
    );
}
