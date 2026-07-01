import * as React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { alpha, styled, useTheme } from '@mui/material/styles';
import {
    AppBar as MuiAppBar,
    Box,
    Button,
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
    MdOutlineMenu,
} from 'react-icons/md';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { FiMapPin } from 'react-icons/fi';
import { IoIosLogOut } from 'react-icons/io';
import { LuClipboardList, LuShoppingBag } from 'react-icons/lu';

const drawerWidth = 268;
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
    backgroundImage: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
    color: '#f8fafc',
    boxShadow: '0 16px 36px rgba(51, 65, 85, 0.18)',
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
        section: 'Tổng quan',
        items: [
            {
                label: 'Bảng điều khiển',
                icon: MdDashboard,
                to: '/admin',
                exact: true,
            },
        ],
    },
    {
        section: 'Quản lý',
        items: [
            {
                label: 'Sản phẩm',
                icon: LuShoppingBag,
                children: [
                    {
                        label: 'Danh sách sản phẩm',
                        to: '/admin/products',
                        exact: true,
                    },
                    {
                        label: 'Danh mục sản phẩm',
                        to: '/admin/products/categories',
                    },
                    {
                        label: 'Giảm giá',
                        to: '/admin/products/discounts',
                    }
                ],
            },
            {
                label: 'Đơn hàng',
                icon: LuClipboardList,
                children: [
                    {
                        label: 'Chờ xác nhận',
                        to: '/admin/orders',
                    },
                    {
                        label: 'Danh sách đơn hàng',
                        to: '/admin/detail',
                        exact: true,
                    },
                ],
            },
            {
                label: 'Cơ sở',
                icon: FiMapPin,
                to: '/admin/about',
            },
        ],
    },
];

const getMatch = (pathname, item) => {
    if (!item.to) {
        return false;
    }

    if (item.exact) {
        return pathname === item.to;
    }

    return pathname.startsWith(item.to);
};

const getChildMatch = (pathname, item) => {
    if (!item.children?.length) {
        return false;
    }

    return item.children.some((child) => getMatch(pathname, child));
};

export default function AdminSidebar() {
    const theme = useTheme();
    const location = useLocation();
    const [open, setOpen] = React.useState(true);
    const [auth, setAuth] = React.useState(null);
    const [openMenus, setOpenMenus] = React.useState(() =>
        navGroups
            .flatMap((group) => group.items)
            .filter((item) => item.children?.length)
            .reduce((acc, item) => {
                acc[item.label] = getChildMatch(location.pathname, item);
                return acc;
            }, {})
    );

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
        setOpenMenus((prev) =>
            navGroups
                .flatMap((group) => group.items)
                .filter((item) => item.children?.length)
                .reduce((acc, item) => {
                    acc[item.label] = getChildMatch(location.pathname, item) || prev[item.label] || false;
                    return acc;
                }, {})
        );
    }, [location.pathname]);

    const toggleMenu = (label) => {
        setOpenMenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    const renderChildItem = (item) => {
        const isActive = getMatch(location.pathname, item);

        return (
            <ListItem key={item.label} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                <ListItemButton
                    component={NavLink}
                    to={item.to}
                    selected={isActive}
                    sx={{
                        minHeight: 42,
                        mx: 1.5,
                        pl: 3.75,
                        pr: 1.5,
                        borderRadius: 2.5,
                        color: isActive ? '#334155' : '#64748b',
                        backgroundColor: isActive ? '#dbe4ee' : 'transparent',
                        '&:hover': {
                            backgroundColor: isActive ? '#dbe4ee' : alpha('#64748b', 0.08),
                        },
                        '&.Mui-selected': {
                            backgroundColor: '#dbe4ee',
                            color: '#334155',
                            '&:hover': {
                                backgroundColor: '#dbe4ee',
                            },
                        },
                    }}
                >
                    <ListItemText
                        primary={item.label}
                        sx={{
                            '& .MuiTypography-root': {
                                fontSize: '0.93rem',
                                fontWeight: isActive ? 700 : 500,
                            },
                        }}
                    />
                </ListItemButton>
            </ListItem>
        );
    };

    const renderParentItem = (item) => {
        const Icon = item.icon;
        const isActive = item.children ? getChildMatch(location.pathname, item) : getMatch(location.pathname, item);
        const buttonProps = item.to
            ? { component: NavLink, to: item.to }
            : { component: 'button', type: 'button' };

        return (
            <Box key={item.label}>
                <ListItem disablePadding sx={{ display: 'block', mb: 0.75 }}>
                    <ListItemButton
                        {...buttonProps}
                        onClick={
                            item.children
                                ? () => {
                                    toggleMenu(item.label);
                                    if (!open) {
                                        setOpen(true);
                                    }
                                }
                                : undefined
                        }
                        selected={isActive}
                        sx={{
                            minHeight: 50,
                            px: open ? 1.5 : 1.25,
                            py: 0.75,
                            mx: open ? 1 : 1.25,
                            borderRadius: 3,
                            justifyContent: open ? 'initial' : 'center',
                            backgroundColor: isActive ? '#64748b' : 'transparent',
                            color: isActive ? '#f8fafc' : '#334155',
                            '&:hover': {
                                backgroundColor: isActive ? '#64748b' : alpha('#64748b', 0.1),
                            },
                            '&.Mui-selected': {
                                backgroundColor: '#64748b',
                                color: '#f8fafc',
                                '&:hover': {
                                    backgroundColor: '#64748b',
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
                                    fontSize: '0.97rem',
                                    fontWeight: isActive ? 700 : 600,
                                },
                            }}
                        />
                        {item.children && open && ((openMenus[item.label] ?? false) ? <MdExpandLess /> : <MdExpandMore />)}
                    </ListItemButton>
                </ListItem>

                {item.children && (
                    <Collapse in={(openMenus[item.label] ?? false) && open} timeout="auto" unmountOnExit>
                        <Box
                            sx={{
                                ml: 3.5,
                                mb: 1,
                                borderLeft: '1px solid rgba(148, 163, 184, 0.45)',
                            }}
                        >
                            <List disablePadding sx={{ py: 0.25 }}>
                                {item.children.map(renderChildItem)}
                            </List>
                        </Box>
                    </Collapse>
                )}
            </Box>
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
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    bgcolor: 'rgba(255,255,255,0.08)',
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
                                    fontSize: '1.08rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.02em',
                                }}
                            >
                                Clothiq Admin
                            </Typography>
                            <Typography sx={{ fontSize: '0.82rem', color: 'rgba(248, 250, 252, 0.78)' }}>
                                {auth?.userName || auth?.username || 'Administrator'}
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
                            color: '#fff',
                            backgroundColor: '#7f1d1d',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: '#991b1b',
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
                        borderRight: '1px solid rgba(148, 163, 184, 0.18)',
                        boxShadow: '10px 0 30px rgba(71, 85, 105, 0.08)',
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
                                width: 40,
                                height: 40,
                                borderRadius: 3,
                                display: 'grid',
                                placeItems: 'center',
                                backgroundColor: '#64748b',
                                color: '#fff',
                                fontWeight: 800,
                            }}
                        >
                            C
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '0.96rem', fontWeight: 800, color: '#334155' }}>
                                Điều hướng
                            </Typography>
                            <Typography sx={{ mt: 0.25, fontSize: '0.8rem', color: '#94a3b8' }}>
                                Khu vực quản trị
                            </Typography>
                        </Box>
                    </Box>

                    <IconButton
                        onClick={() => setOpen((prev) => !prev)}
                        sx={{
                            color: '#475569',
                            border: '1px solid rgba(148, 163, 184, 0.3)',
                            backgroundColor: '#fff',
                            '&:hover': {
                                backgroundColor: '#f1f5f9',
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
                                    letterSpacing: '0.1em',
                                    color: '#94a3b8',
                                    opacity: open ? 1 : 0,
                                    transition: 'opacity 0.2s ease',
                                }}
                            >
                                {group.section}
                            </Typography>

                            {group.items.map(renderParentItem)}
                        </Box>
                    ))}
                </List>
            </Drawer>
        </Box>
    );
}
