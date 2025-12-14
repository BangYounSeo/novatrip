import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem,
  Paper, Select, Stack, TextField, Typography
} from "@mui/material";
import { api } from "../../service/boardService";

// boardType → 라벨
const BOARD_LABEL = { notice: "공지", mate: "동행" };
const toLabel = (t) => BOARD_LABEL[t] || "기타"; // 나머지는 모두 '기타'

// YYYY-MM-DD HH:mm
const fmt = (iso) => {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit"
    });
  } catch { return ""; }
};

// boardType을 4그룹으로 강제 매핑
const groupOf = (t) => (t === "mate" ? "mate" : t === "notice" ? "notice" : "etc");

export default function Admin_SectionPosts() {
  const [keyword, setKeyword] = useState("");
  const [boardFilter, setBoardFilter] = useState("all"); // all | notice | mate | etc
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const auth = token ? {Authorization: `Bearer ${token}`} : undefined

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // ✅ 항상 전체를 받아와서 클라이언트에서 정확히 분류/필터
        const params = { skip: 0, limit: 100, sort: "desc", searchKey: "subject" };
        const res = await api.get("/board", { params });
        const data = res.data || [];

        // 필요한 필드만 뷰모델화 (_id도 반드시 보관! 관리자 API가 _id를 씀)
        const vm = (data || []).map((p) => ({
          id: p.numBrd,            // 화면/키 표시에 쓰고 싶으면 사용
          mongoId: p._id,              // 관리자 API 호출용
          title: p.subject,
          boardType: p.boardType,      // raw
          boardLabel: toLabel(p.boardType),
          content: p.content,
          userId: p.userId,
          reported: !!p.report,
          startDate: p.startDate,
          endDate: p.endDate,
          created: p.created,
          hidden: !!p.hidden
        }));

        // 안전하게 최신순
        vm.sort((a, b) => {
          //신고되면 최상단
          if(a.reported && !b.reported) return -1;
          if(!a.reported && b.reported) return 1;
          //2순위는 최신순
          return  new Date(b.created || b._id) - new Date(a.created || a._id)
        });
        setItems(vm);
      } catch (e) {
        console.error("게시글 조회 실패:", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // ← 필터는 아래에서 클라로 처리하므로 여기선 한 번만 불러오면 됨

  // 1) 카테고리 필터 (공지/동행/기타/전체)
  const byCategory = useMemo(() => {
    if (boardFilter === "all") return items;
    return items.filter((it) => groupOf(it.boardType) === boardFilter);
  }, [items, boardFilter]);

  // 2) 키워드 필터
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return byCategory;
    return byCategory.filter((p) =>
      [p.title, p.boardLabel, p.userId, p.content].join(" ").toLowerCase().includes(kw)
    );
  }, [byCategory, keyword]);


  // 숨기기토글 hidden(true,false)
  const handleToggleHide = async (p) => {
    const newHidden = !p.hidden; // 토글 상태 계산
    try {
      await api.post(
        `/admin/posts/${p.mongoId}/${newHidden ? "hide" : "unhide"}`,
        null,
        { headers: auth })
      // 프론트 상태 갱신
      setItems(prev =>
        prev.map(it =>
          it.id === p.id ? { ...it, hidden: newHidden } : it
        )
      );
    } catch (err) {
      console.error(err);
      alert(`숨김 ${newHidden ? "처리" : "해제"} 실패`);
    }
  };


  // 삭제 (관리자 전용)
  const handleDelete = async (p) => {
    if (!window.confirm(`정말 삭제할까요?\n- ${p.title}`)) return;
    try {
      await api.delete(`/admin/posts/${p.mongoId}`, { headers: auth });
      setItems((prev) => prev.filter((it) => it.mongoId !== p.mongoId));
    } catch (e) {
      console.error(e);
      alert("삭제 실패");
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <TextField
              size="small"
              placeholder="게시글 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              fullWidth
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>게시판</InputLabel>
              <Select
                value={boardFilter}
                label="게시판"
                onChange={(e) => setBoardFilter(e.target.value)}
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="mate">동행</MenuItem>
                <MenuItem value="notice">공지</MenuItem>
                <MenuItem value="etc">기타</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {loading && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
              불러오는 중…
            </Typography>
          )}

          <Stack spacing={1} sx={{ opacity: loading ? 0.6 : 1 }}>
            {filtered.map((p) => (
              <Paper key={p.mongoId} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {p.reported && <Chip label="신고됨" size="small" color="error" />}
                      {p.hidden && <Chip label="숨김" size="small" color="default" />}
                      <Typography variant="subtitle1" noWrap>{p.title}</Typography>
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                      {toLabel(p.boardType)} • 작성자 {p.userId} • 작성일 {fmt(p.created)}
                      {p.boardType === "mate" && (
                        <> • 일정 {p.startDate?.slice(0,10)} ~ {p.endDate?.slice(0,10)}</>
                      )}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexShrink={0}>
                      <Button
                        size="small" sx={{ fontSize: "0.95rem" }}
                        color={p.hidden ? "success" : "inherit"}
                        onClick={() => handleToggleHide(p)}
                      >
                        {p.hidden ? "숨김해제" : "숨기기"}
                      </Button>
                      <Button size="small" sx={{ fontSize: "1rem" }} color="error" onClick={() => handleDelete(p)}>
                        삭제
                      </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))}

            {!loading && filtered.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                결과가 없습니다.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
