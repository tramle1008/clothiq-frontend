import React from "react";
import { Box, Divider, Drawer, IconButton, Typography } from "@mui/material";
import { FiX } from "react-icons/fi";

const AdminDrawer = ({
    open,
    onClose,
    title,
    subtitle,
    width = 760,
    topOffset = 0,
    children,
    footer,
}) => {
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    top: topOffset,
                    height: topOffset ? `calc(100% - ${topOffset}px)` : "100%",
                },
            }}
        >
            <Box
                sx={{
                    width: { xs: "100vw", sm: width },
                    maxWidth: "100vw",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background:
                        "radial-gradient(circle at top right, rgba(148, 163, 184, 0.16), transparent 22%), #f8fafc",
                }}
            >
                <Box
                    sx={{
                        px: { xs: 2.5, md: 3 },
                        py: 2.5,
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 2,
                        backgroundColor: "#e2e8f0",
                    }}
                >
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: { xs: "1.35rem", md: "1.6rem" }, fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
                            {title}
                        </Typography>
                        {subtitle ? (
                            <Typography sx={{ mt: 0.9, color: "#475569", fontSize: "0.95rem", lineHeight: 1.5 }}>
                                {subtitle}
                            </Typography>
                        ) : null}
                    </Box>

                    <IconButton
                        onClick={onClose}
                        sx={{
                            border: "1px solid #dbe3ec",
                            backgroundColor: "#fff",
                            color: "#334155",
                            "&:hover": {
                                backgroundColor: "#f1f5f9",
                            },
                        }}
                    >
                        <FiX />
                    </IconButton>
                </Box>

                <Divider />

                <Box sx={{ flex: 1, overflowY: "auto", px: { xs: 2.5, md: 3 }, py: 3 }}>
                    {children}
                </Box>

                {footer ? (
                    <>
                        <Divider />
                        <Box
                            sx={{
                                px: { xs: 2.5, md: 3 },
                                py: 2,
                                backgroundColor: "rgba(255,255,255,0.92)",
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            {footer}
                        </Box>
                    </>
                ) : null}
            </Box>
        </Drawer>
    );
};

export default AdminDrawer;
