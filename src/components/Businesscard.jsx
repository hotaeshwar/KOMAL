import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const BusinessCard = () => {
  const publicImagePath = '/media/Komal.jpeg';

  const [formData, setFormData] = useState({
    name: 'KOMAL DHAWAN',
    title: '',
    phone: '8929550001',
    mapLink: '',
    photo: publicImagePath,
    facebook: '',
    instagram: '',
    whatsapp: '',
    socialMedia: {
      linkedin: '',
      twitter: '',
      instagram: '',
      facebook: '',
      youtube: '',
      whatsapp: ''
    }
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempFormData, setTempFormData] = useState({});
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const qrCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const fallbackImage = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80';

  // Influencer color scheme: rose, coral, fuchsia, purple
  const colors = {
    primary: '#E91E8C',
    primaryLight: '#FF6EC7',
    primaryDark: '#C2185B',
    accent: '#9C27B0',
    accentLight: '#CE93D8',
    coral: '#FF6B6B',
    background: '#ffffff',
    text: '#1a1a2e',
    textMuted: '#7b6f8a',
    cardBackground: '#ffffff',
    border: '#f3e5f5',
  };

  const PhoneIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  );

  const MapIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );

  const FacebookIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );

  const InstagramIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );

  const WhatsAppIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  );

  const ShareIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  );

  const EditIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );

  const SaveIcon = ({ size = 20, color = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  );

  // FIX: getImageSource now properly handles base64 strings saved from Firestore
  const getImageSource = (imageData) => {
    if (!imageData) return publicImagePath;
    if (typeof imageData === 'string') {
      // base64 data URL (uploaded by user and saved to Firestore)
      if (imageData.startsWith('data:')) return imageData;
      // external URL
      if (imageData.startsWith('http')) return imageData;
      // local public path
      if (imageData.startsWith('/')) return imageData;
    }
    return publicImagePath;
  };

  const sanitizePhone = (phone) => {
    if (!phone) return '';
    const unicodeMap = {
      '𝟬': '0', '𝟭': '1', '𝟮': '2', '𝟯': '3', '𝟰': '4',
      '𝟱': '5', '𝟲': '6', '𝟳': '7', '𝟴': '8', '𝟵': '9',
      '０': '0', '１': '1', '２': '2', '３': '3', '４': '4',
      '５': '5', '６': '6', '７': '7', '８': '8', '９': '9'
    };
    let cleaned = phone;
    Object.keys(unicodeMap).forEach(fancy => { cleaned = cleaned.split(fancy).join(unicodeMap[fancy]); });
    cleaned = cleaned.replace(/[^\d+\-]/g, '');
    return cleaned;
  };

  const generateVCardData = () => {
    const cleanPhone = sanitizePhone(formData.phone);
    const cleanWhatsApp = sanitizePhone(formData.whatsapp);
    const cleanName = formData.name ? formData.name.trim() : '';
    const nameParts = cleanName.split(' ');
    const lastName = nameParts[nameParts.length - 1] || '';
    const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0] || '';
    return (
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      `FN:${cleanName}\n` +
      `N:${lastName};${firstName};;;\n` +
      (formData.title ? `TITLE:${formData.title}\n` : '') +
      (cleanPhone ? `TEL;TYPE=CELL:${cleanPhone}\n` : '') +
      (formData.mapLink ? `URL:${formData.mapLink}\n` : '') +
      (formData.facebook ? `URL;TYPE=Facebook:${formData.facebook}\n` : '') +
      (formData.instagram ? `URL;TYPE=Instagram:${formData.instagram}\n` : '') +
      (cleanWhatsApp ? `TEL;TYPE=WhatsApp:${cleanWhatsApp}\n` : '') +
      'END:VCARD'
    );
  };

  const generateQRCode = () => {
    if (!qrCanvasRef.current || !window.QRious) return;
    try {
      new window.QRious({
        element: qrCanvasRef.current,
        value: generateVCardData(),
        size: 300,
        background: 'white',
        foreground: colors.primary,
        level: 'M'
      });
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
    script.onload = () => generateQRCode();
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  useEffect(() => { if (window.QRious) generateQRCode(); }, [formData, colors.primary]);

  // FIX: On load, restore photo from Firestore — including base64 if it was saved
  useEffect(() => {
    const loadData = async () => {
      try {
        const docRef = doc(db, 'businessCards', 'komalDhawan');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Restore saved photo (base64 or default path)
          const savedPhoto = data.photo && data.photo.startsWith('data:')
            ? data.photo
            : publicImagePath;
          setFormData({ ...data, photo: savedPhoto });
          showNotification('Data loaded successfully!', 'success');
        } else {
          const initialData = { ...formData, photo: 'default' };
          await setDoc(docRef, initialData);
          showNotification('Initial data saved!', 'success');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data', 'error');
      }
    };
    loadData();
  }, []);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openEditModal = () => { setTempFormData({ ...formData }); setIsEditModalOpen(true); };
  const closeEditModal = () => { setIsEditModalOpen(false); setTempFormData({}); };

  // FIX: Save actual photo data (base64 string) to Firestore instead of placeholder string
  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      // Determine what photo string to persist
      // If it's a base64 data URL, save it directly to Firestore
      // If it's a local path or default, save that path string
      const photoToSave = tempFormData.photo && tempFormData.photo.startsWith('data:')
        ? tempFormData.photo   // actual base64 — persists across refreshes
        : (tempFormData.photo || 'default');

      const dataToSave = { ...tempFormData, photo: photoToSave };
      const docRef = doc(db, 'businessCards', 'komalDhawan');
      await setDoc(docRef, dataToSave);

      // Update local state with the saved data, resolving photo display correctly
      const displayPhoto = photoToSave.startsWith('data:') ? photoToSave : publicImagePath;
      setFormData({ ...tempFormData, photo: displayPhoto });

      closeEditModal();
      showNotification('Profile updated and saved to cloud!', 'success');
    } catch (error) {
      console.error('Save error:', error);
      showNotification('Error saving data to cloud', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setTempFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      // FIX: Store full base64 data URL in tempFormData so it gets saved to Firestore
      reader.onload = (e) => setTempFormData(prev => ({ ...prev, photo: e.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleImageError = (e) => { e.target.src = fallbackImage; setImageError(true); };

  const getImageBase64 = async (imageSource) => {
    try {
      if (typeof imageSource === 'string' && imageSource.startsWith('data:')) return imageSource;
      if (typeof imageSource === 'string' && imageSource.startsWith('/')) {
        const fullUrl = window.location.origin + imageSource;
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error('Failed to fetch image');
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      if (typeof imageSource === 'string' && imageSource.startsWith('http')) {
        const response = await fetch(imageSource);
        if (!response.ok) throw new Error('Failed to fetch image');
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
      return fallbackImage;
    } catch (error) {
      return fallbackImage;
    }
  };

  const createInteractiveCard = async () => {
    if (loading) return;
    setLoading(true);
    try {
      showNotification('Creating interactive business card...', 'success');
      const currentPhoto = getImageSource(formData.photo);
      const photoBase64 = await getImageBase64(currentPhoto);
      const vCardData = generateVCardData();

      const cardHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formData.name} - Business Card</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .business-card {
      background: #fff;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(233, 30, 140, 0.3), 0 0 100px rgba(156, 39, 176, 0.15);
      overflow: hidden;
      width: 100%;
      max-width: 400px;
      animation: floatUp 0.8s ease-out;
    }
    @keyframes floatUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .header {
      background: linear-gradient(135deg, #E91E8C 0%, #9C27B0 60%, #FF6B6B 100%);
      padding: 40px 20px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
      animation: shimmer 4s ease-in-out infinite;
    }
    @keyframes shimmer {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(180deg); }
    }
    .photo-wrapper {
      position: relative;
      display: inline-block;
      margin-bottom: 16px;
    }
    .photo {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      border: 4px solid rgba(255,255,255,0.9);
      object-fit: cover;
      display: block;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    .photo-ring {
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.4);
      animation: pulse-ring 2s ease-in-out infinite;
    }
    @keyframes pulse-ring {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.05); opacity: 0.8; }
    }
    .name {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 6px;
      letter-spacing: 1px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .title { color: rgba(255,255,255,0.9); font-size: 15px; font-weight: 500; }
    .content { padding: 24px 20px; background: #fff; }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 13px 14px;
      border-radius: 14px;
      margin-bottom: 10px;
      background: #fdf4fb;
      border: 1px solid #f3e5f5;
      transition: all 0.3s ease;
      text-decoration: none;
    }
    .contact-item:hover {
      background: linear-gradient(135deg, #fce4ec, #f3e5f5);
      transform: translateX(4px);
      box-shadow: 0 4px 16px rgba(233,30,140,0.15);
    }
    .icon {
      background: linear-gradient(135deg, #E91E8C, #9C27B0);
      padding: 10px;
      border-radius: 12px;
      min-width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .contact-label { font-size: 11px; color: #9C27B0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
    .contact-value { color: #1a1a2e; font-size: 14px; font-weight: 600; }
    .qr-section {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 28px 20px;
      text-align: center;
    }
    .qr-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: #FF6EC7; margin-bottom: 20px; }
    .qr-container {
      background: white;
      padding: 16px;
      border-radius: 16px;
      display: inline-block;
      margin-bottom: 20px;
      box-shadow: 0 0 30px rgba(233,30,140,0.3);
    }
    .action-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
    .btn {
      background: linear-gradient(135deg, #E91E8C, #9C27B0);
      color: #fff;
      border: none;
      padding: 13px 16px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: 'Poppins', sans-serif;
    }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(233,30,140,0.4); }
    .footer {
      text-align: center;
      padding: 16px;
      background: linear-gradient(135deg, #E91E8C, #9C27B0, #FF6B6B);
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      font-size: 16px;
      color: #fff;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <div class="business-card">
    <div class="header">
      <div class="photo-wrapper">
        <div class="photo-ring"></div>
        <img src="${photoBase64}" alt="${formData.name}" class="photo" onerror="this.src='${fallbackImage}'">
      </div>
      <div class="name">${formData.name}</div>
      ${formData.title ? `<div class="title">${formData.title}</div>` : ''}
    </div>
    <div class="content">
      ${formData.phone ? `<a href="tel:${formData.phone}" class="contact-item"><div class="icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div><div><div class="contact-label">Phone</div><div class="contact-value">${formData.phone}</div></div></a>` : ''}
      ${formData.mapLink ? `<a href="${formData.mapLink}" target="_blank" class="contact-item"><div class="icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div><div><div class="contact-label">Location</div><div class="contact-value">View on Google Maps</div></div></a>` : ''}
      ${formData.facebook ? `<a href="${formData.facebook}" target="_blank" class="contact-item"><div class="icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></div><div><div class="contact-label">Facebook</div><div class="contact-value">Visit Facebook</div></div></a>` : ''}
      ${formData.instagram ? `<a href="${formData.instagram}" target="_blank" class="contact-item"><div class="icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></div><div><div class="contact-label">Instagram</div><div class="contact-value">Visit Instagram</div></div></a>` : ''}
      ${formData.whatsapp ? `<a href="https://wa.me/${formData.whatsapp}" target="_blank" class="contact-item"><div class="icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></div><div><div class="contact-label">WhatsApp</div><div class="contact-value">Chat on WhatsApp</div></div></a>` : ''}
    </div>
    <div class="qr-section">
      <div class="qr-title">✨ Scan to Save Contact</div>
      <div class="qr-container"><canvas id="qr-code" width="200" height="200" style="display:block;margin:0 auto;"></canvas></div>
      <div class="action-buttons" id="action-btns">
        <button id="save-contact-btn" class="btn">💾 Save Contact</button>
        ${formData.phone ? `<a href="tel:${formData.phone}" class="btn">📞 Call Now</a>` : ''}
        ${formData.mapLink ? `<a href="${formData.mapLink}" target="_blank" class="btn">📍 Location</a>` : ''}
      </div>
    </div>
    <div class="footer">✨ KAMYABI TALKS BY KD ✨</div>
  </div>
  <script>
    window.addEventListener('DOMContentLoaded', function() {
      if (window.QRious) {
        new QRious({ element: document.getElementById('qr-code'), value: \`${vCardData}\`, size: 200, background: 'white', foreground: '${colors.primary}', level: 'M' });
      }

      document.getElementById('save-contact-btn').addEventListener('click', function() {
        const vcf = \`${vCardData}\`;
        // Use text/x-vcard MIME type — this is what iOS/Android recognise as a contact file
        const blob = new Blob([vcf], { type: 'text/x-vcard' });
        const url = URL.createObjectURL(blob);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        if (isIOS) {
          // iOS Safari: navigate to the blob URL — triggers native "Add to Contacts" sheet
          window.location.href = url;
        } else {
          // Android / Desktop: open in new tab — Android opens Contacts app, desktop downloads
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        }
      });
    });
  </script>
</body>
</html>`;

      if (navigator.share) {
        try {
          const blob = new Blob([cardHTML], { type: 'text/html' });
          const file = new File([blob], `${formData.name.replace(/\s+/g, '-')}-card.html`, { type: 'text/html' });
          await navigator.share({ title: `${formData.name} - Business Card`, files: [file] });
          showNotification('Business card shared successfully!', 'success');
          return;
        } catch (shareError) {
          console.log('Native share failed, opening card directly');
        }
      }
      const blob = new Blob([cardHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      showNotification('Interactive business card opened!', 'success');
    } catch (err) {
      showNotification('Error creating business card', 'error');
    } finally {
      setLoading(false);
    }
  };

  const gradientStyle = {
    background: 'linear-gradient(135deg, #E91E8C 0%, #9C27B0 60%, #FF6B6B 100%)'
  };

  const contactItemStyle = {
    background: 'linear-gradient(135deg, #fce4ec, #f3e5f5)',
    border: '1px solid #f8bbd0'
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>

      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 sm:px-6 sm:py-3 rounded-lg text-white font-medium transition-all duration-300 text-sm sm:text-base ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' : 'bg-pink-600'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3 sm:p-4 md:p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="rounded-t-2xl px-4 sm:px-6 py-4" style={gradientStyle}>
              <h2 className="text-lg sm:text-xl font-bold text-white">Edit Profile</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={getImageSource(tempFormData.photo)}
                    alt="Profile"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto border-4 object-cover"
                    style={{ borderColor: colors.primary }}
                    onError={handleImageError}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 text-white p-1.5 sm:p-2 rounded-full shadow-lg transition-colors"
                    style={{ background: colors.primary }}
                  >
                    <EditIcon size={14} />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-2">Click camera icon to change photo</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Name', field: 'name', placeholder: '' },
                  { label: 'Title', field: 'title', placeholder: 'e.g., Content Creator' },
                  { label: 'Phone', field: 'phone', placeholder: 'Enter phone number' },
                  { label: 'Map Link', field: 'mapLink', placeholder: 'Google Maps link' },
                  { label: 'Facebook URL', field: 'facebook', placeholder: 'https://facebook.com/yourprofile' },
                  { label: 'Instagram URL', field: 'instagram', placeholder: 'https://instagram.com/yourprofile' },
                  { label: 'WhatsApp Number', field: 'whatsapp', placeholder: 'Enter WhatsApp number' },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input
                      type="text"
                      value={tempFormData[field] || ''}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                      style={{ focusRingColor: colors.primary }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 sm:gap-3 pt-4">
                <button onClick={closeEditModal} className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  style={gradientStyle}
                >
                  <SaveIcon size={14} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
          style={{ boxShadow: '0 20px 60px rgba(233,30,140,0.25), 0 0 80px rgba(156,39,176,0.1)' }}>

          {/* Header */}
          <div className="px-4 sm:px-5 py-6 sm:py-8 text-center relative overflow-hidden bg-white">
            <div className="absolute top-0 left-0 right-0 h-1" style={gradientStyle} />
            <div className="relative mb-3 inline-block">
              <img
                src={getImageSource(formData.photo)}
                alt="Komal Dhawan"
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-full mx-auto object-cover"
                style={{
                  border: '4px solid',
                  borderColor: colors.primary,
                  boxShadow: `0 4px 20px rgba(233,30,140,0.25), 0 0 0 6px rgba(233,30,140,0.08)`
                }}
                onError={handleImageError}
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-black mb-1 tracking-widest"
              style={{ fontFamily: "'Playfair Display', serif", background: 'linear-gradient(135deg, #E91E8C, #9C27B0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {formData.name}
            </h1>
            {formData.title && (
              <p className="text-sm sm:text-base font-medium" style={{ color: colors.textMuted }}>{formData.title}</p>
            )}
          </div>

          {/* Contacts */}
          <div className="px-3 sm:px-4 py-3 sm:py-4 bg-white space-y-2">
            {formData.phone && (
              <a href={`tel:${formData.phone}`} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl no-underline transition-all duration-200 hover:shadow-md" style={contactItemStyle}>
                <div className="p-2 rounded-lg flex items-center justify-center flex-shrink-0" style={gradientStyle}>
                  <PhoneIcon size={16} color="#fff" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: colors.accent }}>Phone</div>
                  <div className="text-sm font-semibold truncate" style={{ color: colors.primary }}>{formData.phone}</div>
                </div>
              </a>
            )}
            {formData.mapLink && (
              <a href={formData.mapLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl no-underline transition-all duration-200 hover:shadow-md" style={contactItemStyle}>
                <div className="p-2 rounded-lg flex items-center justify-center flex-shrink-0" style={gradientStyle}>
                  <MapIcon size={16} color="#fff" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: colors.accent }}>Location</div>
                  <div className="text-sm font-semibold truncate" style={{ color: colors.primary }}>View on Map</div>
                </div>
              </a>
            )}
            {formData.facebook && (
              <a href={formData.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl no-underline transition-all duration-200 hover:shadow-md" style={contactItemStyle}>
                <div className="p-2 rounded-lg flex items-center justify-center flex-shrink-0" style={gradientStyle}>
                  <FacebookIcon size={16} color="#fff" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: colors.accent }}>Facebook</div>
                  <div className="text-sm font-semibold truncate" style={{ color: colors.primary }}>Visit Profile</div>
                </div>
              </a>
            )}
            {formData.instagram && (
              <a href={formData.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl no-underline transition-all duration-200 hover:shadow-md" style={contactItemStyle}>
                <div className="p-2 rounded-lg flex items-center justify-center flex-shrink-0" style={gradientStyle}>
                  <InstagramIcon size={16} color="#fff" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: colors.accent }}>Instagram</div>
                  <div className="text-sm font-semibold truncate" style={{ color: colors.primary }}>Visit Profile</div>
                </div>
              </a>
            )}
            {formData.whatsapp && (
              <a href={`https://wa.me/${formData.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl no-underline transition-all duration-200 hover:shadow-md" style={contactItemStyle}>
                <div className="p-2 rounded-lg flex items-center justify-center flex-shrink-0" style={gradientStyle}>
                  <WhatsAppIcon size={16} color="#fff" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: colors.accent }}>WhatsApp</div>
                  <div className="text-sm font-semibold truncate" style={{ color: colors.primary }}>Chat on WhatsApp</div>
                </div>
              </a>
            )}
            {!formData.phone && !formData.mapLink && !formData.facebook &&
             !formData.instagram && !formData.whatsapp && (
              <div className="text-center py-4 text-gray-400">
                <p className="text-sm">Click Edit to add your contact information</p>
              </div>
            )}
          </div>

          {/* QR Code Section */}
          <div className="px-3 sm:px-4 py-4 sm:py-5 text-center border-t border-pink-100"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
            <h3 className="text-base font-bold mb-3" style={{ color: '#FF6EC7', fontFamily: "'Playfair Display', serif" }}>
              ✨ Scan to Save Contact
            </h3>
            <div className="bg-white p-3 rounded-xl inline-block mb-3 w-full max-w-[160px] sm:max-w-[200px]"
              style={{ boxShadow: '0 0 20px rgba(233,30,140,0.3)' }}>
              <canvas ref={qrCanvasRef} className="w-28 h-28 sm:w-40 sm:h-40 mx-auto block" style={{ display: 'block' }} />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button onClick={openEditModal} className="text-white border-none px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-md"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,110,199,0.4)' }}>
                <EditIcon size={13} color="#FF6EC7" />
                <span style={{ color: '#FF6EC7' }}>Edit</span>
              </button>
              <button onClick={createInteractiveCard} disabled={loading}
                className="text-white border-none px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-md disabled:opacity-70"
                style={gradientStyle}>
                <ShareIcon size={13} color="#ffffff" />
                {loading ? 'Creating...' : 'Share'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 text-center" style={gradientStyle}>
            <div className="text-white font-black text-sm sm:text-base tracking-widest"
              style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
              ✨ KAMYABI TALKS BY KD ✨
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
