// /*(async function() {
//   const API_URL = "https://luteotropic-aglimmer-rachelle.ngrok-free.dev/predict"; 

//   function createPopup() {
//     let existing = document.getElementById('eco-popup-widget');
//     if (existing) existing.remove();

//     const popup = document.createElement('div');
//     popup.id = 'eco-popup-widget';
//     popup.style.cssText = `
//       position: fixed; right: 20px; bottom: 20px; z-index: 999999;
//       width: 320px; backdrop-filter: blur(10px);
//       background: rgba(255, 255, 255, 0.15);
//       border: 1px solid rgba(255, 255, 255, 0.3);
//       border-radius: 16px; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
//       padding: 16px; color: #fff; font-family: 'Poppins', sans-serif;
//       font-size: 13px; line-height: 1.5;
//       background-image: linear-gradient(135deg, rgba(63,94,251,0.3), rgba(252,70,107,0.3));
//       transition: all 0.3s ease; animation: popupFadeIn 0.6s ease;
//     `;

//     popup.innerHTML = `
//       <style>
//         @keyframes popupFadeIn {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         #eco-popup-widget button:hover {
//           background: rgba(255,255,255,0.2);
//           transform: scale(1.05);
//         }
//       </style>
//       <div style="display:flex;justify-content:space-between;align-items:center;">
//         <div style="font-weight:600;font-size:15px;">🌱 Eco-Friendly Assistant</div>
//         <button id="eco-close" style="background:transparent;border:none;color:white;font-weight:bold;cursor:pointer;font-size:14px;">✕</button>
//       </div>
//       <div id="eco-body" style="margin-top:8px;font-size:13px;">Analyzing product...</div>
//     `;

//     document.body.appendChild(popup);
//     popup.querySelector('#eco-close').onclick = () => popup.remove();
//     return popup;
//   }

//   function clean(t) {
//     return (t || "").replace(/\s+/g, ' ').trim();
//   }

//   // ✅ IMPROVED: Extract materials and certifications (no hardcoded eco keywords)
//   function extractEnhancedInfo(bodyText) {
//     const lower = bodyText.toLowerCase();
    
//     // Materials
//     const materials = [];
//     const materialPatterns = [
//       /(?:material|fabric|made (?:of|from|with)|composition|content)[:\-\s]*([a-z0-9 ,%&]+?)(?:\.|;|,(?!\s*\d)|$)/gi,
//       /(\d+%\s*[a-z]+)/gi, // "100% cotton"
//       /(organic|recycled|biodegradable|sustainable|bamboo|jute|hemp|cotton|polyester|plastic|nylon|synthetic)\s+(?:material|fabric|fiber)?/gi
//     ];
    
//     materialPatterns.forEach(pattern => {
//       const matches = lower.match(pattern);
//       if (matches) materials.push(...matches);
//     });

//     // Certifications
//     const certifications = [];
//     const certPatterns = [
//       /(?:certified|certification|certificate)[:\-\s]*([a-z0-9 ,-]+?)(?:\.|;|$)/gi,
//       /(fsc|gots|oeko-tex|fair trade|organic certified|cradle to cradle|b corp)/gi
//     ];
    
//     certPatterns.forEach(pattern => {
//       const matches = lower.match(pattern);
//       if (matches) certifications.push(...matches);
//     });

//     return {
//       materials: [...new Set(materials)].join('; '),
//       certifications: [...new Set(certifications)].join('; ')
//     };
//   }

//   // ===========================
//   // IMPROVED SITE-SPECIFIC EXTRACTORS
//   // ===========================

//   const extractors = [
//     // ---------- AMAZON (IMPROVED) ----------
//     {
//       match: host => host.includes('amazon.'),
//       get: () => {
//         // Product page
//         const title = clean(document.querySelector('#productTitle')?.innerText);
        
//         if (title && title.length > 3) {
//           // Get ALL possible description sources
//           const desc = [
//             document.querySelector('#feature-bullets')?.innerText,
//             document.querySelector('#productDescription')?.innerText,
//             document.querySelector('#aplus')?.innerText, // A+ Content
//             document.querySelector('.a-section.a-spacing-medium')?.innerText
//           ].filter(Boolean).map(clean).join(' ; ');

//           // Get ALL specification tables
//           const specs = [
//             ...document.querySelectorAll('#productDetails_techSpec_section_1 tr'),
//             ...document.querySelectorAll('#productDetails_detailBullets_sections1 tr'),
//             ...document.querySelectorAll('.prodDetTable tr'),
//             ...document.querySelectorAll('#detailBullets_feature_div li')
//           ].map(el => clean(el.innerText)).join(' ; ');

//           // Additional info from meta tags
//           const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
          
//           return { 
//             title, 
//             desc: desc + ' ' + metaDesc, 
//             specs 
//           };
//         }

//         // Search results
//         const firstResult = document.querySelector('div[data-component-type="s-search-result"]');
//         if (firstResult) {
//           const title = clean(firstResult.querySelector('h2 a span')?.innerText);
//           const snippet = clean(firstResult.querySelector('.a-row .a-size-base')?.innerText || '');
//           return { title, desc: snippet, specs: '' };
//         }

//         return { title: document.title, desc: '', specs: '' };
//       }
//     },

//     // ---------- FLIPKART (IMPROVED) ----------
//     {
//       match: host => host.includes('flipkart.'),
//       get: () => {
//         const title = clean(
//           document.querySelector('span.B_NuCI')?.innerText ||
//           document.querySelector('h1.yhB1nd')?.innerText ||
//           document.querySelector('h1')?.innerText ||
//           ''
//         );

//         // Get ALL description sources
//         const desc = [
//           ...document.querySelectorAll('div._1mXcCf'),
//           ...document.querySelectorAll('div._2d4LTz'),
//           ...document.querySelectorAll('div._1AN87F'),
//           ...document.querySelectorAll('div._3WHvuP'), // Product highlights
//           ...document.querySelectorAll('div._2418kt'), // Features
//           document.querySelector('div._3WHvuP')
//         ].filter(Boolean).map(el => clean(el.innerText)).join(' ; ');

//         // Get ALL specification tables
//         const specs = [
//           ...document.querySelectorAll('table._14cfVK tr'),
//           ...document.querySelectorAll('table._3ENrHu tr'),
//           ...document.querySelectorAll('div._3k-BhJ') // Specification rows
//         ].map(el => clean(el.innerText)).join(' ; ');

//         // JSON-LD fallback
//         let jsonData = '';
//         const jsonNode = document.querySelector('script[type="application/ld+json"]');
//         if (jsonNode) {
//           try {
//             const data = JSON.parse(jsonNode.textContent);
//             jsonData = [
//               data.description,
//               data.brand?.name,
//               data.color,
//               data.material,
//               data.offers?.description
//             ].filter(Boolean).join(' ; ');
//           } catch (e) {
//             console.warn('LD+JSON parse failed', e);
//           }
//         }

//         return {
//           title: title,
//           desc: (desc + ' ' + jsonData).trim(),
//           specs: specs
//         };
//       }
//     },

//     // ---------- MYNTRA (IMPROVED) ----------
//     {
//       match: host => host.includes('myntra.'),
//       get: () => {
//         const title = clean(
//           document.querySelector('h1.pdp-title')?.innerText ||
//           document.querySelector('h1.pdp-name')?.innerText
//         );

//         // Get ALL description sources
//         const desc = [
//           document.querySelector('.pdp-description-container')?.innerText,
//           document.querySelector('.pdp-product-description-content')?.innerText,
//           document.querySelector('.pdp-product-description')?.innerText,
//           document.querySelector('.index-description')?.innerText
//         ].filter(Boolean).map(clean).join(' ; ');

//         // Get specifications
//         const specs = [
//           ...document.querySelectorAll('.index-tableContainer td'),
//           ...document.querySelectorAll('.pdp-specs-table td'),
//           ...document.querySelectorAll('.index-rowKey'),
//           ...document.querySelectorAll('.index-rowValue')
//         ].map(el => clean(el.innerText)).join(' ; ');

//         return { title, desc, specs };
//       }
//     }
//   ];

//   // ---------- Enhanced Fallback ----------
//   function genericExtractor() {
//     const title = clean(
//       document.querySelector('h1')?.innerText || 
//       document.querySelector('[itemprop="name"]')?.innerText ||
//       document.title
//     );
    
//     const desc = clean(
//       document.querySelector('meta[name="description"]')?.content ||
//       document.querySelector('[itemprop="description"]')?.innerText ||
//       ''
//     );
    
//     const specs = clean(
//       Array.from(document.querySelectorAll('table tr, dl, .specifications li'))
//         .map(e => e.innerText)
//         .join('; ')
//     );
    
//     return { title, desc, specs };
//   }

//   // ---------- Send to API ----------
//   async function runPrediction(product, popup) {
//     const fullText = [product.title, product.desc, product.specs]
//       .filter(Boolean)
//       .join(' ; ');
    
//     const bodyText = document.body.innerText;
//     const enhanced = extractEnhancedInfo(bodyText);

//     console.log("🧩 Extracted product:", product);
//     console.log("📦 Enhanced info:", enhanced);

//     if (!fullText || fullText.trim().length < 10) {
//       popup.querySelector('#eco-body').innerHTML = 
//         "⚠️ Product data not fully loaded.<br>Try scrolling or refresh the page.";
//       return;
//     }

//     // Combine everything for better prediction
//     const enrichedText = [
//       fullText,
//       enhanced.materials,
//       enhanced.certifications,
//       enhanced.ecoKeywords
//     ].filter(Boolean).join(' ; ');

//     try {
//       const response = await fetch(API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text: enrichedText })
//       });

//       if (!response.ok) throw new Error(`API returned ${response.status}`);

//       const data = await response.json();
      
//       popup.querySelector('#eco-body').innerHTML = `
//         <div style="margin-bottom:8px;">
//           <b>Label:</b> <span style="font-size:14px;">${data.label}</span><br>
//           <b>Confidence:</b> ${data.confidence}%
//         </div>
//         ${enhanced.materials ? `<b>Materials:</b> ${enhanced.materials.slice(0, 80)}...<br>` : ''}
//         ${enhanced.certifications ? `<b>Certifications:</b> ${enhanced.certifications}<br>` : ''}
//         ${enhanced.ecoKeywords ? `<b>Eco Keywords:</b> ${enhanced.ecoKeywords}<br>` : ''}
//         ${data.reasons?.length ? `<small><i>${data.reasons.join(', ')}</i></small><br>` : ''}
//         <small style="color:#ddd;margin-top:6px;display:block;">${product.title.slice(0, 50)}...</small>
//       `;
      
//       console.log("✅ Prediction:", data);
//     } catch (err) {
//       console.error("❌ API error:", err);
//       popup.querySelector('#eco-body').innerText = `Error: ${err.message}`;
//     }
//   }

//   // ---------- Retry Mechanism ----------
//   function waitForProductAndRun(attempt = 0) {
//     const popup = createPopup();
//     const extractor = extractors.find(e => e.match(window.location.hostname)) || 
//                      { get: genericExtractor };
//     const product = extractor.get();

//     if ((!product.title || product.title.length < 3) && attempt < 10) {
//       console.log(`⏳ Waiting for content (${attempt + 1}/10)...`);
//       setTimeout(() => waitForProductAndRun(attempt + 1), 1500);
//       return;
//     }

//     runPrediction(product, popup);
//   }

//   // ---------- Observer ----------
//   const observer = new MutationObserver((mutations, obs) => {
//     if (document.querySelector('h1') || 
//         document.querySelector('span.B_NuCI') || 
//         document.querySelector('#productTitle')) {
//       obs.disconnect();
//       waitForProductAndRun();
//     }
//   });
  
//   observer.observe(document, { childList: true, subtree: true });

//   // Safety trigger
//   setTimeout(waitForProductAndRun, 2500);
// })();

// (async function() {
//   const API_URL = "https://luteotropic-aglimmer-rachelle.ngrok-free.dev/predict"; 

//   function createPopup() {
//     let existing = document.getElementById('eco-popup-widget');
//     if (existing) existing.remove();

//     const popup = document.createElement('div');
//     popup.id = 'eco-popup-widget';
//     popup.style.cssText = `
//       position: fixed; right: 20px; bottom: 20px; z-index: 999999;
//       width: 340px; max-height: 500px; overflow-y: auto;
//       backdrop-filter: blur(10px);
//       background: rgba(255, 255, 255, 0.15);
//       border: 1px solid rgba(255, 255, 255, 0.3);
//       border-radius: 16px; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
//       padding: 16px; color: #fff; font-family: 'Poppins', sans-serif;
//       font-size: 13px; line-height: 1.5;
//       background-image: linear-gradient(135deg, rgba(63,94,251,0.3), rgba(252,70,107,0.3));
//       transition: all 0.3s ease; animation: popupFadeIn 0.6s ease;
//     `;

//     popup.innerHTML = `
//       <style>
//         @keyframes popupFadeIn {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         #eco-popup-widget button:hover {
//           background: rgba(255,255,255,0.2);
//           transform: scale(1.05);
//         }
//         #eco-popup-widget::-webkit-scrollbar {
//           width: 6px;
//         }
//         #eco-popup-widget::-webkit-scrollbar-thumb {
//           background: rgba(255,255,255,0.3);
//           border-radius: 3px;
//         }
//       </style>
//       <div style="display:flex;justify-content:space-between;align-items:center;">
//         <div style="font-weight:600;font-size:15px;">🌱 Eco Assistant</div>
//         <button id="eco-close" style="background:transparent;border:none;color:white;font-weight:bold;cursor:pointer;font-size:14px;">✕</button>
//       </div>
//       <div id="eco-body" style="margin-top:8px;font-size:13px;">🔍 Deep scanning product data...</div>
//     `;

//     document.body.appendChild(popup);
//     popup.querySelector('#eco-close').onclick = () => popup.remove();
//     return popup;
//   }

//   function clean(t) {
//     return (t || "").replace(/\s+/g, ' ').trim();
//   }

//   // ===========================
//   // DEEP MATERIAL & DESCRIPTION EXTRACTION
//   // ===========================

//   function deepMaterialExtraction(text) {
//     const lower = text.toLowerCase();
//     const materials = new Set();
    
//     // Pattern 1: "Material: Cotton" or "Fabric: Polyester"
//     const pattern1 = /(?:material|fabric|composition|content|made of|made from|made with|crafted from)[:\-\s]*([a-z0-9 ,%&]+?)(?:\.|;|<br|$|\n)/gi;
//     let matches = lower.matchAll(pattern1);
//     for (let match of matches) {
//       if (match[1]) materials.add(match[1].trim());
//     }
    
//     // Pattern 2: Percentages "100% Cotton", "80% Polyester"
//     const pattern2 = /(\d+%?\s*[a-z]+(?:\s+[a-z]+)?)/gi;
//     matches = lower.matchAll(pattern2);
//     for (let match of matches) {
//       materials.add(match[1].trim());
//     }
    
//     // Pattern 3: Common materials standalone
//     const commonMaterials = [
//       'cotton', 'polyester', 'nylon', 'spandex', 'leather', 'suede',
//       'silk', 'wool', 'linen', 'denim', 'canvas', 'fleece',
//       'organic cotton', 'recycled polyester', 'bamboo', 'jute', 
//       'hemp', 'modal', 'tencel', 'lyocell', 'rayon', 'viscose',
//       'plastic', 'synthetic', 'artificial leather', 'faux leather',
//       'pu leather', 'genuine leather', 'real leather', 'metal',
//       'aluminum', 'stainless steel', 'wood', 'ceramic', 'glass',
//       'rubber', 'eva', 'tpr', 'mesh fabric'
//     ];
    
//     for (let mat of commonMaterials) {
//       const regex = new RegExp(`\\b${mat}\\b`, 'i');
//       if (regex.test(lower)) {
//         materials.add(mat);
//       }
//     }
    
//     // Pattern 4: "Outer: Cotton, Inner: Polyester"
//     const pattern4 = /(?:outer|inner|lining|shell|surface|upper|sole|base|top|bottom)[:\-\s]*([a-z0-9 ,]+?)(?:\.|;|$|\n)/gi;
//     matches = lower.matchAll(pattern4);
//     for (let match of matches) {
//       if (match[1]) materials.add(match[1].trim());
//     }
    
//     return Array.from(materials);
//   }

//   function deepCertificationExtraction(text) {
//     const lower = text.toLowerCase();
//     const certs = new Set();
    
//     // Certification patterns
//     const certKeywords = [
//       'fsc certified', 'fsc', 'gots', 'oeko-tex', 'oeko tex',
//       'fair trade', 'fairtrade', 'organic certified', 
//       'usda organic', 'eu organic', 'cradle to cradle',
//       'bluesign', 'global organic textile', 'b corp',
//       'carbon neutral', 'climate neutral', 'rainforest alliance',
//       'ecocert', 'soil association', 'natrue'
//     ];
    
//     for (let cert of certKeywords) {
//       if (lower.includes(cert)) {
//         certs.add(cert);
//       }
//     }
    
//     // Pattern: "Certified by XYZ"
//     const pattern = /certified\s+(?:by|with|as)\s+([a-z0-9 -]+?)(?:\.|;|,|$)/gi;
//     const matches = lower.matchAll(pattern);
//     for (let match of matches) {
//       if (match[1]) certs.add(match[1].trim());
//     }
    
//     return Array.from(certs);
//   }

//   function extractCareInstructions(text) {
//     const lower = text.toLowerCase();
//     const care = [];
    
//     const carePatterns = [
//       /(?:care|wash|washing|cleaning)[:\-\s]*([^\.;]+?)(?:\.|;|$)/gi,
//       /(machine wash|hand wash|dry clean|do not bleach|tumble dry|air dry|iron)/gi
//     ];
    
//     carePatterns.forEach(pattern => {
//       const matches = lower.matchAll(pattern);
//       for (let match of matches) {
//         care.push(match[1] || match[0]);
//       }
//     });
    
//     return care.length > 0 ? Array.from(new Set(care)).join(', ') : '';
//   }

//   // ===========================
//   // ENHANCED SITE-SPECIFIC EXTRACTORS
//   // ===========================

//   const extractors = [
//     // ---------- AMAZON (COMPLETE EXTRACTION) ----------
//     {
//       match: host => host.includes('amazon.'),
//       get: () => {
//         const data = {
//           title: '',
//           description: [],
//           specifications: [],
//           materials: [],
//           features: [],
//           details: []
//         };

//         // Title
//         data.title = clean(document.querySelector('#productTitle')?.innerText);

//         // All description sources
//         const descSelectors = [
//           '#feature-bullets ul li',
//           '#productDescription p',
//           '#aplus .aplus-module p',
//           '#aplus3p-feature-div',
//           '.a-section.a-spacing-medium',
//           '#bookDescription_feature_div',
//           '.product-description'
//         ];
        
//         descSelectors.forEach(selector => {
//           document.querySelectorAll(selector).forEach(el => {
//             const text = clean(el.innerText);
//             if (text && text.length > 10) data.description.push(text);
//           });
//         });

//         // Technical specifications
//         const specSelectors = [
//           '#productDetails_techSpec_section_1 tr',
//           '#productDetails_detailBullets_sections1 tr',
//           '.prodDetTable tr',
//           '#detailBullets_feature_div li',
//           '.detail-bullet-list li',
//           '#tech-spec-table tr'
//         ];
        
//         specSelectors.forEach(selector => {
//           document.querySelectorAll(selector).forEach(el => {
//             const text = clean(el.innerText);
//             if (text) data.specifications.push(text);
//           });
//         });

//         // Additional details from various sections
//         document.querySelectorAll('[class*="detail"], [class*="spec"], [id*="detail"]').forEach(el => {
//           const text = clean(el.innerText);
//           if (text && text.length > 20 && text.length < 500) {
//             data.details.push(text);
//           }
//         });

//         // Meta description
//         const metaDesc = document.querySelector('meta[name="description"]')?.content;
//         if (metaDesc) data.description.push(clean(metaDesc));

//         // Combine all text for material extraction
//         const allText = [
//           data.title,
//           ...data.description,
//           ...data.specifications,
//           ...data.details
//         ].join(' ');
        
//         data.materials = deepMaterialExtraction(allText);
//         data.certifications = deepCertificationExtraction(allText);
//         data.careInstructions = extractCareInstructions(allText);

//         return {
//           title: data.title,
//           desc: data.description.join(' ; '),
//           specs: data.specifications.join(' ; '),
//           materials: data.materials.join(', '),
//           certifications: data.certifications.join(', '),
//           care: data.careInstructions,
//           fullText: allText
//         };
//       }
//     },

//     // ---------- FLIPKART (COMPLETE EXTRACTION) ----------
//     {
//       match: host => host.includes('flipkart.'),
//       get: () => {
//         const data = {
//           title: '',
//           description: [],
//           specifications: [],
//           materials: [],
//           features: []
//         };

//         // Title - multiple selectors
//         const titleSelectors = ['span.B_NuCI', 'h1.yhB1nd', 'h1._35KyD6', 'h1'];
//         for (let sel of titleSelectors) {
//           const el = document.querySelector(sel);
//           if (el && el.innerText.trim()) {
//             data.title = clean(el.innerText);
//             break;
//           }
//         }

//         // Description sources
//         const descSelectors = [
//           'div._1mXcCf',
//           'div._2d4LTz',
//           'div._1AN87F',
//           'div._3WHvuP',
//           'div._2418kt',
//           'div._3k-BhJ',
//           'div._2RngUh p',
//           'div[class*="description"]',
//           'div[class*="feature"]'
//         ];
        
//         descSelectors.forEach(selector => {
//           document.querySelectorAll(selector).forEach(el => {
//             const text = clean(el.innerText);
//             if (text && text.length > 10) data.description.push(text);
//           });
//         });

//         // Specifications from tables
//         const specSelectors = [
//           'table._14cfVK tr',
//           'table._3ENrHu tr',
//           'div._3k-BhJ',
//           'div._2RngUh table tr',
//           'table[class*="spec"] tr'
//         ];
        
//         specSelectors.forEach(selector => {
//           document.querySelectorAll(selector).forEach(el => {
//             const text = clean(el.innerText);
//             if (text) data.specifications.push(text);
//           });
//         });

//         // Highlights section
//         document.querySelectorAll('li._2-N8zT, ul._1xgFaf li').forEach(el => {
//           const text = clean(el.innerText);
//           if (text) data.features.push(text);
//         });

//         // JSON-LD structured data
//         let jsonData = '';
//         document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
//           try {
//             const json = JSON.parse(script.textContent);
//             if (json.description) data.description.push(json.description);
//             if (json.brand?.name) data.description.push(`Brand: ${json.brand.name}`);
//             if (json.material) data.description.push(`Material: ${json.material}`);
//             if (json.color) data.description.push(`Color: ${json.color}`);
//           } catch (e) {}
//         });

//         // Combine all text
//         const allText = [
//           data.title,
//           ...data.description,
//           ...data.specifications,
//           ...data.features
//         ].join(' ');
        
//         data.materials = deepMaterialExtraction(allText);
//         data.certifications = deepCertificationExtraction(allText);
//         data.careInstructions = extractCareInstructions(allText);

//         return {
//           title: data.title,
//           desc: data.description.join(' ; '),
//           specs: data.specifications.join(' ; '),
//           materials: data.materials.join(', '),
//           certifications: data.certifications.join(', '),
//           care: data.careInstructions,
//           fullText: allText
//         };
//       }
//     },

//     // ---------- MYNTRA (COMPLETE EXTRACTION) ----------
//     {
//       match: host => host.includes('myntra.'),
//       get: () => {
//         const data = {
//           title: '',
//           description: [],
//           specifications: [],
//           materials: []
//         };

//         // Title
//         const titleSelectors = ['h1.pdp-title', 'h1.pdp-name', 'h1'];
//         for (let sel of titleSelectors) {
//           const el = document.querySelector(sel);
//           if (el) {
//             data.title = clean(el.innerText);
//             break;
//           }
//         }

//         // Description
//         const descSelectors = [
//           '.pdp-description-container',
//           '.pdp-product-description-content',
//           '.pdp-product-description',
//           '.index-description',
//           '.pdp-descriptors-container'
//         ];
        
//         descSelectors.forEach(selector => {
//           const el = document.querySelector(selector);
//           if (el) data.description.push(clean(el.innerText));
//         });

//         // Specifications
//         const specSelectors = [
//           '.index-tableContainer td',
//           '.pdp-specs-table td',
//           '.index-row',
//           '.index-rowKey',
//           '.index-rowValue'
//         ];
        
//         specSelectors.forEach(selector => {
//           document.querySelectorAll(selector).forEach(el => {
//             const text = clean(el.innerText);
//             if (text) data.specifications.push(text);
//           });
//         });

//         // Product details section
//         document.querySelectorAll('.pdp-product-details-item').forEach(el => {
//           data.specifications.push(clean(el.innerText));
//         });

//         const allText = [
//           data.title,
//           ...data.description,
//           ...data.specifications
//         ].join(' ');
        
//         data.materials = deepMaterialExtraction(allText);
//         data.certifications = deepCertificationExtraction(allText);
//         data.careInstructions = extractCareInstructions(allText);

//         return {
//           title: data.title,
//           desc: data.description.join(' ; '),
//           specs: data.specifications.join(' ; '),
//           materials: data.materials.join(', '),
//           certifications: data.certifications.join(', '),
//           care: data.careInstructions,
//           fullText: allText
//         };
//       }
//     }
//   ];

//   // ---------- Enhanced Generic Extractor ----------
//   function genericExtractor() {
//     const allText = document.body.innerText;
    
//     const title = clean(
//       document.querySelector('h1')?.innerText || 
//       document.querySelector('[itemprop="name"]')?.innerText ||
//       document.querySelector('meta[property="og:title"]')?.content ||
//       document.title
//     );
    
//     const desc = clean(
//       document.querySelector('meta[name="description"]')?.content ||
//       document.querySelector('meta[property="og:description"]')?.content ||
//       document.querySelector('[itemprop="description"]')?.innerText ||
//       ''
//     );
    
//     const materials = deepMaterialExtraction(allText);
//     const certifications = deepCertificationExtraction(allText);
//     const care = extractCareInstructions(allText);
    
//     return {
//       title,
//       desc,
//       specs: '',
//       materials: materials.join(', '),
//       certifications: certifications.join(', '),
//       care,
//       fullText: allText.substring(0, 5000) // Limit size
//     };
//   }

//   // ---------- Send to API ----------
//   async function runPrediction(product, popup) {
//     console.log("🧩 Extracted product data:", product);

//     if (!product.title || product.title.length < 3) {
//       popup.querySelector('#eco-body').innerHTML = 
//         "⚠️ Could not extract product information.<br>Try scrolling or refreshing the page.";
//       return;
//     }

//     // Comprehensive text for model
//     const enrichedText = [
//       `Title: ${product.title}`,
//       `Description: ${product.desc}`,
//       `Specifications: ${product.specs}`,
//       `Materials: ${product.materials}`,
//       `Certifications: ${product.certifications}`,
//       `Care: ${product.care}`
//     ].filter(s => s.split(':')[1]?.trim()).join(' | ');

//     console.log("📦 Sending to model (length: " + enrichedText.length + " chars)");

//     try {
//       const response = await fetch(API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text: enrichedText })
//       });

//       if (!response.ok) throw new Error(`API returned ${response.status}`);

//       const data = await response.json();
      
//       const keywordsHTML = data.important_keywords?.length
//         ? `<b>Key Terms:</b> ${data.important_keywords.slice(0, 5).map(k => k.word).join(', ')}<br>`
//         : '';
      
//       const probsHTML = data.class_probabilities
//         ? `<small>Not Eco: ${data.class_probabilities.not_eco}% | Moderate: ${data.class_probabilities.moderate}% | Eco: ${data.class_probabilities.eco}%</small><br>`
//         : '';
      
//       popup.querySelector('#eco-body').innerHTML = `
//         <div style="margin-bottom:10px;padding:8px;background:rgba(255,255,255,0.1);border-radius:8px;">
//           <b>Prediction:</b> <span style="font-size:15px;font-weight:bold;">${data.label}</span><br>
//           <b>Confidence:</b> ${data.confidence}%<br>
//           ${probsHTML}
//         </div>
//         ${keywordsHTML}
//         ${product.materials ? `<div style="margin:6px 0;"><b>🧵 Materials:</b><br><small>${product.materials.slice(0, 120)}${product.materials.length > 120 ? '...' : ''}</small></div>` : ''}
//         ${product.certifications ? `<div style="margin:6px 0;"><b>✅ Certifications:</b><br><small>${product.certifications}</small></div>` : ''}
//         ${product.care ? `<div style="margin:6px 0;"><b>🧺 Care:</b><br><small>${product.care.slice(0, 80)}...</small></div>` : ''}
//         ${data.reasons?.length ? `<div style="margin-top:8px;padding:6px;background:rgba(0,0,0,0.2);border-radius:6px;"><small><i>${data.reasons.join('; ')}</i></small></div>` : ''}
//         <small style="color:#ddd;margin-top:8px;display:block;opacity:0.7;">${product.title.slice(0, 60)}...</small>
//       `;
      
//       console.log("✅ Prediction complete:", data);
//     } catch (err) {
//       console.error("❌ API error:", err);
//       popup.querySelector('#eco-body').innerHTML = `
//         <div style="color:#ffcccc;">
//           ❌ Error: ${err.message}<br>
//           <small>Check if API is running</small>
//         </div>
//       `;
//     }
//   }

//   // ---------- Retry Mechanism ----------
//   function waitForProductAndRun(attempt = 0) {
//     const popup = createPopup();
//     const extractor = extractors.find(e => e.match(window.location.hostname)) || 
//                      { get: genericExtractor };
//     const product = extractor.get();

//     if ((!product.title || product.title.length < 3) && attempt < 12) {
//       console.log(`⏳ Waiting for content to load (${attempt + 1}/12)...`);
//       popup.querySelector('#eco-body').innerText = `⏳ Loading product data... (${attempt + 1}/12)`;
//       setTimeout(() => waitForProductAndRun(attempt + 1), 1500);
//       return;
//     }

//     if (!product.title || product.title.length < 3) {
//       popup.querySelector('#eco-body').innerHTML = 
//         "⚠️ Could not find product information.<br><small>This page might not be a product page.</small>";
//       return;
//     }

//     runPrediction(product, popup);
//   }

//   // ---------- Observer ----------
//   const observer = new MutationObserver((mutations, obs) => {
//     const hasContent = document.querySelector('h1') || 
//                       document.querySelector('span.B_NuCI') || 
//                       document.querySelector('#productTitle') ||
//                       document.querySelector('.pdp-title');
    
//     if (hasContent) {
//       obs.disconnect();
//       setTimeout(() => waitForProductAndRun(), 1000);
//     }
//   });
  
//   observer.observe(document, { childList: true, subtree: true });

//   // Safety trigger
//   setTimeout(() => waitForProductAndRun(), 3000);
// })();

// (async function() {
//   const API_URL = "https://luteotropic-aglimmer-rachelle.ngrok-free.dev/predict"; 

//   function createPopup() {
//     let existing = document.getElementById('eco-popup-widget');
//     if (existing) existing.remove();

//     const popup = document.createElement('div');
//     popup.id = 'eco-popup-widget';
//     popup.style.cssText = `
//       position: fixed; right: 20px; bottom: 20px; z-index: 999999;
//       width: 360px; max-height: 550px; overflow-y: auto;
//       backdrop-filter: blur(10px);
//       background: rgba(255, 255, 255, 0.15);
//       border: 1px solid rgba(255, 255, 255, 0.3);
//       border-radius: 16px; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
//       padding: 16px; color: #fff; font-family: 'Poppins', sans-serif;
//       font-size: 13px; line-height: 1.5;
//       background-image: linear-gradient(135deg, rgba(63,94,251,0.3), rgba(252,70,107,0.3));
//       transition: all 0.3s ease; animation: popupFadeIn 0.6s ease;
//     `;

//     popup.innerHTML = `
//       <style>
//         @keyframes popupFadeIn {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         #eco-popup-widget button:hover {
//           background: rgba(255,255,255,0.2);
//           transform: scale(1.05);
//         }
//         #eco-popup-widget::-webkit-scrollbar {
//           width: 6px;
//         }
//         #eco-popup-widget::-webkit-scrollbar-thumb {
//           background: rgba(255,255,255,0.3);
//           border-radius: 3px;
//         }
//       </style>
//       <div style="display:flex;justify-content:space-between;align-items:center;">
//         <div style="font-weight:600;font-size:15px;">🌱 Eco Material Analyzer</div>
//         <button id="eco-close" style="background:transparent;border:none;color:white;font-weight:bold;cursor:pointer;font-size:14px;">✕</button>
//       </div>
//       <div id="eco-body" style="margin-top:8px;font-size:13px;">🔍 Extracting material information...</div>
//     `;

//     document.body.appendChild(popup);
//     popup.querySelector('#eco-close').onclick = () => popup.remove();
//     return popup;
//   }

//   function clean(t) {
//     return (t || "").replace(/\s+/g, ' ').trim();
//   }

//   // ===========================
//   // ADVANCED MATERIAL EXTRACTION
//   // ===========================

//   function extractMaterialInfo(text) {
//     const lower = text.toLowerCase();
//     const materials = new Set();
    
//     // All known materials
//     const materialKeywords = [
//       'cotton', 'organic cotton', 'recycled cotton', 'pima cotton', 'egyptian cotton',
//       'polyester', 'recycled polyester', 'rPET', 'pet polyester',
//       'nylon', 'recycled nylon', 'econyl',
//       'spandex', 'elastane', 'lycra',
//       'leather', 'genuine leather', 'real leather', 'full grain leather', 'top grain leather',
//       'vegan leather', 'pu leather', 'faux leather', 'artificial leather', 'synthetic leather',
//       'suede', 'nubuck',
//       'silk', 'peace silk', 'organic silk',
//       'wool', 'merino wool', 'organic wool', 'recycled wool',
//       'cashmere', 'alpaca', 'mohair',
//       'linen', 'flax',
//       'denim', 'canvas', 'fleece',
//       'bamboo', 'bamboo fiber', 'bamboo viscose',
//       'jute', 'hemp', 'ramie',
//       'modal', 'tencel', 'lyocell', 'cupro',
//       'rayon', 'viscose',
//       'acrylic', 'polypropylene',
//       'rubber', 'natural rubber', 'latex',
//       'eva', 'tpr', 'tpu',
//       'mesh', 'mesh fabric', 'knit',
//       'metal', 'aluminum', 'aluminium', 'stainless steel', 'brass', 'copper',
//       'wood', 'reclaimed wood', 'fsc wood', 'bamboo wood',
//       'ceramic', 'porcelain', 'glass', 'recycled glass',
//       'plastic', 'recycled plastic', 'bioplastic', 'biodegradable plastic',
//       'cork', 'pinatex', 'mycelium', 'mushroom leather',
//       'down', 'feather', 'synthetic down'
//     ];
    
//     // Pattern 1: Direct material mentions with context
//     const contextPattern = /(?:material|fabric|composition|content|made of|made from|made with|crafted from|constructed from|shell|outer|inner|lining|sole|upper|insole|midsole|outsole)[:\-\s]*([^.;!?]+?)(?:\.|;|!|\?|<br|$|\n)/gi;
//     const matches1 = lower.matchAll(contextPattern);
//     for (let match of matches1) {
//       if (match[1]) {
//         const segment = match[1].trim();
//         // Extract materials from this segment
//         for (let mat of materialKeywords) {
//           if (segment.includes(mat)) {
//             materials.add(mat);
//           }
//         }
//         // Also add the whole segment if it's reasonably sized
//         if (segment.length < 100) {
//           materials.add(segment);
//         }
//       }
//     }
    
//     // Pattern 2: Percentages "100% Cotton", "80% Polyester, 20% Spandex"
//     const percentPattern = /(\d+%?\s*[a-z][a-z\s]+?)(?:,|\+|and|\||$)/gi;
//     const matches2 = lower.matchAll(percentPattern);
//     for (let match of matches2) {
//       const segment = match[1].trim();
//       if (segment.length < 50) {
//         materials.add(segment);
//       }
//     }
    
//     // Pattern 3: Material keywords appearing standalone
//     for (let mat of materialKeywords) {
//       const regex = new RegExp(`\\b${mat}\\b`, 'i');
//       if (regex.test(lower)) {
//         materials.add(mat);
//       }
//     }
    
//     // Pattern 4: Multi-layer composition "Outer: X, Inner: Y"
//     const layerPattern = /(?:outer|inner|lining|shell|surface|upper|sole|base|top|bottom|layer)[:\-\s]*([^.;!?]+?)(?:\.|;|!|\?|$|\n)/gi;
//     const matches4 = lower.matchAll(layerPattern);
//     for (let match of matches4) {
//       if (match[1] && match[1].length < 100) {
//         materials.add(match[1].trim());
//       }
//     }
    
//     return Array.from(materials).filter(m => m.length > 2);
//   }

//   function extractCertifications(text) {
//     const lower = text.toLowerCase();
//     const certs = new Set();
    
//     const certifications = [
//       'fsc certified', 'fsc', 'forest stewardship council',
//       'gots', 'global organic textile standard',
//       'oeko-tex', 'oeko tex', 'standard 100',
//       'fair trade', 'fairtrade', 'fair trade certified',
//       'organic certified', 'usda organic', 'eu organic', 'organic 100',
//       'cradle to cradle', 'c2c certified',
//       'bluesign', 'bluesign approved',
//       'b corp', 'b corporation', 'certified b corp',
//       'carbon neutral', 'carbon neutral certified',
//       'climate neutral', 'climate neutral certified',
//       'rainforest alliance', 'rainforest alliance certified',
//       'ecocert', 'soil association', 'natrue',
//       'peta approved', 'vegan certified', 'vegan approved',
//       'leather working group', 'lwg certified',
//       'sa8000', 'wrap certified', 'bsci',
//       'recycled claim standard', 'rcs', 'global recycled standard', 'grs'
//     ];
    
//     for (let cert of certifications) {
//       if (lower.includes(cert)) {
//         certs.add(cert);
//       }
//     }
    
//     // Pattern: "certified by/with/as X"
//     const certPattern = /(?:certified|certification|certificate)[\s:]*(by|with|as|from)?\s*([a-z0-9 -]+?)(?:\.|;|,|$|\n)/gi;
//     const matches = lower.matchAll(certPattern);
//     for (let match of matches) {
//       const cert = match[2]?.trim();
//       if (cert && cert.length > 2 && cert.length < 50) {
//         certs.add(cert);
//       }
//     }
    
//     return Array.from(certs);
//   }

//   function extractCareInstructions(text) {
//     const lower = text.toLowerCase();
//     const care = new Set();
    
//     const careKeywords = [
//       'machine wash', 'hand wash', 'dry clean', 'dry clean only',
//       'do not bleach', 'bleach', 'non-chlorine bleach',
//       'tumble dry', 'air dry', 'line dry', 'flat dry', 'drip dry',
//       'iron', 'do not iron', 'low heat', 'medium heat', 'high heat',
//       'wash cold', 'wash warm', 'wash hot',
//       'gentle cycle', 'delicate cycle', 'normal cycle',
//       'wash separately', 'wash with similar colors',
//       'do not wring', 'do not twist'
//     ];
    
//     // Extract care keywords
//     for (let instruction of careKeywords) {
//       if (lower.includes(instruction)) {
//         care.add(instruction);
//       }
//     }
    
//     // Pattern: "Care: ..." or "Wash: ..."
//     const carePattern = /(?:care|wash|washing|cleaning|maintenance)[:\-\s]*([^.;!?]{10,100}?)(?:\.|;|!|\?|$|\n)/gi;
//     const matches = lower.matchAll(carePattern);
//     for (let match of matches) {
//       if (match[1]) {
//         care.add(match[1].trim());
//       }
//     }
    
//     return Array.from(care);
//   }

//   function extractMaterialSpecifications(text) {
//     const lower = text.toLowerCase();
//     const specs = new Set();
    
//     // Look for material-related specifications
//     const materialSpecKeywords = [
//       'thread count', 'gsm', 'weight', 'thickness', 'denier',
//       'breathable', 'water resistant', 'waterproof', 'windproof',
//       'moisture wicking', 'quick dry', 'anti-microbial',
//       'uv protection', 'upf', 'thermal', 'insulated',
//       'stretch', 'stretchable', 'flexible', 'elastic',
//       'durable', 'tear resistant', 'abrasion resistant',
//       'biodegradable', 'compostable', 'recyclable',
//       'hypoallergenic', 'non-toxic', 'chemical-free'
//     ];
    
//     for (let spec of materialSpecKeywords) {
//       if (lower.includes(spec)) {
//         // Get context around the keyword
//         const regex = new RegExp(`([^.;!?]{0,50}${spec}[^.;!?]{0,50})`, 'gi');
//         const matches = text.match(regex);
//         if (matches) {
//           matches.forEach(m => {
//             const cleaned = clean(m);
//             if (cleaned.length < 100) specs.add(cleaned);
//           });
//         }
//       }
//     }
    
//     return Array.from(specs);
//   }

//   function filterMaterialDescription(fullDesc) {
//     // Filter description to only include material-related sentences
//     const sentences = fullDesc.split(/[.;!?]+/).map(s => s.trim());
//     const materialSentences = [];
    
//     const materialIndicators = [
//       'material', 'fabric', 'made', 'composition', 'fiber', 'textile',
//       'cotton', 'polyester', 'nylon', 'leather', 'wool', 'silk',
//       'organic', 'recycled', 'sustainable', 'eco', 'biodegradable',
//       'quality', 'durable', 'soft', 'comfortable', 'breathable',
//       'certified', 'certification', 'standard'
//     ];
    
//     for (let sentence of sentences) {
//       const lower = sentence.toLowerCase();
//       if (materialIndicators.some(indicator => lower.includes(indicator))) {
//         if (sentence.length > 10 && sentence.length < 200) {
//           materialSentences.push(sentence);
//         }
//       }
//     }
    
//     return materialSentences;
//   }

//   // ===========================
//   // SITE-SPECIFIC EXTRACTORS
//   // ===========================

//   const extractors = [
//     // ---------- AMAZON ----------
//     {
//       match: host => host.includes('amazon.'),
//       get: () => {
//         const title = clean(document.querySelector('#productTitle')?.innerText || '');
        
//         const allText = [];
        
//         // Collect all text from various sections
//         const selectors = [
//           '#feature-bullets ul li',
//           '#productDescription p',
//           '#aplus .aplus-module',
//           '#productDetails_techSpec_section_1 tr',
//           '#productDetails_detailBullets_sections1 tr',
//           '.detail-bullet-list li'
//         ];
        
//         selectors.forEach(selector => {
//           document.querySelectorAll(selector).forEach(el => {
//             const text = clean(el.innerText);
//             if (text) allText.push(text);
//           });
//         });
        
//         const fullText = allText.join(' ');
        
//         return {
//           title,
//           fullText,
//           materials: extractMaterialInfo(fullText),
//           certifications: extractCertifications(fullText),
//           care: extractCareInstructions(fullText),
//           specs: extractMaterialSpecifications(fullText),
//           materialDesc: filterMaterialDescription(fullText)
//         };
//       }
//     },

//     // ---------- FLIPKART ----------
//     {
//       match: host => host.includes('flipkart.'),
//       get: () => {
//         const titleSelectors = ['span.B_NuCI', 'h1.yhB1nd', 'h1._35KyD6', 'h1'];
//         let title = '';
//         for (let sel of titleSelectors) {
//           const el = document.querySelector(sel);
//           if (el && el.innerText.trim()) {
//             title = clean(el.innerText);
//             break;
//           }
//         }
        
//         const allText = [];
        
//         const selectors = [
//           'div._1mXcCf', 'div._2d4LTz', 'div._3WHvuP',
//           'table._14cfVK tr', 'table._3ENrHu tr',
//           'li._2-N8zT', 'ul._1xgFaf li'
//         ];
        
//         selectors.forEach(selector => {
//           document.querySelectorAll(selector).forEach(el => {
//             const text = clean(el.innerText);
//             if (text) allText.push(text);
//           });
//         });
        
//         // Check JSON-LD
//         document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
//           try {
//             const json = JSON.parse(script.textContent);
//             if (json.description) allText.push(json.description);
//             if (json.material) allText.push(`Material: ${json.material}`);
//           } catch (e) {}
//         });
        
//         const fullText = allText.join(' ');
        
//         return {
//           title,
//           fullText,
//           materials: extractMaterialInfo(fullText),
//           certifications: extractCertifications(fullText),
//           care: extractCareInstructions(fullText),
//           specs: extractMaterialSpecifications(fullText),
//           materialDesc: filterMaterialDescription(fullText)
//         };
//       }
//     },

//     // ---------- MYNTRA ----------
//     {
//       match: host => host.includes('myntra.'),
//       get: () => {
//         const titleSelectors = ['h1.pdp-title', 'h1.pdp-name', 'h1'];
//         let title = '';
//         for (let sel of titleSelectors) {
//           const el = document.querySelector(sel);
//           if (el) {
//             title = clean(el.innerText);
//             break;
//           }
//         }
        
//         const allText = [];
        
//         const selectors = [
//           '.pdp-description-container',
//           '.pdp-product-description-content',
//           '.index-tableContainer td',
//           '.pdp-specs-table td'
//         ];
        
//         selectors.forEach(selector => {
//           document.querySelectorAll(selector).forEach(el => {
//             const text = clean(el.innerText);
//             if (text) allText.push(text);
//           });
//         });
        
//         const fullText = allText.join(' ');
        
//         return {
//           title,
//           fullText,
//           materials: extractMaterialInfo(fullText),
//           certifications: extractCertifications(fullText),
//           care: extractCareInstructions(fullText),
//           specs: extractMaterialSpecifications(fullText),
//           materialDesc: filterMaterialDescription(fullText)
//         };
//       }
//     }
//   ];

//   function genericExtractor() {
//     const title = clean(
//       document.querySelector('h1')?.innerText || 
//       document.querySelector('[itemprop="name"]')?.innerText ||
//       document.title
//     );
    
//     const allText = document.body.innerText;
    
//     return {
//       title,
//       fullText: allText.substring(0, 5000),
//       materials: extractMaterialInfo(allText),
//       certifications: extractCertifications(allText),
//       care: extractCareInstructions(allText),
//       specs: extractMaterialSpecifications(allText),
//       materialDesc: filterMaterialDescription(allText)
//     };
//   }

//   // ---------- API CALL ----------
//   async function runPrediction(product, popup) {
//     console.log("🔍 Extracted Material Data:", product);

//     if (!product.title || product.title.length < 3) {
//       popup.querySelector('#eco-body').innerHTML = 
//         "⚠️ Could not extract product information.<br>Try scrolling or refreshing the page.";
//       return;
//     }

//     // Build material-focused text for the model
//     const materialText = [
//       `Title: ${product.title}`,
//       product.materials.length ? `Materials: ${product.materials.join('; ')}` : '',
//       product.certifications.length ? `Certifications: ${product.certifications.join('; ')}` : '',
//       product.care.length ? `Care Instructions: ${product.care.join('; ')}` : '',
//       product.specs.length ? `Material Specifications: ${product.specs.join('; ')}` : '',
//       product.materialDesc.length ? `Material Description: ${product.materialDesc.join('. ')}` : ''
//     ].filter(s => s.split(':')[1]?.trim()).join(' | ');

//     console.log("📦 Sending to API:", materialText.substring(0, 200) + "...");

//     try {
//       const response = await fetch(API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text: materialText })
//       });

//       if (!response.ok) throw new Error(`API returned ${response.status}`);

//       const data = await response.json();
      
//       const keywordsHTML = data.important_keywords?.length
//         ? `<div style="margin:8px 0;padding:6px;background:rgba(0,0,0,0.15);border-radius:6px;"><b>🔑 Key Terms:</b><br><small>${data.important_keywords.slice(0, 6).map(k => `${k.word} (${k.score.toFixed(2)})`).join(', ')}</small></div>`
//         : '';
      
//       const probsHTML = data.class_probabilities
//         ? `<small style="opacity:0.8;">Not Eco: ${data.class_probabilities.not_eco}% | Moderate: ${data.class_probabilities.moderate}% | Eco: ${data.class_probabilities.eco}%</small><br>`
//         : '';
      
//       popup.querySelector('#eco-body').innerHTML = `
//         <div style="margin-bottom:10px;padding:10px;background:rgba(255,255,255,0.12);border-radius:8px;">
//           <b>🏷️ Classification:</b> <span style="font-size:16px;font-weight:bold;color:#a0f0a0;">${data.label}</span><br>
//           <b>📊 Confidence:</b> ${data.confidence}%<br>
//           ${probsHTML}
//         </div>
//         ${keywordsHTML}
//         ${product.materials.length ? `<div style="margin:8px 0;padding:6px;background:rgba(0,0,0,0.15);border-radius:6px;"><b>🧵 Materials Found:</b><br><small>${product.materials.slice(0, 8).join(', ')}</small></div>` : ''}
//         ${product.certifications.length ? `<div style="margin:8px 0;padding:6px;background:rgba(0,128,0,0.15);border-radius:6px;"><b>✅ Certifications:</b><br><small>${product.certifications.join(', ')}</small></div>` : ''}
//         ${product.care.length ? `<div style="margin:8px 0;padding:6px;background:rgba(0,0,0,0.15);border-radius:6px;"><b>🧺 Care Instructions:</b><br><small>${product.care.slice(0, 3).join('; ')}</small></div>` : ''}
//         ${product.specs.length ? `<div style="margin:8px 0;padding:6px;background:rgba(0,0,0,0.15);border-radius:6px;"><b>📋 Specifications:</b><br><small>${product.specs.slice(0, 3).join('; ')}</small></div>` : ''}
//         ${data.reasons?.length ? `<div style="margin-top:10px;padding:8px;background:rgba(0,0,0,0.25);border-radius:6px;border-left:3px solid rgba(255,255,255,0.3);"><small><b>💡 Analysis:</b><br>${data.reasons.join('; ')}</small></div>` : ''}
//         <small style="color:#ddd;margin-top:10px;display:block;opacity:0.6;font-size:11px;">${product.title.slice(0, 70)}...</small>
//       `;
      
//       console.log("✅ Analysis complete:", data);
//     } catch (err) {
//       console.error("❌ API error:", err);
//       popup.querySelector('#eco-body').innerHTML = `
//         <div style="color:#ffcccc;padding:10px;background:rgba(255,0,0,0.1);border-radius:8px;">
//           ❌ <b>Error:</b> ${err.message}<br>
//           <small>Please check if the API server is running at:<br>${API_URL}</small>
//         </div>
//       `;
//     }
//   }

//   // ---------- RETRY MECHANISM ----------
//   function waitForProductAndRun(attempt = 0) {
//     const popup = createPopup();
//     const extractor = extractors.find(e => e.match(window.location.hostname)) || 
//                      { get: genericExtractor };
//     const product = extractor.get();

//     if ((!product.title || product.title.length < 3) && attempt < 12) {
//       console.log(`⏳ Waiting for content (${attempt + 1}/12)...`);
//       popup.querySelector('#eco-body').innerText = `⏳ Loading product data... (${attempt + 1}/12)`;
//       setTimeout(() => waitForProductAndRun(attempt + 1), 1500);
//       return;
//     }

//     if (!product.title || product.title.length < 3) {
//       popup.querySelector('#eco-body').innerHTML = 
//         "⚠️ Could not find product information.<br><small>This page might not be a product page.</small>";
//       return;
//     }

//     runPrediction(product, popup);
//   }

//   // ---------- OBSERVER ----------
//   const observer = new MutationObserver((mutations, obs) => {
//     const hasContent = document.querySelector('h1') || 
//                       document.querySelector('span.B_NuCI') || 
//                       document.querySelector('#productTitle') ||
//                       document.querySelector('.pdp-title');
    
//     if (hasContent) {
//       obs.disconnect();
//       setTimeout(() => waitForProductAndRun(), 1000);
//     }
//   });
  
//   observer.observe(document, { childList: true, subtree: true });

//   // Safety trigger
//   setTimeout(() => waitForProductAndRun(), 3000);
// })();

(async function() {
  const API_URL = "https://luteotropic-aglimmer-rachelle.ngrok-free.dev/predict"; 

  function createPopup() {
    let existing = document.getElementById('eco-popup-widget');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'eco-popup-widget';
    popup.style.cssText = `
      position: fixed; right: 20px; bottom: 20px; z-index: 999999;
      width: 360px; max-height: 550px; overflow-y: auto;
      backdrop-filter: blur(10px);
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 16px; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
      padding: 16px; color: #fff; font-family: 'Poppins', sans-serif;
      font-size: 13px; line-height: 1.5;
      background-image: linear-gradient(135deg, rgba(63,94,251,0.3), rgba(252,70,107,0.3));
      transition: all 0.3s ease; animation: popupFadeIn 0.6s ease;
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
        
        // Extract title
        const titleSelectors = [
          'span.VU-ZEz',  // Updated selector
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
        
        // Extract from Product Details table
        const detailSelectors = [
          'table.table-bordered tbody tr',  // Product Details table
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
        
        // Extract from all table cells specifically
        document.querySelectorAll('table td, table th').forEach(cell => {
          const text = clean(cell.innerText);
          if (text && text.length > 2) {
            allText.push(text);
          }
        });
        
        // Look for specific keywords in the page
        const pageText = document.body.innerText;
        const keywordPattern = /(fabric|material|composition|care|wash)[:\s]+([^\n]{10,100})/gi;
        const matches = pageText.matchAll(keywordPattern);
        for (let match of matches) {
          allText.push(`${match[1]}: ${match[2]}`);
        }
        
        // Check JSON-LD
        document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
          try {
            const json = JSON.parse(script.textContent);
            if (json.description) allText.push(json.description);
            if (json.material) allText.push(`Material: ${json.material}`);
          } catch (e) {}
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
        console.log("🟣 MYNTRA Extractor Running");
        
        // Extract title
        const titleSelectors = [
          'h1.pdp-title', 
          'h1.pdp-name',
          'h1[class*="title"]',
          'h1[class*="name"]',
          'h1'
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
        
        // MYNTRA-specific selectors (updated for current structure)
        const detailSelectors = [
          '.pdp-productDescriptorsContainer',  // Main product info container
          '.pdp-product-description-content',
          '.pdp-description-container',
          'div[class*="description"]',
          'div[class*="detail"]',
          'div[class*="specs"]',
          'div[class*="material"]',
          'div[class*="specifications"]',
          '.index-tableContainer',
          '.index-tableContainer tr',
          '.index-tableContainer td',
          'table[class*="table"] tr',
          'table[class*="table"] td',
          '.pdp-specs-table td',
          'div[class*="productDetails"]',
          '[class*="sizeAndFit"]',
          '[class*="material"]',
          '[class*="fabricCare"]'
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
        
        // Extract all table data
        document.querySelectorAll('table td, table th, tr').forEach(cell => {
          const text = clean(cell.innerText);
          if (text && text.length > 2) {
            allText.push(text);
          }
        });
        
        // Look for Material & Care section specifically
        const materialCareHeadings = document.querySelectorAll('h4, h5, .index-title, [class*="title"]');
        materialCareHeadings.forEach(heading => {
          const headingText = clean(heading.innerText).toLowerCase();
          if (headingText.includes('material') || headingText.includes('care') || 
              headingText.includes('fabric') || headingText.includes('specifications')) {
            let current = heading.nextElementSibling;
            let depth = 0;
            while (current && depth < 5) {
              const text = clean(current.innerText);
              if (text && text.length > 2) {
                allText.push(text);
                console.log(`🎯 Extracted near "${headingText}": ${text.substring(0, 80)}`);
              }
              current = current.nextElementSibling;
              depth++;
            }
          }
        });
        
        // Extract from divs that might contain product details
        document.querySelectorAll('div').forEach(div => {
          const text = div.innerText;
          if (text && text.length > 20 && text.length < 500) {
            const lower = text.toLowerCase();
            if (lower.includes('material') || lower.includes('fabric') || 
                lower.includes('care') || lower.includes('wash') ||
                lower.includes('pu') || lower.includes('leather') ||
                lower.includes('cotton') || lower.includes('polyester')) {
              allText.push(clean(text));
            }
          }
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
    }
  ];

  function genericExtractor() {
    console.log("⚪ Generic Extractor Running");
    
    const title = clean(
      document.querySelector('h1')?.innerText || 
      document.querySelector('[itemprop="name"]')?.innerText ||
      document.title
    );
    
    const allText = document.body.innerText;
    
    return {
      title,
      fullText: allText.substring(0, 5000),
      materials: extractMaterialInfo(allText),
      certifications: extractCertifications(allText),
      care: extractCareInstructions(allText),
      specs: extractMaterialSpecifications(allText),
      materialDesc: filterMaterialDescription(allText)
    };
  }

  // ---------- API CALL ----------
  async function runPrediction(product, popup) {
    console.log("🔍 Extracted Material Data:", product);

    if (!product.title || product.title.length < 3) {
      popup.querySelector('#eco-body').innerHTML = 
        "⚠️ Could not extract product information.<br>Try scrolling or refreshing the page.";
      return;
    }

    // Build material-focused text for the model
    const materialText = [
      `Title: ${product.title}`,
      product.materials.length ? `Materials: ${product.materials.join('; ')}` : '',
      product.certifications.length ? `Certifications: ${product.certifications.join('; ')}` : '',
      product.care.length ? `Care Instructions: ${product.care.join('; ')}` : '',
      product.specs.length ? `Material Specifications: ${product.specs.join('; ')}` : '',
      product.materialDesc.length ? `Material Description: ${product.materialDesc.join('. ')}` : ''
    ].filter(s => s.split(':')[1]?.trim()).join(' | ');

    console.log("📦 Sending to API:", materialText.substring(0, 300) + "...");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: materialText })
      });

      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();
      
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
        ${product.materials.length ? `<div style="margin:8px 0;padding:6px;background:rgba(0,0,0,0.15);border-radius:6px;"><b>🧵 Materials Found:</b><br><small>${product.materials.slice(0, 8).join(', ')}</small></div>` : ''}
        ${product.certifications.length ? `<div style="margin:8px 0;padding:6px;background:rgba(0,128,0,0.15);border-radius:6px;"><b>✅ Certifications:</b><br><small>${product.certifications.join(', ')}</small></div>` : ''}
        ${product.care.length ? `<div style="margin:8px 0;padding:6px;background:rgba(0,0,0,0.15);border-radius:6px;"><b>🧺 Care Instructions:</b><br><small>${product.care.slice(0, 3).join('; ')}</small></div>` : ''}
        ${product.specs.length ? `<div style="margin:8px 0;padding:6px;background:rgba(0,0,0,0.15);border-radius:6px;"><b>📋 Specifications:</b><br><small>${product.specs.slice(0, 3).join('; ')}</small></div>` : ''}
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