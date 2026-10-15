import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import axios from 'axios';

export default function AuthScreen({ apiBaseUrl, onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [gradeNumber, setGradeNumber] = useState('');
  const [gradeLetter, setGradeLetter] = useState('');

  const handleLogin = async () => {
    if (!phone) {
      Alert.alert('Внимание', 'Введите номер телефона!');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`${apiBaseUrl}/api/users`);
      if (response.data && Array.isArray(response.data)) {
        const foundUser = response.data.find(u => u.phone && u.phone.trim() === phone.trim());
        if (foundUser) {
          Alert.alert('С возвращением! 👋', `Привет, ${foundUser.name}!`, [
            { text: 'В игру! ➔', onPress: () => onLoginSuccess(foundUser.id, foundUser['coins'] || 10) }
          ]);
          return;
        }
      }
      Alert.alert('Профиль не найден', 'Переключаем в режим регистрации.', [
        { text: 'ОК', onPress: () => setIsLoginMode(false) }
      ]);
    } catch (err) {
      setIsLoginMode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !phone || !schoolId || !gradeNumber || !gradeLetter) {
      Alert.alert('Внимание', 'Заполните все поля!');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        schoolId: Number(schoolId),
        gradeNumber: Number(gradeNumber),
        gradeLetter: gradeLetter.toUpperCase().trim()
      };
      const response = await axios.post(`${apiBaseUrl}/api/register`, payload);
      if (response.data && response.data.success) {
        Alert.alert('Ура! 🎉', 'Регистрация успешна!', [
          { text: 'Играть ➔', onPress: () => onLoginSuccess(response.data.userId, 10) }
        ]);
      }
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось зарегистрироваться');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FF3B30" /></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.emojiLogo}>🔥 slime / guess</Text>
        <Text style={styles.title}>{isLoginMode ? 'Вход в аккаунт' : 'Создай профиль'}</Text>
        <Text style={styles.subtitle}>
          {isLoginMode ? 'Введи свой телефон, чтобы продолжить играть' : 'Узнай, кто тайно голосует за тебя в школе!'}
        </Text>

        <Text style={styles.label}>Номер телефона</Text>
        <TextInput style={styles.input} placeholder="Например: +37529XXXXXXX" placeholderTextColor="#555" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

        {!isLoginMode && (
          <View style={{ width: '100%' }}>
            <Text style={styles.label}>Твое Имя и Фамилия</Text>
            <TextInput style={styles.input} placeholder="Например: Никита Иванов" placeholderTextColor="#555" value={name} onChangeText={setName} />

            <Text style={styles.label}>ID твоей школы (цифра от 1 до 4)</Text>
            <TextInput style={styles.input} placeholder="1 — Гимназия №1, 2 — СШ №4, 3 — Лицей 1501" placeholderTextColor="#555" keyboardType="number-pad" value={schoolId} onChangeText={setSchoolId} />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Класс (цифра)</Text>
                <TextInput style={styles.input} placeholder="Например: 9" placeholderTextColor="#555" keyboardType="number-pad" value={gradeNumber} onChangeText={setGradeNumber} />
              </View>
              <View style={[styles.flex1, { marginLeft: 12 }]}>
                <Text style={styles.label}>Буква</Text>
                <TextInput style={styles.input} placeholder="Например: А" placeholderTextColor="#555" maxLength={2} value={gradeLetter} onChangeText={setGradeLetter} />
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.mainButton} onPress={isLoginMode ? handleLogin : handleRegister}>
          <Text style={styles.mainButtonText}>{isLoginMode ? 'Войти в игру ➔' : 'Зарегистрироваться 🚀'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchModeButton} onPress={() => setIsLoginMode(!isLoginMode)}>
          <Text style={styles.switchModeText}>
            {isLoginMode ? 'Новый пользователь? Создать профиль ✨' : 'Уже есть аккаунт? Войти по телефону 👤'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 40 },
  scrollContainer: { padding: 24, paddingTop: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  emojiLogo: { fontSize: 24, textAlign: 'center', marginBottom: 5 },
  title: { fontSize: 26, fontWeight: '900', textAlign: 'center', color: '#FFFFFF', marginBottom: 4 },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#8E8E93', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '700', color: '#E5E5EA', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: '#1C1C1E', padding: 14, borderRadius: 12, fontSize: 16, color: '#FFFFFF', borderWidth: 1, borderColor: '#2C2C2E', marginBottom: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  flex1: { flex: 1 },
  mainButton: { backgroundColor: '#FF3B30', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 25 },
  mainButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  switchModeButton: { marginTop: 20, alignItems: 'center', padding: 10 },
  switchModeText: { color: '#8E8E93', fontSize: 14, fontWeight: '600' }
});
