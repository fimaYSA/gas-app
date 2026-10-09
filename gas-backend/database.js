const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'gas.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) return console.error('Ошибка подключения к БД:', err.message);
  console.log('База данных gas.db успешно подключена');
});

// Запускаем последовательное создание таблиц
db.serialize(() => {
  // 1. Создаем таблицы, если их нет
  db.run(`CREATE TABLE IF NOT EXISTS schools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        city TEXT NOT NULL
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        school_id INTEGER,
        grade_number INTEGER,
        grade_letter TEXT,
        coins INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        FOREIGN KEY (school_id) REFERENCES schools(id)
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS poll_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_text TEXT NOT NULL,
        icon TEXT NOT NULL
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS poll_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        sender_id INTEGER,
        receiver_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES poll_questions(id),
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS trophies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_trophies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        trophy_id INTEGER,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (trophy_id) REFERENCES trophies(id)
    )`);

  console.log('--- Все таблицы успешно проверены/созданы ---');

  // 2. Сразу после создания таблиц проверяем, пустая ли база?
  db.get('SELECT id FROM schools LIMIT 1', [], (err, row) => {
    if (!row) {
      console.log('База данных пуста. Начинаем автоматическое заполнение стартовыми данными...');

      // Наполняем школы
      db.run("INSERT INTO schools (name, city) VALUES ('Гимназия №1', 'Минск')");
      db.run("INSERT INTO schools (name, city) VALUES ('Средняя школа №4', 'Минск')");
      db.run("INSERT INTO schools (name, city) VALUES ('Лицей №1501', 'Москва')");

      // Наполняем вопросы
      db.run("INSERT INTO poll_questions (question_text, icon) VALUES ('У кого из параллели самые стильные вещи и шмот?', '👑')");
      db.run("INSERT INTO poll_questions (question_text, icon) VALUES ('Кто станет знаменитым блогером через 5 лет?', '🎸')");
      db.run("INSERT INTO poll_questions (question_text, icon) VALUES ('Кто даст списать контрольную по математике?', '🧠')");
      db.run("INSERT INTO poll_questions (question_text, icon) VALUES ('С кем в классе никогда не бывает скучно?', '😂')");

      // Наполняем трофеи
      db.run("INSERT INTO trophies (title, description, icon) VALUES ('Первый шаг', 'Выдается за регистрацию', '🎉')");

      console.log('--- База данных успешно наполнена стартовыми данными! ---');
    } else {
      console.log('Данные в базе уже есть, автозаполнение не требуется.');
    }
  });
});

module.exports = db;
