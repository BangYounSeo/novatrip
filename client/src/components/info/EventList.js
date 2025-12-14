import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import EventItem from './EventItem';

const EventList = ({ eventData, onEventClick,userid,openLoginModal }) => {
  const flatData = eventData.flat();

  // 마지막 줄에 포함될 아이템 계산
  const fullRowsCount = Math.floor(flatData.length / 2) * 2;
  const lastRowItems = flatData.slice(fullRowsCount);

  return (
    <Box sx={{mt:2.5}}>
      <Grid container spacing={{ xs: 1, sm: 3 }} justifyContent="center">
        {flatData.slice(0, fullRowsCount).map((item, index) => (
          <Grid item xs={12} sm={6} key={`${item.contentid}-${index}` }>
            <EventItem item={item} onEventClick={onEventClick} userid={userid} openLoginModal ={openLoginModal}/>
          </Grid>
        ))}
      </Grid>

      {lastRowItems.length > 0 && (
        <Grid container spacing={2} sx={{mt:3,pl:{lg:7.5,xs:3}}} justifyContent="flex-start">
          {lastRowItems.map((item, index) => (
            <Grid item  xs={12} sm={6} key={`${item.contentid}-${index}`}>
              <EventItem item={item} onEventClick={onEventClick} userid={userid}/>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default EventList;