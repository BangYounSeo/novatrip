// src/components/admin/Admin_SectionNotice.js
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  IconButton,
  Grid,
  Divider,
  FormControlLabel,
  Checkbox,
  Chip,
  Switch,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import axios from "axios";

export default function Admin_SectionNotice() {
  const token = localStorage.getItem("token");
  const auth = token ? { Authorization: `Bearer ${token}` } : undefined;

  // form
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // url[]

  const [pinTop, setPinTop] = useState(false);

  // list
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [kw, setKw] = useState("");

  const filtered = useMemo(() => {
    const q = kw.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        [it.subject, it.userId, it.cat].join(" ").toLowerCase().includes(q)
    );
  }, [items, kw]);

const handleFiles = (e) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  const next = files;
  setImages((prev) => [...prev, ...next]);

  const urls = next.map((f) => URL.createObjectURL(f));
  setImagePreviews((prev) => [...prev, ...urls]);

  e.target.value = ""; // 같은 파일 다시 선택 허용
};

const removeImage = (idx) => {
  setImages((prev) => prev.filter((_, i) => i !== idx));

  setImagePreviews((prev) => {
    if (prev[idx]) URL.revokeObjectURL(prev[idx]);
    return prev.filter((_, i) => i !== idx);
  });
};

// ======================== 폼 초기화 ==============================
const resetForm = () => {
  setSubject("");
  setContent("");

  imagePreviews.forEach((u) => URL.revokeObjectURL(u));
  setImages([]);
  setImagePreviews([]);
};

// ====================== 공지 목록 불러오기 (게시판 패턴 동일) ====================
const fetchList = async () => {
  try {
    setLoading(true);
    const res = await axios.get("/api/admin/notices", { headers: auth });

    let list = res.data?.list || [];

    // ✅ pinTop=true → false 순, 날짜 최신순 정렬
    list = list.sort((a, b) => {
      // pinTop 우선
      if (a.pinTop && !b.pinTop) return -1;
      if (!a.pinTop && b.pinTop) return 1;

      // created 최신순
      return new Date(b.created) - new Date(a.created);
    });

    setItems(list);

  } catch (e) {
    console.error("공지 목록 오류:", e);
    alert("공지 목록을 불러오지 못했습니다.");
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  fetchList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// ====================== 등록(Submit) 부분 AddBoard 패턴으로 전환 ==================
const onSubmit = async () => {
  if (!subject.trim() || !content.trim()) {
    alert("제목과 내용을 입력해주세요.");
    return;
  }

  const formData = new FormData();

  const payload = {
    subject,
    content,
    boardType: "notice",
    userId: 'admin',   // ✅ 관리자 ID 적용
    pinTop,
  };

  // ✅ boardRouter.js 필수 입력
  formData.append("board", JSON.stringify(payload));

  // ✅ 이미지 있을 때만 upload 추가
  if (images.length > 0) {
    images.forEach((f) => formData.append("upload", f));
  }
  // ✅ defaultImageUrl 절대 보내지 않음 (보내면 backend가 깨진 이미지 생성함)

  try {
    await axios.post("/api/board", formData, {
      headers: { "Content-Type": "multipart/form-data", ...auth },
    });

    alert("공지사항 등록 완료");
    resetForm();
    fetchList();
  } catch (err) {
    console.error(err);
    alert("등록 실패");
  }
};

// ====================== 삭제(Delete) 부분 ======================
const onDelete = async (mongoId) => {
  if (!window.confirm("이 공지를 삭제할까요?")) return;

  try {
    await axios.delete(`/api/admin/notices/${mongoId}`, { headers: auth });
    setItems((prev) => prev.filter((it) => it._id !== mongoId));
  } catch (e) {
    console.error("공지 삭제 오류:", e);
    alert("삭제 실패");
  }
};

// ====================== 날짜 포맷 ======================
const fmt = (d) => {
  try {
    return new Date(d).toLocaleString("ko-KR");
  } catch {
    return "";
  }
};

  return (
    <Grid container spacing={2}>
      {/* LEFT: 작성 폼 */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight="bold" mb={3}>
            공지사항 작성
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="제목"
              fullWidth
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <TextField
              label="내용"
              fullWidth
              multiline
              minRows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* 이미지 업로드 */}
            <Box>
              <Button variant="outlined" component="label" startIcon={<PhotoCamera />}>
                이미지 선택
                <input type="file" hidden multiple onChange={handleFiles} />
              </Button>
              <br/>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>
                공지 상단 고정
              </Typography>

              <Switch
                checked={pinTop}
                onChange={(e) => setPinTop(e.target.checked)}
                color="warning"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#f5a623",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#f5a623",
                  },
                }}
              />
            </Box>

              <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                {imagePreviews.map((url, idx) => (
                  <Box key={idx} sx={{ position: "relative" }}>
                    <img
                      src={url}
                      style={{
                        width: 110,
                        height: 110,
                        objectFit: "cover",
                        borderRadius: 5,
                      }}
                      alt=""
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        bgcolor: "white",
                      }}
                      onClick={() => removeImage(idx)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={resetForm}>초기화</Button>
              <Button variant="contained" onClick={onSubmit}>
                공지 등록
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Grid>

      {/* RIGHT: 내가 쓴 공지 리스트 */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={1}>
            <Typography variant="h6" fontWeight="bold">내 공지 목록</Typography>
            <Box flex={1} />
            <TextField
              size="small"
              placeholder="검색(제목/작성자/분류)"
              value={kw}
              onChange={(e) => setKw(e.target.value)}
            />
          </Stack>
          <Divider sx={{ mb: 1 }} />
          <Box sx={{ flex: 1, overflow: "auto" }}>
            {loading && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 0.5 }}>
                불러오는 중…
              </Typography>
            )}

            {filtered.map((it) => (
              <Paper key={it._id} variant="outlined" sx={{ p: 1.25, mb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {it.pinTop && (
                      <Chip label="고정" size="small" color="warning" sx={{ mr: 1 }} />
                    )}

                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={it.subject}
                    >
                      {it.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                       작성자: {it.userId || "관리자"} &nbsp;·&nbsp; 작성일: {fmt(it.created)} 
                    </Typography>
                  </Box>
                  <IconButton size="small" color="error" onClick={() => onDelete(it._id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Paper>
            ))}

            {!loading && filtered.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                등록된 공지가 없습니다.
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
