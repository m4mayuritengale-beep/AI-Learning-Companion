import React from 'react';
import '../styles/SkeletonLoader.css';

export function SkeletonCard() {
  return (
    <div className="skeleton-card-pulse">
      <div className="skeleton-line title"></div>
      <div className="skeleton-line text"></div>
      <div className="skeleton-line text short"></div>
    </div>
  );
}

export function SkeletonBanner() {
  return (
    <div className="skeleton-banner-pulse">
      <div className="skeleton-line title"></div>
      <div className="skeleton-line text"></div>
    </div>
  );
}
