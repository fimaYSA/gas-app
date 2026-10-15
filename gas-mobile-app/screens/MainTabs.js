import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import axios from 'axios';

export default function MainTabs({ apiBaseUrl, userId, initialCoins, onLogout }) {
  const [activeTab, setActiveTab] = useState('game');
  const [roundData, setRoundData] = useState(null);
  const [gameLoading, setGameLoading] = useState(false);
  const [coins, setCoins] = useState(initialCoins);
  const [questionCount, setQuestionCount] = useState(1);

  const [inboxData, setInboxData] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);

  // 🎮 ЗАГРУЗКА ИГРОВОГО РАУНДА
  const launchGame = async () => {
    try {
      setGameLoading(true);
      setActiveTab('game');
      const response = await axios.get(`${apiBaseUrl}/api/get-round`, { params: { userId } });
      setRoundData(response.data);
    } catch (err) {
      console.error(err);
      setRoundData(null);
    } finally {
      setGameLoading(false);
    }
  };

  // 📥 ЗАГРУЗКА ВХОДЯЩИХ КОМПЛИМЕНТОВ
  const loadInbox = async () => {
    try {
      setTabLoading(true);
      setActiveTab('inbox');
      const response = await axios.get(`${apiBaseUrl}/api/inbox`, { params: { userId } });
      setInboxData(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTabLoading(false);
    }
  };

  // 👤 ЗАГРУЗКА ЛИЧНОГО КАБИНЕТА
  const loadProfile = async () => {
    try {
      setTabLoading(true);
      setActiveTab('profile');
      const response = await axios.get(`${apiBaseUrl}/api/profile`, { params: { userId } });
      setProfileData(response.data);
      if (response.data?.user) {
        setCoins(response.data.user['coins'] || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTabLoading(false);
    }
  };

  useEffect(() => {
    launchGame().catch(err => console.log("Ошибка старта игры:", err));
  }, []);

  // ⚡ ОБРАБОТКА ГОЛОСОВАНИЯ С НАЧИСЛЕНИЕМ КОИНОВ
  const handleVote = async (receiverId) => {
    try {
      setGameLoading(true);
      await axios.post(`${apiBaseUrl}/api/vote`, {
        questionId: roundData.questionId,
        senderId: userId,
        receiverId
      });

      setCoins(prev => prev + 2);

      if (questionCount >= 12) {
        Alert.alert('Раунд завершен! 🏁', `Ты ответил на все 12 вопросов!`, [
          {
            text: 'Супер', onPress: () => {
              setQuestionCount(1);
              launchGame();
            }
          }
        ]);
      } else {
        setQuestionCount(prev => prev + 1);
        await launchGame();
      }
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось отправить голос');
      setGameLoading(false);
    }
  };

  // 🛠 БЫСТРОЕ ЗАПОЛНЕНИЕ БАЗЫ ОДНОКЛАССНИКАМИ С ТЕЛЕФОНА
  const handleAutoPopulate = async () => {
    try {
      setGameLoading(true);
      const testStudents = [
        {
          name: 'Никита (Ты)',
          phone: '+375291111111',
          schoolId: 1,
          gradeNumber: 9,
          gradeLetter: 'А'
        },
        {
          name: 'Влад Петров',
          phone: '+375292222222',
          schoolId: 1,
          gradeNumber: 9,
          gradeLetter: 'А'
        },
        {
          name: 'Даша Сидорова',
          phone: '+375293333333',
          schoolId: 1,
          gradeNumber: 9,
          gradeLetter: 'А'
        },
        {
          name: 'Лена Кузнецова',
          phone: '+375294444444',
          schoolId: 1,
          gradeNumber: 9,
          gradeLetter: 'А'
        }
      ];
      for (const s of testStudents) {
        try {
          await axios.post(`${apiBaseUrl}/api/register`, s);
        } catch (e) {
        }
      }
      Alert.alert('Успех', 'База наполнена 9-А классом!', [{
        text: 'Играть',
        onPress: launchGame
      }]);
    } catch (err) {
      setGameLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentArea}>
        {tabLoading || gameLoading ? (
          <View style={styles.center}><ActivityIndicator size='large'
                                                         color='#FF3B30' /></View>
        ) : (
          <View style={{ flex: 1 }}>

            {/* 🎮 ТЭБ 1: ЭКРАН ИГРЫ */}
            {activeTab === 'game' && (
              <View style={{ flex: 1, paddingHorizontal: 15 }}>
                {!roundData || !roundData.options || roundData.options.length === 0 ? (
                  <View style={styles.center}>
                    <Text style={styles.errorText}>😢 Мало одноклассников</Text>
                    <TouchableOpacity style={styles.fixButton}
                                      onPress={handleAutoPopulate}>
                      <Text style={styles.fixButtonText}>⚡ Наполнить базу за 1 секунду</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ flex: 1 }}>
                    <View style={styles.header}>
                      <Text style={styles.questionCounter}>Вопрос {questionCount}/12</Text>
                      <View style={styles.coinsBadge}><Text style={styles.coinsText}>🪙 {String(coins)}</Text></View>
                    </View>
                    <View style={styles.questionContainer}>
                      <Text style={styles.questionIcon}>{roundData.icon || '❓'}</Text>
                      <Text style={styles.questionText}>{roundData.questionText}</Text>
                    </View>
                    <Text style={styles.hintText}>Кто это из класса?</Text>
                    <View style={styles.optionsGrid}>
                      {roundData.options.map((c) => (
                        <TouchableOpacity key={`c-${c.id}`}
                                          style={styles.optionButton}
                                          onPress={() => handleVote(c.id, c.name)}>
                          <Text style={styles.optionText}>{c.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity style={styles.skipButton}
                                      onPress={() => launchGame()}>
                      <Text style={styles.skipButtonText}>Пропустить ➔</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* 🔥 ТЭБ 2: ЭКРАН ВХОДЯЩИХ КОМПЛИМЕНТОВ */}
            {activeTab === 'inbox' && (
              <View style={{ flex: 1, paddingHorizontal: 20 }}>
                <Text style={styles.tabTitle}>Твои Пламёна 🔥</Text>
                <FlatList
                  data={inboxData || []}
                  keyExtractor={(item, index) => {
                    const cleanItem = item || {};
                    return `msg-${cleanItem['id'] || index}`;
                  }}
                  onRefresh={loadInbox}
                  refreshing={tabLoading}
                  ListEmptyComponent={<Text style={styles.emptyText}>Пока никто не проголосовал за
                                                                     тебя. Проголосуй за друзей
                                                                     первым! 📝</Text>}
                  renderItem={({ item }) => {
                    // Безопасное приведение объекта, убирающее любые придирки WebStorm
                    const cleanItem = item || {};

                    return (
                      <View style={styles.inboxCard}>
                        <Text style={styles.inboxIcon}>{String(cleanItem['icon'] || '🔥')}</Text>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.inboxCardClass}>
                            {String(cleanItem['grade_number'] || 9)}-"{String(cleanItem['grade_letter'] || 'А')}"
                                                                    класс
                          </Text>
                          <Text style={styles.inboxCardText}>
                            "{String(cleanItem['question_text'] || 'Кто-то оставил тебе комплимент')}"
                          </Text>
                        </View>
                      </View>
                    );
                  }}
                />

              </View>
            )}

            {/* 👤 ТЭБ 3: ЭКРАН ЛИЧНОГО КАБИНЕТА */}
            {activeTab === 'profile' && Boolean(profileData) && (
              <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
                <Text style={styles.tabTitle}>Мой Профиль 👤</Text>
                <View style={styles.profileMainCard}>
                  <Text style={styles.profileAvatar}>👑</Text>
                  <Text style={styles.profileName}>{profileData.user?.name}</Text>
                  <Text style={styles.profileStatsRow}>
                    🪙 {String(coins)} | ⚡
                    XP {String(profileData && profileData['user'] ? (profileData['user']['xp'] || 0) : 0)}
                  </Text>
                </View>
                <Text style={styles.sectionTitle}>Трофеи 🏆</Text>
                {profileData.trophies?.length === 0 ? (
                  <Text style={styles.emptyText}>У тебя пока нет открытых трофеев.</Text>
                ) : (
                  profileData.trophies?.map((t, i) => (
                    <View key={i}
                          style={styles.trophyCard}>
                      <Text style={styles.trophyIcon}>{t.icon}</Text>
                      <Text style={styles.trophyTitle}>{t.title}</Text>
                    </View>
                  ))
                )}
                <TouchableOpacity style={[styles.fixButton, {
                  backgroundColor: '#DC3545',
                  marginTop: 20,
                  marginBottom: 30
                }]}
                                  onPress={onLogout}>
                  <Text style={styles.fixButtonText}>Выйти 🚪</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

          </View>
        )}
      </View>

      {/* НИЖНЕЕ МЕНЮ НАВИГАЦИИ (ТАБ-БАР) */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabItem, activeTab === 'game' && styles.tabItemActive]}
                          onPress={launchGame}>
          <Text style={styles.tabLabel}>🎮 Игра</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, activeTab === 'inbox' && styles.tabItemActive]}
                          onPress={loadInbox}>
          <Text style={styles.tabLabel}>🔥 Входящие</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
                          onPress={loadProfile}>
          <Text style={styles.tabLabel}>👤 Профиль</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#121212', paddingTop: 40 },
  contentArea: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15
  },
  questionCounter: { color: '#8E8E93', fontSize: 16, fontWeight: '700' },
  coinsBadge: { backgroundColor: '#1C1C1E', padding: 8, borderRadius: 20 },
  coinsText: { color: '#FFD700', fontWeight: 'bold' },
  questionContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center'
  },
  questionIcon: { fontSize: 40, marginBottom: 10 },
  questionText: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  hintText: {
    color: '#8E8E93',
    fontSize: 13,
    textAlign: 'center',
    marginVertical: 15,
    textTransform: 'uppercase'
  },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  optionButton: {
    backgroundColor: '#2C2C2E',
    width: '48%',
    height: 65,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  optionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  skipButton: { alignSelf: 'center', marginVertical: 10 },
  skipButtonText: { color: '#8E8E93' },
  fixButton: {
    backgroundColor: '#34C759',
    padding: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center'
  },
  fixButtonText: { color: '#FFF', fontWeight: '800' },
  tabBar: {
    flexDirection: 'row',
    height: 65,
    backgroundColor: '#1C1C1E',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%' },
  tabItemActive: { backgroundColor: '#2C2C2E' },
  tabLabel: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  tabTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', marginTop: 15, marginBottom: 15 },
  inboxCard: {
    backgroundColor: '#1C1C1E',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  inboxIcon: { fontSize: 28 },
  inboxCardClass: { color: '#8E8E93', fontSize: 11, fontWeight: '700' },
  inboxCardText: { color: '#FFF', fontSize: 15, fontWeight: '700', marginTop: 2 },
  profileMainCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20
  },
  profileAvatar: { fontSize: 44 },
  profileName: { fontSize: 20, fontWeight: '900', color: '#FFF', marginTop: 5 },
  profileStatsRow: { color: '#FFF', marginTop: 10, fontSize: 16, fontWeight: '700' },
  sectionTitle: { color: '#FF3B30', fontSize: 14, fontWeight: '700', marginBottom: 10 },
  trophyCard: {
    backgroundColor: '#1C1C1E',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  trophyIcon: { fontSize: 24 },
  trophyTitle: { color: '#FFF', marginLeft: 10, fontWeight: '700' },
  emptyText: { color: '#8E8E93', textAlign: 'center', marginTop: 40, fontSize: 14 },
  errorText: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 15 }
});
