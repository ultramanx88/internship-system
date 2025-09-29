'use client';

import { useState, useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'internship-flow-theme';
const DEFAULT_LOGO_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAbFBMVEX////7+/sAAAD8/PwFBQWCgoL29vbx8fGlpaXHx8fR0dGOjo7f39+2trbLy8uqqqpSUlKfn5/a2tpGRkaysrJxcXF6enpUVFQ/Pz+NjY1hYWEzMzNdXV0qKiopeXmAgIA4ODhNTU0SEhJJSUmenp4lJSWH2qB/AAADzElEQVR4nO2dW3eiQAyFYy2CIoiCovX9n3AHLREp3V5hT/N/ZqYv4BhmGeyrBAAAAAAAAAAAAAAAAAAAAAAAAADgP4lZju92e6TpdMus7dHc4xJPl2k6bV2368dxjA+kZdq2vGzbPslp7Mr02fD4zUvbxu22Lq//Zp+JbZ+JbV9+fR/A2ychXhN4l5h4w/kZfcz2zcx+p+dwX/e7+403xZ32Ycb3+0f38PcjP1u/51d66827Y3xtXN8fJp/f3M9s/Aac/8U8V+7V3vLz/Vn45e3T8f6t++v3o/35I2b67fC6D7P9h5n9zzk+o3i37x94g3h33b79G9/f/u3/xLe3H628tq6v323719v3r5s/f7a+eG/defu3/ev22f/Nflt/uN32z9+v7x5tXz329rHj9vbxzft7/brt+119/931w/fXb5//t2/fj74w3l2//Xb+dHv7uP2h9vbx7t/1x7v7/tW367fP/7fvy1s/3l7ePn37bOfW6/vX27813t3ePj7c3j4+3N7e/n4+3N6+9vfz6/1t/7x+9+v7s+2n7/vr9+/X++v3z9/f/v74/q8/f3/7+6v/y3f/+f3x9z+APz8//vvj1w8Af36//ft7/fqv//v+7T/85/3x+vP31x8Af/7z/ev3x1+9/oD/+/r99ffXR+8f4P/3e/vvj1//7//19/eP3r9+/378/P31/tW3/wT/9/7Vf/77v/5v/5k/ff86e589e5k9s2fzzJ6hM3qGztAZOkNn6AydoTN0hs7QGTopT+zN4F0t413t6t3tW5s7zL2zd2/e3f/d5V1r7/7c5e27i7s3997d+7m7/3v3/p3d+7e7d9/e3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/69u/dvd+/d3X9n9/6D/3D3+g2u/wPd6za7d5+d/s2z9+v7d7c3n729+e7t39ndd+4u39/c3L07vH1r9+7z7t37ubv/e/f+nd37d3bvvbv7z+79e3fvv7t79+7+O7v37929/+/u3bv77+ze33d3//fu3b37b3bvv7t7/+7d/ffuvbv3f7t7/+7d/Xf3/p3d+3d2797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/r279293797df2f3/j+2PqR7Z/M7M9sAAAAAAAAAAAAAAAAAAAAAADgT/gPX5pYyRAdl50AAAAASUVORK5CYII=';

export function useAppTheme() {
  const [logo, setLogo] = useState<string | null>(DEFAULT_LOGO_URL);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    try {
      const themeItem = localStorage.getItem(THEME_STORAGE_KEY);
      if (themeItem) {
        const parsedTheme: AppTheme = JSON.parse(themeItem);
        if (parsedTheme.logo) {
          setLogo(parsedTheme.logo);
        }
      }
    } catch (error) {
      console.error('Failed to parse theme from localStorage', error);
      localStorage.removeItem(THEME_STORAGE_KEY);
    } finally {
        if(logo){
            updateFavicon(logo);
        }
      setIsThemeLoading(false);
    }
  }, [logo]);

  const updateFavicon = (logoUrl: string) => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) {
      favicon.href = logoUrl;
    } else {
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = logoUrl;
      document.head.appendChild(newFavicon);
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setLogo(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const saveTheme = useCallback(() => {
    try {
        const themeToStore: AppTheme = { logo };
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeToStore));
        if (logo) {
            updateFavicon(logo);
        }
        alert('บันทึกธีมเรียบร้อยแล้ว');
    } catch (error) {
        console.error('Failed to save theme to localStorage', error);
        alert('เกิดข้อผิดพลาดในการบันทึกธีม');
    }
  }, [logo]);


  return { logo, isThemeLoading, handleLogoChange, saveTheme };
}

type AppTheme = {
  logo: string | null;
};
