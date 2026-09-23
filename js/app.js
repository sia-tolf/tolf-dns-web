const domainInput = document.getElementById("domain");
const checkButton = document.getElementById("checkButton");
const message = document.getElementById("message");
const result = document.getElementById("result");
const activeRoute = document.getElementById("activeRoute");
const policySource = document.getElementById("policySource");
const analysisBlock = document.getElementById("analysisBlock");
const analysisText = document.getElementById("analysisText");
const measurementsBlock = document.getElementById("measurementsBlock");
const measurements = document.getElementById("measurements");

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

  activeRoute.textContent =
    routeNames[data.activeRoute] || data.activeRoute;

  if (data.policySource === "default") {
    policySource.textContent = "Default";
  } else {
    policySource.textContent =
      `${data.policySource === "exact" ? "Exact rule" : "Suffix rule"}` +
      (data.matchedPolicyDomain ? ` · ${data.matchedPolicyDomain}` : "");
  }

  if (data.analysis) {
    const a = data.analysis;

    analysisText.textContent =
      `${a.samples} samples · recommendation: ` +
      `${routeNames[a.recommendedRoute] || a.recommendedRoute}` +
      (typeof a.gainVsSecondPercent === "number"
        ? ` · gain ${a.gainVsSecondPercent.toFixed(1)}%`
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
      showMessage(
        "Sign in to TOLF first at vpn.tolf.is, then return to this page.",
        true
      );
    } else {
      showMessage(error.message || "Unable to check this domain.", true);
    }
  } finally {
    checkButton.disabled = false;
  }
}

checkButton.addEventListener("click", checkDomain);

domainInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    checkDomain();
  }
});
