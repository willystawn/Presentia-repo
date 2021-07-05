import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}

const firebaseConfig = {
  apiKey: 'AIzaSyB-QgRCpeIuu8yW5mbjOu-eP1kStiZSNGo',
  authDomain: 'presentia-ca8ff.firebaseapp.com',
  projectId: 'presentia-ca8ff',
  storageBucket: 'presentia-ca8ff.appspot.com',
  messagingSenderId: '751141696653',
  appId: '1:751141696653:web:f03b3e430b929b26025ec4',
  measurementId: 'G-DGLE98332P',
};

const init = async () => {
  firebase.initializeApp(firebaseConfig);
  await requestUserPermission();
};

init();

export default firebase;
