import { Box, Chip, IconButton, Modal, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useState,useEffect, useContext } from "react";
import { useCallback } from 'react';
import { Button } from '@mui/material';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import CloseIcon from '@mui/icons-material/Close'
import { BoardContext } from "../BoardContext";
import PlaceSearch from "./PlaceSearch";

export function AddressSearchButton({ onSelect }) {
  const openPostcode = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        // data.roadAddress, data.address, data.sido, data.sigungu 등 제공
        const borough = data.sigungu?.endsWith('구') ? data.sigungu : ''; // '강남구'
        onSelect({
          address: data.address,
          roadAddress: data.roadAddress,
          borough
        });
      }
    }).open();
  };

  return <Button variant="outlined" onClick={openPostcode}>주소 검색</Button>;
}

export function MapPicker({ center = { lat:37.5665, lng:126.9780 }, value, onChange }) {
  const [pos, setPos] = useState(value || center);

  useEffect(() => {
    if (value && Number.isFinite(value.lat) && Number.isFinite(value.lng)) {
      setPos(value);
    }
  }, [value]);

  const handleClick = (_t, mouseEvent) => {
    const latlng = mouseEvent.latLng;
    const next = { lat: latlng.getLat(), lng: latlng.getLng() };
    setPos(next);
    onChange?.(next);
  };

  return (
    <Map
      center={pos}
      style={{ width:'100%', height: 360, borderRadius: 12 }}
      level={5}
      onClick={handleClick}
    >
      <MapMarker position={pos} />
    </Map>
  );
}

export function useReverseGeocodeKakao() {
  return useCallback((lat, lng) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      const coord = new window.kakao.maps.LatLng(lat, lng);

      geocoder.coord2Address(coord.getLng(), coord.getLat(), (result, status) => {
        if (status !== window.kakao.maps.services.Status.OK || !result?.[0]) {
          reject(new Error("역지오코딩 실패"));
          return;
        }
        const r = result[0];

        // 지번 주소
        const jibunAddress = r.address?.address_name || "";

        // 도로명 주소
        const roadAddress = r.road_address?.address_name || "";

        // 행정구(구)
        const borough = r.address?.region_2depth_name?.endsWith("구")
          ? r.address.region_2depth_name
          : "";

        resolve({
          address: jibunAddress,
          roadAddress,
          borough,
        });
      });
    });
  }, []);
}

export function useGeocodeKakao() {
   return useCallback((address) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result?.[0]) {
          const { x, y, road_address, address_name } = result[0];
          resolve({
            lng: parseFloat(x),
            lat: parseFloat(y),
            // 보조로 얻을 수 있는 문자열들
            _roadAddressFromGeo: road_address?.address_name || "",
            _addressFromGeo: address_name || "",
          });
        } else reject(new Error("주소 지오코딩 실패"));
      });
    });
  }, []);
}


function SpotStep({ modalCat,stayData,isLoadingMapData,tripData,foodData,cafeData,cultureData,leisureData,shopData }) {

  const {form,setForm,subModalOpen,setSubModalOpen} = useContext(BoardContext)
  const [spot,setSpot] = useState(form.tourSpot)
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 카카오 API가 로드될 때까지 확인
    const check = setInterval(() => {
      if (window?.kakao?.maps?.services?.Geocoder) {
        setIsReady(true);
        clearInterval(check);
      }
    }, 300);

    return () => clearInterval(check);
  }, []);

  const onChange = (next) => {
    setForm(p => ({...p,tourSpot:next}))
  }

  useEffect(() => {
    setSpot(form.tourSpot || null)
  },[form.tourSpot])

  const geocode = useGeocodeKakao()
  const reverseGeocode = useReverseGeocodeKakao()

  const onAddressSelect = async(addr) => {
    const { lat, lng, _roadAddressFromGeo, _addressFromGeo } = await geocode(
      addr.roadAddress || addr.address
    );
    const next = {
      ...(spot || {}),...addr,lat,lng,
    };

    // 만약 주소검색 API가 한쪽 주소만 줄 때 대비하여 보정
    if (!next.roadAddress && _roadAddressFromGeo)
      next.roadAddress = _roadAddressFromGeo;
    if (!next.address && _addressFromGeo)
      next.address = _addressFromGeo;

    setSpot(next);
    onChange?.(next);
  }

  const onMapChange = async(pos) => {
    const rev = await reverseGeocode(pos.lat, pos.lng); // {address, roadAddress, borough}
    const next = { ...(spot || {}), ...rev, lat: pos.lat, lng: pos.lng };
    setSpot(next);
    onChange?.(next);
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = coords.latitude;
        const lng = coords.longitude;
        const rev = await reverseGeocode(lat, lng);
        const next = { ...(spot || {}), ...rev, lat, lng };
        setSpot(next);
        onChange?.(next);
      },
      (err) => {
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const normalizeTourItem = (item) => {
    const name = item.title || '';
    const lat = parseFloat(item.mapy);
    const lng = parseFloat(item.mapx);
    const address = item.addr1 || '';
    const roadAddress = item.addr2 || '';
    return {
      source : 'local',
      id: String(item.contentid),
      name,
      lat,
      lng,
      address,
      roadAddress,
      borough: '',
      raw: item,
    }
  }

  const normalizeKakaoPlace = (place) => {
    const name = place.place_name || '';
    const lat = parseFloat(place.y);
    const lng = parseFloat(place.x);
    const address = place.address_name || '';
    const roadAddress = place.road_address?.address_name || '';
    const borough = (address.split(' ').find(t => t.endsWith('구')) || '') || 
      (roadAddress.split(' ').find(t => t.endsWith('구')) || '');
    return {
      source : 'kakao',
      id: String(place.id),
      name,
      lat,
      lng,
      address,
      roadAddress,
      borough: '',
      raw: place,
    }
  }

  const dedupPlaces = (list) => {
    const seen = new Set();
    const out = [];
    for(const p of list){
      const key = `${p.name}|${p.lat}|${p.lng}`;
      if(!seen.has(key)){
        seen.add(key);
        out.push(p);
      }
    }
    return out;
  }

  const style = {
      position:'absolute',
      inset:0,
      overflow: 'auto',
      display:'flex',
      justifyContent:'center',
      alignItems:'end',
  }

  const card = {
      width:'100%',
      maxWidth:660,
      bgcolor:'background.paper',
      p:4,
      borderRadius:2,
      boxShadow:4,
      zIndex:1500,
      position:'relative',
      height:'50vh',
      overflowY:'auto',
      animation:'slideUp 0.3s ease-in-out',
      '& *':{ maxWidth:'100%' }
  }

  const onBack = () => {
      setSubModalOpen(false)
  }

  const place = {
    mate:'동행위치 또는 방문위치',
    review:'방문한 위치',
    recommend:'추천 위치'
  }

  if(!isReady){
    return (
      <Modal open={subModalOpen} onClose={onBack} keepMounted disablePortal
           sx={{ position:'absolute', inset:0 }}
           BackdropProps={{ sx:{ backgroundColor:'rgba(0,0,0,0.45)', position:'absolute', inset:0 } }}>
      <Box onClick={(e) => e.stopPropagation()} sx={{
        position:'absolute', inset:0, display:'flex',
        alignItems:'center', justifyContent:'center'
      }}>
        <Typography color="text.secondary">지도 서비스를 불러오는 중...</Typography>
      </Box>
    </Modal>
    )
  }

  return (
    <Modal open={subModalOpen} onClose={onBack} keepMounted disablePortal sx={{position:'absolute', inset:0}} BackdropProps={{sx:{backgroundColor:'rgba(0,0,0,0.45)',position:'absolute', inset:0}}}
    aria-labelledby='condition-title' aria-describedby='condition-description'>
      <Box onClick={(e) => e.stopPropagation()} sx={style}>
        <Box sx={card}>
          <IconButton onClick={onBack} sx={{position:'absolute', top:8, right:8, color:'#bfbfbf'}}><CloseIcon/></IconButton>
            <Typography id='addMate-title'variant='subtitle2' align='center' gutterBottom>
              {place[form.boardType]} 설정
            </Typography>
            <Box sx={{mt:2, display:'flex', flexDirection:'column', gap:2}}>
              <Typography variant="body2" color="text.secondary" sx={{alignSelf:'center'}}>주소 검색 또는 지도를 클릭하여 {place[form.boardType]}를 설정하세요.</Typography>
            <Stack spacing={1}>
              <Box>
                <PlaceSearch
                  disabled={!isReady}
                  localPools={[
                    stayData || [],
                    tripData || [],
                    foodData || [],
                    cafeData || [],
                    cultureData || [],
                    leisureData || [],
                    shopData || [],
                  ]}
                  normalizeTourItem={normalizeTourItem}
                  normalizeKakaoPlace={normalizeKakaoPlace}
                  dedupPlaces={dedupPlaces}
                  reverseGeocode={reverseGeocode}
                  onSelect={(picked) => {
                    // 선택 시 spot/form.tourSpot 갱신
                    const next = { ...(spot || {}), ...picked };
                    setSpot(next);
                    onChange?.(next);
                  }}
                />
              </Box>
              <Stack direction='row' spacing={1}>
              <AddressSearchButton onSelect={onAddressSelect} />
              <Button onClick={useMyLocation}>
                현재 위치 사용
              </Button>
              </Stack>
            </Stack>
            <MapPicker
              center={
                spot?.lat && spot?.lng
                  ? { lat: spot.lat, lng: spot.lng }
                  : { lat: 37.5665, lng: 126.9780 } // 서울시청 기본값
              }
              value={spot?.lat && spot?.lng ? { lat: spot.lat, lng: spot.lng } : undefined}
              onChange={onMapChange}
            />
            {spot?.address && (
              <Box>
                <Chip label={spot.roadAddress || spot.address} sx={{ mr: 1, mb: 1 }} />
                {spot?.borough && <Chip label={spot.borough} sx={{ mr: 1, mb: 1 }} />}
                {spot?.placeName && <Chip label={spot.placeName} sx={{ mr: 1, mb: 1 }} />}
              </Box>
            )}
          </Box>
          <Box sx={{display:'flex',justifyContent:'flex-end', mt:2}}>
           <Button variant='contained' onClick={() => setSubModalOpen(false)} sx={{color:'white', backgroundColor:'#20b2aa', borderRadius:20,px:3}}>확인</Button>
          </Box>
        </Box>
        </Box>
      </Modal>
  );
}

export default SpotStep