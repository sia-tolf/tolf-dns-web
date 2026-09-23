const checkCard = document.getElementById("checkCard");
const domainInput = document.getElementById("domain");
const checkButton = document.getElementById("checkButton");
const message = document.getElementById("message");
const result = document.getElementById("result");
const resultDomain = document.getElementById("resultDomain");
const resultTitle = document.getElementById("resultTitle");
const resultDescription = document.getElementById("resultDescription");
const policyRoute = document.getElementById("policyRoute");
const effectiveRoute = document.getElementById("effectiveRoute");
const policySource = document.getElementById("policySource");
const routeStatus = document.getElementById("routeStatus");
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

const routeNames = {
  local: "Local",
  russia: "Russia",
  quad9_ecs: "Quad9 ECS"
};

function showMessage(text, error = false) {
  message.textContent = text;
  message.classList.toggle("error", error);
  message.classList.remove("hidden");
}

function hideMessage() {
  message.classList.add("hidden");
}

function formatMs(value) {
  return typeof value === "number" ? `${value.toFixed(1)} ms` : "—";
}

function render(data) {
  hideMessage();

  resultDomain.textContent = data.domain || domainInput.value.trim().toLowerCase();

  if (data.fallbackActive) {
    resultTitle.textContent = "TOLF switched to a fallback route";
    resultDescription.textContent =
      "The preferred route is currently unavailable, so TOLF is using a safe fallback.";
  } else if (data.policySource === "default") {
    resultTitle.textContent = "Standard DNS route is being used";
    resultDescription.textContent =
      "TOLF has no special routing rule for this domain. It is using the normal DNS path.";
  } else {
    resultTitle.textContent = "TOLF is using a measured route";
    resultDescription.textContent =
      "Repeated measurements produced a special routing rule for this domain.";
  }

  policyRoute.textContent =
    routeNames[data.policyRoute] || data.policyRoute || "—";

  effectiveRoute.textContent =
    data.effectiveRoute
      ? (routeNames[data.effectiveRoute] || data.effectiveRoute)
      : "Unknown";

  if (data.fallbackActive) {
    routeStatus.textContent = "Fallback active";
  } else if (data.healthStatus === "available") {
    routeStatus.textContent = "Normal";
  } else if (data.healthStatus === "unavailable") {
    routeStatus.textContent = "Unavailable";
  } else {
    routeStatus.textContent = "Health unknown";
  }

  if (data.policySource === "default") {
    policySource.textContent = "Default";
  } else {
    policySource.textContent =
      `${data.policySource === "exact" ? "Exact rule" : "Suffix rule"}` +
      (data.matchedPolicyDomain ? ` · ${data.matchedPolicyDomain}` : "");
  }

  if (data.analysis) {
    const a = data.analysis;

    const recommendation =
      a.recommendedRoute === "no-override"
        ? "no routing change recommended"
        : `recommendation: ${routeNames[a.recommendedRoute] || a.recommendedRoute}`;

    analysisText.textContent =
      `${a.samples} samples · ${recommendation}` +
      (typeof a.gainVsSecondPercent === "number"
        ? ` · measured advantage ${a.gainVsSecondPercent.toFixed(1)}%`
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
      name.textContent = routeNames[item.route] || item.route;

      const detail = document.createElement("div");
      detail.className = "measurement-detail";
      detail.textContent =
        `${item.bestIp || "No address"} · DNS ${formatMs(item.dnsLatencyMs)}`;

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
    showMessage("Enter a domain name.", true);
    return;
  }

  checkButton.disabled = true;
  result.classList.add("hidden");
  showMessage("Checking…");

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
      showMessage(error.message || "Unable to check this domain.", true);
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
  const items = Array.isArray(data?.devices) ? data.devices : [];
  deviceList.textContent = "";

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No Smart DNS devices yet.";
    deviceList.appendChild(empty);
    return;
  }

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "device-row";

    const info = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = item.name || "Device";
    const meta = document.createElement("span");
    meta.textContent = item.state === "revoked" ? "Revoked" : "Active";
    info.append(name, meta);
    row.appendChild(info);

    if (item.state !== "revoked") {
      const revoke = document.createElement("button");
      revoke.type = "button";
      revoke.className = "text-button";
      revoke.textContent = "Revoke";
      revoke.onclick = async () => {
        revoke.disabled = true;
        try {
          await apiRequest(`/dns/devices/${encodeURIComponent(item.id)}/revoke`, {
            method: "POST", body: "{}"
          });
          await loadDevices();
        } catch (error) {
          deviceMessageShow(error.message || "Unable to revoke device.", true);
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
    else deviceMessageShow(error.message || "Unable to load devices.", true);
  }
}

addDeviceButton.addEventListener("click", () => {
  deviceForm.classList.toggle("hidden");
  if (!deviceForm.classList.contains("hidden")) deviceName.focus();
});

createDeviceButton.addEventListener("click", async () => {
  const name = deviceName.value.trim();
  if (!name) {
    deviceMessageShow("Enter a device name.", true);
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
    deviceMessageShow("Device created. Save the setup information below.");

    setupBox.textContent = "";
    const title = document.createElement("strong");
    title.textContent = data.device?.name || name;

    const endpoint = document.createElement("code");
    endpoint.textContent = data.dohUrl || "";

    const note = document.createElement("p");
    note.textContent = "This personal DoH address contains your credential. Keep it private.";

    setupBox.append(title, endpoint, note);

    if (data.iosProfileUrl) {
      const link = document.createElement("a");
      link.className = "profile-link";
      link.href = data.iosProfileUrl;
      link.textContent = "Install iOS / iPadOS profile";
      setupBox.appendChild(link);
    }

    setupBox.classList.remove("hidden");
    await loadDevices();
  } catch (error) {
    deviceMessageShow(error.message || "Unable to create device.", true);
  } finally {
    createDeviceButton.disabled = false;
  }
});

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
