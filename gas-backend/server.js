const express = require('express');
const db = require('./database'); // Подключаем наш измененный database.js
const app = express();
const PORT = 3000;

// Разрешаем серверу читать данные в формате JSON от мобильного приложения
app.use(express.json());

// ==========================================
// 1. МАРШРУТ: ПОЛУЧИТЬ СПИСОК ШКОЛ ДЛЯ ЭКРАНА РЕГИСТРАЦИИ
// ==========================================
app.get('/api/schools', (req, res) => {
  db.all('SELECT * FROM schools', [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Ошибка базы данных" });
    res.json(rows);
  });
});

// ==========================================
// 2. МАРШРУТ: РЕГИСТРАЦИЯ НОВОГО ШКОЛЬНИКА
// ==========================================
app.post('/api/register', (req, res) => {
  const { name, phone, schoolId, gradeNumber, gradeLetter } = req.body;

  if (!name || !phone || !schoolId || !gradeNumber || !gradeLetter) {
    return res.status(400).json({ error: "Заполните все поля!" });
  }

  // Проверяем, нет ли уже такого номера телефона
  db.get('SELECT id FROM users WHERE phone = ?', [phone], (err, row) => {
    if (err) return res.status(500).json({ error: "Ошибка при проверке телефона" });
    if (row) return res.status(400).json({ error: "Этот номер телефона уже зарегистрирован!" });

    // Если телефон свободен, сохраняем ученика. Даем 10 стартовых коинов.
    const insertUserSql = `
            INSERT INTO users (name, phone, school_id, grade_number, grade_letter, coins, xp) 
            VALUES (?, ?, ?, ?, ?, 10, 0)
        `;

    db.run(insertUserSql, [name, phone, schoolId, gradeNumber, gradeLetter], function(err) {
      if (err) return res.status(500).json({ error: "Не удалось создать профиль" });

      const newUserId = this.lastID;

      // Сразу автоматически выдаем первый трофей "Первый шаг" (у него ID = 1)
      db.run('INSERT INTO user_trophies (user_id, trophy_id) VALUES (?, 1)', [newUserId], (err) => {
        if (err) console.error("Ошибка выдачи стартового трофея:", err.message);

        res.status(201).json({
          success: true,
          message: "Регистрация завершена успешно!",
          userId: newUserId
        });
      });
    });
  });
});

// ==========================================
// 3. МАРШРУТ: ПОЛУЧИТЬ РАУНД ИГРЫ (ВОПРОС + 4 ОДНОКЛАССНИКА)
// ==========================================
app.get('/api/get-round', (req, res) => {
  const { userId } = req.query; // Получаем ID школьника, который сейчас играет

  if (!userId) return res.status(400).json({ error: "Не указан userId" });

  // 1. Узнаем, в какой школе и классе учится этот школьник
  db.get('SELECT school_id, grade_number FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user) return res.status(400).json({ error: "Пользователь не найден" });

    // 2. Выбираем один случайный вопрос из базы
    db.get('SELECT * FROM poll_questions ORDER BY RANDOM() LIMIT 1', [], (err, question) => {
      if (err || !question) return res.status(500).json({ error: "Не удалось загрузить вопрос" });

      // 3. Выбираем случайных ребят из той же школы и параллели (исключая самого игрока)
      // В реальной жизни ставим LIMIT 4, для нашего теста поставим LIMIT 4 (выведет сколько есть)
      const classmatesSql = `
                SELECT id, name FROM users 
                WHERE school_id = ? AND grade_number = ? AND id != ? 
                ORDER BY RANDOM() LIMIT 4
            `;

      db.all(classmatesSql, [user.school_id, user.grade_number, userId], (err, classmates) => {
        if (err) return res.status(500).json({ error: "Ошибка поиска одноклассников" });

        // Возвращаем собранный раунд игры на мобилку
        res.json({
          questionId: question.id,
          questionText: question.question_text,
          icon: question.icon,
          options: classmates // Список ребят для кнопок
        });
      });
    });
  });
});

// ==========================================
// 4. МАРШРУТ:ОТПРАВИТЬ ГОЛОС
// ==========================================
app.post('/api/vote', (req, res) => {
  const { questionId, senderId, receiverId } = req.body;

  if (!questionId || !senderId || !receiverId) {
    return res.status(400).json({ error: "Неполные данные голосования" });
  }

  // Записываем голос в журнал результатов
  db.run(
    'INSERT INTO poll_results (question_id, sender_id, receiver_id) VALUES (?, ?, ?)',
    [questionId, senderId, receiverId],
    function(err) {
      if (err) return res.status(500).json({ error: "Ошибка сохранения голоса" });

      // Начисляем проголосовавшему игроку +2 коина и +10 XP за активность
      db.run('UPDATE users SET coins = coins + 2, xp = xp + 10 WHERE id = ?', [senderId], (err) => {
        res.json({
          success: true,
          message: "Голос учтен! Вы получили +2 коина и +10 XP"
        });
      });
    }
  );
});

// Запускаем сервер на порту 3000
app.listen(PORT, () => {
  console.log(`=== СЕРВЕР АНАЛОГА GAS УСПЕШНО ЗАПУЩЕН ===`);
  console.log(`Локальный адрес для тестов: http://localhost:${PORT}`);
});
