import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

// 🔌 Импортируем наши экраны из папки screens
import AuthScreen from './screens/AuthScreen';
import MainTabs from './screens/MainTabs';

const API_BASE_URL = 'https://my-gas-app-server.onrender.com';

export default function App() {
  const [screen, setScreen] = useState('auth'); // 'auth' или 'main'
  const [userId, setUserId] = useState(null);
  const [initialCoins, setInitialCoins] = useState(10);

  // Когда успешно вошли или зарегистрировались
  const handleLoginSuccess = (id, coins) => {
    setUserId(id);
    setInitialCoins(coins);
    setScreen('main');
  };

  return (
    <View style={styles.container}>
      {screen === 'auth' ? (
        <AuthScreen
          apiBaseUrl={API_BASE_URL}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <MainTabs
          apiBaseUrl={API_BASE_URL}
          userId={userId}
          initialCoins={initialCoins}
          onLogout={() => setScreen('auth')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' }
});
