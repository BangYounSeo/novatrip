import { Autocomplete, TextField, CircularProgress, ListSubheader } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ✅ 디바운스 유틸
function useDebouncedCallback(cb, delay) {
  const tRef = useRef(null);
  return useCallback((...args) => {
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => cb(...args), delay);
  }, [cb, delay]);
}

/** 
 * PlaceSearch
 * props:
 *   localPools: Array<Array<TourItem>> (stayData/tripData/…)
 *   onSelect(place) : 공통형 place를 넘겨줌 → SpotStep에서 tourSpot 세팅
 *   reverseGeocode(lat, lng) : borough/주소 보완용(카카오 역지오코딩 훅)
 */
function PlaceSearch({ localPools, onSelect, reverseGeocode, disabled,normalizeTourItem,normalizeKakaoPlace,dedupPlaces }) {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const kakaoCache = useRef(new Map()); // query → results 캐시

  // 로컬(메모리) 검색
  const searchLocal = useCallback((q) => {
    if (!q) return [];
    const qLower = q.trim().toLowerCase();
    const flat = localPools.flat().filter(Boolean);
    const matched = flat
      .filter(it => (it.title || '').toLowerCase().includes(qLower))
      .slice(0, 50)
      .map(normalizeTourItem);
    return matched;
  }, [localPools]);

  // 카카오 키워드 검색
  const searchKakao = useCallback((q) => {
    return new Promise((resolve) => {
      if (!q) return resolve([]);
      // 캐시 조회
      const cached = kakaoCache.current.get(q);
      if (cached) return resolve(cached);

      const ps = new window.kakao.maps.services.Places();
      // 옵션에서 지역/정렬 제어 가능(예: { category_group_code:'FD6', location, radius, bounds, ... })
      ps.keywordSearch(q, (data, status) => {
        if (status !== window.kakao.maps.services.Status.OK || !Array.isArray(data)) {
          kakaoCache.current.set(q, []);
          return resolve([]);
        }
        const normalized = data.slice(0, 20).map(normalizeKakaoPlace);
        kakaoCache.current.set(q, normalized);
        resolve(normalized);
      }, { size: 20 });
    });
  }, []);

  const runSearch = useDebouncedCallback(async (q) => {
    setLoading(true);
    const local = searchLocal(q);
    const kakao = await searchKakao(q);
    const merged = dedupPlaces([
      // 가독성을 위해 그룹 헤더를 의도적으로 끼워넣음
      // Autocomplete의 groupBy를 쓰면 더 깔끔해짐
      ...local.map(p => ({ ...p, _group: '' })),
      ...kakao.map(p => ({ ...p, _group: '카카오 장소' })),
    ]);
    setOptions(merged);
    setLoading(false);
  }, 250);

  useEffect(() => { runSearch(input); }, [input, runSearch]);

  return (
    <Autocomplete
      disabled={disabled}
      options={options}
      loading={loading}
      filterOptions={(x) => x} // 기본 필터 끄기(이미 필터링했음)
      groupBy={(opt) => opt._group}
      getOptionLabel={(opt) => opt?.name || ''}
      onInputChange={(_e, value) => setInput(value)}
      onChange={async (_e, value) => {
        if (!value) return;
        // borough 없으면 역지오코딩으로 보완
        let borough = value.borough || '';
        let address = value.address || '';
        let roadAddress = value.roadAddress || '';
        if (!borough || !address || !roadAddress) {
          try {
            const rev = await reverseGeocode(value.lat, value.lng);
            borough = borough || rev.borough;
            address = address || rev.address;
            roadAddress = roadAddress || rev.roadAddress;
          } catch {}
        }
        onSelect({
          placeName: value.name,
          lat: value.lat, 
          lng: value.lng,
          address,
          roadAddress,
          borough,
        });
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          placeholder="업소/관광지 이름으로 검색"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderGroup={(params) => [
        <ListSubheader key={params.key}>{params.group}</ListSubheader>,
        params.children,
      ]}
      noOptionsText={input ? '검색 결과가 없습니다.' : '검색어를 입력하세요.'}
    />
  );
}
export default PlaceSearch;