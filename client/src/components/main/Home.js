import React from "react";
import {
  AppBar, Toolbar, Container, Box, Typography, Button, IconButton,
  TextField, Stack, Card, CardContent, CardMedia, Grid, Chip, Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MapIcon from "@mui/icons-material/Map";
import GroupsIcon from "@mui/icons-material/Groups";
import EventIcon from "@mui/icons-material/Event";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const FeatureCard = ({ icon, title, desc, href }) => (
  <Card
    variant="outlined"
    sx={{ p: 2, borderRadius: 3, height: "100%", ":hover": { boxShadow: 4 } }}
    onClick={() => (window.location.href = href)}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ p: 1, borderRadius: 2, bgcolor: "primary.light", color: "white" }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">{desc}</Typography>
      </Box>
    </Stack>
  </Card>
);

const festivals = [
  { id: 1, title: "강동북페스티벌", img: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=800&auto=format&fit=crop" },
  { id: 2, title: "서울 문화의 날",   img: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800&auto=format&fit=crop" },
  { id: 3, title: "김장 대축제",      img: "https://images.unsplash.com/photo-1505577058444-a3dab90d4253?q=80&w=800&auto=format&fit=crop" },
  { id: 4, title: "한강 불빛쇼",      img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop" },
];

export default function Home() {
  return (
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh" }}>
      {/* 상단 네비 */}
      <AppBar elevation={0} position="sticky" sx={{ bgcolor: "white", color: "text.primary", borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOnIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main" }}>NOVATRIP</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button color="inherit" onClick={() => (window.location.href = "/login")}>로그인</Button>
            <IconButton><MenuIcon /></IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        {/* HERO */}
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={7}>
            {/* HERO 섹션 */}
                <Box
                sx={{
                    position: "relative",
                    width:'100%',
                    height: { xs: "80vh", md: "90vh" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    color: "white",
                    textAlign: "center",
                    px: 2,
                    backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)),
                    url("https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1600&auto=format&fit=crop")
                    `,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
                >
                <Typography
                    variant="h3"
                    sx={{
                    fontWeight: 800,
                    mb: 2,
                    lineHeight: 1.3,
                    textShadow: "1px 1px 4px rgba(0,0,0,0.6)"
                    }}
                >
                    서울을 여행하는 가장 스마트한 방법
                </Typography>

                <Typography
                    variant="h6"
                    sx={{
                    mb: 4,
                    fontWeight: 400,
                    textShadow: "1px 1px 3px rgba(0,0,0,0.5)"
                    }}
                >
                    공공데이터 기반 여행 추천 & 커뮤니티 서비스
                </Typography>

                {/* 검색창 + 버튼 그룹 */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="center"
                    alignItems="center"
                    sx={{ width: "100%", maxWidth: 600 }}
                >
                    <TextField
                    placeholder="지역명, 축제명, 숙소 검색..."
                    fullWidth
                    variant="outlined"
                    InputProps={{
                        sx: {
                        bgcolor: "white",
                        borderRadius: 3,
                        "& input": { p: 1.5 },
                        },
                        startAdornment: <SearchIcon sx={{ mr: 1, color: "text.disabled" }} />,
                    }}
                    />
                    <Button
                    variant="contained"
                    size="large"
                    startIcon={<MapIcon />}
                    sx={{
                        bgcolor: "#20B2AA",
                        color: "white",
                        fontWeight: 700,
                        px: 3,
                        borderRadius: 3,
                        "&:hover": { bgcolor: "#1b9b94" },
                    }}
                    onClick={() => (window.location.href = "/map")}
                    >
                    지도에서 보기
                    </Button>
                </Stack>

                {/* 하단 해시태그 */}
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                    mt: 3,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    }}
                >
                    <Chip label="#서울여행" variant="outlined" sx={{ color: "white", borderColor: "white" }} />
                    <Chip label="#축제정보" variant="outlined" sx={{ color: "white", borderColor: "white" }} />
                    <Chip label="#맛집/숙박" variant="outlined" sx={{ color: "white", borderColor: "white" }} />
                </Stack>
                </Box>
            </Grid>

        </Grid>

        {/* 기능 카드 3개 */}
        <Box sx={{ mt: 6 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={<GroupsIcon />}
                title="커뮤니티"
                desc="동행 모집, 후기/추천/정보 글 작성 및 소통"
                href="/community"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={<EventIcon />}
                title="축제·행사"
                desc="서울 열린데이터 기반 최신 축제 일정"
                href="/events"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard
                icon={<MapIcon />}
                title="지도 탐색"
                desc="관광지·숙박·교통을 필터로 한눈에"
                href="/map"
              />
            </Grid>
          </Grid>
        </Box>

        {/* 축제 프리뷰(가로 스크롤) */}
        <Box sx={{ mt: 7 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>지금 인기 축제</Typography>
            <Button onClick={() => (window.location.href = "/events")}>전체 보기</Button>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 1 }}>
            {festivals.map(f => (
              <Card key={f.id} sx={{ minWidth: 260, borderRadius: 3, flex: "0 0 auto" }}>
                <CardMedia component="img" height="150" image={f.img} alt={f.title} />
                <CardContent>
                  <Typography sx={{ fontWeight: 700 }}>{f.title}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>

      {/* 푸터 */}
      <Box sx={{ mt: 8, py: 4, bgcolor: "#f3f6f6", borderTop: 1, borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
            <Typography variant="body2" color="text.secondary">© 2025 NOVATRIP</Typography>
            <Stack direction="row" spacing={2}>
              <Button size="small" color="inherit">About</Button>
              <Button size="small" color="inherit">Contact</Button>
              <Button size="small" color="inherit">Privacy</Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
