"use client";
import { useState } from "react";
import { IconButton, Typography, Tooltip, Zoom } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { getHolidayName, isPoyaDay, isWeekend } from '@/config/holidays';

export function CustomCalendar({
  selectedDate,
  minDate,
  onSelect
}: {
  selectedDate: string;
  minDate: string;
  onSelect: (date: string) => void;
}) {
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) return new Date(selectedDate);
    return new Date();
  });
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const weekDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const renderDays = () => {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const numDays = daysInMonth(month, year);
    const startDay = firstDayOfMonth(month, year);
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ width: '100%', aspectRatio: '1/1' }} />);
    }

    const minDateObj = new Date(minDate.split('T')[0]);
    const selectedDateObj = selectedDate ? new Date(selectedDate) : null;

    for (let d = 1; d <= numDays; d++) {
      const current = new Date(year, month, d);
      const isToday = new Date().toDateString() === current.toDateString();
      const isSelected = selectedDateObj && current.toDateString() === selectedDateObj.toDateString();
      const isDisabled = current < minDateObj;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const holidayName = getHolidayName(dateStr);
      const isPoya = isPoyaDay(dateStr);
      const isHoliday = !!holidayName;
      const isSatSun = isWeekend(current);
      const dayLabel = holidayName || (isSatSun ? (current.getDay() === 0 ? 'Sunday' : 'Saturday') : '');

      days.push(
        <Tooltip key={d} title={dayLabel} arrow TransitionComponent={Zoom} enterTouchDelay={0} placement="top">
          <button
            disabled={isDisabled}
            onClick={() => {
              const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              onSelect(formatted);
            }}
            style={{
              width: '100%', aspectRatio: '1/1', borderRadius: '10px', border: 'none', outline: 'none',
              background: isSelected ? '#0d9488' : isToday ? 'rgba(13,148,136,0.1)' : isPoya ? 'rgba(234, 179, 8, 0.1)' : isHoliday ? 'rgba(239, 68, 68, 0.05)' : isSatSun ? 'rgba(0,0,0,0.03)' : 'transparent',
              color: isSelected ? 'white' : isDisabled ? '#d1d5db' : isPoya ? '#ca8a04' : isHoliday ? '#dc2626' : isSatSun ? '#6b7280' : isToday ? '#0d9488' : '#374151',
              fontWeight: isSelected || isToday || isPoya || isHoliday ? 700 : 500,
              fontSize: '0.8rem', cursor: isDisabled ? 'not-allowed' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative'
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>{d}</span>
            <div style={{ display: 'flex', gap: '2px', position: 'absolute', bottom: '15%' }}>
              {isToday && !isSelected && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0d9488' }} />}
              {isPoya && !isSelected && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#eab308' }} />}
              {isHoliday && !isPoya && !isSelected && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444' }} />}
            </div>
            {(isPoya || isHoliday) && !isSelected && (
              <div style={{ position: 'absolute', top: '4px', right: '4px', width: '5px', height: '5px', borderRadius: '50%', background: isPoya ? '#eab308' : '#ef4444' }} />
            )}
          </button>
        </Tooltip>
      );
    }
    return days;
  };

  return (
    <div style={{ width: '100%', userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: 'rgba(13,148,136,0.04)', padding: '6px', borderRadius: '12px' }}>
        <IconButton onClick={handlePrevMonth} size="small" sx={{ color: '#0d9488' }}><ChevronLeft /></IconButton>
        <Typography sx={{ fontWeight: 700, fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', color: '#111827' }}>
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </Typography>
        <IconButton onClick={handleNextMonth} size="small" sx={{ color: '#0d9488' }}><ChevronRight /></IconButton>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
        {weekDays.map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: '0.6rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', paddingBottom: '4px' }}>{day}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {renderDays()}
      </div>
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: '0.65rem', color: '#6b7280', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0d9488' }} /> Today</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#eab308' }} /> Poya</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} /> Holiday</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px' }} /> Weekend</div>
      </div>
    </div>
  );
}
