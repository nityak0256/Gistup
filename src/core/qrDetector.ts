/**
 * Client-side QR code detector and cropper.
 * Uses jsQR to locate QR codes in event poster images,
 * decodes the registration link, and extracts a cropped image dataURL.
 */

import jsQR from 'jsqr';

export interface QRDetectResult {
  detected: boolean;
  linkUrl?: string;
  domain?: string;
  croppedImageUrl?: string;
}

/**
 * Extracts domain name from URL string (e.g. "https://hackgrid.dev/register" -> "hackgrid.dev")
 */
export function extractDomain(urlStr?: string): string {
  if (!urlStr) return '';
  try {
    const url = new URL(urlStr);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return urlStr.replace(/^https?:\/\//, '').split('/')[0] || '';
  }
}

/**
 * Analyzes an image element or image URL, finds QR code using jsQR,
 * and crops the QR code area to a small preview data URL.
 */
export async function detectAndCropQR(imageSource: string | HTMLImageElement): Promise<QRDetectResult> {
  return new Promise((resolve) => {
    const img = typeof imageSource === 'string' ? new Image() : imageSource;
    if (typeof imageSource === 'string') {
      img.crossOrigin = 'anonymous';
      img.src = imageSource;
    }

    const process = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx || canvas.width === 0 || canvas.height === 0) {
          return resolve({ detected: false });
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.location) {
          const loc = code.location;
          // Calculate bounding box around the QR code
          const minX = Math.max(0, Math.min(loc.topLeftCorner.x, loc.bottomLeftCorner.x) - 10);
          const minY = Math.max(0, Math.min(loc.topLeftCorner.y, loc.topRightCorner.y) - 10);
          const maxX = Math.min(canvas.width, Math.max(loc.topRightCorner.x, loc.bottomRightCorner.x) + 10);
          const maxY = Math.min(canvas.height, Math.max(loc.bottomLeftCorner.y, loc.bottomRightCorner.y) + 10);
          const width = maxX - minX;
          const height = maxY - minY;

          // Crop QR code into dedicated canvas
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = width;
          cropCanvas.height = height;
          const cropCtx = cropCanvas.getContext('2d');
          let croppedImageUrl = '';

          if (cropCtx && width > 0 && height > 0) {
            cropCtx.drawImage(canvas, minX, minY, width, height, 0, 0, width, height);
            croppedImageUrl = cropCanvas.toDataURL('image/png');
          }

          const linkUrl = code.data;
          const domain = extractDomain(linkUrl);

          return resolve({
            detected: true,
            linkUrl,
            domain,
            croppedImageUrl,
          });
        }

        resolve({ detected: false });
      } catch (err) {
        console.warn('QR scan error:', err);
        resolve({ detected: false });
      }
    };

    if (img.complete && (img.naturalWidth || img.width)) {
      process();
    } else {
      img.onload = () => process();
      img.onerror = () => resolve({ detected: false });
    }
  });
}
