/**
 * Vercel Serverless : bundle copié dans ./vercel-bundle/ au build.
 * Import dynamique + catch : si le bundle manque (H5), on répond 500 JSON au lieu de FUNCTION_INVOCATION_FAILED.
 */
const endpoint =
  "http://127.0.0.1:7699/ingest/6bf834d8-5189-4baf-be4d-1cb063409782";

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
    return m.default;
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
    throw err;
  });

export default function apiIndex(req, res) {
  return bundlePromise
    .then((handler) => Promise.resolve(handler(req, res)))
    .catch((err) => {
      console.error(
        JSON.stringify({
          tag: "DEBUG_7768ea",
          hypothesisId: "H5",
          msg: "apiIndex_request_catch",
          err: String(err),
        }),
      );
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error: "bootstrap",
            message: String(err?.message ?? err),
          }),
        );
      }
    });
}
