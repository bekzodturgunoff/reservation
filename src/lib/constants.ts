export const UZBEKISTAN_REGIONS: Record<string, string[]> = {
  'Andijan Region': ['Andijan', 'Asaka', 'Xonobod', 'Shahrixon', 'Baliqchi', 'Buloqboshi', 'Jalaquduq', 'Paxtaobod', "Qo'rg'ontepa", 'Marhamat', "Xo'jaobod"],
  'Bukhara Region': ['Bukhara', 'Buxoro', 'Kogon', "G'ijduvon", 'Karakul', 'Romitan', 'Vobkent', 'Jondor', 'Peshku', 'Shofirkon'],
  'Fergana Region': ["Farg'ona", 'Fergana', "Marg'ilon", 'Kokand', 'Quvasoy', 'Rishton', 'Beshariq', "Bog'dod", "Dang'ara", 'Furqat', 'Oltiariq', "Qo'shtepa", "So'x", 'Toshloq', "Uchko'prik", 'Yozyovon'],
  'Jizzakh Region': ['Jizzakh', 'Jizzax', "Do'stlik", 'Gagarin', 'Paxtakor', 'Baxmal', 'Zafarobod', 'Zarbdor', 'Zomin', "Mirzacho'l", 'Forish', 'Arnasoy'],
  'Khorazm Region': ['Urganch', 'Xiva', "Bog'ot", 'Gurlan', "Qo'shko'pir", 'Shovot', 'Yangibozor', 'Yangiariq', 'Hazorasp', 'Pitnak'],
  'Namangan Region': ['Namangan', 'Pop', 'Chust', 'Mingbuloq', 'Kosonsoy', "Uchqo'rg'on", "To'raqo'rg'on", 'Chortoq', 'Norin'],
  'Navoiy Region': ['Navoiy', 'Zarafshon', 'Uchquduq', 'Karmana', 'Qiziltepa', 'Nurota', 'Xatirchi', 'Tomdi'],
  'Qashqadaryo Region': ['Qarshi', 'Shahrisabz', 'Kitob', "Yakkabog'", "G'uzor", 'Nishon', 'Muborak', 'Koson', 'Chiroqchi', 'Dehqonobod', 'Mirishkor', 'Qamashi'],
  'Samarqand Region': ['Samarkand', 'Samarqand', "Kattaqo'rg'on", 'Urgut', 'Oqtosh', 'Narpay', 'Payariq', 'Jomboy', 'Ishtixon', 'Paxtachi', 'Qushrabot', 'Nurabod', 'Tayloq'],
  'Sirdaryo Region': ['Guliston', 'Boyovut', 'Sardoba', 'Mirzaobod', 'Oqoltin', 'Sayxunobod', 'Xovos', 'Yangiyer'],
  'Surxondaryo Region': ['Termiz', 'Denov', 'Boysun', 'Sherobod', 'Muzrabot', 'Angor', 'Oltinsoy', 'Sariosiyo', "Jarqo'rg'on", "Qumqo'rg'on", "Sho'rchi", 'Bandixon'],
  'Tashkent Region': ['Tashkent', 'Nurafshon', 'Olmaliq', 'Angren', 'Bekobod', 'Chirchiq', "Bo'ka", "Yangiyo'l", 'Ohangaron', 'Parkent', "Oqqo'rg'on", 'Qibray', "Bo'stonliq", 'Zangiota'],
} as const

export const ALL_UZBEKISTAN_CITIES = Object.values(UZBEKISTAN_REGIONS).flat()
