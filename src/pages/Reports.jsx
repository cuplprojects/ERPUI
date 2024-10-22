import React from 'react'
import { useStore } from 'zustand';
import themeStore from './../store/themeStore';

const Reports = () => {

  const { getCssClasses } = useStore(themeStore);
  const [
    customDark,
    customMid,
    customLight,
    ,
    customDarkText,
    customLightText,
    customLightBorder,
    customDarkBorder
  ] = getCssClasses();

  return (
    <div className={`${customDark === 'dark-dark' ? 'text-white' : customDarkText}`}>
      This is the reports page.
    </div>
  )
}

export default Reports
