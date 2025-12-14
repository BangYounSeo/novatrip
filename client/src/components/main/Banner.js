import React, { useEffect, useState } from "react";
import { Box, Typography, Link } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Banner = () => {
  const navigate = useNavigate();

  // 🔹 보여줄 문구 목록
  const banners = [
    { text: "🏙️ 서울 여행은 역시 NOVA TRIP! 📸"},
    { text: "✈️ 이번 주말, 서울 감성 코스 추천!", link: "/map" },
    { text: "🎆 지금 서울에서 즐길 수 있는 축제 한눈에 보기!", link: "/event" },
    { text: "👋 여행 같이 갈 사람 찾기! 지금 동행 모집 중 💬", link: "/community" },
    { text: "🗺️ 여행지, 맛집, 숙박까지 한 지도에서!", link: "/map" },
  ];


  const [index, setIndex] = useState(0);

  // 🔹 일정 시간마다 문구 변경
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 4000); // 4초마다 변경
    return () => clearInterval(timer);
  }, [banners.length]);

 const handleClick = (banner) => {
  // banner 객체를 그대로 전달받음
  if (banner.link === "/map" && banner.text === "✈️ 이번 주말, 서울 감성 코스 추천!") {
    navigate(banner.link, { state: { fromBanner: true } });
  } else if (banner.link) {
    navigate(banner.link);
  }
};

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: {lg:70,xs:60},
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        borderBottom: "1px solid #ddd",
        cursor: "pointer",
      }}
      onClick={() => handleClick(banners[index])}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: "absolute", width: "100%", textAlign: "center" ,}}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: 500,
              color: "#333",
              "&:hover": { color: "#20B2AA" },
              transition: "color 0.3s",
              fontSize:{lg:20,xs:14},
            }}
          >
            {banners[index].text}
          </Typography>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};


export default Banner;

