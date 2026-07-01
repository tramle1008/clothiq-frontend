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
    Tooltip,
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

const drawerWidth = 280;
const collapsedWidth = 92;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.easeOut,
        duration: 280,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    width: collapsedWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: 280,
    }),
    overflowX: 'hidden',
});

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    background: 'linear-gradient(135deg, #1e2937 0%, #334155 100%)',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
    transition: theme.transitions.create(['margin-left', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: 280,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
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
            { label: 'Bảng điều khiển', icon: MdDashboard, to: '/admin', exact: true },
        ],
    },
    {
        section: 'Quản lý',
        items: [
            {
                label: 'Sản phẩm',
                icon: LuShoppingBag,
                children: [
                    { label: 'Danh sách sản phẩm', to: '/admin/products', exact: true, },
                    { label: 'Danh mục sản phẩm', to: '/admin/products/categories' },
                    { label: 'Giảm giá', to: '/admin/products/discounts' },
                ],
            },
            {
                label: 'Đơn hàng',
                icon: LuClipboardList,
                children: [
                    { label: 'Chờ xác nhận', to: '/admin/orders' },
                    { label: 'Danh sách đơn hàng', to: '/admin/detail' },
                ],
            },
            { label: 'Cơ sở', icon: FiMapPin, to: '/admin/about' },
        ],
    },
];

export default function AdminSidebar() {
    const theme = useTheme();
    const location = useLocation();
    const [open, setOpen] = React.useState(true);


    const [openMenus, setOpenMenus] = React.useState({});

    React.useEffect(() => {
        const newOpenMenus = {};
        navGroups.forEach(group => {
            group.items.forEach(item => {
                if (item.children) {
                    const isActive = item.children.some(child =>
                        location.pathname === child.to ||
                        (child.to && location.pathname.startsWith(child.to))
                    );
                    newOpenMenus[item.label] = isActive;
                }
            });
        });
        setOpenMenus(newOpenMenus);
    }, [location.pathname]);

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };
    const isActiveLink = (to, exact = false) => {
        if (!to) return false;

        if (exact) {
            return location.pathname === to;
        }

        // Xử lý đặc biệt cho route có children
        if (to === '/admin/products') {
            return location.pathname === '/admin/products'; // chỉ active khi exact
        }

        return location.pathname === to || location.pathname.startsWith(to + '/');
    };

    const renderChildItem = (item) => {
        const active = isActiveLink(item.to, item.exact);

        return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                    component={NavLink}
                    to={item.to}
                    selected={active}
                    sx={{
                        mx: 2,
                        pl: 5,
                        py: 1,
                        borderRadius: 2,
                        color: active ? '#0f172a' : '#475569',
                        bgcolor: active ? alpha('#8b5cf6', 0.12) : 'transparent',
                        '&:hover': {
                            bgcolor: active ? alpha('#8b5cf6', 0.18) : alpha('#64748b', 0.08),
                        },
                    }}
                >
                    <ListItemText
                        primary={item.label}
                        sx={{
                            '& .MuiTypography-root': {
                                fontSize: '0.925rem',
                                fontWeight: active ? 600 : 500,
                            },
                        }}
                    />
                </ListItemButton>
            </ListItem>
        );
    };

    const renderParentItem = (item) => {
        const Icon = item.icon;
        const hasChildren = !!item.children;
        const isActive = hasChildren
            ? item.children.some(child => isActiveLink(child.to))
            : isActiveLink(item.to, item.exact);

        return (
            <Box key={item.label} sx={{ mb: 0.5 }}>
                <Tooltip title={!open ? item.label : ''} placement="right" arrow>
                    <ListItem disablePadding>
                        <ListItemButton
                            component={item.to ? NavLink : 'button'}
                            to={item.to}
                            onClick={() => hasChildren && toggleMenu(item.label)}
                            selected={isActive}
                            sx={{
                                minHeight: 52,
                                px: 2.5,
                                mx: 1.5,
                                borderRadius: 2.5,
                                justifyContent: open ? 'flex-start' : 'center',
                                color: isActive ? '#1e40af' : '#334155',
                                bgcolor: isActive ? alpha('#8b5cf6', 0.1) : 'transparent',
                                '&:hover': {
                                    bgcolor: isActive ? alpha('#8b5cf6', 0.15) : alpha('#64748b', 0.06),
                                },
                            }}
                        >
                            <ListItemIcon sx={{
                                minWidth: 0,
                                mr: open ? 2.5 : 0,
                                color: 'inherit',
                                fontSize: '1.35rem'
                            }}>
                                <Icon />
                            </ListItemIcon>

                            <ListItemText
                                primary={item.label}
                                sx={{
                                    opacity: open ? 1 : 0,
                                    transition: 'opacity 0.2s',
                                    '& .MuiTypography-root': {
                                        fontSize: '0.96rem',
                                        fontWeight: isActive ? 600 : 500,
                                    },
                                }}
                            />

                            {hasChildren && open && (
                                openMenus[item.label] ? <MdExpandLess /> : <MdExpandMore />
                            )}
                        </ListItemButton>
                    </ListItem>
                </Tooltip>

                {hasChildren && (
                    <Collapse in={!!openMenus[item.label] && open} timeout="auto" unmountOnExit>
                        <List disablePadding sx={{ mt: 0.5, mb: 1 }}>
                            {item.children.map(renderChildItem)}
                        </List>
                    </Collapse>
                )}
            </Box>
        );
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* AppBar */}
            <AppBar position="fixed" open={open}>
                <Toolbar sx={{ minHeight: 72, px: { xs: 3, sm: 4 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {!open && (
                            <IconButton onClick={() => setOpen(true)} color="inherit">
                                <MdOutlineMenu />
                            </IconButton>
                        )}

                        <Box>
                            <Typography
                                component={Link}
                                to="/admin"
                                sx={{
                                    color: 'white',
                                    fontWeight: 800,
                                    fontSize: '1.25rem',
                                    textDecoration: 'none',
                                    letterSpacing: '-0.02em'
                                }}
                            >
                                Clothiq
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', display: 'block', mt: -0.5 }}>
                                Admin
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
                            borderRadius: 50,
                            px: 3,
                            py: 1.1,
                            bgcolor: '#ef4444',
                            '&:hover': { bgcolor: '#dc2626' },
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Đăng xuất
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Drawer variant="permanent" open={open}>
                <Box sx={{
                    height: 72,
                    display: 'flex',
                    alignItems: 'center',
                    px: 3,
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(148,163,184,0.15)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: open ? 1 : 0 }}>
                        <Box sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '12px',
                            bgcolor: '#1e40af',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: '1.4rem'
                        }}>
                            C
                        </Box>
                        <Box>
                            <Typography fontWeight={700} color="#0f172a">Quản trị</Typography>
                            <Typography variant="caption" color="#64748b">Clothiq System</Typography>
                        </Box>
                    </Box>

                    <IconButton onClick={() => setOpen(!open)} sx={{ color: '#475569' }}>
                        {theme.direction === 'rtl' ? <FaChevronRight /> : open ? <FaChevronLeft /> : <FaChevronRight />}
                    </IconButton>
                </Box>

                <List sx={{ px: 1.5, pt: 3 }}>
                    {navGroups.map((group) => (
                        <Box key={group.section} sx={{ mb: 3 }}>
                            {open && (
                                <Typography
                                    sx={{
                                        px: 3,
                                        mb: 1.5,
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        color: '#64748b',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    {group.section}
                                </Typography>
                            )}

                            {group.items.map(renderParentItem)}
                        </Box>
                    ))}
                </List>
            </Drawer>
        </Box>
    );
}