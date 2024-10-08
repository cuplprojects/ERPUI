/**
 * Created by Shivom on 08/10/24
 * Purpose: Configure i18next for internationalization with backend integration
 * and custom parsing for text labels with optional ID display.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import useShowLabelIdStore from './store/showLabelIdStore';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    lng: 'en', // default language
    fallbackLng: 'en',
    backend: {
      loadPath: `${apiUrl}/TextLabels/translations/{{lng}}`,
      parse: (data) => {
        const parsedData = JSON.parse(data);
        const simplifiedData = {};
        const showLabelId = useShowLabelIdStore.getState().showLabelId;
        for (const [key, value] of Object.entries(parsedData)) {
          if (typeof value === 'object' && value !== null) {
            simplifiedData[key] = showLabelId ? `(${value.id}). ${value.text}` : value.text;
          } else {
            simplifiedData[key] = value;
          }
        }
        return simplifiedData;
      },
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    parseMissingKeyHandler: (key, defaultValue) => {
      const showLabelId = useShowLabelIdStore.getState().showLabelId;
      if (typeof defaultValue === 'object' && defaultValue !== null) {
        return showLabelId ? `${defaultValue.id}. ${defaultValue.text || key}` : (defaultValue.text || key);
      }
      return defaultValue || key;
    },
  });

export default i18n;