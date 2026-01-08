export const sendSMS = async (phone, time) => {
  const message = `✂️ house_barbershop_nmsk
Нагадуємо: ви записані на стрижку завтра о ${time}. Чекаємо на вас!`;

  // ТУТ буде реальний SMS провайдер (поки заглушка)
  console.log("SMS TO:", phone);
  console.log("TEXT:", message);
};
