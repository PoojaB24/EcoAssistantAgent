(async function () {
  const API_URL = "https://luteotropic-aglimmer-rachelle.ngrok-free.dev/predict";

  function createPopup() {
    let existing = document.getElementById('eco-popup-widget');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'eco-popup-widget';
    popup.style.cssText = `
  position: fixed; 
  right: 20px; 
  bottom: 20px; 
  z-index: 999999;
  width: 360px; 
  max-height: 550px; 
  overflow-y: auto;

  background: linear-gradient(135deg,
    rgb(84, 8, 99),
    rgb(146, 72, 122),
    rgb(228, 155, 166),
    rgb(255, 211, 213)
  );

  border: 1px solid rgba(84, 8, 99, 0.6);
  border-radius: 18px; 
  box-shadow: 0 10px 35px rgba(84, 8, 99, 0.45);

  padding: 16px; 
  color: #ffffff; 
  font-family: 'Poppins', sans-serif;
  font-size: 13px; 
  line-height: 1.5;

  transition: all 0.3s ease; 
  animation: popupFadeIn 0.6s ease;
`;


    popup.innerHTML = `
      <style>
        @keyframes popupFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        #eco-popup-widget button:hover {
          background: rgba(255,255,255,0.2);
          transform: scale(1.05);
        }
        #eco-popup-widget::-webkit-scrollbar {
          width: 6px;
        }
        #eco-popup-widget::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 3px;
        }
      </style>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:600;font-size:15px;">🌱 Eco Material Analyzer</div>
        <button id="eco-close" style="background:transparent;border:none;color:white;font-weight:bold;cursor:pointer;font-size:14px;">✕</button>
      </div>
      <div id="eco-body" style="margin-top:8px;font-size:13px;">🔍 Extracting material information...</div>
    `;

    document.body.appendChild(popup);
    popup.querySelector('#eco-close').onclick = () => popup.remove();
    return popup;
  }

  function clean(t) {
    return (t || "").replace(/\s+/g, ' ').trim();
  }

  // ===========================
  // ADVANCED MATERIAL EXTRACTION
  // ===========================

  function extractMaterialInfo(text) {
    const lower = text.toLowerCase();
    const materials = new Set();

    const materialKeywords = [
      'cotton', 'organic cotton', 'recycled cotton', 'pima cotton', 'egyptian cotton',
      'polyester', 'recycled polyester', 'rPET', 'pet polyester',
      'nylon', 'recycled nylon', 'econyl',
      'spandex', 'elastane', 'lycra',
      'leather', 'genuine leather', 'real leather', 'full grain leather', 'top grain leather',
      'vegan leather', 'pu leather', 'faux leather', 'artificial leather', 'synthetic leather',
      'pu', 'polyurethane',
      'suede', 'nubuck',
      'silk', 'peace silk', 'organic silk',
      'wool', 'merino wool', 'organic wool', 'recycled wool',
      'cashmere', 'alpaca', 'mohair',
      'linen', 'flax',
      'denim', 'canvas', 'fleece',
      'bamboo', 'bamboo fiber', 'bamboo viscose',
      'jute', 'hemp', 'ramie',
      'modal', 'tencel', 'lyocell', 'cupro',
      'rayon', 'viscose',
      'acrylic', 'polypropylene',
      'rubber', 'natural rubber', 'latex',
      'eva', 'tpr', 'tpu',
      'mesh', 'mesh fabric', 'knit',
      'metal', 'aluminum', 'aluminium', 'stainless steel', 'brass', 'copper',
      'wood', 'reclaimed wood', 'fsc wood', 'bamboo wood',
      'ceramic', 'porcelain', 'glass', 'recycled glass',
      'plastic', 'recycled plastic', 'bioplastic', 'biodegradable plastic',
      'cork', 'pinatex', 'mycelium', 'mushroom leather',
      'down', 'feather', 'synthetic down'
    ];

    // Pattern 1: Direct material mentions with context
    const contextPattern = /(?:material|fabric|composition|content|made of|made from|made with|crafted from|constructed from|shell|outer|inner|lining|sole|upper|insole|midsole|outsole)[:\-\s]*([^.;!?]+?)(?:\.|;|!|\?|<br|$|\n)/gi;
    const matches1 = lower.matchAll(contextPattern);
    for (let match of matches1) {
      if (match[1]) {
        const segment = match[1].trim();
        for (let mat of materialKeywords) {
          if (segment.includes(mat)) {
            materials.add(mat);
          }
        }
        if (segment.length < 100) {
          materials.add(segment);
        }
      }
    }

    // Pattern 2: Percentages "100% Cotton", "80% Polyester, 20% Spandex"
    const percentPattern = /(\d+%?\s*[a-z][a-z\s]+?)(?:,|\+|and|\||$)/gi;
    const matches2 = lower.matchAll(percentPattern);
    for (let match of matches2) {
      const segment = match[1].trim();
      if (segment.length < 50) {
        materials.add(segment);
      }
    }

    // Pattern 3: Material keywords appearing standalone
    for (let mat of materialKeywords) {
      const regex = new RegExp(`\\b${mat}\\b`, 'i');
      if (regex.test(lower)) {
        materials.add(mat);
      }
    }

    // Pattern 4: Multi-layer composition
    const layerPattern = /(?:outer|inner|lining|shell|surface|upper|sole|base|top|bottom|layer)[:\-\s]*([^.;!?]+?)(?:\.|;|!|\?|$|\n)/gi;
    const matches4 = lower.matchAll(layerPattern);
    for (let match of matches4) {
      if (match[1] && match[1].length < 100) {
        materials.add(match[1].trim());
      }
    }

    return Array.from(materials).filter(m => m.length > 1);
  }

  function extractCertifications(text) {
    const lower = text.toLowerCase();
    const certs = new Set();

    const certifications = [
      'fsc certified', 'fsc', 'forest stewardship council',
      'gots', 'global organic textile standard',
      'oeko-tex', 'oeko tex', 'standard 100',
      'fair trade', 'fairtrade', 'fair trade certified',
      'organic certified', 'usda organic', 'eu organic', 'organic 100',
      'cradle to cradle', 'c2c certified',
      'bluesign', 'bluesign approved',
      'b corp', 'b corporation', 'certified b corp',
      'carbon neutral', 'carbon neutral certified',
      'climate neutral', 'climate neutral certified',
      'rainforest alliance', 'rainforest alliance certified',
      'ecocert', 'soil association', 'natrue',
      'peta approved', 'vegan certified', 'vegan approved',
      'leather working group', 'lwg certified',
      'sa8000', 'wrap certified', 'bsci',
      'recycled claim standard', 'rcs', 'global recycled standard', 'grs'
    ];

    for (let cert of certifications) {
      if (lower.includes(cert)) {
        certs.add(cert);
      }
    }

    const certPattern = /(?:certified|certification|certificate)[\s:]*(by|with|as|from)?\s*([a-z0-9 -]+?)(?:\.|;|,|$|\n)/gi;
    const matches = lower.matchAll(certPattern);
    for (let match of matches) {
      const cert = match[2]?.trim();
      if (cert && cert.length > 2 && cert.length < 50) {
        certs.add(cert);
      }
    }

    return Array.from(certs);
  }

  function extractCareInstructions(text) {
    const lower = text.toLowerCase();
    const care = new Set();

    const careKeywords = [
      'machine wash', 'hand wash', 'dry clean', 'dry clean only',
      'do not bleach', 'bleach', 'non-chlorine bleach',
      'tumble dry', 'air dry', 'line dry', 'flat dry', 'drip dry',
      'iron', 'do not iron', 'low heat', 'medium heat', 'high heat',
      'wash cold', 'wash warm', 'wash hot',
      'gentle cycle', 'delicate cycle', 'normal cycle',
      'wash separately', 'wash with similar colors',
      'do not wring', 'do not twist'
    ];

    for (let instruction of careKeywords) {
      if (lower.includes(instruction)) {
        care.add(instruction);
      }
    }

    const carePattern = /(?:care|wash|washing|cleaning|maintenance)[:\-\s]*([^.;!?]{10,100}?)(?:\.|;|!|\?|$|\n)/gi;
    const matches = lower.matchAll(carePattern);
    for (let match of matches) {
      if (match[1]) {
        care.add(match[1].trim());
      }
    }

    return Array.from(care);
  }

  function extractMaterialSpecifications(text) {
    const lower = text.toLowerCase();
    const specs = new Set();

    const materialSpecKeywords = [
      'thread count', 'gsm', 'weight', 'thickness', 'denier',
      'breathable', 'water resistant', 'waterproof', 'windproof',
      'moisture wicking', 'quick dry', 'anti-microbial',
      'uv protection', 'upf', 'thermal', 'insulated',
      'stretch', 'stretchable', 'flexible', 'elastic',
      'durable', 'tear resistant', 'abrasion resistant',
      'biodegradable', 'compostable', 'recyclable',
      'hypoallergenic', 'non-toxic', 'chemical-free',
      'unlined', 'lined', 'padded'
    ];

    for (let spec of materialSpecKeywords) {
      if (lower.includes(spec)) {
        const regex = new RegExp(`([^.;!?]{0,50}${spec}[^.;!?]{0,50})`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          matches.forEach(m => {
            const cleaned = clean(m);
            if (cleaned.length < 100) specs.add(cleaned);
          });
        }
      }
    }

    return Array.from(specs);
  }

  function filterMaterialDescription(fullDesc) {
    const sentences = fullDesc.split(/[.;!?]+/).map(s => s.trim());
    const materialSentences = [];

    const materialIndicators = [
      'material', 'fabric', 'made', 'composition', 'fiber', 'textile',
      'cotton', 'polyester', 'nylon', 'leather', 'wool', 'silk',
      'organic', 'recycled', 'sustainable', 'eco', 'biodegradable',
      'quality', 'durable', 'soft', 'comfortable', 'breathable',
      'certified', 'certification', 'standard', 'pu', 'faux'
    ];

    for (let sentence of sentences) {
      const lower = sentence.toLowerCase();
      if (materialIndicators.some(indicator => lower.includes(indicator))) {
        if (sentence.length > 10 && sentence.length < 200) {
          materialSentences.push(sentence);
        }
      }
    }

    return materialSentences;
  }

  // ===========================
  // NEW: PRIORITIZE ECO MATERIALS
  // ===========================
  function prioritizeEcoMaterials(materials) {
    const ecoKeywords = ['organic', 'recycled', 'sustainable', 'eco', 'natural', 'biodegradable',
      'vegan', 'hemp', 'bamboo', 'tencel', 'lyocell', 'modal', 'cork',
      'pinatex', 'mycelium', 'peace silk', 'econyl', 'rpet'];
    const nonEcoKeywords = ['pu', 'polyurethane', 'faux leather', 'synthetic', 'plastic',
      'acrylic', 'polyester', 'nylon', 'vinyl'];

    const ecoMaterials = [];
    const nonEcoMaterials = [];
    const neutralMaterials = [];

    materials.forEach(mat => {
      const lower = mat.toLowerCase();
      if (ecoKeywords.some(kw => lower.includes(kw))) {
        ecoMaterials.push(mat);
      } else if (nonEcoKeywords.some(kw => lower.includes(kw))) {
        nonEcoMaterials.push(mat);
      } else {
        neutralMaterials.push(mat);
      }
    });

    return { ecoMaterials, nonEcoMaterials, neutralMaterials };
  }

  // ===========================
  // SITE-SPECIFIC EXTRACTORS
  // ===========================

  const extractors = [
    // ---------- AMAZON ----------
    {
      match: host => host.includes('amazon.'),
      get: () => {
        const title = clean(document.querySelector('#productTitle')?.innerText || '');

        const allText = [];

        const selectors = [
          '#feature-bullets ul li',
          '#productDescription p',
          '#aplus .aplus-module',
          '#productDetails_techSpec_section_1 tr',
          '#productDetails_detailBullets_sections1 tr',
          '.detail-bullet-list li'
        ];

        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            const text = clean(el.innerText);
            if (text) allText.push(text);
          });
        });

        const fullText = allText.join(' ');

        return {
          title,
          fullText,
          materials: extractMaterialInfo(fullText),
          certifications: extractCertifications(fullText),
          care: extractCareInstructions(fullText),
          specs: extractMaterialSpecifications(fullText),
          materialDesc: filterMaterialDescription(fullText)
        };
      }
    },

    // ---------- FLIPKART ----------
    {
      match: host => host.includes('flipkart.'),
      get: () => {
        console.log("🔵 FLIPKART Extractor Running");

        const titleSelectors = [
          'span.VU-ZEz',
          'span.B_NuCI',
          'h1.yhB1nd',
          'h1._35KyD6',
          'h1',
          '[class*="title"]'
        ];
        let title = '';
        for (let sel of titleSelectors) {
          const el = document.querySelector(sel);
          if (el && el.innerText.trim()) {
            title = clean(el.innerText);
            console.log(`✓ Title found with selector: ${sel}`);
            break;
          }
        }

        const allText = [];

        const detailSelectors = [
          'table.table-bordered tbody tr',
          'table tr',
          'div[class*="row"] div[class*="col"]',
          'div._1mXcCf',
          'div._2d4LTz',
          'div._3WHvuP',
          'li._2-N8zT',
          'ul._1xgFaf li',
          'div[class*="specs"]',
          'div[class*="detail"]',
          'div[class*="description"]'
        ];

        detailSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            const text = clean(el.innerText);
            if (text && text.length > 5) {
              allText.push(text);
              console.log(`📄 Extracted from ${selector}: ${text.substring(0, 80)}`);
            }
          });
        });

        document.querySelectorAll('table td, table th').forEach(cell => {
          const text = clean(cell.innerText);
          if (text && text.length > 2) {
            allText.push(text);
          }
        });

        const pageText = document.body.innerText;
        const keywordPattern = /(fabric|material|composition|care|wash)[:\s]+([^\n]{10,100})/gi;
        const matches = pageText.matchAll(keywordPattern);
        for (let match of matches) {
          allText.push(`${match[1]}: ${match[2]}`);
        }

        document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
          try {
            const json = JSON.parse(script.textContent);
            if (json.description) allText.push(json.description);
            if (json.material) allText.push(`Material: ${json.material}`);
          } catch (e) { }
        });

        const fullText = allText.join(' ');
        console.log(`📦 Total text extracted: ${fullText.length} characters`);

        return {
          title,
          fullText,
          materials: extractMaterialInfo(fullText),
          certifications: extractCertifications(fullText),
          care: extractCareInstructions(fullText),
          specs: extractMaterialSpecifications(fullText),
          materialDesc: filterMaterialDescription(fullText)
        };
      }
    },

    // ---------- MYNTRA ----------
    {
      match: host => host.includes('myntra.'),
      get: () => {
        const title = clean(
          document.querySelector('h1.pdp-title')?.innerText ||
          document.querySelector('h1')?.innerText
        );

        const allText = [];

        document.querySelectorAll('h4,.index-title').forEach(h => {
          if (/material|fabric|care|composition/i.test(h.innerText)) {
            let el = h.nextElementSibling;
            let i = 0;
            while (el && i < 5) {
              allText.push(clean(el.innerText));
              el = el.nextElementSibling;
              i++;
            }
          }
        });

        document.querySelectorAll('ul li').forEach(li => {
          const t = clean(li.innerText.toLowerCase());
          if (t.includes('cotton') || t.includes('polyester') || t.includes('linen'))
            allText.push(t);
        });

        const text = allText.join(' ');

        return {
          title,
          fullText: text,
          materials: extractMaterialInfo(text),
          certifications: extractCertifications(text),
          care: extractCareInstructions(text),
          specs: extractMaterialSpecifications(text),
          materialDesc: filterMaterialDescription(text)
        };
      }
    }
  ];
  // ---------- IMPROVED API CALL ----------
  async function runPrediction(product, popup) {
    console.log("🔍 Extracted Material Data:", product);

    if (!product.title || product.title.length < 3) {
      popup.querySelector('#eco-body').innerHTML =
        "⚠️ Could not extract product information.<br>Try scrolling or refreshing the page.";
      return;
    }

    // CRITICAL: Prioritize and structure material data
    const { ecoMaterials, nonEcoMaterials, neutralMaterials } = prioritizeEcoMaterials(product.materials);

    // Build CLEAN, focused text emphasizing key materials
    const materialParts = [];

    // 1. Core materials - most important
    if (ecoMaterials.length > 0) {
      materialParts.push(`Eco-friendly materials: ${ecoMaterials.slice(0, 5).join(', ')}`);
    }
    if (nonEcoMaterials.length > 0) {
      materialParts.push(`Synthetic materials: ${nonEcoMaterials.slice(0, 5).join(', ')}`);
    }
    if (neutralMaterials.length > 0) {
      materialParts.push(`Other materials: ${neutralMaterials.slice(0, 3).join(', ')}`);
    }

    // 2. Certifications - strong eco indicator
    if (product.certifications.length > 0) {
      materialParts.push(`Certifications: ${product.certifications.join(', ')}`);
    }

    // 3. Relevant material descriptions (limited to avoid noise)
    if (product.materialDesc.length > 0) {
      const relevantDesc = product.materialDesc
        .filter(desc => desc.length < 150)
        .slice(0, 2)
        .join('. ');
      if (relevantDesc) {
        materialParts.push(`Material details: ${relevantDesc}`);
      }
    }

    // 4. Product title for context
    materialParts.unshift(`Product: ${product.title}`);

    // Join with clear separators
    const materialText = materialParts.join(' | ');

    // Log what's being sent
    console.log("📦 Sending CLEAN data to API:");
    console.log("  - Eco materials:", ecoMaterials.length);
    console.log("  - Non-eco materials:", nonEcoMaterials.length);
    console.log("  - Text length:", materialText.length);
    console.log("  - Full text:", materialText);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: materialText })
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();

      console.log("✅ API Response:", data);

      const keywordsHTML = data.important_keywords?.length
        ? `<div style="margin:8px 0;padding:6px;background:rgba(0,0,0,0.15);border-radius:6px;"><b>🔑 Key Terms:</b><br><small>${data.important_keywords.slice(0, 6).map(k => `${k.word} (${k.score.toFixed(2)})`).join(', ')}</small></div>`
        : '';

      const probsHTML = data.class_probabilities
        ? `<small style="opacity:0.8;">Not Eco: ${data.class_probabilities.not_eco}% | Moderate: ${data.class_probabilities.moderate}% | Eco: ${data.class_probabilities.eco}%</small><br>`
        : '';

      popup.querySelector('#eco-body').innerHTML = `
        <div style="margin-bottom:10px;padding:10px;background:rgba(255,255,255,0.12);border-radius:8px;">
          <b>🏷️ Classification:</b> <span style="font-size:16px;font-weight:bold;color:#a0f0a0;">${data.label}</span><br>
          <b>📊 Confidence:</b> ${data.confidence}%<br>
          ${probsHTML}
        </div>
        ${keywordsHTML}
        ${ecoMaterials.length ? `<div style="margin:8px 0;padding:6px;background:rgba(0,200,0,0.15);border-radius:6px;border-left:3px solid #00ff00;"><b>🌿 Eco Materials:</b><br><small>${ecoMaterials.slice(0, 6).join(', ')}</small></div>` : ''}
        ${nonEcoMaterials.length ? `<div style="margin:8px 0;padding:6px;background:rgba(200,0,0,0.15);border-radius:6px;border-left:3px solid #ff6666;"><b>⚠️ Synthetic Materials:</b><br><small>${nonEcoMaterials.slice(0, 6).join(', ')}</small></div>` : ''}
        ${neutralMaterials.length ? `<div style="margin:8px 0;padding:6px;background:rgba(0,0,0,0.15);border-radius:6px;"><b>🧵 Other Materials:</b><br><small>${neutralMaterials.slice(0, 4).join(', ')}</small></div>` : ''}
        ${product.certifications.length ? `<div style="margin:8px 0;padding:6px;background:rgba(0,128,0,0.15);border-radius:6px;"><b>✅ Certifications:</b><br><small>${product.certifications.join(', ')}</small></div>` : ''}
        ${product.care.length ? `<div style="margin:8px 0;padding:6px;background:rgba(0,0,0,0.15);border-radius:6px;"><b>🧺 Care:</b><br><small>${product.care.slice(0, 3).join('; ')}</small></div>` : ''}
        ${data.reasons?.length ? `<div style="margin-top:10px;padding:8px;background:rgba(0,0,0,0.25);border-radius:6px;border-left:3px solid rgba(255,255,255,0.3);"><small><b>💡 Analysis:</b><br>${data.reasons.join('; ')}</small></div>` : ''}
        <small style="color:#ddd;margin-top:10px;display:block;opacity:0.6;font-size:11px;">${product.title.slice(0, 70)}...</small>
      `;

      console.log("✅ Analysis complete:", data);
    } catch (err) {
      console.error("❌ API error:", err);
      popup.querySelector('#eco-body').innerHTML = `
        <div style="color:#ffcccc;padding:10px;background:rgba(255,0,0,0.1);border-radius:8px;">
          ❌ <b>Error:</b> ${err.message}<br>
          <small>Please check if the API server is running at:<br>${API_URL}</small>
        </div>
      `;
    }
  }

  // ---------- RETRY MECHANISM ----------
  function waitForProductAndRun(attempt = 0) {
    const popup = createPopup();
    const extractor = extractors.find(e => e.match(window.location.hostname)) ||
      { get: genericExtractor };
    const product = extractor.get();

    console.log(`🔍 Attempt ${attempt + 1}: Materials found: ${product.materials.length}, Title: "${product.title?.substring(0, 50)}"`);

    if ((!product.title || product.title.length < 3 || product.materials.length === 0) && attempt < 15) {
      console.log(`⏳ Waiting for content (${attempt + 1}/15)...`);
      popup.querySelector('#eco-body').innerText = `⏳ Loading product data... (${attempt + 1}/15)`;
      setTimeout(() => waitForProductAndRun(attempt + 1), 2000);
      return;
    }

    if (!product.title || product.title.length < 3) {
      popup.querySelector('#eco-body').innerHTML =
        "⚠️ Could not find product information.<br><small>This page might not be a product page.</small>";
      return;
    }

    runPrediction(product, popup);
  }

  // ---------- OBSERVER ----------
  const observer = new MutationObserver((mutations, obs) => {
    const hasContent = document.querySelector('h1') ||
      document.querySelector('span.B_NuCI') ||
      document.querySelector('span.VU-ZEz') ||
      document.querySelector('#productTitle') ||
      document.querySelector('.pdp-title') ||
      document.querySelector('table');

    if (hasContent) {
      console.log("✓ Content detected, starting extraction...");
      obs.disconnect();
      setTimeout(() => waitForProductAndRun(), 1500);
    }
  });

  observer.observe(document, { childList: true, subtree: true });

  // Safety trigger
  setTimeout(() => {
    console.log("⏰ Safety timeout triggered");
    waitForProductAndRun();
  }, 4000);
})();


