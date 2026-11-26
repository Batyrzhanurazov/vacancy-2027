const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzp6qXYqwk5JhbWctgmUjKprJPRWqqoQIKZ2ZWrP4nmPLM6gRVsgRkKF4-aoGsNKkwM/exec";

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    let upstream;
    if (req.method === "GET") {
      upstream = await fetch(SCRIPT_URL + "?t=" + Date.now(), { redirect: "follow" });
    } else if (req.method === "POST") {
      const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
      upstream = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body,
        redirect: "follow"
      });
    } else {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const text = await upstream.text();
    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch {
      return res.status(502).json({
        ok: false,
        error: `Apps Script HTTP ${upstream.status}: ${text.slice(0, 180)}`
      });
    }
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
