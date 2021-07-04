import React, {useState, useEffect} from 'react';
import {AppNavigator} from './src/screens/navigation';
import {Loading} from './src/components/loading';
import {OnBoarding} from './src/components/intro/onBoarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from 'react-native-splash-screen';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [viewedOnboarding, setViewedOnboarding] = useState(false);

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem('@viewedOnboarding');

      if (value !== null) {
        setViewedOnboarding(true);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkOnboarding();
    SplashScreen.hide();
  }, []);
  return (
    <>
      {loading ? (
        <Loading />
      ) : viewedOnboarding ? (
        <AppNavigator />
      ) : (
        <OnBoarding />
      )}
    </>
  );
}
