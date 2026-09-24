const SMART_DNS_I18N = {
  en: {
    heroTitle:"DNS that chooses the route",
    heroText:"TOLF compares regional DNS paths and applies special routing only when repeated measurements show a stable advantage.",
    myDns:"My Smart DNS",
    myDnsText:"Set up devices that should use your personal encrypted TOLF DNS endpoint.",
    setupDevice:"Set up Smart DNS on a device",
    deviceName:"Device name",
    create:"Create",
    addresses:"Returned addresses", dnsTime:"DNS response time", resolver:"Resolver", protocol:"Protocol", node:"TOLF node", availability:"Result",
    domainCheckTitle:"Domain check",
    domainCheckText:"See the DNS answer TOLF Smart DNS currently uses for this domain.",
    domain:"Domain",
    checkRoute:"Check domain",
    currentRoute:"Current route",
    status:"Status",
    details:"Details",
    policyRoute:"Policy route",
    policy:"Policy",
    analysis:"Analysis",
    measurements:"Latest measurements",
    footnote:"Smart DNS decisions are based on repeated measurements, not on a single lookup.",
    standardTitle:"Standard DNS route is being used",
    standardText:"TOLF has no special routing rule for this domain. It is using the normal DNS path.",
    measuredTitle:"TOLF is using a measured route",
    measuredText:"Repeated measurements produced a special routing rule for this domain.",
    fallbackTitle:"Backup resolver used",
    fallbackText:"{resolver} answered because {preferred} was unavailable.",
    normal:"Successful", fallback:"Fallback in use", unavailable:"Unavailable", unknown:"Availability unknown",
    defaultPolicy:"No special rule is needed for this domain.", exactRule:"A dedicated rule is active for this domain.", suffixRule:"A regional rule is active for this domain group.",
    noChange:"no routing change recommended", recommendation:"recommendation", samples:"samples", advantage:"measured advantage",
    routeLocal:"Main TOLF DNS", routeRussia:"Russian regional DNS", routeGlobal:"Global DNS route", resolverQuad9:"Quad9", resolverYandex:"Yandex DNS", resolverQuad9Ecs:"Quad9 ECS", noAddress:"No address", enterDomain:"Enter a domain name.", checking:"Checking…", checkFailed:"Unable to check this domain.",
    noDevices:"No Smart DNS devices yet.", device:"Device", active:"Active", revoked:"Revoked", revoke:"Revoke",
    revokeFailed:"Unable to revoke device.", loadDevicesFailed:"Unable to load devices.", enterDevice:"Enter a device name.",
    created:"Device created. Save the setup information below.", privateEndpoint:"This personal DoH address contains your credential. Keep it private.",
    installProfile:"Install iOS / iPadOS profile", createFailed:"Unable to create device."
  },
  ru: {
    heroTitle:"DNS, которая выбирает маршрут",
    heroText:"TOLF сравнивает региональные DNS-маршруты и применяет специальный маршрут только при устойчивом преимуществе по повторным измерениям.",
    myDns:"Мой Smart DNS",
    myDnsText:"Настройте устройства, которые будут использовать ваш персональный зашифрованный DNS TOLF.",
    setupDevice:"Настроить Smart DNS на устройстве",
    deviceName:"Название устройства",
    create:"Создать",
    addresses:"Полученные адреса", dnsTime:"Время DNS-ответа", resolver:"Резолвер", protocol:"Протокол", node:"Узел TOLF", availability:"Результат",
    domainCheckTitle:"Проверка домена",
    domainCheckText:"Показывает DNS-ответ, который TOLF Smart DNS сейчас использует для этого домена.",
    domain:"Домен",
    checkRoute:"Проверить домен",
    currentRoute:"Текущий маршрут",
    status:"Состояние",
    details:"Подробности",
    policyRoute:"Маршрут политики",
    policy:"Правило",
    analysis:"Анализ",
    measurements:"Последние измерения",
    footnote:"Решения Smart DNS основаны на повторных измерениях, а не на одном запросе.",
    standardTitle:"Используется стандартный DNS-маршрут",
    standardText:"Для этого домена TOLF не применяет специальное правило. Используется обычный DNS-маршрут.",
    measuredTitle:"TOLF использует маршрут, выбранный по измерениям",
    measuredText:"Повторные измерения сформировали специальное правило маршрутизации для этого домена.",
    fallbackTitle:"Использован резервный резолвер",
    fallbackText:"Ответ получен через {resolver}, поскольку {preferred} был недоступен.",
    normal:"Успешно", fallback:"Используется резервный DNS", unavailable:"Недоступен", unknown:"Доступность неизвестна",
    defaultPolicy:"Для этого домена специальное правило не требуется.", exactRule:"Для этого домена действует отдельное правило.", suffixRule:"Для этой группы доменов действует региональное правило.",
    noChange:"изменение маршрута не рекомендуется", recommendation:"рекомендация", samples:"измерений", advantage:"преимущество по измерениям",
    routeLocal:"Основной DNS TOLF", routeRussia:"Российский региональный DNS", routeGlobal:"Глобальный DNS-маршрут", resolverQuad9:"Quad9", resolverYandex:"Yandex DNS", resolverQuad9Ecs:"Quad9 ECS", noAddress:"Нет адреса", enterDomain:"Введите доменное имя.", checking:"Проверяем…", checkFailed:"Не удалось проверить домен.",
    noDevices:"Устройств Smart DNS пока нет.", device:"Устройство", active:"Активно", revoked:"Отозвано", revoke:"Отозвать",
    revokeFailed:"Не удалось отозвать доступ устройства.", loadDevicesFailed:"Не удалось загрузить устройства.", enterDevice:"Введите название устройства.",
    created:"Устройство создано. Сохраните данные настройки ниже.", privateEndpoint:"Этот персональный адрес DoH содержит ваши учётные данные. Не передавайте его другим.",
    installProfile:"Установить профиль iOS / iPadOS", createFailed:"Не удалось создать настройку устройства."
  },
  lv: {
    heroTitle:"DNS, kas izvēlas maršrutu",
    heroText:"TOLF salīdzina reģionālos DNS maršrutus un īpašu maršrutu izmanto tikai tad, ja atkārtoti mērījumi rāda stabilu priekšrocību.",
    myDns:"Mans Smart DNS",
    myDnsText:"Iestatiet ierīces, kas izmantos jūsu personīgo šifrēto TOLF DNS.",
    setupDevice:"Iestatīt Smart DNS ierīcē",
    deviceName:"Ierīces nosaukums",
    create:"Izveidot",
    addresses:"Saņemtās adreses", dnsTime:"DNS atbildes laiks", resolver:"Resolveris", protocol:"Protokols", node:"TOLF mezgls", availability:"Rezultāts",
    domainCheckTitle:"Domēna pārbaude",
    domainCheckText:"Parāda DNS atbildi, ko TOLF Smart DNS pašlaik izmanto šim domēnam.",
    domain:"Domēns",
    checkRoute:"Pārbaudīt domēnu",
    currentRoute:"Pašreizējais maršruts",
    status:"Statuss",
    details:"Detaļas",
    policyRoute:"Politikas maršruts",
    policy:"Noteikums",
    analysis:"Analīze",
    measurements:"Jaunākie mērījumi",
    footnote:"Smart DNS lēmumi balstās uz atkārtotiem mērījumiem, nevis uz vienu pieprasījumu.",
    standardTitle:"Tiek izmantots standarta DNS maršruts",
    standardText:"TOLF šim domēnam nepiemēro īpašu noteikumu. Tiek izmantots parastais DNS maršruts.",
    measuredTitle:"TOLF izmanto pēc mērījumiem izvēlētu maršrutu",
    measuredText:"Atkārtoti mērījumi šim domēnam ir izveidojuši īpašu maršrutēšanas noteikumu.",
    fallbackTitle:"Izmantots rezerves resolveris",
    fallbackText:"Atbilde saņemta caur {resolver}, jo {preferred} nebija pieejams.",
    normal:"Veiksmīgi", fallback:"Tiek izmantots rezerves DNS", unavailable:"Nav pieejams", unknown:"Pieejamība nav zināma",
    defaultPolicy:"Šim domēnam īpašs noteikums nav nepieciešams.", exactRule:"Šim domēnam ir aktīvs atsevišķs noteikums.", suffixRule:"Šai domēnu grupai ir aktīvs reģionāls noteikums.",
    noChange:"maršruta maiņa nav ieteicama", recommendation:"ieteikums", samples:"mērījumi", advantage:"izmērītā priekšrocība",
    routeLocal:"TOLF pamata DNS", routeRussia:"Krievijas reģionālais DNS", routeGlobal:"Globālais DNS maršruts", resolverQuad9:"Quad9", resolverYandex:"Yandex DNS", resolverQuad9Ecs:"Quad9 ECS", noAddress:"Nav adreses", enterDomain:"Ievadiet domēna nosaukumu.", checking:"Pārbaudām…", checkFailed:"Neizdevās pārbaudīt domēnu.",
    noDevices:"Smart DNS ierīču vēl nav.", device:"Ierīce", active:"Aktīvs", revoked:"Atsaukts", revoke:"Atsaukt",
    revokeFailed:"Neizdevās atsaukt ierīces piekļuvi.", loadDevicesFailed:"Neizdevās ielādēt ierīces.", enterDevice:"Ievadiet ierīces nosaukumu.",
    created:"Ierīce izveidota. Saglabājiet zemāk redzamo iestatīšanas informāciju.", privateEndpoint:"Šajā personīgajā DoH adresē ir jūsu piekļuves dati. Neizpaudiet to citiem.",
    installProfile:"Instalēt iOS / iPadOS profilu", createFailed:"Neizdevās izveidot ierīces iestatījumu."
  }
};

let currentLanguage = new URLSearchParams(location.search).get("lang") ||
  (navigator.language || "en").toLowerCase().slice(0,2);
if (!SMART_DNS_I18N[currentLanguage]) currentLanguage = "en";

function t(key) {
  return SMART_DNS_I18N[currentLanguage][key] || SMART_DNS_I18N.en[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll("[data-t]").forEach(el => {
    el.textContent = t(el.dataset.t);
  });
  document.querySelectorAll("[data-lang]").forEach(button => {
    button.classList.toggle("active", button.dataset.lang === currentLanguage);
  });
}

document.querySelectorAll("[data-lang]").forEach(button => {
  button.addEventListener("click", () => {
    currentLanguage = button.dataset.lang;
    const url = new URL(location.href);
    url.searchParams.set("lang", currentLanguage);
    history.replaceState(null, "", url);
    applyLanguage();
    if (typeof refreshDynamicContent === "function") refreshDynamicContent();
  });
});
