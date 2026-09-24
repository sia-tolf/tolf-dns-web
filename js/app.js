const checkCard = document.getElementById("checkCard");
const domainInput = document.getElementById("domain");
const checkButton = document.getElementById("checkButton");
const message = document.getElementById("message");
const result = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");
const resultDescription = document.getElementById("resultDescription");
const routeExplanation = document.getElementById("routeExplanation");
const routeStatus = document.getElementById("routeStatus");
const answerAddresses = document.getElementById("answerAddresses");
const answerDnsTime = document.getElementById("answerDnsTime");
const answerResolver = document.getElementById("answerResolver");
const answerProtocol = document.getElementById("answerProtocol");
const answerNode = document.getElementById("answerNode");
const analysisBlock = document.getElementById("analysisBlock");
const analysisText = document.getElementById("analysisText");
const measurementsBlock = document.getElementById("measurementsBlock");
const measurements = document.getElementById("measurements");
const deviceCard = document.getElementById("deviceCard");
const addDeviceButton = document.getElementById("addDeviceButton");
const deviceForm = document.getElementById("deviceForm");
const deviceName = document.getElementById("deviceName");
const createDeviceButton = document.getElementById("createDeviceButton");
const deviceMessage = document.getElementById("deviceMessage");
const setupBox = document.getElementById("setupBox");
const deviceList = document.getElementById("deviceList");

function routeLabel(route) {
  if (route === "local") return t("routeLocal");
  if (route === "russia") return t("routeRussia");
  if (route === "quad9_ecs") return t("routeGlobal");
  return route || "—";
}

let lastRouteData = null;
let lastDevicesData = null;

function showMessage(text, error = false) {
  message.textContent = text;
  message.classList.toggle("error", error);
  message.classList.remove("hidden");
}

function hideMessage() {
  message.classList.add("hidden");
}

function formatMs(value) {
  if (typeof value !== "number") return "—";

  const locale =
    currentLanguage === "ru" ? "ru-RU" :
    currentLanguage === "lv" ? "lv-LV" :
    "en-GB";

  const number = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);

  return `${number} ${currentLanguage === "en" ? "ms" : "мс"}`;
}

 function measurementForRoute(data, route) {
  const items = Array.isArray(data.measurements) ? data.measurements : [];
  return items.find(item => item.route === route) || null;
}

function render(data) {
  lastRouteData = data;
  hideMessage();

  routeExplanation.classList.add("hidden");
  resultTitle.textContent = "";
  resultDescription.textContent = "";

  const live = data.lookup || null;

  if (live?.fallbackUsed && live?.resolver) {
    resultTitle.textContent = t("fallbackTitle");
    resultDescription.textContent = t("fallbackText")
      .replace("{resolver}", live.resolver)
      .replace("{preferred}", live.preferredResolver || "основной резолвер");
    routeExplanation.classList.remove("hidden");
  }

  const activeMeasurement = measurementForRoute(data, data.effectiveRoute);

  const addresses = Array.isArray(live?.addresses)
    ? live.addresses
    : (activeMeasurement?.bestIp ? [activeMeasurement.bestIp] : []);

  answerAddresses.textContent = addresses.length ? addresses.join(", ") : "—";
  answerDnsTime.textContent = formatMs(
    typeof live?.dnsLatencyMs === "number"
      ? live.dnsLatencyMs
      : activeMeasurement?.dnsLatencyMs
  );
  answerResolver.textContent = live?.resolver || "—";
  answerProtocol.textContent = live?.protocol || "—";
  const nodeName = live?.node || data.node || "—";
  answerNode.textContent =
    currentLanguage === "ru" && nodeName.toLowerCase() === "riga"
      ? "Рига"
      : nodeName;

  if (data.fallbackActive) {
    routeStatus.textContent = t("fallback");
  } else if (data.healthStatus === "available") {
    routeStatus.textContent = t("normal");
  } else if (data.healthStatus === "unavailable") {
    routeStatus.textContent = t("unavailable");
  } else {
    routeStatus.textContent = t("unknown");
  }

  if (data.analysis) {
    const a = data.analysis;

    const recommendation =
      a.recommendedRoute === "no-override"
        ? t("noChange")
        : `${t("recommendation")}: ${routeLabel(a.recommendedRoute)}`;

    analysisText.textContent =
      `${a.samples} ${t("samples")} · ${recommendation}` +
      (typeof a.gainVsSecondPercent === "number"
        ? ` · ${t("advantage")} ${a.gainVsSecondPercent.toFixed(1)}%`
        : "");

    analysisBlock.classList.remove("hidden");
  } else {
    analysisBlock.classList.add("hidden");
  }

  measurements.innerHTML = "";

  if (Array.isArray(data.measurements) && data.measurements.length) {
    for (const item of data.measurements) {
      const row = document.createElement("div");
      row.className = "measurement";

      const name = document.createElement("div");
      name.className = "measurement-route";
      name.textContent = routeLabel(item.route);

      const detail = document.createElement("div");
      detail.className = "measurement-detail";
      detail.textContent =
        `${item.bestIp || t("noAddress")} · DNS ${formatMs(item.dnsLatencyMs)}`;

      const total = document.createElement("div");
      total.className = "measurement-total";
      total.textContent = formatMs(item.totalMs);

      row.append(name, detail, total);
      measurements.appendChild(row);
    }

    measurementsBlock.classList.remove("hidden");
  } else {
    measurementsBlock.classList.add("hidden");
  }

  result.classList.remove("hidden");
}

async function checkDomain() {
  const domain = domainInput.value.trim();

  if (!domain) {
    result.classList.add("hidden");
    showMessage(t("enterDomain"), true);
    return;
  }

  checkButton.disabled = true;
  result.classList.add("hidden");
  showMessage(t("checking"));

  try {
    const data = await apiRequest(
      `/dns/route-check?domain=${encodeURIComponent(domain)}`
    );

    render(data);
  } catch (error) {
    result.classList.add("hidden");

    if (error.status === 401) {
      returnToTolf();
    } else {
      showMessage(error.message || t("checkFailed"), true);
    }
  } finally {
    checkButton.disabled = false;
  }
}

function showSignedIn() {
  deviceCard.classList.remove("hidden");
  checkCard.classList.remove("hidden");
  loadDevices();
}

function deviceMessageShow(text, error = false) {
  deviceMessage.textContent = text;
  deviceMessage.classList.toggle("error", error);
  deviceMessage.classList.remove("hidden");
}

function renderDevices(data) {
  lastDevicesData = data;
  const items = Array.isArray(data?.devices) ? data.devices : [];
  deviceList.textContent = "";

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = t("noDevices");
    deviceList.appendChild(empty);
    return;
  }

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "device-row";

    const info = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = item.name || t("device");
    const meta = document.createElement("span");
    meta.textContent = item.state === "revoked" ? t("revoked") : t("active");
    info.append(name, meta);
    row.appendChild(info);

    if (item.state !== "revoked") {
      const revoke = document.createElement("button");
      revoke.type = "button";
      revoke.className = "danger";
      revoke.textContent = t("revoke");
      revoke.onclick = async () => {
        revoke.disabled = true;
        try {
          await apiRequest(`/dns/devices/${encodeURIComponent(item.id)}/revoke`, {
            method: "POST", body: "{}"
          });
          await loadDevices();
        } catch (error) {
          deviceMessageShow(error.message || t("revokeFailed"), true);
          revoke.disabled = false;
        }
      };
      row.appendChild(revoke);
    }

    deviceList.appendChild(row);
  }
}

async function loadDevices() {
  try {
    renderDevices(await apiRequest("/dns/devices", { method: "GET" }));
  } catch (error) {
    if (error.status === 401) returnToTolf();
    else deviceMessageShow(error.message || t("loadDevicesFailed"), true);
  }
}

addDeviceButton.addEventListener("click", () => {
  deviceForm.classList.toggle("hidden");
  if (!deviceForm.classList.contains("hidden")) deviceName.focus();
});

createDeviceButton.addEventListener("click", async () => {
  const name = deviceName.value.trim();
  if (!name) {
    deviceMessageShow(t("enterDevice"), true);
    return;
  }

  createDeviceButton.disabled = true;
  setupBox.classList.add("hidden");

  try {
    const data = await apiRequest("/dns/devices", {
      method: "POST",
      body: JSON.stringify({ name })
    });

    deviceName.value = "";
    deviceForm.classList.add("hidden");
    deviceMessageShow(t("created"));

    setupBox.textContent = "";
    const title = document.createElement("strong");
    title.textContent = data.device?.name || name;

    const endpoint = document.createElement("code");
    endpoint.textContent = data.dohUrl || "";

    const note = document.createElement("p");
    note.textContent = t("privateEndpoint");

    setupBox.append(title, endpoint, note);

    if (data.iosProfileUrl) {
      const link = document.createElement("a");
      link.className = "profile-link";
      link.href = data.iosProfileUrl;
      link.textContent = t("installProfile");
      setupBox.appendChild(link);
    }

    setupBox.classList.remove("hidden");
    await loadDevices();
  } catch (error) {
    deviceMessageShow(error.message || t("createFailed"), true);
  } finally {
    createDeviceButton.disabled = false;
  }
});

function refreshDynamicContent() {
  applyLanguage();
  if (lastRouteData) render(lastRouteData);
  if (lastDevicesData) renderDevices(lastDevicesData);
}

applyLanguage();

function returnToTolf() {
  window.location.replace("https://tolf.is/");
}

async function loadSession() {
  try {
    await apiRequest("/me", { method: "GET" });
    showSignedIn();
  } catch {
    returnToTolf();
  }
}

checkButton.addEventListener("click", checkDomain);

domainInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    checkDomain();
  }
});

loadSession();
