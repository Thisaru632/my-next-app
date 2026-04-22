"use client";

import React from 'react';
import { IconButton } from '@mui/material';
import { Visibility, Map as MapIcon, MyLocation as MyLocationIcon, RemoveCircle, AddCircle } from '@mui/icons-material';
import { useHeroBooking } from './useHeroBooking';

interface TripSummaryCardProps {
  booking: ReturnType<typeof useHeroBooking>;
}

export function TripSummaryCard({ booking: h }: TripSummaryCardProps) {
  if (!h.formData.pickupLocation) {
    return null;
  }

  return (
    <div className="w-full lg:max-w-xs xl:max-w-sm rounded-xl p-3 sm:p-5" style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)", border: "1px solid rgba(255,255,255,0.45)", boxShadow: "0 8px 40px 0 rgba(31, 38, 135, 0.14)", alignSelf: "flex-start", textAlign: "left" }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', fontWeight: 700, color: '#0d9488', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Trip Estimate</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '2px' }}>🗺️</span>
            <div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1px' }}>Trip Type</div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>{h.formData.tripType}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '2px' }}>🚗</span>
            <div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1px' }}>Selected Vehicle</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>{h.formData.vehicleType} — {h.formData.vehicleName}</div>
                <button onClick={() => { h.setPhotosVehicle(h.formData.vehicleName); h.setOpenPhotosDialog(true); }} style={{ padding: '3px 8px', fontSize: '0.65rem', background: 'rgba(13,148,136,0.08)', border: '1.5px solid rgba(13,148,136,0.35)', borderRadius: '6px', color: '#0d9488', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#0d9488'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(13,148,136,0.08)'; e.currentTarget.style.color = '#0d9488'; }}>
                  <Visibility sx={{ fontSize: '0.85rem' }} /> View
                </button>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '2px' }}>👥</span>
            <div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1px' }}>Capacity Details</div>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                {h.formData.maxPersons > 0 ? `Max ${h.formData.maxPersons} Persons` : ''}{h.formData.maxPersons > 0 && h.formData.maxBags > 0 && ' • '}{h.formData.maxBags > 0 && `Max ${h.formData.maxBags} Bags`}
              </div>
            </div>
          </div>
        {h.matchedPackage && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '2px' }}>💳</span>
            <div style={{ width: '100%' }}>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem', color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Package Allowances</div>
              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.7)', borderRadius: '8px', border: '1px solid rgba(13,148,136,0.2)', fontSize: '0.68rem', color: '#111827', fontFamily: "'Montserrat', sans-serif" }}>
                {h.formData.vehicleType !== 'SUV' && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}><span style={{ color: '#4b5563' }}>Extra KM Rate:</span><span style={{ fontWeight: 700 }}>LKR {h.matchedPackage?.extraKMRate || 0}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#4b5563' }}>{(h.formData.tripType === 'Drop' || h.formData.tripType === 'One Way') ? 'Waiting Hour Rate:' : 'Extra Hour Rate:'}</span><span style={{ fontWeight: 700 }}>LKR {h.matchedPackage?.extraHrRate1 || 0}</span></div>
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px dashed rgba(13,148,136,0.2)', paddingTop: '6px' }}>
                  <span style={{ color: '#0d9488', fontWeight: 700, fontSize: '0.65rem' }}>{(h.formData.tripType === 'Drop' || h.formData.tripType === 'One Way') ? 'ADD WAITING HOURS:' : 'ADD EXTRA HOURS:'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <IconButton size="small" onClick={() => h.handleChange('additionalHours', Math.max(0, (Number(h.formData.additionalHours) || 0) - 1))} sx={{ padding: '1px', border: '1.2px solid #0d9488', color: '#0d9488', opacity: (Number(h.formData.additionalHours) || 0) <= 0 ? 0.4 : 1 }} disabled={(Number(h.formData.additionalHours) || 0) <= 0}><RemoveCircle sx={{ fontSize: '16px' }} /></IconButton>
                    <input type="number" value={h.formData.additionalHours === 0 ? "" : h.formData.additionalHours} onChange={(e) => h.handleChange('additionalHours', e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '32px', height: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.9)', border: '1.2px solid rgba(13,148,136,0.3)', borderRadius: '4px', fontFamily: "'Montserrat', sans-serif", fontSize: '0.8rem', fontWeight: 800, color: '#0d9488', outline: 'none' }} />
                    <IconButton size="small" onClick={() => h.handleChange('additionalHours', (Number(h.formData.additionalHours) || 0) + 1)} sx={{ padding: '1px', border: '1.2px solid #0d9488', color: '#0d9488' }}><AddCircle sx={{ fontSize: '16px' }} /></IconButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '2px' }}>📍</span>
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', marginBottom: '1px' }}>Route Distance</div>
              {h.routeLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <div style={{ width: '10px', height: '10px', border: '1.5px solid rgba(13,148,136,0.25)', borderTop: '1.5px solid #0d9488', borderRadius: '50%', animation: 'loc-spin 0.7s linear infinite' }} />
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.75rem', color: '#0d9488', fontWeight: 600 }}>Calculating...</span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{h.routeDistance ? Math.ceil(h.routeDistance / 1000) : '0'} km</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={h.handleViewDirections} disabled={!h.routeDistance} style={{ padding: '3px 8px', fontSize: '0.65rem', background: 'rgba(13,148,136,0.08)', border: '1.5px solid rgba(13,148,136,0.35)', borderRadius: '6px', color: '#0d9488', cursor: h.routeDistance ? 'pointer' : 'not-allowed', opacity: h.routeDistance ? 1 : 0.4, fontWeight: 700 }}>
                        <MapIcon sx={{ fontSize: '0.85rem' }} /> View
                      </button>
                      <button onClick={() => { if (h.routeDistance) h.setOpenNearbyViewer(true); }} disabled={!h.routeDistance} style={{ padding: '3px 8px', fontSize: '0.65rem', background: 'rgba(59,130,246,0.08)', border: '1.5px solid rgba(59,130,246,0.35)', borderRadius: '6px', color: '#3b82f6', cursor: h.routeDistance ? 'pointer' : 'not-allowed', opacity: h.routeDistance ? 1 : 0.4, fontWeight: 700 }}>
                        <MyLocationIcon sx={{ fontSize: '0.85rem' }} /> Nearby
                      </button>
                    </div>
                  </div>
                  {h.routeDuration !== null && <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem', color: '#4b5563', marginTop: '1px' }}>Est. Drive: {h.routeDuration >= 3600 ? `${Math.floor(h.routeDuration / 3600)}h ${Math.round((h.routeDuration % 3600) / 60)}m` : `${Math.round(h.routeDuration / 60)} min`}</div>}
                  {h.matchedPackage && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginTop: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ fontSize: '0.75rem' }}>ℹ️</span><span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', color: '#0d9488', fontWeight: 600 }}>{h.matchedPackage.hrs} Free Hours Included</span></div>
                      {/* Number(h.formData.additionalHours) > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ fontSize: '0.75rem' }}>➕</span><span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', color: '#0d9488', fontWeight: 600 }}>{h.formData.additionalHours} Extra Hours Added (@ LKR {h.matchedPackage.extraHrRate1}/h)</span></div>} */}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        {h.formData.pickupLocation && h.formData.dropoffLocation && 
         (h.formData.tripType !== 'Return' || h.formData.destinations.some(d => d.address.trim())) && 
         (h.formData.vehicleType === 'SUV' || h.formData.tripType) && (
          <div id="booking-summary-rate-area" style={{ marginTop: '6px', padding: '12px', background: 'rgba(13,148,136,0.06)', borderRadius: '12px', border: '1px solid rgba(13,148,136,0.15)' }}>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.7rem', color: '#0d9488', fontWeight: 800, textTransform: 'uppercase', marginBottom: '3px' }}>{h.formData.vehicleType === 'SUV' || (h.formData.vehicleType === 'Bus' && h.distanceInKm >= h.minKmRequired) || h.totalPrice === 0 ? 'Booking Request' : 'Total Estimate'}</div>
            {/* Pricing Details */}
            {((h.formData.vehicleType === 'Bus' && h.formData.tripType === 'Drop' && h.distanceInKm >= h.minKmRequired) || h.formData.vehicleType === 'SUV' || h.totalPrice === 0) ? (
              <div style={{ marginTop: '6px' }}>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#0d9488' }}>Price on Request</span>
                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', color: '#3b82f6', lineHeight: 1.5, marginTop: '8px', padding: '10px 12px', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
                  Submit the request and our team will contact you with the best rate.
                </div>
              </div>
            ) : (
              <>
                {h.appliedPromo && h.discountAmount > 0 ? (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', textDecoration: 'line-through' }}>LKR {(h.rawTotalPrice + h.nightSurcharge).toLocaleString()}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '1px 5px', borderRadius: '4px' }}>{h.appliedPromo.discountType === 'Percentage' ? `-${h.appliedPromo.discountValue}%` : `- LKR ${h.appliedPromo.discountValue.toLocaleString()}`} OFF</span>
                    </div>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.35rem', fontWeight: 800, color: '#0d9488' }}>LKR {h.totalPrice.toLocaleString()}</span>
                    <div style={{ marginTop: '2px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '1px 8px', background: '#ef4444', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)' }}>💵 CASH</div>
                    </div>
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>Promo applied: {h.appliedPromo.code} (Saved LKR {h.discountAmount.toLocaleString()})</div>
                  </div>
                ) : (
                  <div style={{ marginTop: '6px' }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#0d9488' }}>LKR {h.totalPrice.toLocaleString()}</span>
                    <div style={{ marginTop: '2px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '1px 8px', background: '#ef4444', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)' }}>💵 CASH</div>
                    </div>
                    {h.appliedPromo && (
                      <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: '#6b7280', fontWeight: 600, marginTop: '4px' }}>
                        Promo "{h.appliedPromo.code}" is valid only for {h.appliedPromo.applicableVehicle === 'All' ? 'any vehicle' : h.appliedPromo.applicableVehicle}.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
                {/* h.extraKmDetail && <div style={{ marginTop: '3px', padding: '5px 8px', background: 'rgba(13,148,136,0.06)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.6rem', color: '#4b5563', fontWeight: 600 }}>Extra KM: {h.extraKmDetail.km} km @ LKR {h.matchedPackage?.extraKMRate}/km</span><span style={{ fontSize: '0.65rem', color: '#0d9488', fontWeight: 700 }}>+ LKR {h.extraKmDetail.cost.toLocaleString()}</span></div> */}
                {/* Number(h.formData.additionalHours) > 0 && <div style={{ marginTop: '3px', padding: '5px 8px', background: 'rgba(13,148,136,0.06)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '0.6rem', color: '#4b5563', fontWeight: 600 }}>Extra Hours: {h.formData.additionalHours}h @ LKR {h.matchedPackage?.extraHrRate1}/h</span><span style={{ fontSize: '0.65rem', color: '#0d9488', fontWeight: 700 }}>+ LKR {(h.formData.additionalHours * (h.matchedPackage?.extraHrRate1 || 0)).toLocaleString()}</span></div> */}

                <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.65rem', color: '#6b7280', marginTop: '3px' }}>*Actual price may vary based on route changes.</div>
                {h.routeDistance !== null && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    {h.minKmRequired > h.distanceInKm && (
                      <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', color: '#0f766e', lineHeight: 1.5, padding: '10px 12px', background: 'rgba(13,148,136,0.05)', borderRadius: '8px', border: '1px solid rgba(13,148,136,0.2)' }}>
                        <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '0.9rem' }}>ℹ️</span> Package Policy Notice</div>
                        For a {h.formData.numberOfDays}-day reservation, the minimum package starts from <strong>{h.minKmRequired} km</strong>.
                      </div>
                    )}
                    <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.68rem', color: '#3b82f6', lineHeight: 1.5, padding: '10px 12px', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
                      <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '0.9rem' }}>✅</span> Next Steps</div>
                      Please submit your request. Our team will contact you to confirm your booking.
                    </div>
                  </div>
                )}
            {Number(h.formData.numberOfDays) > 5 && (
              <div style={{ marginTop: '1rem', padding: '12px', background: 'rgba(13,148,136,0.06)', borderRadius: '10px', border: '1.5px solid rgba(13,148,136,0.2)', fontFamily: "'Montserrat', sans-serif", fontSize: '0.72rem', color: '#0d9488', fontWeight: 600, textAlign: 'left', lineHeight: 1.5 }}>
                ℹ️ This trip is more than 5 days. Because we have to clarify some things with you, don't worry—just submit this request and our team will contact you shortly.
              </div>
            )}
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button onClick={() => h.setOpenPolicyDialog(true)} style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '0.72rem', fontFamily: "'Montserrat', sans-serif", fontWeight: 500, cursor: 'pointer', textDecoration: 'underline' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0d9488')} onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}>
                Privacy Policies & Terms and Conditions
              </button>
            </div>
            <div style={{ marginTop: "1rem" }}>
              {(() => {
                const canSubmit = !!(h.formData.vehicleName && h.formData.tripType && h.formData.pickupLocation && h.formData.dropoffLocation && h.formData.dateTime && (h.formData.tripType === 'Drop' || !!h.formData.numberOfDays));
                return (
                  <button onClick={h.handleRequestBooking} disabled={!canSubmit} className="inline-flex items-center justify-center text-white uppercase w-full"
                    style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.04em", border: "1.8px solid #0d9488", borderRadius: "12px", padding: "0.85rem 1.6rem", background: canSubmit ? "linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)" : "rgba(13,148,136,0.35)", color: "#ffffff", transition: "all 0.3s ease", cursor: canSubmit ? "pointer" : "not-allowed", boxShadow: canSubmit ? "0 4px 14px 0 rgba(13,148,136,0.39)" : "none" }}
                    onMouseEnter={(e) => { if (canSubmit) { e.currentTarget.style.background = "linear-gradient(135deg, #0f766e 0%, #2563eb 100%)"; e.currentTarget.style.transform = "translateY(-2px)"; } }}
                    onMouseLeave={(e) => { if (canSubmit) { e.currentTarget.style.background = "linear-gradient(135deg, #0d9488 0%, #3b82f6 100%)"; e.currentTarget.style.transform = "translateY(0)"; } }}
                  >Request Booking <span className="ml-2">→</span></button>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
