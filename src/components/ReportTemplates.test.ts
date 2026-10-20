import { afterEach, describe, expect, it, vi } from "vitest";
import { buildExcelBuffer } from "./ExcelTemplate";
import { buildPdfBlob } from "./PdfTemplate";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("report template requests", () => {
  it("includes PDF branding and mapped records in the request", async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(new Blob(["logo"], { type: "image/png" })))
      .mockResolvedValueOnce(new Response("pdf"));
    vi.stubGlobal("fetch", fetchMock);

    await buildPdfBlob({
      title: "Reporte PDF",
      subtitle: "Subtítulo",
      logoUrl: "/assets/logo.png",
      logoUrl2: "data:image/png;base64,logo2",
      logoUrlfoot1: "data:image/png;base64,footer1",
      logoUrlfoot2: "data:image/png;base64,footer2",
      footerText: "Pie de página",
      theme: { primary: "#123456" },
      columns: [{ header: "Nombre", widthPct: 40, accessor: (row: { name: string }) => row.name }],
      records: [{ name: "Registro" }],
    });

    const body = fetchMock.mock.calls[1][1]?.body;
    if (typeof body !== "string") throw new Error("Expected a serialized PDF request.");
    const request = JSON.parse(body);
    expect(request).toMatchObject({
      title: "Reporte PDF",
      subtitle: "Subtítulo",
      logoUrl: "data:image/png;base64,bG9nbw==",
      logoUrl2: "data:image/png;base64,logo2",
      logoUrlfoot1: "data:image/png;base64,footer1",
      logoUrlfoot2: "data:image/png;base64,footer2",
      footerText: "Pie de página",
      theme: { primary: "#123456" },
      columns: [{ header: "Nombre", key: "column_0", width: 20 }],
      records: [{ column_0: "Registro" }],
    });
  });

  it("includes Excel branding and mapped records in the request", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(new ArrayBuffer(0)));
    vi.stubGlobal("fetch", fetchMock);

    await buildExcelBuffer({
      title: "Reporte Excel",
      subtitle: "Subtítulo",
      logoUrl: "data:image/png;base64,logo",
      logoUrl2: "data:image/png;base64,logo2",
      logoFooter1: "data:image/png;base64,footer1",
      logoFooter2: "data:image/png;base64,footer2",
      footerText: "Pie de página",
      theme: { primary: "#123456" },
      columns: [{ header: "Nombre", width: 24, accessor: (row: { name: string }) => row.name }],
      records: [{ name: "Registro" }],
    });

    const body = fetchMock.mock.calls[0][1]?.body;
    if (typeof body !== "string") throw new Error("Expected a serialized Excel request.");
    const request = JSON.parse(body);
    expect(request).toMatchObject({
      title: "Reporte Excel",
      subtitle: "Subtítulo",
      logoUrl: "data:image/png;base64,logo",
      logoUrl2: "data:image/png;base64,logo2",
      logoFooter1: "data:image/png;base64,footer1",
      logoFooter2: "data:image/png;base64,footer2",
      footerText: "Pie de página",
      theme: { primary: "#123456" },
      columns: [{ header: "Nombre", key: "column_0", width: 24 }],
      records: [{ column_0: "Registro" }],
    });
  });
});
