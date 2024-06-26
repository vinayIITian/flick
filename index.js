import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerRootComponent } from 'expo';
import MainPage from './src/MainPage';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo Go app or in a native build,
// the environment is set up appropriately
registerRootComponent(MainPage);
AppRegistry.registerComponent(appName, () => App);
