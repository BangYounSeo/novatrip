import React, { useEffect, useState } from 'react';
import { Box, Button, Chip, IconButton, InputAdornment, Stack, TextField, Popover, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { format, isBefore, isSameDay, isAfter, isWithinInterval } from 'date-fns';
import { styled, useTheme } from '@mui/material/styles';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import SearchIcon from '@mui/icons-material/Search';

const TYPE_LABEL = { review: '후기', recommend: '추천', info: '정보', free: '자유주제', notice: '공지' };
const TOPICS = ['review', 'recommend', 'info', 'free', 'notice'];

// 기존: 부분/식사/숙박/전체
const TOUR_STYLES = ['부분동행', '식사동행', '숙박동행', '전체동행'];

export default function BoardSearch({ cat, onSearch }) {
  // ----------------------------- 공통 상태 -----------------------------
  const [keyword, setKeyword] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(''); // 'topic' | 'author' | 'when' | 'cond'
  const [sort,setSort] = useState('desc');

  useEffect(() => {
    setOpen('');
  }, [cat]);

  // ----------------------------- 작성자 유형 (author.*) -----------------------------
  const [authorAge, setAuthorAge] = useState([
    { age: 20, selected: false },
    { age: 30, selected: false },
    { age: 40, selected: false },
    { age: 50, selected: false },
    { age: 60, selected: false },
  ]);
  const [authorGender, setAuthorGender] = useState([
    { gender: 'male',value:'남자', selected: false },
    { gender: 'female',value:'여자', selected: false },
  ]);

  const toggleAuthorAge = (age) =>
    setAuthorAge((prev) => prev.map((a) => (a.age === age ? { ...a, selected: !a.selected } : a)));
  const toggleAuthorGender = (g) =>
    setAuthorGender((prev) =>
      prev.map((x) => (x.gender === g ? { ...x, selected: !x.selected } : x.selected ? { ...x, selected: false } : x)),
    );

  // ----------------------------- 여행일정 (when.*) -----------------------------
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const fmt = (date) => (date ? format(new Date(date), 'yyyy-MM-dd') : '');

  const handleDateChange = (day) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (isBefore(day, startDate)) {
      setStartDate(day);
    } else {
      setEndDate(day);
    }
  };

  // ----------------------------- 동행조건 (cond.* → 글의 mateCondition.*) -----------------------------
  const [condAge, setCondAge] = useState([
    { age: 20, selected: false },
    { age: 30, selected: false },
    { age: 40, selected: false },
    { age: 50, selected: false },
    { age: 60, selected: false },
  ]);
  const [condGender, setCondGender] = useState([
    { gender: 'male',value:'남자', selected: false },
    { gender: 'female',value:'여자', selected: false },
  ]);
  const [condType, setCondType] = useState(TOUR_STYLES.map((s) => ({ style: s, selected: false })));

  const toggleCondAge = (age) =>
    setCondAge((prev) => prev.map((a) => (a.age === age ? { ...a, selected: !a.selected } : a)));
  const toggleCondGender = (g) =>
    setCondGender((prev) =>
      prev.map((x) => (x.gender === g ? { ...x, selected: !x.selected } : x.selected ? { ...x, selected: false } : x)),
    );
  const toggleCondType = (style) =>
    setCondType((prev) => prev.map((t) => (t.style === style ? { ...t, selected: !t.selected } : t)));

  // ----------------------------- 포스트 전용 topic -----------------------------
  const [selectTopic, setSelectTopic] = useState(TOPICS.map((t) => ({ value: t, selected: false })));
  const toggleTopic = (t) =>
    setSelectTopic((prev) =>
      prev.map((x) => (x.value === t ? { ...x, selected: !x.selected } : x.selected ? { ...x, selected: false } : x)),
    );

  // ----------------------------- Popover 위치 -----------------------------
  const anchor = isMobile ? { vertical: 'bottom', horizontal: 'center' } : { vertical: 'bottom', horizontal: 'left' };
  const transform = isMobile ? { vertical: 'top', horizontal: 'center' } : { vertical: 'top', horizontal: 'left' };
  const popoverSx = {
    width: isMobile ? 'calc(100vw - 24px)' : 'auto',
    maxWidth: 420,
    boxSizing: 'border-box',
    p: 2,
    borderRadius: 3,
    maxHeight: '70vh',
    overflowY: 'auto',
  };

  const modalOpen = (key) => (evt) => {
    setAnchorEl(evt.currentTarget);
    setOpen(key);
  };
  const modalClose = () => {
    setOpen('');
    setAnchorEl(null);
  };

  // ----------------------------- Range Day 스타일 -----------------------------
  const RangePickersDay = styled(PickersDay, {
    shouldForwardProp: (prop) => prop !== 'inRange' && prop !== 'isStart' && prop !== 'isEnd',
  })(({ theme, inRange, isStart, isEnd }) => ({
    borderRadius: 0,
    margin: 0,
    '&.MuiPickersDay-outsideCurrentMonth': {
      opacity: 0.6,
      margin: 0,
    },
    ...(inRange && {
      backgroundColor: 'rgba(32, 178, 171, 0.2)',
    }),
    ...(isStart && {
      borderTopLeftRadius: '25%',
      borderBottomLeftRadius: '25%',
      backgroundColor: '#20b2aa',
      color: theme.palette.common.black,
    }),
    ...(isEnd && {
      borderTopRightRadius: '25%',
      borderBottomRightRadius: '25%',
      backgroundColor: '#20b2aa',
      color: theme.palette.common.black,
    }),
    ...((isStart || isEnd) && {
      '&.Mui-selected': {
        backgroundColor: '#20b2aa',
        color: '#fff',
        '&:hover,&:focus': { backgroundColor: '#1d9a97' },
      },
    }),
    '&:hover': {
      backgroundColor: '#20b2aa',
    },
  }));

  function RangeDay(props) {
    const { day, outsideCurrentMonth, startDate, endDate, ...other } = props;
    const d = day?.toDate ? day.toDate() : day;
    const isStart = startDate && isSameDay(d, startDate);
    const isEnd = endDate && isSameDay(d, endDate);
    const inRange =
      startDate &&
      endDate &&
      isWithinInterval(d, {
        start: isBefore(startDate, endDate) ? startDate : endDate,
        end: isAfter(endDate, startDate) ? endDate : startDate,
      });

    return (
      <RangePickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        selected={Boolean(isStart || isEnd)}
        inRange={Boolean(inRange)}
        isStart={Boolean(isStart)}
        isEnd={Boolean(isEnd)}
        disableMargin
        sx={{ px: 1.5 }}
      />
    );
  }

  // ----------------------------- 제출 -----------------------------
  const buildPayload= () => ({
      author: {
        gender: authorGender.find((g) => g.selected)?.gender || '',
        ages: authorAge.filter((a) => a.selected).map((a) => a.age), // [20,30]
      },
      when: {
        startDate,
        endDate,
      },
      cond: {
        gender: condGender.find((g) => g.selected)?.gender || '',
        ages: condAge
          .filter((a) => a.selected)
          .map((a) => String(a.age)), // ["20","30"] (스키마가 String[]이면 문자열 비교 안전)
        types: condType.filter((t) => t.selected).map((t) => t.style),
      },
      topic: cat === 'post' ? selectTopic.find((t) => t.selected)?.value || '' : undefined,
      sort
    });

  const submitKeywordSearch = () => {
    const base = buildPayload()
    const kw = keyword.trim()
    onSearch?.(kw ? {...base,keyword: kw} : base)
  }



  useEffect(() => {
    onSearch?.(buildPayload())
  },[cat,sort,JSON.stringify(authorGender),JSON.stringify(authorAge),startDate,endDate,JSON.stringify(condGender),JSON.stringify(condAge),JSON.stringify(condType),JSON.stringify(selectTopic)])

  const onChangeInput = (evt) => setKeyword(evt.target.value);

  // ----------------------------- Chip 삭제 핸들러 -----------------------------
  const delAuthorAge = (age) => setAuthorAge((prev) => prev.map((a) => (a.age === age ? { ...a, selected: false } : a)));
  const delAuthorGender = (g) =>
    setAuthorGender((prev) => prev.map((x) => (x.gender === g ? { ...x, selected: false } : x)));
  const delCondAge = (age) => setCondAge((prev) => prev.map((a) => (a.age === age ? { ...a, selected: false } : a)));
  const delCondGender = (g) => setCondGender((prev) => prev.map((x) => (x.gender === g ? { ...x, selected: false } : x)));
  const delCondType = (st) => setCondType((prev) => prev.map((t) => (t.style === st ? { ...t, selected: false } : t)));
  const delDate = () => {
    setStartDate(null);
    setEndDate(null);
  };
  const delTopic = (t) => setSelectTopic((prev) => prev.map((x) => (x.value === t ? { ...x, selected: false } : x)));

  // ----------------------------- UI -----------------------------
  return (
    <Box sx={{ position: 'sticky', mb: 0, zIndex: 1100, mx: { xs: 2 } }}>
      {/* 검색창 */}
      <Box sx={{ mt: 2, width: '100%', maxWidth: 620, mx: 'auto' }}>
        <TextField
          size="small"
          fullWidth
          placeholder={cat === 'mate' ? '동행글을 검색하세요' : '포스트를 검색하세요'}
          value={keyword}
          onChange={onChangeInput}
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ cursor: 'pointer' }} onClick={submitKeywordSearch}/>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* 선택 칩 표시 (작성자 / 동행조건 / 날짜 / topic) */}
      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
        {cat === 'post' &&
          selectTopic.map((t) => (t.selected ? (
            <Chip key={t.value} size="small" label={TYPE_LABEL[t.value]} onDelete={() => delTopic(t.value)} />
          ) : null))}

        {/* 작성자 */}
        {authorGender.map((g) => (g.selected ? (
          <Chip key={`author-g-${g.gender}`} size="small" label={`작성자 ${g.value}`} onDelete={() => delAuthorGender(g.gender)} />
        ) : null))}
        {authorAge.map((a) => (a.selected ? (
          <Chip key={`author-a-${a.age}`} size="small" label={`작성자 ${a.age}대`} onDelete={() => delAuthorAge(a.age)} />
        ) : null))}

        {/* 동행조건 */}
        {condGender.map((g) => (g.selected ? (
          <Chip key={`cond-g-${g.gender}`} size="small" label={`모집 ${g.value}`} onDelete={() => delCondGender(g.gender)} />
        ) : null))}
        {condAge.map((a) => (a.selected ? (
          <Chip key={`cond-a-${a.age}`} size="small" label={`모집 ${a.age}대`} onDelete={() => delCondAge(a.age)} />
        ) : null))}
        {condType.map((t) => (t.selected ? (
          <Chip key={`cond-t-${t.style}`} size="small" label={t.style} onDelete={() => delCondType(t.style)} />
        ) : null))}

        {/* 날짜 */}
        {startDate && endDate ? (
          <Chip size="small" label={`${fmt(startDate)} ~ ${fmt(endDate)}`} onDelete={delDate} />
        ) : null}
      </Stack>

      {/* 트리거 버튼들 */}
      <div style={{ position: 'relative' }}>
        {cat === 'post' && (
          <Box sx={{ mt: 1, width: '100%', display:'flex', flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: { xs: 'flex-start', md: 'space-between' }}}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap'}}>
              <Button size="small" variant="outlined" sx={btnSx} onClick={modalOpen('topic')}>
                주제 <span className="text-xs">▼</span>
              </Button>
            </Box>
            <Box sx={{ display: 'flex', mt: { xs: 1, md: 0 } }}>
              <Button size='small' sx={sortBtn(sort==='desc')} onClick={() => setSort('desc')}>최신순</Button>
              <Button size='small' sx={sortBtn(sort==='good')} onClick={() => setSort('good')}>좋아요 많은순</Button>
              <Button size='small' sx={sortBtn(sort==='view')} onClick={() => setSort('view')}>조회수 많은순</Button>
            </Box>
          </Box>
        )}
        {cat === 'mate' && (
          <Box sx={{ mt: 1, width: '100%',display:'flex', flexDirection: { xs: 'column', md: 'row' },alignItems: { xs: 'flex-start', md: 'center' },justifyContent: { xs: 'flex-start', md: 'space-between' }}}>
            <Box sx={{display:'flex',flexWrap: 'wrap'}}>
              <Button size="small" variant="outlined" sx={btnSx} onClick={modalOpen('author')}>
                작성자 유형 <span className="text-xs">▼</span>
              </Button>
              <Button size="small" variant="outlined" sx={{ ...btnSx, ml: 2 }} onClick={modalOpen('when')}>
                여행일정 <span className="text-xs">▼</span>
              </Button>
              <Button size="small" variant="outlined" sx={{ ...btnSx, ml: 2 }} onClick={modalOpen('cond')}>
                동행조건 <span className="text-xs">▼</span>
              </Button>
            </Box>
            <Box sx={{ display: 'flex', mt: { xs: 1, md: 0 }}}>
              <Button size='small' sx={sortBtn(sort==='desc')} onClick={() => setSort('desc')}>최신순</Button>
              <Button size='small' sx={sortBtn(sort==='good')} onClick={() => setSort('good')}>좋아요 많은순</Button>
              <Button size='small' sx={sortBtn(sort==='view')} onClick={() => setSort('view')}>조회수 많은순</Button>
            </Box>
          </Box>
        )}
        

        {/* Popover: topic */}
        <Popover
          open={open === 'topic'}
          onClose={modalClose}
          anchorEl={anchorEl}
          anchorOrigin={anchor}
          transformOrigin={transform}
          marginThreshold={8}
          slotProps={{ paper: { sx: popoverSx } }}
        >
          <IconButton onClick={modalClose} sx={{ position: 'absolute', top: 8, right: 8, color: '#bfbfbf' }}>
            <CloseIcon />
          </IconButton>
          주제선택
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {selectTopic.map((t) => (
              <Button
                key={t.value}
                variant="outlined"
                sx={outlined(t.selected)}
                onClick={() => toggleTopic(t.value)}
              >
                {TYPE_LABEL[t.value]}
              </Button>
            ))}
          </Box>
        </Popover>

        {/* Popover: 작성자 유형 */}
        <Popover
          open={open === 'author'}
          onClose={modalClose}
          anchorEl={anchorEl}
          anchorOrigin={anchor}
          transformOrigin={transform}
          marginThreshold={8}
          slotProps={{ paper: { sx: popoverSx } }}
        >
          <IconButton onClick={modalClose} sx={{ position: 'absolute', top: 8, right: 8, color: '#bfbfbf' }}>
            <CloseIcon />
          </IconButton>
          작성자 성별
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {authorGender.map((g) => (
              <Button key={g.gender} variant="outlined" sx={outlined(g.selected)} onClick={() => toggleAuthorGender(g.gender)}>
                {g.value}
              </Button>
            ))}
          </Box>
          작성자 연령대
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {authorAge.map((a) => (
              <Button key={a.age} variant="outlined" sx={outlined(a.selected)} onClick={() => toggleAuthorAge(a.age)}>
                {a.age}대
              </Button>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" sx={primaryContained} onClick={modalClose}>
              확인
            </Button>
          </Box>
        </Popover>

        {/* Popover: 여행일정 */}
        <Popover
          open={open === 'when'}
          onClose={modalClose}
          anchorEl={anchorEl}
          anchorOrigin={anchor}
          transformOrigin={transform}
          marginThreshold={8}
          slotProps={{ paper: { sx: popoverSx } }}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
            <IconButton onClick={modalClose} sx={{ position: 'absolute', top: 8, right: 8, color: '#bfbfbf' }}>
              <CloseIcon />
            </IconButton>
            날짜(기간 선택)

            <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1 }}>
              <TextField size="small" label="시작일" value={fmt(startDate)} readOnly fullWidth />
              <TextField size="small" label="종료일" value={fmt(endDate)} readOnly fullWidth />
            </Box>

            <DateCalendar
              value={null}
              onChange={handleDateChange}
              showDaysOutsideCurrentMonth
              slots={{ day: RangeDay }}
              slotProps={{ day: { startDate, endDate }, calendarHeader: { format: 'yyyy년 MM월' } }}
              minDate={new Date()}
              sx={{
                minWidth: '100%',
                '& .MuiDayCalendar-root': {
                  '--DayCalendar-headerHeight': '32px',
                  '--DayCalendar-rowHeight': '44px',
                },
                '& .MuiDayCalendar-monthContainer': { height: 'auto' },
                '& .MuiDayCalendar-weekDayLabel': {
                  width: 44,
                  height: 44,
                  margin: 0,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                '& .MuiDayCalendar-weekContainer': { margin: 0 },
                '& .MuiPickersDay-root': { width: 44, height: 44, fontSize: '0.85rem' },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button variant="contained" sx={primaryContained} onClick={modalClose}>
                확인
              </Button>
            </Box>
          </LocalizationProvider>
        </Popover>

        {/* Popover: 동행조건 */}
        <Popover
          open={open === 'cond'}
          onClose={modalClose}
          anchorEl={anchorEl}
          anchorOrigin={anchor}
          transformOrigin={transform}
          marginThreshold={8}
          slotProps={{ paper: { sx: popoverSx } }}
        >
          <IconButton onClick={modalClose} sx={{ position: 'absolute', top: 8, right: 8, color: '#bfbfbf' }}>
            <CloseIcon />
          </IconButton>
          모집 성별
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {condGender.map((g) => (
              <Button key={g.gender} variant="outlined" sx={outlined(g.selected)} onClick={() => toggleCondGender(g.gender)}>
                {g.value}
              </Button>
            ))}
          </Box>
          모집 연령대
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {condAge.map((a) => (
              <Button key={a.age} variant="outlined" sx={outlined(a.selected)} onClick={() => toggleCondAge(a.age)}>
                {a.age}대
              </Button>
            ))}
          </Box>
          동행 유형
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {condType.map((t) => (
              <Button key={t.style} variant="outlined" sx={outlined(t.selected)} onClick={() => toggleCondType(t.style)}>
                {t.style}
              </Button>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button variant="contained" sx={primaryContained} onClick={modalClose}>
              확인
            </Button>
          </Box>
        </Popover>
      </div>
    </Box>
  );
}

// ----------------------------- 스타일 유틸 -----------------------------
const btnSx = { color: '#bfbfbf', borderColor: '#bfbfbf', borderRadius: 5, height: 27 };
const outlined = (on) => ({ borderColor: on ? '#20b2aa' : '#bfbfbf', color: on ? '#20b2aa' : '#bfbfbf', borderRadius: 20 });
const primaryContained = {
  color: 'white',
  backgroundColor: '#20b2aa',
  borderRadius: 20,
  px: 3,
  '&:hover': { backgroundColor: '#1d9a97' },
};
const sortBtn = (on) => ({
  minWidth: 0,
  color: on? '#20b2aa':'#bfbfbf',
  fontWeight: on? 700:400
})