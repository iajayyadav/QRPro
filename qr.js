const url="qrcodegeneratorpro.netlify.app";
const qrCode = new QRCodeStyling({
    width: 256,
    height: 256,
    type: "svg",
    data: "",
    image: "", // Add logo if needed
    dotsOptions: {
      color: "#000",
      type: "rounded"
    },
    backgroundOptions: {
      color: "#ffffff"
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 10
    }
  });

  function showInputs() {
    const type = document.getElementById("type").value;
    document.getElementById("input-fields").style.display = 'none';
    document.querySelectorAll('.multi-input').forEach(e => e.style.display = 'none');

    if (['url', 'text', 'phone', 'email'].includes(type)) {
      document.getElementById("main").placeholder = `Enter ${type}`;
      document.getElementById("main").value = '';
      document.getElementById("input-fields").style.display = 'block';

      document.getElementById("main").style.display = 'block';
    } else if (type === 'vcard') {
      document.getElementById("vcard-fields").style.display = 'block';
    } else if (type === 'wifi') {
      document.getElementById("wifi-fields").style.display = 'block';
    }
  }

  function getFormattedData() {
    const type = document.getElementById("type").value;
    const main = document.getElementById("main").value.trim();

    switch(type) {
      case 'url':
        return main.startsWith("http") ? main : "https://" + main;
      case 'text':
        return main;
      case 'phone':
        return `tel:${main}`;
      case 'email':
        return `mailto:${main}`;
      case 'vcard':
        const name = document.getElementById("vname").value.trim();
        const phone = document.getElementById("vphone").value.trim();
        const email = document.getElementById("vemail").value.trim();
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
      case 'wifi':
        const ssid = document.getElementById("ssid").value.trim();
        const pass = document.getElementById("wpass").value.trim();
        const enc = document.getElementById("encryption").value;
        return `WIFI:S:${ssid};T:${enc};P:${pass};;`;
      default:
        return "";
    }
  }

  function generateQRCode() {
  const data = getFormattedData();
  if (!data) {
    alert("Please fill in the required fields.");
    return;
  }

  const dotColor = document.getElementById("dotColor").value;
  const bgColor = document.getElementById("bgColor").value;
  const dotStyle = document.getElementById("dotStyle").value;
  const errorCorrection = document.getElementById("errorCorrection").value;
// const cornerRadius = parseFloat(document.getElementById("cornerRadius").value);
const logoSizePercent = parseFloat(document.getElementById("logoSize").value) / 100;
// const logoSizePercent = 0.5;

  // Check for data length based on error correction level
  const maxCapacity = {
    L: 2953,
    M: 2331,
    Q: 1663,
    H: 1273
  };

  if (data.length > maxCapacity[errorCorrection]) {
    alert(`Text too long for selected error correction level (${errorCorrection}).\nTry shortening the text or lowering the error correction.`);
    return;
  }

  const logoFile = document.getElementById("logoUpload").files[0];
  let logoURL = "";
  const logoWarning = document.getElementById("logoWarning");

  if (logoFile) {
    if (logoFile.size > 500 * 1024) { // 500KB
    logoWarning.style.display = "inline";
    return;
  } else {
    logoWarning.style.display = "none";
  }
    const reader = new FileReader();
    reader.onload = function(e) {
      logoURL = e.target.result;
      updateQRCodeWithLogo(data, dotColor, bgColor, dotStyle, logoURL, errorCorrection, logoSizePercent);
    };
    reader.readAsDataURL(logoFile);
  } else {
    logoWarning.style.display = "none";
    updateQRCodeWithLogo(data, dotColor, bgColor, dotStyle, "", errorCorrection, logoSizePercent);
  }
}

function updateQRCodeWithLogo(data, dotColor, bgColor, dotStyle, logoURL, errorCorrection, logoSizePercent) {
  qrCode.update({
    data: data,
    image: logoURL || "",
    qrOptions: {
      errorCorrectionLevel: errorCorrection
    },
    dotsOptions: {
      color: dotColor,
      type: dotStyle
    },
    backgroundOptions: {
      color: bgColor
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 5,
      imageSize: logoSizePercent,
      hideBackgroundDots: true,
      centerImage: true
    }
  });

  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = "";
  qrCode.append(qrContainer);
  qrContainer.style.display = "block";

  // Wait for QR code to be fully rendered
  setTimeout(() => {
    // Add share buttons after QR code is generated
    addShareButtons();
  }, 100);
}

function addShareButtons() {
  const qrContainer = document.getElementById("qrcode");
  
  // Remove existing share buttons if any
  const existingButtons = document.getElementById("share-container");
  if (existingButtons) {
    existingButtons.remove();
  }

  // Create share container with proper positioning
  const shareContainer = document.createElement("div");
  shareContainer.id = "share-container";
  shareContainer.style.position = "relative";
  shareContainer.style.zIndex = "100";
  shareContainer.style.marginTop = "15px";
  shareContainer.style.width = "100%";
  shareContainer.style.display = "flex";
  shareContainer.style.flexDirection = "column";
  shareContainer.style.alignItems = "center";

  // Create toggle button with improved visibility
  const toggleBtn = document.createElement("button");
  toggleBtn.innerHTML = '<i class="ri-share-line"></i> Share';
  toggleBtn.className = "share-toggle-button";
  toggleBtn.style.display = "inline-flex";
  toggleBtn.style.alignItems = "center";
  toggleBtn.style.justifyContent = "center";
  toggleBtn.style.gap = "8px";
  toggleBtn.style.padding = "10px 20px";
  toggleBtn.style.cursor = "pointer";
  toggleBtn.style.marginTop = "10px";
  toggleBtn.style.minWidth = "120px";

  // Create buttons container
  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.display = "flex";
  buttonsContainer.style.flexDirection = "column";
  buttonsContainer.style.gap = "10px";
  buttonsContainer.style.marginTop = "10px";

  // Create share buttons card with enhanced positioning
  const shareCard = document.createElement("div");
  shareCard.id = "share-buttons";
  shareCard.className = "share-card";
  shareCard.style.display = "none";
  shareCard.style.position = "absolute";
  shareCard.style.top = "100%";
  shareCard.style.left = "50%";
  shareCard.style.transform = "translateX(-50%)";
  shareCard.style.marginTop = "10px";
  shareCard.style.padding = "15px";
  shareCard.style.borderRadius = "8px";
  shareCard.style.backgroundColor = "var(--bg-light)";
  shareCard.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
  shareCard.style.width = "200px";
  shareCard.style.zIndex = "1000";

  // Toggle share card visibility
  toggleBtn.onclick = () => {
    const isVisible = shareCard.style.display === "flex";
    shareCard.style.flexDirection = "column";
    shareCard.style.justifyContent = "center";
    shareCard.style.display = isVisible ? "none" : "flex";
    toggleBtn.innerHTML = isVisible ? 
      '<i class="ri-share-line"></i> Share' : 
      '<i class="ri-close-line"></i> Close';
  };



  // Function to get QR code as PNG data URL
  const getQRCodeImage = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const svg = qrContainer.querySelector("svg");
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 1024;
          canvas.height = 1024;
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          // Clear canvas and fill with background color
          ctx.fillStyle = qrCode._options.backgroundOptions.color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // Draw QR code with proper centering
          ctx.drawImage(img, 0, 0, 1024, 1024);
          resolve(canvas.toDataURL("image/png", 1.0));
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
      }, 150); // Increased delay for better logo rendering
    });
  };

  // Add copy link button
  const copyLinkBtn = document.createElement("button");
  copyLinkBtn.innerHTML = '<i class="ri-file-copy-line"></i> Copy Link';
  copyLinkBtn.className = "share-button copy-link";
  copyLinkBtn.onclick = async () => {
    const imageUrl = await getQRCodeImage();
    navigator.clipboard.writeText(url).then(() => {
      const originalText = copyLinkBtn.innerHTML;
      copyLinkBtn.innerHTML = '<i class="ri-check-line"></i> Copied!';
      setTimeout(() => {
        copyLinkBtn.innerHTML = originalText;
      }, 2000);
    });
  };

  // Share on WhatsApp
  const whatsappBtn = document.createElement("button");
  whatsappBtn.innerHTML = '<i class="ri-whatsapp-line"></i> WhatsApp';
  whatsappBtn.className = "share-button whatsapp";
  whatsappBtn.onclick = async () => {
    const imageUrl = await getQRCodeImage();
    const shareUrl = `https://api.whatsapp.com/send?text=Check out my QR code!%0A${url}`;
    window.open(shareUrl, '_blank');
  };

  // Share on Facebook
  const facebookBtn = document.createElement("button");
  facebookBtn.innerHTML = '<i class="ri-facebook-line"></i> Facebook';
  facebookBtn.className = "share-button facebook";
  facebookBtn.onclick = async () => {
    const imageUrl = await getQRCodeImage();
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(shareUrl, '_blank');
  };

  // Share on Twitter
  const twitterBtn = document.createElement("button");
  twitterBtn.innerHTML = '<i class="ri-twitter-line"></i> Twitter';
  twitterBtn.className = "share-button twitter";
  twitterBtn.onclick = async () => {
    const imageUrl = await getQRCodeImage();
    const shareUrl = `https://twitter.com/intent/tweet?text=Check out my QR code!&url=${url}`;
    window.open(shareUrl, '_blank');
  };

  // Add buttons to container
  buttonsContainer.appendChild(copyLinkBtn);
  buttonsContainer.appendChild(whatsappBtn);
  buttonsContainer.appendChild(facebookBtn);
  buttonsContainer.appendChild(twitterBtn);

  // Add buttons container to share card
  shareCard.appendChild(buttonsContainer);
  
shareContainer.appendChild(toggleBtn);
shareContainer.appendChild(shareCard);


  // Add share buttons after QR code
  if (qrContainer && qrContainer.parentNode) {
    qrContainer.parentNode.insertBefore(shareContainer, qrContainer.nextSibling);
  } else {
    console.error('QR container not found');
  }

  // Make sure the toggle button is visible
  toggleBtn.style.display = 'inline-flex';
  shareContainer.style.display = 'block';
}

function downloadQRCode(format) {
    if (!format) {
      alert('Please select a download format');
      return;
    }
  
    const filename = `qr-code.${format}`;
    const qrContainer = document.getElementById('qrcode');
  
    // Get user-selected quality (default 512, clamp between 100 and 2048)
    const qualityInput = document.getElementById('quality');
    let userQuality = parseInt(qualityInput?.value) || 512;
    userQuality = Math.min(Math.max(userQuality, 100), 2048);
  
    if (format === "pdf") {
      const originalContent = qrContainer.innerHTML;
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      document.body.appendChild(tempContainer);
      qrContainer.innerHTML = '';
      const originalWidth = qrCode._options.width;
      const originalHeight = qrCode._options.height;
  
      // Set QR code size to user quality for PDF export
      qrCode._options.width = userQuality;
      qrCode._options.height = userQuality;
      qrCode.append(tempContainer);
  
      const spinner = document.createElement('div');
      spinner.className = 'loading-spinner';
      qrContainer.appendChild(spinner);
  
      const downloadBtn = document.querySelector('.download-button');
      downloadBtn.disabled = true;
      downloadBtn.style.opacity = '0.7';
      downloadBtn.textContent = 'Generating...';
  
      setTimeout(() => {
        try {
          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
  
          const canvas = document.createElement('canvas');
          const svg = tempContainer.querySelector('svg');
          const svgData = new XMLSerializer().serializeToString(svg);
          const img = new Image();
          img.onload = function () {
            canvas.width = userQuality;
            canvas.height = userQuality;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdfWidth = 210;
            const pdfHeight = 297;
            const margin = 10;
            // Max QR size with margins, but no bigger than 190 mm
            const qrSize = Math.min(pdfWidth, pdfHeight) - margin * 2;
            const xPos = (pdfWidth - qrSize) / 2;
            const yPos = (pdfHeight - qrSize) / 2;
            pdf.addImage(imgData, 'PNG', xPos, yPos, qrSize, qrSize);
            pdf.save(filename);
            document.body.removeChild(tempContainer);
            spinner.remove();
            qrCode._options.width = originalWidth;
            qrCode._options.height = originalHeight;
            qrContainer.innerHTML = originalContent;
  
            downloadBtn.disabled = false;
            downloadBtn.style.opacity = '1';
            downloadBtn.textContent = 'Download';
          };
  
          img.onerror = () => {
            throw new Error('Image load failed.');
          };
  
          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        } catch (error) {
          console.error('Error generating PDF:', error);
          alert('Error generating PDF. Please try again.');
  
          spinner.remove();
          document.body.removeChild(tempContainer);
  
          qrCode._options.width = originalWidth;
          qrCode._options.height = originalHeight;
          qrContainer.innerHTML = originalContent;
  
          downloadBtn.disabled = false;
          downloadBtn.style.opacity = '1';
          downloadBtn.textContent = 'Download';
        }
      }, 500);
  
    } else if (format === "png") {
      // For PNG, temporarily increase qrCode size for higher quality
      const originalWidth = qrCode._options.width;
      const originalHeight = qrCode._options.height;
  
      qrCode._options.width = userQuality;
      qrCode._options.height = userQuality;
  
      // You might need to refresh or regenerate QR code here depending on your library
      // For example:
      // qrContainer.innerHTML = '';
      // qrCode.makeCode(currentValue); // if your library supports regenerating code
  
      // Download PNG
      qrCode.download({ name: filename, extension: format });
  
      // Restore original size
      qrCode._options.width = originalWidth;
      qrCode._options.height = originalHeight;
  
      // Regenerate or refresh QR code display to original size if needed
    } else {
      // Other formats fallback
      qrCode.download({ name: filename, extension: format });
    }
  }
  
  
  
  
  



  showInputs();

  

  const charCount = document.getElementById("charCount");
const mainInput = document.getElementById("main");
const errorCorrectionSelect = document.getElementById("errorCorrection");

function updateCharCounter() {
  const level = errorCorrectionSelect.value;
  const maxCapacity = {
    L: 2953,
    M: 2331,
    Q: 1663,
    H: 1273
  };

  const currentLength = mainInput.value.length;
  const max = maxCapacity[level];

  charCount.textContent = `${currentLength} / ${max} characters used`;

  if (currentLength > max) {
    charCount.style.color = "red";
  } else {
    charCount.style.color = "gray";
  }
}

mainInput.addEventListener("input", updateCharCounter);
errorCorrectionSelect.addEventListener("change", updateCharCounter);



  document.getElementById("logoSize").addEventListener("input", function() {
  document.getElementById("logoSizeValue").textContent = this.value + "%";
});
