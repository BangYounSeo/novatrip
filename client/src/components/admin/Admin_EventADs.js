// src/components/admin/Admin_EventADs.js
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';

export default function Admin_EventADs() {
  const [keyword, setKeyword] = useState('');
  const [eventList, setEventList] = useState([]); // /api/tour/event 원본
  const [adMap, setAdMap] = useState({}); // contentid -> {active, image, priority}
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const auth = token ? { Authorization: `Bearer ${token}` } : undefined;

  // 1) 이벤트 원본과 광고 목록 동시 로딩
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
     const d = new Date();
     d.setDate(d.getDate() - 60); // 최근 60일
     const yyyy = d.getFullYear();
     const mm = String(d.getMonth() + 1).padStart(2, '0');
     const dd = String(d.getDate()).padStart(2, '0');
     const startDate = `${yyyy}${mm}${dd}`;
        // ✅ 경로 수정: 투어 이벤트 목록은 /api/tour/event
        const [eventsRes, adsRes] = await Promise.all([
          axios.get('/api/tour/event', { params: { numOfRows: 50, startDate } }),
          axios.get('/api/ad/event-ads', { headers: auth })
        ]);

     const events = Array.isArray(eventsRes.data)
       ? eventsRes.data
       : (Array.isArray(eventsRes.data?.response?.body?.items?.item)
          ? eventsRes.data.response.body.items.item
          : []);
        setEventList(events);

        const map = {};
        (adsRes.data?.list || []).forEach((a) => {
          const key = a.contentid || a.contentid;
          map[key] = { active: a.active, image: a.firstimage || a.image, priority: a.priority ?? 100 };
        });
        setAdMap(map);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 2) 검색 필터(제목)
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return eventList;
    return eventList.filter((e) => (e.title || '').toLowerCase().includes(kw));
  }, [eventList, keyword]);

  const getDefaultImage = (ev) => ev.firstimage || ev.imgurl || 'https://placehold.co/600x800?text=Event';
  const getDisplayImage = (ev) => adMap[ev.contentid]?.image || getDefaultImage(ev);

  // ✅ 12개 필드 기반 업서트(부족하면 상세 조회 병합)
  const handleAdvertise = async (ev) => {
    try {
      const base = {
        title: ev.title,
        contenttypeid: ev.contenttypeid || ev.contentTypeId,
        contentid: ev.contentid || ev.contentid,  // ✅ 핵심
        addr1: ev.addr1 || ev.addr || '',
        addr2: ev.addr2 || '',
        tel: ev.tel || '',
        mapx: ev.mapx,
        mapy: ev.mapy,
        eventstartdate: ev.eventstartdate,
        eventenddate: ev.eventenddate,
        firstimage: ev.firstimage || ev.image || getDefaultImage(ev),
        overview: ev.overview || '',
      };

      // 핵심 필드 부족 시 상세 API로 보강
      const lacks = !base.mapx || !base.mapy || !base.contenttypeid || !base.eventstartdate || !base.eventenddate;
      let merged = { ...base };
      if (lacks) {
        const { data: d } = await axios.get('/api/tour/event/detail', { params: { contentid: base.contentid } });
        merged = {
          ...base,
          contenttypeid: base.contenttypeid || d.contenttypeid || d.contentTypeId,
          addr1: base.addr1 || d.addr1,
          addr2: base.addr2 || d.addr2,
          tel: base.tel || d.tel,
          mapx: base.mapx ?? d.mapx,
          mapy: base.mapy ?? d.mapy,
          eventstartdate: base.eventstartdate || d.eventstartdate,
          eventenddate: base.eventenddate || d.eventenddate,
          firstimage: base.firstimage || d.firstimage,
          overview: base.overview || d.overview,
        };
      }

      const payload = {
        ...merged,
        active: true,
        priority: 100,
        link: `/event/detail/${merged.contentid}`,
      };

      await axios.post('/api/ad/event-ads', payload, { headers: auth });
      setAdMap((prev) => ({ ...prev, [payload.contentid]: { active: true, image: payload.firstimage, priority: 100 } }));
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || '광고 등록 실패');
    }
  };

  const handleToggle = async (ev) => {
    try {
      await axios.post(`/api/ad/event-ads/${ev.contentid}/toggle`, null, { headers: auth });
      setAdMap((prev) => {
        const cur = prev[ev.contentid] || { active: false, image: getDefaultImage(ev), priority: 100 };
        return { ...prev, [ev.contentid]: { ...cur, active: !cur.active } };
      });
    } catch (e) {
      console.error(e);
      alert('토글 실패');
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <TextField size="small" placeholder="이벤트 제목 검색" value={keyword} onChange={(e) => setKeyword(e.target.value)} fullWidth />
          </Stack>

          {loading && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
              불러오는 중…
            </Typography>
          )}

          <Stack spacing={1} sx={{ opacity: loading ? 0.6 : 1 }}>
            {filtered.map((ev) => {
              const ad = adMap[ev.contentid];
              const isOn = !!ad?.active;
              const img = getDisplayImage(ev);

              return (
                <Paper key={ev.contentid} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
                   <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box
                      component="img"
                      src={img}
                      alt={ev.title}
                      sx={{ width: 100, height: 72, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }} // 이미지 크기 고정
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        {isOn && <Chip label="광고중" size="small" color="primary" />}
                        <Typography variant="subtitle1">
                          {ev.title} {/* noWrap 제거해서 줄바꿈 가능 */}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        contentid: {ev.contentid}
                      </Typography>
                    </Box>
                  </Stack>

                    <Stack direction="row" spacing={1} flexShrink={0} alignItems="center">
                      {!isOn ? (
                        <Button size="small" variant="contained" onClick={() => handleAdvertise(ev)}>
                          광고하기
                        </Button>
                      ) : (
                        <Button size="small" color="inherit" onClick={() => handleToggle(ev)}>
                          광고해제
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}

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