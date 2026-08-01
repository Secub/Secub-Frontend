import logoUSB from "../assets/logos/pdf-logo-usb.png";
import logoSecub from "../assets/logos/pdf-acreditacion-alta-calidad.png";

async function imageToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();

  return await new Promise((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    reader.readAsDataURL(blob);
  });
}

export async function getExcelBranding() {
  return {
    logoUrl: await imageToBase64(logoUSB),
    logoUrl2: await imageToBase64(logoSecub),
  };
}