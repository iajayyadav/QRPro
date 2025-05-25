
// Theme Management
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

// Mobile Menu Management
function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const navLinks = document.getElementById('nav-links');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    // Set active nav link
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath.split('/').pop() || 
            (currentPath === '/' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
});

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
      margin: 10,
      imageSize: logoSizePercent
    }
  });

  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = "";
  qrCode.append(qrContainer);
  qrContainer.style.display = "block";
}



async function downloadQRCode(type) {
  if (!document.querySelector("#qrcode svg, #qrcode canvas")) {
    alert("Please generate the QR code first.");
    return;
  }

  const qrContainer = document.getElementById("qrcode");

  if (type === 'pdf') {
    const originalType = qrCode._options.type;
    const originalData = getFormattedData();

    // Switch to canvas for PDF export
    qrCode.update({ type: 'canvas', data: originalData });
    qrContainer.innerHTML = '';
    await qrCode.append(qrContainer);

    // Give canvas some time to render
    setTimeout(() => {
      const canvas = qrContainer.querySelector("canvas");
      if (canvas) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Make sure canvas is rendered before converting
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, 'PNG', 10, 10, 180, 180);
        doc.save("qr_code.pdf");
      } else {
        alert("Canvas not rendered — cannot export PDF.");
      }

      // Restore original QR display (e.g., SVG)
      qrCode.update({ type: originalType, data: originalData });
      qrContainer.innerHTML = '';
      qrCode.append(qrContainer);

    }, 300); // adjust if needed (300ms is generally safe)
  } else {
    qrCode.download({ name: "qr_code", extension: type });
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


// document.getElementById("logoSize").addEventListener("input", function () {
//   const size = parseInt(this.value) / 100;
//   // Update only logo size if QR code already exists
//   qrCode.update({
//     imageOptions: {
//       crossOrigin: "anonymous",
//       margin: 10,
//       imageSize: size
//     }
//   });
// });
