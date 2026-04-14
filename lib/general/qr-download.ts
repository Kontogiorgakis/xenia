export function downloadQrAsPng(svg: SVGElement | null, filename: string) {
  if (!svg) return;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const svgData = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.onload = () => {
    canvas.width = 512;
    canvas.height = 512;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 512, 512);
    ctx.drawImage(img, 0, 0, 512, 512);
    const a = document.createElement("a");
    a.download = `${filename}-qr-code.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };
  img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
}
