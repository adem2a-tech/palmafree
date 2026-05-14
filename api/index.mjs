/**
 * Vercel Serverless : bundle copié dans ./vercel-bundle/ au build.
 * Le promise du bundle ne rejette jamais (H6) : en cas d’import KO, on sert un handler 500 JSON.
 */
const endpoint =
  "http://127.0.0.1:7699/ingest/6bf834d8-5189-4baf-be4d-1cb063409782";

/** Handler de secours si le bundle ne charge pas (évite promise rejetée « nue » côté Lambda). */
function bootstrapFallbackHandler(err) {
  return function bootstrapFallback(_req, res) {
    console.error(
      JSON.stringify({
        tag: "DEBUG_7768ea",
        hypothesisId: "H6",
        msg: "bootstrap_fallback_invoked",
        err: String(err?.message ?? err),
      }),
    );
    if (!res?.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "bootstrap",
          message: String(err?.message ?? err),
        }),
      );
    }
  };
}

const bundlePromise = import("./vercel-bundle/vercel-handler.mjs")
  .then((m) => {
    // #region agent log
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "7768ea",
      },
      body: JSON.stringify({
        sessionId: "7768ea",
        hypothesisId: "H5",
        location: "api/index.mjs:import_ok",
        message: "vercel-bundle import ok",
        data: { exportType: typeof m.default },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    console.error(
      JSON.stringify({
        tag: "DEBUG_7768ea",
        hypothesisId: "H5",
        msg: "bundle_import_ok",
        exportType: typeof m.default,
      }),
    );
    // #endregion
    const h = m.default;
    if (typeof h !== "function") {
      return bootstrapFallbackHandler(
        new Error(`vercel-handler default export is ${typeof h}, expected function`),
      );
    }
    return h;
  })
  .catch((err) => {
    // #region agent log
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "7768ea",
      },
      body: JSON.stringify({
        sessionId: "7768ea",
        hypothesisId: "H5",
        location: "api/index.mjs:import_fail",
        message: String(err?.message ?? err),
        data: { stack: err?.stack?.slice(0, 800) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    console.error(
      JSON.stringify({
        tag: "DEBUG_7768ea",
        hypothesisId: "H5",
        msg: "bundle_import_FAIL",
        err: String(err),
      }),
    );
    // #endregion
    return bootstrapFallbackHandler(err);
  });

export default function apiIndex(req, res) {
  // #region agent log
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "7768ea",
    },
    body: JSON.stringify({
      sessionId: "7768ea",
      hypothesisId: "H6",
      location: "api/index.mjs:apiIndex_entry",
      message: "apiIndex invoked",
      data: {
        method: req?.method,
        url: typeof req?.url === "string" ? req.url.slice(0, 160) : undefined,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  console.error(
    JSON.stringify({
      tag: "DEBUG_7768ea",
      hypothesisId: "H6",
      msg: "apiIndex_entry",
      method: req?.method,
      url: req?.url,
    }),
  );
  // #endregion

  return bundlePromise
    .then((handler) => Promise.resolve(handler(req, res)))
    .catch((err) => {
      console.error(
        JSON.stringify({
          tag: "DEBUG_7768ea",
          hypothesisId: "H6",
          msg: "apiIndex_handler_throw",
          err: String(err),
        }),
      );
      if (res && !res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error: "request",
            message: String(err?.message ?? err),
          }),
        );
      }
    });
}
