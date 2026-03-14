// Функция для подключения любого мед. гаджета по Bluetooth
export const connectToMedicalDevice = async () => {
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: false,
    filters: [{ services: ['heart_rate', 'blood_pressure'] }] // Стандартные мед. протоколы
  });
  
  const server = await device.gatt.connect();
  // Теперь ваш сайт получает данные прямо с умных часов или тонометра!
  return server;
};