/**
 * Load Matrix Industries stamp PNG and convert to data URL
 * Returns a promise that resolves to a data URL of the stamp image
 */
export const generateMatrixStamp = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load stamp image'));
    };
    
    // Try to load the stamp from the public folder
    img.src = '/matrix-stamp.png';
  });
};
