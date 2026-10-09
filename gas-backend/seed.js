const db = require('./database');

db.serialize(() => {
  console.log('Начинаем заполнение базы данных...');

  // 1. Очищаем таблицы перед заполнением
  db.run(`DELETE FROM schools`);
  db.run(`DELETE FROM poll_questions`);
  db.run(`DELETE FROM trophies`);

  // 2. Добавляем тестовые школы
  const insertSchool = db.prepare(`INSERT INTO schools (name, city) VALUES (?, ?)`);
  insertSchool.run('Гимназия №1', 'Минск');
  insertSchool.run('Средняя школа №4', 'Минск');
  insertSchool.run('Лицей №1501', 'Москва');
  insertSchool.run('Школа №2048', 'Москва');
  insertSchool.finalize(); // Исправлено: вместо .end() используем .finalize()

  // 3. Добавляем стартовый пак крутых и добрых вопросов для школьников
  const insertQuestion = db.prepare(`INSERT INTO poll_questions (question_text, icon) VALUES (?, ?)`);
  insertQuestion.run('У кого из параллели самые стильные вещи и шмот?', '👑');
  insertQuestion.run('Кто станет знаменитым блогером или рок-звездой через 5 лет?', '🎸');
  insertQuestion.run('Кто даст списать контрольную по математике и спасет в последний момент?', '🧠');
  insertQuestion.run('С кем в классе никогда не бывает скучно на уроках?', '😂');
  insertQuestion.run('С кем бы ты тайно хотел пойти в кино на этой неделе?', '💔');
  insertQuestion.run('Кто защитит тебя, если начнется зомби-апокалипсис в школе?', '🛡️');
  insertQuestion.run('С кем приятнее всего пить чай в школьной столовой?', '☕');
  insertQuestion.run('Чья улыбка может поднять настроение даже в серый понедельник?', '☀️');
  insertQuestion.finalize(); // Исправлено

  // 4. Добавляем каталог трофеев (ачивок)
  const insertTrophy = db.prepare(`INSERT INTO trophies (title, description, icon) VALUES (?, ?, ?)`);
  insertTrophy.run('Первый шаг', 'Выдается за успешную регистрацию в приложении', '🎉');
  insertTrophy.run('Гроза школы', 'Получить 100 голосов («пламён») от учеников', '⚡');
  insertTrophy.run('Тайный обожатель', 'Проголосовать в опросах за одноклассников 50 раз', '🕵️');
  insertTrophy.run('Ночная сова', 'Проголосовать в приложении позднее 23:00', '🦉');
  insertTrophy.finalize(); // Исправлено

  console.log('--- База данных успешно наполнена стартовыми данными! ---');

  // Закрываем соединение после выполнения всех действий
  db.close();
});
