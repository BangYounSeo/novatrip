// src/components/admin/Admin_SectionReviews.js
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
  TextField,
  Chip,
} from "@mui/material";
import { api } from "../../service/boardService";

export default function Admin_SectionReviews() {
  const [keyword, setKeyword] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ✅ 댓글 목록 불러오기 + 뷰모델화
  const fetchReviews = async () => {
    try {
      const res = await axios.get("/api/admin/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ 뷰모델화
      const vm = (res.data.list || []).map((r) => ({
        _id: r._id,
        content: r.content,
        userId: r.userId,
        numBrd: r.numBrd,
        created: r.created || r.regdate,
        reported: !!r.report, // ✅ 신고 여부를 boolean으로 변환
        hidden: !!r.hidden
      }));

      // ✅ 신고(최상단) 최신순(그다음) 정렬
        vm.sort((a, b) => {
          //신고되면 최상단
          if(a.reported && !b.reported) return -1;
          if(!a.reported && b.reported) return 1;
          //2순위는 최신순
          return new Date(b.created || b._id) - new Date(a.created || a._id)
        });
      setReviews(vm);
    } catch (err) {
      console.error("댓글 불러오기 실패:", err);
      alert("댓글 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ✅ 키워드 필터
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return reviews;
    return reviews.filter((r) => {
      const content = r.content?.toLowerCase() || "";
      const user = r.userId?.toLowerCase() || "";
      const num = String(r.numBrd || "");
      return content.includes(kw) || user.includes(kw) || num.includes(kw);
    });
  }, [keyword, reviews]);

  // ✅ 댓글 삭제
  const handleDelete = async (id) => {
    if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/api/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews((prev) => prev.filter((r) => r._id !== id));
      alert("댓글이 삭제되었습니다.");
    } catch (err) {
      console.error("댓글 삭제 실패:", err);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <Typography>댓글을 불러오는 중...</Typography>;


  // 댓글 숨김/해제
  const handleHideToggle = async (rev) => {
    console.log('dddd')
    const newHidden = !rev.hidden
    try {
      await axios.post(`/api/admin/reviews/${rev._id}/${newHidden ? "hide" : "unhide"}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log('dddd')
      setReviews(prev => 
        prev.map(r => r._id === rev._id ? { ...r, hidden: newHidden } : r)
      )
      alert(`댓글이 ${newHidden ? "숨김 처리" : "공개 상태"}로 변경되었습니다.`)
    } catch (err) {
      console.error("댓글 숨김 처리 실패:", err)
      alert("댓글 숨김 처리 중 오류가 발생했습니다.")
    }
  }




  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          {/* 검색창 */}
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <TextField
              size="small"
              placeholder="댓글 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              fullWidth
            />
          </Stack>

          <Typography variant="h6" sx={{ mb: 2 }}>
            댓글 (최신순)
          </Typography>

          {filtered.length === 0 ? (
            <Typography color="text.secondary">
              {keyword ? "검색 결과가 없습니다" : "등록된 댓글이 없습니다."}
            </Typography>
          ) : (
            <Stack spacing={1}>
              {filtered.map((rev) => (
                <Paper key={rev._id} variant="outlined" sx={{ p: 1.5, borderRadius: 2,
                  opacity: rev.hidden ? 0.5 : 1 // 숨김 댓글 흐릿하게 해줌
                 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{flex:1, mr:2.5}}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {rev.reported && <Chip label="신고됨" size="small" color="error" />}
                         {rev.hidden && <Chip label="숨김됨" size="small" color="default" />}
                        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                          {rev.content || "(내용 없음)"}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        작성자: {rev.userId || "알 수 없음"} • 게시글 번호:{" "}
                        {rev.numBrd || "-"} • 작성일:{" "}
                        {new Date(rev.created).toLocaleString("ko-KR")}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1.5}>
                      <Button
                        size="small"
                        color={rev.hidden ? "success" : "inherit"}
                        variant="outlined" sx={{ fontSize: "0.90rem" }}
                        onClick={() => handleHideToggle(rev)}>
                        {rev.hidden ? "숨김해제" : "숨기기"}
                      </Button>

                      <Button
                        size="small" color="error"
                        variant="contained" sx={{ fontSize: "0.90rem" }}
                        onClick={() => handleDelete(rev._id)}
                      >
                        삭제
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
