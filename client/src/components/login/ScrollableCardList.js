import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, Card, CardContent, CardMedia, IconButton, Typography } from "@mui/material";
import { useRef } from "react";

// ✅ 좌우 버튼으로 슬라이드 되는 카드 리스트 컴포넌트
  const ScrollableCardList = ({ data,onCardClick,onEventClick }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
      if (!scrollRef.current) return;
      const scrollAmount = scrollRef.current.clientWidth * 0.9; // 한 화면 거의 이동
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    };

    if (!data || data.length === 0) {
      return <Typography sx={{ mt: 1, color: "text.secondary" }}>데이터가 없습니다.</Typography>;
    }

    return (
      <Box sx={{ position: "relative" }}>
        {/* 왼쪽 버튼 */}
        <IconButton
          onClick={() => scroll("left")}
          sx={{
            position: "absolute",
            top: "40%",
            left: 0,
            zIndex: 10,
            bgcolor: "rgba(255,255,255,0.7)",
            "&:hover": { bgcolor: "white" },
          }}
        >
          <ChevronLeft />
        </IconButton>

        {/* 카드 리스트 */}
        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            overflowX: "auto",
            scrollBehavior: "smooth",
            gap: 2,
            py: 1,
            px: 1,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {data.map((item, index) => (
            <Card
              key={index}
              sx={{
                width: { xs: "70%", sm: "45%", md: "30%" }, // ✅ 2~3개만 보이게
                flexShrink: 0,
                borderRadius: 2,
                boxShadow: 3,
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.03)" },
              }}
              onClick={
                item.contenttypeid === '15' ? 
                () => onEventClick(item)
                :   () => onCardClick(item)
                }
            >
              <CardMedia
                component="img"
                height="140"
                image={item.firstimage || "https://via.placeholder.com/220x140?text=No+Image"}
                alt={item.title || "이미지"}
              />
              <CardContent>
                {
                    item.title &&
                <Typography variant="subtitle1" noWrap fontWeight={600}>
                  {item.title}
                </Typography>
                }
                {
                    item.addr1 &&
                <Typography variant="body2" color="text.secondary" noWrap>
                  {item.addr1}
                </Typography>
                }
                
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* 오른쪽 버튼 */}
        <IconButton
          onClick={() => scroll("right")}
          sx={{
            position: "absolute",
            top: "40%",
            right: 0,
            zIndex: 10,
            bgcolor: "rgba(255,255,255,0.7)",
            "&:hover": { bgcolor: "white" },
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>
    );
  };

  export default ScrollableCardList;