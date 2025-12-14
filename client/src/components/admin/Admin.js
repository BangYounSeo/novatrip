import React, { useEffect, useMemo, useState } from "react";
import {
  Box,Grid,List,ListItem,ListItemButton,ListItemIcon,ListItemText,
  Stack,Typography,IconButton,Drawer,useMediaQuery,useTheme
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CampaignIcon from "@mui/icons-material/Campaign";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ArticleIcon from "@mui/icons-material/Article";
import HomeIcon from '@mui/icons-material/Home';
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import FestivalTwoToneIcon from '@mui/icons-material/FestivalTwoTone';
import RateReviewTwoToneIcon from '@mui/icons-material/RateReviewTwoTone';
import { jwtDecode } from "jwt-decode";

import Admin_SectionNotice from "./Admin_SectionNotice";
import Admin_SectionMembers from "./Admin_SectionMembers";
import Admin_SectionPosts from "./Admin_SectionPosts";
import Admin_SectionReviews from "./Admin_SectionReviews";
import Admin_EventADs from "./Admin_EventADs";
import { useNavigate } from "react-router-dom";

const SECTIONS = [
  { key: "home", label: "메인페이지", icon: <HomeIcon /> },
  { key: "notice", label: "공지사항 관리", icon: <CampaignIcon /> },
  { key: "members", label: "회원 관리", icon: <PeopleAltIcon /> },
  { key: "posts", label: (<>게시물 <br/>관리</>), icon: <ArticleIcon /> },
  { key: "reviews", label: "댓글 관리", icon: <RateReviewTwoToneIcon /> },
  { key: "eventAD", label: (<>이벤트 <br/>광고</>), icon: <FestivalTwoToneIcon /> },
];

// 관리자 접근 제한
function GuardAdmin({ children }) {
  const token = localStorage.getItem("token");
  const isAdmin = useMemo(() => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.role === "admin";
    } catch {
      return false;
    }
  }, [token]);

  if (!isAdmin) {
    return (
      <Box p={4}>
        <Typography variant="h6">관리자 전용 페이지</Typography>
        <Typography variant="body2" color="text.secondary">
          접근 권한이 없습니다. 관리자 계정으로 로그인하세요.
        </Typography>
      </Box>
    );
  }
  return children;
}

export default function Admin() {
  const [active, setActive] = useState("notice");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const navigate = useNavigate();

  useEffect(() => {
    if(active==='home'){
      navigate('/')
    }
  },[active])

  const menuList = (
    <Box sx={{ width: 150, p: 2, height: "100%", bgcolor: "#fafafa"}}
      role="presentation"
      onClick={isSmallScreen ? toggleDrawer(false) : undefined}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#333"}}>
        관리자 메뉴
      </Typography>

      <List dense>
        {SECTIONS.map((s) => (
          <ListItem key={s.key} disablePadding>
            <ListItemButton
              selected={active === s.key} onClick={() => setActive(s.key)}
              sx={{ borderRadius: 1, mx: 0.5, my: 0.3,
                "&.Mui-selected": { bgcolor: "#e0f7fa" }}}>
              <ListItemIcon sx={{ minWidth: "40px" }}>{s.icon}</ListItemIcon>
              <ListItemText primary={s.label}  primaryTypographyProps={{fontSize: "0.95rem"}}/>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <GuardAdmin>
      <Grid container spacing={0}
        sx={{
          height: "100vh", flexDirection: { xs: "column", md: "row" },
          overflowY: "auto", width: "100%"}}>

        {/* PC: 고정된 왼쪽 메뉴 */}
        {!isSmallScreen && (
          <Grid item md={2.5}
            sx={{ bgcolor: "#fafafa", height: "100%"}}>
            {menuList}
          </Grid>
        )}

        

        {/* 왼쪽에서 슬라이드 */}
        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          {menuList}
        </Drawer>

        {/* 콘텐츠 영역 */}
        <Grid item xs={12} md={9.5} sx={{ p: { xs: 1.5, md: 3 }, flexGrow: 1, justifyItems : 'center'}}>
          <Box sx={{display:'flex', justifyContent: 'space-between', alignItems:'center'}}>
            {/* 모바일: 상단 메뉴 버튼 + Drawer */}
            {isSmallScreen && (
              <Box
                sx={{ display: "flex", alignItems: "center", justifyItems : 'center'}}>
                <IconButton onClick={toggleDrawer(true)} sx={{mb: 1.5}}>
                  <MenuIcon />
                </IconButton>
              </Box>
            )}
            <Stack direction="row" justifyContent="space-between" sx={{ mb:1.5 }}>
              <Typography variant="h5">
                {SECTIONS.find((s) => s.key === active)?.label}
              </Typography>
            </Stack>
          </Box>                                            
          {active === "notice" && <Admin_SectionNotice />}
          {active === "members" && <Admin_SectionMembers />}
          {active === "posts" && <Admin_SectionPosts />}
          {active === "reviews" && <Admin_SectionReviews />}
          {active === "eventAD" && <Admin_EventADs/>}
        </Grid>
      </Grid>
    </GuardAdmin>
  );
}
