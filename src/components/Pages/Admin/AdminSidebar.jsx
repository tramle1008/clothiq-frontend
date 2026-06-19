import * as React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { alpha, styled, useTheme } from '@mui/material/styles';
import {
    AppBar as MuiAppBar,
    Box,
    Button,
    Chip,
    Collapse,
    CssBaseline,
    Divider,
    Drawer as MuiDrawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from '@mui/material';
import {
    MdDashboard,
    MdExpandLess,
    MdExpandMore,
    MdOutlineDescription,
    MdOutlineMenu,
} from 'react-icons/md';
import { FaChevronLeft, FaChevronRight, FaRegListAlt } from 'react-icons/fa';
import { FiMapPin } from 'react-icons/fi';
import { IoIosLogOut } from 'react-icons/io';
import { LuClipboardList, LuShoppingBag } from 'react-icons/lu';

const drawerWidth = 272;
const collapsedWidth = 88;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    width: collapsedWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
});

const DrawerHeader = styled('div')(({ theme }) => ({
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(0, 2),
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#fff',
    boxShadow: '0 18px 40px rgba(15, 23, 42, 0.18)',
    transition: theme.transitions.create(['width', 'margin-left'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin-left'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
    ...(!open && {
        marginLeft: collapsedWidth,
        width: `calc(100% - ${collapsedWidth}px)`,
    }),
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
    }),
}));

const navGroups = [
    {
        section: 'TỔNG QUAN',
        items: [
            {
                label: 'Tổng quan',
                icon: MdDashboard,
                to: '/admin',
                exact: true,
            },
        ],
    },
    {
        section: 'QUẢN LÝ',
        items: [
            {
                label: 'Sản phẩm',
                icon: LuShoppingBag,
                children: [
                    {
                        label: 'Danh sách',
                        icon: FaRegListAlt,
                        to: '/admin/products',
                    },
                    {
                        label: 'Danh mục',
                        icon: MdOutlineDescription,
                        to: '/admin/products/categories',
                    },
                ],
            },
            {
                label: 'Đơn hàng chờ xác nhận',
                icon: LuClipboardList,
                to: '/admin/orders',
            },
            {
                label: 'Tất cả đơn hàng',
                icon: FaRegListAlt,
                to: '/admin/detail',
            },
            {
                label: 'Địa chỉ cơ sở',
                icon: FiMapPin,
                to: '/admin/about',
            },
        ],
    },
];

const getMatch = (pathname, item) => {
    if (item.exact) {
        return pathname === item.to;
    }

    return pathname.startsWith(item.to);
};

export default function AdminSidebar() {
    const theme = useTheme();
    const location = useLocation();
    const [open, setOpen] = React.useState(true);
    const [auth, setAuth] = React.useState(null);

    const isProductRoute = location.pathname.startsWith('/admin/products');
    const [openProductMenu, setOpenProductMenu] = React.useState(isProductRoute);

    React.useEffect(() => {
        const storedAuth = localStorage.getItem('auth');

        if (!storedAuth) {
            return;
        }

        try {
            setAuth(JSON.parse(storedAuth));
        } catch (error) {
            console.error('Error parsing auth:', error);
        }
    }, []);

    React.useEffect(() => {
        if (isProductRoute) {
            setOpenProductMenu(true);
        }
    }, [isProductRoute]);

    const renderNavItem = (item, isChild = false) => {
        const Icon = item.icon;
        const isActive = item.children ? isProductRoute : item.to ? getMatch(location.pathname, item) : false;

        return (
            <ListItem
                key={item.label}
                disablePadding
                sx={{ display: 'block', mb: isChild ? 0.5 : 0.75 }}
            >
                <ListItemButton
                    component={item.to ? NavLink : 'button'}
                    to={item.to}
                    onClick={item.children ? () => {
                        setOpenProductMenu((prev) => !prev);
                        if (!open) {
                            setOpen(true);
                        }
                    } : undefined}
                    selected={isActive}
                    sx={{
                        minHeight: 50,
                        px: open ? 1.5 : 1.25,
                        py: 0.75,
                        mx: open ? 1 : 1.25,
                        borderRadius: 3,
                        justifyContent: open ? 'initial' : 'center',
                        backgroundColor: isActive ? '#0f172a' : 'transparent',
                        color: isActive ? '#fff' : '#334155',
                        '&:hover': {
                            backgroundColor: isActive ? '#0f172a' : alpha('#0f172a', 0.06),
                        },
                        '&.Mui-selected': {
                            backgroundColor: '#0f172a',
                            color: '#fff',
                            '&:hover': {
                                backgroundColor: '#0f172a',
                            },
                        },
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: open ? 1.5 : 0,
                            justifyContent: 'center',
                            color: 'inherit',
                            fontSize: 22,
                        }}
                    >
                        <Icon />
                    </ListItemIcon>
                    <ListItemText
                        primary={item.label}
                        sx={{
                            opacity: open ? 1 : 0,
                            '& .MuiTypography-root': {
                                fontSize: isChild ? '0.95rem' : '0.98rem',
                                fontWeight: isActive ? 700 : 600,
                            },
                        }}
                    />
                    {item.children && open && (openProductMenu ? <MdExpandLess /> : <MdExpandMore />)}
                </ListItemButton>
            </ListItem>
        );
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <AppBar position="fixed" open={open}>
                <Toolbar sx={{ minHeight: 72, px: { xs: 2, sm: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {!open && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                onClick={() => setOpen(true)}
                                edge="start"
                                sx={{
                                    border: '1px solid rgba(255,255,255,0.16)',
                                    bgcolor: 'rgba(255,255,255,0.06)',
                                }}
                            >
                                <MdOutlineMenu />
                            </IconButton>
                        )}

                        <Box>
                            <Typography
                                component={Link}
                                to="/admin"
                                sx={{
                                    color: 'inherit',
                                    textDecoration: 'none',
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.02em',
                                }}
                            >
                                Clothiq Admin
                            </Typography>
                            <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.72)' }}>
                                {auth?.userName || 'Administrator'}
                            </Typography>
                        </Box>
                    </Box>

                    <Button
                        component={Link}
                        to="/logout"
                        variant="contained"
                        startIcon={<IoIosLogOut />}
                        sx={{
                            ml: 'auto',
                            borderRadius: 999,
                            px: 2,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 700,
                            backgroundColor: '#ef4444',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: '#dc2626',
                                boxShadow: 'none',
                            },
                        }}
                    >
                        Đăng xuất
                    </Button>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    '& .MuiDrawer-paper': {
                        backgroundColor: '#f8fafc',
                        color: '#0f172a',
                        borderRight: '1px solid rgba(148, 163, 184, 0.2)',
                        boxShadow: '12px 0 32px rgba(15, 23, 42, 0.06)',
                    },
                }}
            >
                <DrawerHeader>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            opacity: open ? 1 : 0,
                            transition: 'opacity 0.2s ease',
                            pointerEvents: open ? 'auto' : 'none',
                        }}
                    >
                        <Box
                            sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 2.5,
                                display: 'grid',
                                placeItems: 'center',
                                backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                                color: '#fff',
                                fontWeight: 800,
                            }}
                        >
                            C
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '0.96rem', fontWeight: 800 }}>
                                Control Center
                            </Typography>
                            <Chip
                                label="Admin panel"
                                size="small"
                                sx={{
                                    mt: 0.5,
                                    height: 22,
                                    borderRadius: 999,
                                    fontWeight: 700,
                                    backgroundColor: alpha('#0f172a', 0.08),
                                    color: '#334155',
                                }}
                            />
                        </Box>
                    </Box>

                    <IconButton
                        onClick={() => setOpen((prev) => !prev)}
                        sx={{
                            color: '#0f172a',
                            border: '1px solid rgba(148, 163, 184, 0.28)',
                            backgroundColor: '#fff',
                            '&:hover': {
                                backgroundColor: '#e2e8f0',
                            },
                        }}
                    >
                        {theme.direction === 'rtl' ? <FaChevronRight /> : open ? <FaChevronLeft /> : <FaChevronRight />}
                    </IconButton>
                </DrawerHeader>

                <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.2)' }} />

                <List sx={{ px: 1.25, py: 2 }}>
                    {navGroups.map((group) => (
                        <Box key={group.section} sx={{ mb: 1.5 }}>
                            <Typography
                                sx={{
                                    px: open ? 2 : 0,
                                    mb: 1,
                                    textAlign: open ? 'left' : 'center',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.12em',
                                    color: '#94a3b8',
                                    opacity: open ? 1 : 0,
                                    transition: 'opacity 0.2s ease',
                                }}
                            >
                                {group.section}
                            </Typography>

                            {group.items.map((item) => (
                                <Box key={item.label}>
                                    {renderNavItem(item)}

                                    {item.children && (
                                        <Collapse in={openProductMenu && open} timeout="auto" unmountOnExit>
                                            <List disablePadding sx={{ mt: -0.25, mb: 0.5 }}>
                                                {item.children.map((child) => renderNavItem(child, true))}
                                            </List>
                                        </Collapse>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    ))}
                </List>
            </Drawer>
        </Box>
    );
}
