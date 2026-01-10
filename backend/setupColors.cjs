// backend/setupColors.cjs
const mongoose = require('mongoose');
require('dotenv').config();

async function setupColors() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Подключено к базе');

    // Получаем модель барбера
    const Barber = mongoose.model('Barber', new mongoose.Schema({
      name: String,
      color: String
    }));

    // Цвета для барберов
    const colors = {
      "Сурен": "#FF9800",
      "Ануш": "#4CAF50", 
      "Кристіна": "#2196F3"
    };

    // Обновляем цвета
    for (const [name, color] of Object.entries(colors)) {
      const result = await Barber.updateOne(
        { name },
        { $set: { color } }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✅ ${name}: ${color}`);
      } else {
        console.log(`⚠️  ${name}: не найден в базе`);
      }
    }

    console.log('\n🎨 Готово!');
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Ошибка:', err.message);
    process.exit(1);
  }
}

setupColors();