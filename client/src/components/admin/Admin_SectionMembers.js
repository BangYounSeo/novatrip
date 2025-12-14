import React, { useEffect, useState } from "react";
import {
  Box, Button, Divider, FormControl, Grid, InputLabel, MenuItem, Modal, Paper,
  Select, Stack, TextField, Typography
} from "@mui/material";
import { api } from "../../service/boardService";

export default function Admin_SectionMembers() {

    const token = localStorage.getItem('token');

    const [keyword, setKeyword] = useState("");
    const [filter, setFilter] = useState("all");
    const [list,setList] = useState([]);
    const [loading,setLoading] = useState(false);

    //회원정보 조회하기(게시글,댓글...)
    const [detailOpen,setDatailOpen] = useState(false);
    const [detailData,setDatailData] = useState(null);

    // YYYY-MM-DD HH:mm
    const fmt = (iso) => {
      try {
        return new Date(iso).toLocaleString("ko-KR", {
          year: "numeric", month: "2-digit", day: "2-digit",
          hour: "2-digit", minute: "2-digit"
        });
      } catch { return ""; }
    };

    //회원목록 불러오기
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/members', {
          params: {keyword},
          headers: token ? { Authorization: `Bearer ${token}`} : undefined
        });
        setList(res.data.list || []);
      } catch (err) {
        console.error('회원목록 불러오기 실패',err);
        alert('회원목록을 불러오지 못했습니다.')
      }finally{
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchMembers()
    },[keyword])
  
    const filtered = list.filter((u) => {
      const status = u.status || 'normal';
      if(filter ==='all') return true;
      return status === filter;
    });
  
    const handlePunish = async (u,type, reason = '') => {
      if(!window.confirm(`${u.nickname}님에게 '${type}' 처리를 하시겠습니까?`))
        return
      try {
        await api.post(
          `admin/members/${u._id}/punish`,
          {type, reason},
          {headers: token ? {Authorization: `Bearer ${token}`} : undefined} 
        )
        alert(`처리 완료: ${u.nickname} (${type})`)
        fetchMembers()  //목록 새로고침
      } catch (err) {
        console.error('제재 요청 실패', err);
        alert('처리 중 오류가 발생했습니다.')      
      }
    }
  
    //회원정보 조회하기(게시글,댓글...)
    const openDetail = async (u) => {
      try {
        const res = await api.get(`/admin/members/${u._id}/detail`, {
          headers: token ? {Authorization: `Bearer ${token}`} : undefined
        });
        setDatailData(res.data)
        setDatailOpen(true)
      } catch (err) {
        console.error('회원 상세 조회 실패',err);
        alert("회원 상세정보를 불러올 수 없습니다.");
      }
    };
    const closeDetail = () => setDatailOpen(false);
   
  
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <TextField
                size="small"
                placeholder="닉네임/이메일/가입일 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                fullWidth
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>필터</InputLabel>
                <Select value={filter} label="필터" onChange={(e) => setFilter(e.target.value)}>
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="warn">경고</MenuItem>
                  <MenuItem value="suspend">이용정지</MenuItem>
                </Select>
              </FormControl>
            </Stack>
  
            {loading && (
              <Typography variant="body2" color="text.secondary" sx={{mb:1}}>
                불러오는 중...
              </Typography>
            )}
  
            <Stack spacing={1}>
              {filtered.map((u) => (
                <Paper key={u._id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Box sx={{ minWidth: 0, mr: 1 }}>
                      <Typography variant="subtitle1" noWrap>{u.nickname}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {u.email} • ID {u.userId} • 상태:{" "}
                        {u.status === 'normal'
                          ? '정상'
                          : u.status === 'warn'
                          ? '경고'
                          : u.status === 'suspend'
                          ? '정지'
                          : '-'}{" "}
                        • 가입 {new Date(u.created).toLocaleDateString("ko-KR")}
                      </Typography>
  
                    </Box>
                   <Stack direction="row" spacing={1}>
                    <Button size="small" sx={{ fontSize: "1rem" }} onClick={() => openDetail(u)}>상세</Button>
  
                    {u.status !== 'warn' ? (
                      <Button size="small" sx={{ fontSize: "1rem" }} onClick={() => handlePunish(u, 'warn')}>경고</Button>
                    ) : (
                      <Button size="small" color="success" sx={{ fontSize: "1rem" }} onClick={() => handlePunish(u, 'normal')}>경고해제</Button>
                    )}
  
                    {u.status !== 'suspend' ? (
                      <Button size="small" sx={{ fontSize: "1rem" }} color="warning" onClick={() => handlePunish(u, 'suspend')}>정지</Button>
                    ) : (
                      <Button size="small" sx={{ fontSize: "1rem" }} color="success" onClick={() => handlePunish(u, 'normal')}>정지해제</Button>
                    )}                     
                  </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>

         <Modal open={detailOpen} onClose={closeDetail}>
          <Box sx={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 3,
            p: 3,
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            {detailData ? (
              <>
                <Typography variant="h6" gutterBottom>회원 상세 정보</Typography>
                <Typography>닉네임: {detailData.member.nickname}</Typography>
                <Typography>이메일: {detailData.member.email}</Typography>
                <Typography>가입일: {new Date(detailData.member.created).toLocaleDateString('ko-KR')}</Typography>
                <Typography>상태: {detailData.member.status}</Typography>
                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1">작성 게시글</Typography>
                {detailData.boards.length > 0 ? (
                  detailData.boards.map((b) => (
                    <Typography key={b._id} sx={{ ml: 2 }}>
                      • [{b.boardType}] {b.subject} ({new Date(b.created).toLocaleDateString('ko-KR')})
                    </Typography>
                  ))
                ) : (
                  <Typography sx={{ ml: 2, color: 'gray' }}>게시글 없음</Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1">작성 댓글</Typography>
                {detailData.reviews.length > 0 ? (
                  detailData.reviews.map((r) => (
                    <Typography key={r._id} sx={{ ml: 2 }}>
                      • {r.content.slice(0, 50)}...
                    </Typography>
                  ))
                ) : (
                  <Typography sx={{ ml: 2, color: 'gray' }}>댓글 없음</Typography>
                )}
              </>
            ) : (
              <Typography>불러오는 중...</Typography>
            )}
          </Box>
        </Modal>

      </Grid>

      
    );
  
}