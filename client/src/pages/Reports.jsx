import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/under-construction.scss';

const Reports = () => {
  return (
    <div className="under-construction">
      <span className="under-construction__coming-soon">Coming Soon</span>
      <div className="under-construction__icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="under-construction__icon--animate">
          <path d="M507.6 122.8c-2.9-2.9-7.7-2.9-10.6 0l-65.3 65.3-39.4-39.6c-2.9-2.9-7.7-2.9-10.6 0l-31.3 31.5-26.3-26.1c43.4-61.8 35.7-146.5-19.1-199.6-62.4-60.1-160.3-58.8-220.5 2.9C24.2 17.1 20.5 98.3 71.8 160.5l-.5.5L21.3 214c-2.9 3-2.9 7.8 0 10.8l53.5 53.9c1.4 1.5 3.4 2.3 5.3 2.3 1.9 0 3.8-.8 5.3-2.3l53.4-54c62.2 50.2 152.9 45.4 207.4-14.1 51-55.6 54.8-140.9 9.5-201.3l26.3 26.1c2.9 2.9 7.7 2.9 10.6 0l31.3-31.5 39.4 39.6c1.5 1.5 3.4 2.2 5.3 2.2s3.8-.7 5.3-2.2l65.3-65.5c3-3 3-7.8 0-10.7zm-300.4 79c-35.9 37.2-95.6 37.7-132.2 1.4-36.7-36.5-36.7-95.9 0-132.4 36.8-36.5 96.5-36.5 133.3 0 35.1 34.9 36.2 94.5-1.1 131zm171.1-9.1c-31.4 31.6-82.2 31.6-113.6 0-31.3-31.4-31.3-82.4 0-113.8 31.4-31.4 82.2-31.4 113.6 0 31.4 31.4 31.4 82.4 0 113.8zm113.6 113.2h-34.4v-34.6c0-4.2-3.4-7.6-7.6-7.6s-7.6 3.4-7.6 7.6v34.6h-34.4c-4.2 0-7.6 3.4-7.6 7.6s3.4 7.6 7.6 7.6h34.4v34.6c0 4.2 3.4 7.6 7.6 7.6s7.6-3.4 7.6-7.6v-34.6h34.4c4.2 0 7.6-3.4 7.6-7.6 0-4.3-3.4-7.6-7.6-7.6z"/>
        </svg>
      </div>
      <h1 className="under-construction__title">Reports Dashboard Under Construction</h1>
      <div className="under-construction__progress">
        <div className="under-construction__progress-bar"></div>
      </div>
      <p className="under-construction__message">
        We're working hard to build a comprehensive reporting system for StockTrack. 
        Soon you'll be able to generate detailed inventory reports, analyze trends, 
        and export data in multiple formats.
      </p>
      <Link to="/" className="under-construction__back-button">
        Back to Home
      </Link>
      <p className="under-construction__note">Expected completion: June 2025</p>
    </div>
  );
};

export default Reports;